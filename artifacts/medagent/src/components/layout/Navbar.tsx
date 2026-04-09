import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { User, LogOut, Settings, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "nav.home" },
  { href: "/diagnosis", label: "nav.diagnosis" },
  { href: "/dashboard", label: "nav.dashboard" },
  { href: "/reports", label: "nav.reports" },
  { href: "/about", label: "nav.about" },
];

export function Navbar() {
  const { t, language, setLanguage } = useI18n();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [location] = useLocation();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full bg-background/90 backdrop-blur-md border-b border-border/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">

        {/* LEFT — Logo */}
        <Link href="/" className="flex items-center gap-3 font-bold text-xl text-foreground group">
          <img
            src={`${import.meta.env.BASE_URL}logo-nirogi.png`}
            alt=""
            className="h-10 w-auto max-w-[120px] shrink-0 object-contain rounded-lg shadow-sm group-hover:opacity-95 transition-opacity"
          />
          <span className="group-hover:text-primary transition-colors duration-200 tracking-tight whitespace-nowrap">
            Nirogi G-One AI
          </span>
        </Link>

        {/* CENTER — Navigation links */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label }) => {
            const isActive = location === href || (href !== "/" && location.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                {t(label)}
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-primary rounded-full"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* RIGHT — Profile avatar */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className={cn(
              "flex items-center justify-center w-10 h-10 rounded-full border transition-all duration-200",
              dropdownOpen
                ? "bg-primary text-white border-primary shadow-lg shadow-primary/30"
                : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-primary hover:bg-primary/10"
            )}
          >
            <User className="w-5 h-5" />
          </button>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.18 }}
                className="absolute top-13 right-0 w-60 bg-card border border-border shadow-2xl rounded-2xl py-2 overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-border/50 mb-1">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground text-sm truncate">{user?.name || "Guest User"}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email || "Not logged in"}</p>
                    </div>
                  </div>
                </div>

                <Link
                  href="/profile"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-accent hover:text-primary transition-colors"
                  onClick={() => setDropdownOpen(false)}
                >
                  <User className="w-4 h-4 text-primary" />
                  {t("nav.profile")}
                </Link>
                <div className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-accent hover:text-primary transition-colors cursor-pointer">
                  <Settings className="w-4 h-4 text-primary" />
                  {t("nav.settings")}
                </div>
                <div
                  className="flex items-center justify-between px-4 py-2.5 text-sm text-foreground hover:bg-accent hover:text-primary transition-colors cursor-pointer"
                  onClick={() => setLanguage(language === "en" ? "hi" : "en")}
                >
                  <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-primary" />
                    {t("nav.language")}
                  </div>
                  <span className="text-xs font-bold bg-primary/15 text-primary px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {language}
                  </span>
                </div>

                <div className="border-t border-border/50 mt-1 pt-1">
                  {user ? (
                    <button
                      onClick={() => { logout(); setDropdownOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      {t("nav.logout")}
                    </button>
                  ) : (
                    <Link
                      href="/login"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-primary hover:bg-primary/10 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      Login / Register
                    </Link>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
