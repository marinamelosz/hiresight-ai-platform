from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from src.models.user import db

class Candidate(db.Model):
    __tablename__ = 'candidates'
    
    id = db.Column(db.Integer, primary_key=True)
    tenant_id = db.Column(db.Integer, db.ForeignKey('tenants.id'), nullable=False)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=True)
    phone = db.Column(db.String(20), nullable=True)
    linkedin_url = db.Column(db.String(500), nullable=True)
    resume_text = db.Column(db.Text, nullable=True)
    resume_file_url = db.Column(db.String(500), nullable=True)
    skills = db.Column(db.Text, nullable=True)  # JSON string com habilidades
    experience_years = db.Column(db.Integer, nullable=True)
    current_position = db.Column(db.String(200), nullable=True)
    current_company = db.Column(db.String(200), nullable=True)
    location = db.Column(db.String(200), nullable=True)
    salary_expectation = db.Column(db.Numeric(10, 2), nullable=True)
    availability = db.Column(db.String(50), nullable=True)  # immediate, 2weeks, 1month, etc.
    source = db.Column(db.String(100), nullable=True)  # linkedin, extension, manual, etc.
    status = db.Column(db.String(50), nullable=False, default='new')  # new, contacted, interviewed, hired, rejected
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    notes = db.relationship('Note', backref='candidate', lazy=True, cascade='all, delete-orphan')
    candidate_tags = db.relationship('CandidateTag', backref='candidate', lazy=True, cascade='all, delete-orphan')
    job_matches = db.relationship('CandidateJobMatch', backref='candidate', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<Candidate {self.first_name} {self.last_name}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'tenant_id': self.tenant_id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'email': self.email,
            'phone': self.phone,
            'linkedin_url': self.linkedin_url,
            'resume_text': self.resume_text,
            'resume_file_url': self.resume_file_url,
            'skills': self.skills,
            'experience_years': self.experience_years,
            'current_position': self.current_position,
            'current_company': self.current_company,
            'location': self.location,
            'salary_expectation': float(self.salary_expectation) if self.salary_expectation else None,
            'availability': self.availability,
            'source': self.source,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

