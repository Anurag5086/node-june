import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import PageHeader from '../../components/admin/PageHeader'
import EmptyState from '../../components/admin/EmptyState'
import Button from '../../components/ui/Button'
import {
  getAllCategoriesAdmin,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../../api/admin'

const emptyForm = {
  title: '',
  description: '',
  imageUrl: '',
}

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const loadCategories = async () => {
    try {
      const { data } = await getAllCategoriesAdmin()
      setCategories(data.categories || [])
    } catch (err) {
      setError(err.message || 'Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setShowModal(true)
  }

  const openEdit = (category) => {
    setEditingId(category._id)
    setForm({
      title: category.title,
      description: category.description || '',
      imageUrl: category.imageUrl || '',
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      if (editingId) {
        const { data } = await updateCategory(editingId, form)
        setCategories((prev) =>
          prev.map((c) => (c._id === editingId ? data.updatedCategory : c)),
        )
      } else {
        const { data } = await createCategory(form)
        setCategories((prev) => [data.category, ...prev])
      }
      setShowModal(false)
    } catch (err) {
      setError(err.message || 'Failed to save category')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (category) => {
    try {
      const { data } = await updateCategory(category._id, {
        isActive: !category.isActive,
      })
      setCategories((prev) =>
        prev.map((c) => (c._id === category._id ? data.updatedCategory : c)),
      )
    } catch (err) {
      setError(err.message || 'Failed to update category')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return
    try {
      await deleteCategory(id)
      setCategories((prev) => prev.filter((c) => c._id !== id))
    } catch (err) {
      setError(err.message || 'Failed to delete category')
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
        title="Categories"
        description="Organize your products into categories"
        action={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Add Category
          </Button>
        }
      />

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {categories.length === 0 ? (
        <EmptyState message="No categories yet. Add your first category." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <div
              key={category._id}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              {category.imageUrl ? (
                <img
                  src={category.imageUrl}
                  alt={category.title}
                  className="mb-4 h-32 w-full rounded-lg object-cover"
                />
              ) : (
                <div className="mb-4 flex h-32 w-full items-center justify-center rounded-lg bg-gray-100 text-sm text-gray-400">
                  No image
                </div>
              )}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-gray-900">{category.title}</h3>
                  {category.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                      {category.description}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleActive(category)}
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    category.isActive
                      ? 'bg-green-50 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {category.isActive ? 'Active' : 'Inactive'}
                </button>
              </div>
              <div className="mt-4 flex items-center gap-2 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={() => openEdit(category)}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(category._id)}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowModal(false)}
          />
          <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-bold text-gray-900">
              {editingId ? 'Edit Category' : 'Add Category'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Title</label>
                <input
                  required
                  minLength={3}
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Image URL</label>
                <input
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" loading={saving}>
                  {editingId ? 'Save Changes' : 'Create Category'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
