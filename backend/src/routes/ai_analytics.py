from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models import db, Candidate, JobPosting, CandidateJobMatch
from src.services.ai_service import AIService
from src.utils.auth import require_role

ai_analytics_bp = Blueprint('ai_analytics', __name__)
ai_service = AIService()

@ai_analytics_bp.route('/candidates/<int:candidate_id>/analyze', methods=['POST'])
@jwt_required()
def analyze_candidate(candidate_id):
    """
    Analisa um candidato usando IA
    ---
    tags:
      - AI Analytics
    parameters:
      - name: candidate_id
        in: path
        type: integer
        required: true
        description: ID do candidato
    responses:
      200:
        description: Análise do candidato
      404:
        description: Candidato não encontrado
    """
    current_user = get_jwt_identity()
    
    candidate = Candidate.query.filter_by(
        id=candidate_id, 
        tenant_id=current_user['tenant_id']
    ).first()
    
    if not candidate:
        return jsonify({'error': 'Candidato não encontrado'}), 404
    
    # Preparar dados do candidato
    candidate_data = {
        'first_name': candidate.first_name,
        'last_name': candidate.last_name,
        'email': candidate.email,
        'skills': candidate.skills,
        'resume_text': candidate.resume_text,
        'experience_years': candidate.experience_years,
        'location': candidate.location,
        'salary_expectation': candidate.salary_expectation
    }
    
    # Analisar candidato
    analysis = ai_service.analyze_resume_text(candidate.resume_text or '')
    enriched_data = ai_service.enrich_candidate_data(candidate_data)
    
    return jsonify({
        'candidate_id': candidate_id,
        'analysis': analysis,
        'enriched_data': enriched_data
    })

@ai_analytics_bp.route('/jobs/<int:job_id>/recommend-candidates', methods=['GET'])
@jwt_required()
def recommend_candidates_for_job(job_id):
    """
    Recomenda candidatos para uma vaga
    ---
    tags:
      - AI Analytics
    parameters:
      - name: job_id
        in: path
        type: integer
        required: true
        description: ID da vaga
      - name: limit
        in: query
        type: integer
        default: 10
        description: Número máximo de candidatos recomendados
    responses:
      200:
        description: Lista de candidatos recomendados
      404:
        description: Vaga não encontrada
    """
    current_user = get_jwt_identity()
    limit = request.args.get('limit', 10, type=int)
    
    job = JobPosting.query.filter_by(
        id=job_id, 
        tenant_id=current_user['tenant_id']
    ).first()
    
    if not job:
        return jsonify({'error': 'Vaga não encontrada'}), 404
    
    # Buscar candidatos do mesmo tenant
    candidates = Candidate.query.filter_by(
        tenant_id=current_user['tenant_id']
    ).all()
    
    # Preparar dados da vaga
    job_data = {
        'title': job.title,
        'description': job.description,
        'requirements': job.requirements,
        'experience_level': job.experience_level,
        'location': job.location,
        'remote_work': job.remote_work,
        'salary_min': job.salary_min,
        'salary_max': job.salary_max
    }
    
    # Preparar dados dos candidatos
    candidates_data = []
    for candidate in candidates:
        candidate_data = {
            'id': candidate.id,
            'first_name': candidate.first_name,
            'last_name': candidate.last_name,
            'email': candidate.email,
            'skills': candidate.skills,
            'resume_text': candidate.resume_text,
            'experience_years': candidate.experience_years,
            'location': candidate.location,
            'salary_expectation': candidate.salary_expectation
        }
        candidates_data.append(candidate_data)
    
    # Obter recomendações
    recommendations = ai_service.recommend_candidates(job_data, candidates_data, limit)
    
    return jsonify({
        'job_id': job_id,
        'recommendations': recommendations
    })

@ai_analytics_bp.route('/candidates/<int:candidate_id>/compatibility/<int:job_id>', methods=['GET'])
@jwt_required()
def calculate_compatibility(candidate_id, job_id):
    """
    Calcula a compatibilidade entre candidato e vaga
    ---
    tags:
      - AI Analytics
    parameters:
      - name: candidate_id
        in: path
        type: integer
        required: true
        description: ID do candidato
      - name: job_id
        in: path
        type: integer
        required: true
        description: ID da vaga
    responses:
      200:
        description: Score de compatibilidade
      404:
        description: Candidato ou vaga não encontrados
    """
    current_user = get_jwt_identity()
    
    candidate = Candidate.query.filter_by(
        id=candidate_id, 
        tenant_id=current_user['tenant_id']
    ).first()
    
    job = JobPosting.query.filter_by(
        id=job_id, 
        tenant_id=current_user['tenant_id']
    ).first()
    
    if not candidate:
        return jsonify({'error': 'Candidato não encontrado'}), 404
    
    if not job:
        return jsonify({'error': 'Vaga não encontrada'}), 404
    
    # Preparar dados
    candidate_data = {
        'skills': candidate.skills,
        'resume_text': candidate.resume_text,
        'experience_years': candidate.experience_years,
        'location': candidate.location,
        'salary_expectation': candidate.salary_expectation
    }
    
    job_data = {
        'description': job.description,
        'requirements': job.requirements,
        'experience_level': job.experience_level,
        'location': job.location,
        'remote_work': job.remote_work,
        'salary_min': job.salary_min,
        'salary_max': job.salary_max
    }
    
    # Calcular compatibilidade
    compatibility = ai_service.calculate_compatibility_score(candidate_data, job_data)
    
    # Salvar no banco de dados
    existing_match = CandidateJobMatch.query.filter_by(
        candidate_id=candidate_id,
        job_posting_id=job_id
    ).first()
    
    if existing_match:
        existing_match.compatibility_score = compatibility['overall_score']
        existing_match.score_breakdown = compatibility
    else:
        new_match = CandidateJobMatch(
            candidate_id=candidate_id,
            job_posting_id=job_id,
            compatibility_score=compatibility['overall_score'],
            score_breakdown=compatibility,
            tenant_id=current_user['tenant_id']
        )
        db.session.add(new_match)
    
    db.session.commit()
    
    return jsonify({
        'candidate_id': candidate_id,
        'job_id': job_id,
        'compatibility': compatibility
    })

@ai_analytics_bp.route('/candidates/duplicates', methods=['GET'])
@jwt_required()
@require_role(['admin', 'manager'])
def detect_duplicate_candidates():
    """
    Detecta candidatos duplicados
    ---
    tags:
      - AI Analytics
    parameters:
      - name: threshold
        in: query
        type: number
        default: 0.8
        description: Limiar de similaridade (0-1)
    responses:
      200:
        description: Lista de grupos de candidatos duplicados
    """
    current_user = get_jwt_identity()
    threshold = request.args.get('threshold', 0.8, type=float)
    
    # Buscar candidatos do tenant
    candidates = Candidate.query.filter_by(
        tenant_id=current_user['tenant_id']
    ).all()
    
    # Preparar dados dos candidatos
    candidates_data = []
    for candidate in candidates:
        candidate_data = {
            'id': candidate.id,
            'first_name': candidate.first_name,
            'last_name': candidate.last_name,
            'email': candidate.email,
            'phone': candidate.phone,
            'linkedin_url': candidate.linkedin_url
        }
        candidates_data.append(candidate_data)
    
    # Detectar duplicatas
    duplicates = ai_service.detect_duplicate_candidates(candidates_data, threshold)
    
    return jsonify({
        'duplicates': duplicates,
        'threshold': threshold,
        'total_groups': len(duplicates)
    })

@ai_analytics_bp.route('/analytics/dashboard', methods=['GET'])
@jwt_required()
def get_analytics_dashboard():
    """
    Retorna dados para o dashboard de analytics
    ---
    tags:
      - AI Analytics
    responses:
      200:
        description: Dados de analytics
    """
    current_user = get_jwt_identity()
    
    # Estatísticas básicas
    total_candidates = Candidate.query.filter_by(tenant_id=current_user['tenant_id']).count()
    total_jobs = JobPosting.query.filter_by(tenant_id=current_user['tenant_id']).count()
    total_matches = CandidateJobMatch.query.filter_by(tenant_id=current_user['tenant_id']).count()
    
    # Top skills mais comuns
    candidates_with_skills = Candidate.query.filter(
        Candidate.tenant_id == current_user['tenant_id'],
        Candidate.skills.isnot(None)
    ).all()
    
    all_skills = []
    for candidate in candidates_with_skills:
        if candidate.skills:
            skills = [skill.strip().lower() for skill in candidate.skills.split(',')]
            all_skills.extend(skills)
    
    from collections import Counter
    skill_counts = Counter(all_skills)
    top_skills = skill_counts.most_common(10)
    
    # Distribuição de scores de compatibilidade
    matches = CandidateJobMatch.query.filter_by(tenant_id=current_user['tenant_id']).all()
    score_distribution = {
        '90-100': 0,
        '80-89': 0,
        '70-79': 0,
        '60-69': 0,
        '50-59': 0,
        '0-49': 0
    }
    
    for match in matches:
        score = match.compatibility_score or 0
        if score >= 90:
            score_distribution['90-100'] += 1
        elif score >= 80:
            score_distribution['80-89'] += 1
        elif score >= 70:
            score_distribution['70-79'] += 1
        elif score >= 60:
            score_distribution['60-69'] += 1
        elif score >= 50:
            score_distribution['50-59'] += 1
        else:
            score_distribution['0-49'] += 1
    
    return jsonify({
        'basic_stats': {
            'total_candidates': total_candidates,
            'total_jobs': total_jobs,
            'total_matches': total_matches
        },
        'top_skills': top_skills,
        'score_distribution': score_distribution
    })

