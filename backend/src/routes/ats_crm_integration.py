from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.services.ats_crm_integration_service import ATSCRMIntegrationService
from src.models import db, Candidate # Importar Candidate para deduplicação
from src.utils.auth import require_role

ats_crm_integration_bp = Blueprint("ats_crm_integration", __name__)
ats_crm_service = ATSCRMIntegrationService()

@ats_crm_integration_bp.route("/integrate/candidate", methods=["POST"])
@jwt_required()
def integrate_candidate():
    """
    Integra um candidato de um ATS/CRM externo.
    ---
    tags:
      - ATS/CRM Integration
    parameters:
      - in: body
        name: body
        schema:
          type: object
          required:
            - raw_data
            - ats_crm_config
          properties:
            raw_data:
              type: object
              description: Dados brutos do candidato do ATS/CRM externo.
            ats_crm_config:
              type: object
              description: Configurações do ATS/CRM (ex: tipo, apiKey).
    responses:
      200:
        description: Candidato integrado com sucesso.
      400:
        description: Dados inválidos.
    """
    current_user = get_jwt_identity()
    data = request.get_json()
    raw_data = data.get("raw_data")
    ats_crm_config = data.get("ats_crm_config")

    if not raw_data or not ats_crm_config:
        return jsonify({"error": "Dados brutos ou configuração do ATS/CRM ausentes."}), 400

    unified_data = ats_crm_service.unify_candidate_data(raw_data)

    # Para deduplicação e enriquecimento, precisamos dos candidatos existentes do tenant
    existing_candidates = Candidate.query.filter_by(tenant_id=current_user["tenant_id"]).all()
    existing_candidates_list = []
    for c in existing_candidates:
        existing_candidates_list.append({
            "id": c.id,
            "first_name": c.first_name,
            "last_name": c.last_name,
            "email": c.email,
            "phone": c.phone,
            "linkedin_url": c.linkedin_url,
            "resume_text": c.resume_text,
            "skills": c.skills,
            "experience_years": c.experience_years,
            "location": c.location,
            "salary_expectation": c.salary_expectation
        })

    processed_data = ats_crm_service.enrich_and_deduplicate(unified_data, existing_candidates_list)

    if processed_data["is_duplicate"]:
        return jsonify({"message": "Candidato duplicado detectado, não adicionado.", "duplicate_of": processed_data["duplicate_of"]}), 200

    # Salvar o candidato unificado no banco de dados
    new_candidate = Candidate(
        first_name=processed_data["enriched_data"].get("first_name"),
        last_name=processed_data["enriched_data"].get("last_name"),
        email=processed_data["enriched_data"].get("email"),
        phone=processed_data["enriched_data"].get("phone"),
        linkedin_url=processed_data["enriched_data"].get("linkedin_url"),
        resume_text=processed_data["enriched_data"].get("resume_text"),
        skills=processed_data["enriched_data"].get("skills"),
        experience_years=processed_data["enriched_data"].get("experience_years"),
        location=processed_data["enriched_data"].get("location"),
        salary_expectation=processed_data["enriched_data"].get("salary_expectation"),
        tenant_id=current_user["tenant_id"]
    )
    db.session.add(new_candidate)
    db.session.commit()

    # Sincronizar de volta para o ATS/CRM (exemplo)
    sync_result = ats_crm_service.sync_candidate_to_ats(unified_data, ats_crm_config)

    return jsonify({"message": "Candidato integrado e sincronizado com sucesso!", "candidate_id": new_candidate.id, "sync_result": sync_result}), 200

@ats_crm_integration_bp.route("/integrate/webhook", methods=["POST"])
@jwt_required()
@require_role(["admin"])
def configure_ats_webhook():
    """
    Configura um webhook em um ATS/CRM externo.
    ---
    tags:
      - ATS/CRM Integration
    parameters:
      - in: body
        name: body
        schema:
          type: object
          required:
            - ats_crm_config
            - webhook_url
          properties:
            ats_crm_config:
              type: object
              description: Configurações do ATS/CRM.
            webhook_url:
              type: string
              description: URL para onde o webhook deve enviar os dados.
    responses:
      200:
        description: Webhook configurado com sucesso.
      400:
        description: Dados inválidos.
    """
    data = request.get_json()
    ats_crm_config = data.get("ats_crm_config")
    webhook_url = data.get("webhook_url")

    if not ats_crm_config or not webhook_url:
        return jsonify({"error": "Configuração do ATS/CRM ou URL do webhook ausentes."}), 400

    result = ats_crm_service.configure_webhook(ats_crm_config, webhook_url)
    return jsonify(result), 200


