import React, { useEffect, useState } from 'react'
import { Card, Container, Row, Col, Spinner, Badge } from 'react-bootstrap'

function Campaigns() {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCampaigns()
  }, [])

  const fetchCampaigns = async () => {
    try {
      setLoading(true)

      const res = await fetch('http://localhost:5000/api/campaigns')
      const data = await res.json()

      setCampaigns(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const formatETH = (value) => {
    if (!value) return '0'
    return Number(value).toFixed(4)
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    )
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4 fw-bold text-center">🌍 Active Campaigns</h2>

      <Row>
        {campaigns.map((c) => {
          const progress = (c.current_amount / c.target_amount) * 100 || 0

          return (
            <Col md={4} sm={6} xs={12} className="mb-4" key={c.id}>
              <Card className="shadow-sm border-0 h-100 campaign-card">

                {/* HEADER */}
                <div className="p-3 bg-primary text-white rounded-top">
                  <h5 className="mb-0">{c.name}</h5>
                  <small>{c.location}</small>
                </div>

                <Card.Body>

                  {/* DESCRIPTION */}
                  <p className="text-muted" style={{ fontSize: '14px' }}>
                    {c.description?.length > 80
                      ? c.description.substring(0, 80) + '...'
                      : c.description}
                  </p>

                  {/* PROGRESS */}
                  <div className="mb-2">
                    <div className="d-flex justify-content-between">
                      <small>Progress</small>
                      <small>{progress.toFixed(1)}%</small>
                    </div>

                    <div className="progress" style={{ height: '8px' }}>
                      <div
                        className="progress-bar bg-success"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* AMOUNT */}
                  <div className="d-flex justify-content-between mt-3">
                    <div>
                      <small className="text-muted">Raised</small>
                      <div className="fw-bold text-success">
                        {formatETH(c.current_amount)} ETH
                      </div>
                    </div>

                    <div>
                      <small className="text-muted">Target</small>
                      <div className="fw-bold text-dark">
                        {formatETH(c.target_amount)} ETH
                      </div>
                    </div>
                  </div>

                  {/* STATUS */}
                  <div className="mt-3">
                    <Badge bg={progress >= 100 ? "success" : "warning"}>
                      {progress >= 100 ? "Completed" : "Active"}
                    </Badge>
                  </div>

                </Card.Body>

                <Card.Footer className="bg-white border-0">
                  <button className="btn btn-primary w-100">
                    View Details
                  </button>
                </Card.Footer>

              </Card>
            </Col>
          )
        })}
      </Row>
    </Container>
  )
}

export default Campaigns