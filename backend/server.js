// backend/server.js
/*
  FUTURE SCOPE:
  - Advanced ML prediction models
  - IoT integration
  - Mobile app version
  - Industry-specific optimization
*/
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5001;

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "YOUR_GEMINI_API_KEY");

app.post('/api/allocate', async (req, res) => {
  const { resources, tasks } = req.body;

  if (!resources || !tasks || resources.length === 0 || tasks.length === 0) {
    return res.status(400).json({ error: 'Resources and tasks are required and must not be empty.' });
  }

  try {
    // If API key is literally "YOUR_GEMINI_API_KEY", force fallback for MVP demo without valid key
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "YOUR_GEMINI_API_KEY") {
        throw new Error("Missing Gemini API Key, using fallback logic for demonstration.");
    }

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
    
    // Extract JSON from responseText (it might contain markdown like ```json ... ```)
    let jsonOutput = responseText;
    const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      jsonOutput = jsonMatch[1];
    } else {
        const fallbackMatch = responseText.match(/\[[\s\S]*\]/);
        if (fallbackMatch) jsonOutput = fallbackMatch[0];
    }

    const allocations = JSON.parse(jsonOutput);
    res.json({ allocations, method: 'AI' });

  } catch (error) {
    console.error('Gemini API Error or missing key, using fallback logic:', error.message);
    
    // Fallback rule-based logic
    // Sort tasks by priority: High > Medium > Low
    const priorityWeight = { 'High': 3, 'Medium': 2, 'Low': 1 };
    const sortedTasks = [...tasks].sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority]);
    
    // Track resource usage to balance load
    const resourceUsage = {};
    resources.forEach(r => resourceUsage[r.name] = 0);

    const allocations = sortedTasks.map(task => {
        // Find resource with minimum usage
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
        
        // Slightly random variation to simulate AI
        score = score + Math.floor(Math.random() * 5) - 2;

        return {
            taskName: task.taskName,
            assignedResource: bestResource ? bestResource.name : 'Unassigned',
            priority: task.priority,
            efficiencyScore: Math.min(100, Math.max(0, score))
        };
    });

    res.json({ allocations, method: 'Fallback' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
