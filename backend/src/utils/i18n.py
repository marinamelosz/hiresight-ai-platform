from flask import request, session
from flask_babel import Babel, get_locale
import os

def get_user_locale():
    """
    Determina o idioma do usuário baseado em:
    1. Parâmetro de sessão (se o usuário selecionou manualmente)
    2. Cabeçalho Accept-Language
    3. Idioma padrão (português)
    """
    # Verificar se o usuário selecionou um idioma manualmente
    if 'language' in session:
        return session['language']
    
    # Usar o cabeçalho Accept-Language
    return request.accept_languages.best_match(['pt', 'en', 'es', 'fr']) or 'pt'

def init_babel(app):
    """Inicializa o Babel com a aplicação Flask."""
    babel = Babel(app)
    
    # Configurar idiomas suportados
    app.config['LANGUAGES'] = {
        'pt': 'Português',
        'en': 'English',
        'es': 'Español',
        'fr': 'Français'
    }
    
    # Configurar diretório de traduções
    app.config['BABEL_TRANSLATION_DIRECTORIES'] = 'translations'
    
    # Configurar função de seleção de idioma
    babel.init_app(app, locale_selector=get_user_locale)
    
    return babel

def set_user_language(language_code):
    """Define o idioma do usuário na sessão."""
    session['language'] = language_code

def get_supported_languages():
    """Retorna a lista de idiomas suportados."""
    from flask import current_app
    return current_app.config.get('LANGUAGES', {})

def translate_text(text, target_language='en'):
    """
    Traduz um texto para o idioma de destino.
    Esta é uma implementação simplificada. Em produção, você usaria
    um serviço de tradução como Google Translate API ou Azure Translator.
    """
    # Dicionário simples de traduções para demonstração
    translations = {
        'en': {
            'Candidato': 'Candidate',
            'Vaga': 'Job',
            'Usuário': 'User',
            'Dashboard': 'Dashboard',
            'Configurações': 'Settings',
            'Sair': 'Logout',
            'Entrar': 'Login',
            'Registrar': 'Register',
            'Nome': 'Name',
            'Email': 'Email',
            'Senha': 'Password',
            'Telefone': 'Phone',
            'Localização': 'Location',
            'Habilidades': 'Skills',
            'Experiência': 'Experience',
            'Salário': 'Salary',
            'Descrição': 'Description',
            'Requisitos': 'Requirements',
            'Empresa': 'Company',
            'Cargo': 'Position'
        },
        'es': {
            'Candidato': 'Candidato',
            'Vaga': 'Trabajo',
            'Usuário': 'Usuario',
            'Dashboard': 'Panel',
            'Configurações': 'Configuraciones',
            'Sair': 'Salir',
            'Entrar': 'Entrar',
            'Registrar': 'Registrar',
            'Nome': 'Nombre',
            'Email': 'Correo',
            'Senha': 'Contraseña',
            'Telefone': 'Teléfono',
            'Localização': 'Ubicación',
            'Habilidades': 'Habilidades',
            'Experiência': 'Experiencia',
            'Salário': 'Salario',
            'Descrição': 'Descripción',
            'Requisitos': 'Requisitos',
            'Empresa': 'Empresa',
            'Cargo': 'Puesto'
        },
        'fr': {
            'Candidato': 'Candidat',
            'Vaga': 'Emploi',
            'Usuário': 'Utilisateur',
            'Dashboard': 'Tableau de bord',
            'Configurações': 'Paramètres',
            'Sair': 'Déconnexion',
            'Entrar': 'Connexion',
            'Registrar': 'S\'inscrire',
            'Nome': 'Nom',
            'Email': 'Email',
            'Senha': 'Mot de passe',
            'Telefone': 'Téléphone',
            'Localização': 'Emplacement',
            'Habilidades': 'Compétences',
            'Experiência': 'Expérience',
            'Salário': 'Salaire',
            'Descrição': 'Description',
            'Requisitos': 'Exigences',
            'Empresa': 'Entreprise',
            'Cargo': 'Poste'
        }
    }
    
    if target_language in translations and text in translations[target_language]:
        return translations[target_language][text]
    
    return text  # Retorna o texto original se não houver tradução

