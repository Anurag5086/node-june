const mongoose = require('mongoose')

const fileSchema = new mongoose.Schema({
    title: {
        type: String, 
        required: true,
        minlength: 3,
        maxlength: 200,
        trim: true
    },
    description: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 500,
        trim: true
    },
    filePath: {
        type: String,
        required: true
    }
}, { timestamps: true })

module.exports = mongoose.model('File', fileSchema, "files")