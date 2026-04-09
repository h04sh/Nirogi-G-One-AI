import { MessageSquare, X, Send, User, Bot, AlertCircle, Sparkles } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSendChatMessage } from "@workspace/api-client-react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  triageLevel?: string | null;
}

const TRIAGE_COLORS: Record<string, string> = {
  emergency: "text-red-400 bg-red-500/15",
  urgent: "text-yellow-400 bg-yellow-500/15",
  routine: "text-green-400 bg-green-500/15",
};

export function Chatbot() {
  const { t, language } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [sessionId] = useState(() => crypto.randomUUID());

  const chatMutation = useSendChatMessage();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, chatMutation.isPending]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleSend = () => {
    if (!input.trim() || chatMutation.isPending) return;
    const userMsg = input.trim();
    setInput("");

    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "user", content: userMsg }]);

    chatMutation.mutate(
      {
        data: {
          message: userMsg,
          session_id: sessionId,
          language: language as "en" | "hi",
        },
      },
      {
        onSuccess: (data) => {
          setMessages((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              role: "assistant",
              content: data.reply,
              triageLevel: data.triage_level ?? null,
            },
          ]);
        },
        onError: (err) => {
          const detail =
            err instanceof Error
              ? err.message
              : "Start the API with pnpm run dev:api (port 3001) and keep this page on the Vite dev server.";
          setMessages((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              role: "assistant",
              content: `Sorry, I couldn't reach the server (${detail}).`,
              triageLevel: null,
            },
          ]);
        },
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.94 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-2rem)] h-[520px] max-h-[65vh] bg-card border border-border shadow-2xl rounded-2xl flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3.5 bg-primary flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white leading-none">{t("chat.title")}</p>
                  <p className="text-[10px] text-white/70 mt-0.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-300 inline-block" />
                    Online · AI-Powered
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors text-white/80 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3" ref={scrollRef}>
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center px-4 space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground mb-1">Hello! 👋 I'm Nirogi G-One AI</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Say hi, ask me how I'm doing, or describe your symptoms — I'm here to help!
                    </p>
                  </div>
                  <div className="w-full space-y-2 pt-2">
                    {["Hi! How are you?", "I have a headache", "What can you help with?"].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => {
                          setInput(suggestion);
                          inputRef.current?.focus();
                        }}
                        className="w-full text-left text-xs px-3 py-2 rounded-xl bg-secondary border border-border hover:border-primary/40 hover:bg-primary/10 hover:text-primary text-muted-foreground transition-all duration-150"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg) => (
                <div key={msg.id} className={cn("flex gap-2.5", msg.role === "user" ? "flex-row-reverse" : "")}>
                  <div
                    className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                      msg.role === "user"
                        ? "bg-primary text-white"
                        : "bg-secondary border border-border text-primary"
                    )}
                  >
                    {msg.role === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>
                  <div className="max-w-[78%] space-y-1">
                    <div
                      className={cn(
                        "rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                        msg.role === "user"
                          ? "bg-primary text-white rounded-tr-sm"
                          : "bg-secondary text-foreground rounded-tl-sm border border-border/60"
                      )}
                    >
                      {msg.content}
                    </div>
                    {msg.triageLevel && (
                      <div
                        className={cn(
                          "inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full",
                          TRIAGE_COLORS[msg.triageLevel] ?? "text-muted-foreground bg-muted"
                        )}
                      >
                        <AlertCircle className="w-3 h-3" />
                        {msg.triageLevel} priority
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {chatMutation.isPending && (
                <div className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-secondary border border-border text-primary flex items-center justify-center flex-shrink-0">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="bg-secondary border border-border/60 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
                    {[0, 0.2, 0.4].map((delay, i) => (
                      <motion.div
                        key={i}
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay }}
                        className="w-1.5 h-1.5 rounded-full bg-primary/70"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border bg-card flex-shrink-0">
              <form
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex items-center gap-2"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t("chat.placeholder")}
                  className="flex-1 bg-secondary border border-border focus:border-primary focus:ring-1 focus:ring-primary/50 rounded-full px-4 py-2 text-sm outline-none transition-all text-foreground placeholder:text-muted-foreground"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || chatMutation.isPending}
                  className="bg-primary text-white w-9 h-9 rounded-full flex items-center justify-center hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 shrink-0 shadow-sm"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </form>
              <p className="text-[10px] text-muted-foreground text-center mt-2 opacity-60">
                AI assistance only — not a substitute for medical advice
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-xl shadow-primary/30 z-50 transition-colors hover:bg-primary/90"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X className="w-6 h-6" />
            </motion.span>
          ) : (
            <motion.span key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <MessageSquare className="w-6 h-6" />
            </motion.span>
          )}
        </AnimatePresence>
        {messages.length === 0 && !isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-background" />
        )}
      </motion.button>
    </>
  );
}
