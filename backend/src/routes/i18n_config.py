from flask import Blueprint, jsonify
from flask_babel import get_locale, format_currency, format_date, format_number
from flask_jwt_extended import jwt_required

i18n_config_bp = Blueprint("i18n_config", __name__)

@i18n_config_bp.route("/i18n/config", methods=["GET"])
@jwt_required()
def get_i18n_config():
    """
    Retorna as configurações de internacionalização para o frontend.
    ---
    tags:
      - Internacionalização
    responses:
      200:
        description: Configurações de internacionalização.
    """
    locale = str(get_locale())
    
    # Exemplo de formatação para demonstração
    example_currency = format_currency(1234.56, "USD", locale=locale)
    example_date = format_date(locale=locale)
    example_number = format_number(12345.67, locale=locale)

    return jsonify({
        "locale": locale,
        "currency_format_example": example_currency,
        "date_format_example": example_date,
        "number_format_example": example_number,
        # Em um cenário real, você pode adicionar mais informações específicas do locale
        # como símbolo da moeda, separador decimal, etc.
    }), 200


