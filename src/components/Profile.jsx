import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import Card from './Card'
import Input from './Input'
import Button from './Button'
import LoadingSpinner from './LoadingSpinner'
import ErrorMessage from './ErrorMessage'
import SuccessMessage from './SuccessMessage'

const API_URL = 'http://localhost:5001'

const Profile = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    phone: '',
    address: ''
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (user) {
      setProfile({
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || ''
      })
      setLoading(false)
    }
  }, [user])

  const handleChange = (e) => {
    const { name, value } = e.target
    setProfile(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setError('')
      setLoading(true)
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Please login to update profile')
        return
      }

      const response = await axios.put(
        `${API_URL}/api/auth/profile`,
        {
          profile: {
            phone: profile.phone,
            address: profile.address
          }
        },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      // Update local storage with new user data
      const updatedUser = { 
        ...user, 
        profile: {
          ...user.profile,
          phone: profile.phone,
          address: profile.address
        }
      }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      
      setSuccess('Profile updated successfully')
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.')
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      } else {
        setError(err.response?.data?.message || 'Failed to update profile')
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSpinner size="lg" />

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile</h1>

      {error && <ErrorMessage message={error} />}
      {success && <SuccessMessage message={success} />}

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Username"
            name="username"
            value={profile.username}
            onChange={handleChange}
            required
          />

          <Input
            label="Email"
            name="email"
            type="email"
            value={profile.email}
            onChange={handleChange}
            required
          />

          <Input
            label="Phone"
            name="phone"
            value={profile.phone}
            onChange={handleChange}
          />

          <Input
            label="Address"
            name="address"
            value={profile.address}
            onChange={handleChange}
          />

          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

export default Profile 