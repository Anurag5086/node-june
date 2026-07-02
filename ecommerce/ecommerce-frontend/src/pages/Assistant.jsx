import { Bot } from 'lucide-react'
import StoreHeader from '../components/layout/StoreHeader'
import AssistantChatPanel from '../components/assistant/AssistantChatPanel'

export default function Assistant() {
  return (
    <div className="flex min-h-svh flex-col bg-gray-50">
      <StoreHeader />

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600 shadow-lg shadow-primary-600/20">
            <Bot className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">AI Shopping Assistant</h1>
          <p className="mt-2 text-gray-500">
            Ask in plain English — I&apos;ll search our catalog and recommend products for you.
          </p>
        </div>

        <AssistantChatPanel />
      </main>
    </div>
  )
}
