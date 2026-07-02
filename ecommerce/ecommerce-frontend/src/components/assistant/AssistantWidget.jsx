import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Bot, X } from 'lucide-react'
import AssistantChatPanel from './AssistantChatPanel'

const HIDDEN_PATH_PREFIXES = ['/admin']
const HIDDEN_PATHS = new Set([
  '/assistant',
  '/login',
  '/register',
  '/verify-otp',
  '/forgot-password',
  '/verify-otp-forget-password',
  '/reset-password',
])

function shouldShowWidget(pathname) {
  if (HIDDEN_PATHS.has(pathname)) return false
  return !HIDDEN_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

export default function AssistantWidget() {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)

  if (!shouldShowWidget(pathname)) return null

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {open && (
        <div
          className="flex h-[min(520px,calc(100vh-6rem))] w-[min(400px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-gray-900/10"
          role="dialog"
          aria-label="AI Shopping Assistant"
        >
          <div className="flex items-center justify-between border-b border-gray-200 bg-primary-600 px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold">Shopping Assistant</p>
                <p className="text-xs text-primary-100">Powered by AI</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg p-1.5 transition hover:bg-white/20"
              aria-label="Close assistant"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <AssistantChatPanel compact />
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-600 text-white shadow-lg shadow-primary-600/30 transition hover:bg-primary-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        aria-label={open ? 'Close AI assistant' : 'Open AI assistant'}
        aria-expanded={open}
      >
        {open ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
      </button>
    </div>
  )
}
