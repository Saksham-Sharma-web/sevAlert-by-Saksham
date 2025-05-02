import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Card from './Card'
import Button from './Button'
import LoadingSpinner from './LoadingSpinner'
import ErrorMessage from './ErrorMessage'
import SuccessMessage from './SuccessMessage'

const API_URL = 'http://localhost:5001'

const ComplaintDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [complaint, setComplaint] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [comment, setComment] = useState('')
  const [status, setStatus] = useState('')

  useEffect(() => {
    fetchComplaint()
  }, [id])

  const fetchComplaint = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/api/complaints/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setComplaint(response.data)
      setStatus(response.data.status)
    } catch (err) {
      setError('Failed to fetch complaint details')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async () => {
    try {
      setError('')
      const token = localStorage.getItem('token')
      await axios.patch(`${API_URL}/api/complaints/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSuccess('Status updated successfully')
      fetchComplaint()
    } catch (err) {
      setError('Failed to update status')
    }
  }

  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    try {
      setError('')
      const token = localStorage.getItem('token')
      await axios.post(`${API_URL}/api/complaints/${id}/comments`, { text: comment }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setComment('')
      setSuccess('Comment added successfully')
      fetchComplaint()
    } catch (err) {
      setError('Failed to add comment')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'in-progress':
        return 'bg-blue-100 text-blue-800'
      case 'resolved':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) return <LoadingSpinner size="lg" />

  if (!complaint) return <ErrorMessage message="Complaint not found" />

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Complaint Details</h1>
        <Button variant="secondary" onClick={() => navigate('/complaints')}>
          Back to Complaints
        </Button>
      </div>

      {error && <ErrorMessage message={error} />}
      {success && <SuccessMessage message={success} />}

      <Card>
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">{complaint.title}</h2>
              <p className="text-gray-500 mt-1">
                Created on {formatDate(complaint.createdAt)}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="border rounded-md px-3 py-2"
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
              <Button onClick={handleStatusUpdate}>Update Status</Button>
            </div>
          </div>

          {/* Status and Priority Badges */}
          <div className="flex space-x-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(complaint.status)}`}>
              {complaint.status}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(complaint.priority)}`}>
              {complaint.priority} Priority
            </span>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Description</h3>
                <p className="mt-2 text-gray-600 whitespace-pre-wrap">{complaint.description}</p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900">Category</h3>
                <p className="mt-2 text-gray-600 capitalize">{complaint.category}</p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900">Address</h3>
                <p className="mt-2 text-gray-600">{complaint.address}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Location</h3>
                <p className="mt-2 text-gray-600">
                  Latitude: {complaint.location[0]}, Longitude: {complaint.location[1]}
                </p>
              </div>

              {complaint.evidence && complaint.evidence.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Evidence</h3>
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {complaint.evidence.map((url, index) => (
                      <div key={index} className="relative group">
                        {url.startsWith('/uploads/') || url.endsWith('.jpg') || url.endsWith('.png') || url.endsWith('.jpeg') ? (
                          <div className="border rounded-lg overflow-hidden">
                            <img 
                              src={`${API_URL}${url}`} 
                              alt={`Evidence ${index + 1}`} 
                              className="w-full h-48 object-cover"
                            />
                            <div className="p-2 bg-gray-50">
                              <p className="text-sm text-gray-600">Image {index + 1}</p>
                            </div>
                          </div>
                        ) : (
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block p-4 border rounded-lg hover:bg-gray-50"
                          >
                            <p className="text-indigo-600 hover:text-indigo-800 truncate">
                              Evidence URL #{index + 1}
                            </p>
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {complaint.comments && complaint.comments.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Comments</h3>
                  <div className="mt-2 space-y-4">
                    {complaint.comments.map((comment, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-600">{comment.text}</p>
                        <p className="text-sm text-gray-500 mt-2">
                          By {comment.user?.username || 'Unknown'} on {formatDate(comment.createdAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Add Comment Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add Comment</h3>
            <form onSubmit={handleCommentSubmit} className="space-y-4">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows="3"
                placeholder="Enter your comment..."
              />
              <Button type="submit">Add Comment</Button>
            </form>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default ComplaintDetails 