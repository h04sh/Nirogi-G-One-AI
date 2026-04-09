import { Router, type IRouter } from "express";
import { getDb, chatLogsTable, isDatabaseConfigured } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { randomUUID } from "crypto";
import {
  SendChatMessageBody,
  GetChatHistoryQueryParams,
} from "@workspace/api-zod";
import { generateGeminiChatReply } from "../lib/gemini";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const greetingPatterns = [
  /^(hi|hello|hey|hii|helo|howdy|sup|yo|greetings|good morning|good evening|good afternoon|namaste|namaskar|hola|bonjour|salut)\b/i,
];

const casualPatterns = [
  /^(how are you|how r u|how are u|aap kaise hain|kaisa hai|kya haal hai|what'?s up|whats up|how'?s it going)\b/i,
];

const thanksPatterns = [
  /^(thanks|thank you|thank u|shukriya|dhanyawad|ty|thx)\b/i,
];

const farewellPatterns = [
  /^(bye|goodbye|good bye|alvida|see you|see ya|take care|cya)\b/i,
];

function isGreeting(text: string): boolean {
  return greetingPatterns.some((p) => p.test(text.trim()));
}
function isCasual(text: string): boolean {
  return casualPatterns.some((p) => p.test(text.trim()));
}
function isThanks(text: string): boolean {
  return thanksPatterns.some((p) => p.test(text.trim()));
}
function isFarewell(text: string): boolean {
  return farewellPatterns.some((p) => p.test(text.trim()));
}

function getConversationalReply(message: string, language: string): string | null {
  const isHindi = language === "hi";
  const lower = message.trim().toLowerCase();

  if (isGreeting(lower)) {
    if (isHindi) {
      return "नमस्ते! 👋 मैं निरोगी जी-वन AI हूँ — आपका AI स्वास्थ्य सहायक। आज मैं आपकी कैसे मदद कर सकता हूँ?";
    }
    return "Hi there! 👋 I'm Nirogi G-One AI, your health companion. How can I help you today?";
  }

  if (isCasual(lower)) {
    if (isHindi) {
      return "मैं बिल्कुल ठीक हूँ, धन्यवाद! 😊 आप कैसे हैं? अगर कोई स्वास्थ्य संबंधी सवाल है तो बताइए — मैं यहाँ हूँ।";
    }
    return "I'm doing great, thanks for asking! 😊 How are you feeling? If you have any health questions or symptoms you'd like to discuss, I'm here to help.";
  }

  if (isThanks(lower)) {
    if (isHindi) {
      return "कोई बात नहीं! 😊 अगर कोई और सवाल हो तो बेझिझक पूछें। आपका स्वास्थ्य हमारी प्राथमिकता है।";
    }
    return "You're welcome! 😊 Feel free to ask anytime. Your health is our priority — I'm always here if you need guidance.";
  }

  if (isFarewell(lower)) {
    if (isHindi) {
      return "अलविदा! 👋 अपना ख्याल रखें और स्वस्थ रहें। जब भी जरूरत हो, वापस आएं।";
    }
    return "Take care! 👋 Stay healthy and don't hesitate to come back whenever you need any health guidance. Goodbye!";
  }

  return null;
}

const symptomKeywords: Record<string, { conditions: string[]; triage: "routine" | "urgent" | "emergency"; confidence: number }> = {
  "chest pain": { conditions: ["Angina", "Myocardial Infarction", "Costochondritis"], triage: "emergency", confidence: 0.89 },
  "shortness of breath": { conditions: ["Asthma", "Pulmonary Embolism", "Heart Failure"], triage: "urgent", confidence: 0.82 },
  "headache": { conditions: ["Tension Headache", "Migraine", "Hypertension"], triage: "routine", confidence: 0.78 },
  "fever": { conditions: ["Viral Infection", "Bacterial Infection", "Flu"], triage: "routine", confidence: 0.85 },
  "cough": { conditions: ["Upper Respiratory Infection", "Bronchitis", "Asthma"], triage: "routine", confidence: 0.80 },
  "stomach pain": { conditions: ["Gastritis", "Appendicitis", "IBS"], triage: "urgent", confidence: 0.76 },
  "dizziness": { conditions: ["Vertigo", "Anemia", "Dehydration"], triage: "routine", confidence: 0.72 },
  "rash": { conditions: ["Contact Dermatitis", "Allergic Reaction", "Eczema"], triage: "routine", confidence: 0.81 },
  "joint pain": { conditions: ["Arthritis", "Gout", "Lupus"], triage: "routine", confidence: 0.77 },
  "nausea": { conditions: ["Gastroenteritis", "Food Poisoning", "Migraine"], triage: "routine", confidence: 0.79 },
  "vomiting": { conditions: ["Gastroenteritis", "Food Poisoning", "Appendicitis"], triage: "urgent", confidence: 0.80 },
  "back pain": { conditions: ["Muscle Strain", "Herniated Disc", "Kidney Stone"], triage: "routine", confidence: 0.75 },
  "fatigue": { conditions: ["Anemia", "Thyroid Disorder", "Chronic Fatigue Syndrome"], triage: "routine", confidence: 0.72 },
  "sore throat": { conditions: ["Strep Throat", "Viral Pharyngitis", "Tonsillitis"], triage: "routine", confidence: 0.80 },
};

function analyzeSymptoms(message: string): {
  conditions: string[];
  triage: "routine" | "urgent" | "emergency";
  confidence: number;
  diagnosis: string;
} {
  const lower = message.trim().toLowerCase();
  let bestMatch: {
    conditions: string[];
    triage: "routine" | "urgent" | "emergency";
    confidence: number;
  } = {
    conditions: ["General Health Concern"],
    triage: "routine",
    confidence: 0.65,
  };

  for (const [keyword, data] of Object.entries(symptomKeywords)) {
    if (lower.includes(keyword)) {
      if (
        data.triage === "emergency" ||
        (data.triage === "urgent" && bestMatch.triage !== "emergency") ||
        (data.triage === "routine" && bestMatch.triage === "routine" && data.confidence > bestMatch.confidence)
      ) {
        bestMatch = data;
      }
    }
  }

  return {
    ...bestMatch,
    diagnosis: bestMatch.conditions[0],
  };
}

function generateMedicalReply(message: string, analysis: ReturnType<typeof analyzeSymptoms>, language: string = "en"): string {
  const isHindi = language === "hi";
  const { triage, conditions, confidence } = analysis;

  const triageMessages = {
    emergency: isHindi
      ? "यह एक आपात स्थिति लगती है। कृपया तुरंत आपातकालीन सेवाओं से संपर्क करें या निकटतम ER में जाएं।"
      : "This appears to be an emergency situation. Please contact emergency services immediately or go to the nearest ER.",
    urgent: isHindi
      ? "आपके लक्षण चिंताजनक हैं। आज ही किसी डॉक्टर से मिलने की सिफारिश की जाती है।"
      : "Your symptoms are concerning. I recommend seeing a doctor today or visiting an urgent care center.",
    routine: isHindi
      ? "आपके लक्षण नियमित जांच की आवश्यकता बताते हैं। अपने प्राथमिक देखभाल चिकित्सक से मिलें।"
      : "Your symptoms suggest a routine evaluation is needed. Please schedule an appointment with your primary care physician.",
  };

  const conditionsList = conditions.slice(0, 2).join(" or ");

  if (isHindi) {
    return `आपके द्वारा वर्णित लक्षणों के आधार पर, संभावित स्थितियां **${conditionsList}** हो सकती हैं (विश्वास: ${Math.round(confidence * 100)}%)। ${triageMessages[triage]}\n\nकृपया ध्यान दें: यह AI सहायता है, पेशेवर चिकित्सा सलाह नहीं।`;
  }

  return `Based on the symptoms you've described, possible conditions include **${conditionsList}** (confidence: ${Math.round(confidence * 100)}%). ${triageMessages[triage]}\n\nPlease note: This is AI assistance, not professional medical advice. Always consult a qualified healthcare provider.`;
}

router.post("/chat", async (req, res): Promise<void> => {
  const parsed = SendChatMessageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { message, session_id, language = "en" } = parsed.data;
  const sessionId = session_id || randomUUID();

  await new Promise((resolve) => setTimeout(resolve, 200));

  const conversationalReply = getConversationalReply(message, language);
  const geminiReply = await generateGeminiChatReply(message, language);

  let reply: string;
  let analysis: ReturnType<typeof analyzeSymptoms> | null = null;

  if (geminiReply) {
    reply = geminiReply;
    analysis = conversationalReply ? null : analyzeSymptoms(message);
  } else if (conversationalReply) {
    reply = conversationalReply;
  } else {
    analysis = analyzeSymptoms(message);
    reply = generateMedicalReply(message, analysis, language);
  }

  if (isDatabaseConfigured()) {
    try {
      const db = getDb();
      await db.insert(chatLogsTable).values({
        sessionId,
        role: "user",
        content: message,
        triageLevel: null,
      });
      await db.insert(chatLogsTable).values({
        sessionId,
        role: "assistant",
        content: reply,
        triageLevel: analysis?.triage ?? null,
      });
    } catch (err) {
      logger.warn({ err }, "chat_log_persist_failed");
    }
  }

  res.json({
    reply,
    triage_level: analysis?.triage ?? null,
    confidence: analysis?.confidence ?? null,
    diagnosis: analysis?.diagnosis ?? null,
    reasoning: analysis
      ? `Symptom pattern analysis identified ${analysis.conditions.join(", ")} as likely conditions.`
      : "Conversational response — no medical analysis required.",
    next_steps: analysis
      ? analysis.triage === "emergency"
        ? "Call 911 or go to emergency room immediately"
        : analysis.triage === "urgent"
        ? "Visit urgent care or call your doctor today"
        : "Schedule appointment with primary care physician"
      : null,
    session_id: sessionId,
  });
});

router.get("/chat/history", async (req, res): Promise<void> => {
  if (!isDatabaseConfigured()) {
    res.json([]);
    return;
  }

  const params = GetChatHistoryQueryParams.safeParse(req.query);

  try {
    const db = getDb();
    let logs;
    if (params.success && params.data.session_id) {
      logs = await db
        .select()
        .from(chatLogsTable)
        .where(eq(chatLogsTable.sessionId, params.data.session_id))
        .orderBy(chatLogsTable.createdAt)
        .limit(50);
    } else {
      logs = await db
        .select()
        .from(chatLogsTable)
        .orderBy(desc(chatLogsTable.createdAt))
        .limit(20);
    }

    res.json(
      logs.map((log) => ({
        id: String(log.id),
        role: log.role,
        content: log.content,
        timestamp: log.createdAt.toISOString(),
        triage_level: log.triageLevel,
      }))
    );
  } catch (err) {
    logger.warn({ err }, "chat_history_failed");
    res.json([]);
  }
});

export default router;
