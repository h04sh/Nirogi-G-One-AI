import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Upload, Activity, AlertTriangle, CheckCircle, Loader2, X, Save } from "lucide-react";
import { useAnalyzeText, useAnalyzeImage, useAnalyzeVoice, useSaveCase } from "@workspace/api-client-react";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";

type TriageLevel = "routine" | "urgent" | "emergency";

type WebSpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: { results: ArrayLike<{ 0: { transcript: string } }> }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

interface DiagnosisResult {
  triage_level: TriageLevel;
  conditions: string[];
  confidence: number;
  explanation: string;
  next_steps?: string;
  reasoning?: string;
}

const triageConfig = {
  routine: {
    label: "Routine",
    labelHi: "नियमित",
    color: "text-green-700",
    bg: "bg-green-50",
    border: "border-green-200",
    icon: CheckCircle,
    iconColor: "text-green-600",
  },
  urgent: {
    label: "Urgent",
    labelHi: "अत्यावश्यक",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: AlertTriangle,
    iconColor: "text-amber-600",
  },
  emergency: {
    label: "Emergency",
    labelHi: "आपात",
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
    icon: AlertTriangle,
    iconColor: "text-red-600",
  },
};

export default function Diagnosis() {
  const { t, language } = useI18n();
  const { toast } = useToast();
  const [symptoms, setSymptoms] = useState("");
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<WebSpeechRecognitionInstance | null>(null);

  const analyzeText = useAnalyzeText();
  const analyzeImage = useAnalyzeImage();
  const analyzeVoice = useAnalyzeVoice();
  const saveCase = useSaveCase();

  const isLoading = analyzeText.isPending || analyzeImage.isPending || analyzeVoice.isPending;

  const handleAnalyze = async () => {
    setResult(null);

    try {
      let res;

      if (imageFile) {
        const reader = new FileReader();
        const base64: string = await new Promise((resolve) => {
          reader.onload = () => resolve((reader.result as string).split(",")[1]);
          reader.readAsDataURL(imageFile);
        });
        res = await analyzeImage.mutateAsync({
          data: { image_base64: base64, image_type: imageFile.type, additional_info: symptoms || undefined },
        });
      } else if (transcript) {
        res = await analyzeVoice.mutateAsync({ data: { transcript, language: language as "en" | "hi" } });
      } else if (symptoms) {
        res = await analyzeText.mutateAsync({ data: { symptoms, language: language as "en" | "hi" } });
      } else {
        toast({ title: "Please enter symptoms or upload an image", variant: "destructive" });
        return;
      }

      setResult(res as DiagnosisResult);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not reach the API. Is the backend running on port 3001?";
      toast({ title: "Analysis failed", description: msg, variant: "destructive" });
    }
  };

  const handleSaveCase = async () => {
    if (!result) return;
    try {
      await saveCase.mutateAsync({
        data: {
          patient_name: "Anonymous Patient",
          symptoms: symptoms || transcript,
          diagnosis: result.conditions[0] || "Assessment Complete",
          triage_level: result.triage_level,
          confidence: result.confidence,
          notes: result.explanation,
        },
      });
      toast({ title: "Case saved to reports successfully" });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Save failed. Check database (PostgreSQL) and run db:push.";
      toast({ title: "Could not save case", description: msg, variant: "destructive" });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleVoice = useCallback(() => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const w = window as unknown as {
      SpeechRecognition?: new () => WebSpeechRecognitionInstance;
      webkitSpeechRecognition?: new () => WebSpeechRecognitionInstance;
    };
    const SpeechRecognition = w.SpeechRecognition || w.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast({ title: "Voice input not supported in this browser", variant: "destructive" });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language === "hi" ? "hi-IN" : "en-US";
    recognitionRef.current = recognition;

    recognition.onresult = (event) => {
      let finalTranscript = "";
      for (let i = 0; i < event.results.length; i++) {
        finalTranscript += event.results[i][0].transcript;
      }
      setTranscript(finalTranscript);
    };

    recognition.onend = () => setIsRecording(false);
    recognition.start();
    setIsRecording(true);
  }, [isRecording, language, toast]);

  return (
    <div className="min-h-screen bg-background py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">{t("diag.title")}</h1>
          <p className="mt-2 text-muted-foreground">Describe your symptoms or upload a medical image for AI analysis.</p>
        </motion.div>

        <div className="space-y-5">
          {/* Text Input */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-2xl p-6 shadow-sm"
          >
            <label className="block text-sm font-semibold text-foreground mb-3">{t("diag.text.label")}</label>
            <textarea
              data-testid="input-symptoms"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder={t("diag.text.placeholder")}
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none text-sm transition-colors"
            />
          </motion.div>

          {/* Image Upload */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-card border border-border rounded-2xl p-6 shadow-sm"
          >
            <label className="block text-sm font-semibold text-foreground mb-3">{t("diag.image.label")}</label>
            <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageUpload} className="hidden" />
            {imagePreview ? (
              <div className="relative w-full">
                <img src={imagePreview} alt="Uploaded" className="w-full max-h-48 object-contain rounded-xl border border-border" />
                <button
                  onClick={() => { setImageFile(null); setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-card border border-border flex items-center justify-center hover:bg-secondary transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </div>
            ) : (
              <button
                data-testid="button-upload-image"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-border rounded-xl py-8 flex flex-col items-center gap-2 text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all"
              >
                <Upload className="w-8 h-8" />
                <span className="text-sm font-medium">Click to upload medical image</span>
                <span className="text-xs">PNG, JPG, WEBP up to 10MB</span>
              </button>
            )}
          </motion.div>

          {/* Voice Input */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card border border-border rounded-2xl p-6 shadow-sm"
          >
            <label className="block text-sm font-semibold text-foreground mb-3">{t("diag.voice.label")}</label>
            <div className="flex items-center gap-4">
              <button
                data-testid="button-voice"
                onClick={handleVoice}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                  isRecording
                    ? "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                    : "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20"
                }`}
              >
                {isRecording ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <MicOff className="w-4 h-4" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4" />
                    Start Voice Input
                  </>
                )}
              </button>
              {transcript && (
                <p className="text-sm text-foreground bg-secondary/50 rounded-lg px-3 py-2 flex-1 line-clamp-2">{transcript}</p>
              )}
            </div>
          </motion.div>

          {/* Analyze Button */}
          <motion.button
            data-testid="button-analyze"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            onClick={handleAnalyze}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-all hover:shadow-md active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing symptoms...
              </>
            ) : (
              <>
                <Activity className="w-5 h-5" />
                {t("diag.analyze")}
              </>
            )}
          </motion.button>

          {/* Results */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                {/* Triage Badge */}
                {(() => {
                  const config = triageConfig[result.triage_level];
                  const Icon = config.icon;
                  return (
                    <div className={`flex items-center gap-3 rounded-2xl border p-5 ${config.bg} ${config.border}`}>
                      <Icon className={`w-7 h-7 ${config.iconColor}`} />
                      <div>
                        <div className={`text-sm font-medium ${config.color}`}>Triage Level</div>
                        <div className={`text-xl font-bold ${config.color}`}>
                          {language === "hi" ? config.labelHi : config.label}
                        </div>
                      </div>
                      <div className="ml-auto text-right">
                        <div className="text-sm text-muted-foreground">Confidence</div>
                        <div className={`text-xl font-bold ${config.color}`}>{Math.round(result.confidence * 100)}%</div>
                      </div>
                    </div>
                  );
                })()}

                {/* Conditions */}
                <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                  <h3 className="font-semibold text-foreground mb-3">Possible Conditions</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.conditions.map((c, i) => (
                      <span key={i} className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Explanation */}
                <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                  <h3 className="font-semibold text-foreground mb-2">Explanation</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{result.explanation}</p>
                  {result.next_steps && (
                    <>
                      <h3 className="font-semibold text-foreground mt-4 mb-2">Recommended Next Steps</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{result.next_steps}</p>
                    </>
                  )}
                </div>

                {/* Save Case */}
                <button
                  data-testid="button-save-case"
                  onClick={handleSaveCase}
                  disabled={saveCase.isPending}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-primary/30 text-primary font-medium hover:bg-primary/5 transition-colors"
                >
                  {saveCase.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save to Reports
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
