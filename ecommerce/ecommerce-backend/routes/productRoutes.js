const express = require('express')
const authMiddleware = require('../middlewares/authMiddleware')
const adminMiddleware = require('../middlewares/adminMiddleware')
const { getProductById, getAllProducts, getAllProductsForCategory, getAllProductsForAdmin, createProduct, updateProduct, deleteProduct } = require('../controllers/productControllers')
const router = express.Router()

router.get('/get-product/:id', getProductById)
router.get('/get-all-products', getAllProducts)
router.get('/get-all-products-for-category/:categoryId', getAllProductsForCategory)
router.get('/get-all-products-admin', authMiddleware, adminMiddleware, getAllProductsForAdmin)
router.post('/create-product', authMiddleware, adminMiddleware, createProduct)
router.put('/update-product/:id', authMiddleware, adminMiddleware, updateProduct)
router.delete('/delete-product/:id', authMiddleware, adminMiddleware, deleteProduct)

module.exports = router