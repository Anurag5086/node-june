import api from './client'

export const getCategories = () => api.get('/api/category/get-all-categories')

export const getProductsByCategory = (categoryId) =>
  api.get(`/api/product/get-all-products-for-category/${categoryId}`)

export const getAllProducts = () => api.get('/api/product/get-all-products')

export const getProduct = (id) => api.get(`/api/product/get-product/${id}`)
