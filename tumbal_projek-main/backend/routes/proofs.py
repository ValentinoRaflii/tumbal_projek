from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
import cloudinary.uploader
import cloudinary
from models import db, Proof, Campaign
from routes.auth import token_required
from config import Config
import os

proofs_bp = Blueprint('proofs', __name__)

# Configure cloudinary
cloudinary.config(
    cloud_name=Config.CLOUDINARY_CLOUD_NAME,
    api_key=Config.CLOUDINARY_API_KEY,
    api_secret=Config.CLOUDINARY_API_SECRET
)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in Config.ALLOWED_EXTENSIONS

@proofs_bp.route('/', methods=['POST'])
@token_required
def upload_proof(current_user):
    if current_user.role != 'admin':
        return jsonify({'message': 'Admin access required'}), 403
    
    campaign_id = request.form.get('campaign_id')
    title = request.form.get('title')
    description = request.form.get('description')
    image = request.files.get('image')
    
    if not all([campaign_id, title, image]):
        return jsonify({'message': 'Missing required fields'}), 400
    
    campaign = Campaign.query.get(campaign_id)
    if not campaign:
        return jsonify({'message': 'Campaign not found'}), 404
    
    # Upload to cloudinary
    try:
        upload_result = cloudinary.uploader.upload(
            image,
            folder=f'campaign_proofs/{campaign_id}',
            allowed_formats=['jpg', 'jpeg', 'png', 'gif']
        )
        
        proof = Proof(
            campaign_id=campaign_id,
            title=title,
            description=description,
            image_url=upload_result['secure_url'],
            ipfs_hash=request.form.get('ipfs_hash'),
            transaction_hash=request.form.get('transaction_hash'),
            uploaded_by=current_user.id
        )
        
        db.session.add(proof)
        db.session.commit()
        
        return jsonify(proof.to_dict()), 201
        
    except Exception as e:
        return jsonify({'message': f'Upload failed: {str(e)}'}), 500

@proofs_bp.route('/campaign/<int:campaign_id>', methods=['GET'])
def get_campaign_proofs(campaign_id):
    proofs = Proof.query.filter_by(campaign_id=campaign_id).order_by(Proof.created_at.desc()).all()
    return jsonify([p.to_dict() for p in proofs])

@proofs_bp.route('/<int:proof_id>', methods=['DELETE'])
@token_required
def delete_proof(current_user, proof_id):
    if current_user.role != 'admin':
        return jsonify({'message': 'Admin access required'}), 403
    
    proof = Proof.query.get(proof_id)
    if not proof:
        return jsonify({'message': 'Proof not found'}), 404
    
    db.session.delete(proof)
    db.session.commit()
    
    return jsonify({'message': 'Proof deleted'})