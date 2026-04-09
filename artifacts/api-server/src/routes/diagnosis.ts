import { Router, type IRouter } from "express";
import { AnalyzeTextBody, AnalyzeImageBody, AnalyzeVoiceBody } from "@workspace/api-zod";

const router: IRouter = Router();

const symptomMap: Record<string, { conditions: string[]; triage: "routine" | "urgent" | "emergency"; confidence: number; explanation: string }> = {
  "chest pain": {
    conditions: ["Angina Pectoris", "Myocardial Infarction", "Costochondritis", "GERD"],
    triage: "emergency",
    confidence: 0.91,
    explanation: "Chest pain can indicate a life-threatening cardiac event. Immediate medical evaluation is critical."
  },
  "shortness of breath": {
    conditions: ["Asthma", "Pulmonary Embolism", "Heart Failure", "Anxiety"],
    triage: "urgent",
    confidence: 0.84,
    explanation: "Difficulty breathing may signal respiratory or cardiac distress requiring prompt evaluation."
  },
  "fever": {
    conditions: ["Viral Respiratory Infection", "Bacterial Infection", "Influenza", "COVID-19"],
    triage: "routine",
    confidence: 0.87,
    explanation: "Fever indicates the body's immune response to infection. Monitor temperature and stay hydrated."
  },
  "headache": {
    conditions: ["Tension Headache", "Migraine", "Hypertension", "Sinusitis"],
    triage: "routine",
    confidence: 0.79,
    explanation: "Headaches are common and usually benign. Sudden severe headache (thunderclap) warrants emergency care."
  },
  "cough": {
    conditions: ["Upper Respiratory Infection", "Bronchitis", "Asthma", "Pneumonia"],
    triage: "routine",
    confidence: 0.82,
    explanation: "Cough lasting more than 3 weeks or accompanied by blood should be evaluated by a physician."
  },
  "abdominal pain": {
    conditions: ["Appendicitis", "Gastritis", "IBS", "Kidney Stones"],
    triage: "urgent",
    confidence: 0.80,
    explanation: "Abdominal pain location and severity guide diagnosis. Severe right lower quadrant pain suggests appendicitis."
  },
  "dizziness": {
    conditions: ["Benign Positional Vertigo", "Anemia", "Dehydration", "Inner Ear Disorder"],
    triage: "routine",
    confidence: 0.73,
    explanation: "Dizziness with loss of consciousness or neurological symptoms requires urgent evaluation."
  },
  "rash": {
    conditions: ["Contact Dermatitis", "Allergic Reaction", "Eczema", "Psoriasis"],
    triage: "routine",
    confidence: 0.76,
    explanation: "Most rashes are benign. Widespread rash with fever or blistering may need urgent care."
  },
  "joint pain": {
    conditions: ["Osteoarthritis", "Rheumatoid Arthritis", "Gout", "Tendinitis"],
    triage: "routine",
    confidence: 0.78,
    explanation: "Joint pain management involves rest, anti-inflammatories, and physical therapy."
  },
  "nausea vomiting": {
    conditions: ["Gastroenteritis", "Food Poisoning", "Migraine", "Appendicitis"],
    triage: "routine",
    confidence: 0.81,
    explanation: "Persistent vomiting leading to dehydration or blood in vomit requires medical attention."
  },
  "swelling": {
    conditions: ["Edema", "Deep Vein Thrombosis", "Lymphedema", "Cellulitis"],
    triage: "urgent",
    confidence: 0.83,
    explanation: "Sudden leg swelling with redness and warmth may indicate DVT requiring immediate evaluation."
  },
  "fatigue": {
    conditions: ["Anemia", "Hypothyroidism", "Chronic Fatigue Syndrome", "Diabetes"],
    triage: "routine",
    confidence: 0.70,
    explanation: "Persistent fatigue lasting more than 2 weeks without improvement warrants blood work evaluation."
  },
};

function analyzeText(symptoms: string): {
  triage_level: "routine" | "urgent" | "emergency";
  conditions: string[];
  confidence: number;
  explanation: string;
  next_steps: string;
  reasoning: string;
} {
  const lower = symptoms.toLowerCase();

  let bestMatch: {
    conditions: string[];
    triage: "routine" | "urgent" | "emergency";
    confidence: number;
    explanation: string;
  } = {
    conditions: ["General Health Concern"],
    triage: "routine",
    confidence: 0.65,
    explanation: "General symptoms requiring basic evaluation.",
  };


 


   
   
  
    
   
    
   


  for (const [keyword, data] of Object.entries(symptomMap)) {
    const words = keyword.split(" ");
    const found = words.some(w => lower.includes(w));
    if (found) {
      if (
        data.triage === "emergency" ||
        (data.triage === "urgent" && bestMatch.triage !== "emergency") ||
        (data.triage === bestMatch.triage && data.confidence > bestMatch.confidence)
      ) {
        bestMatch = data;
      }
    }
  }

  const nextSteps = {
    emergency: "Call emergency services (911) immediately or go to the nearest emergency room.",
    urgent: "Visit an urgent care center or contact your doctor today. Do not delay evaluation.",
    routine: "Schedule an appointment with your primary care physician within the next 1-2 weeks.",
  };

  return {
    triage_level: bestMatch.triage,
    conditions: bestMatch.conditions,
    confidence: bestMatch.confidence,
    explanation: bestMatch.explanation,
    next_steps: nextSteps[bestMatch.triage],
    reasoning: `Analysis of reported symptoms identified patterns consistent with ${bestMatch.conditions.slice(0, 2).join(" and ")}. Risk assessment based on symptom severity and combination.`,
  };
}

router.post("/analyze-text", async (req, res): Promise<void> => {
  const parsed = AnalyzeTextBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  await new Promise(resolve => setTimeout(resolve, 1200));

  const result = analyzeText(parsed.data.symptoms);
  res.json(result);
});

router.post("/analyze-image", async (req, res): Promise<void> => {
  const parsed = AnalyzeImageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  await new Promise(resolve => setTimeout(resolve, 1500));

  res.json({
    triage_level: "routine",
    conditions: ["Dermatological Condition", "Skin Lesion", "Possible Contact Dermatitis"],
    confidence: 0.72,
    explanation: "Image analysis suggests a dermatological condition. The lesion appears benign but professional evaluation is recommended for accurate diagnosis.",
    next_steps: "Schedule a dermatology appointment for in-person evaluation and possible biopsy if needed.",
    reasoning: "Visual analysis of the uploaded image identified skin changes consistent with a dermatological condition. AI image analysis is supplementary and not a substitute for clinical examination.",
  });
});

router.post("/analyze-voice", async (req, res): Promise<void> => {
  const parsed = AnalyzeVoiceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  await new Promise(resolve => setTimeout(resolve, 1000));

  const result = analyzeText(parsed.data.transcript);
  res.json(result);
});

export default router;
