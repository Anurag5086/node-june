import { useEffect, useState } from 'react'
import { Sparkles, ShoppingBag } from 'lucide-react'
import StoreHeader from '../components/layout/StoreHeader'
import HeroCarousel from '../components/home/HeroCarousel'
import CategoryCard from '../components/home/CategoryCard'
import ProductCard from '../components/home/ProductCard'
import { getCategories, getAllProducts } from '../api/store'

export default function Home() {
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [loadingProducts, setLoadingProducts] = useState(true)

  useEffect(() => {
    getCategories()
      .then(({ data }) => setCategories(data.categories || []))
      .catch(() => setCategories([]))
      .finally(() => setLoadingCategories(false))

    getAllProducts()
      .then(({ data }) => setProducts(data.products || []))
      .catch(() => setProducts([]))
      .finally(() => setLoadingProducts(false))
  }, [])

  return (
    <div className="min-h-svh bg-gray-50">
      <StoreHeader />

      <HeroCarousel />

      <section id="categories" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-6 sm:mb-8">
          <div className="mb-2 flex items-center gap-2 text-primary-600">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-semibold uppercase tracking-wide">Browse</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">Shop by Category</h2>
          <p className="mt-2 text-gray-500">Find exactly what you&apos;re looking for</p>
        </div>

        {loadingCategories ? (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[4/3] animate-pulse rounded-xl bg-gray-200" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
            <p className="text-gray-500">No categories available yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {categories.map((category, index) => (
              <CategoryCard key={category._id} category={category} index={index} />
            ))}
          </div>
        )}
      </section>

      <section id="products" className="border-t border-gray-200 bg-white py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-8">
            <div className="mb-2 flex items-center gap-2 text-primary-600">
              <ShoppingBag className="h-4 w-4" />
              <span className="text-sm font-semibold uppercase tracking-wide">Trending</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">All Products</h2>
            <p className="mt-2 text-gray-500">Handpicked deals just for you</p>
          </div>

          {loadingProducts ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-gray-200" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-16 text-center">
              <p className="text-gray-500">No products available yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      <footer className="border-t border-gray-200 bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-gray-500 sm:px-6">
          &copy; {new Date().getFullYear()} ShopEase. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
