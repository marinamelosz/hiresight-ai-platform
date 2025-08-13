from datetime import datetime
from src.models.user import db

class AuditLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=True)
    tenant_id = db.Column(db.Integer, db.ForeignKey("tenant.id"), nullable=True)
    action = db.Column(db.String(255), nullable=False)
    resource_type = db.Column(db.String(100), nullable=True)
    resource_id = db.Column(db.Integer, nullable=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    details = db.Column(db.Text, nullable=True)
    ip_address = db.Column(db.String(45), nullable=True)
    user_agent = db.Column(db.Text, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "tenant_id": self.tenant_id,
            "action": self.action,
            "resource_type": self.resource_type,
            "resource_id": self.resource_id,
            "timestamp": self.timestamp.isoformat(),
            "details": self.details,
            "ip_address": self.ip_address,
            "user_agent": self.user_agent
        }

    def __repr__(self):
        return f"<AuditLog {self.action} by User {self.user_id} at {self.timestamp}>"


