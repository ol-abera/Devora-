import { useState, useRef, useEffect, useCallback } from "react"
import { Brain, Send, Sparkles, User, Bot, Plus, MessageSquare } from "lucide-react"
import { meApi } from "@/api"
import { useI18n } from "@/i18n"
import { PageShell } from "@/components/ui"

interface Message {
  id: string
  role: "user" | "assistant"
  text: string
}

interface ChatSession {
  id: string
  title: string
  messages: Message[]
  updatedAt: number
}

const HISTORY_KEY = "devora.tutor.history"
const MAX_SESSIONS = 20

function loadHistory(): ChatSession[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    if (raw) return JSON.parse(raw) as ChatSession[]
  } catch { /* ignore */ }
  return []
}

function saveHistory(sessions: ChatSession[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(sessions.slice(0, MAX_SESSIONS)))
  } catch { /* ignore */ }
}

function newSession(welcome: string): ChatSession {
  return {
    id: `s-${Date.now()}`,
    title: "New chat",
    messages: [{ id: "welcome", role: "assistant", text: welcome }],
    updatedAt: Date.now(),
  }
}

const SUGGESTED_KEYS = [
  "Explain this concept simply",
  "Give me a practice exercise",
  "What's a common mistake here?",
  "Show a real-world example",
] as const

export default function AITutorPage() {
  const { t, locale } = useI18n()
  const welcome = t("tutor.welcome")

  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const stored = loadHistory()
    return stored.length ? stored : [newSession(welcome)]
  })
  const [activeId, setActiveId] = useState(() => sessions[0]?.id ?? "")
  const [input, setInput] = useState("")
  const [typing, setTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const active = sessions.find(s => s.id === activeId) ?? sessions[0]

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [active?.messages, typing])

  useEffect(() => {
    saveHistory(sessions)
  }, [sessions])

  // Refresh welcome message language when locale changes (only on brand-new empty chats)
  useEffect(() => {
    setSessions(prev => prev.map(s => {
      if (s.messages.length === 1 && s.messages[0].id === "welcome") {
        return { ...s, messages: [{ id: "welcome", role: "assistant", text: welcome }] }
      }
      return s
    }))
  }, [welcome])

  const updateActive = useCallback((fn: (s: ChatSession) => ChatSession) => {
    setSessions(prev => prev.map(s => (s.id === activeId ? fn(s) : s)))
  }, [activeId])

  const send = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || typing || !active) return
    setInput("")
    const userMsg: Message = { id: `u-${Date.now()}`, role: "user", text: trimmed }
    updateActive(s => ({
      ...s,
      title: s.messages.length <= 1 ? trimmed.slice(0, 40) : s.title,
      messages: [...s.messages, userMsg],
      updatedAt: Date.now(),
    }))
    setTyping(true)
    try {
      // General tutor context (no specific course). Backend still owns the model key.
      // Language hint so the model can reply in the user's UI language when available.
      const history = [...(active.messages.filter(m => m.id !== "welcome")), userMsg]
        .map(m => ({ role: m.role, text: m.text }))
      const langHint = locale === "am" ? "Reply in Amharic when appropriate." 
        : locale === "om" ? "Reply in Afaan Oromo when appropriate." 
        : "Reply in English."
      const { reply } = await meApi.tutorChat({
        courseId: "general",
        lessonId: "general",
        messages: [
          { role: "user", text: `[System: ${langHint}]` },
          ...history,
        ],
      })
      updateActive(s => ({
        ...s,
        messages: [...s.messages, { id: `a-${Date.now()}`, role: "assistant", text: reply }],
        updatedAt: Date.now(),
      }))
    } catch (err) {
      updateActive(s => ({
        ...s,
        messages: [...s.messages, {
          id: `a-${Date.now()}`,
          role: "assistant",
          text: err instanceof Error ? err.message : t("common.error"),
        }],
      }))
    } finally {
      setTyping(false)
      inputRef.current?.focus()
    }
  }

  const startNew = () => {
    const s = newSession(welcome)
    setSessions(prev => [s, ...prev].slice(0, MAX_SESSIONS))
    setActiveId(s.id)
    setInput("")
  }

  return (
    <PageShell>
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#5B21B6] flex items-center justify-center text-white">
            <Brain size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{t("tutor.title")}</h1>
            <p className="text-sm text-slate-500">{t("tutor.subtitle")}</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[240px_1fr] gap-4 min-h-[560px]">
        {/* History sidebar */}
        <aside className="bg-white rounded-2xl border border-slate-100 p-3 flex flex-col">
          <button
            type="button"
            onClick={startNew}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#7C3AED] text-white text-sm font-medium hover:bg-[#6D28D9] mb-3"
          >
            <Plus size={16} /> {t("tutor.newChat")}
          </button>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide px-2 mb-2">{t("tutor.history")}</p>
          <ul className="flex-1 overflow-y-auto space-y-1">
            {sessions.length === 0 && (
              <li className="text-sm text-slate-400 px-2 py-4 text-center">{t("tutor.emptyHistory")}</li>
            )}
            {sessions.map(s => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => setActiveId(s.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm truncate flex items-center gap-2 ${s.id === activeId ? "bg-[#EDE9FE] text-[#5B21B6] font-medium" : "text-slate-600 hover:bg-slate-50"}`}
                >
                  <MessageSquare size={14} className="shrink-0 opacity-60" />
                  <span className="truncate">{s.title}</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Chat panel */}
        <div className="bg-white rounded-2xl border border-slate-100 flex flex-col min-h-[560px]">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {active?.messages.map(m => (
              <div key={m.id} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
                {m.role === "assistant" && (
                  <div className="w-8 h-8 rounded-lg bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center shrink-0">
                    <Bot size={16} />
                  </div>
                )}
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-[#7C3AED] text-white rounded-br-md"
                    : "bg-slate-50 text-slate-800 rounded-bl-md"
                }`}>
                  {m.text}
                </div>
                {m.role === "user" && (
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                    <User size={16} />
                  </div>
                )}
              </div>
            ))}
            {typing && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center shrink-0">
                  <Bot size={16} />
                </div>
                <div className="bg-slate-50 rounded-2xl rounded-bl-md px-4 py-3 flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggested prompts */}
          {active && active.messages.length <= 1 && (
            <div className="px-4 sm:px-6 pb-2">
              <p className="text-xs font-medium text-slate-400 mb-2 flex items-center gap-1"><Sparkles size={12} /> {t("tutor.suggested")}</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_KEYS.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    disabled={typing}
                    className="text-xs px-3 py-1.5 rounded-full border border-slate-200 text-slate-600 hover:border-[#7C3AED] hover:text-[#7C3AED] transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form
            onSubmit={e => { e.preventDefault(); send(input) }}
            className="p-4 sm:p-6 border-t border-slate-100 flex gap-2"
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input) }
              }}
              rows={1}
              placeholder={t("tutor.placeholder")}
              className="flex-1 resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/10 max-h-32"
              disabled={typing}
            />
            <button
              type="submit"
              disabled={typing || !input.trim()}
              className="shrink-0 w-11 h-11 rounded-xl bg-[#7C3AED] text-white flex items-center justify-center hover:bg-[#6D28D9] disabled:opacity-50"
              aria-label={t("tutor.send")}
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </PageShell>
  )
}
