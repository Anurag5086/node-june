import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, Package, FolderTree, Users, DollarSign } from 'lucide-react'
import PageHeader from '../../components/admin/PageHeader'
import StatCard from '../../components/admin/StatCard'
import StatusBadge from '../../components/admin/StatusBadge'
import EmptyState from '../../components/admin/EmptyState'
import {
  getAllOrders,
  getAllProductsAdmin,
  getAllCategoriesAdmin,
  getAllUsers,
} from '../../api/admin'

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    orders: 0,
    products: 0,
    categories: 0,
    users: 0,
    revenue: 0,
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [ordersRes, productsRes, categoriesRes, usersRes] = await Promise.all([
          getAllOrders(),
          getAllProductsAdmin(),
          getAllCategoriesAdmin(),
          getAllUsers(),
        ])

        const orders = ordersRes.data.orders || []
        const revenue = orders
          .filter((o) => o.status !== 'cancelled')
          .reduce((sum, o) => sum + o.totalAmount, 0)

        setStats({
          orders: orders.length,
          products: productsRes.data.products?.length || 0,
          categories: categoriesRes.data.categories?.length || 0,
          users: usersRes.data.users?.length || 0,
          revenue,
        })

        setRecentOrders(
          [...orders]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5),
        )
      } catch {
        // stats stay at 0
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

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
        title="Dashboard"
        description="Overview of your store performance"
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total Orders" value={stats.orders} icon={ShoppingBag} color="primary" />
        <StatCard label="Products" value={stats.products} icon={Package} color="blue" />
        <StatCard label="Categories" value={stats.categories} icon={FolderTree} color="green" />
        <StatCard label="Users" value={stats.users} icon={Users} color="amber" />
        <StatCard
          label="Revenue"
          value={formatCurrency(stats.revenue)}
          icon={DollarSign}
          color="green"
        />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 className="font-semibold text-gray-900">Recent Orders</h2>
          <Link
            to="/admin/orders"
            className="text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            View all
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-6">
            <EmptyState message="No orders yet." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs font-medium uppercase text-gray-500">
                <tr>
                  <th className="px-5 py-3">Order ID</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Payment</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-mono text-xs text-gray-600">
                      {order._id.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-5 py-3 font-medium text-gray-900">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td className="px-5 py-3 text-gray-600">{order.paymentMethod}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-5 py-3 text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
