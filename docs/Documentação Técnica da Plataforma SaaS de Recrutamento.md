# Documentação Técnica da Plataforma SaaS de Recrutamento

## 1. Introdução

Este documento fornece uma visão técnica abrangente da plataforma SaaS de assistente de recrutamento, detalhando sua arquitetura, componentes, tecnologias utilizadas, modelos de dados, APIs e considerações de segurança. Ele serve como um recurso para desenvolvedores, arquitetos de sistema e equipes de operações.

## 2. Arquitetura do Sistema

A plataforma adota uma arquitetura de microsserviços, com um backend baseado em Flask, um frontend React e uma extensão Chrome. A comunicação entre os componentes é realizada via APIs RESTful. O sistema é projetado para ser escalável, modular e extensível.

### 2.1. Visão Geral da Arquitetura

[Inserir diagrama de arquitetura aqui, se disponível]

### 2.2. Componentes Principais

*   **Backend (Flask):** Responsável pela lógica de negócios, gerenciamento de dados, APIs e integração com serviços de IA e ATS/CRM.
*   **Frontend (React):** Interface do usuário web para o dashboard, gerenciamento de candidatos, vagas, usuários, etc.
*   **Extensão Chrome:** Ferramenta para extração de dados de páginas web e interação direta com o backend.
*   **Banco de Dados (PostgreSQL):** Armazenamento persistente de dados.
*   **Serviços de IA:** Módulos para pontuação de candidatos, análise de currículos, otimização de vagas, etc.
*   **Serviços de Integração:** Conectividade com ATS/CRM externos.




## 3. Tecnologias Utilizadas

### 3.1. Backend

*   **Framework:** Flask
*   **Servidor WSGI:** Gunicorn
*   **Proxy Reverso:** Nginx
*   **Banco de Dados:** PostgreSQL (SQLAlchemy ORM)
*   **Autenticação:** Flask-JWT-Extended
*   **Internacionalização:** Flask-Babel
*   **Documentação API:** Flasgger (Swagger/OpenAPI)
*   **Outras Bibliotecas:** `psycopg2-binary`, `bcrypt`, `flask-cors`, `flask-migrate`, `scikit-learn`, `nltk`, `textblob`.

### 3.2. Frontend

*   **Framework:** React
*   **Gerenciamento de Estado/Dados:** React Query (TanStack Query)
*   **Roteamento:** React Router DOM
*   **Formulários:** React Hook Form, Zod (validação)
*   **Requisições HTTP:** Axios
*   **Internacionalização:** react-i18next, i18next, i18next-browser-languagedetector, i18next-http-backend
*   **Componentes UI:** shadcn/ui (baseado em Tailwind CSS)
*   **Consentimento de Cookies:** react-cookie-consent

### 3.3. Extensão Chrome

*   **Tecnologias:** HTML, CSS, JavaScript (Vanilla JS)
*   **Comunicação:** `chrome.runtime.sendMessage`, `chrome.tabs.sendMessage`
*   **Armazenamento:** `chrome.storage.local`




## 4. Modelos de Dados

O banco de dados PostgreSQL armazena as informações da plataforma, seguindo um modelo multi-tenant. Os principais modelos de dados incluem:

*   **Tenant:** Representa uma organização ou cliente da plataforma. Cada tenant possui seus próprios dados isolados.
    *   `id` (PK)
    *   `name`
    *   `created_at`
    *   `updated_at`

*   **User:** Representa um usuário dentro de um tenant.
    *   `id` (PK)
    *   `tenant_id` (FK para Tenant)
    *   `email`
    *   `password_hash`
    *   `role` (e.g., 'admin', 'manager', 'recruiter')
    *   `created_at`
    *   `updated_at`

*   **Candidate:** Informações detalhadas sobre um candidato.
    *   `id` (PK)
    *   `tenant_id` (FK para Tenant)
    *   `name`
    *   `email`
    *   `phone`
    *   `linkedin_profile`
    *   `resume_text`
    *   `skills` (JSONB)
    *   `experience` (JSONB)
    *   `education` (JSONB)
    *   `source`
    *   `created_at`
    *   `updated_at`

*   **JobPosting:** Detalhes de uma vaga de emprego.
    *   `id` (PK)
    *   `tenant_id` (FK para Tenant)
    *   `title`
    *   `description`
    *   `requirements`
    *   `location`
    *   `status`
    *   `created_at`
    *   `updated_at`

*   **Note:** Notas colaborativas sobre candidatos ou vagas.
    *   `id` (PK)
    *   `tenant_id` (FK para Tenant)
    *   `user_id` (FK para User)
    *   `candidate_id` (FK para Candidate, opcional)
    *   `job_posting_id` (FK para JobPosting, opcional)
    *   `content`
    *   `created_at`
    *   `updated_at`

*   **Tag:** Tags para categorização de candidatos.
    *   `id` (PK)
    *   `tenant_id` (FK para Tenant)
    *   `name`
    *   `created_at`
    *   `updated_at`

*   **CandidateTag:** Tabela de junção para relacionamento muitos-para-muitos entre Candidate e Tag.
    *   `candidate_id` (FK para Candidate)
    *   `tag_id` (FK para Tag)

*   **CandidateJobMatch:** Armazena a pontuação de compatibilidade entre candidato e vaga.
    *   `id` (PK)
    *   `tenant_id` (FK para Tenant)
    *   `candidate_id` (FK para Candidate)
    *   `job_posting_id` (FK para JobPosting)
    *   `score`
    *   `details` (JSONB, para explicar a pontuação)
    *   `created_at`
    *   `updated_at`

*   **AuditLog:** Registra ações importantes para fins de auditoria e conformidade.
    *   `id` (PK)
    *   `tenant_id` (FK para Tenant)
    *   `user_id` (FK para User)
    *   `action`
    *   `entity_type`
    *   `entity_id`
    *   `timestamp`
    *   `details` (JSONB)




## 5. APIs (Application Programming Interfaces)

O backend expõe uma série de APIs RESTful para permitir a comunicação com o frontend e a extensão Chrome. A documentação completa da API está disponível via Swagger/OpenAPI no endpoint `/apidocs` do backend.

### 5.1. Estrutura da API

*   **Base URL:** `http://localhost:5000/api` (para desenvolvimento)
*   **Autenticação:** JWT (JSON Web Tokens) para todas as rotas protegidas.
*   **Controle de Acesso:** RBAC (Role-Based Access Control) implementado via decoradores.

### 5.2. Endpoints Principais

*   **Autenticação:**
    *   `POST /api/auth/register`: Registro de novo usuário/tenant.
    *   `POST /api/auth/login`: Login de usuário.
    *   `POST /api/auth/refresh`: Atualizar token JWT.

*   **Usuários:**
    *   `GET /api/users`: Listar usuários (apenas admin/manager).
    *   `GET /api/users/<id>`: Obter detalhes de um usuário.
    *   `PUT /api/users/<id>`: Atualizar usuário.
    *   `DELETE /api/users/<id>`: Excluir usuário.

*   **Candidatos:**
    *   `GET /api/candidates`: Listar candidatos.
    *   `POST /api/candidates`: Criar novo candidato.
    *   `GET /api/candidates/<id>`: Obter detalhes de um candidato.
    *   `PUT /api/candidates/<id>`: Atualizar candidato.
    *   `DELETE /api/candidates/<id>`: Excluir candidato.

*   **Vagas:**
    *   `GET /api/job-postings`: Listar vagas.
    *   `POST /api/job-postings`: Criar nova vaga.
    *   `GET /api/job-postings/<id>`: Obter detalhes de uma vaga.
    *   `PUT /api/job-postings/<id>`: Atualizar vaga.
    *   `DELETE /api/job-postings/<id>`: Excluir vaga.

*   **Notas:**
    *   `GET /api/notes`: Listar notas.
    *   `POST /api/notes`: Criar nova nota.
    *   `GET /api/notes/<id>`: Obter detalhes de uma nota.
    *   `PUT /api/notes/<id>`: Atualizar nota.
    *   `DELETE /api/notes/<id>`: Excluir nota.

*   **Tags:**
    *   `GET /api/tags`: Listar tags.
    *   `POST /api/tags`: Criar nova tag.
    *   `GET /api/tags/<id>`: Obter detalhes de uma tag.
    *   `PUT /api/tags/<id>`: Atualizar tag.
    *   `DELETE /api/tags/<id>`: Excluir tag.

*   **IA e Análise:**
    *   `POST /api/ai/score-candidate`: Pontuar candidato para uma vaga.
    *   `POST /api/ai/optimize-job-description`: Otimizar descrição de vaga.
    *   `GET /api/analytics/dashboard-data`: Obter dados para o dashboard.

*   **Integrações ATS/CRM:**
    *   `POST /api/integrations/ats-crm/sync`: Sincronizar dados com ATS/CRM.

*   **Internacionalização:**
    *   `GET /api/i18n/config`: Obter configurações de internacionalização.




## 6. Segurança

A segurança é um pilar fundamental da plataforma, com medidas implementadas em todas as camadas:

*   **Autenticação:** Utiliza JWT (JSON Web Tokens) para autenticação segura, com tokens de acesso de curta duração e tokens de refresh para renovação.
*   **Autorização (RBAC):** Controle de acesso baseado em função (Role-Based Access Control) granular, garantindo que os usuários só possam acessar os recursos e funcionalidades para os quais têm permissão. Decoradores de rota são usados para aplicar as regras de acesso.
*   **Multi-tenancy (RLS):** Implementado no nível da aplicação, garantindo que os dados de um tenant sejam isolados e não possam ser acessados por outros tenants. Todas as consultas ao banco de dados incluem filtros baseados no `tenant_id` do usuário autenticado.
*   **Criptografia de Dados:**
    *   **Em Repouso:** Senhas de usuários são armazenadas como hashes bcrypt, tornando-as irreversíveis. Dados sensíveis no banco de dados podem ser criptografados no nível do campo, se necessário, ou no nível do disco/banco de dados pela infraestrutura.
    *   **Em Trânsito:** A comunicação entre frontend/extensão e backend deve ser sempre via HTTPS para garantir a criptografia dos dados em trânsito. Isso é configurado no Nginx durante a implantação.
*   **Logs de Auditoria:** Um sistema de log de auditoria detalhado registra todas as ações críticas dos usuários (login, criação/edição/exclusão de dados, etc.), fornecendo um rastro para investigações de segurança e conformidade.
*   **Validação de Entrada:** Todas as entradas de usuário são rigorosamente validadas no backend para prevenir ataques como SQL Injection, XSS e outros.
*   **Proteção contra Ataques Comuns:** Medidas são tomadas para mitigar ataques como CSRF (Cross-Site Request Forgery), clickjacking, etc., através de configurações de segurança no Flask e Nginx.
*   **MFA (Autenticação Multifator):** A arquitetura prevê a integração com soluções de MFA (como TOTP via PyOTP ou serviços de SMS/voz) para adicionar uma camada extra de segurança ao login.




## 7. Conformidade

A plataforma é projetada para estar em conformidade com as principais regulamentações de proteção de dados:

*   **GDPR (General Data Protection Regulation):**
    *   **Direitos do Titular dos Dados:** Suporte aos direitos de acesso, retificação, apagamento, restrição de processamento, portabilidade e oposição.
    *   **Consentimento:** Mecanismos para obter e registrar o consentimento do usuário para o processamento de dados (ex: banner de cookies).
    *   **Privacy by Design:** Princípios de privacidade incorporados desde o design inicial do sistema.
    *   **Logs de Auditoria:** Para demonstrar conformidade e rastrear o processamento de dados.
*   **LGPD (Lei Geral de Proteção de Dados):**
    *   Similar ao GDPR, a LGPD é atendida através das mesmas medidas de segurança e direitos do titular dos dados.
    *   **Relatórios de Impacto à Proteção de Dados (RIPD):** A plataforma fornece os dados necessários para a geração desses relatórios, se exigido.
*   **CCPA (California Consumer Privacy Act):**
    *   **Direitos do Consumidor:** Suporte aos direitos de acesso, exclusão e opt-out da venda de informações pessoais.
    *   **Transparência:** Políticas de privacidade claras e acessíveis.




## 8. Implantação

O processo de implantação envolve a configuração de um ambiente de produção e o deploy de cada componente:

*   **Backend:** Implantado usando Gunicorn e Nginx como proxy reverso. O Nginx gerencia as requisições HTTP(S) e as encaminha para o Gunicorn, que serve a aplicação Flask.
*   **Frontend:** Construído para produção e servido por Nginx como arquivos estáticos. O Nginx também gerencia o roteamento e o cache de ativos.
*   **Extensão Chrome:** Distribuída via Chrome Web Store ou manualmente, com a URL do backend configurada para o ambiente de produção.
*   **HTTPS:** Essencial para segurança em produção, configurado no Nginx com certificados SSL (ex: Let's Encrypt).




## 9. Manutenção e Monitoramento

*   **Logs:** Configuração de logs detalhados para backend e frontend para facilitar a depuração e o monitoramento.
*   **Monitoramento de Desempenho:** Ferramentas de APM (Application Performance Monitoring) podem ser integradas para monitorar o desempenho da aplicação em tempo real.
*   **Alertas:** Configuração de alertas para eventos críticos (erros, picos de uso, falhas de segurança).
*   **Backups:** Rotinas de backup regulares para o banco de dados.
*   **Atualizações:** Processo definido para aplicar atualizações de segurança e de software para todas as dependências.




## 10. Conclusão

Esta documentação técnica fornece uma visão aprofundada da arquitetura e implementação da plataforma SaaS de recrutamento. Ela serve como base para futuras expansões, manutenções e para garantir a operação contínua e segura do sistema.




## 11. Referências

[1] Flask Documentation: Security Considerations. Disponível em: https://flask.palletsprojects.com/en/stable/web-security/
[2] Flask-JWT-Extended Documentation. Disponível em: https://flask-jwt-extended.readthedocs.io/en/stable/
[3] PostgreSQL Documentation: Row Security Policies. Disponível em: https://www.postgresql.org/docs/current/ddl-rowsecurity.html
[4] OWASP Top Ten Web Application Security Risks. Disponível em: https://owasp.org/www-project-top-ten/
[5] General Data Protection Regulation (GDPR). Disponível em: https://gdpr.eu/
[6] Lei Geral de Proteção de Dados (LGPD). Disponível em: http://www.planalto.gov.br/ccivil_03/_ato2019-2022/2020/lei/l13709.htm
[7] California Consumer Privacy Act (CCPA). Disponível em: https://oag.ca.gov/privacy/ccpa
[8] Deploying Flask Applications with Gunicorn and Nginx. Disponível em: https://www.digitalocean.com/community/tutorials/how-to-serve-flask-applications-with-gunicorn-and-nginx-on-ubuntu-22-04
[9] Deploying React Applications. Disponível em: https://create-react-app.dev/docs/deployment/
[10] React Query Documentation. Disponível em: https://tanstack.com/query/latest
[11] React Hook Form Documentation. Disponível em: https://react-hook-form.com/
[12] i18next Documentation. Disponível em: https://www.i18next.com/
[13] Flask-Babel Documentation. Disponível em: https://flask-babel.tkte.ch/en/latest/
[14] Flasgger Documentation. Disponível em: https://flasgger.readthedocs.io/en/latest/
[15] Scikit-learn Documentation. Disponível em: https://scikit-learn.org/stable/
[16] NLTK Documentation. Disponível em: https://www.nltk.org/
[17] TextBlob Documentation. Disponível em: https://textblob.readthedocs.io/en/dev/
[18] React Cookie Consent Documentation. Disponível em: https://www.npmjs.com/package/react-cookie-consent


