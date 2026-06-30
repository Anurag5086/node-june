import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import StoreHeader from '../components/layout/StoreHeader'
import ProductCard from '../components/home/ProductCard'
import { getProductsByCategory, getCategories } from '../api/store'

export default function CategoryPage() {
  const { id } = useParams()
  const [category, setCategory] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [categoriesRes, productsRes] = await Promise.allSettled([
          getCategories(),
          getProductsByCategory(id),
        ])

        if (categoriesRes.status === 'fulfilled') {
          const found = categoriesRes.value.data.categories?.find((c) => c._id === id)
          setCategory(found || null)
        }

        if (productsRes.status === 'fulfilled') {
          setProducts(productsRes.value.data.productsInCategory || [])
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  return (
    <div className="min-h-svh bg-gray-50">
      <StoreHeader />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-primary-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          {category?.title || 'Category'}
        </h1>
        {category?.description && (
          <p className="mt-2 text-gray-500">{category.description}</p>
        )}

        {loading ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-72 animate-pulse rounded-2xl bg-gray-200" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
            <p className="text-gray-500">No products in this category yet.</p>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
