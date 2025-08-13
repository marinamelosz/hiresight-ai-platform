from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import bcrypt
import os
from datetime import datetime, timedelta
import re

# Criar a aplicação Flask
app = Flask(__name__)

# Configurações
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///hiresight.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'hiresight-super-secret-key-2025'  # Em produção, use uma chave mais segura
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)

# Inicializar extensões
db = SQLAlchemy(app)
jwt = JWTManager(app)
CORS(app)  # Habilitar CORS para todas as rotas

# Modelo de Usuário
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    company = db.Column(db.String(100), nullable=True)
    role = db.Column(db.String(20), default='user')  # user, admin
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)

    def to_dict(self):
        return {
            'id': self.id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'email': self.email,
            'company': self.company,
            'role': self.role,
            'created_at': self.created_at.isoformat(),
            'is_active': self.is_active
        }

# Modelo de Candidato (para futuras funcionalidades)
class Candidate(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=True)
    phone = db.Column(db.String(20), nullable=True)
    linkedin_url = db.Column(db.String(255), nullable=True)
    position = db.Column(db.String(100), nullable=True)
    company = db.Column(db.String(100), nullable=True)
    skills = db.Column(db.Text, nullable=True)
    notes = db.Column(db.Text, nullable=True)
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'linkedin_url': self.linkedin_url,
            'position': self.position,
            'company': self.company,
            'skills': self.skills,
            'notes': self.notes,
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat()
        }

# Funções auxiliares
def validate_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def hash_password(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def check_password(password, hashed):
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

# Rotas de autenticação
@app.route('/api/register', methods=['POST'])
def register():
    """Registrar novo usuário"""
    try:
        data = request.get_json()
        
        # Validar dados obrigatórios
        required_fields = ['first_name', 'last_name', 'email', 'password']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'Campo {field} é obrigatório'}), 400
        
        first_name = data['first_name'].strip()
        last_name = data['last_name'].strip()
        email = data['email'].strip().lower()
        password = data['password']
        company = data.get('company', '').strip()
        
        # Validações
        if len(password) < 6:
            return jsonify({'error': 'Senha deve ter pelo menos 6 caracteres'}), 400
        
        if not validate_email(email):
            return jsonify({'error': 'Email inválido'}), 400
        
        # Verificar se email já existe
        if User.query.filter_by(email=email).first():
            return jsonify({'error': 'Email já cadastrado'}), 400
        
        # Criar novo usuário
        hashed_password = hash_password(password)
        new_user = User(
            first_name=first_name,
            last_name=last_name,
            email=email,
            password=hashed_password,
            company=company
        )
        
        db.session.add(new_user)
        db.session.commit()
        
        return jsonify({
            'message': 'Usuário cadastrado com sucesso!',
            'user': new_user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Erro interno do servidor'}), 500

@app.route('/api/login', methods=['POST'])
def login():
    """Fazer login"""
    try:
        data = request.get_json()
        
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        if not email or not password:
            return jsonify({'error': 'Email e senha são obrigatórios'}), 400
        
        # Buscar usuário
        user = User.query.filter_by(email=email).first()
        
        if not user or not check_password(password, user.password):
            return jsonify({'error': 'Email ou senha incorretos'}), 401
        
        if not user.is_active:
            return jsonify({'error': 'Conta desativada'}), 401
        
        # Criar token JWT
        access_token = create_access_token(
            identity=user.id,
            additional_claims={
                'email': user.email,
                'role': user.role,
                'name': f"{user.first_name} {user.last_name}"
            }
        )
        
        return jsonify({
            'message': 'Login realizado com sucesso!',
            'access_token': access_token,
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Erro interno do servidor'}), 500

@app.route('/api/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Obter perfil do usuário logado"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'Usuário não encontrado'}), 404
        
        return jsonify({'user': user.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': 'Erro interno do servidor'}), 500

@app.route('/api/candidates', methods=['GET', 'POST'])
@jwt_required()
def candidates():
    """Gerenciar candidatos"""
    try:
        user_id = get_jwt_identity()
        
        if request.method == 'GET':
            # Listar candidatos do usuário
            candidates = Candidate.query.filter_by(created_by=user_id).all()
            return jsonify({
                'candidates': [candidate.to_dict() for candidate in candidates]
            }), 200
        
        elif request.method == 'POST':
            # Criar novo candidato
            data = request.get_json()
            
            if not data.get('name'):
                return jsonify({'error': 'Nome é obrigatório'}), 400
            
            new_candidate = Candidate(
                name=data['name'],
                email=data.get('email'),
                phone=data.get('phone'),
                linkedin_url=data.get('linkedin_url'),
                position=data.get('position'),
                company=data.get('company'),
                skills=data.get('skills'),
                notes=data.get('notes'),
                created_by=user_id
            )
            
            db.session.add(new_candidate)
            db.session.commit()
            
            return jsonify({
                'message': 'Candidato adicionado com sucesso!',
                'candidate': new_candidate.to_dict()
            }), 201
            
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Erro interno do servidor'}), 500

# Rotas básicas
@app.route('/')
def home():
    return jsonify({
        'message': '🏰 Bem-vindo ao HireSight.ai! 🚀',
        'version': '2.0.0',
        'status': 'Sistema completo de autenticação ativo!',
        'endpoints': {
            'register': '/api/register',
            'login': '/api/login',
            'profile': '/api/profile',
            'candidates': '/api/candidates',
            'health': '/api/health'
        }
    })

@app.route('/api/health')
def health_check():
    return jsonify({
        'status': 'ok',
        'message': 'HireSight.ai API funcionando perfeitamente! ⚡',
        'database': 'SQLite conectado',
        'authentication': 'JWT ativo',
        'timestamp': datetime.utcnow().isoformat()
    }), 200

# Rota para extensão Chrome
@app.route('/api/extension/auth', methods=['POST'])
def extension_auth():
    """Autenticação para extensão Chrome"""
    try:
        data = request.get_json()
        token = data.get('token')
        
        if not token:
            return jsonify({'error': 'Token necessário'}), 400
        
        # Aqui você pode validar o token JWT
        # Por enquanto, vamos aceitar qualquer token válido
        return jsonify({
            'status': 'authenticated',
            'message': 'Extensão autenticada com sucesso!'
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Token inválido'}), 401

if __name__ == '__main__':
    # Criar tabelas se não existirem
    with app.app_context():
        db.create_all()
        
        # Criar usuário admin padrão se não existir
        admin = User.query.filter_by(email='admin@hiresight.ai').first()
        if not admin:
            admin_user = User(
                first_name='Admin',
                last_name='HireSight',
                email='admin@hiresight.ai',
                password=hash_password('admin123'),
                company='HireSight.ai',
                role='admin'
            )
            db.session.add(admin_user)
            db.session.commit()
            print("👑 Usuário admin criado: admin@hiresight.ai / admin123")
    
    print("🏰 Iniciando HireSight.ai - Sistema Completo...")
    print("⚡ Servidor rodando em: http://localhost:5000")
    print("🔐 Sistema de autenticação: ATIVO")
    print("🗄️ Banco de dados: SQLite")
    print("🌐 APIs disponíveis:")
    print("   - POST /api/register (Cadastro)")
    print("   - POST /api/login (Login)")
    print("   - GET /api/profile (Perfil)")
    print("   - GET/POST /api/candidates (Candidatos)")
    print("📱 Para parar o servidor: Ctrl+C")
    print("=" * 60)
    
    app.run(host='0.0.0.0', port=5000, debug=True)

