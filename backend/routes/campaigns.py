from flask import Blueprint, request, jsonify
from datetime import datetime
from models import db, Campaign, User
from routes.auth import token_required
from web3 import Web3
from config import Config

campaigns_bp = Blueprint('campaigns', __name__)

@campaigns_bp.route('/', methods=['GET'])
def get_campaigns():
    campaigns = Campaign.query.filter_by(status='active').order_by(Campaign.created_at.desc()).all()
    return jsonify([c.to_dict() for c in campaigns])

@campaigns_bp.route('/<int:campaign_id>', methods=['GET'])
def get_campaign(campaign_id):
    campaign = Campaign.query.get(campaign_id)
    if not campaign:
        return jsonify({'message': 'Campaign not found'}), 404
    return jsonify(campaign.to_dict())

@campaigns_bp.route('/', methods=['POST'])
@token_required
def create_campaign(current_user):
    if current_user.role != 'admin':
        return jsonify({'message': 'Admin access required'}), 403
    
    data = request.json
    
    required_fields = ['name', 'location', 'description', 'target_amount', 'end_date']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'message': f'Missing field: {field}'}), 400
    
    campaign = Campaign(
        name=data['name'],
        location=data['location'],
        description=data['description'],
        target_amount=float(data['target_amount']),
        end_date=datetime.fromisoformat(data['end_date']),
        banner_image=data.get('banner_image'),
        created_by=current_user.id
    )
    
    db.session.add(campaign)
    db.session.commit()
    
    # Note: Smart contract interaction would happen here
    # For now, we'll just create the campaign in database
    
    return jsonify(campaign.to_dict()), 201

@campaigns_bp.route('/<int:campaign_id>', methods=['PUT'])
@token_required
def update_campaign(current_user, campaign_id):
    if current_user.role != 'admin':
        return jsonify({'message': 'Admin access required'}), 403
    
    campaign = Campaign.query.get(campaign_id)
    if not campaign:
        return jsonify({'message': 'Campaign not found'}), 404
    
    data = request.json
    
    if 'name' in data:
        campaign.name = data['name']
    if 'location' in data:
        campaign.location = data['location']
    if 'description' in data:
        campaign.description = data['description']
    if 'target_amount' in data:
        campaign.target_amount = float(data['target_amount'])
    if 'end_date' in data:
        campaign.end_date = datetime.fromisoformat(data['end_date'])
    if 'banner_image' in data:
        campaign.banner_image = data['banner_image']
    if 'status' in data:
        campaign.status = data['status']
    
    db.session.commit()
    
    return jsonify(campaign.to_dict())

@campaigns_bp.route('/<int:campaign_id>/stats', methods=['GET'])
def get_campaign_stats(campaign_id):
    campaign = Campaign.query.get(campaign_id)
    if not campaign:
        return jsonify({'message': 'Campaign not found'}), 404
    
    total_donors = len(campaign.donations)
    total_raised = campaign.current_amount
    progress = (total_raised / campaign.target_amount) * 100 if campaign.target_amount > 0 else 0
    days_left = (campaign.end_date - datetime.utcnow()).days if campaign.end_date > datetime.utcnow() else 0
    
    return jsonify({
        'total_donors': total_donors,
        'total_raised': total_raised,
        'progress': min(progress, 100),
        'days_left': max(days_left, 0),
        'target': campaign.target_amount
    })