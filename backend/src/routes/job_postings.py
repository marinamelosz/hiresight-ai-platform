from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models import db, JobPosting
from src.utils.auth import require_role
from src.utils.i18n import translate_text, get_user_locale

job_postings_bp = Blueprint("job_postings", __name__)

@job_postings_bp.route("/job-postings", methods=["POST"])
@jwt_required()
@require_role(["admin", "manager"])
def create_job_posting():
    """
    Cria uma nova vaga.
    ---
    tags:
      - Vagas
    parameters:
      - in: body
        name: body
        schema:
          type: object
          required:
            - title
            - description
            - requirements
            - experience_level
            - location
          properties:
            title:
              type: string
            description:
              type: string
            requirements:
              type: string
            experience_level:
              type: string
              enum: [entry, mid, senior, executive]
            location:
              type: string
            remote_work:
              type: boolean
            salary_min:
              type: number
            salary_max:
              type: number
    responses:
      201:
        description: Vaga criada com sucesso.
      400:
        description: Dados inválidos.
    """
    current_user = get_jwt_identity()
    data = request.get_json()

    if not all(k in data for k in ["title", "description", "requirements", "experience_level", "location"]):
        return jsonify({"error": "Campos obrigatórios ausentes."}), 400

    new_job_posting = JobPosting(
        title=data["title"],
        description=data["description"],
        requirements=data["requirements"],
        experience_level=data["experience_level"],
        location=data["location"],
        remote_work=data.get("remote_work", False),
        salary_min=data.get("salary_min"),
        salary_max=data.get("salary_max"),
        tenant_id=current_user["tenant_id"]
    )
    db.session.add(new_job_posting)
    db.session.commit()
    return jsonify(new_job_posting.to_dict()), 201

@job_postings_bp.route("/job-postings", methods=["GET"])
@jwt_required()
def get_job_postings():
    """
    Retorna todas as vagas do tenant.
    ---
    tags:
      - Vagas
    responses:
      200:
        description: Lista de vagas.
    """
    current_user = get_jwt_identity()
    locale = get_user_locale()
    job_postings = JobPosting.query.filter_by(tenant_id=current_user["tenant_id"]).all()
    
    translated_job_postings = []
    for job in job_postings:
        job_dict = job.to_dict()
        job_dict["title"] = translate_text(job_dict["title"], locale)
        job_dict["description"] = translate_text(job_dict["description"], locale)
        job_dict["requirements"] = translate_text(job_dict["requirements"], locale)
        job_dict["location"] = translate_text(job_dict["location"], locale)
        translated_job_postings.append(job_dict)

    return jsonify(translated_job_postings), 200

@job_postings_bp.route("/job-postings/<int:job_id>", methods=["GET"])
@jwt_required()
def get_job_posting(job_id):
    """
    Retorna uma vaga específica.
    ---
    tags:
      - Vagas
    parameters:
      - name: job_id
        in: path
        type: integer
        required: true
        description: ID da vaga.
    responses:
      200:
        description: Detalhes da vaga.
      404:
        description: Vaga não encontrada.
    """
    current_user = get_jwt_identity()
    locale = get_user_locale()
    job_posting = JobPosting.query.filter_by(id=job_id, tenant_id=current_user["tenant_id"]).first()
    if not job_posting:
        return jsonify({"error": "Vaga não encontrada."}), 404
    
    job_dict = job_posting.to_dict()
    job_dict["title"] = translate_text(job_dict["title"], locale)
    job_dict["description"] = translate_text(job_dict["description"], locale)
    job_dict["requirements"] = translate_text(job_dict["requirements"], locale)
    job_dict["location"] = translate_text(job_dict["location"], locale)

    return jsonify(job_dict), 200

@job_postings_bp.route("/job-postings/<int:job_id>", methods=["PUT"])
@jwt_required()
@require_role(["admin", "manager"])
def update_job_posting(job_id):
    """
    Atualiza uma vaga existente.
    ---
    tags:
      - Vagas
    parameters:
      - name: job_id
        in: path
        type: integer
        required: true
        description: ID da vaga.
      - in: body
        name: body
        schema:
          type: object
          properties:
            title:
              type: string
            description:
              type: string
            requirements:
              type: string
            experience_level:
              type: string
              enum: [entry, mid, senior, executive]
            location:
              type: string
            remote_work:
              type: boolean
            salary_min:
              type: number
            salary_max:
              type: number
    responses:
      200:
        description: Vaga atualizada com sucesso.
      400:
        description: Dados inválidos.
      404:
        description: Vaga não encontrada.
    """
    current_user = get_jwt_identity()
    job_posting = JobPosting.query.filter_by(id=job_id, tenant_id=current_user["tenant_id"]).first()
    if not job_posting:
        return jsonify({"error": "Vaga não encontrada."}), 404

    data = request.get_json()
    job_posting.title = data.get("title", job_posting.title)
    job_posting.description = data.get("description", job_posting.description)
    job_posting.requirements = data.get("requirements", job_posting.requirements)
    job_posting.experience_level = data.get("experience_level", job_posting.experience_level)
    job_posting.location = data.get("location", job_posting.location)
    job_posting.remote_work = data.get("remote_work", job_posting.remote_work)
    job_posting.salary_min = data.get("salary_min", job_posting.salary_min)
    job_posting.salary_max = data.get("salary_max", job_posting.salary_max)
    db.session.commit()
    return jsonify(job_posting.to_dict()), 200

@job_postings_bp.route("/job-postings/<int:job_id>", methods=["DELETE"])
@jwt_required()
@require_role(["admin", "manager"])
def delete_job_posting(job_id):
    """
    Deleta uma vaga.
    ---
    tags:
      - Vagas
    parameters:
      - name: job_id
        in: path
        type: integer
        required: true
        description: ID da vaga.
    responses:
      204:
        description: Vaga deletada com sucesso.
      404:
        description: Vaga não encontrada.
    """
    current_user = get_jwt_identity()
    job_posting = JobPosting.query.filter_by(id=job_id, tenant_id=current_user["tenant_id"]).first()
    if not job_posting:
        return jsonify({"error": "Vaga não encontrada."}), 404
    db.session.delete(job_posting)
    db.session.commit()
    return "", 204

