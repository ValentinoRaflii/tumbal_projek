import React from 'react'

function Dashboard() {
  return (
    <div className="container mt-4">
      <h1>Dashboard</h1>
      <p>Selamat datang di dashboard pengguna.</p>

      <div className="card p-3 mt-3">
        <h4>Status Donasi</h4>
        <p>Total Donasi: 0 ETH</p>
      </div>
    </div>
  )
}

export default Dashboard