import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

export default function Login() {
  const { login, loginWithGoogle } = useAuth();
  const { t } = useI18n();
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      login(email, email.split("@")[0], undefined, "email");
      setLocation("/diagnosis");
      setLoading(false);
    }, 1000);
  };

  const handleGoogleSuccess = (credentialResponse: any) => {
    try {
      const decoded: any = jwtDecode(credentialResponse.credential);
      loginWithGoogle({
        name: decoded.name,
        email: decoded.email,
        picture: decoded.picture,
      });
      setLocation("/diagnosis");
    } catch (error) {
      console.error("Google login error:", error);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row bg-background">
      <div className="hidden md:flex flex-1 bg-secondary items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, hsl(var(--primary)) 1px, transparent 0)", backgroundSize: "32px 32px" }}></div>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="relative z-10 max-w-md text-center">
          <div className="w-20 h-20 bg-background rounded-3xl flex items-center justify-center shadow-xl mx-auto mb-8">
            <Heart className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-4xl font-bold text-foreground mb-4">Nirogi G-One AI</h2>
          <p className="text-lg text-muted-foreground">Your intelligent healthcare companion. Secure, private, and precise.</p>
        </motion.div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-xl text-foreground mb-12 md:hidden">
            <Heart className="w-6 h-6 text-primary" />
            Nirogi G-One AI
          </Link>
          
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">{t("auth.login")}</h1>
            <p className="text-muted-foreground">Enter your credentials to access your account</p>
          </div>

          {/* Google Sign-In */}
          <div className="mb-6">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => console.log("Login Failed")}
              theme="outline"
              size="large"
              width="100%"
            />
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-muted-foreground">Or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">{t("auth.email")}</Label>
              <Input 
                id="email" 
                type="email" 
                required 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className="h-12 rounded-xl bg-card border-border focus-visible:ring-primary"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">{t("auth.password")}</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                className="h-12 rounded-xl bg-card border-border focus-visible:ring-primary"
              />
            </div>

            <Button type="submit" className="w-full h-12 rounded-xl text-base" disabled={loading || !email || !password}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              {t("auth.submitLogin")}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            {t("auth.noAccount")} <Link href="/register" className="text-primary font-medium hover:underline">{t("auth.submitRegister")}</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
