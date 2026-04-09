import { motion } from "framer-motion";
import { Brain, Shield, Clock, Heart, Users, TrendingUp, MessageSquare, Mic } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function About() {
  const { t } = useI18n();

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Diagnosis",
      desc: "Advanced natural language processing and pattern recognition analyze your symptoms against a comprehensive medical knowledge base for accurate, contextual assessments.",
    },
    {
      icon: MessageSquare,
      title: "Conversational Intelligence",
      desc: "Nirogi G-One AI remembers the context of your conversation, asking relevant follow-up questions and refining its understanding to provide increasingly precise guidance.",
    },
    {
      icon: Mic,
      title: "Voice-First Interaction",
      desc: "Speak naturally about your symptoms. Nirogi G-One AI's voice recognition supports multiple languages, making healthcare accessible to everyone.",
    },
    {
      icon: Shield,
      title: "Privacy & Safety",
      desc: "Your health data is handled with the utmost care. Nirogi G-One AI follows healthcare data principles and clearly communicates when professional medical care is required.",
    },
    {
      icon: Clock,
      title: "Immediate Availability",
      desc: "Health concerns don't follow business hours. Nirogi G-One AI provides thoughtful, informed guidance whenever you need it — day or night.",
    },
    {
      icon: TrendingUp,
      title: "Evidence-Based Reasoning",
      desc: "Every assessment is backed by medical literature and clinical guidelines. Nirogi G-One AI explains its reasoning so you can make informed decisions about your health.",
    },
  ];

  const benefits = [
    { icon: Users, value: "24/7", label: "Available Always" },
    { icon: Clock, value: "< 2s", label: "Response Time" },
    { icon: Shield, value: "HIPAA", label: "Privacy Focused" },
    { icon: TrendingUp, value: "85%+", label: "Avg Confidence" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="py-20 px-4 text-center border-b border-border/50">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
            <Heart className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">{t("about.title")}</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Nirogi G-One AI is an AI-powered healthcare companion designed to provide thoughtful, evidence-based health guidance. We believe everyone deserves access to clear, trustworthy medical information — regardless of time, location, or circumstance.
          </p>
        </motion.div>
      </section>

      {/* Mission */}
      <section className="py-16 px-4 bg-secondary/30">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl font-bold text-foreground mb-4">Our Purpose</h2>
            <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Healthcare navigation is complex and often stressful. Nirogi G-One AI exists to simplify that experience — acting as a calm, knowledgeable intermediary that helps you understand your symptoms, assess urgency, and determine appropriate next steps. We complement professional healthcare; we do not replace it.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {benefits.map((b) => {
              const Icon = b.icon;
              return (
                <motion.div
                  key={b.label}
                  variants={item}
                  className="bg-card border border-border rounded-2xl p-6 text-center shadow-sm"
                >
                  <Icon className="w-6 h-6 text-primary mx-auto mb-3" />
                  <div className="text-2xl font-bold text-foreground">{b.value}</div>
                  <div className="text-sm text-muted-foreground mt-1">{b.label}</div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* How AI Helps */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl font-bold text-foreground mb-4">How AI Transforms Healthcare Access</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Artificial intelligence allows Nirogi G-One AI to process complex symptom patterns, understand natural language descriptions, and provide nuanced health guidance at a scale previously impossible.
            </p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  variants={item}
                  className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-12 px-4 bg-amber-50 border-t border-amber-100">
        <div className="max-w-3xl mx-auto text-center">
          <Shield className="w-8 h-8 text-amber-600 mx-auto mb-3" />
          <h3 className="font-semibold text-amber-800 mb-2">Medical Disclaimer</h3>
          <p className="text-sm text-amber-700 leading-relaxed">
            Nirogi G-One AI provides general health information and AI-assisted symptom assessment for educational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider with any questions regarding a medical condition. In case of emergency, call your local emergency number immediately.
          </p>
        </div>
      </section>
    </div>
  );
}
