import { useState } from 'react'
import { ImageOff, ShoppingCart, Star } from 'lucide-react'
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

function ProductImage({ src, alt }) {
  const [failed, setFailed] = useState(!src)

  if (failed) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-gradient-to-br from-primary-50 to-gray-100 text-primary-400">
        <ImageOff className="h-6 w-6" />
        <span className="px-2 text-center text-[10px] font-medium uppercase tracking-wide">
          No preview
        </span>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className="h-full w-full object-cover"
      loading="lazy"
      onError={() => setFailed(true)}
    />
  )
}

export default function AssistantProductCard({ product }) {
  const { addToCart } = useCart()
  const [added, setAdded] = useState(false)

  const image = product.image || product.images?.[0]
  const outOfStock = product.stockQuantity <= 0 || product.inStock === false
  const discount =
    product.mrpPrice > product.sellingPrice
      ? Math.round(((product.mrpPrice - product.sellingPrice) / product.mrpPrice) * 100)
      : 0

  const handleAddToCart = () => {
    addToCart(normalizeProductForCart(product))
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <article className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:border-primary-200 hover:shadow-md">
      <div className="relative aspect-[5/3] overflow-hidden bg-gray-100">
        <ProductImage src={image} alt={product.title} />
        {discount > 0 && (
          <span className="absolute left-2 top-2 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
            {discount}% OFF
          </span>
        )}
        {outOfStock && (
          <span className="absolute right-2 top-2 rounded-full bg-gray-900/75 px-2 py-0.5 text-[10px] font-semibold text-white">
            Out of stock
          </span>
        )}
      </div>

      <div className="space-y-2 p-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-primary-600">
            {product.brand}
          </p>
          <h4 className="mt-0.5 line-clamp-2 text-sm font-semibold leading-snug text-gray-900">
            {product.title}
          </h4>
        </div>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
          {product.category && (
            <span className="rounded-full bg-gray-100 px-2 py-0.5">{product.category}</span>
          )}
          {product.rating > 0 && (
            <span className="inline-flex items-center gap-1">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span className="font-medium text-gray-700">{product.rating}</span>
              {product.noOfRatings > 0 && (
                <span className="text-gray-400">({product.noOfRatings})</span>
              )}
            </span>
          )}
        </div>

        <div className="flex items-end justify-between gap-2 pt-1">
          <div className="min-w-0">
            <p className="text-base font-bold text-gray-900">
              {formatCurrency(product.sellingPrice)}
            </p>
            {discount > 0 && (
              <p className="text-xs text-gray-400 line-through">
                {formatCurrency(product.mrpPrice)}
              </p>
            )}
          </div>

          {!outOfStock && (
            <Button
              variant={added ? 'secondary' : 'primary'}
              className="shrink-0 !px-3 !py-2 text-xs"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              {added ? 'Added' : 'Add to cart'}
            </Button>
          )}
        </div>
      </div>
    </article>
  )
}
