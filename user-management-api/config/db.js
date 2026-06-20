const mongoose = require('mongoose')

exports.connectMongoDB = async () => {
    try{
        await mongoose.connect(process.env.MONGODB_URI)
        console.log("MongoDB Connected!")
    }catch(err){
        console.log("Failed to connect to DB.", err)
    }
}