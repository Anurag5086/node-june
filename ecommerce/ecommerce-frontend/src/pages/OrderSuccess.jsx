import { Link, useLocation, Navigate } from 'react-router-dom'
import { CheckCircle, Package } from 'lucide-react'
import StoreHeader from '../components/layout/StoreHeader'
import Button from '../components/ui/Button'

export default function OrderSuccess() {
  const location = useLocation()
  const orderId = location.state?.orderId
  const paymentMethod = location.state?.paymentMethod || 'COD'

  if (!orderId) {
    return <Navigate to="/" replace />
  }

  const paymentMessage =
    paymentMethod === 'Razorpay'
      ? 'Payment received via Razorpay. Your order is confirmed.'
      : 'Payment method: Cash on Delivery — pay when you receive your package.'

  return (
    <div className="min-h-svh bg-gray-50">
      <StoreHeader />

      <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-20 text-center sm:px-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>

        <h1 className="mt-6 text-2xl font-bold text-gray-900">Order Placed Successfully!</h1>
        <p className="mt-2 text-gray-500">
          Thank you for your order. We&apos;ll deliver it to your address soon.
        </p>

        <div className="mt-6 flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600">
          <Package className="h-4 w-4 text-primary-600" />
          <span>
            Order ID: <span className="font-mono font-medium text-gray-900">{orderId}</span>
          </span>
        </div>

        <p className="mt-4 text-sm text-gray-500">{paymentMessage}</p>

        <Link to="/my-orders" className="mt-4 text-sm font-medium text-primary-600 hover:text-primary-700">
          View my orders
        </Link>

        <Link to="/" className="mt-8">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    </div>
  )
}
