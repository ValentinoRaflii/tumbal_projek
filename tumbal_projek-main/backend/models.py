from extensions import db
from datetime import datetime



class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    wallet_address = db.Column(db.String(200))
    role = db.Column(db.String(50), default='donor')
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    donations = db.relationship('Donation', backref='user', lazy=True)
    campaigns_created = db.relationship('Campaign', backref='creator', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'wallet_address': self.wallet_address,
            'role': self.role,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Campaign(db.Model):
    __tablename__ = 'campaigns'
    
    id = db.Column(db.Integer, primary_key=True)
    blockchain_id = db.Column(db.Integer)
    name = db.Column(db.String(200), nullable=False)
    location = db.Column(db.String(200))
    description = db.Column(db.Text)
    target_amount = db.Column(db.Float, nullable=False)
    current_amount = db.Column(db.Float, default=0)
    banner_image = db.Column(db.String(500))
    start_date = db.Column(db.DateTime, default=datetime.utcnow)
    end_date = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String(50), default='active')
    contract_address = db.Column(db.String(200))
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    donations = db.relationship('Donation', backref='campaign', lazy=True)
    proofs = db.relationship('Proof', backref='campaign', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'blockchain_id': self.blockchain_id,
            'name': self.name,
            'location': self.location,
            'description': self.description,
            'target_amount': self.target_amount,
            'current_amount': self.current_amount,
            'banner_image': self.banner_image,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'status': self.status,
            'contract_address': self.contract_address,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Donation(db.Model):
    __tablename__ = 'donations'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    campaign_id = db.Column(db.Integer, db.ForeignKey('campaigns.id'))
    amount = db.Column(db.Float, nullable=False)
    transaction_hash = db.Column(db.String(200), unique=True, nullable=False)
    block_number = db.Column(db.Integer)
    status = db.Column(db.String(50), default='confirmed')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'campaign_id': self.campaign_id,
            'amount': self.amount,
            'transaction_hash': self.transaction_hash,
            'block_number': self.block_number,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'user': self.user.to_dict() if self.user else None,
            'campaign': self.campaign.to_dict() if self.campaign else None
        }

class Proof(db.Model):
    __tablename__ = 'proofs'
    
    id = db.Column(db.Integer, primary_key=True)
    campaign_id = db.Column(db.Integer, db.ForeignKey('campaigns.id'))
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    image_url = db.Column(db.String(500))
    ipfs_hash = db.Column(db.String(200))
    transaction_hash = db.Column(db.String(200))
    uploaded_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship
    uploader = db.relationship('User', backref='proofs')
    
    def to_dict(self):
        return {
            'id': self.id,
            'campaign_id': self.campaign_id,
            'title': self.title,
            'description': self.description,
            'image_url': self.image_url,
            'ipfs_hash': self.ipfs_hash,
            'transaction_hash': self.transaction_hash,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class DisbursementRequest(db.Model):
    __tablename__ = 'disbursement_requests'
    
    id = db.Column(db.Integer, primary_key=True)
    campaign_id = db.Column(db.Integer, db.ForeignKey('campaigns.id'))
    amount = db.Column(db.Float, nullable=False)
    purpose = db.Column(db.Text)
    receiver_address = db.Column(db.String(200))
    blockchain_disbursement_id = db.Column(db.Integer)
    status = db.Column(db.String(50), default='pending')
    requested_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    approved_at = db.Column(db.DateTime)
    
    def to_dict(self):
        return {
            'id': self.id,
            'campaign_id': self.campaign_id,
            'amount': self.amount,
            'purpose': self.purpose,
            'receiver_address': self.receiver_address,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }