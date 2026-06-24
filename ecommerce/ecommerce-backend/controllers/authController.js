const User = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { userRegistrationSchema } = require('../utils/validators')
const { generateOtp, generateOtpExpiry } = require('../utils/common')

exports.registerUser = async (req, res) => {
    try{
        const { name, email, password } = req.body

        const { error } = userRegistrationSchema.validate({ name, email, password })
        if(error){
            res.status(400).json({ success: false, message: "Invalid Input!", error: error.details[0].message })
        }

        const existingUser = await User.findOne({ email })
        if(existingUser){
            res.status(400).json({ success: false, message: "User already exists!"})
        }

        const otp = generateOtp()
        const otpExpiry = generateOtpExpiry()

        const hashedPassword = await bcrypt.hash(password, process.env.SALTS)

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            otp,
            otpExpiry
        })

        await newUser.save()

        // await sendEmailForOtp(email, otp)

        res.status(201).json({ success: true, message: "User registered successfully!"})
    }catch(err){
        res.status(500).json({ success: false, message: "Internal Server Error!", error: err})
    }
}