import re
import json
from typing import Dict, List, Optional
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

class AIService:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(
            stop_words='english',
            max_features=1000,
            ngram_range=(1, 2)
        )
        
    def extract_skills(self, text: str) -> List[str]:
        """Extrai habilidades de um texto usando regex e palavras-chave."""
        if not text:
            return []
            
        # Lista de habilidades técnicas comuns
        technical_skills = [
            'python', 'java', 'javascript', 'react', 'angular', 'vue', 'node.js',
            'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'docker', 'kubernetes',
            'aws', 'azure', 'gcp', 'git', 'jenkins', 'ci/cd', 'agile', 'scrum',
            'machine learning', 'data science', 'artificial intelligence', 'deep learning',
            'tensorflow', 'pytorch', 'pandas', 'numpy', 'scikit-learn', 'flask', 'django',
            'html', 'css', 'bootstrap', 'tailwind', 'figma', 'photoshop', 'illustrator'
        ]
        
        # Lista de soft skills
        soft_skills = [
            'leadership', 'communication', 'teamwork', 'problem solving', 'creativity',
            'adaptability', 'time management', 'critical thinking', 'collaboration',
            'project management', 'analytical thinking', 'attention to detail'
        ]
        
        all_skills = technical_skills + soft_skills
        text_lower = text.lower()
        found_skills = []
        
        for skill in all_skills:
            if skill.lower() in text_lower:
                found_skills.append(skill)
                
        return list(set(found_skills))
    
    def extract_experience_years(self, text: str) -> Optional[int]:
        """Extrai anos de experiência de um texto."""
        if not text:
            return None
            
        # Padrões para encontrar anos de experiência
        patterns = [
            r'(\d+)\s*(?:years?|anos?)\s*(?:of\s*)?(?:experience|experiência)',
            r'(\d+)\+\s*(?:years?|anos?)',
            r'(\d+)\s*(?:years?|anos?)\s*(?:in|em)',
        ]
        
        text_lower = text.lower()
        for pattern in patterns:
            match = re.search(pattern, text_lower)
            if match:
                return int(match.group(1))
                
        return None
    
    def calculate_compatibility_score(self, candidate_data: Dict, job_data: Dict) -> Dict:
        """Calcula a pontuação de compatibilidade entre candidato e vaga."""
        score_breakdown = {
            'skills_match': 0,
            'experience_match': 0,
            'location_match': 0,
            'salary_match': 0,
            'overall_score': 0
        }
        
        # 1. Análise de habilidades (40% do score)
        candidate_skills = self.extract_skills(candidate_data.get('skills', '') + ' ' + candidate_data.get('resume_text', ''))
        job_skills = self.extract_skills(job_data.get('requirements', '') + ' ' + job_data.get('description', ''))
        
        if candidate_skills and job_skills:
            skills_intersection = set(candidate_skills) & set(job_skills)
            skills_match_ratio = len(skills_intersection) / len(job_skills) if job_skills else 0
            score_breakdown['skills_match'] = min(skills_match_ratio * 100, 100)
        
        # 2. Análise de experiência (30% do score)
        candidate_exp = candidate_data.get('experience_years', 0) or self.extract_experience_years(candidate_data.get('resume_text', '')) or 0
        job_exp_level = job_data.get('experience_level', 'entry')
        
        exp_requirements = {
            'entry': (0, 2),
            'mid': (2, 5),
            'senior': (5, 10),
            'executive': (10, 20)
        }
        
        min_exp, max_exp = exp_requirements.get(job_exp_level, (0, 2))
        if min_exp <= candidate_exp <= max_exp:
            score_breakdown['experience_match'] = 100
        elif candidate_exp > max_exp:
            score_breakdown['experience_match'] = max(100 - (candidate_exp - max_exp) * 10, 50)
        else:
            score_breakdown['experience_match'] = max(candidate_exp / min_exp * 100 if min_exp > 0 else 0, 0)
        
        # 3. Análise de localização (15% do score)
        candidate_location = candidate_data.get('location', '').lower()
        job_location = job_data.get('location', '').lower()
        job_remote = job_data.get('remote_work', False)
        
        if job_remote or candidate_location in job_location or job_location in candidate_location:
            score_breakdown['location_match'] = 100
        else:
            score_breakdown['location_match'] = 50  # Parcial se não for exata
        
        # 4. Análise de salário (15% do score)
        candidate_salary = candidate_data.get('salary_expectation', 0) or 0
        job_salary_min = job_data.get('salary_min', 0) or 0
        job_salary_max = job_data.get('salary_max', 0) or 0
        
        if candidate_salary == 0 or (job_salary_min == 0 and job_salary_max == 0):
            score_breakdown['salary_match'] = 75  # Neutro se não há dados
        elif job_salary_min <= candidate_salary <= job_salary_max:
            score_breakdown['salary_match'] = 100
        elif candidate_salary < job_salary_min:
            score_breakdown['salary_match'] = 100  # Candidato pede menos, é bom
        else:
            # Candidato pede mais que o máximo
            overage = (candidate_salary - job_salary_max) / job_salary_max if job_salary_max > 0 else 0
            score_breakdown['salary_match'] = max(100 - overage * 100, 0)
        
        # Cálculo do score geral
        weights = {
            'skills_match': 0.4,
            'experience_match': 0.3,
            'location_match': 0.15,
            'salary_match': 0.15
        }
        
        overall_score = sum(score_breakdown[key] * weights[key] for key in weights.keys())
        score_breakdown['overall_score'] = round(overall_score, 2)
        
        return score_breakdown
    
    def analyze_resume_text(self, resume_text: str) -> Dict:
        """Analisa um texto de currículo e extrai informações relevantes."""
        if not resume_text:
            return {}
            
        analysis = {
            'skills': self.extract_skills(resume_text),
            'experience_years': self.extract_experience_years(resume_text),
            'education_keywords': [],
            'certifications': [],
            'languages': []
        }
        
        # Extrair palavras-chave de educação
        education_keywords = ['bachelor', 'master', 'phd', 'degree', 'university', 'college', 'graduation']
        text_lower = resume_text.lower()
        analysis['education_keywords'] = [kw for kw in education_keywords if kw in text_lower]
        
        # Extrair certificações (simplificado)
        cert_patterns = [
            r'certified?\s+(\w+)',
            r'certification\s+in\s+(\w+)',
            r'(\w+)\s+certified?'
        ]
        
        certifications = []
        for pattern in cert_patterns:
            matches = re.findall(pattern, text_lower)
            certifications.extend(matches)
        
        analysis['certifications'] = list(set(certifications))
        
        return analysis
    
    def recommend_candidates(self, job_data: Dict, candidates: List[Dict], limit: int = 10) -> List[Dict]:
        """Recomenda candidatos para uma vaga baseado na compatibilidade."""
        recommendations = []
        
        for candidate in candidates:
            compatibility = self.calculate_compatibility_score(candidate, job_data)
            recommendations.append({
                'candidate': candidate,
                'compatibility_score': compatibility['overall_score'],
                'score_breakdown': compatibility
            })
        
        # Ordenar por score de compatibilidade
        recommendations.sort(key=lambda x: x['compatibility_score'], reverse=True)
        
        return recommendations[:limit]
    
    def detect_duplicate_candidates(self, candidates: List[Dict], threshold: float = 0.8) -> List[List[Dict]]:
        """Detecta candidatos duplicados baseado na similaridade de dados."""
        if len(candidates) < 2:
            return []
            
        duplicates = []
        processed = set()
        
        for i, candidate1 in enumerate(candidates):
            if i in processed:
                continue
                
            duplicate_group = [candidate1]
            
            for j, candidate2 in enumerate(candidates[i+1:], i+1):
                if j in processed:
                    continue
                    
                similarity = self._calculate_candidate_similarity(candidate1, candidate2)
                if similarity >= threshold:
                    duplicate_group.append(candidate2)
                    processed.add(j)
            
            if len(duplicate_group) > 1:
                duplicates.append(duplicate_group)
                processed.add(i)
        
        return duplicates
    
    def _calculate_candidate_similarity(self, candidate1: Dict, candidate2: Dict) -> float:
        """Calcula a similaridade entre dois candidatos."""
        # Comparar email (peso alto)
        email_match = 1.0 if candidate1.get('email', '').lower() == candidate2.get('email', '').lower() else 0.0
        
        # Comparar nome (peso médio)
        name1 = f"{candidate1.get('first_name', '')} {candidate1.get('last_name', '')}".lower().strip()
        name2 = f"{candidate2.get('first_name', '')} {candidate2.get('last_name', '')}".lower().strip()
        name_match = 1.0 if name1 == name2 else 0.0
        
        # Comparar LinkedIn URL (peso alto)
        linkedin1 = candidate1.get('linkedin_url', '').lower()
        linkedin2 = candidate2.get('linkedin_url', '').lower()
        linkedin_match = 1.0 if linkedin1 and linkedin2 and linkedin1 == linkedin2 else 0.0
        
        # Comparar telefone (peso médio)
        phone1 = re.sub(r'[^\d]', '', candidate1.get('phone', ''))
        phone2 = re.sub(r'[^\d]', '', candidate2.get('phone', ''))
        phone_match = 1.0 if phone1 and phone2 and phone1 == phone2 else 0.0
        
        # Peso das comparações
        weights = {
            'email': 0.4,
            'name': 0.2,
            'linkedin': 0.3,
            'phone': 0.1
        }
        
        similarity = (
            email_match * weights['email'] +
            name_match * weights['name'] +
            linkedin_match * weights['linkedin'] +
            phone_match * weights['phone']
        )
        
        return similarity
    
    def enrich_candidate_data(self, candidate_data: Dict) -> Dict:
        """Enriquece os dados do candidato com análises de IA."""
        enriched_data = candidate_data.copy()
        
        # Analisar texto do currículo
        resume_analysis = self.analyze_resume_text(candidate_data.get('resume_text', ''))
        
        # Atualizar habilidades se não estiverem preenchidas
        if not enriched_data.get('skills') and resume_analysis.get('skills'):
            enriched_data['skills'] = ', '.join(resume_analysis['skills'])
        
        # Atualizar anos de experiência se não estiverem preenchidos
        if not enriched_data.get('experience_years') and resume_analysis.get('experience_years'):
            enriched_data['experience_years'] = resume_analysis['experience_years']
        
        # Adicionar dados de análise
        enriched_data['ai_analysis'] = resume_analysis
        
        return enriched_data

