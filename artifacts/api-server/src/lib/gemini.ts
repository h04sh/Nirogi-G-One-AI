import { GoogleGenerativeAI } from "@google/generative-ai";
import { logger } from "./logger";

const MODEL = process.env.GEMINI_MODEL ?? "gemini-2.0-flash";

export async function generateGeminiChatReply(
  userMessage: string,
  language: string,
): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey?.trim()) {
    return null;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: MODEL,
      systemInstruction: `You are "Nirogi G-One AI", a calm, empathetic health-information assistant.
Rules:
- You are NOT a doctor. Do not diagnose definitively. Encourage professional care when appropriate.
- For emergencies (chest pain, stroke symptoms, severe bleeding, trouble breathing), tell the user to seek emergency services immediately.
- Keep answers concise and supportive.
- If the user's language is Hindi (hi), reply in Hindi. Otherwise reply in English.`,
    });

    const langHint =
      language === "hi"
        ? "The user prefers Hindi. Reply in Hindi.\n\n"
        : "Reply in English.\n\n";

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: `${langHint}${userMessage}` }] }],
    });

    const text = result.response.text();
    return text?.trim() || null;
  } catch (err) {
    logger.error({ err }, "Gemini chat generation failed");
    return null;
  }
}
