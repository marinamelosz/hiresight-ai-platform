from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from src.models.user import db

class JobPosting(db.Model):
    __tablename__ = 'job_postings'
    
    id = db.Column(db.Integer, primary_key=True)
    tenant_id = db.Column(db.Integer, db.ForeignKey('tenants.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    requirements = db.Column(db.Text, nullable=True)
    responsibilities = db.Column(db.Text, nullable=True)
    department = db.Column(db.String(100), nullable=True)
    location = db.Column(db.String(200), nullable=True)
    employment_type = db.Column(db.String(50), nullable=True)  # full-time, part-time, contract, etc.
    experience_level = db.Column(db.String(50), nullable=True)  # entry, mid, senior, executive
    salary_min = db.Column(db.Numeric(10, 2), nullable=True)
    salary_max = db.Column(db.Numeric(10, 2), nullable=True)
    currency = db.Column(db.String(3), nullable=True, default='USD')
    remote_work = db.Column(db.Boolean, default=False)
    status = db.Column(db.String(50), nullable=False, default='draft')  # draft, active, paused, closed
    priority = db.Column(db.String(20), nullable=False, default='medium')  # low, medium, high, urgent
    external_job_id = db.Column(db.String(100), nullable=True)  # ID do sistema ATS externo
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deadline = db.Column(db.DateTime, nullable=True)
    
    # Relacionamentos
    job_matches = db.relationship('CandidateJobMatch', backref='job_posting', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<JobPosting {self.title}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'tenant_id': self.tenant_id,
            'title': self.title,
            'description': self.description,
            'requirements': self.requirements,
            'responsibilities': self.responsibilities,
            'department': self.department,
            'location': self.location,
            'employment_type': self.employment_type,
            'experience_level': self.experience_level,
            'salary_min': float(self.salary_min) if self.salary_min else None,
            'salary_max': float(self.salary_max) if self.salary_max else None,
            'currency': self.currency,
            'remote_work': self.remote_work,
            'status': self.status,
            'priority': self.priority,
            'external_job_id': self.external_job_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'deadline': self.deadline.isoformat() if self.deadline else None
        }

