from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from src.models import db, Note, Candidate
from src.utils.auth import require_tenant_access, get_current_user_info
from datetime import datetime

notes_bp = Blueprint("notes", __name__)

def get_tenant_id_from_jwt():
    """Extrai o tenant_id do JWT"""
    claims = get_jwt()
    return claims.get("tenant_id")

@notes_bp.route("/candidates/<int:candidate_id>/notes", methods=["GET"])
@jwt_required()
@require_tenant_access
def get_notes_for_candidate(candidate_id):
    """
    Listar Notas de um Candidato
    --- 
    parameters:
      - name: candidate_id
        in: path
        type: integer
        required: true
        description: ID do candidato para listar as notas.
    security:
      - jwt:
          - 
    responses:
      200:
        description: Lista de notas para o candidato.
        schema:
          id: NoteList
          properties:
            notes:
              type: array
              items:
                type: object
                properties:
                  id:
                    type: integer
                  candidate_id:
                    type: integer
                  user_id:
                    type: integer
                  content:
                    type: string
                  note_type:
                    type: string
                  is_private:
                    type: boolean
                  created_at:
                    type: string
                    format: date-time
      401:
        description: Token de acesso ausente ou inválido.
      404:
        description: Candidato não encontrado.
      500:
        description: Erro interno do servidor.
    """
    try:
        tenant_id = get_tenant_id_from_jwt()
        user_info = get_current_user_info()
        
        candidate = Candidate.query.filter_by(id=candidate_id, tenant_id=tenant_id).first()
        if not candidate:
            return jsonify({"error": "Candidato não encontrado"}), 404
        
        notes = Note.query.filter(
            Note.candidate_id == candidate_id,
            Note.tenant_id == tenant_id,
            (Note.is_private == False) | (Note.user_id == user_info["user_id"])
        ).order_by(Note.created_at.desc()).all()
        
        return jsonify({"notes": [note.to_dict() for note in notes]}), 200
        
    except Exception as e:
        return jsonify({"error": "Erro interno do servidor"}), 500

@notes_bp.route("/candidates/<int:candidate_id>/notes", methods=["POST"])
@jwt_required()
@require_tenant_access
def create_note_for_candidate(candidate_id):
    """
    Criar Nova Nota para Candidato
    --- 
    parameters:
      - name: candidate_id
        in: path
        type: integer
        required: true
        description: ID do candidato para adicionar a nota.
      - name: body
        in: body
        required: true
        schema:
          id: NewNote
          required:
            - content
          properties:
            content:
              type: string
              description: Conteúdo da nota.
              example: O candidato demonstrou forte conhecimento em Python.
            note_type:
              type: string
              description: Tipo da nota (general, interview, feedback, etc.). Padrão é 'general'.
              example: interview
            is_private:
              type: boolean
              description: Indica se a nota é privada (visível apenas para o criador).
              example: false
    security:
      - jwt:
          - 
    responses:
      201:
        description: Nota criada com sucesso.
        schema:
          id: NoteCreated
          properties:
            message:
              type: string
            note:
              type: object
              properties:
                id:
                  type: integer
                content:
                  type: string
                note_type:
                  type: string
      400:
        description: Requisição inválida (conteúdo da nota ausente).
      401:
        description: Token de acesso ausente ou inválido.
      404:
        description: Candidato não encontrado.
      500:
        description: Erro interno do servidor.
    """
    try:
        tenant_id = get_tenant_id_from_jwt()
        user_info = get_current_user_info()
        data = request.get_json()
        
        if not data or not data.get("content"):
            return jsonify({"error": "Conteúdo da nota é obrigatório"}), 400
        
        candidate = Candidate.query.filter_by(id=candidate_id, tenant_id=tenant_id).first()
        if not candidate:
            return jsonify({"error": "Candidato não encontrado"}), 404
        
        note = Note(
            tenant_id=tenant_id,
            candidate_id=candidate_id,
            user_id=user_info["user_id"],
            content=data.get("content").strip(),
            note_type=data.get("note_type", "general"),
            is_private=data.get("is_private", False)
        )
        
        db.session.add(note)
        db.session.commit()
        
        return jsonify({
            "message": "Nota criada com sucesso",
            "note": note.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Erro interno do servidor"}), 500

@notes_bp.route("/notes/<int:note_id>", methods=["PUT"])
@jwt_required()
@require_tenant_access
def update_note(note_id):
    """
    Atualizar Nota
    --- 
    parameters:
      - name: note_id
        in: path
        type: integer
        required: true
        description: ID da nota a ser atualizada.
      - name: body
        in: body
        required: true
        schema:
          id: UpdateNote
          properties:
            content:
              type: string
              description: Novo conteúdo da nota.
            note_type:
              type: string
              description: Novo tipo da nota.
            is_private:
              type: boolean
              description: Novo status de privacidade da nota.
    security:
      - jwt:
          - 
    responses:
      200:
        description: Nota atualizada com sucesso.
        schema:
          id: NoteUpdated
          properties:
            message:
              type: string
            note:
              type: object
              properties:
                id:
                  type: integer
                content:
                  type: string
                note_type:
                  type: string
      400:
        description: Requisição inválida.
      401:
        description: Token de acesso ausente ou inválido.
      403:
        description: Acesso negado - permissão insuficiente.
      404:
        description: Nota não encontrada.
      500:
        description: Erro interno do servidor.
    """
    try:
        tenant_id = get_tenant_id_from_jwt()
        user_info = get_current_user_info()
        data = request.get_json()
        
        note = Note.query.filter_by(id=note_id, tenant_id=tenant_id).first()
        
        if not note:
            return jsonify({"error": "Nota não encontrada"}), 404
        
        if note.user_id != user_info["user_id"] and user_info["role"] != "admin":
            return jsonify({"error": "Você não tem permissão para atualizar esta nota"}), 403
        
        if "content" in data:
            note.content = data["content"].strip()
        if "note_type" in data:
            note.note_type = data["note_type"]
        if "is_private" in data:
            note.is_private = data["is_private"]
            
        db.session.commit()
        
        return jsonify({
            "message": "Nota atualizada com sucesso",
            "note": note.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Erro interno do servidor"}), 500

@notes_bp.route("/notes/<int:note_id>", methods=["DELETE"])
@jwt_required()
@require_tenant_access
def delete_note(note_id):
    """
    Excluir Nota
    --- 
    parameters:
      - name: note_id
        in: path
        type: integer
        required: true
        description: ID da nota a ser excluída.
    security:
      - jwt:
          - 
    responses:
      200:
        description: Nota excluída com sucesso.
      401:
        description: Token de acesso ausente ou inválido.
      403:
        description: Acesso negado - permissão insuficiente.
      404:
        description: Nota não encontrada.
      500:
        description: Erro interno do servidor.
    """
    try:
        tenant_id = get_tenant_id_from_jwt()
        user_info = get_current_user_info()
        
        note = Note.query.filter_by(id=note_id, tenant_id=tenant_id).first()
        
        if not note:
            return jsonify({"error": "Nota não encontrada"}), 404
        
        if note.user_id != user_info["user_id"] and user_info["role"] != "admin":
            return jsonify({"error": "Você não tem permissão para excluir esta nota"}), 403
        
        db.session.delete(note)
        db.session.commit()
        
        return jsonify({"message": "Nota excluída com sucesso"}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Erro interno do servidor"}), 500

