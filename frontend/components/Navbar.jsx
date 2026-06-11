import React from 'react'
import { Navbar as BootstrapNavbar, Nav, Container, Button, Badge } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { useWeb3 } from '../context/Web3Context'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const { account, isConnected, connectWallet, disconnectWallet, isAdmin } = useWeb3()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    disconnectWallet()
    navigate('/')
  }

  return (
    <BootstrapNavbar bg="dark" variant="dark" expand="lg" className="mb-4">
      <Container>
        <BootstrapNavbar.Brand as={Link} to="/">
          <i className="bi bi-box-heart"></i> Blockchain Donation
        </BootstrapNavbar.Brand>
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            <Nav.Link as={Link} to="/campaigns">Campaigns</Nav.Link>
            {user && <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>}
            {isAdmin && <Nav.Link as={Link} to="/admin">Admin Panel</Nav.Link>}
          </Nav>
          <Nav>
            {isConnected ? (
              <div className="d-flex align-items-center gap-2">
                <Badge bg="success" pill>
                  {account?.slice(0, 6)}...{account?.slice(-4)}
                </Badge>
                {user ? (
                  <Button variant="outline-danger" size="sm" onClick={handleLogout}>
                    Logout
                  </Button>
                ) : (
                  <Button variant="outline-primary" size="sm" as={Link} to="/login">
                    Login
                  </Button>
                )}
                <Button variant="outline-warning" size="sm" onClick={disconnectWallet}>
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button variant="primary" size="sm" onClick={connectWallet}>
                <i className="bi bi-wallet2"></i> Connect Wallet
              </Button>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  )
}

export default Navbar