import { Link } from 'react-router-dom'
import {
  ShoppingBag,
  LogOut,
  LayoutDashboard,
  User,
  Search,
  ShoppingCart,
  Package,
} from 'lucide-react'
import Button from '../ui/Button'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'

export default function StoreHeader() {
  const { user, logout, isAdmin, isAuthenticated } = useAuth()
  const { cartCount } = useCart()

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600">
            <ShoppingBag className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">ShopEase</span>
        </Link>

        <div className="hidden max-w-md flex-1 md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Search products..."
              className="w-full rounded-full border border-gray-300 bg-gray-50 py-2 pl-10 pr-4 text-sm focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/cart"
            className="relative rounded-lg p-2 text-gray-600 hover:bg-gray-100"
            aria-label="Cart"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary-600 px-1 text-[10px] font-bold text-white">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <>
              {isAdmin && (
                <Link to="/admin" className="hidden sm:block">
                  <Button variant="secondary">
                    <LayoutDashboard className="h-4 w-4" />
                    Admin
                  </Button>
                </Link>
              )}
              <Link
                to="/my-orders"
                className="hidden rounded-lg p-2 text-gray-600 hover:bg-gray-100 sm:block"
                aria-label="My orders"
                title="My orders"
              >
                <Package className="h-5 w-5" />
              </Link>
              <Link
                to="/profile"
                className="hidden items-center gap-2 sm:flex"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[120px] truncate text-sm font-medium text-gray-700">
                  {user?.name}
                </span>
              </Link>
              <Button variant="ghost" onClick={logout} className="hidden sm:inline-flex">
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost">Sign in</Button>
              </Link>
              <Link to="/register">
                <Button>Sign up</Button>
              </Link>
            </>
          )}

          {isAuthenticated ? (
            <Link
              to="/profile"
              className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 md:hidden"
              aria-label="Account"
            >
              <User className="h-5 w-5" />
            </Link>
          ) : (
            <Link
              to="/login"
              className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 md:hidden"
              aria-label="Sign in"
            >
              <User className="h-5 w-5" />
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
