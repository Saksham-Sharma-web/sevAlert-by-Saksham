import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import Card from './Card'
import Table from './Table'
import Pagination from './Pagination'
import SearchInput from './SearchInput'
import LoadingSpinner from './LoadingSpinner'
import ErrorMessage from './ErrorMessage'
import Button from './Button'

const API_URL = 'http://localhost:5001'

const Complaints = () => {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')

  useEffect(() => {
    fetchComplaints()
  }, [currentPage, searchTerm, selectedCategory, selectedStatus])

  const fetchComplaints = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Get token from localStorage
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Please login to view complaints')
        setLoading(false)
        return
      }

      // Get user data to verify token
      const userData = localStorage.getItem('user')
      if (!userData) {
        setError('Please login to view complaints')
        setLoading(false)
        return
      }

      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage,
        search: searchTerm || '',
        category: selectedCategory,
        status: selectedStatus === 'all' ? 'pending,in_process' : selectedStatus
      })

      const response = await axios.get(
        `${API_URL}/api/complaints?${params.toString()}`,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.data) {
        setComplaints(response.data.complaints || [])
        setTotalPages(response.data.totalPages || 1)
      } else {
        setComplaints([])
        setTotalPages(1)
      }
    } catch (err) {
      if (err.response?.status === 401) {
        // Clear auth data and redirect to login
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setError('Session expired. Please login again.')
        window.location.href = '/login'
      } else {
        setError(err.response?.data?.message || 'Failed to fetch complaints')
      }
      setComplaints([])
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (value) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
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

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'crime', label: 'Crime' },
    { value: 'accident', label: 'Accident' },
    { value: 'public-safety', label: 'Public Safety' },
    { value: 'infrastructure', label: 'Infrastructure' },
    { value: 'other', label: 'Other' }
  ]

  const statuses = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' }
  ]

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Complaints</h1>
        <Link to="/complaints/new">
          <Button variant="primary">New Complaint</Button>
        </Link>
      </div>

      {error && <ErrorMessage message={error} />}

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <SearchInput
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search complaints..."
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            {statuses.map(status => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          {complaints.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No complaints found
            </div>
          ) : (
            <Table
              headers={[
                { key: 'title', label: 'Title' },
                { key: 'category', label: 'Category' },
                { key: 'priority', label: 'Priority' },
                { key: 'status', label: 'Status' },
                { key: 'createdAt', label: 'Created' },
                { key: 'actions', label: 'Actions' }
              ]}
              data={complaints.map(complaint => ({
                title: (
                  <div>
                    <div className="font-medium text-gray-900">{complaint.title}</div>
                    <div className="text-sm text-gray-500">{complaint.address}</div>
                    {complaint.evidence && complaint.evidence.length > 0 && (
                      <div className="text-xs text-indigo-600 mt-1">
                        {complaint.evidence.length} evidence attached
                      </div>
                    )}
                  </div>
                ),
                category: (
                  <span className="capitalize">{complaint.category}</span>
                ),
                priority: (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(complaint.priority)}`}>
                    {complaint.priority}
                  </span>
                ),
                status: (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
                    {complaint.status}
                  </span>
                ),
                createdAt: formatDate(complaint.createdAt),
                actions: (
                  <Link to={`/complaints/${complaint._id}`}>
                    <Button variant="secondary" size="sm">View Details</Button>
                  </Link>
                )
              }))}
            />
          )}
        </div>

        {totalPages > 1 && (
          <div className="mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </Card>
    </div>
  )
}

export default Complaints 