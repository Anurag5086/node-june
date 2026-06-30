import api from './client'

export const register = (data) =>
  api.post('/api/auth/register', data)

export const verifyOtp = (data) =>
  api.post('/api/auth/verify-otp', data)

export const resendOtp = (email) =>
  api.post('/api/auth/resend-otp', { email })

export const login = (data) =>
  api.post('/api/auth/login', data)

export const forgotPassword = (email) =>
  api.post('/api/user/forget-password', { email })

export const verifyOtpForgetPassword = (data) =>
  api.post('/api/auth/verify-otp-forget-password', data)

export const resetPassword = (data) =>
  api.put('/api/user/reset-password', data)

export const getUser = () =>
  api.get('/api/user/get-user')

export const logout = () => {
  document.cookie = 'token=; Max-Age=0; path=/;'
}
