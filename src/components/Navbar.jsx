import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-amber-100 shadow-md">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="flex justify-between h-20">
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0">
              <NavLink to="/" className="text-2xl font-bold text-amber-800 hover:text-amber-900 transition-colors">
                SevaAlert
              </NavLink>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-amber-200 text-amber-900'
                      : 'text-amber-700 hover:bg-amber-50 hover:text-amber-900'
                  }`
                }
              >
                Home
              </NavLink>
              <NavLink
                to="/complaints"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-amber-200 text-amber-900'
                      : 'text-amber-700 hover:bg-amber-50 hover:text-amber-900'
                  }`
                }
              >
                Complaints
              </NavLink>
              <NavLink
                to="/resolved-complaints"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-amber-200 text-amber-900'
                      : 'text-amber-700 hover:bg-amber-50 hover:text-amber-900'
                  }`
                }
              >
                Resolved Complaints
              </NavLink>
              {user && (
                <NavLink
                  to="/profile"
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-amber-200 text-amber-900'
                        : 'text-amber-700 hover:bg-amber-50 hover:text-amber-900'
                    }`
                  }
                >
                  Profile
                </NavLink>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-amber-800 font-medium">Welcome, {user.username}</span>
                <button
                  onClick={handleLogout}
                  className="bg-amber-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-amber-700 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex space-x-4">
                <NavLink
                  to="/login"
                  className="bg-amber-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-amber-700 transition-colors"
                >
                  Login
                </NavLink>
                <NavLink
                  to="/register"
                  className="bg-white text-amber-600 px-4 py-2 rounded-md text-sm font-medium border border-amber-600 hover:bg-amber-50 transition-colors"
                >
                  Register
                </NavLink>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
