from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from src.models.user import db

class Tag(db.Model):
    __tablename__ = 'tags'
    
    id = db.Column(db.Integer, primary_key=True)
    tenant_id = db.Column(db.Integer, db.ForeignKey('tenants.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    color = db.Column(db.String(7), nullable=True, default='#007bff')  # Cor em hexadecimal
    description = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    candidate_tags = db.relationship('CandidateTag', backref='tag', lazy=True, cascade='all, delete-orphan')
    
    # Índice único para evitar tags duplicadas por tenant
    __table_args__ = (db.UniqueConstraint('tenant_id', 'name', name='unique_tenant_tag'),)
    
    def __repr__(self):
        return f'<Tag {self.name}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'tenant_id': self.tenant_id,
            'name': self.name,
            'color': self.color,
            'description': self.description,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class CandidateTag(db.Model):
    __tablename__ = 'candidate_tags'
    
    candidate_id = db.Column(db.Integer, db.ForeignKey('candidates.id'), primary_key=True)
    tag_id = db.Column(db.Integer, db.ForeignKey('tags.id'), primary_key=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<CandidateTag candidate_id={self.candidate_id} tag_id={self.tag_id}>'
    
    def to_dict(self):
        return {
            'candidate_id': self.candidate_id,
            'tag_id': self.tag_id,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

