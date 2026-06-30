import { Link } from 'react-router-dom'
import { ShoppingBag, Truck, ShieldCheck, Headphones } from 'lucide-react'

const features = [
  { icon: Truck, text: 'Free shipping on orders over $50' },
  { icon: ShieldCheck, text: 'Secure & encrypted payments' },
  { icon: Headphones, text: '24/7 customer support' },
]

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="flex min-h-svh">
      <div className="relative hidden w-1/2 overflow-hidden bg-gradient-to-br from-primary-600 via-primary-600 to-primary-700 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white" />
          <div className="absolute -bottom-10 -left-10 h-60 w-60 rounded-full bg-white" />
        </div>

        <Link to="/" className="relative z-10 flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <ShoppingBag className="h-5 w-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-white">ShopEase</span>
        </Link>

        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-3xl font-bold leading-tight text-white">
              Shop smarter,
              <br />
              live better.
            </h2>
            <p className="mt-3 max-w-sm text-primary-100">
              Discover thousands of products with fast delivery and unbeatable
              prices.
            </p>
          </div>

          <ul className="space-y-4">
            {features.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-white/90">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-sm">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-sm text-primary-200">
          &copy; {new Date().getFullYear()} ShopEase. All rights reserved.
        </p>
      </div>

      <div className="flex w-full flex-col lg:w-1/2">
        <div className="flex items-center justify-center border-b border-gray-100 bg-white px-4 py-4 lg:hidden">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600">
              <ShoppingBag className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">ShopEase</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-4 py-8 sm:px-8">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center lg:text-left">
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                {title}
              </h1>
              <p className="mt-2 text-sm text-gray-500">{subtitle}</p>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
