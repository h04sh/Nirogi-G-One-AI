import { useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Globe, Settings, LogOut, Save, Heart } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const { user, logout } = useAuth();
  const { t, language, setLanguage } = useI18n();
  const { toast } = useToast();
  const [name, setName] = useState(user?.name || "");
  const [email] = useState(user?.email || "");

  const handleSave = () => {
    toast({ title: "Profile updated successfully" });
  };

  return (
    <div className="min-h-screen bg-background py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">{t("prof.title")}</h1>
          <p className="mt-2 text-muted-foreground">Manage your account settings and preferences.</p>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden mb-5"
        >
          <div className="p-6 border-b border-border bg-primary/5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center">
                <Heart className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">{user?.name || "Guest"}</h2>
                <p className="text-sm text-muted-foreground">{user?.email || "Not signed in"}</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  data-testid="input-profile-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  data-testid="input-profile-email"
                  type="email"
                  value={email}
                  readOnly
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-secondary/50 text-muted-foreground cursor-not-allowed text-sm"
                />
              </div>
            </div>

            <button
              data-testid="button-save-profile"
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-all hover:shadow-md"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </motion.div>

        {/* Language Preference */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-2xl shadow-sm p-6 mb-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">{t("nav.language")} Preference</h3>
          </div>
          <div className="flex gap-3">
            {(["en", "hi"] as const).map((lang) => (
              <button
                key={lang}
                data-testid={`button-lang-${lang}`}
                onClick={() => setLanguage(lang)}
                className={`px-6 py-2.5 rounded-xl font-medium text-sm transition-all ${
                  language === lang
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                }`}
              >
                {lang === "en" ? "English" : "हिन्दी"}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Account Settings */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-2xl shadow-sm p-6 mb-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">{t("nav.settings")}</h3>
          </div>
          <div className="space-y-3">
            {["Email notifications", "Report digests", "Health reminders"].map((setting) => (
              <div key={setting} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <span className="text-sm text-foreground">{setting}</span>
                <button className="relative w-10 h-5 rounded-full bg-primary/20 transition-colors">
                  <span className="absolute left-1 top-0.5 w-4 h-4 rounded-full bg-primary shadow-sm transition-transform" />
                </button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Logout */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <button
            data-testid="button-logout"
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-destructive/30 text-destructive font-medium hover:bg-destructive/5 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            {t("nav.logout")}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
