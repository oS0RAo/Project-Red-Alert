import { GoogleGenAI } from "@google/genai";

if (!process.env.GEMINI_API_KEY) {
  console.error("Missing GEMINI_API_KEY in .env file");
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export const analyzeSensorData = async (data: {
  temperature: number;
  humidity: number;
  gasValue: number;
}) => {
  try {
    const prompt = `
You are a Smart Home Safety AI. Evaluate the following sensor data and classify the status.

[Sensor Values]
Temperature: ${data.temperature}
Humidity: ${data.humidity}
Gas/Smoke: ${data.gasValue}

[Strict Logic Rules - Evaluate in order]
1. If Gas > 400 AND Temperature > 50, you MUST output: fire
2. If Gas > 400 AND Temperature <= 50, you MUST output: gasleak
3. If Temperature >= 40 OR Humidity >= 75 OR Gas >= 150, you MUST output: cooking
4. If none of the above are true, you MUST output: normal

Output ONLY ONE WORD from the rules above. No explanation, no punctuation.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite", 
      contents: prompt,
    });

    const text = response.text?.toLowerCase() || "";
    
    console.log(`[AI Raw Answer]: "${text}"`);

    if (text.includes("fire")) return "fire";
    if (text.includes("gasleak")) return "gasleak";
    if (text.includes("cooking")) return "cooking";
    
    return "normal";

  } catch (error) {
    console.error("AI Analysis Error:", error);
    return "normal";
  }
};