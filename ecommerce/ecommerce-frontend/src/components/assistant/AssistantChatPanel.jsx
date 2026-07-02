import { useEffect, useRef, useState } from 'react'
import { Bot, Send, Sparkles } from 'lucide-react'
import ChatMessage from './ChatMessage'
import Button from '../ui/Button'
import { chatWithAssistant } from '../../api/assistant'

const SUGGESTIONS = [
  'Wireless headphones under ₹7000',
  'Best rated running shoes',
  'Skincare under ₹1000',
  'Gift ideas from Toys',
]

export const WELCOME_MESSAGE = {
  role: 'assistant',
  content:
    "Hi! I'm your AI shopping assistant. Tell me what you're looking for and I'll find the best matches from our store.",
  products: [],
}

export default function AssistantChatPanel({ compact = false, onMessageSent }) {
  const [messages, setMessages] = useState([WELCOME_MESSAGE])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (!compact) return
    inputRef.current?.focus()
  }, [compact])

  const sendMessage = async (text) => {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    setError('')
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: trimmed }])
    setLoading(true)

    const startedAt = Date.now()
    console.log('[assistant:ui] Message submitted', { text: trimmed })

    try {
      const { data } = await chatWithAssistant(trimmed)

      console.log('[assistant:ui] Assistant message rendered', {
        durationMs: Date.now() - startedAt,
        productCount: data.products?.length ?? 0,
        fallback: data.fallback ?? false,
      })

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.reply,
          products: data.products || [],
        },
      ])
      onMessageSent?.()
    } catch (err) {
      console.error('[assistant:ui] Message failed', {
        durationMs: Date.now() - startedAt,
        message: err.message,
      })
      setError(err.message || 'Failed to get a response. Please try again.')
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    sendMessage(input)
  }

  return (
    <div className={`flex flex-col overflow-hidden bg-white ${compact ? 'h-full' : 'flex-1 rounded-2xl border border-gray-200 shadow-sm'}`}>
      <div className={`flex-1 space-y-4 overflow-y-auto ${compact ? 'p-3 sm:p-4' : 'p-4 sm:p-6'}`}>
        {messages.map((message, index) => (
          <ChatMessage key={index} message={message} />
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700">
              <Bot className="h-4 w-4" />
            </div>
            <div className="rounded-2xl rounded-tl-md border border-gray-200 bg-white px-3 py-2 shadow-sm">
              <div className="flex gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {messages.length === 1 && !loading && (
        <div className="border-t border-gray-100 px-3 py-2 sm:px-4">
          <p className="mb-1.5 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-gray-500 sm:text-xs">
            <Sparkles className="h-3 w-3" />
            Try asking
          </p>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => sendMessage(suggestion)}
                className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] text-gray-700 transition hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 sm:text-xs"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="border-t border-red-100 bg-red-50 px-3 py-2 text-xs text-red-600 sm:px-4 sm:text-sm">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex gap-2 border-t border-gray-200 p-3 sm:p-4"
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about products..."
          disabled={loading}
          className="flex-1 rounded-xl border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:opacity-60"
        />
        <Button type="submit" loading={loading} disabled={!input.trim()} className="!px-3">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}
