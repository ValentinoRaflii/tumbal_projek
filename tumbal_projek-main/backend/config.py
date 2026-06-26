import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-change-in-production')
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:///donations.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Cloudinary config
    CLOUDINARY_CLOUD_NAME = os.getenv('CLOUDINARY_CLOUD_NAME')
    CLOUDINARY_API_KEY = os.getenv('CLOUDINARY_API_KEY')
    CLOUDINARY_API_SECRET = os.getenv('CLOUDINARY_API_SECRET')
    
    # Blockchain config
    WEB3_PROVIDER_URI = os.getenv('WEB3_PROVIDER_URI', 'https://sepolia.infura.io/v3/')
    CONTRACT_ADDRESS = os.getenv('CONTRACT_ADDRESS')
    
    # JWT
    JWT_EXPIRATION_HOURS = 24
    
    # Upload config
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'mp4'}