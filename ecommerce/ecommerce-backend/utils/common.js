const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString() // 899999 + 100000 = 999999
}

const generateOtpExpiry = () => {
    return new Date(Date.now() + 15 * 60 * 1000)
}

/** Cross-origin frontend/backend (e.g. separate Render URLs) need SameSite=None + Secure. */
const getAuthCookieOptions = () => {
    const crossSite =
        process.env.NODE_ENV === 'production' ||
        (process.env.FRONTEND_URL || '').startsWith('https://')

    return {
        httpOnly: true,
        secure: crossSite,
        sameSite: crossSite ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    }
}

module.exports = {
    generateOtp,
    generateOtpExpiry,
    getAuthCookieOptions,
}