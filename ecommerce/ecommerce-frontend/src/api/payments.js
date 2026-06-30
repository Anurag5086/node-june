import api from './client'

export const createRazorpayOrder = (payload) =>
  api.post('/api/payment/create-razorpay-order', payload)

export const verifyRazorpayCheckout = (payload) =>
  api.post('/api/payment/verify-razorpay-checkout', payload)
