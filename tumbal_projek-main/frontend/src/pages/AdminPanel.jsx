import React, { useState } from 'react'
import { useWeb3 } from '../context/Web3Context'
import { ethers } from 'ethers'
import { Container, Card, Form, Button, Row, Col, Spinner } from 'react-bootstrap'

function AdminPanel() {
  const { contract } = useWeb3()

  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [target, setTarget] = useState('')
  const [duration, setDuration] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (!contract) {
        alert("Wallet belum connect")
        return
      }

      if (!name || !location || !description) {
        alert("Semua field wajib diisi")
        return
      }

      if (!target || isNaN(Number(target))) {
        alert("Target harus angka")
        return
      }

      if (!duration || isNaN(Number(duration))) {
        alert("Duration harus angka")
        return
      }

      setLoading(true)

      const tx = await contract.createCampaign(
        name,
        location,
        description,
        ethers.parseEther(target.toString()),
        Number(duration)
      )

      await tx.wait()

      const count = await contract.campaignCount()
      const campaignId = Number(count)

      await fetch('http://localhost:5000/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          location,
          description,
          target_amount: target,
          end_date: new Date(Date.now() + duration * 86400000).toISOString(),
          blockchain_id: campaignId
        })
      })

      alert("Campaign berhasil dibuat!")

      setName('')
      setLocation('')
      setDescription('')
      setTarget('')
      setDuration('')

    } catch (err) {
      console.error(err)
      alert("Gagal membuat campaign")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container className="py-4">

      {/* HEADER */}
      <div className="text-center mb-4">
        <h2 className="fw-bold">🛠 Admin Dashboard</h2>
        <p className="text-muted">Create and manage disaster relief campaigns</p>
      </div>

      <Row className="justify-content-center">
        <Col md={8}>

          <Card className="shadow-sm border-0 p-3">

            <Card.Body>

              <h5 className="mb-3">➕ Create New Campaign</h5>

              <Form onSubmit={handleSubmit}>

                {/* NAME */}
                <Form.Group className="mb-3">
                  <Form.Label>Campaign Name</Form.Label>
                  <Form.Control
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Flood Relief Jakarta"
                  />
                </Form.Group>

                {/* LOCATION */}
                <Form.Group className="mb-3">
                  <Form.Label>Location</Form.Label>
                  <Form.Control
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Jakarta, Indonesia"
                  />
                </Form.Group>

                {/* DESCRIPTION */}
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Explain the purpose of this campaign..."
                  />
                </Form.Group>

                <Row>
                  {/* TARGET */}
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Target (ETH)</Form.Label>
                      <Form.Control
                        type="number"
                        value={target}
                        onChange={(e) => setTarget(e.target.value)}
                        placeholder="0.5"
                      />
                    </Form.Group>
                  </Col>

                  {/* DURATION */}
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Duration (Days)</Form.Label>
                      <Form.Control
                        type="number"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        placeholder="7"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* BUTTON */}
                <Button
                  type="submit"
                  variant="primary"
                  className="w-100"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner size="sm" animation="border" /> Creating...
                    </>
                  ) : (
                    "🚀 Create Campaign"
                  )}
                </Button>

              </Form>

            </Card.Body>

          </Card>

        </Col>
      </Row>

    </Container>
  )
}

export default AdminPanel