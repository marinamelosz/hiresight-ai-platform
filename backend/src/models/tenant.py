from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from src.models.user import db

class Tenant(db.Model):
    __tablename__ = 'tenants'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    subscription_plan = db.Column(db.String(50), nullable=False, default='basic')  # basic, premium, enterprise
    status = db.Column(db.String(20), nullable=False, default='active')  # active, suspended, cancelled
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    users = db.relationship('User', backref='tenant', lazy=True, cascade='all, delete-orphan')
    candidates = db.relationship('Candidate', backref='tenant', lazy=True, cascade='all, delete-orphan')
    job_postings = db.relationship('JobPosting', backref='tenant', lazy=True, cascade='all, delete-orphan')
    tags = db.relationship('Tag', backref='tenant', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<Tenant {self.name}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'subscription_plan': self.subscription_plan,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

