from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from src.models import db, User, Tenant
from src.services.audit_service import AuditService
import bcrypt

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    """
    Registra um novo usuário e tenant.
    ---
    tags:
      - Autenticação
    parameters:
      - in: body
        name: body
        schema:
          type: object
          required:
            - first_name
            - last_name
            - email
            - password
            - tenant_name
          properties:
            first_name:
              type: string
            last_name:
              type: string
            email:
              type: string
            password:
              type: string
            tenant_name:
              type: string
    responses:
      201:
        description: Usuário e tenant registrados com sucesso.
      400:
        description: Email ou nome do tenant já existem.
    """
    data = request.get_json()
    first_name = data.get("first_name")
    last_name = data.get("last_name")
    email = data.get("email")
    password = data.get("password")
    tenant_name = data.get("tenant_name")

    if not all([first_name, last_name, email, password, tenant_name]):
        return jsonify({"error": "Todos os campos são obrigatórios."}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email já registrado."}), 400

    if Tenant.query.filter_by(name=tenant_name).first():
        return jsonify({"error": "Nome do tenant já existe."}), 400

    hashed_password = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    new_tenant = Tenant(name=tenant_name)
    db.session.add(new_tenant)
    db.session.flush() # Para obter o ID do tenant antes do commit

    new_user = User(
        first_name=first_name,
        last_name=last_name,
        email=email,
        password=hashed_password,
        role="admin", # Primeiro usuário do tenant é admin
        tenant_id=new_tenant.id
    )
    db.session.add(new_user)
    db.session.commit()

    AuditService.log_action(
        action="user_registered",
        resource_type="User",
        resource_id=new_user.id,
        details=f"Novo usuário {new_user.email} registrado para o tenant {new_tenant.name}."
    )
    AuditService.log_action(
        action="tenant_created",
        resource_type="Tenant",
        resource_id=new_tenant.id,
        details=f"Novo tenant {new_tenant.name} criado por {new_user.email}."
    )

    return jsonify({"message": "Usuário e tenant registrados com sucesso!"}), 201

@auth_bp.route("/login", methods=["POST"])
def login():
    """
    Autentica um usuário e retorna um token JWT.
    ---
    tags:
      - Autenticação
    parameters:
      - in: body
        name: body
        schema:
          type: object
          required:
            - email
            - password
          properties:
            email:
              type: string
            password:
              type: string
    responses:
      200:
        description: Login bem-sucedido.
      401:
        description: Credenciais inválidas.
    """
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    user = User.query.filter_by(email=email).first()

    if not user or not bcrypt.checkpw(password.encode("utf-8"), user.password.encode("utf-8")):
        AuditService.log_action(
            action="login_failed",
            resource_type="User",
            details=f"Tentativa de login falhou para o email: {email}."
        )
        return jsonify({"error": "Credenciais inválidas."}), 401

    access_token = create_access_token(identity={
        "id": user.id,
        "email": user.email,
        "role": user.role,
        "tenant_id": user.tenant_id
    })

    AuditService.log_action(
        action="user_logged_in",
        resource_type="User",
        resource_id=user.id,
        tenant_id=user.tenant_id,
        details=f"Usuário {user.email} logado com sucesso."
    )

    return jsonify(access_token=access_token, user={
        "id": user.id,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "role": user.role,
        "tenant_id": user.tenant_id
    }), 200

@auth_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    """
    Faz logout do usuário.
    ---
    tags:
      - Autenticação
    responses:
      200:
        description: Logout bem-sucedido.
    """
    current_user_identity = get_jwt_identity()
    AuditService.log_action(
        action="user_logged_out",
        resource_type="User",
        resource_id=current_user_identity["id"],
        tenant_id=current_user_identity["tenant_id"],
        details=f"Usuário {current_user_identity["email"]} fez logout."
    )
    return jsonify({"message": "Logout bem-sucedido!"}), 200


