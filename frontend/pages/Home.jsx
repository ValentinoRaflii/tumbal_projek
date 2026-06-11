import React from 'react'
import { Container, Row, Col, Card, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'

const Home = () => {
  const features = [
    { icon: 'bi-lock-fill', title: 'Fully Transparent', desc: 'All donations recorded on Ethereum blockchain' },
    { icon: 'bi-shield-check', title: 'Multi-Signature Security', desc: 'Funds require multiple admin approvals' },
    { icon: 'bi-graph-up', title: 'Real-time Tracking', desc: 'Track donations and fund distribution live' },
    { icon: 'bi-file-check', title: 'Proof of Distribution', desc: 'Photos and reports stored on IPFS' }
  ]

  const stats = [
    { label: 'Total Donations', value: '1,234 ETH', icon: 'bi-coin' },
    { label: 'Campaigns Supported', value: '15', icon: 'bi-megaphone' },
    { label: 'Lives Impacted', value: '10K+', icon: 'bi-people' },
    { label: 'Blockchain Verified', value: '100%', icon: 'bi-check-circle' }
  ]

  return (
    <>
      {/* Hero Section */}
      <div className="hero-section text-white py-5" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Container className="py-5">
          <Row className="align-items-center">
            <Col lg={7} className="mb-4 mb-lg-0">
              <h1 className="display-3 fw-bold mb-3">
                Transparent Disaster Relief on Blockchain
              </h1>
              <p className="lead mb-4">
                Every donation is recorded on Ethereum blockchain. Track your contribution 
                from donation to distribution with complete transparency.
              </p>
              <div className="d-flex gap-3">
                <Button as={Link} to="/campaigns" size="lg" variant="light">
                  <i className="bi bi-heart-fill text-danger"></i> Donate Now
                </Button>
                <Button as={Link} to="/campaigns" size="lg" variant="outline-light">
                  <i className="bi bi-play-circle"></i> How It Works
                </Button>
              </div>
            </Col>
            <Col lg={5}>
              <Card className="bg-dark bg-opacity-25 border-0">
                <Card.Body className="text-center">
                  <i className="bi bi-box-heart display-1"></i>
                  <h3 className="mt-3">Powered by Ethereum</h3>
                  <p className="mb-0">Smart Contract: 0x8ab4... (View on Etherscan)</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Stats Section */}
      <Container className="py-5">
        <Row>
          {stats.map((stat, idx) => (
            <Col md={3} key={idx} className="mb-3 mb-md-0">
              <Card className="text-center border-0 shadow-sm">
                <Card.Body>
                  <i className={`bi ${stat.icon} display-4 text-primary`}></i>
                  <h2 className="mt-2 mb-0">{stat.value}</h2>
                  <p className="text-muted">{stat.label}</p>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      {/* Features Section */}
      <Container className="py-5">
        <h2 className="text-center mb-5">Why Choose Blockchain Donation?</h2>
        <Row>
          {features.map((feature, idx) => (
            <Col md={3} key={idx} className="mb-4">
              <Card className="h-100 border-0 shadow-sm text-center">
                <Card.Body>
                  <i className={`bi ${feature.icon} display-3 text-primary`}></i>
                  <h5 className="mt-3">{feature.title}</h5>
                  <p className="text-muted">{feature.desc}</p>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      {/* How It Works */}
      <div className="bg-light py-5">
        <Container>
          <h2 className="text-center mb-5">How It Works</h2>
          <Row>
            <Col md={3} className="text-center mb-4">
              <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                <h3 className="mb-0">1</h3>
              </div>
              <h5 className="mt-3">Connect Wallet</h5>
              <p className="text-muted">Connect your MetaMask wallet to start donating</p>
            </Col>
            <Col md={3} className="text-center mb-4">
              <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                <h3 className="mb-0">2</h3>
              </div>
              <h5 className="mt-3">Choose Campaign</h5>
              <p className="text-muted">Select a disaster relief campaign to support</p>
            </Col>
            <Col md={3} className="text-center mb-4">
              <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                <h3 className="mb-0">3</h3>
              </div>
              <h5 className="mt-3">Make Donation</h5>
              <p className="text-muted">Donate ETH securely via smart contract</p>
            </Col>
            <Col md={3} className="text-center mb-4">
              <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                <h3 className="mb-0">4</h3>
              </div>
              <h5 className="mt-3">Track Impact</h5>
              <p className="text-muted">View proof of fund distribution on blockchain</p>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  )
}

export default Home