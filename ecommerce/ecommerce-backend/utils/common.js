const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString() // 899999 + 100000 = 999999
}

const generateOtpExpiry = () => {
    return new Date(Date.now() + 15 * 60 * 1000)
}

module.exports = {
    generateOtp,
    generateOtpExpiry
}