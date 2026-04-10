import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

export const connection = new IORedis(REDIS_URL, { maxRetriesPerRequest: null });

export const QUEUE_NAME = 'video-generation-queue';

export const PRIORITY_MAP = {
  ULTIMATE: 1,  
  PREMIUM: 5,   
  FREE: 10      
} as const;

export const videoQueue = new Queue(QUEUE_NAME, {
  connection,
  defaultJobOptions: {
    removeOnComplete: { count: 100 }, 
    removeOnFail: { count: 50 },      
    attempts: 3,                       
    backoff: {
      type: 'exponential',
      delay: 5000                     
    }
  }
});

export async function getQueueMetrics() {
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    videoQueue.getWaitingCount(),
    videoQueue.getActiveCount(),
    videoQueue.getCompletedCount(),
    videoQueue.getFailedCount(),
    videoQueue.getDelayedCount(),
  ]);

  const waitingJobs = await videoQueue.getWaiting();
  const byPriority = waitingJobs.reduce((acc, job) => {
    const priority = job.opts.priority || 10;
    acc[priority] = (acc[priority] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  return {
    waiting,
    active,
    completed,
    failed,
    delayed,
    total: waiting + active + delayed,
    byPriority,
    timestamp: new Date().toISOString()
  };
}

export async function getRecentJobs(status: 'waiting' | 'active' | 'completed' | 'failed', limit = 20) {
  let jobs: Job[] = [];

  switch (status) {
    case 'waiting':
      jobs = await videoQueue.getWaiting(0, limit - 1);
      break;
    case 'active':
      jobs = await videoQueue.getActive(0, limit - 1);
      break;
    case 'completed':
      jobs = await videoQueue.getCompleted(0, limit - 1);
      break;
    case 'failed':
      jobs = await videoQueue.getFailed(0, limit - 1);
      break;
  }

  return jobs.map(job => ({
    id: job.id,
    name: job.name,
    data: job.data,
    priority: job.opts.priority,
    timestamp: job.timestamp,
    processedOn: job.processedOn,
    finishedOn: job.finishedOn,
    failedReason: job.failedReason,
    returnvalue: job.returnvalue,
    attemptsMade: job.attemptsMade,
  }));
}