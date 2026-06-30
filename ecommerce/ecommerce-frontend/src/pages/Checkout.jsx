import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Banknote, CreditCard, MapPin, Package } from 'lucide-react'
import StoreHeader from '../components/layout/StoreHeader'
import Button from '../components/ui/Button'
import Alert from '../components/ui/Alert'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { createOrder } from '../api/orders'
import { createRazorpayOrder, verifyRazorpayCheckout } from '../api/payments'
import { loadRazorpayScript } from '../utils/razorpay'
import { formatCurrency } from '../utils/formatCurrency'

export default function Checkout() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { items, subtotal, clearCart } = useCart()
  const [shippingAddress, setShippingAddress] = useState(user?.address || '')
  const [paymentMethod, setPaymentMethod] = useState('COD')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (items.length === 0) {
    return (
      <div className="min-h-svh bg-gray-50">
        <StoreHeader />
        <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-20 text-center sm:px-6">
          <Package className="h-12 w-12 text-gray-400" />
          <h1 className="mt-4 text-xl font-bold text-gray-900">Nothing to checkout</h1>
          <p className="mt-2 text-gray-500">Your cart is empty. Add items before placing an order.</p>
          <Link to="/" className="mt-6">
            <Button>Browse Products</Button>
          </Link>
        </div>
      </div>
    )
  }

  const validateAddress = () => {
    const address = shippingAddress.trim()
    if (!address) {
      setError('Please enter your shipping address.')
      return false
    }
    if (address.length < 10) {
      setError('Please enter a complete shipping address.')
      return false
    }
    return true
  }

  const buildCartPayload = () =>
    items.map((item) => ({
      product: item.product._id,
      quantity: item.quantity,
    }))

  const handlePlaceCodOrder = async (e) => {
    e.preventDefault()
    setError('')
    if (!validateAddress()) return

    setLoading(true)
    try {
      const payload = {
        products: items.map(({ product, quantity }) => ({
          product: product._id,
          quantity,
        })),
        totalAmount: subtotal,
        paymentMethod: 'COD',
        shippingAddress: shippingAddress.trim(),
      }

      const { data } = await createOrder(payload)
      clearCart()
      navigate('/order-success', {
        replace: true,
        state: { orderId: data.order?._id, paymentMethod: 'COD' },
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place order')
    } finally {
      setLoading(false)
    }
  }

  const handleRazorpay = async () => {
    if (!validateAddress()) return

    setLoading(true)
    setError('')

    const cartPayload = buildCartPayload()

    try {
      const { data: rp } = await createRazorpayOrder({ items: cartPayload })
      const RazorpayCtor = await loadRazorpayScript()

      await new Promise((resolve, reject) => {
        const options = {
          key: rp.keyId,
          amount: rp.amount,
          currency: rp.currency || 'INR',
          order_id: rp.orderId,
          name: 'ShopEase',
          description: 'Order payment',
          prefill: {
            name: user?.name,
            email: user?.email,
          },
          handler: async (response) => {
            try {
              const { data } = await verifyRazorpayCheckout({
                items: cartPayload,
                shippingAddress: shippingAddress.trim(),
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              })
              clearCart()
              navigate('/order-success', {
                replace: true,
                state: {
                  orderId: data.order?._id,
                  paymentMethod: 'Razorpay',
                },
              })
              resolve()
            } catch (err) {
              reject(err)
            }
          },
          modal: {
            ondismiss: () => reject(new Error('Payment cancelled')),
          },
          theme: { color: '#4f46e5' },
        }
        const rz = new RazorpayCtor(options)
        rz.on('payment.failed', () => reject(new Error('Payment failed')))
        rz.open()
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Payment error'
      if (!message.includes('cancelled')) {
        setError(message)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (paymentMethod === 'COD') {
      handlePlaceCodOrder(e)
    } else {
      handleRazorpay()
    }
  }

  return (
    <div className="min-h-svh bg-gray-50">
      <StoreHeader />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Checkout</h1>
        <p className="mt-1 text-gray-500">Review your order and complete your purchase</p>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary-600" />
                <h2 className="text-lg font-bold text-gray-900">Shipping Address</h2>
              </div>

              {error && (
                <div className="mb-4">
                  <Alert message={error} />
                </div>
              )}

              <textarea
                name="shippingAddress"
                rows={4}
                placeholder="House no., street, city, state, pincode"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                required
              />
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Banknote className="h-5 w-5 text-primary-600" />
                <h2 className="text-lg font-bold text-gray-900">Payment Method</h2>
              </div>

              <div className="space-y-3">
                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition ${
                    paymentMethod === 'COD'
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="mt-1 accent-primary-600"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">Cash on Delivery (COD)</p>
                    <p className="mt-0.5 text-sm text-gray-500">
                      Pay with cash when your order is delivered to your doorstep.
                    </p>
                  </div>
                </label>

                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition ${
                    paymentMethod === 'Razorpay'
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Razorpay"
                    checked={paymentMethod === 'Razorpay'}
                    onChange={() => setPaymentMethod('Razorpay')}
                    className="mt-1 accent-primary-600"
                  />
                  <div>
                    <p className="flex items-center gap-2 font-semibold text-gray-900">
                      <CreditCard className="h-4 w-4" />
                      Pay Online (Razorpay)
                    </p>
                    <p className="mt-0.5 text-sm text-gray-500">
                      Pay securely using UPI, cards, net banking, or wallets.
                    </p>
                  </div>
                </label>
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-bold text-gray-900">Order Items</h2>
              <ul className="divide-y divide-gray-100">
                {items.map(({ product, quantity }) => (
                  <li key={product._id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      {product.images?.[0] && (
                        <img
                          src={product.images[0]}
                          alt={product.title}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-gray-900">{product.title}</p>
                      <p className="text-sm text-gray-500">Qty: {quantity}</p>
                    </div>
                    <p className="shrink-0 font-semibold text-gray-900">
                      {formatCurrency(product.sellingPrice * quantity)}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <div className="h-fit rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900">Order Summary</h2>

            <div className="mt-2 text-sm text-gray-500">
              Delivering to <span className="font-medium text-gray-700">{user?.name}</span>
            </div>

            <div className="mt-4 space-y-3 border-b border-gray-200 pb-4">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal ({items.reduce((n, i) => n + i.quantity, 0)} items)</span>
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

            <Button type="submit" fullWidth loading={loading} className="mt-6">
              {paymentMethod === 'COD' ? 'Place Order (COD)' : 'Pay with Razorpay'}
            </Button>

            <Link to="/cart" className="mt-3 block">
              <Button fullWidth variant="secondary" type="button">
                Back to Cart
              </Button>
            </Link>
          </div>
        </form>
      </main>
    </div>
  )
}
