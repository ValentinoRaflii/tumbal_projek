from flask import Blueprint, request, jsonify
from models import db, User, Campaign, Donation, DisbursementRequest
from routes.auth import token_required

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/users', methods=['GET'])
@token_required
def get_users(current_user):
    if current_user.role != 'admin':
        return jsonify({'message': 'Admin access required'}), 403
    
    users = User.query.all()
    return jsonify([u.to_dict() for u in users])

@admin_bp.route('/users/<int:user_id>/role', methods=['PUT'])
@token_required
def update_user_role(current_user, user_id):
    if current_user.role != 'admin':
        return jsonify({'message': 'Admin access required'}), 403
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    data = request.json
    if 'role' in data and data['role'] in ['donor', 'admin']:
        user.role = data['role']
        db.session.commit()
    
    return jsonify(user.to_dict())

@admin_bp.route('/dashboard/stats', methods=['GET'])
@token_required
def get_dashboard_stats(current_user):
    if current_user.role != 'admin':
        return jsonify({'message': 'Admin access required'}), 403
    
    total_donations = db.session.query(db.func.sum(Donation.amount)).scalar() or 0
    total_donors = Donation.query.distinct(Donation.user_id).count()
    active_campaigns = Campaign.query.filter_by(status='active').count()
    total_campaigns = Campaign.query.count()
    
    return jsonify({
        'total_donations': float(total_donations),
        'total_donors': total_donors,
        'active_campaigns': active_campaigns,
        'total_campaigns': total_campaigns
    })

@admin_bp.route('/campaigns/all', methods=['GET'])
@token_required
def get_all_campaigns(current_user):
    if current_user.role != 'admin':
        return jsonify({'message': 'Admin access required'}), 403
    
    campaigns = Campaign.query.order_by(Campaign.created_at.desc()).all()
    return jsonify([c.to_dict() for c in campaigns])