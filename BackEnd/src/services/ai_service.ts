import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export const analyzeSensorData = async (data: {
  temperature: number;
  gas: number;
  smoke: number;
}) => {
  try {
    const prompt = `
You are an AI for fire and gas detection system.

Analyze the following sensor data:
- Temperature: ${data.temperature}
- Gas: ${data.gas}
- Smoke: ${data.smoke}

Return ONLY one word from this list:
cooking, normal, fire, gasleak

Rules:
- High temp + smoke = fire
- High gas only = gasleak
- Medium temp = cooking
- Otherwise = normal
`;

    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });

    const text = result.text?.trim() || "normal";

    return text;
  } catch (error) {
    console.error("AI error:", error);
    return "normal";
  }
};