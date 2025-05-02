import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Home = () => {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-500 to-purple-600">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-8">
            Welcome to Complaint Management System
          </h1>
          <p className="text-xl text-white mb-12">
            A modern platform for managing and tracking complaints efficiently
          </p>
          {user ? (
            <Link
              to="/complaints"
              className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition duration-300"
            >
              View Complaints
            </Link>
          ) : (
            <div className="space-x-4">
              <Link
                to="/login"
                className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition duration-300"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-indigo-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-800 transition duration-300"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Home
