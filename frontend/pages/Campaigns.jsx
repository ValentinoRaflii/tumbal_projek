import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Button, Form, Spinner } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { useWeb3 } from '../context/Web3Context'
import { ethers } from 'ethers'

const Campaigns = () => {
  const { contract } = useWeb3()
  const [campaigns, setCampaigns] = useState([])
  const [filteredCampaigns, setFilteredCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchCampaigns()
  }, [contract])

  const fetchCampaigns = async () => {
    try {
      const res = await fetch('/api/campaigns')
      const data = await res.json()
      
      // Get blockchain data for each campaign
      const campaignsWithChainData = await Promise.all(
        data.map(async (campaign) => {
          if (contract && campaign.blockchain_id) {
            try {
              const raised = await contract.getTotalRaised(campaign.blockchain_id)
              campaign.current_amount = parseFloat(ethers.formatEther(raised))
            } catch (error) {
              console.error('Error fetching blockchain data:', error)
            }
          }
          return campaign
        })
      )
      
      setCampaigns(campaignsWithChainData)
      setFilteredCampaigns(campaignsWithChainData)
    } catch (error) {
      console.error('Error fetching campaigns:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let filtered = campaigns
    
    if (searchTerm) {
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    if (filter === 'active') {
      filtered = filtered.filter(c => new Date(c.end_date) > new Date())
    } else if (filter === 'completed') {
      filtered = filtered.filter(c => new Date(c.end_date) <= new Date())
    }
    
    setFilteredCampaigns(filtered)
  }, [searchTerm, filter, campaigns])

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
      </Container>
    )
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <h2>
          <i className="bi bi-megaphone-fill text-primary"></i> Active Campaigns
        </h2>
        <div className="d-flex gap-3">
          <Form.Control
            type="text"
            placeholder="Search campaigns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '250px' }}
          />
          <Form.Select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ width: '150px' }}>
            <option value="all">All Campaigns</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </Form.Select>
        </div>
      </div>

      {filteredCampaigns.length === 0 ? (
        <Card className="text-center py-5">
          <Card.Body>
            <i className="bi bi-inbox display-1 text-muted"></i>
            <h4 className="mt-3">No campaigns found</h4>
            <p className="text-muted">Check back later for new disaster relief campaigns</p>
          </Card.Body>
        </Card>
      ) : (
        <Row>
          {filteredCampaigns.map((campaign) => {
            const progress = (campaign.current_amount / campaign.target_amount) * 100
            const daysLeft = Math.ceil((new Date(campaign.end_date) - new Date()) / (1000 * 60 * 60 * 24))
            
            return (
              <Col md={6} lg={4} key={campaign.id} className="mb-4">
                <Card className="h-100 shadow-sm campaign-card">
                  {campaign.banner_image && (
                    <Card.Img variant="top" src={campaign.banner_image} height="200" style={{ objectFit: 'cover' }} />
                  )}
                  <Card.Body>
                    <Card.Title>{campaign.name}</Card.Title>
                    <Card.Text className="text-muted">
                      <i className="bi bi-geo-alt"></i> {campaign.location}
                    </Card.Text>
                    <Card.Text className="small">
                      {campaign.description.length > 100 
                        ? campaign.description.substring(0, 100) + '...' 
                        : campaign.description}
                    </Card.Text>
                    
                    <div className="mt-3">
                      <div className="d-flex justify-content-between mb-1">
                        <small>Progress</small>
                        <small>{progress.toFixed(1)}%</small>
                      </div>
                      <div className="progress" style={{ height: '8px' }}>
                        <div 
                          className="progress-bar bg-success" 
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="d-flex justify-content-between mt-3">
                      <div>
                        <small className="text-muted">Raised</small>
                        <h6 className="mb-0">{campaign.current_amount} ETH</h6>
                      </div>
                      <div>
                        <small className="text-muted">Target</small>
                        <h6 className="mb-0">{campaign.target_amount} ETH</h6>
                      </div>
                      <div>
                        <small className="text-muted">Days Left</small>
                        <h6 className="mb-0">{Math.max(0, daysLeft)}</h6>
                      </div>
                    </div>
                  </Card.Body>
                  <Card.Footer className="bg-transparent">
                    <Button 
                      as={Link} 
                      to={`/campaign/${campaign.id}`} 
                      variant="primary" 
                      className="w-100"
                      disabled={daysLeft <= 0}
                    >
                      {daysLeft > 0 ? 'View & Donate' : 'Campaign Ended'}
                    </Button>
                  </Card.Footer>
                </Card>
              </Col>
            )
          })}
        </Row>
      )}
    </Container>
  )
}

export default Campaigns