import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './components/Home'
import Login from './components/Login'
import Register from './components/Register'
import Complaints from './components/Complaints'
import NewComplaint from './components/NewComplaint'
import ComplaintDetails from './components/ComplaintDetails'
import Profile from './components/Profile'
import ProtectedRoute from './components/ProtectedRoute'
import Footer from './components/Footer'
import { AuthProvider } from './context/AuthContext'
import ResolvedComplaints from './components/ResolvedComplaints'

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-amber-50 flex flex-col">
          <Navbar />
          <div className="flex-grow container mx-auto px-4 py-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-amber-800 mb-3">SevaAlert</h2>
              <p className="text-2xl text-amber-600 font-medium">Turning Red Alerts into Green Solutions</p>
            </div>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/complaints"
                element={
                  <ProtectedRoute>
                    <Complaints />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/complaints/new"
                element={
                  <ProtectedRoute>
                    <NewComplaint />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/complaints/:id"
                element={
                  <ProtectedRoute>
                    <ComplaintDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route path="/resolved-complaints" element={<ResolvedComplaints />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
