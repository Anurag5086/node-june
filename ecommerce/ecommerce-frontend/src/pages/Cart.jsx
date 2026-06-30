import { Link } from 'react-router-dom'
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import StoreHeader from '../components/layout/StoreHeader'
import Button from '../components/ui/Button'
import { useCart } from '../context/CartContext'
import { formatCurrency } from '../utils/formatCurrency'

export default function Cart() {
  const { items, subtotal, updateQuantity, removeFromCart } = useCart()

  if (items.length === 0) {
    return (
      <div className="min-h-svh bg-gray-50">
        <StoreHeader />
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-20 sm:px-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-100">
            <ShoppingBag className="h-10 w-10 text-primary-600" />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-gray-900">Your cart is empty</h1>
          <p className="mt-2 text-gray-500">Add some products to get started.</p>
          <Link to="/" className="mt-8">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-svh bg-gray-50">
      <StoreHeader />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Shopping Cart</h1>
        <p className="mt-1 text-gray-500">{items.length} item{items.length !== 1 ? 's' : ''} in your cart</p>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {items.map(({ product, quantity }) => (
              <div
                key={product._id}
                className="flex gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:gap-6 sm:p-5"
              >
                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-100 sm:h-28 sm:w-28">
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-gray-400">
                      No image
                    </div>
                  )}
                </div>

                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-primary-600">
                        {product.brand}
                      </p>
                      <h2 className="mt-0.5 font-semibold text-gray-900">{product.title}</h2>
                      <p className="mt-1 text-lg font-bold text-gray-900">
                        {formatCurrency(product.sellingPrice)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromCart(product._id)}
                      className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-4">
                    <div className="flex items-center rounded-lg border border-gray-300">
                      <button
                        type="button"
                        onClick={() => updateQuantity(product._id, quantity - 1)}
                        className="rounded-l-lg p-2 text-gray-600 hover:bg-gray-50"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="min-w-[2.5rem] text-center text-sm font-semibold">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(product._id, quantity + 1)}
                        disabled={quantity >= product.stockQuantity}
                        className="rounded-r-lg p-2 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(product.sellingPrice * quantity)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="h-fit rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900">Order Summary</h2>

            <div className="mt-4 space-y-3 border-b border-gray-200 pb-4">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Delivery</span>
                <span className="font-medium text-green-600">Free</span>
              </div>
            </div>

            <div className="mt-4 flex justify-between text-lg font-bold text-gray-900">
              <span>Total</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>

            <Link to="/checkout" className="mt-6 block">
              <Button fullWidth>Proceed to Checkout</Button>
            </Link>

            <Link to="/" className="mt-3 block">
              <Button fullWidth variant="secondary">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
