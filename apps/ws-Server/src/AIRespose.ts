import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const gemini_api_key = process.env.API_KEY;
if (!gemini_api_key) {
  throw new Error("API key missing. Please check your .env file.");
}

const genAI = new GoogleGenAI({apiKey: gemini_api_key});

export const generate = async (query: string): Promise<string> => {


  try {
    
    const response = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
            {
            role: "user",
            parts: [{ text: `You are a senior web developer with expertise in production ready code and best practices.You don't miss any edge cases and always give the optimal and modularized code. You are also a senior AI engineer with expertise in AI models and their applications. You are a professional consultant who provides detailed and structured responses. Use proper markdown formatting for code blocks. 
              Question is : ${query}` }],
            }
        ],
        config: {
        systemInstruction: "You are a senior web developer with expertise in production ready code and best practices. You are also a senior AI engineer with expertise in AI models and their applications. You are a professional consultant who provides detailed and structured responses. Make sure to be brief but without missing any important details.",
        },
    });
    console.log(response.text);
    return response.text || "No response from Gemini model.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I am unable to process your request at the moment. Please try again later.";
  }
};
