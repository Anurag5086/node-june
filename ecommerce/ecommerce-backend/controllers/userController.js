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
            return res.status(404).json({ success: false, message: 'User not found!' })
        }

        return res.status(200).json({ success: true, message: "User fetched successfully!", user})
    }catch(err){
        return res.status(500).json({ success: false, message: 'Internal Server Error!'})
    }
}

exports.getAllUsers = async (req, res) => {
    try{
        const users = await User.find({ role: 'user' }, { password: 0 })
        if(!users){
            res.status(404).json({ success: false, message: 'Users not found!' })
        }

        // const totalUsers = User.countDocuments({ role: 'user' })
        const totalUsers = users.length

        return res.status(200).json({ success: true, message: "Users fetched successfully!", users, totalUsers })
    }catch(err){
        return res.status(500).json({ success: false, message: 'Internal Server Error!'})
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

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { name, phoneNumber, address },
            { new: true, select: '-password' },
        )

        return res.status(200).json({ success: true, message: 'User updated successfully!', user: updatedUser })
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

        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required!" })
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() })
        if(!user){
           return res.status(404).json({ success: false, message: "User not found!" })
        }

        const resetPasswordOtp = generateOtp()
        const resetPasswordOtpExpiry = generateOtpExpiry()

        user.resetPasswordOtp = resetPasswordOtp
        user.resetPasswordOtpExpiry = resetPasswordOtpExpiry

        await user.save()

        const isMailSent = await sendEmailForOtp(user.email, resetPasswordOtp)

        if(!isMailSent){
            return res.status(500).json({ success: false, message: "Failed to send OTP email. Check server mail config!"})
        }

        return res.status(200).json({ success: true, message: "OTP for Forget Password sent successfully!" })
    }catch(err){
        return res.status(500).json({ success: false, message: 'Internal Server Error!'})
    }
}

exports.resetPassword = async (req, res) => {
    try{
        const userId = req.user.userId
        const { newPassword, confirmPassword } = req.body

        if (!newPassword || !confirmPassword) {
            return res.status(400).json({ success: false, message: "Both password fields are required!" })
        }

        const user = await User.findById(userId)
        if(!user){
            return res.status(404).json({ success: false, message: "User not found!" })
        }

        if(newPassword !== confirmPassword){
            return res.status(400).json({ success: false, message: "Password not matched!"})
        }

        const hashedPassword = await bcrypt.hash(newPassword, parseInt(process.env.SALTS))

        await User.findByIdAndUpdate(userId, { password: hashedPassword })

        return res.status(200).json({ success: true, message: "Password reset successfully!" })
    }catch(err){
        return res.status(500).json({ success: false, message: 'Internal Server Error!'})
    }
}