import api from './client'

// Orders
export const getAllOrders = () => api.get('/api/order/get-all-orders')
export const updateOrderStatus = (id, status) =>
  api.put(`/api/order/update-order-status/${id}`, { status })

// Products
export const getAllProductsAdmin = () => api.get('/api/product/get-all-products-admin')
export const createProduct = (data) => api.post('/api/product/create-product', data)
export const updateProduct = (id, data) => api.put(`/api/product/update-product/${id}`, data)
export const deleteProduct = (id) => api.delete(`/api/product/delete-product/${id}`)

// Categories
export const getAllCategoriesAdmin = () => api.get('/api/category/get-all-categories-admin')
export const createCategory = (data) => api.post('/api/category/create-category', data)
export const updateCategory = (id, data) => api.put(`/api/category/update-category/${id}`, data)
export const deleteCategory = (id) => api.delete(`/api/category/delete-category/${id}`)

// Users
export const getAllUsers = () => api.get('/api/user/get-all-users')
