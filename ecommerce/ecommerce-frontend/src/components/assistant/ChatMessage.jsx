import { Bot, User } from 'lucide-react'
import AssistantProductCard from './AssistantProductCard'

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
          isUser ? 'bg-primary-600 text-white' : 'bg-primary-100 text-primary-700'
        }`}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      <div className={`max-w-[85%] space-y-3 sm:max-w-[75%] ${isUser ? 'items-end' : ''}`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? 'rounded-tr-md bg-primary-600 text-white'
              : 'rounded-tl-md border border-gray-200 bg-white text-gray-800 shadow-sm'
          }`}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>

        {!isUser && message.products?.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Recommended products
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {message.products.map((product) => (
                <AssistantProductCard
                  key={product.id || product._id}
                  product={product}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
