import { useEffect, useState } from 'react'
import PageHeader from '../../components/admin/PageHeader'
import StatusBadge from '../../components/admin/StatusBadge'
import EmptyState from '../../components/admin/EmptyState'
import { getAllOrders, updateOrderStatus } from '../../api/admin'

const ORDER_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)
  const [error, setError] = useState('')

  const loadOrders = async () => {
    try {
      const { data } = await getAllOrders()
      setOrders(data.orders || [])
    } catch (err) {
      setError(err.message || 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const handleStatusChange = async (orderId, status) => {
    setUpdating(orderId)
    setError('')
    try {
      const { data } = await updateOrderStatus(orderId, status)
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? data.updatedOrder : o)),
      )
    } catch (err) {
      setError(err.message || 'Failed to update status')
    } finally {
      setUpdating(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Orders"
        description="Manage and update order statuses"
      />

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {orders.length === 0 ? (
        <EmptyState message="No orders found." />
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs font-medium uppercase text-gray-500">
                <tr>
                  <th className="px-5 py-3">Order ID</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Items</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Payment</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-mono text-xs text-gray-600">
                      {order._id.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-5 py-3 font-medium text-gray-900">
                      {order.userId?.name || (
                        <span className="font-mono text-xs text-gray-600">
                          {String(order.userId?._id || order.userId).slice(-8).toUpperCase()}
                        </span>
                      )}
                      {order.userId?.email && (
                        <p className="mt-0.5 text-xs font-normal text-gray-500">
                          {order.userId.email}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      <ul className="space-y-1">
                        {order.products?.map((item, index) => (
                          <li key={index} className="text-sm">
                            <span className="font-medium text-gray-900">
                              {item.product?.title || 'Unknown product'}
                            </span>
                            <span className="text-gray-500"> × {item.quantity}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-5 py-3 font-medium text-gray-900">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td className="px-5 py-3 text-gray-600">{order.paymentMethod}</td>
                    <td className="px-5 py-3">
                      <select
                        value={order.status}
                        disabled={updating === order._id}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-xs font-medium text-gray-700 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:opacity-50"
                      >
                        {ORDER_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-3 text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
