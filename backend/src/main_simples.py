from flask import Flask, jsonify, request
from flask_cors import CORS
import os

# Criar a aplicação Flask
app = Flask(__name__)

# Habilitar CORS para todas as rotas
CORS(app)

# Rota de teste básica
@app.route("/")
def home():
    return jsonify({
        "message": "🏰 Bem-vindo ao Castelo Mágico de Recrutamento! 🧙‍♀️",
        "status": "funcionando",
        "version": "1.0.0"
    })

# Rota de verificação de saúde
@app.route("/api/health")
def health_check():
    return jsonify({
        "status": "ok", 
        "message": "API está funcionando perfeitamente! ⚡",
        "castle_status": "🏰 Castelo operacional!"
    }), 200

# Rota de teste para o frontend
@app.route("/api/test")
def test():
    return jsonify({
        "message": "Conexão entre frontend e backend funcionando! 🚀",
        "timestamp": "2025-01-13",
        "success": True
    }), 200

# Rota simples de login (apenas para teste)
@app.route("/api/login", methods=["POST"])
def simple_login():
    data = request.get_json()
    email = data.get("email", "")
    password = data.get("password", "")
    
    # Login super simples apenas para teste
    if email and password:
        return jsonify({
            "message": "Login de teste bem-sucedido! 🎉",
            "access_token": "token-de-teste-123",
            "user": {
                "id": 1,
                "email": email,
                "first_name": "Usuário",
                "last_name": "Teste",
                "role": "admin",
                "tenant_id": 1
            }
        }), 200
    else:
        return jsonify({
            "error": "Email e senha são obrigatórios para o teste"
        }), 400

# Rota simples de registro (apenas para teste)
@app.route("/api/register", methods=["POST"])
def simple_register():
    data = request.get_json()
    
    return jsonify({
        "message": "Registro de teste bem-sucedido! 🎊",
        "user_created": True,
        "note": "Esta é apenas uma versão de teste - dados não são salvos"
    }), 201

if __name__ == "__main__":
    print("🏰 Iniciando o Castelo Mágico de Recrutamento...")
    print("⚡ Servidor rodando em: http://localhost:5000")
    print("🌐 Teste no navegador: http://localhost:5000")
    print("🔧 API de saúde: http://localhost:5000/api/health")
    print("📱 Para parar o servidor: Ctrl+C")
    print("=" * 50)
    
    app.run(host="0.0.0.0", port=5000, debug=True)

