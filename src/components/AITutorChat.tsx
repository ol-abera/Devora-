import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Brain, X, Send, Sparkles, User, Bot } from "lucide-react"
import { meApi } from "@/api"

interface Message {
  id: string
  role: "user" | "assistant"
  text: string
}

interface AITutorChatProps {
  courseId: string
  lessonId: string
  lessonTitle: string
}

const SUGGESTED = [
  "Explain this concept simply",
  "Give me a practice exercise",
  "What's a common mistake here?",
  "Show a real-world example",
]

export function AITutorChat({ courseId, lessonId, lessonTitle }: AITutorChatProps) {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      text: `Hi! I'm your Devora AI tutor for **${lessonTitle}**. Ask me to explain concepts, give exercises, or walk through common mistakes. I use a Socratic style — I'll guide you rather than dump full solutions.`,
    },
  ])
  const [typing, setTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, typing])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 200)
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false) }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  const send = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || typing) return
    const userMsg: Message = { id: `u-${Date.now()}`, role: "user", text: trimmed }
    const history = [...messages.filter(m => m.id !== "welcome"), userMsg]
    setMessages(prev => [...prev, userMsg])
    setInput("")
    setTyping(true)
    try {
      // POST /ai-tutor/chat. The backend talks to the AI model, so the browser never holds an API key.
      const { reply } = await meApi.tutorChat({ courseId, lessonId, messages: history.map(m => ({ role: m.role, text: m.text })) })
      setMessages(prev => [...prev, { id: `a-${Date.now()}`, role: "assistant", text: reply }])
    } catch (err) {
      setMessages(prev => [...prev, { id: `e-${Date.now()}`, role: "assistant", text: err instanceof Error ? `Sorry, I could not answer: ${err.message}` : "Sorry, I could not answer right now." }])
    } finally {
      setTyping(false)
    }
  }

  const renderText = (text: string) => {
    // Simple markdown-ish: **bold**, > quote, • lists
    return text.split("\n").map((line, i) => {
      if (line.startsWith("> ")) {
        return (
          <blockquote key={i} className="border-l-2 border-purple-300 pl-3 my-1 text-purple-800 italic">
            {line.slice(2)}
          </blockquote>
        )
      }
      const parts = line.split(/(\*\*[^*]+\*\*)/g)
      return (
        <p key={i} className={line.startsWith("•") ? "pl-1" : ""}>
          {parts.map((p, j) =>
            p.startsWith("**") && p.endsWith("**") ? (
              <strong key={j}>{p.slice(2, -2)}</strong>
            ) : (
              <span key={j}>{p}</span>
            )
          )}
        </p>
      )
    })
  }

  return (
    <>
      {/* Floating trigger */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open AI tutor"
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-[#7C3AED] text-white font-medium shadow-lg shadow-[#7C3AED]/30 hover:bg-[#6D28D9] transition-all cursor-pointer"
      >
        <Brain size={18} />
        <span className="hidden sm:inline text-sm">AI Tutor</span>
        <Sparkles size={14} className="opacity-80" />
      </button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] sm:bg-transparent sm:backdrop-blur-none sm:pointer-events-none"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 z-50 w-full sm:w-[400px] h-[70vh] sm:h-[520px] bg-white sm:rounded-2xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#7C3AED] to-[#5B21B6] text-white shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <Brain size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Devora AI Tutor</p>
                    <p className="text-[10px] text-white/70 truncate max-w-[220px]">{lessonTitle}</p>
                  </div>
                </div>
                <button onClick={() => setOpen(false)} aria-label="Close AI tutor" className="p-1.5 rounded-lg hover:bg-white/10 cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F8F7FC]">
                {messages.map(m => (
                  <div key={m.id} className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${m.role === "user" ? "bg-[#7C3AED] text-white" : "bg-purple-100 text-purple-700"}`}>
                      {m.role === "user" ? <User size={14} /> : <Bot size={14} />}
                    </div>
                    <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-[#7C3AED] text-white rounded-br-md"
                        : "bg-white border border-slate-100 text-slate-700 rounded-bl-md shadow-sm"
                    }`}>
                      {renderText(m.text)}
                    </div>
                  </div>
                ))}
                {typing && (
                  <div className="flex gap-2">
                    <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                      <Bot size={14} />
                    </div>
                    <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Suggested prompts */}
              {messages.length <= 2 && (
                <div className="px-3 py-2 flex flex-wrap gap-1.5 border-t border-slate-50 bg-white">
                  {SUGGESTED.map(s => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="text-[11px] px-2.5 py-1 rounded-full border border-purple-200 text-purple-700 hover:bg-purple-50 transition-colors cursor-pointer"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="p-3 border-t border-slate-100 bg-white shrink-0">
                <form
                  onSubmit={e => { e.preventDefault(); send(input) }}
                  className="flex items-center gap-2"
                >
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Ask the tutor anything…"
                    aria-label="Message to the AI tutor"
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/10"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || typing}
                    aria-label="Send message"
                    className="p-2.5 rounded-xl bg-[#7C3AED] text-white hover:bg-[#6D28D9] disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    <Send size={16} />
                  </button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
