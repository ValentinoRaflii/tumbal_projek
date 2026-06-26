import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Web3Provider } from './context/Web3Context'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Campaigns from './pages/Campaigns'
import CampaignDetail from './pages/CampaignDetail'
import Dashboard from './pages/Dashboard'
import AdminPanel from './pages/AdminPanel'
import Login from './pages/Login'
import Register from './pages/Register'

function App() {
  return (
    <Web3Provider>
      <AuthProvider>
        <Router>
          <Navbar />
          <Toaster position="top-right" />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/campaigns" element={<Campaigns />} />
            <Route path="/campaign/:id" element={<CampaignDetail />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </AuthProvider>
    </Web3Provider>
  )
}

export default App