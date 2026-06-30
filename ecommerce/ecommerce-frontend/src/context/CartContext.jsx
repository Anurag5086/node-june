import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

const CartContext = createContext(null)
const CART_STORAGE_KEY = 'shopease_cart'

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart)

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const addToCart = useCallback((product, quantity = 1) => {
    if (product.stockQuantity <= 0) return

    setItems((prev) => {
      const existing = prev.find((item) => item.product._id === product._id)
      const currentQty = existing?.quantity ?? 0
      const newQty = Math.min(currentQty + quantity, product.stockQuantity)

      if (existing) {
        return prev.map((item) =>
          item.product._id === product._id
            ? { ...item, quantity: newQty }
            : item,
        )
      }
      return [...prev, { product, quantity: Math.min(quantity, product.stockQuantity) }]
    })
  }, [])

  const removeFromCart = useCallback((productId) => {
    setItems((prev) => prev.filter((item) => item.product._id !== productId))
  }, [])

  const updateQuantity = useCallback((productId, quantity) => {
    setItems((prev) => {
      if (quantity <= 0) {
        return prev.filter((item) => item.product._id !== productId)
      }

      return prev.map((item) => {
        if (item.product._id !== productId) return item
        const maxQty = item.product.stockQuantity
        return { ...item, quantity: Math.min(quantity, maxQty) }
      })
    })
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const cartCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  )

  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + item.product.sellingPrice * item.quantity,
        0,
      ),
    [items],
  )

  const value = useMemo(
    () => ({
      items,
      cartCount,
      subtotal,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
    }),
    [items, cartCount, subtotal, addToCart, removeFromCart, updateQuantity, clearCart],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
