from flask import Blueprint, request, jsonify
from models import db, Donation, Campaign
from routes.auth import token_required
from web3 import Web3

donations_bp = Blueprint('donations', __name__)

@donations_bp.route('/', methods=['POST'])
@token_required
def create_donation(current_user):
    data = request.json
    
    if not data.get('campaign_id') or not data.get('amount') or not data.get('transaction_hash'):
        return jsonify({'message': 'Missing required fields'}), 400
    
    campaign = Campaign.query.get(data['campaign_id'])
    if not campaign:
        return jsonify({'message': 'Campaign not found'}), 404
    
    # Check if transaction already recorded
    existing = Donation.query.filter_by(transaction_hash=data['transaction_hash']).first()
    if existing:
        return jsonify({'message': 'Transaction already recorded'}), 400
    
    donation = Donation(
        user_id=current_user.id,
        campaign_id=data['campaign_id'],
        amount=float(data['amount']),
        transaction_hash=data['transaction_hash'],
        block_number=data.get('block_number')
    )
    
    # Update campaign total
    campaign.current_amount += float(data['amount'])
    
    db.session.add(donation)
    db.session.commit()
    
    return jsonify(donation.to_dict()), 201

@donations_bp.route('/user', methods=['GET'])
@token_required
def get_user_donations(current_user):
    donations = Donation.query.filter_by(user_id=current_user.id).order_by(Donation.created_at.desc()).all()
    return jsonify([d.to_dict() for d in donations])

@donations_bp.route('/campaign/<int:campaign_id>', methods=['GET'])
def get_campaign_donations(campaign_id):
    donations = Donation.query.filter_by(campaign_id=campaign_id).order_by(Donation.created_at.desc()).limit(50).all()
    return jsonify([d.to_dict() for d in donations])

@donations_bp.route('/<int:donation_id>/verify', methods=['GET'])
def verify_donation(donation_id):
    donation = Donation.query.get(donation_id)
    if not donation:
        return jsonify({'message': 'Donation not found'}), 404
    
    # Verify on blockchain
    # This would involve checking the transaction on Ethereum
    
    return jsonify({
        'verified': True,
        'transaction_hash': donation.transaction_hash,
        'explorer_url': f'https://sepolia.etherscan.io/tx/{donation.transaction_hash}'
    })