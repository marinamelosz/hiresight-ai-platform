import os
import sys
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from datetime import timedelta

# DON'T CHANGE THE `sys.path` CODE BELOW
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 
                                             os.pardir)))

app = Flask(__name__)

# Configurações do Banco de Dados
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL", "sqlite:///recruitment.db")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Configurações JWT
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "super-secret-jwt-key") # Mude para uma chave forte em produção
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)

# Inicializar extensões
db = SQLAlchemy(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)
CORS(app) # Habilitar CORS para todas as rotas

# Tornar db disponível globalmente
import models
models.db = db

# Importar modelos (precisa ser depois de db = SQLAlchemy(app))
from models.user import User
from models.tenant import Tenant
from models.candidate import Candidate
from models.job_posting import JobPosting
from models.note import Note
from models.tag import Tag
from models.candidate_job_match import CandidateJobMatch
from models.audit_log import AuditLog

# Importar e registrar Blueprints
from routes.auth import auth_bp

app.register_blueprint(auth_bp, url_prefix="/api")

@app.route("/api/health")
def health_check():
    return jsonify({"status": "ok", "message": "API is running!"}), 200

if __name__ == "__main__":
    with app.app_context():
        db.create_all() # Cria as tabelas se não existirem
    app.run(host="0.0.0.0", port=5000, debug=True)

