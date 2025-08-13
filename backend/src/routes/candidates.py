from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from sqlalchemy import and_, or_
from src.models import db, Candidate, Tag, CandidateTag
from src.utils.auth import require_tenant_access

candidates_bp = Blueprint("candidates", __name__)

def get_tenant_id_from_jwt():
    """Extrai o tenant_id do JWT"""
    claims = get_jwt()
    return claims.get("tenant_id")

@candidates_bp.route("/candidates", methods=["GET"])
@jwt_required()
@require_tenant_access
def get_candidates():
    """
    Listar Candidatos
    --- 
    parameters:
      - name: page
        in: query
        type: integer
        description: Número da página para paginação.
        default: 1
      - name: per_page
        in: query
        type: integer
        description: Número de itens por página.
        default: 20
      - name: search
        in: query
        type: string
        description: Termo de busca para nome, sobrenome, email, posição ou empresa.
      - name: status
        in: query
        type: string
        description: Filtrar por status do candidato (new, contacted, interviewed, hired, rejected).
        enum: [new, contacted, interviewed, hired, rejected]
      - name: tag_ids
        in: query
        type: array
        items:
          type: integer
        collectionFormat: multi
        description: IDs das tags para filtrar candidatos.
    security:
      - jwt:
          - 
    responses:
      200:
        description: Lista de candidatos com informações de paginação.
        schema:
          id: CandidateList
          properties:
            candidates:
              type: array
              items:
                type: object
                properties:
                  id:
                    type: integer
                  first_name:
                    type: string
                  last_name:
                    type: string
                  email:
                    type: string
                  status:
                    type: string
            pagination:
              type: object
              properties:
                page:
                  type: integer
                per_page:
                  type: integer
                total:
                  type: integer
                pages:
                  type: integer
                has_next:
                  type: boolean
                has_prev:
                  type: boolean
      401:
        description: Token de acesso ausente ou inválido.
      500:
        description: Erro interno do servidor.
    """
    try:
        tenant_id = get_tenant_id_from_jwt()
        
        page = request.args.get("page", 1, type=int)
        per_page = min(request.args.get("per_page", 20, type=int), 100)
        search = request.args.get("search", "").strip()
        status = request.args.get("status")
        tag_ids = request.args.getlist("tag_ids", type=int)
        
        query = Candidate.query.filter_by(tenant_id=tenant_id)
        
        if search:
            search_filter = or_(
                Candidate.first_name.ilike(f"%{search}%"),
                Candidate.last_name.ilike(f"%{search}%"),
                Candidate.email.ilike(f"%{search}%"),
                Candidate.current_position.ilike(f"%{search}%"),
                Candidate.current_company.ilike(f"%{search}%")
            )
            query = query.filter(search_filter)
        
        if status:
            query = query.filter_by(status=status)
        
        if tag_ids:
            query = query.join(CandidateTag).filter(CandidateTag.tag_id.in_(tag_ids))
        
        query = query.order_by(Candidate.updated_at.desc())
        
        pagination = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        candidates = [candidate.to_dict() for candidate in pagination.items]
        
        return jsonify({
            "candidates": candidates,
            "pagination": {
                "page": page,
                "per_page": per_page,
                "total": pagination.total,
                "pages": pagination.pages,
                "has_next": pagination.has_next,
                "has_prev": pagination.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({"error": "Erro interno do servidor"}), 500

@candidates_bp.route("/candidates", methods=["POST"])
@jwt_required()
def create_candidate():
    """
    Criar Novo Candidato
    --- 
    parameters:
      - name: body
        in: body
        required: true
        schema:
          id: NewCandidate
          required:
            - first_name
            - last_name
          properties:
            first_name:
              type: string
              description: Primeiro nome do candidato.
              example: João
            last_name:
              type: string
              description: Sobrenome do candidato.
              example: Silva
            email:
              type: string
              description: Email do candidato.
              example: joao.silva@example.com
            phone:
              type: string
              description: Telefone do candidato.
              example: "+5511987654321"
            linkedin_url:
              type: string
              description: URL do perfil do LinkedIn do candidato.
              example: https://www.linkedin.com/in/joaosilva
            resume_text:
              type: string
              description: Texto extraído do currículo do candidato.
            resume_file_url:
              type: string
              description: URL do arquivo do currículo do candidato.
            skills:
              type: string
              description: Habilidades do candidato (JSON string).
              example: "{\"programming\": [\"Python\", \"Java\"]}"
            experience_years:
              type: integer
              description: Anos de experiência do candidato.
              example: 5
            current_position:
              type: string
              description: Posição atual do candidato.
              example: Desenvolvedor Sênior
            current_company:
              type: string
              description: Empresa atual do candidato.
              example: Tech Solutions Ltda.
            location:
              type: string
              description: Localização do candidato.
              example: São Paulo, Brasil
            salary_expectation:
              type: number
              format: float
              description: Expectativa salarial do candidato.
              example: 8000.00
            availability:
              type: string
              description: Disponibilidade do candidato (immediate, 2weeks, 1month, etc.).
              example: 2weeks
            source:
              type: string
              description: Fonte do candidato (linkedin, extension, manual, etc.).
              example: linkedin
            status:
              type: string
              description: Status do candidato (new, contacted, interviewed, hired, rejected). Padrão é 'new'.
              enum: [new, contacted, interviewed, hired, rejected]
              example: new
    security:
      - jwt:
          - 
    responses:
      201:
        description: Candidato criado com sucesso.
        schema:
          id: CandidateCreated
          properties:
            message:
              type: string
            candidate:
              type: object
              properties:
                id:
                  type: integer
                first_name:
                  type: string
                last_name:
                  type: string
                email:
                  type: string
                status:
                  type: string
      400:
        description: Requisição inválida (nome ou sobrenome ausentes).
      401:
        description: Token de acesso ausente ou inválido.
      409:
        description: Candidato com este email já existe.
      500:
        description: Erro interno do servidor.
    """
    try:
        tenant_id = get_tenant_id_from_jwt()
        data = request.get_json()
        
        if not data or not data.get("first_name") or not data.get("last_name"):
            return jsonify({"error": "Nome e sobrenome são obrigatórios"}), 400
        
        email = data.get("email")
        if email:
            existing = Candidate.query.filter_by(
                tenant_id=tenant_id, 
                email=email.lower().strip()
            ).first()
            if existing:
                return jsonify({"error": "Candidato com este email já existe"}), 409
        
        candidate = Candidate(
            tenant_id=tenant_id,
            first_name=data.get("first_name").strip(),
            last_name=data.get("last_name").strip(),
            email=email.lower().strip() if email else None,
            phone=data.get("phone"),
            linkedin_url=data.get("linkedin_url"),
            resume_text=data.get("resume_text"),
            resume_file_url=data.get("resume_file_url"),
            skills=data.get("skills"),
            experience_years=data.get("experience_years"),
            current_position=data.get("current_position"),
            current_company=data.get("current_company"),
            location=data.get("location"),
            salary_expectation=data.get("salary_expectation"),
            availability=data.get("availability"),
            source=data.get("source", "manual"),
            status=data.get("status", "new")
        )
        
        db.session.add(candidate)
        db.session.commit()
        
        return jsonify({
            "message": "Candidato criado com sucesso",
            "candidate": candidate.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Erro interno do servidor"}), 500

@candidates_bp.route("/candidates/<int:candidate_id>", methods=["GET"])
@jwt_required()
def get_candidate(candidate_id):
    """
    Obter Candidato por ID
    --- 
    parameters:
      - name: candidate_id
        in: path
        type: integer
        required: true
        description: ID do candidato a ser recuperado.
    security:
      - jwt:
          - 
    responses:
      200:
        description: Informações do candidato.
        schema:
          id: CandidateDetail
          properties:
            candidate:
              type: object
              properties:
                id:
                  type: integer
                first_name:
                  type: string
                last_name:
                  type: string
                email:
                  type: string
                status:
                  type: string
      401:
        description: Token de acesso ausente ou inválido.
      404:
        description: Candidato não encontrado.
      500:
        description: Erro interno do servidor.
    """
    try:
        tenant_id = get_tenant_id_from_jwt()
        
        candidate = Candidate.query.filter_by(
            id=candidate_id, 
            tenant_id=tenant_id
        ).first()
        
        if not candidate:
            return jsonify({"error": "Candidato não encontrado"}), 404
        
        return jsonify({"candidate": candidate.to_dict()}), 200
        
    except Exception as e:
        return jsonify({"error": "Erro interno do servidor"}), 500

@candidates_bp.route("/candidates/<int:candidate_id>", methods=["PUT"])
@jwt_required()
def update_candidate(candidate_id):
    """
    Atualizar Candidato
    --- 
    parameters:
      - name: candidate_id
        in: path
        type: integer
        required: true
        description: ID do candidato a ser atualizado.
      - name: body
        in: body
        required: true
        schema:
          id: UpdateCandidate
          properties:
            first_name:
              type: string
              description: Primeiro nome do candidato.
            last_name:
              type: string
              description: Sobrenome do candidato.
            email:
              type: string
              description: Email do candidato.
            phone:
              type: string
              description: Telefone do candidato.
            linkedin_url:
              type: string
              description: URL do perfil do LinkedIn do candidato.
            resume_text:
              type: string
              description: Texto extraído do currículo do candidato.
            resume_file_url:
              type: string
              description: URL do arquivo do currículo do candidato.
            skills:
              type: string
              description: Habilidades do candidato (JSON string).
            experience_years:
              type: integer
              description: Anos de experiência do candidato.
            current_position:
              type: string
              description: Posição atual do candidato.
            current_company:
              type: string
              description: Empresa atual do candidato.
            location:
              type: string
              description: Localização do candidato.
            salary_expectation:
              type: number
              format: float
              description: Expectativa salarial do candidato.
            availability:
              type: string
              description: Disponibilidade do candidato.
            status:
              type: string
              description: Status do candidato.
              enum: [new, contacted, interviewed, hired, rejected]
    security:
      - jwt:
          - 
    responses:
      200:
        description: Candidato atualizado com sucesso.
        schema:
          id: CandidateUpdated
          properties:
            message:
              type: string
            candidate:
              type: object
              properties:
                id:
                  type: integer
                first_name:
                  type: string
                last_name:
                  type: string
                email:
                  type: string
                status:
                  type: string
      400:
        description: Requisição inválida.
      401:
        description: Token de acesso ausente ou inválido.
      404:
        description: Candidato não encontrado.
      409:
        description: Candidato com este email já existe.
      500:
        description: Erro interno do servidor.
    """
    try:
        tenant_id = get_tenant_id_from_jwt()
        data = request.get_json()
        
        candidate = Candidate.query.filter_by(
            id=candidate_id, 
            tenant_id=tenant_id
        ).first()
        
        if not candidate:
            return jsonify({"error": "Candidato não encontrado"}), 404
        
        email = data.get("email")
        if email and email.lower().strip() != candidate.email:
            existing = Candidate.query.filter_by(
                tenant_id=tenant_id, 
                email=email.lower().strip()
            ).first()
            if existing:
                return jsonify({"error": "Candidato com este email já existe"}), 409
        
        updatable_fields = [
            "first_name", "last_name", "email", "phone", "linkedin_url",
            "resume_text", "resume_file_url", "skills", "experience_years",
            "current_position", "current_company", "location", "salary_expectation",
            "availability", "status"
        ]
        
        for field in updatable_fields:
            if field in data:
                if field == "email" and data[field]:
                    setattr(candidate, field, data[field].lower().strip())
                else:
                    setattr(candidate, field, data[field])
        
        db.session.commit()
        
        return jsonify({
            "message": "Candidato atualizado com sucesso",
            "candidate": candidate.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Erro interno do servidor"}), 500

@candidates_bp.route("/candidates/<int:candidate_id>", methods=["DELETE"])
@jwt_required()
def delete_candidate(candidate_id):
    """
    Excluir Candidato
    --- 
    parameters:
      - name: candidate_id
        in: path
        type: integer
        required: true
        description: ID do candidato a ser excluído.
    security:
      - jwt:
          - 
    responses:
      200:
        description: Candidato excluído com sucesso.
      401:
        description: Token de acesso ausente ou inválido.
      404:
        description: Candidato não encontrado.
      500:
        description: Erro interno do servidor.
    """
    try:
        tenant_id = get_tenant_id_from_jwt()
        
        candidate = Candidate.query.filter_by(
            id=candidate_id, 
            tenant_id=tenant_id
        ).first()
        
        if not candidate:
            return jsonify({"error": "Candidato não encontrado"}), 404
        
        db.session.delete(candidate)
        db.session.commit()
        
        return jsonify({"message": "Candidato excluído com sucesso"}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Erro interno do servidor"}), 500

@candidates_bp.route("/candidates/<int:candidate_id>/tags", methods=["POST"])
@jwt_required()
def add_candidate_tag(candidate_id):
    """
    Adicionar Tag a Candidato
    --- 
    parameters:
      - name: candidate_id
        in: path
        type: integer
        required: true
        description: ID do candidato.
      - name: body
        in: body
        required: true
        schema:
          id: AddCandidateTag
          required:
            - tag_id
          properties:
            tag_id:
              type: integer
              description: ID da tag a ser adicionada.
              example: 1
    security:
      - jwt:
          - 
    responses:
      201:
        description: Tag adicionada com sucesso.
      400:
        description: Requisição inválida (ID da tag ausente).
      401:
        description: Token de acesso ausente ou inválido.
      404:
        description: Candidato ou Tag não encontrada.
      409:
        description: Tag já associada ao candidato.
      500:
        description: Erro interno do servidor.
    """
    try:
        tenant_id = get_tenant_id_from_jwt()
        data = request.get_json()
        
        if not data or not data.get("tag_id"):
            return jsonify({"error": "ID da tag é obrigatório"}), 400
        
        candidate = Candidate.query.filter_by(
            id=candidate_id, 
            tenant_id=tenant_id
        ).first()
        
        if not candidate:
            return jsonify({"error": "Candidato não encontrado"}), 404
        
        tag = Tag.query.filter_by(
            id=data.get("tag_id"), 
            tenant_id=tenant_id
        ).first()
        
        if not tag:
            return jsonify({"error": "Tag não encontrada"}), 404
        
        existing = CandidateTag.query.filter_by(
            candidate_id=candidate_id,
            tag_id=data.get("tag_id")
        ).first()
        
        if existing:
            return jsonify({"error": "Tag já associada ao candidato"}), 409
        
        candidate_tag = CandidateTag(
            candidate_id=candidate_id,
            tag_id=data.get("tag_id")
        )
        
        db.session.add(candidate_tag)
        db.session.commit()
        
        return jsonify({"message": "Tag adicionada com sucesso"}), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Erro interno do servidor"}), 500

@candidates_bp.route("/candidates/<int:candidate_id>/tags/<int:tag_id>", methods=["DELETE"])
@jwt_required()
def remove_candidate_tag(candidate_id, tag_id):
    """
    Remover Tag de Candidato
    --- 
    parameters:
      - name: candidate_id
        in: path
        type: integer
        required: true
        description: ID do candidato.
      - name: tag_id
        in: path
        type: integer
        required: true
        description: ID da tag a ser removida.
    security:
      - jwt:
          - 
    responses:
      200:
        description: Tag removida com sucesso.
      401:
        description: Token de acesso ausente ou inválido.
      404:
        description: Candidato ou associação não encontrada.
      500:
        description: Erro interno do servidor.
    """
    try:
        tenant_id = get_tenant_id_from_jwt()
        
        candidate = Candidate.query.filter_by(
            id=candidate_id, 
            tenant_id=tenant_id
        ).first()
        
        if not candidate:
            return jsonify({"error": "Candidato não encontrado"}), 404
        
        candidate_tag = CandidateTag.query.filter_by(
            candidate_id=candidate_id,
            tag_id=tag_id
        ).first()
        
        if not candidate_tag:
            return jsonify({"error": "Associação não encontrada"}), 404
        
        db.session.delete(candidate_tag)
        db.session.commit()
        
        return jsonify({"message": "Tag removida com sucesso"}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Erro interno do servidor"}), 500

