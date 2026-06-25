const User = require('../models/User')
const { generateOtp, generateOtpExpiry } = require('../utils/common')
const sendEmailForOtp = require('../utils/nodemailer')
const bcrypt = require('bcryptjs')

exports.getUser = async (req, res) => {
    try{
        const userId = req.user.userId

        const user = await User.findById(userId, {
            password: 0
        })

        if(!user){
            res.status(404).json({ success: false, message: 'User not found!' })
        }

        res.status(200).json({ success: true, message: "User fetched successfully!", user})
    }catch(err){
        res.status(500).json({ success: false, message: 'Internal Server Error!'})
    }
}

exports.getAllUsers = async (req, res) => {
    try{
        const users = await User.find({ role: 'user' }, { password: 0 })
        if(!users){
            res.status(404).json({ success: false, message: 'Users not found!' })
        }

        // const totalUsers = User.countDocuments({ role: 'user' })
        const totalUsers = users.length()

        res.status(200).json({ success: true, message: "Users fetched successfully!", users, totalUsers })
    }catch(err){
        res.status(500).json({ success: false, message: 'Internal Server Error!'})
    }
}

exports.updateUser = async (req, res) => {
    try{
        const userId = req.user.userId

        const { name, phoneNumber, address } = req.body

        const user = await User.findById(userId)
        if(!user){
            res.status(404).json({ success: false, message: "User not found!" })
        }

        // if(name !== undefined){
        //     user.name = name
        // }

        // if(phoneNumber !== undefined){
        //     user.phoneNumber = phoneNumber
        // }

        // if(address !== undefined){
        //     user.address = address
        // }

        // await user.save()

        const updatedUser = await User.findByIdAndUpdate(userId, { name, phoneNumber, address}, { new: true })

        res.status(200).json({ success: false, message: "User updated successfully!", updatedUser})
    }catch(err){
        res.status(500).json({ success: false, message: 'Internal Server Error!'})
    }
}

exports.deleteUser = async (req, res) => {
    try{
        const userId = req.user.userId

        const user = await User.findById(userId)
        if(!user){
            res.status(404).json({ success: false, message: "User not found!" })
        }

        await User.findByIdAndDelete(userId)

        res.status(200).json({ success: true, message: 'User deleted successfully!' })
    }catch(err){
        res.status(500).json({ success: false, message: 'Internal Server Error!'})
    }
}

exports.forgetPassword = async (req, res) => {
    try{
        const { email } = req.body

        const user = await User.findOne({ email })
        if(!user){
           res.status(404).json({ success: false, message: "User not found!" }) 
        }

        const resetPasswordOtp = generateOtp()
        const resetPasswordOtpExpiry = generateOtpExpiry()

        user.resetPasswordOtp = resetPasswordOtp
        user.resetPasswordOtpExpiry = resetPasswordOtpExpiry

        await user.save()

        const isMailSent = await sendEmailForOtp(email, resetPasswordOtp)

        if(!isMailSent){
            res.status(500).json({ success: false, message: "Failed to send OTP email. Check server mail config!"})
        }

        res.status(200).json({ success: true, message: "OTP for Forget Password sent successfully!" })
    }catch(err){
        res.status(500).json({ success: false, message: 'Internal Server Error!'})
    }
}

exports.resetPassword = async (req, res) => {
    try{
        const userId = req.user.userId
        const { newPassword, confirmPassword } = req.body

        const user = await User.findById(userId)
        if(!user){
            res.status(404).json({ success: false, message: "User not found!" })
        }

        if(newPassword !== confirmPassword){
            res.status(400).json({ success: false, message: "Password not matched!"})
        }

        const hashedPassword = await bcrypt.hash(newPassword, parseInt(process.env.SALTS))

        
        const updatedUser = await User.findByIdAndUpdate(userId, { password: hashedPassword })

        res.status(200).json({ success: true, message: "Password reset successfully!" })
    }catch(err){
        res.status(500).json({ success: false, message: 'Internal Server Error!'})
    }
}