"use server";

import { getServerSession } from "next-auth";

const N8N_API_URL = process.env.N8N_API_URL || "http://localhost:5678/api/v1";
const N8N_API_KEY = process.env.N8N_API_KEY;

export async function getWorkflows() {
  try {
    const response = await fetch(`${N8N_API_URL}/workflows`, {
      headers: { "X-N8N-API-KEY": N8N_API_KEY || "" },
    });
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Fetch workflows error:", error);
    return [];
  }
}

export async function createReelWorkflow(settings: { 
  name: string, 
  model: string,
  interval: number, 
  voiceName: string,
  aspectRatio: string,
  systemPrompt: string
}) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) throw new Error("Unauthenticated");

    const workflowData = {
      name: settings.name,
      active: true,
      nodes: [
        {
          parameters: {
            rule: { interval: [{ field: "minutes", minutes: settings.interval }] }
          },
          type: "n8n-nodes-base.scheduleTrigger",
          typeVersion: 1,
          position: [2480, 560],
          name: "Schedule"
        },
        {
          parameters: {
            operation: "select",
            schema: { "__rl": true, "mode": "list", "value": "public" },
            table: { "__rl": true, "value": "Projects", "mode": "list" },
            limit: 1,
            where: { values: [{ column: "status", value: "PENDING" }] },
            sort: { values: [{ column: "priority" }, { column: "createdAt" }] }
          },
          type: "n8n-nodes-base.postgres",
          typeVersion: 2,
          position: [2704, 560],
          name: "Grab & Lock Job"
        },
        {
          parameters: {
            conditions: { conditions: [{ leftValue: "={{ $json.id }}", operator: { type: "number", operation: "exists" } }] }
          },
          type: "n8n-nodes-base.if",
          typeVersion: 2,
          position: [2928, 560],
          name: "Job Found?"
        },
        {
          parameters: { model: settings.model },
          type: "@n8n/n8n-nodes-langchain.lmOllama",
          typeVersion: 1,
          position: [3072, 768],
          name: "Ollama LLM"
        },
        {
          parameters: {
            prompt: `=${settings.systemPrompt}\nTopic: {{ $json.topic }}\n\nOutput Format: Return ONLY valid JSON.`
          },
          type: "@n8n/n8n-nodes-langchain.chainLlm",
          typeVersion: 1,
          position: [3088, 560],
          name: "Generate Scenes"
        },
        {
          parameters: {
            jsCode: "const rawText = $input.first().json.text;\ntry {\n  const jsonStart = rawText.indexOf('{');\n  const jsonEnd = rawText.lastIndexOf('}') + 1;\n  const jsonString = rawText.substring(jsonStart, jsonEnd);\n  return [{ json: { output: JSON.parse(jsonString) } }];\n} catch (e) { throw new Error('Invalid JSON'); }"
          },
          type: "n8n-nodes-base.code",
          typeVersion: 2,
          position: [3360, 560],
          name: "Parse AI JSON"
        },
        {
          parameters: {
            method: "POST",
            url: "http://short-video-maker:3123/api/short-video",
            sendBody: true,
            specifyBody: "json",
            jsonBody: `={ 
              "scenes": {{ $json.output.scenes }},
              "config": {
                "videoAspectRatio": "${settings.aspectRatio}",
                "voiceName": "${settings.voiceName}"
              } 
            }`
          },
          type: "n8n-nodes-base.httpRequest",
          typeVersion: 4,
          position: [3584, 560],
          name: "Generate Video"
        },
        {
          parameters: {
            operation: "executeQuery",
            query: "UPDATE \"Projects\" SET status = 'COMPLETED', \"videoId\" = '{{ $json.videoId }}' WHERE id = {{ $node[\"Grab & Lock Job\"].json.id }};"
          },
          type: "n8n-nodes-base.postgres",
          typeVersion: 2,
          position: [3808, 560],
          name: "Mark Project Done"
        }
      ],
      connections: {
        "Schedule": { main: [[{ node: "Grab & Lock Job", type: "main", index: 0 }]] },
        "Grab & Lock Job": { main: [[{ node: "Job Found?", type: "main", index: 0 }]] },
        "Job Found?": { main: [[{ node: "Generate Scenes", type: "main", index: 0 }]] },
        "Ollama LLM": { ai_languageModel: [[{ node: "Generate Scenes", type: "ai_languageModel", index: 0 }]] },
        "Generate Scenes": { main: [[{ node: "Parse AI JSON", type: "main", index: 0 }]] },
        "Parse AI JSON": { main: [[{ node: "Generate Video", type: "main", index: 0 }]] },
        "Generate Video": { main: [[{ node: "Mark Project Done", type: "main", index: 0 }]] }
      }
    };

    const response = await fetch(`${N8N_API_URL}/workflows`, {
      method: "POST",
      headers: {
        "X-N8N-API-KEY": N8N_API_KEY || "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(workflowData),
    });

    if (!response.ok) throw new Error("n8n creation failed");
    const data = await response.json();
    return { success: true, id: data.id };
  } catch (error: any) {
    return { error: error.message };
  }
}