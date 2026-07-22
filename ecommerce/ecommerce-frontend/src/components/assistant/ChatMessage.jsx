import { Bot, Sparkles, User } from 'lucide-react'
import AssistantProductCard from './AssistantProductCard'

const MAX_PRODUCTS = 3

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user'
  const products = message.products?.slice(0, MAX_PRODUCTS) ?? []
  const hiddenCount = Math.max(0, (message.products?.length ?? 0) - MAX_PRODUCTS)

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
          isUser ? 'bg-primary-600 text-white' : 'bg-primary-100 text-primary-700'
        }`}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      <div className={`min-w-0 flex-1 space-y-3 ${isUser ? 'flex flex-col items-end' : ''}`}>
        <div
          className={`max-w-[92%] rounded-2xl px-4 py-3 text-sm leading-relaxed sm:max-w-[85%] ${
            isUser
              ? 'rounded-tr-md bg-primary-600 text-white'
              : 'rounded-tl-md border border-gray-200 bg-white text-gray-800 shadow-sm'
          }`}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>

        {!isUser && products.length > 0 && (
          <div className="w-full min-w-0 space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
              <Sparkles className="h-3.5 w-3.5 text-primary-500" />
              Recommended for you
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {products.map((product) => (
                <AssistantProductCard
                  key={product.id || product._id}
                  product={product}
                />
              ))}
            </div>

            {hiddenCount > 0 && (
              <p className="text-center text-xs text-gray-400">
                +{hiddenCount} more match{hiddenCount === 1 ? '' : 'es'} — refine your search to see them
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
