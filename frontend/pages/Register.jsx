import React, { useState } from 'react'
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    wallet_address: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }
    
    const { confirmPassword, ...userData } = formData
    const success = await register(userData)
    
    if (success) {
      navigate('/dashboard')
    } else {
      setError('Registration failed. Please try again.')
    }
    setLoading(false)
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <Card className="shadow">
            <Card.Body className="p-5">
              <div className="text-center mb-4">
                <i className="bi bi-person-plus display-1 text-primary"></i>
                <h3 className="mt-2">Create Account</h3>
                <p className="text-muted">Join the blockchain donation platform</p>
              </div>
              
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Username</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text"><i className="bi bi-person"></i></span>
                    <Form.Control
                      type="text"
                      name="username"
                      placeholder="Choose a username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Email Address</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text"><i className="bi bi-envelope"></i></span>
                    <Form.Control
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Wallet Address (Optional)</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text"><i className="bi bi-wallet2"></i></span>
                    <Form.Control
                      type="text"
                      name="wallet_address"
                      placeholder="0x..."
                      value={formData.wallet_address}
                      onChange={handleChange}
                    />
                  </div>
                  <Form.Text className="text-muted">
                    You can add your MetaMask wallet address later
                  </Form.Text>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text"><i className="bi bi-lock"></i></span>
                    <Form.Control
                      type="password"
                      name="password"
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </Form.Group>
                
                <Form.Group className="mb-4">
                  <Form.Label>Confirm Password</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text"><i className="bi bi-lock-fill"></i></span>
                    <Form.Control
                      type="password"
                      name="confirmPassword"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </Form.Group>
                
                <Button type="submit" variant="primary" className="w-100" disabled={loading}>
                  {loading ? <Spinner animation="border" size="sm" /> : 'Register'}
                </Button>
              </Form>
              
              <hr className="my-4" />
              
              <p className="text-center mb-0">
                Already have an account? <Link to="/login">Login here</Link>
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default Register