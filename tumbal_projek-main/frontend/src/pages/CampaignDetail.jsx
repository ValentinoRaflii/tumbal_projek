import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Container, Row, Col, Card, Button, ProgressBar, Table, Spinner, Alert, Tabs, Tab } from 'react-bootstrap'
import { useWeb3 } from '../context/Web3Context'
import DonationModal from '../components/DonationModal'
import { ethers } from 'ethers'
import toast from 'react-hot-toast'

const CampaignDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { contract, account, connectWallet, isConnected } = useWeb3()
  const [campaign, setCampaign] = useState(null)
  const [donations, setDonations] = useState([])
  const [proofs, setProofs] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCampaignData()
  }, [id, contract])

  const fetchCampaignData = async () => {
    setLoading(true)
    try {
      // Fetch campaign from backend
      const campaignRes = await fetch(`/api/campaigns/${id}`)
      const campaignData = await campaignRes.json()
      
      // Fetch donations
      const donationsRes = await fetch(`/api/donations/campaign/${id}`)
      const donationsData = await donationsRes.json()
      
      // Fetch proofs
      const proofsRes = await fetch(`/api/proofs/campaign/${id}`)
      const proofsData = await proofsRes.json()
      
      // Fetch stats
      const statsRes = await fetch(`/api/campaigns/${id}/stats`)
      const statsData = await statsRes.json()
      
      // Get blockchain data if contract available
      if (contract && campaignData.blockchain_id) {
        try {
          const raised = await contract.getTotalRaised(campaignData.blockchain_id)
          statsData.total_raised = parseFloat(ethers.formatEther(raised))
        } catch (error) {
          console.error('Blockchain fetch error:', error)
        }
      }
      
      setCampaign(campaignData)
      setDonations(donationsData)
      setProofs(proofsData)
      setStats({
        totalDonors: statsData.total_donors || 0,
        progress: statsData.progress || 0,
        daysLeft: statsData.days_left || 0,
        totalRaised: statsData.total_raised || campaignData.current_amount || 0
      })
    } catch (error) {
      console.error('Error fetching campaign:', error)
      toast.error('Failed to load campaign data')
    } finally {
      setLoading(false)
    }
  }

  const [stats, setStats] = useState({
    totalDonors: 0,
    progress: 0,
    daysLeft: 0,
    totalRaised: 0
  })

  const handleDonationSuccess = (txHash) => {
    toast.success(`Donation successful! TX: ${txHash.slice(0, 10)}...`)
    fetchCampaignData()
  }

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
      </Container>
    )
  }

  if (!campaign) {
    return (
      <Container className="text-center py-5">
        <Alert variant="danger">Campaign not found</Alert>
        <Button onClick={() => navigate('/campaigns')}>Back to Campaigns</Button>
      </Container>
    )
  }

  return (
    <Container className="py-4">
      <Button variant="outline-secondary" onClick={() => navigate('/campaigns')} className="mb-4">
        ← Back to Campaigns
      </Button>
      
      <Row>
        <Col lg={8}>
          <Card className="mb-4">
            {campaign.banner_image && (
              <Card.Img variant="top" src={campaign.banner_image} style={{ maxHeight: '400px', objectFit: 'cover' }} />
            )}
            <Card.Body>
              <Card.Title as="h2">{campaign.name}</Card.Title>
              <Card.Text className="text-muted">
                <i className="bi bi-geo-alt"></i> {campaign.location}
              </Card.Text>
              <Card.Text>{campaign.description}</Card.Text>
              
              <div className="my-4">
                <h5>Campaign Progress</h5>
                <ProgressBar 
                  now={stats.progress} 
                  label={`${stats.progress.toFixed(1)}%`}
                  variant="success"
                  className="mb-2"
                />
                <div className="d-flex justify-content-between">
                  <span>Raised: {stats.totalRaised} ETH</span>
                  <span>Target: {campaign.target_amount} ETH</span>
                </div>
              </div>
              
              <Button 
                variant="success" 
                size="lg" 
                onClick={() => isConnected ? setShowModal(true) : connectWallet()}
                className="w-100"
                disabled={stats.daysLeft <= 0}
              >
                {!isConnected ? 'Connect Wallet to Donate' : 
                 stats.daysLeft <= 0 ? 'Campaign Ended' : 'Donate Now'}
              </Button>
            </Card.Body>
          </Card>
          
          <Tabs defaultActiveKey="donations" className="mb-4">
            <Tab eventKey="donations" title={`Donations (${donations.length})`}>
              <Card>
                <Card.Body>
                  {donations.length === 0 ? (
                    <p className="text-muted text-center">No donations yet. Be the first to donate!</p>
                  ) : (
                    <Table striped hover responsive>
                      <thead>
                        <tr>
                          <th>Donor</th>
                          <th>Amount (ETH)</th>
                          <th>Date</th>
                          <th>Transaction</th>
                        </tr>
                      </thead>
                      <tbody>
                        {donations.map((donation) => (
                          <tr key={donation.id}>
                            <td>{donation.user?.username || donation.user_id?.slice(0, 10) || 'Anonymous'}</td>
                            <td>{donation.amount}</td>
                            <td>{new Date(donation.created_at).toLocaleDateString()}</td>
                            <td>
                              <a href={`https://sepolia.etherscan.io/tx/${donation.transaction_hash}`} target="_blank" rel="noopener noreferrer">
                                View
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </Card.Body>
              </Card>
            </Tab>
            
            <Tab eventKey="proofs" title={`Proof of Distribution (${proofs.length})`}>
              <Row>
                {proofs.length === 0 ? (
                  <Card>
                    <Card.Body>
                      <p className="text-muted text-center">No proof of distribution uploaded yet.</p>
                    </Card.Body>
                  </Card>
                ) : (
                  proofs.map((proof) => (
                    <Col md={6} key={proof.id} className="mb-3">
                      <Card>
                        <Card.Img variant="top" src={proof.image_url} style={{ height: '200px', objectFit: 'cover' }} />
                        <Card.Body>
                          <Card.Title>{proof.title}</Card.Title>
                          <Card.Text>{proof.description}</Card.Text>
                          <small className="text-muted">{new Date(proof.created_at).toLocaleDateString()}</small>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))
                )}
              </Row>
            </Tab>
          </Tabs>
        </Col>
        
        <Col lg={4}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Campaign Stats</Card.Title>
              <hr />
              <div className="mb-3">
                <strong>Total Donors:</strong>
                <p className="display-6">{stats.totalDonors}</p>
              </div>
              <div className="mb-3">
                <strong>Days Remaining:</strong>
                <p className="display-6">{Math.max(0, stats.daysLeft)}</p>
              </div>
              <div className="mb-3">
                <strong>Total Raised:</strong>
                <p className="display-6">{stats.totalRaised} ETH</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {campaign && contract && (
        <DonationModal
          show={showModal}
          onHide={() => setShowModal(false)}
          campaign={campaign}
          contract={contract}
          onSuccess={handleDonationSuccess}
        />
      )}
    </Container>
  )
}

export default CampaignDetail