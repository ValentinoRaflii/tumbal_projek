-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(80) UNIQUE NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password VARCHAR(200) NOT NULL,
    wallet_address VARCHAR(200),
    role VARCHAR(50) DEFAULT 'donor',
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    blockchain_id INTEGER,
    name VARCHAR(200) NOT NULL,
    location VARCHAR(200),
    description TEXT,
    target_amount FLOAT NOT NULL,
    current_amount FLOAT DEFAULT 0,
    banner_image VARCHAR(500),
    start_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    end_date DATETIME NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    contract_address VARCHAR(200),
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Donations table
CREATE TABLE IF NOT EXISTS donations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    campaign_id INTEGER,
    amount FLOAT NOT NULL,
    transaction_hash VARCHAR(200) UNIQUE NOT NULL,
    block_number INTEGER,
    status VARCHAR(50) DEFAULT 'confirmed',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id)
);

-- Proofs table
CREATE TABLE IF NOT EXISTS proofs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    campaign_id INTEGER,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    ipfs_hash VARCHAR(200),
    transaction_hash VARCHAR(200),
    uploaded_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id),
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

-- Disbursement requests table
CREATE TABLE IF NOT EXISTS disbursement_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    campaign_id INTEGER,
    amount FLOAT NOT NULL,
    purpose TEXT,
    receiver_address VARCHAR(200),
    blockchain_disbursement_id INTEGER,
    status VARCHAR(50) DEFAULT 'pending',
    requested_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    approved_at DATETIME,
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id),
    FOREIGN KEY (requested_by) REFERENCES users(id)
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_end_date ON campaigns(end_date);
CREATE INDEX idx_donations_transaction_hash ON donations(transaction_hash);
CREATE INDEX idx_donations_campaign_id ON donations(campaign_id);
CREATE INDEX idx_donations_user_id ON donations(user_id);
CREATE INDEX idx_proofs_campaign_id ON proofs(campaign_id);
CREATE INDEX idx_disbursement_requests_campaign_id ON disbursement_requests(campaign_id);
CREATE INDEX idx_disbursement_requests_status ON disbursement_requests(status);