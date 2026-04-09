import { createContext, useContext, useEffect, useState } from "react";

type Language = "en" | "hi";

type Translations = Record<string, Record<string, string>>;

const translations: Translations = {
  en: {
    "nav.home": "Home",
    "nav.diagnosis": "Diagnosis",
    "nav.dashboard": "Dashboard",
    "nav.reports": "Reports",
    "nav.about": "About",
    "nav.profile": "View Profile",
    "nav.settings": "Account Settings",
    "nav.language": "Language",
    "nav.logout": "Logout",
    "hero.title": "AI-Powered Healthcare Agent",
    "hero.subtitle": "A calm, trustworthy companion for your health decisions. Precise insights, reassuring guidance.",
    "hero.start": "Start Diagnosis",
    "hero.upload": "Upload Case",
    "features.ai.title": "AI Diagnosis",
    "features.ai.desc": "Advanced symptom analysis",
    "features.chat.title": "Smart Chatbot",
    "features.chat.desc": "24/7 medical advice",
    "features.reports.title": "Real-time Reports",
    "features.reports.desc": "Instant patient insights",
    "features.voice.title": "Voice Assistant",
    "features.voice.desc": "Hands-free interaction",
    "chat.placeholder": "Type your medical query...",
    "chat.title": "Nirogi G-One AI",
    "auth.login": "Login to Nirogi G-One AI",
    "auth.register": "Create an Account",
    "auth.email": "Email Address",
    "auth.password": "Password",
    "auth.name": "Full Name",
    "auth.submitLogin": "Sign In",
    "auth.submitRegister": "Sign Up",
    "auth.noAccount": "Don't have an account?",
    "auth.hasAccount": "Already have an account?",
    "diag.title": "AI Diagnosis",
    "diag.text.label": "Describe symptoms",
    "diag.text.placeholder": "E.g., I have a mild headache and a slight fever...",
    "diag.image.label": "Upload medical image",
    "diag.voice.label": "Or use voice input",
    "diag.analyze": "Analyze Symptoms",
    "dash.title": "Dashboard",
    "dash.stats.patients": "Total Patients",
    "dash.stats.active": "Active Cases",
    "dash.stats.alerts": "High Risk Alerts",
    "dash.stats.resolved": "Resolved Cases",
    "rep.title": "Patient Reports",
    "rep.download": "Download PDF",
    "about.title": "About Nirogi G-One AI",
    "prof.title": "Your Profile",
  },
  hi: {
    "nav.home": "होम",
    "nav.diagnosis": "निदान",
    "nav.dashboard": "डैशबोर्ड",
    "nav.reports": "रिपोर्ट्स",
    "nav.about": "हमारे बारे में",
    "nav.profile": "प्रोफ़ाइल देखें",
    "nav.settings": "खाता सेटिंग्स",
    "nav.language": "भाषा",
    "nav.logout": "लॉग आउट",
    "hero.title": "एआई-पावर्ड हेल्थकेयर एजेंट",
    "hero.subtitle": "आपके स्वास्थ्य निर्णयों के लिए एक शांत, भरोसेमंद साथी। सटीक अंतर्दृष्टि, आश्वस्त मार्गदर्शन।",
    "hero.start": "निदान शुरू करें",
    "hero.upload": "केस अपलोड करें",
    "features.ai.title": "एआई निदान",
    "features.ai.desc": "उन्नत लक्षण विश्लेषण",
    "features.chat.title": "स्मार्ट चैटबॉट",
    "features.chat.desc": "24/7 चिकित्सा सलाह",
    "features.reports.title": "रीयल-टाइम रिपोर्ट्स",
    "features.reports.desc": "त्वरित रोगी अंतर्दृष्टि",
    "features.voice.title": "वॉयस असिस्टेंट",
    "features.voice.desc": "हैंड्स-फ्री इंटरैक्शन",
    "chat.placeholder": "अपनी चिकित्सा क्वेरी टाइप करें...",
    "chat.title": "निरोगी जी-वन AI",
    "auth.login": "निरोगी जी-वन AI में लॉगिन करें",
    "auth.register": "खाता बनाएं",
    "auth.email": "ईमेल पता",
    "auth.password": "पासवर्ड",
    "auth.name": "पूरा नाम",
    "auth.submitLogin": "साइन इन करें",
    "auth.submitRegister": "साइन अप करें",
    "auth.noAccount": "क्या आपके पास खाता नहीं है?",
    "auth.hasAccount": "क्या आपके पास पहले से खाता है?",
    "diag.title": "एआई निदान",
    "diag.text.label": "लक्षणों का वर्णन करें",
    "diag.text.placeholder": "जैसे, मुझे हल्का सिरदर्द और हल्का बुखार है...",
    "diag.image.label": "मेडिकल इमेज अपलोड करें",
    "diag.voice.label": "या वॉयस इनपुट का उपयोग करें",
    "diag.analyze": "लक्षणों का विश्लेषण करें",
    "dash.title": "डैशबोर्ड",
    "dash.stats.patients": "कुल रोगी",
    "dash.stats.active": "सक्रिय केस",
    "dash.stats.alerts": "उच्च जोखिम अलर्ट",
    "dash.stats.resolved": "सुलझाए गए केस",
    "rep.title": "रोगी रिपोर्ट्स",
    "rep.download": "पीडीएफ डाउनलोड करें",
    "about.title": "निरोगी जी-वन AI के बारे में",
    "prof.title": "आपकी प्रोफ़ाइल",
  }
};

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const LANG_STORAGE = "nirogi-g-one-lang";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved =
      localStorage.getItem(LANG_STORAGE) ?? localStorage.getItem("medagent-lang");
    return saved === "en" || saved === "hi" ? saved : "en";
  });

  useEffect(() => {
    localStorage.setItem(LANG_STORAGE, language);
  }, [language]);

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used within I18nProvider");
  return context;
}
