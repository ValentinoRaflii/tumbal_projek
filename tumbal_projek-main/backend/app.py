from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from extensions import db, bcrypt

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # =========================
    # 🔥 FIX CORS TOTAL
    # =========================
    CORS(
        app,
        resources={r"/api/*": {"origins": "*"}},
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    )

    db.init_app(app)
    bcrypt.init_app(app)

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
        return jsonify({'message': 'Not found'}), 404

    @app.errorhandler(500)
    def server_error(error):
        return jsonify({'message': 'Server error'}), 500

    with app.app_context():
        db.create_all()

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)