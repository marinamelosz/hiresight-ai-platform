# 🎯 HireSight.ai - Plataforma SaaS de Recrutamento Inteligente

Uma plataforma completa de recrutamento que utiliza inteligência artificial para analisar compatibilidade entre candidatos e vagas, com extensão Chrome para LinkedIn e dashboard web profissional.

## 🌟 Funcionalidades Principais

### 🧠 Análise Inteligente de Candidatos
- **Extração automática** de dados do LinkedIn
- **Análise de compatibilidade** baseada em job descriptions
- **Score detalhado** em 4 dimensões: Técnico, Experiência, Localização, Soft Skills
- **Recomendações específicas** para cada candidato

### 🔧 Extensão Chrome
- **Super extração** com múltiplas estratégias de fallback
- **Interface compacta** e profissional
- **Análise em tempo real** no LinkedIn
- **Entrada manual assistida** quando necessário

### 📊 Dashboard Web
- **Interface moderna** em React
- **Métricas em tempo real** de candidatos
- **Gestão completa** de vagas e candidatos
- **Relatórios detalhados** de análises

### 🔐 Sistema Completo
- **Autenticação segura** com JWT
- **API RESTful** robusta
- **Banco de dados** estruturado
- **Deploy ready** para produção

## 🛠️ Tecnologias Utilizadas

### Backend
- **Python 3.11** - Linguagem principal
- **Flask** - Framework web
- **SQLAlchemy** - ORM para banco de dados
- **JWT** - Autenticação segura
- **CORS** - Integração frontend/backend

### Frontend
- **React 18** - Interface de usuário
- **Vite** - Build tool moderno
- **CSS3** - Estilização responsiva
- **Fetch API** - Comunicação com backend

### Extensão Chrome
- **Vanilla JavaScript** - Lógica da extensão
- **Chrome Extensions API** - Integração com navegador
- **Content Scripts** - Extração de dados do LinkedIn
- **Popup Interface** - Interface compacta

### Ferramentas
- **Git** - Controle de versão
- **npm** - Gerenciador de pacotes
- **pip** - Gerenciador de pacotes Python

## 🚀 Como Executar o Projeto

### Pré-requisitos
- Python 3.11+
- Node.js 18+
- Git
- Google Chrome

### 1. Clone o Repositório
```bash
git clone https://github.com/seu-usuario/hiresight-ai-platform.git
cd hiresight-ai-platform
```

### 2. Configure o Backend
```bash
cd backend
pip install -r requirements.txt
python main.py
```
O backend estará rodando em `http://localhost:5000`

### 3. Configure o Frontend
```bash
cd frontend
npm install
npm run dev
```
O frontend estará rodando em `http://localhost:5173`

### 4. Instale a Extensão Chrome
1. Abra `chrome://extensions/`
2. Ative o "Modo do desenvolvedor"
3. Clique em "Carregar expandida"
4. Selecione a pasta `chrome-extension`

## 📱 Como Usar

### 1. Acesse o Dashboard
- Vá para `http://localhost:5173`
- Faça login com: `admin@hiresight.ai` / `admin123`

### 2. Use a Extensão no LinkedIn
1. Vá para qualquer perfil do LinkedIn
2. Clique na extensão HireSight.ai
3. Faça login na extensão
4. Cole a descrição da vaga
5. Clique em "🔍 Super Extração"
6. Analise a compatibilidade
7. Salve no dashboard

### 3. Visualize Resultados
- Acesse o dashboard para ver candidatos salvos
- Analise métricas e relatórios
- Compare diferentes candidatos

## 🎯 Funcionalidades da Análise

### Dimensões Avaliadas
- **🔧 Compatibilidade Técnica (40%)**: Skills, tecnologias, ferramentas
- **💼 Experiência Profissional (30%)**: Anos de experiência, senioridade
- **📍 Localização (15%)**: Compatibilidade geográfica, trabalho remoto
- **🤝 Soft Skills (15%)**: Liderança, comunicação, trabalho em equipe

### Skills Reconhecidas (80+)
- **Desenvolvimento**: JavaScript, Python, React, Angular, Vue, Node.js
- **Backend**: Django, Flask, Spring, Laravel, Express
- **Banco de Dados**: SQL, MongoDB, PostgreSQL, Redis
- **Cloud**: AWS, Azure, GCP, Docker, Kubernetes
- **Mobile**: React Native, Flutter, Android, iOS
- **Data Science**: Pandas, TensorFlow, PowerBI, Tableau
- **Design**: Figma, Photoshop, UI/UX
- **Marketing**: SEO, Google Ads, CRM, Salesforce

## 📊 Estrutura do Projeto

```
hiresight-ai-platform/
├── backend/                 # API Flask
│   ├── main.py             # Servidor principal
│   ├── models/             # Modelos de dados
│   ├── routes/             # Rotas da API
│   └── requirements.txt    # Dependências Python
├── frontend/               # Interface React
│   ├── src/                # Código fonte
│   ├── public/             # Arquivos públicos
│   └── package.json        # Dependências Node
├── chrome-extension/       # Extensão Chrome
│   ├── popup.html          # Interface da extensão
│   ├── popup.js            # Lógica principal
│   ├── popup.css           # Estilos
│   └── manifest.json       # Configuração
└── docs/                   # Documentação
    ├── screenshots/        # Capturas de tela
    └── guides/             # Guias de uso
```

## 🎨 Screenshots

### Dashboard Principal
![Dashboard](docs/screenshots/dashboard.png)

### Extensão Chrome
![Extensão](docs/screenshots/extension.png)

### Análise de Candidato
![Análise](docs/screenshots/analysis.png)

## 🔮 Roadmap Futuro

### Versão 2.0
- [ ] Integração com APIs oficiais do LinkedIn
- [ ] Análise de múltiplos candidatos simultaneamente
- [ ] Relatórios em PDF
- [ ] Sistema de notificações

### Versão 3.0
- [ ] Machine Learning para melhorar análises
- [ ] Integração com outros sites de emprego
- [ ] App mobile
- [ ] Sistema de pagamentos

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

**Seu Nome**
- GitHub: [@seu-usuario](https://github.com/seu-usuario)
- LinkedIn: [Seu Perfil](https://linkedin.com/in/seu-perfil)
- Email: seu.email@exemplo.com

## 🙏 Agradecimentos

- Inspirado na necessidade de otimizar processos de recrutamento
- Desenvolvido com foco na experiência do usuário
- Utiliza as melhores práticas de desenvolvimento web

---

⭐ **Se este projeto te ajudou, deixe uma estrela!** ⭐

