import { GoogleGenerativeAI } from '@google/generative-ai';

export const handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const { resources, tasks } = JSON.parse(event.body);

    if (!resources || !tasks || resources.length === 0 || tasks.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Resources and tasks are required and must not be empty.' }),
      };
    }

    const apiKey = process.env.GEMINI_API_KEY || "YOUR_GEMINI_API_KEY";

    // If API key is missing or placeholder, use fallback
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "YOUR_GEMINI_API_KEY") {
      console.log("Missing Gemini API Key, using fallback logic.");
      return {
        statusCode: 200,
        body: JSON.stringify(getFallbackAllocations(resources, tasks)),
      };
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
You are an AI Resource Allocation Engine.
Given a list of tasks and a list of resources, map each task to exactly one resource.
Rules:
- High priority tasks should ideally get the best matching resources.
- Avoid assigning too many tasks to a single resource if possible (balance the load).
- Output the result strictly in valid JSON format.
- Output MUST be a JSON array of objects with the following schema:
[
  {
    "taskName": "string",
    "assignedResource": "string (resource name)",
    "priority": "string (High, Medium, Low)",
    "efficiencyScore": "number between 0 and 100 representing how well the resource matches the task"
  }
]

Resources:
${JSON.stringify(resources, null, 2)}

Tasks:
${JSON.stringify(tasks, null, 2)}
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    let jsonOutput = responseText;
    const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      jsonOutput = jsonMatch[1];
    } else {
        const fallbackMatch = responseText.match(/\[[\s\S]*\]/);
        if (fallbackMatch) jsonOutput = fallbackMatch[0];
    }

    const allocations = JSON.parse(jsonOutput);
    return {
      statusCode: 200,
      body: JSON.stringify({ allocations, method: 'AI' }),
    };

  } catch (error) {
    console.error('Error:', error);
    const { resources, tasks } = JSON.parse(event.body);
    return {
      statusCode: 200,
      body: JSON.stringify(getFallbackAllocations(resources, tasks)),
    };
  }
};

function getFallbackAllocations(resources, tasks) {
    const priorityWeight = { 'High': 3, 'Medium': 2, 'Low': 1 };
    const sortedTasks = [...tasks].sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority]);
    
    const resourceUsage = {};
    resources.forEach(r => resourceUsage[r.name] = 0);

    const allocations = sortedTasks.map(task => {
        let bestResource = resources[0];
        let minUsage = Infinity;
        
        for (const r of resources) {
            if (resourceUsage[r.name] < minUsage) {
                minUsage = resourceUsage[r.name];
                bestResource = r;
            }
        }
        
        if (bestResource) {
            resourceUsage[bestResource.name]++;
        }

        let score = 85;
        if (task.priority === 'High') score = 92;
        if (task.priority === 'Low') score = 78;
        
        score = score + Math.floor(Math.random() * 5) - 2;

        return {
            taskName: task.taskName,
            assignedResource: bestResource ? bestResource.name : 'Unassigned',
            priority: task.priority,
            efficiencyScore: Math.min(100, Math.max(0, score))
        };
    });

    return { allocations, method: 'Fallback' };
}
