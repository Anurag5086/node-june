import api from './client'

export const createOrder = (payload) => api.post('/api/order/create-order', payload)

export const getMyOrders = () => api.get('/api/order/get-all-orders-for-user')
