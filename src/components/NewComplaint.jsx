import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Card from './Card'
import Input from './Input'
import Textarea from './Textarea'
import Select from './Select'
import Button from './Button'
import ErrorMessage from './ErrorMessage'
import SuccessMessage from './SuccessMessage'

const API_URL = 'http://localhost:5001'

const NewComplaint = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: [0, 0], // Default coordinates
    address: '',
    priority: '',
    evidence: []
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [evidenceInput, setEvidenceInput] = useState('')
  const [imageFiles, setImageFiles] = useState([])
  const [uploadingImages, setUploadingImages] = useState(false)
  const [formErrors, setFormErrors] = useState({})

  const categories = [
    { value: 'crime', label: 'Crime' },
    { value: 'accident', label: 'Accident' },
    { value: 'public-safety', label: 'Public Safety' },
    { value: 'infrastructure', label: 'Infrastructure' },
    { value: 'other', label: 'Other' }
  ]

  const priorities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' }
  ]

  const validateForm = () => {
    const errors = {}
    if (!formData.title.trim()) errors.title = 'Title is required'
    if (!formData.description.trim()) errors.description = 'Description is required'
    if (!formData.category) errors.category = 'Category is required'
    if (!formData.address.trim()) errors.address = 'Address is required'
    if (!formData.priority) errors.priority = 'Priority is required'
    return errors
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleEvidenceAdd = () => {
    if (evidenceInput.trim()) {
      if (!evidenceInput.startsWith('http://') && !evidenceInput.startsWith('https://')) {
        setError('Please enter a valid URL starting with http:// or https://')
        return
      }
      setFormData(prev => ({
        ...prev,
        evidence: [...prev.evidence, evidenceInput.trim()]
      }))
      setEvidenceInput('')
      setError('')
    }
  }

  const handleEvidenceRemove = (index) => {
    setFormData(prev => ({
      ...prev,
      evidence: prev.evidence.filter((_, i) => i !== index)
    }))
  }

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    setUploadingImages(true)
    
    try {
      const uploadedUrls = await Promise.all(
        files.map(async (file) => {
          const formData = new FormData()
          formData.append('image', file)
          
          const token = localStorage.getItem('token')
          const response = await axios.post(`${API_URL}/api/upload`, formData, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          })
          return response.data.url
        })
      )
      
      setFormData(prev => ({
        ...prev,
        evidence: [...prev.evidence, ...uploadedUrls]
      }))
    } catch (err) {
      setError('Failed to upload images')
    } finally {
      setUploadingImages(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    try {
      setLoading(true)
      setError('')
      const token = localStorage.getItem('token')
      const response = await axios.post(`${API_URL}/api/complaints`, {
        ...formData,
        priority: formData.priority
      }, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.data && response.data.message === 'Complaint submitted successfully') {
        setSuccess('Complaint submitted successfully')
        setTimeout(() => {
          navigate('/complaints')
        }, 2000)
      } else {
        setError('Failed to submit complaint')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit complaint')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Submit New Complaint</h1>

      {error && <ErrorMessage message={error} />}
      {success && <SuccessMessage message={success} />}

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter a descriptive title for your complaint"
            error={formErrors.title}
            required
          />

          <Textarea
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Provide detailed information about the issue"
            error={formErrors.description}
            required
          />

          <Select
            label="Category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            options={categories}
            error={formErrors.category}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter complete address (Building no., Street, Area, City, State, Pincode)"
              error={formErrors.address}
              required
            />

            <Select
              label="Priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              options={priorities}
              error={formErrors.priority}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Evidence
            </label>
            
            {/* Image Upload */}
            <div className="mb-4">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-amber-50 file:text-amber-700
                  hover:file:bg-amber-100"
              />
              {uploadingImages && (
                <p className="mt-2 text-sm text-amber-600">Uploading images...</p>
              )}
            </div>

            {/* URL Input */}
            <div className="flex space-x-2">
              <Input
                value={evidenceInput}
                onChange={(e) => setEvidenceInput(e.target.value)}
                placeholder="Or enter evidence URL (must start with http:// or https://)"
              />
              <Button
                type="button"
                onClick={handleEvidenceAdd}
                variant="secondary"
              >
                Add URL
              </Button>
            </div>

            {/* Display Evidence */}
            {formData.evidence.length > 0 && (
              <div className="mt-4 space-y-2">
                {formData.evidence.map((url, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    {url.startsWith('data:image') || url.endsWith('.jpg') || url.endsWith('.png') || url.endsWith('.jpeg') ? (
                      <div className="flex items-center space-x-2">
                        <img src={url} alt={`Evidence ${index + 1}`} className="h-10 w-10 object-cover rounded" />
                        <span className="text-sm text-gray-600">Image {index + 1}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-600 truncate">{url}</span>
                    )}
                    <Button
                      type="button"
                      onClick={() => handleEvidenceRemove(index)}
                      variant="danger"
                      size="sm"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/complaints')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Complaint'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

export default NewComplaint 