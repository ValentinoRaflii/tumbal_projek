import React, { useState } from 'react'
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap'
import { ethers } from 'ethers'
import toast from 'react-hot-toast'

const DonationModal = ({ show, onHide, campaign, contract, onSuccess }) => {
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleDonate = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount')
      return
    }

    setLoading(true)
    setError('')

    try {
      const tx = await contract.donate(campaign.blockchain_id, {
        value: ethers.parseEther(amount)
      })
      
      toast.loading('Processing transaction...', { id: 'donate' })
      const receipt = await tx.wait()
      toast.success('Donation successful!', { id: 'donate' })
      
      // Save to backend
      const token = localStorage.getItem('token')
      await fetch('/api/donations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          campaign_id: campaign.id,
          amount: parseFloat(amount),
          transaction_hash: receipt.hash
        })
      })
      
      onSuccess(receipt.hash)
      onHide()
      setAmount('')
    } catch (err) {
      console.error('Donation error:', err)
      setError(err.message || 'Transaction failed')
      toast.error('Donation failed', { id: 'donate' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="bi bi-gift-fill text-success"></i> Donate to {campaign?.name}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Amount (ETH)</Form.Label>
            <div className="input-group">
              <Form.Control
                type="number"
                step="0.01"
                min="0.001"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.01"
                disabled={loading}
              />
              <Button 
                variant="outline-secondary"
                onClick={() => setAmount('0.01')}
                disabled={loading}
              >
                Quick 0.01
              </Button>
              <Button 
                variant="outline-secondary"
                onClick={() => setAmount('0.05')}
                disabled={loading}
              >
                Quick 0.05
              </Button>
            </div>
            <Form.Text className="text-muted">
              Minimum donation: 0.001 ETH
            </Form.Text>
          </Form.Group>
          
          <Alert variant="info" className="mt-3">
            <i className="bi bi-info-circle"></i> Your donation will be recorded on the blockchain permanently.
            <br />
            <small>Transaction hash will be available for verification.</small>
          </Alert>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={loading}>
          Cancel
        </Button>
        <Button variant="success" onClick={handleDonate} disabled={loading}>
          {loading ? (
            <>
              <Spinner as="span" animation="border" size="sm" className="me-2" />
              Processing...
            </>
          ) : (
            <>
              <i className="bi bi-send-check"></i> Donate Now
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default DonationModal