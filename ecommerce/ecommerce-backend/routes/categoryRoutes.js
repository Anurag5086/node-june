const express = require('express')
const authMiddleware = require('../middlewares/authMiddleware')
const adminMiddleware = require('../middlewares/adminMiddleware')
const { getCategoryById, getAllCategories, getAllCategoriesForAdmin, createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController')
const router = express.Router()

router.get('/get-category/:id', getCategoryById)
router.get('/get-all-categories', getAllCategories)
router.get('/get-all-categories-admin', authMiddleware, adminMiddleware, getAllCategoriesForAdmin)
router.post('/create-category', authMiddleware, adminMiddleware, createCategory)
router.put('/update-category/:id', authMiddleware, adminMiddleware, updateCategory)
router.delete('/delete-category/:id', authMiddleware, adminMiddleware, deleteCategory)

module.exports = router