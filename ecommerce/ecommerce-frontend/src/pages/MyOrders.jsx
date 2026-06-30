import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, ShoppingBag } from 'lucide-react'
import StoreHeader from '../components/layout/StoreHeader'
import StatusBadge from '../components/admin/StatusBadge'
import Button from '../components/ui/Button'
import { getMyOrders } from '../api/orders'
import { formatCurrency } from '../utils/formatCurrency'

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function MyOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getMyOrders()
      .then(({ data }) => setOrders(data.orders || []))
      .catch((err) => setError(err.message || 'Failed to load orders'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-svh bg-gray-50">
      <StoreHeader />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">My Orders</h1>
        <p className="mt-1 text-gray-500">Track and view your order history</p>

        {loading ? (
          <div className="mt-12 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
          </div>
        ) : error ? (
          <div className="mt-8 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : orders.length === 0 ? (
          <div className="mt-12 flex flex-col items-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-100">
              <Package className="h-10 w-10 text-primary-600" />
            </div>
            <h2 className="mt-6 text-xl font-bold text-gray-900">No orders yet</h2>
            <p className="mt-2 text-gray-500">When you place an order, it will appear here.</p>
            <Link to="/" className="mt-8">
              <Button>
                <ShoppingBag className="h-4 w-4" />
                Start Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {orders.map((order) => (
              <article
                key={order._id}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 bg-gray-50 px-5 py-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Order ID
                    </p>
                    <p className="font-mono text-sm font-semibold text-gray-900">
                      #{order._id.slice(-8).toUpperCase()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                    <div className="mt-1">
                      <StatusBadge status={order.status} />
                    </div>
                  </div>
                </div>

                <div className="divide-y divide-gray-100 px-5">
                  {order.products?.length ? (
                    order.products.map((item, index) => {
                      const product = item.product
                      const title =
                        product && typeof product === 'object' && product.title
                          ? product.title
                          : 'Product unavailable'
                      const price =
                        product && typeof product === 'object' ? product.sellingPrice : null

                      return (
                        <div
                          key={product?._id || `${order._id}-${index}`}
                          className="flex items-center gap-4 py-4"
                        >
                          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                            {product?.images?.[0] ? (
                              <img
                                src={product.images[0]}
                                alt={title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-xs text-gray-400">
                                No image
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-900">{title}</p>
                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                          </div>
                          {price != null && (
                            <p className="shrink-0 font-semibold text-gray-900">
                              {formatCurrency(price * item.quantity)}
                            </p>
                          )}
                        </div>
                      )
                    })
                  ) : (
                    <p className="py-4 text-sm text-gray-500">No items in this order</p>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-5 py-4">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium text-gray-900">{order.paymentMethod}</span>
                    {order.shippingAddress && (
                      <p className="mt-1 max-w-md truncate text-gray-500">
                        {order.shippingAddress}
                      </p>
                    )}
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(order.totalAmount)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
