const File = require('../models/File')
const joi = require('joi')
const path = require('path')

exports.uploadFile = async (req, res) => {
    try{
        if(!req.file){
            res.stauts(400).json({ success: false, message: "No File Uploaded!"})
        }

        const { title, description } = req.body

        const schema = joi.object({
            title: joi.string().min(3).max(200).required(),
            description: joi.string().min(3).max(500).required()
        })

        const { error } = schema.validate({ title, description })
        if(error){
            res.stauts(400).json({ success: false, message: "Failed to validate the data!", error: error.message})
        }

        const fileData = new File({
            title,
            description,
            filePath: req.file.path
        })

        await fileData.save()

        const filename = path.basename(req.file.path)
        const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${filename}`

        res.status(201).json({
            success: true,
            message: "File uploaded successfully!",
            file: fileData,
            imageUrl
        })
    }catch(err){
        res.status(500).json({ success: false, message: "Internal Server Error!", error: err})
    }
}