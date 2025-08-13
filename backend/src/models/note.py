from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from src.models.user import db

class Note(db.Model):
    __tablename__ = 'notes'
    
    id = db.Column(db.Integer, primary_key=True)
    tenant_id = db.Column(db.Integer, db.ForeignKey('tenants.id'), nullable=False)
    candidate_id = db.Column(db.Integer, db.ForeignKey('candidates.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    note_type = db.Column(db.String(50), nullable=False, default='general')  # general, interview, feedback, etc.
    is_private = db.Column(db.Boolean, default=False)  # Se a nota é privada para o usuário que criou
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<Note {self.id} for Candidate {self.candidate_id}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'tenant_id': self.tenant_id,
            'candidate_id': self.candidate_id,
            'user_id': self.user_id,
            'content': self.content,
            'note_type': self.note_type,
            'is_private': self.is_private,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

