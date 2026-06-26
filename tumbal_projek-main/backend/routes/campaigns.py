from flask import Blueprint, request, jsonify
from datetime import datetime
from models import db, Campaign

campaigns_bp = Blueprint('campaigns', __name__)

# =========================
# GET ALL CAMPAIGNS
# =========================
@campaigns_bp.route('', methods=['GET'])
def get_campaigns():
    campaigns = Campaign.query.order_by(Campaign.created_at.desc()).all()
    return jsonify([c.to_dict() for c in campaigns]), 200


# =========================
# GET SINGLE CAMPAIGN
# =========================
@campaigns_bp.route('/<int:campaign_id>', methods=['GET'])
def get_campaign(campaign_id):
    campaign = Campaign.query.get(campaign_id)

    if not campaign:
        return jsonify({'message': 'Campaign not found'}), 404

    return jsonify(campaign.to_dict()), 200


# =========================
# CREATE CAMPAIGN (SYNC FROM FRONTEND)
# =========================
@campaigns_bp.route('', methods=['POST'])
def create_campaign():
    data = request.json

    try:
        campaign = Campaign(
            name=data['name'],
            location=data['location'],
            description=data['description'],
            target_amount=float(data['target_amount']),
            end_date=datetime.fromisoformat(data['end_date']),
            blockchain_id=data.get('blockchain_id'),
            status='active'
        )

        db.session.add(campaign)
        db.session.commit()

        return jsonify(campaign.to_dict()), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500