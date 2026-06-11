import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  axios.defaults.baseURL = 'http://localhost:5000/api'

  const login = async (email, password) => {
    try {
      const response = await axios.post('/auth/login', { email, password })
      const { token, user } = response.data
      localStorage.setItem('token', token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setToken(token)
      setUser(user)
      toast.success('Login successful!')
      return true
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed')
      return false
    }
  }

  const register = async (userData) => {
    try {
      const response = await axios.post('/auth/register', userData)
      const { token, user } = response.data
      localStorage.setItem('token', token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setToken(token)
      setUser(user)
      toast.success('Registration successful!')
      return true
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed')
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
    setToken(null)
    setUser(null)
    toast.success('Logged out')
  }

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      axios.get('/auth/me')
        .then(response => setUser(response.data))
        .catch(() => {
          localStorage.removeItem('token')
          delete axios.defaults.headers.common['Authorization']
          setToken(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [token])

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      register,
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  )
}