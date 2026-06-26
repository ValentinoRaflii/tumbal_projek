from app import create_app
from models import db, User
from flask_bcrypt import generate_password_hash

app = create_app()

with app.app_context():
    user = User(
        username='admin',
        email='asinua520@gmail.com',
        password=generate_password_hash('12345678').decode('utf-8'),
        role='admin'
    )

    db.session.add(user)
    db.session.commit()

    print("User berhasil dibuat")