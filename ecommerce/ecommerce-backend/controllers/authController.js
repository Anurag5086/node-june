const User = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { userRegistrationSchema, userLoginSchema, verifyOtpSchema, resendOtpSchema } = require('../utils/validators')
const { generateOtp, generateOtpExpiry, getAuthCookieOptions } = require('../utils/common')
const sendEmailForOtp = require('../utils/nodemailer')

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

        const hashedPassword = await bcrypt.hash(password, parseInt(process.env.SALTS))

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            otp,
            otpExpiry
        })

        await newUser.save()

        const isMailSent = await sendEmailForOtp(email, otp)

        if(!isMailSent){
            res.status(500).json({ success: false, message: "Failed to send OTP email. Check server mail config!"})
        }

        res.status(201).json({ success: true, message: "User registered successfully!"})
    }catch(err){
        res.status(500).json({ success: false, message: "Internal Server Error!", error: err})
    }
}

exports.verifyOtp = async (req, res) => {
    try{
        const { email, otp } = req.body
        
        const { error } = verifyOtpSchema.validate({ email, otp })
        if(error){
            res.status(400).json({ success: false, message: "Invalid Input!", error: error.details[0].message })
        }

        const user = await User.findOne({ email })
        if(!user){
            res.status(404).json({ success: false, message: "Email not found!" })
        }

        if(user.otp !== otp || user.otpExpiry < new Date()){
            res.status(400).json({ success: false, message: "Invalid or expired OTP!"})
        }

        user.isVerified = true
        user.otp = undefined
        user.otpExpiry = undefined

        await user.save()

        const token = jwt.sign({
            userId: user._id,
            role: user.role
        }, process.env.JWT_SECRET,
        { expiresIn: '7d'})

        res.cookie("token", token, getAuthCookieOptions())
            .status(200).json({ success: true, message: "Logged in successfully!"})
    }catch(err){
        res.status(500).json({ success: false, message: "Internal Server Error!", error: err})
    }
}

exports.verifyOtpForForgetPassword = async (req, res) => {
    try{
        const { email, otp } = req.body
        
        const { error } = verifyOtpSchema.validate({ email, otp })
        if(error){
            return res.status(400).json({ success: false, message: "Invalid Input!", error: error.details[0].message })
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() })
        if(!user){
            return res.status(404).json({ success: false, message: "Email not found!" })
        }

        if(user.resetPasswordOtp !== otp || user.resetPasswordOtpExpiry < new Date()){
            return res.status(400).json({ success: false, message: "Invalid or expired OTP!"})
        }

        user.resetPasswordOtp = undefined
        user.resetPasswordOtpExpiry = undefined

        await user.save()

        const token = jwt.sign({
            userId: user._id,
            role: user.role
        }, process.env.JWT_SECRET,
        { expiresIn: '7d'})

        return res.cookie("token", token, getAuthCookieOptions())
            .status(200).json({ success: true, message: "OTP verified successfully!"})
    }catch(err){
        return res.status(500).json({ success: false, message: "Internal Server Error!", error: err})
    }
}

exports.resendOtp = async (req, res) => {
    try{
        const { email } = req.body

        const { error } = resendOtpSchema.validate({ email })
        if(error){
            res.status(400).json({ success: false, message: "Invalid Input!", error: error.details[0].message })
        }

        const user = await User.findOne({ email })
        if(!user){
            res.status(404).json({ success: false, message: "Email not found!" })
        }

        const otp = generateOtp()
        const otpExpiry = generateOtpExpiry()

        user.otp = otp
        user.otpExpiry = otpExpiry
        await user.save()

        const isMailSent = await sendEmailForOtp(email, otp)

        if(!isMailSent){
            res.status(500).json({ success: false, message: "Failed to send OTP email. Check server mail config!"})
        }

        res.status(200).json({ success: true, message: "OTP resent successfully!" })
    }catch(err){
        res.status(500).json({ success: false, message: "Internal Server Error!", error: err})
    }
}

exports.loginUser = async (req, res) => {
    try{
        const { email, password } = req.body

        const { error } = userLoginSchema.validate({ email, password })
        if(error){
            res.status(400).json({ success: false, message: "Invalid Input!", error: error.details[0].message })
        }

        const user = await User.findOne({ email })
        if(!user){
            res.status(404).json({ success: false, message: "Email not found!" })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch){
            res.status(400).json({ success: false, message: "Incorrect Password!"})
        }

        if(user.isVerified){
            const token = jwt.sign({
                userId: user._id,
                role: user.role
            }, process.env.JWT_SECRET,
            { expiresIn: '7d'})

            return res.cookie("token", token, getAuthCookieOptions())
                .status(200).json({ success: true, message: "Logged in successfully!"})
        }

        res.status(200).json({ success: true, message: "Login successful, but email is not verified!", token: null, isVerified: user.isVerified })
    }catch(err){
        res.status(500).json({ success: false, message: "Internal Server Error!", error: err})
    }
}