import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const gemini_api_key = process.env.API_KEY;
if (!gemini_api_key) {
  throw new Error("API key missing. Please check your .env file.");
}

const genAI = new GoogleGenAI({apiKey: gemini_api_key});

export const generate = async (query: string): Promise<string> => {
  const prompt = `Answer the following question concisely in one line, without code blocks, markdown, or extra formatting. If you don't know the answer, say "I don't know". Question: ${query}`;

  try {
    
    const response = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
            {
            role: "user",
            parts: [{ text: `Be consice and return the response in simple text unless asked to generate a code. If you are asked to generate a code respond back with stringified json having code,language,title and make sure to add all the tags and elements.  Question is : ${query}` }],
            }
        ],
        config: {
        systemInstruction: "You are a helpful assistant proficeint in human psychology and coding languages",
        },
    });
    console.log(response.text);
    return response.text || "No response from Gemini model.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I am unable to process your request at the moment. Please try again later.";
  }
};
