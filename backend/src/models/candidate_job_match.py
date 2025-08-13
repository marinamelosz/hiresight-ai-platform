from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from src.models.user import db

class CandidateJobMatch(db.Model):
    __tablename__ = 'candidate_job_matches'
    
    id = db.Column(db.Integer, primary_key=True)
    candidate_id = db.Column(db.Integer, db.ForeignKey('candidates.id'), nullable=False)
    job_posting_id = db.Column(db.Integer, db.ForeignKey('job_postings.id'), nullable=False)
    match_score = db.Column(db.Float, nullable=False)  # Pontuação de 0.0 a 1.0
    ai_analysis = db.Column(db.Text, nullable=True)  # Análise detalhada da IA
    status = db.Column(db.String(50), nullable=False, default='pending')  # pending, reviewed, approved, rejected
    reviewed_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    reviewed_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamento com o usuário que revisou
    reviewer = db.relationship('User', foreign_keys=[reviewed_by], backref='reviewed_matches')
    
    # Índice único para evitar duplicatas
    __table_args__ = (db.UniqueConstraint('candidate_id', 'job_posting_id', name='unique_candidate_job_match'),)
    
    def __repr__(self):
        return f'<CandidateJobMatch candidate_id={self.candidate_id} job_id={self.job_posting_id} score={self.match_score}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'candidate_id': self.candidate_id,
            'job_posting_id': self.job_posting_id,
            'match_score': self.match_score,
            'ai_analysis': self.ai_analysis,
            'status': self.status,
            'reviewed_by': self.reviewed_by,
            'reviewed_at': self.reviewed_at.isoformat() if self.reviewed_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

