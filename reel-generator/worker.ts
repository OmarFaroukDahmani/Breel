import { Worker } from 'bullmq';
import IORedis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const connection = new IORedis(REDIS_URL, { maxRetriesPerRequest: null });

function log(level: 'INFO' | 'SUCCESS' | 'ERROR' | 'WARN', message: string, data?: any) {
  const timestamp = new Date().toISOString();
  const emoji = { INFO: '📋', SUCCESS: '✅', ERROR: '❌', WARN: '⚠️' }[level];
  console.log(`${emoji} [${timestamp}] ${message}`, data ? JSON.stringify(data, null, 2) : '');
}

const CONCURRENCY = Number(process.env.WORKER_CONCURRENCY || 1);

log('INFO', '🚀 Worker Service Starting...', {
  redisUrl: REDIS_URL,
  queueName: 'video-generation-queue',
  concurrency: CONCURRENCY
});

const worker = new Worker('video-generation-queue', async (job) => {
  const startTime = Date.now();

  log('INFO', `Job ${job.id} Started`, {
    topic: job.data.topic,
    userId: job.data.userId,
    priority: job.opts.priority,
    attempt: job.attemptsMade + 1,
    maxAttempts: job.opts.attempts
  });

  try {
    const n8nUrl = process.env.N8N_WEBHOOK_URL || "http://localhost:5678/webhook/generate-video";

    const response = await fetch(n8nUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic: job.data.topic,
        userId: job.data.userId
      }),
    });

    if (!response.ok) {
      throw new Error(`n8n webhook failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    const processingTime = Date.now() - startTime;

    log('SUCCESS', `Job ${job.id} Completed`, {
      processingTimeMs: processingTime,
      processingTimeSec: (processingTime / 1000).toFixed(2),
      userId: job.data.userId,
      videoId: result?.videoId || result?.[0]?.videoId
    });

    return Array.isArray(result) ? result[0] : result;

  } catch (error: any) {
    const processingTime = Date.now() - startTime;

    log('ERROR', `Job ${job.id} Failed`, {
      error: error.message,
      processingTimeMs: processingTime,
      userId: job.data.userId,
      attempt: job.attemptsMade + 1,
      willRetry: job.attemptsMade + 1 < (job.opts.attempts || 1)
    });

    throw error;
  }
}, {
  connection,
  concurrency: CONCURRENCY
});

worker.on('completed', (job) => {
  log('SUCCESS', `Worker processed job ${job.id} successfully`);
});

worker.on('failed', (job, err) => {
  log('ERROR', `Worker failed to process job ${job?.id}`, {
    error: err.message,
    stack: err.stack
  });
});

worker.on('error', (err) => {
  log('ERROR', 'Worker error', { error: err.message });
});

log('INFO', '✨ Worker is ready and listening for jobs...');
