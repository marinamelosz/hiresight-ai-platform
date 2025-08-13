# Importar todos os modelos para que sejam registrados com SQLAlchemy
from .user import User
from .tenant import Tenant
from .candidate import Candidate
from .job_posting import JobPosting
from .note import Note
from .tag import Tag
from .candidate_job_match import CandidateJobMatch
from .audit_log import AuditLog

# Importar db do main para disponibilizar aqui
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

# Não podemos importar db diretamente aqui porque criaria import circular
# O db será importado pelos arquivos que precisam dele

