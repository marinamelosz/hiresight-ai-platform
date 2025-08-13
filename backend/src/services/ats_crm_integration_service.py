from typing import Dict, Any, List

class ATSCRMIntegrationService:
    def __init__(self):
        pass

    def unify_candidate_data(self, raw_data: Dict) -> Dict:
        """
        Unifica dados de candidatos de diferentes fontes ATS/CRM para um formato padrão.
        Este é um exemplo simplificado e precisaria ser expandido para cada ATS/CRM.
        """
        unified_data = {
            "first_name": raw_data.get("firstName", raw_data.get("givenName", "")),
            "last_name": raw_data.get("lastName", raw_data.get("familyName", "")),
            "email": raw_data.get("email", raw_data.get("emailAddress", "")),
            "phone": raw_data.get("phone", raw_data.get("phoneNumber", "")),
            "linkedin_url": raw_data.get("linkedinUrl", raw_data.get("linkedinProfile", "")),
            "resume_text": raw_data.get("resumeText", raw_data.get("cvContent", "")),
            "skills": raw_data.get("skills", raw_data.get("skillSet", "")),
            "experience_years": raw_data.get("experienceYears", raw_data.get("yearsOfExperience", 0)),
            "location": raw_data.get("location", raw_data.get("address", "")),
            "current_company": raw_data.get("currentCompany", raw_data.get("employer", "")),
            "current_position": raw_data.get("currentPosition", raw_data.get("jobTitle", "")),
            "source_ats_crm": raw_data.get("source", "unknown"), # Identifica a origem dos dados
            "source_id": raw_data.get("id", raw_data.get("candidateId", "")) # ID original no sistema de origem
        }
        return unified_data

    def sync_candidate_to_ats(self, unified_candidate_data: Dict, ats_crm_config: Dict) -> Dict:
        """
        Sincroniza dados de um candidato unificado para um ATS/CRM específico.
        Esta função simula a chamada a uma API externa.
        """
        ats_type = ats_crm_config.get("type")
        api_key = ats_crm_config.get("apiKey")
        # Exemplo simplificado: em um cenário real, haveria lógica específica para cada ATS/CRM
        print(f"Sincronizando candidato para {ats_type} com API Key {api_key}...")
        print(f"Dados do candidato: {unified_candidate_data}")
        
        # Simula uma resposta de sucesso da API do ATS/CRM
        return {"status": "success", "ats_crm_id": "ats_crm_candidate_123", "message": f"Candidato sincronizado com {ats_type}"}

    def enrich_and_deduplicate(self, new_candidate_data: Dict, existing_candidates: List[Dict]) -> Dict:
        """
        Enriquece e deduplica dados de um novo candidato com base em candidatos existentes.
        Usa a lógica de detecção de duplicatas do AIService.
        """
        # Simula a integração com o AIService para deduplicação e enriquecimento
        # Em um cenário real, o AIService seria injetado ou acessado de forma mais robusta
        from src.services.ai_service import AIService
        ai_service = AIService()

        # Enriquecimento
        enriched_data = ai_service.enrich_candidate_data(new_candidate_data)

        # Deduplicação
        all_candidates = existing_candidates + [enriched_data]
        duplicates = ai_service.detect_duplicate_candidates(all_candidates)
        
        is_duplicate = False
        duplicate_of = None
        for group in duplicates:
            if enriched_data in group and len(group) > 1:
                is_duplicate = True
                # Encontra o outro candidato no grupo que não é o novo
                for c in group:
                    if c != enriched_data:
                        duplicate_of = c.get("id") # Assume que o candidato existente tem um ID
                        break
                break

        return {
            "enriched_data": enriched_data,
            "is_duplicate": is_duplicate,
            "duplicate_of": duplicate_of
        }

    def configure_webhook(self, ats_crm_config: Dict, webhook_url: str) -> Dict:
        """
        Configura um webhook no ATS/CRM externo para enviar atualizações para a plataforma.
        Esta função simula a chamada a uma API externa para configurar o webhook.
        """
        ats_type = ats_crm_config.get("type")
        print(f"Configurando webhook para {ats_type} com URL: {webhook_url}")
        # Simula uma resposta de sucesso
        return {"status": "success", "message": f"Webhook configurado para {ats_type}"}


