import React from 'react'

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-xl font-semibold">Complaint Management System</h3>
            <p className="text-gray-400 mt-2">© 2024 All rights reserved</p>
          </div>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-400 hover:text-white transition duration-300">
              About
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition duration-300">
              Contact
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition duration-300">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition duration-300">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer 