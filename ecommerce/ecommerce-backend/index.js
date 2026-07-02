const express = require('express')
const app = express()
const mongoose = require('mongoose')
require('dotenv').config()
const cors = require('cors')
const cookieParser = require('cookie-parser')
const authRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')
const categoryRoutes = require('./routes/categoryRoutes')
const productRoutes = require('./routes/productRoutes')
const orderRoutes = require('./routes/orderRoutes')
const paymentRoutes = require('./routes/paymentRoutes')
const assistantRoutes = require('./routes/assistantRoutes')

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}))
app.use(express.json())
app.use(cookieParser())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/category', categoryRoutes)
app.use('/api/product', productRoutes)
app.use('/api/order', orderRoutes)
app.use('/api/payment', paymentRoutes)
app.use('/api/assistant', assistantRoutes)

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("MongoDB connected!"))
    .catch((err) => console.log("Failed to connect to MongoDB", err))

app.listen(process.env.PORT, () => {
    console.log("Server is running at PORT: ", process.env.PORT)
})