import { useState } from 'react'
import { ShoppingCart, Star } from 'lucide-react'
import Button from '../ui/Button'
import { useCart } from '../../context/CartContext'
import { formatCurrency } from '../../utils/formatCurrency'

export function normalizeProductForCart(product) {
  return {
    _id: product.id || product._id,
    title: product.title,
    brand: product.brand,
    description: product.description,
    sellingPrice: product.sellingPrice,
    mrpPrice: product.mrpPrice,
    stockQuantity: product.stockQuantity,
    images: product.images?.length
      ? product.images
      : product.image
        ? [product.image]
        : [],
    rating: product.rating,
    noOfRatings: product.noOfRatings,
  }
}

export default function AssistantProductCard({ product }) {
  const { addToCart } = useCart()
  const [added, setAdded] = useState(false)

  const image = product.image || product.images?.[0]
  const outOfStock = product.stockQuantity <= 0 || product.inStock === false

  const handleAddToCart = () => {
    addToCart(normalizeProductForCart(product))
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div className="flex gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
        {image ? (
          <img src={image} alt={product.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-gray-400">
            No image
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary-600">
          {product.brand}
        </p>
        <h4 className="line-clamp-2 text-sm font-semibold text-gray-900">{product.title}</h4>

        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
          {product.category && <span>{product.category}</span>}
          {product.rating > 0 && (
            <span className="inline-flex items-center gap-0.5">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              {product.rating}
            </span>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <span className="text-sm font-bold text-gray-900">
            {formatCurrency(product.sellingPrice)}
          </span>
          {outOfStock ? (
            <span className="text-xs font-medium text-red-500">Out of stock</span>
          ) : (
            <Button
              variant={added ? 'secondary' : 'primary'}
              className="!px-3 !py-1.5 text-xs"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              {added ? 'Added' : 'Add'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
