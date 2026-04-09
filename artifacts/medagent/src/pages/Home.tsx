import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { Stethoscope, MessageSquareText, FileText, Mic } from "lucide-react";

export default function Home() {
  const { t } = useI18n();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 300, damping: 24 },
    },
  };

  return (
    <div className="container mx-auto px-4 py-20 lg:py-32">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="max-w-3xl mx-auto text-center mb-24"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-widest mb-6">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          Active & Ready
        </div>
        <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-foreground mb-6 leading-tight">
          {t("hero.title")}
        </h1>
        <p className="text-lg lg:text-xl text-muted-foreground mb-10 leading-relaxed max-w-2xl mx-auto">
          {t("hero.subtitle")}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/diagnosis" className="w-full sm:w-auto">
            <Button size="lg" data-testid="button-start-diagnosis" className="w-full rounded-full h-14 px-8 text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
              {t("hero.start")}
            </Button>
          </Link>
          <Link href="/reports" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" data-testid="button-upload-case" className="w-full rounded-full h-14 px-8 text-base bg-transparent border-border hover:bg-secondary hover:text-secondary-foreground transition-all">
              {t("hero.upload")}
            </Button>
          </Link>
        </div>
      </motion.div>

      <motion.div 
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto"
      >
        <motion.div variants={item} className="bg-card p-8 rounded-[2rem] shadow-sm border border-border/50 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6">
            <Stethoscope className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-foreground">{t("features.ai.title")}</h3>
          <p className="text-muted-foreground text-sm">{t("features.ai.desc")}</p>
        </motion.div>

        <motion.div variants={item} className="bg-card p-8 rounded-[2rem] shadow-sm border border-border/50 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6">
            <MessageSquareText className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-foreground">{t("features.chat.title")}</h3>
          <p className="text-muted-foreground text-sm">{t("features.chat.desc")}</p>
        </motion.div>

        <motion.div variants={item} className="bg-card p-8 rounded-[2rem] shadow-sm border border-border/50 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-foreground">{t("features.reports.title")}</h3>
          <p className="text-muted-foreground text-sm">{t("features.reports.desc")}</p>
        </motion.div>

        <motion.div variants={item} className="bg-card p-8 rounded-[2rem] shadow-sm border border-border/50 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6">
            <Mic className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-foreground">{t("features.voice.title")}</h3>
          <p className="text-muted-foreground text-sm">{t("features.voice.desc")}</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
