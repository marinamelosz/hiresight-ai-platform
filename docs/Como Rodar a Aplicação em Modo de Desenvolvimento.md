# Como Rodar a Aplicação em Modo de Desenvolvimento

Este guia irá ajudá-lo a colocar o backend (Flask) e o frontend (React) da aplicação para rodar em seu ambiente local, o que é ideal para testes e desenvolvimento.

## 1. Rodando o Backend (Flask)

O backend é a parte da aplicação que lida com a lógica de negócios, banco de dados e APIs. Ele será executado em `http://localhost:5000`.

### Pré-requisitos:
*   **Python 3.9+** instalado em sua máquina.
*   **pip** (gerenciador de pacotes do Python).

### Passos:

1.  **Abra seu terminal ou prompt de comando.**

2.  **Navegue até o diretório do backend:**
    ```bash
    cd /home/ubuntu/recruitment-saas-backend
    ```
    *(Nota: Se você baixou os arquivos para outro local, ajuste o caminho accordingly.)*

3.  **Ative o ambiente virtual:**
    ```bash
    source venv/bin/activate
    ```
    *(Se você ainda não criou o ambiente virtual ou instalou as dependências, execute: `python3 -m venv venv` e depois `pip install -r requirements.txt`)*

4.  **Defina as variáveis de ambiente:**
    Para o modo de desenvolvimento, você pode usar um arquivo `.env` ou definir as variáveis diretamente no terminal. Crie um arquivo `.env` na raiz do diretório `recruitment-saas-backend` com o seguinte conteúdo:
    ```
    DATABASE_URL=sqlite:///site.db
    JWT_SECRET_KEY=sua_chave_secreta_jwt_forte_aqui
    FLASK_ENV=development
    ```
    *(Substitua `sua_chave_secreta_jwt_forte_aqui` por uma string aleatória e segura. Para o modo de desenvolvimento, o SQLite é mais simples, pois não requer um servidor de banco de dados separado.)*

5.  **Execute as migrações do banco de dados (apenas na primeira vez ou após alterações no modelo):**
    ```bash
    flask db init
    flask db migrate -m 



    flask db upgrade
    ```
    *(Se você tiver problemas com `flask db`, certifique-se de que o Flask-Migrate está instalado e configurado corretamente no seu `main.py`.)*

6.  **Inicie o servidor Flask:**
    ```bash
    flask run
    ```
    Você deverá ver uma mensagem indicando que o servidor está rodando em `http://127.0.0.1:5000` ou `http://localhost:5000`.

## 2. Rodando o Frontend (React)

O frontend é a interface de usuário da aplicação que você acessará pelo navegador. Ele será executado em `http://localhost:5173`.

### Pré-requisitos:
*   **Node.js 18+** instalado em sua máquina.
*   **pnpm** (gerenciador de pacotes).

### Passos:

1.  **Abra um NOVO terminal ou prompt de comando.** (Mantenha o terminal do backend aberto e rodando).

2.  **Navegue até o diretório do frontend:**
    ```bash
    cd /home/ubuntu/recruitment-saas-frontend
    ```
    *(Novamente, ajuste o caminho se necessário.)*

3.  **Instale as dependências (apenas na primeira vez):**
    ```bash
    pnpm install
    ```

4.  **Inicie o servidor de desenvolvimento do React:**
    ```bash
    pnpm run dev
    ```
    Você deverá ver uma mensagem indicando que o servidor está rodando em `http://localhost:5173`.

## 3. Usando a Extensão Chrome

A extensão Chrome permite interagir com páginas web (como o LinkedIn) e enviar dados para o seu backend local.

### Passos:

1.  **Abra o Google Chrome.**

2.  **Acesse a página de extensões:** Digite `chrome://extensions` na barra de endereço e pressione Enter.

3.  **Ative o Modo Desenvolvedor:** No canto superior direito da página de extensões, ative a chave "Modo desenvolvedor" (Developer mode).

4.  **Carregue a extensão:**
    *   Clique no botão "Carregar sem compactação" (Load unpacked).
    *   Navegue até o diretório da sua extensão: `/home/ubuntu/recruitment-chrome-extension` (ou onde você a salvou).
    *   Selecione esta pasta e clique em "Selecionar Pasta".

5.  **Verifique a extensão:** O ícone da extensão deverá aparecer na sua barra de ferramentas do Chrome. Se não aparecer, clique no ícone de quebra-cabeça e "fixe" a extensão.

6.  **Teste a extensão:**
    *   Navegue até um perfil no LinkedIn.
    *   Clique no ícone da extensão.
    *   No popup, você deverá ver as opções de login/registro ou extração de dados. Certifique-se de que a URL do backend na extensão (`API_BASE_URL` no `background.js` e `popup.js`) aponta para `http://localhost:5000`.

## 4. Próximos Passos

*   **Acesse o Frontend:** Abra seu navegador e vá para `http://localhost:5173`.
*   **Registre-se:** Crie uma nova conta (você pode usar qualquer `tenant_id` inteiro, por exemplo, `1`).
*   **Explore:** Navegue pelo dashboard, adicione candidatos e vagas, e teste a extensão no LinkedIn.

Se tiver qualquer dificuldade em algum desses passos, me diga exatamente onde você parou e qual mensagem de erro apareceu. Estou aqui para ajudar!

