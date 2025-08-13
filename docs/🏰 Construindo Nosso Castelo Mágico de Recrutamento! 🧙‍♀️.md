# 🏰 Construindo Nosso Castelo Mágico de Recrutamento! 🧙‍♀️

Olá, futuro(a) Mago(a) do Recrutamento! Sei que as palavras "backend", "frontend" e "extensão" podem parecer feitiços complicados, mas não se preocupe! Vamos construir nosso castelo mágico juntos, um tijolinho de cada vez, de um jeito divertido e fácil.

Nosso castelo tem três partes principais que precisam funcionar para a magia acontecer:

1.  **O Coração do Castelo (Backend - Flask):** É onde toda a magia acontece por trás das cenas! Ele guarda os segredos (dados), faz os cálculos e prepara as poções (informações) para as outras partes.
2.  **A Janela Mágica (Frontend - React):** É a tela bonita que você vê! Por ela, você interage com o castelo, vê os candidatos, as vagas e tudo mais.
3.  **O Olho Mágico (Extensão Chrome):** É um pequeno ajudante que vive no seu navegador. Ele pode espiar outras páginas (como o LinkedIn) e trazer informações para o nosso castelo.

Vamos começar a dar vida a cada parte!

## 1. Acendendo o Coração do Castelo (Backend - Flask) ❤️

Imagine que o Coração do Castelo é um grande caldeirão que precisa ser aceso para começar a trabalhar. Ele vai funcionar no endereço mágico `http://localhost:5000`.

### O que você precisa ter (Pré-requisitos):
*   **Python 3.9+:** Pense nele como a língua que o Coração do Castelo entende. Se você já tem, ótimo! Se não, é como aprender um novo idioma.
*   **pip:** É o carteiro que entrega os ingredientes para o caldeirão.

### Passos Mágicos:

1.  **Abra seu Livro de Feitiços (Terminal/Prompt de Comando):**
    *   No seu computador, procure por "Terminal" (no Mac/Linux) ou "Prompt de Comando" / "PowerShell" (no Windows) e abra-o. É como abrir um livro onde você vai digitar os feitiços.

2.  **Vá para a Cozinha do Castelo:**
    *   Digite este feitiço e aperte Enter:
        ```bash
        cd /home/ubuntu/recruitment-saas-backend
        ```
    *   *(Se você baixou os arquivos para outro lugar, substitua `/home/ubuntu/recruitment-saas-backend` pelo caminho onde está a pasta `recruitment-saas-backend`.)*

3.  **Ative o Escudo Mágico (Ambiente Virtual):**
    *   Digite este feitiço e aperte Enter:
        ```bash
        source venv/bin/activate
        ```
    *   *(Se aparecer um erro, significa que você ainda não criou o escudo. Digite `python3 -m venv venv` e aperte Enter. Depois, digite `pip install -r requirements.txt` e aperte Enter. Aí sim, tente `source venv/bin/activate` de novo.)*

4.  **Diga os Segredos do Caldeirão (Variáveis de Ambiente):**
    *   Precisamos dizer ao caldeirão onde ele vai guardar os segredos. Vamos criar um pergaminho mágico chamado `.env` dentro da pasta `recruitment-saas-backend`.
    *   Abra um editor de texto simples (como Bloco de Notas no Windows, TextEdit no Mac, ou VS Code se você tiver) e copie e cole isso:
        ```
        DATABASE_URL=sqlite:///site.db
        JWT_SECRET_KEY=coloque_uma_frase_secreta_bem_longa_e_unica_aqui
        FLASK_ENV=development
        ```
    *   **MUITO IMPORTANTE:** Onde está `coloque_uma_frase_secreta_bem_longa_e_unica_aqui`, você deve inventar uma frase bem longa e estranha, só sua! Por exemplo: `MinhaFraseSecretaDoCasteloMagicoDeRecrutamento2025!@#`.
    *   Salve este arquivo com o nome `.env` (sim, com o ponto na frente e sem extensão) dentro da pasta `recruitment-saas-backend`.

5.  **Organize os Livros de Receitas (Migrações do Banco de Dados - Apenas na primeira vez!):**
    *   Digite estes feitiços, um por um, e aperte Enter depois de cada um:
        ```bash
        flask db init
        flask db migrate -m 


"Initial migration"
        flask db upgrade
        ```
    *   *(Se der algum erro com `flask db`, não se preocupe! Pode ser que o Flask-Migrate não esteja totalmente configurado. Por enquanto, podemos pular essa parte e seguir em frente, mas lembre-se que para guardar os dados de verdade, essa etapa é importante.)*

6.  **Acenda o Caldeirão! (Inicie o Servidor Flask):**
    *   Agora, o feitiço final para acender o Coração do Castelo:
        ```bash
        flask run
        ```
    *   Se tudo der certo, você verá uma mensagem dizendo que o caldeirão está fervendo em `http://127.0.0.1:5000` ou `http://localhost:5000`. **Deixe este terminal aberto!** Ele é o coração do nosso castelo e precisa continuar batendo.

## 2. Abrindo a Janela Mágica (Frontend - React) 🖼️

Agora que o Coração do Castelo está aceso, vamos abrir a Janela Mágica para você poder ver e interagir com ele. Ela vai aparecer no endereço mágico `http://localhost:5173`.

### O que você precisa ter (Pré-requisitos):
*   **Node.js 18+:** É como a energia que faz a Janela Mágica brilhar.
*   **pnpm:** É o construtor rápido que monta a janela.

### Passos Mágicos:

1.  **Abra um NOVO Livro de Feitiços! (Novo Terminal):**
    *   **IMPORTANTE:** Não feche o terminal do Coração do Castelo! Abra um novo terminal ou prompt de comando. É como ter dois livros abertos ao mesmo tempo.

2.  **Vá para a Sala da Janela:**
    *   Digite este feitiço e aperte Enter:
        ```bash
        cd /home/ubuntu/recruitment-saas-frontend
        ```
    *   *(Ajuste o caminho se necessário, como fizemos antes.)*

3.  **Monte a Janela (Instale as Dependências - Apenas na primeira vez!):**
    *   Digite este feitiço e aperte Enter:
        ```bash
        pnpm install
        ```
    *   Isso pode demorar um pouquinho, é como montar todas as peças da janela.

4.  **Faça a Janela Brilhar! (Inicie o Servidor React):**
    *   Agora, o feitiço para acender a Janela Mágica:
        ```bash
        pnpm run dev
        ```
    *   Você verá uma mensagem dizendo que a janela está brilhando em `http://localhost:5173`. **Deixe este terminal também aberto!**

## 3. Ativando o Olho Mágico (Extensão Chrome) 👁️

Este é o nosso pequeno espião que vai nos ajudar a trazer informações de outros lugares para o castelo.

### Passos Mágicos:

1.  **Abra o Portal do Chrome:**
    *   Abra seu navegador Google Chrome.

2.  **Vá para a Sala Secreta das Extensões:**
    *   Na barra de endereço do Chrome, digite `chrome://extensions` e aperte Enter.

3.  **Ative o Modo Mago (Modo Desenvolvedor):**
    *   No canto superior direito da página de extensões, você verá uma chave chamada "Modo desenvolvedor" (Developer mode). Clique nela para ativá-la.

4.  **Traga o Olho Mágico para o Chrome:**
    *   Clique no botão "Carregar sem compactação" (Load unpacked).
    *   Navegue até a pasta da sua extensão: `/home/ubuntu/recruitment-chrome-extension` (ou onde você a salvou).
    *   Selecione esta pasta e clique em "Selecionar Pasta".

5.  **Encontre o Olho Mágico na Barra de Ferramentas:**
    *   O ícone da extensão (um pequeno chapéu de formatura com uma lupa) deverá aparecer na sua barra de ferramentas do Chrome. Se não aparecer, clique no ícone de quebra-cabeça (gerenciar extensões) e "fixe" o ícone da nossa extensão.

6.  **Teste o Olho Mágico:**
    *   Vá para o LinkedIn e abra o perfil de alguém.
    *   Clique no ícone da extensão. No popup que abrir, você verá opções para fazer login/registrar ou extrair dados. Certifique-se de que a extensão está configurada para se comunicar com o nosso Coração do Castelo (`http://localhost:5000`).

## 4. A Magia Acontece! ✨

Agora que todas as partes do nosso castelo estão ativas:

*   **Acesse a Janela Mágica:** Abra seu navegador e vá para `http://localhost:5173`.
*   **Crie sua Conta:** Clique em "Registre-se" e crie uma nova conta. Você pode usar qualquer número inteiro para o `tenant_id` (por exemplo, `1`).
*   **Explore o Castelo:** Navegue pelo dashboard, adicione candidatos e vagas, e use o Olho Mágico (extensão) no LinkedIn para trazer novos dados para o seu castelo!

Se você tiver qualquer dificuldade em algum desses passos, ou se algum feitiço não funcionar, me diga exatamente onde você parou e qual mensagem de erro apareceu. Estou aqui para ajudar a desvendar qualquer mistério! Você consegue! 💪

