import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import PageHeader from '../../components/admin/PageHeader'
import EmptyState from '../../components/admin/EmptyState'
import Button from '../../components/ui/Button'
import {
  getAllProductsAdmin,
  getAllCategoriesAdmin,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../../api/admin'

const emptyForm = {
  title: '',
  description: '',
  brand: '',
  mrpPrice: '',
  sellingPrice: '',
  stockQuantity: '',
  categoryId: '',
  images: '',
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const loadData = async () => {
    setLoading(true)
    setError('')

    const [productsResult, categoriesResult] = await Promise.allSettled([
      getAllProductsAdmin(),
      getAllCategoriesAdmin(),
    ])

    if (productsResult.status === 'fulfilled') {
      setProducts(productsResult.value.data.products || [])
    } else {
      setError(productsResult.reason?.message || 'Failed to load products')
    }

    if (categoriesResult.status === 'fulfilled') {
      setCategories(categoriesResult.value.data.categories || [])
    } else {
      setError((prev) => prev || categoriesResult.reason?.message || 'Failed to load categories')
    }

    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const openCreate = () => {
    if (categories.length === 0) {
      setError('Please create a category first before adding products.')
      return
    }
    setEditingId(null)
    setForm(emptyForm)
    setShowModal(true)
  }

  const openEdit = (product) => {
    setEditingId(product._id)
    setForm({
      title: product.title,
      description: product.description,
      brand: product.brand,
      mrpPrice: product.mrpPrice,
      sellingPrice: product.sellingPrice,
      stockQuantity: product.stockQuantity,
      categoryId: typeof product.categoryId === 'object'
        ? product.categoryId._id
        : product.categoryId,
      images: (product.images || []).join(', '),
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    const payload = {
      title: form.title,
      description: form.description,
      brand: form.brand,
      mrpPrice: Number(form.mrpPrice),
      sellingPrice: Number(form.sellingPrice),
      stockQuantity: Number(form.stockQuantity),
      categoryId: form.categoryId,
      images: form.images
        ? form.images.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
    }

    try {
      if (editingId) {
        const { data } = await updateProduct(editingId, payload)
        setProducts((prev) =>
          prev.map((p) => (p._id === editingId ? data.product : p)),
        )
      } else {
        const { data } = await createProduct(payload)
        setProducts((prev) => [data.product, ...prev])
      }
      setShowModal(false)
    } catch (err) {
      setError(err.message || 'Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (product) => {
    try {
      const { data } = await updateProduct(product._id, {
        isActive: !product.isActive,
      })
      setProducts((prev) =>
        prev.map((p) => (p._id === product._id ? data.product : p)),
      )
    } catch (err) {
      setError(err.message || 'Failed to update product')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return
    try {
      await deleteProduct(id)
      setProducts((prev) => prev.filter((p) => p._id !== id))
    } catch (err) {
      setError(err.message || 'Failed to delete product')
    }
  }

  const getCategoryName = (categoryId) => {
    const cat = categories.find((c) => c._id === categoryId)
    return cat?.title || '—'
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
        title="Products"
        description="Manage your product catalog"
        action={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        }
      />

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {products.length === 0 ? (
        <EmptyState message="No products yet. Add your first product." />
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs font-medium uppercase text-gray-500">
                <tr>
                  <th className="px-5 py-3">Product</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Price</th>
                  <th className="px-5 py-3">Stock</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.title}
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400">
                            N/A
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{product.title}</p>
                          <p className="text-xs text-gray-500">{product.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {getCategoryName(product.categoryId)}
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-medium text-gray-900">
                        {formatCurrency(product.sellingPrice)}
                      </p>
                      <p className="text-xs text-gray-400 line-through">
                        {formatCurrency(product.mrpPrice)}
                      </p>
                    </td>
                    <td className="px-5 py-3 text-gray-600">{product.stockQuantity}</td>
                    <td className="px-5 py-3">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(product)}
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          product.isActive
                            ? 'bg-green-50 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {product.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(product)}
                          className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-primary-600"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(product._id)}
                          className="rounded-lg p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowModal(false)}
          />
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-bold text-gray-900">
              {editingId ? 'Edit Product' : 'Add Product'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Title</label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  required
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Brand</label>
                  <input
                    required
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
                  <select
                    required
                    value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  >
                    <option value="">Select category</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>{c.title}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">MRP</label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={form.mrpPrice}
                    onChange={(e) => setForm({ ...form, mrpPrice: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Selling Price</label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={form.sellingPrice}
                    onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Stock</label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={form.stockQuantity}
                    onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Image URLs (comma separated)
                </label>
                <input
                  value={form.images}
                  onChange={(e) => setForm({ ...form, images: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" loading={saving}>
                  {editingId ? 'Save Changes' : 'Create Product'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
