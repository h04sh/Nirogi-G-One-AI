import { Link } from "wouter";
import { Mail, Phone, MapPin, Twitter, Github, Linkedin, Shield } from "lucide-react";
import { Navbar } from "./Navbar";
import { Chatbot } from "./Chatbot";

const FOOTER_COLS = [
  {
    title: "Product",
    links: [
      { label: "AI Diagnosis", href: "/diagnosis" },
      { label: "Dashboard", href: "/dashboard" },
      { label: "Patient Reports", href: "/reports" },
      { label: "About Nirogi G-One AI", href: "/about" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Login", href: "/login" },
      { label: "Register", href: "/register" },
      { label: "My Profile", href: "/profile" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "#privacy" },
      { label: "Terms of Service", href: "#terms" },
      { label: "Medical Disclaimer", href: "#disclaimer" },
      { label: "Cookie Policy", href: "#cookies" },
    ],
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background font-sans">
      <Navbar />
      <main className="flex-1">{children}</main>

      {/* ── FOOTER ── */}
      <footer className="mt-auto" style={{ background: "hsl(158 38% 18%)" }}>

        {/* Top section — brand + links */}
        <div className="container mx-auto px-6 pt-14 pb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">

            {/* Brand */}
            <div className="lg:col-span-2 space-y-5">
              <Link href="/" className="flex items-center gap-3 font-bold text-xl text-white w-fit group">
                <img
                  src={`${import.meta.env.BASE_URL}logo-nirogi.png`}
                  alt=""
                  className="h-11 w-auto max-w-[120px] shrink-0 object-contain opacity-95"
                />
                <span className="tracking-tight whitespace-nowrap group-hover:text-white/95 transition-colors">
                  Nirogi G-One AI
                </span>
              </Link>

              <p className="text-sm leading-relaxed max-w-xs" style={{ color: "hsl(138 30% 78%)" }}>
                Your calm, AI-powered healthcare companion. Precise insights and reassuring guidance — available 24 hours a day, 7 days a week.
              </p>

              {/* Socials */}
              <div className="flex items-center gap-2.5">
                {[Twitter, Github, Linkedin].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200"
                    style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.22)";
                      (e.currentTarget as HTMLElement).style.color = "#ffffff";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.1)";
                      (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.7)";
                    }}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>

              {/* Contact */}
              <div className="space-y-2.5">
                {[
                  { Icon: Mail, text: "support@nirogigone.ai" },
                  { Icon: Phone, text: "+91 9890123486" },
                  { Icon: MapPin, text: "Gujarat, India" },
                ].map(({ Icon, text }) => (
                  <div key={text} className="flex items-center gap-2.5 text-xs" style={{ color: "hsl(138 25% 70%)" }}>
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "hsl(138 40% 68%)" }} />
                    {text}
                  </div>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {FOOTER_COLS.map((col) => (
              <div key={col.title}>
                <h4 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "hsl(138 40% 65%)" }}>
                  {col.title}
                </h4>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      {link.href.startsWith("/") ? (
                        <Link
                          href={link.href}
                          className="text-sm transition-colors duration-150"
                          style={{ color: "hsl(138 20% 75%)" }}
                          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#ffffff")}
                          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "hsl(138 20% 75%)")}
                        >
                          {link.label}
                        </Link>
                      ) : (
                        <a
                          href={link.href}
                          className="text-sm transition-colors duration-150"
                          style={{ color: "hsl(138 20% 75%)" }}
                          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#ffffff")}
                          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "hsl(138 20% 75%)")}
                        >
                          {link.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-start gap-2.5" style={{ color: "hsl(138 20% 62%)" }}>
              <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "hsl(138 35% 65%)" }} />
              <p className="text-xs leading-relaxed">
                <span className="font-semibold text-white">Medical Disclaimer: </span>
                Nirogi G-One AI provides AI-assisted health information for general guidance only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider for all medical decisions.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="container mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs" style={{ color: "hsl(138 18% 58%)" }}>
              © {new Date().getFullYear()} Nirogi G-One AI. All rights reserved.
            </p>
            <div className="flex items-center gap-5 text-xs" style={{ color: "hsl(138 18% 58%)" }}>
              {["Privacy", "Terms", "Cookies"].map((label) => (
                <a
                  key={label}
                  href={`#${label.toLowerCase()}`}
                  className="transition-colors duration-150"
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#ffffff")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "hsl(138 18% 58%)")}
                >
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      <Chatbot />
    </div>
  );
}
