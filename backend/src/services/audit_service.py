from flask import request, g
from flask_jwt_extended import get_current_user, get_jwt_identity
from src.models import db, AuditLog

class AuditService:
    @staticmethod
    def log_action(action, resource_type=None, resource_id=None, details=None):
        user_id = None
        tenant_id = None
        try:
            # Tenta obter o usuário logado
            current_user_identity = get_jwt_identity()
            if current_user_identity:
                user_id = current_user_identity.get("id")
                tenant_id = current_user_identity.get("tenant_id")
        except RuntimeError: # No active application context
            pass
        except Exception as e:
            print(f"Erro ao obter identidade do usuário para auditoria: {e}")

        ip_address = request.remote_addr if request else None
        user_agent = request.headers.get("User-Agent") if request else None

        audit_log = AuditLog(
            user_id=user_id,
            tenant_id=tenant_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            details=details,
            ip_address=ip_address,
            user_agent=user_agent
        )
        db.session.add(audit_log)
        db.session.commit()


