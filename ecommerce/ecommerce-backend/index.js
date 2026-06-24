const express = require('express')
const app = express()
const mongoose = require('mongoose')
require('dotenv').config()
const cors = require('cors')

app.use(express.json())

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("MongoDB connected!"))
    .catch((err) => console.log("Failed to connect to MongoDB", err))

app.listen(process.env.PORT, () => {
    console.log("Server is running at PORT: ", process.env.PORT)
})