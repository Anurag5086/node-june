const express = require('express')
const { connectMongoDB } = require('./config/db')
const app = express()
require('dotenv').config()
const userRoutes = require('./routes/userRoutes')

app.use(express.json())
connectMongoDB()

app.use('/api/auth', userRoutes)

app.listen(process.env.PORT, () => {
    console.log("Server is running at port: ", process.env.PORT)
})