const express = require('express')
const app = express()
const mongoose = require('mongoose')
require('dotenv').config()
const cors = require('cors')
const fileRoutes = require('./routes/fileRoutes')

app.use(cors({
    origin: ['https://file-uploader-blush.vercel.app']
}))

app.use('/api/file', fileRoutes)
app.use('/uploads', express.static('uploads'))

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("MongoDB Connected!"))
    .catch((err) => console.log("Failed to connect to MongoDB", err))

app.listen(process.env.PORT, () => {
    console.log("Server running at PORT: ", process.env.PORT)
})