import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const gemini_api_key = process.env.API_KEY;
if (!gemini_api_key) {
  throw new Error("API key missing. Please check your .env file.");
}

const genAI = new GoogleGenAI({ apiKey: gemini_api_key });

const schema = {
  type: "array",
  items: {
    type: "object",
    properties: {
      type: { type: "string" },      // e.g. "theory" or "code"
      content: { type: "string" }    // explanation or code snippet
    },
    required: ["type", "content"]
  }
};

export const generate = async (query: string): Promise<any> => {
  try {
    const instruction = ` 
                  You are an expert in each field ( fullStack , coding , psychology).
                  You must always respond in JSON format that matches the schema:
                  [
                    {
                      "type": "theory",
                      "content": "Explain the concept briefly and clearly"
                    },
                    {
                      "type": "code",
                      "content": "Code snippet in markdown format"
                    }
                  ]

                  Rules:
                  1. If the user asks for code, include both theory and code.
                  2. Always wrap the code inside triple backticks (\`\`\`js ... \`\`\`).
                  3. Do not include any greetings, extra text, or explanations outside JSON.
                  4. The response MUST be valid JSON that can be parsed directly.
                  5. use markdown format for both theory and code content.
                  6. Add heading and subheading into theory content using markdown format.
                  7. Don't give code part unneccasarily if user didn't ask for it.

              `;

    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{
          role: "user",
          parts: [{ text: query }]
        }],
      config: {
        systemInstruction: instruction,
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.7,
        maxOutputTokens: 800,
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    // Safely parse JSON response
    let parsed;
    try {
      parsed = JSON.parse(response.text || "[]");
    } catch(error) {
      console.log(error);
      parsed = response.text;
    }

    console.log("Gemini API Structured Output:", parsed);
    return parsed;
  } catch (error) {
    console.log("Gemini API Error:", error);
    return [
      {
        type: "theory",
        content: "Sorry, I couldn’t process your request at the moment."
      }
    ];
  }
};
