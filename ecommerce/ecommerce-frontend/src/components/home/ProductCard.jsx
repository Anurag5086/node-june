import { useState } from 'react'
import { ShoppingCart } from 'lucide-react'
import Button from '../ui/Button'
import { useCart } from '../../context/CartContext'

import { formatCurrency } from '../../utils/formatCurrency'

export default function ProductCard({ product }) {
  const { addToCart } = useCart()
  const [added, setAdded] = useState(false)

  const discount =
    product.mrpPrice > product.sellingPrice
      ? Math.round(((product.mrpPrice - product.sellingPrice) / product.mrpPrice) * 100)
      : 0

  const handleAddToCart = () => {
    addToCart(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.title}
            className="h-full w-full object-cover transition duration-300 hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            No image
          </div>
        )}
        {discount > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-red-500 px-2.5 py-1 text-xs font-bold text-white">
            {discount}% OFF
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary-600">
          {product.brand}
        </p>
        <h3 className="mt-1 line-clamp-2 text-base font-semibold text-gray-900">
          {product.title}
        </h3>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-lg font-bold text-gray-900">
            {formatCurrency(product.sellingPrice)}
          </span>
          {discount > 0 && (
            <span className="text-sm text-gray-400 line-through">
              {formatCurrency(product.mrpPrice)}
            </span>
          )}
        </div>

        {product.stockQuantity <= 0 ? (
          <p className="mt-3 text-sm font-medium text-red-500">Out of stock</p>
        ) : (
          <div className="mt-auto pt-4">
            <Button
              fullWidth
              variant={added ? 'secondary' : 'primary'}
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-4 w-4" />
              {added ? 'Added!' : 'Add to Cart'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
