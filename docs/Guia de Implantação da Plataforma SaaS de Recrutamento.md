# Guia de Implantação da Plataforma SaaS de Recrutamento

## 1. Introdução

Este guia detalha os passos necessários para preparar o ambiente de produção e implantar a plataforma SaaS de assistente de recrutamento. Ele abrange a configuração do backend (Flask), do frontend (React) e da extensão Chrome.

## 2. Preparação do Ambiente de Produção

Para um ambiente de produção robusto, recomendamos o uso de um servidor Linux (Ubuntu Server, por exemplo), Nginx como proxy reverso e Gunicorn como servidor WSGI para a aplicação Flask. O banco de dados recomendado para produção é o PostgreSQL.

### 2.1. Requisitos de Sistema

*   Servidor Linux (Ubuntu 22.04 LTS ou superior)
*   Python 3.9+ (para o backend Flask)
*   Node.js 18+ e pnpm (para o frontend React)
*   PostgreSQL (servidor de banco de dados)
*   Nginx (servidor web e proxy reverso)
*   Gunicorn (servidor WSGI para Flask)

### 2.2. Configuração Inicial do Servidor

1.  **Atualizar o sistema:**
    ```bash
    sudo apt update && sudo apt upgrade -y
    ```
2.  **Instalar Python e ferramentas essenciais:**
    ```bash
    sudo apt install python3-pip python3-dev build-essential libpq-dev nginx curl git -y
    ```
3.  **Instalar PostgreSQL:**
    ```bash
    sudo apt install postgresql postgresql-contrib -y
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
    ```
4.  **Criar usuário e banco de dados PostgreSQL:**
    ```bash
    sudo -u postgres psql
    # Dentro do psql:
    CREATE DATABASE recruitment_saas_db;
    CREATE USER recruitment_user WITH PASSWORD 'sua_senha_segura';
    GRANT ALL PRIVILEGES ON DATABASE recruitment_saas_db TO recruitment_user;
    \q
    ```
5.  **Instalar Node.js e pnpm:**
    ```bash
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    sudo npm install -g pnpm
    ```




## 3. Implantação do Backend (Flask)

### 3.1. Clonar o Repositório e Configurar o Ambiente Virtual

No seu servidor de produção, clone o repositório do seu backend e crie um ambiente virtual:

```bash
git clone <URL_DO_SEU_REPOSITORIO_BACKEND> /var/www/recruitment-saas-backend
cd /var/www/recruitment-saas-backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 3.2. Configurar Variáveis de Ambiente

Crie um arquivo `.env` no diretório raiz do backend (`/var/www/recruitment-saas-backend`) com as variáveis de ambiente necessárias. **Nunca coloque informações sensíveis diretamente no código.**

```
DATABASE_URL=postgresql://recruitment_user:sua_senha_segura@localhost/recruitment_saas_db
JWT_SECRET_KEY=sua_chave_secreta_jwt_forte
FLASK_ENV=production
# Outras variáveis de ambiente, como chaves de API para serviços externos, etc.
```

### 3.3. Configurar Gunicorn

Crie um arquivo de serviço Systemd para o Gunicorn (`/etc/systemd/system/recruitment_saas_backend.service`):

```
[Unit]
Description=Gunicorn instance to serve Recruitment SaaS Backend
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/recruitment-saas-backend
Environment="PATH=/var/www/recruitment-saas-backend/venv/bin"
ExecStart=/var/www/recruitment-saas-backend/venv/bin/gunicorn --workers 4 --bind unix:/var/www/recruitment-saas-backend/recruitment_saas_backend.sock -m 007 wsgi:app
Restart=always

[Install]
WantedBy=multi-user.target
```

*   `--workers 4`: Número de workers Gunicorn (ajuste conforme a capacidade do seu servidor).
*   `--bind unix:/var/www/recruitment-saas-backend/recruitment_saas_backend.sock`: O Gunicorn irá se comunicar com o Nginx via um socket Unix.
*   `wsgi:app`: Aponta para o seu arquivo `wsgi.py` e a instância do seu aplicativo Flask (geralmente `app`). Certifique-se de que você tem um arquivo `wsgi.py` que importa sua instância `app` do `main.py`.

Crie o arquivo `wsgi.py` no diretório raiz do seu backend (`/var/www/recruitment-saas-backend/wsgi.py`):

```python
from src.main import app

if __name__ == "__main__":
    app.run()
```

Recarregue o Systemd e inicie o serviço Gunicorn:

```bash
sudo systemctl daemon-reload
sudo systemctl start recruitment_saas_backend
sudo systemctl enable recruitment_saas_backend
```

Verifique o status do serviço:

```bash
sudo systemctl status recruitment_saas_backend
```

### 3.4. Configurar Nginx para o Backend

Crie um arquivo de configuração Nginx para o seu backend (`/etc/nginx/sites-available/recruitment_saas_backend`):

```nginx
server {
    listen 80;
    server_name api.seusite.com;

    location / {
        include proxy_params;
        proxy_pass http://unix:/var/www/recruitment-saas-backend/recruitment_saas_backend.sock;
    }
}
```

Crie um link simbólico para `sites-enabled` e teste a configuração do Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/recruitment_saas_backend /etc/nginx/sites-enabled
sudo nginx -t
```

Se o teste for bem-sucedido, reinicie o Nginx:

```bash
sudo systemctl restart nginx
```

**Nota:** Para HTTPS, você precisará configurar um certificado SSL (por exemplo, com Let's Encrypt) após a implantação inicial. Isso será abordado na seção de segurança da implantação. 




## 4. Implantação do Frontend (React)

### 4.1. Construir a Aplicação React para Produção

No seu ambiente de desenvolvimento local ou em um servidor de CI/CD, construa a aplicação React. Isso irá gerar uma pasta `dist` (ou `build`, dependendo da sua configuração) com os arquivos estáticos otimizados para produção.

```bash
cd /caminho/para/seu/recruitment-saas-frontend
pnpm install
pnpm run build
```

Copie o conteúdo da pasta `dist` (ou `build`) para o seu servidor de produção, por exemplo, para `/var/www/recruitment-saas-frontend-dist`.

### 4.2. Configurar Nginx para o Frontend

Crie um arquivo de configuração Nginx para o seu frontend (`/etc/nginx/sites-available/recruitment_saas_frontend`):

```nginx
server {
    listen 80;
    server_name app.seusite.com;

    root /var/www/recruitment-saas-frontend-dist;
    index index.html index.htm;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Configurações para cache de arquivos estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico)$ {
        expires 1y;
        log_not_found off;
        add_header Cache-Control "public";
    }
}
```

Crie um link simbólico para `sites-enabled` e teste a configuração do Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/recruitment_saas_frontend /etc/nginx/sites-enabled
sudo nginx -t
```

Se o teste for bem-sucedido, reinicie o Nginx:

```bash
sudo systemctl restart nginx
```

**Nota:** Para HTTPS, você precisará configurar um certificado SSL (por exemplo, com Let's Encrypt) após a implantação inicial. Isso será abordado na seção de segurança da implantação.




## 5. Implantação da Extensão Chrome

A extensão Chrome não é implantada em um servidor, mas sim distribuída diretamente para os usuários. Existem duas formas principais de distribuição:

### 5.1. Distribuição Manual (para testes ou pequenos grupos)

1.  **Empacotar a extensão:** No seu ambiente de desenvolvimento, navegue até o diretório da extensão e empacote-a em um arquivo `.zip`.
    ```bash
    cd /caminho/para/sua/recruitment-chrome-extension
    zip -r ../recruitment-chrome-extension.zip .
    ```
2.  **Instalar no Chrome:**
    *   Abra o Chrome e digite `chrome://extensions` na barra de endereço.
    *   Ative o "Modo desenvolvedor" (Developer mode) no canto superior direito.
    *   Clique em "Carregar sem compactação" (Load unpacked) e selecione a pasta da sua extensão (não o arquivo .zip).
    *   Alternativamente, arraste e solte o arquivo `.zip` empacotado na página `chrome://extensions`.

### 5.2. Distribuição via Chrome Web Store (para usuários finais)

Para distribuir a extensão para um público maior, você precisará publicá-la na Chrome Web Store. Isso envolve:

1.  **Criar uma conta de desenvolvedor:** Você precisará de uma conta de desenvolvedor do Google e pagar uma taxa de registro única.
2.  **Preparar a extensão para envio:** Certifique-se de que seu `manifest.json` está configurado corretamente, que você tem ícones de todos os tamanhos necessários e que a extensão está funcionando conforme o esperado.
3.  **Fazer o upload da extensão:** Acesse o painel do desenvolvedor da Chrome Web Store e siga as instruções para fazer o upload do seu arquivo `.zip` empacotado.
4.  **Preencher informações da listagem:** Forneça uma descrição detalhada, capturas de tela, categoria e outras informações relevantes para a listagem da sua extensão.
5.  **Processo de revisão:** Sua extensão passará por um processo de revisão do Google antes de ser publicada.

**Nota:** Certifique-se de que a URL do backend na extensão (`API_BASE_URL` no `background.js` e `popup.js`) aponta para o domínio de produção do seu backend (ex: `https://api.seusite.com`).



