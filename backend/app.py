from flask import Flask, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from config import Config
import os

db = SQLAlchemy()
bcrypt = Bcrypt()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    CORS(app, origins=['http://localhost:3000', 'http://localhost:5173'])
    
    db.init_app(app)
    bcrypt.init_app(app)
    
    # Register blueprints
    from routes.auth import auth_bp
    from routes.campaigns import campaigns_bp
    from routes.donations import donations_bp
    from routes.proofs import proofs_bp
    from routes.admin import admin_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(campaigns_bp, url_prefix='/api/campaigns')
    app.register_blueprint(donations_bp, url_prefix='/api/donations')
    app.register_blueprint(proofs_bp, url_prefix='/api/proofs')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'message': 'Resource not found'}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'message': 'Internal server error'}), 500
    
    with app.app_context():
        db.create_all()
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)