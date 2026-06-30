import { AlertCircle, CheckCircle, Info } from 'lucide-react'

export default function Alert({ type = 'error', message }) {
  const styles = {
    error: 'border-red-200 bg-red-50 text-red-800',
    success: 'border-green-200 bg-green-50 text-green-800',
    info: 'border-blue-200 bg-blue-50 text-blue-800',
  }

  const icons = {
    error: AlertCircle,
    success: CheckCircle,
    info: Info,
  }

  const Icon = icons[type]

  return (
    <div
      className={`flex items-start gap-2.5 rounded-lg border px-3.5 py-3 text-sm ${styles[type]}`}
      role="alert"
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  )
}
