import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, Lock, MapPin, Package, User as UserIcon } from 'lucide-react'
import StoreHeader from '../components/layout/StoreHeader'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import Alert from '../components/ui/Alert'
import { useAuth } from '../context/AuthContext'
import { resetPassword } from '../api/auth'
import { updateUser } from '../api/user'

export default function Profile() {
  const { user, refreshUser, logout } = useAuth()
  const [name, setName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [address, setAddress] = useState('')
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileMessage, setProfileMessage] = useState('')
  const [profileError, setProfileError] = useState('')

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState('')
  const [passwordError, setPasswordError] = useState('')

  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setPhoneNumber(user.phoneNumber || '')
      setAddress(user.address || '')
    }
  }, [user])

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setProfileError('')
    setProfileMessage('')

    if (!name.trim()) {
      setProfileError('Name is required.')
      return
    }

    setProfileLoading(true)
    try {
      await updateUser({
        name: name.trim(),
        phoneNumber: phoneNumber.trim() || undefined,
        address: address.trim() || undefined,
      })
      await refreshUser()
      setProfileMessage('Profile updated successfully.')
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setProfileLoading(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordMessage('')

    if (!newPassword || !confirmPassword) {
      setPasswordError('Please fill in all password fields.')
      return
    }

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters.')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.')
      return
    }

    setPasswordLoading(true)
    try {
      await resetPassword({ newPassword, confirmPassword })
      setNewPassword('')
      setConfirmPassword('')
      setPasswordMessage('Password changed successfully. Please sign in again.')
      setTimeout(() => logout(), 2000)
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to reset password')
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <div className="min-h-svh bg-gray-50">
      <StoreHeader />

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">My Profile</h1>
        <p className="mt-1 text-gray-500">Manage your account details and security</p>

        <Link
          to="/my-orders"
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          <Package className="h-4 w-4" />
          View my orders
        </Link>

        <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-2xl font-bold text-primary-700">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{user?.name}</h2>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <UserIcon className="h-4 w-4 text-primary-600" />
              Profile Information
            </div>

            {profileMessage && <Alert type="success" message={profileMessage} />}
            {profileError && <Alert message={profileError} />}

            <Input
              label="Full name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Input
              label="Email address"
              name="email"
              value={user?.email || ''}
              disabled
              className="cursor-not-allowed bg-gray-50 text-gray-500"
            />

            <Input
              label="Phone number"
              name="phoneNumber"
              type="tel"
              placeholder="10-digit mobile number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
            />

            <div>
              <label
                htmlFor="address"
                className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700"
              >
                <MapPin className="h-3.5 w-3.5" />
                Address
              </label>
              <textarea
                id="address"
                name="address"
                rows={3}
                placeholder="House no., street, city, state, pincode"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>

            <Button type="submit" loading={profileLoading}>
              Save Changes
            </Button>
          </form>
        </section>

        <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <form onSubmit={handlePasswordSubmit} className="space-y-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <Lock className="h-4 w-4 text-primary-600" />
              Change Password
            </div>

            {passwordMessage && <Alert type="success" message={passwordMessage} />}
            {passwordError && <Alert message={passwordError} />}

            <div className="relative">
              <Input
                label="New password"
                type={showPassword ? 'text' : 'password'}
                name="newPassword"
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            <Input
              label="Confirm new password"
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />

            <Button type="submit" variant="secondary" loading={passwordLoading}>
              <Lock className="h-4 w-4" />
              Update Password
            </Button>
          </form>
        </section>
      </main>
    </div>
  )
}
