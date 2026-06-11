from flask import Blueprint, request, jsonify
from flask_bcrypt import generate_password_hash, check_password_hash
import jwt
from datetime import datetime, timedelta
from functools import wraps
from models import db, User
from config import Config

auth_bp = Blueprint('auth', __name__)

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        
        if token.startswith('Bearer '):
            token = token[7:]
        
        try:
            data = jwt.decode(token, Config.SECRET_KEY, algorithms=['HS256'])
            current_user = User.query.get(data['user_id'])
            if not current_user:
                return jsonify({'message': 'User not found'}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token'}), 401
        
        return f(current_user, *args, **kwargs)
    
    return decorated

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    
    # Validate input
    if not data.get('username') or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Missing required fields'}), 400
    
    # Check if user exists
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'Email already registered'}), 400
    
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'message': 'Username already taken'}), 400
    
    # Create user
    hashed_password = generate_password_hash(data['password']).decode('utf-8')
    user = User(
        username=data['username'],
        email=data['email'],
        password=hashed_password,
        wallet_address=data.get('wallet_address'),
        role='donor'
    )
    
    db.session.add(user)
    db.session.commit()
    
    # Generate token
    token = jwt.encode({
        'user_id': user.id,
        'exp': datetime.utcnow() + timedelta(hours=Config.JWT_EXPIRATION_HOURS)
    }, Config.SECRET_KEY)
    
    return jsonify({
        'token': token,
        'user': user.to_dict()
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    
    if not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Email and password required'}), 400
    
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not check_password_hash(user.password, data['password']):
        return jsonify({'message': 'Invalid credentials'}), 401
    
    token = jwt.encode({
        'user_id': user.id,
        'exp': datetime.utcnow() + timedelta(hours=Config.JWT_EXPIRATION_HOURS)
    }, Config.SECRET_KEY)
    
    return jsonify({
        'token': token,
        'user': user.to_dict()
    })

@auth_bp.route('/me', methods=['GET'])
@token_required
def get_me(current_user):
    return jsonify(current_user.to_dict())

@auth_bp.route('/verify-token', methods=['POST'])
def verify_token():
    token = request.json.get('token')
    
    if not token:
        return jsonify({'valid': False}), 400
    
    try:
        data = jwt.decode(token, Config.SECRET_KEY, algorithms=['HS256'])
        user = User.query.get(data['user_id'])
        if user:
            return jsonify({'valid': True, 'user': user.to_dict()})
    except:
        pass
    
    return jsonify({'valid': False})