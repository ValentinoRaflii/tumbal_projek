import React from 'react'
import { Spinner } from 'react-bootstrap'

const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <div className="text-center py-5">
      <Spinner animation="border" variant="primary" className="mb-3" />
      <p className="text-muted">{message}</p>
    </div>
  )
}

export default LoadingSpinner