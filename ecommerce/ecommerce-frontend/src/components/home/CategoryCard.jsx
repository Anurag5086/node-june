import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const fallbackGradients = [
  'from-blue-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-orange-500 to-rose-500',
  'from-violet-500 to-purple-600',
  'from-cyan-500 to-blue-600',
  'from-amber-500 to-orange-600',
]

export default function CategoryCard({ category, index = 0 }) {
  const gradient = fallbackGradients[index % fallbackGradients.length]

  return (
    <Link
      to={`/category/${category._id}`}
      className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:border-gray-300 hover:shadow-md"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {category.imageUrl ? (
          <img
            src={category.imageUrl}
            alt={category.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div
            className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${gradient}`}
          >
            <span className="text-3xl font-bold text-white/90">
              {category.title.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-base font-semibold text-white sm:text-lg">{category.title}</h3>
          {category.description && (
            <p className="mt-1 line-clamp-1 text-xs text-white/80 sm:text-sm">
              {category.description}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-sm font-medium text-gray-600">Explore</span>
        <ArrowRight className="h-4 w-4 text-primary-600 transition group-hover:translate-x-0.5" />
      </div>
    </Link>
  )
}
