import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/layout/AuthLayout'
import OtpInput from '../components/ui/OtpInput'
import Button from '../components/ui/Button'
import Alert from '../components/ui/Alert'
import { forgotPassword, verifyOtpForgetPassword } from '../api/auth'
import { useAuth } from '../context/AuthContext'

const RESEND_COOLDOWN = 60

export default function VerifyOtpForgotPassword() {
  const navigate = useNavigate()
  const location = useLocation()
  const { refreshUser } = useAuth()
  const email = location.state?.email || ''

  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (!email) navigate('/forgot-password', { replace: true })
  }, [email, navigate])

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (otp.length !== 6) {
      setError('Please enter the 6-digit OTP.')
      return
    }

    setLoading(true)
    try {
      await verifyOtpForgetPassword({ email: email.trim().toLowerCase(), otp })
      await refreshUser()
      navigate('/reset-password', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (cooldown > 0) return
    setError('')
    setSuccess('')
    setResendLoading(true)
    try {
      await forgotPassword(email)
      setSuccess('A new OTP has been sent to your email.')
      setCooldown(RESEND_COOLDOWN)
      setOtp('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend OTP')
    } finally {
      setResendLoading(false)
    }
  }

  if (!email) return null

  return (
    <AuthLayout
      title="Verify your identity"
      subtitle={`Enter the code sent to ${email}`}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <Alert message={error} />}
        {success && <Alert type="success" message={success} />}

        <OtpInput value={otp} onChange={setOtp} />

        <Button type="submit" fullWidth loading={loading} disabled={otp.length !== 6}>
          Verify code
        </Button>

        <div className="text-center">
          <p className="text-sm text-gray-500">
            Didn&apos;t receive the code?{' '}
            <button
              type="button"
              onClick={handleResend}
              disabled={cooldown > 0 || resendLoading}
              className="font-semibold text-primary-600 hover:text-primary-700 disabled:cursor-not-allowed disabled:text-gray-400"
            >
              {resendLoading
                ? 'Sending...'
                : cooldown > 0
                  ? `Resend in ${cooldown}s`
                  : 'Resend OTP'}
            </button>
          </p>
        </div>

        <p className="text-center text-sm text-gray-500">
          <Link
            to="/login"
            className="font-semibold text-primary-600 hover:text-primary-700"
          >
            Back to sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
