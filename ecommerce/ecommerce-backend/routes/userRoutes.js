const express = require('express')
const authMiddleware = require('../middlewares/authMiddleware')
const adminMiddleware = require('../middlewares/adminMiddleware')
const { forgetPassword, resetPassword, getUser, getAllUsers, updateUser, deleteUser } = require('../controllers/userController')
const router = express.Router()

router.get('/get-user', authMiddleware, getUser)
router.get('/get-all-users', authMiddleware, adminMiddleware, getAllUsers)
router.put('/update-user', authMiddleware, updateUser)
router.delete('/delete-user', authMiddleware, deleteUser)

router.post('/forget-password', forgetPassword)
router.put('/reset-password', authMiddleware, resetPassword)

module.exports = router