const User = require('../models/User')
const joi = require('joi')
const bcrypt = require('bcryptjs')
const jwt = require("jsonwebtoken")

exports.registerUser = async (req, res) => {
    try{
        const { name, password, email } = req.body

        const schema = joi.object({
            name: joi.string().min(2).max(50).required(),
            email: joi.string().email().required(),
            password: joi.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/).required()  // Min 8 chars, 1 upper case letter 1 lower case letter, 1 number, 1 special character
        });

        const { error } = schema.validate({ name, email, password })
        if(error){
            res.status(400).json({ success: false, message: "Invalid input!", error: error.message })
        }

        const hashedPassword = bcrypt.hashSync(password, parseInt(process.env.BCRYPT_SALTS))

        const newUser = new User({
            name,
            email,
            password: hashedPassword
        })

        await newUser.save()

        res.status(201).json({ success: true, message: "User created successfully!" })

    }catch(err){
        res.status(500).json({ success: false, message: "Internal Server Error!", error: err.message})
    }
}

exports.loginUser = async (req, res) => {
    try{
        const { email, password } = req.body

         const schema = joi.object({
            email: joi.string().email().required(),
            password: joi.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/).required()  // Min 8 chars, 1 upper case letter 1 lower case letter, 1 number, 1 special character
        });

        const { error } = schema.validate({ email, password })
        if(error){
            res.status(400).json({ success: false, message: "Invalid input!", error: error.message })
        }

        const user = await User.findOne({ email })
        if(!user){
            res.stauts(404).json({ success: false, message: "User not found, please register!"})
        }

        const isMatch = bcrypt.compareSync(password, user.password)
        if(!isMatch){
            res.status(400).json({ success: false, message: "Incorrect Password! "})
        }

        const token = jwt.sign({
            userId: user._id,
            role: user.role
        }, process.env.JWT_SECRET, { expiresIn: '1d' })

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 24 * 60 * 60 * 1000,
            sameSite: "lax"
        }).status(200).json({ success: true, message: "Logged In Successfully!" })

    }catch(err){
        res.status(500).json({ success: false, message: "Internal Server Error!", error: err.message})
    }
}

exports.getAllUsers = async (req, res) => {
    try{
        const page = parseInt(req.query.page) || 1
        const limitValue = 5
        const skipValue = (page - 1) * limitValue

        const totalUsers = await User.countDocuments()
        const totalPages = Math.ceil(totalUsers/limitValue)

        if(page > totalPages){
            res.status(404).json({ success: false, message: "Page not found!"})
        }

        const users = await User.find().limit(limitValue).skip(skipValue)

        res.status(200).json({ success: true, message: "Users fetched successfully!", users, totalPages, currentPage: page })
    }catch(err){
        res.status(500).json({ success: false, message: "Internal Server Error!", error: err.message})
    }
}