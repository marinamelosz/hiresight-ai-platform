from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from src.models import db, Tag
from src.utils.auth import require_tenant_access, require_role

tags_bp = Blueprint("tags", __name__)

def get_tenant_id_from_jwt():
    """Extrai o tenant_id do JWT"""
    claims = get_jwt()
    return claims.get("tenant_id")

@tags_bp.route("/tags", methods=["GET"])
@jwt_required()
@require_tenant_access
def get_tags():
    """
    Listar Tags
    --- 
    security:
      - jwt:
          - 
    responses:
      200:
        description: Lista de tags do tenant.
        schema:
          id: TagList
          properties:
            tags:
              type: array
              items:
                type: object
                properties:
                  id:
                    type: integer
                  name:
                    type: string
                  color:
                    type: string
                  description:
                    type: string
      401:
        description: Token de acesso ausente ou inválido.
      500:
        description: Erro interno do servidor.
    """
    try:
        tenant_id = get_tenant_id_from_jwt()
        
        tags = Tag.query.filter_by(tenant_id=tenant_id).order_by(Tag.name).all()
        
        return jsonify({"tags": [tag.to_dict() for tag in tags]}), 200
        
    except Exception as e:
        return jsonify({"error": "Erro interno do servidor"}), 500

@tags_bp.route("/tags", methods=["POST"])
@jwt_required()
@require_role(["admin", "manager"])
@require_tenant_access
def create_tag():
    """
    Criar Nova Tag
    --- 
    parameters:
      - name: body
        in: body
        required: true
        schema:
          id: NewTag
          required:
            - name
          properties:
            name:
              type: string
              description: Nome da tag.
              example: Urgente
            color:
              type: string
              description: Cor da tag em formato hexadecimal.
              example: "#FF0000"
            description:
              type: string
              description: Descrição da tag.
              example: Candidatos com alta prioridade.
    security:
      - jwt:
          - 
    responses:
      201:
        description: Tag criada com sucesso.
        schema:
          id: TagCreated
          properties:
            message:
              type: string
            tag:
              type: object
              properties:
                id:
                  type: integer
                name:
                  type: string
                color:
                  type: string
      400:
        description: Requisição inválida (nome da tag ausente).
      401:
        description: Token de acesso ausente ou inválido.
      403:
        description: Acesso negado - permissão insuficiente.
      409:
        description: Tag com este nome já existe para sua organização.
      500:
        description: Erro interno do servidor.
    """
    try:
        tenant_id = get_tenant_id_from_jwt()
        data = request.get_json()
        
        if not data or not data.get("name"):
            return jsonify({"error": "Nome da tag é obrigatório"}), 400
        
        name = data.get("name").strip()
        
        existing_tag = Tag.query.filter_by(
            tenant_id=tenant_id,
            name=name
        ).first()
        
        if existing_tag:
            return jsonify({"error": "Tag com este nome já existe para sua organização"}), 409
        
        tag = Tag(
            tenant_id=tenant_id,
            name=name,
            color=data.get("color"),
            description=data.get("description")
        )
        
        db.session.add(tag)
        db.session.commit()
        
        return jsonify({
            "message": "Tag criada com sucesso",
            "tag": tag.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Erro interno do servidor"}), 500

@tags_bp.route("/tags/<int:tag_id>", methods=["PUT"])
@jwt_required()
@require_role(["admin", "manager"])
@require_tenant_access
def update_tag(tag_id):
    """
    Atualizar Tag
    --- 
    parameters:
      - name: tag_id
        in: path
        type: integer
        required: true
        description: ID da tag a ser atualizada.
      - name: body
        in: body
        required: true
        schema:
          id: UpdateTag
          properties:
            name:
              type: string
              description: Novo nome da tag.
            color:
              type: string
              description: Nova cor da tag em formato hexadecimal.
            description:
              type: string
              description: Nova descrição da tag.
    security:
      - jwt:
          - 
    responses:
      200:
        description: Tag atualizada com sucesso.
        schema:
          id: TagUpdated
          properties:
            message:
              type: string
            tag:
              type: object
              properties:
                id:
                  type: integer
                name:
                  type: string
                color:
                  type: string
      400:
        description: Requisição inválida.
      401:
        description: Token de acesso ausente ou inválido.
      403:
        description: Acesso negado - permissão insuficiente.
      404:
        description: Tag não encontrada.
      409:
        description: Tag com este nome já existe para sua organização.
      500:
        description: Erro interno do servidor.
    """
    try:
        tenant_id = get_tenant_id_from_jwt()
        data = request.get_json()
        
        tag = Tag.query.filter_by(id=tag_id, tenant_id=tenant_id).first()
        
        if not tag:
            return jsonify({"error": "Tag não encontrada"}), 404
        
        if "name" in data and data["name"].strip() != tag.name:
            name = data["name"].strip()
            existing_tag = Tag.query.filter_by(
                tenant_id=tenant_id,
                name=name
            ).first()
            if existing_tag:
                return jsonify({"error": "Tag com este nome já existe para sua organização"}), 409
            tag.name = name
            
        if "color" in data:
            tag.color = data["color"]
        if "description" in data:
            tag.description = data["description"]
            
        db.session.commit()
        
        return jsonify({
            "message": "Tag atualizada com sucesso",
            "tag": tag.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Erro interno do servidor"}), 500

@tags_bp.route("/tags/<int:tag_id>", methods=["DELETE"])
@jwt_required()
@require_role(["admin", "manager"])
@require_tenant_access
def delete_tag(tag_id):
    """
    Excluir Tag
    --- 
    parameters:
      - name: tag_id
        in: path
        type: integer
        required: true
        description: ID da tag a ser excluída.
    security:
      - jwt:
          - 
    responses:
      200:
        description: Tag excluída com sucesso.
      401:
        description: Token de acesso ausente ou inválido.
      403:
        description: Acesso negado - permissão insuficiente.
      404:
        description: Tag não encontrada.
      500:
        description: Erro interno do servidor.
    """
    try:
        tenant_id = get_tenant_id_from_jwt()
        
        tag = Tag.query.filter_by(id=tag_id, tenant_id=tenant_id).first()
        
        if not tag:
            return jsonify({"error": "Tag não encontrada"}), 404
        
        db.session.delete(tag)
        db.session.commit()
        
        return jsonify({"message": "Tag excluída com sucesso"}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Erro interno do servidor"}), 500

