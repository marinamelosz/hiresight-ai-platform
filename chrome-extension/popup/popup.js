// 🎯 HireSight.ai - Super Extrator de Dados LinkedIn
// Versão ultra robusta para extrair skills e about

console.log('🎯 HireSight.ai Super Extrator iniciando...');

// Estado da aplicação
let currentUser = null;
let currentJobDescription = '';
let profileData = null;
let analysisResult = null;
let isLoggedIn = false;

// URLs da API
const API_BASE = 'http://localhost:5000/api';

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM carregado, inicializando Super Extrator...');
    initializeExtension();
});

async function initializeExtension() {
    try {
        // Verificar se está logado
        const token = localStorage.getItem('hiresight_token');
        if (token) {
            await verifyToken(token);
        } else {
            showLoginForm();
        }
        
        // Verificar se está no LinkedIn
        checkCurrentPage();
        
    } catch (error) {
        console.error('❌ Erro na inicialização:', error);
        showLoginForm();
    }
}

async function verifyToken(token) {
    try {
        const response = await fetch(`${API_BASE}/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const userData = await response.json();
            currentUser = userData;
            isLoggedIn = true;
            showMainInterface();
        } else {
            localStorage.removeItem('hiresight_token');
            showLoginForm();
        }
    } catch (error) {
        console.error('❌ Erro ao verificar token:', error);
        showLoginForm();
    }
}

function showLoginForm() {
    document.getElementById('app').innerHTML = `
        <div class="login-container">
            <div class="header">
                <h2>🎯 HireSight.ai</h2>
                <p>Super Extrator LinkedIn</p>
            </div>
            
            <form id="loginForm" class="login-form">
                <div class="form-group">
                    <input type="email" id="email" placeholder="Email" required>
                </div>
                <div class="form-group">
                    <input type="password" id="password" placeholder="Senha" required>
                </div>
                <button type="submit" class="btn-primary">🔐 Entrar</button>
                <button type="button" id="demoLogin" class="btn-secondary">⚡ Login Demo</button>
            </form>
            
            <div id="loginStatus" class="status-message"></div>
        </div>
    `;
    
    // Event listeners
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('demoLogin').addEventListener('click', handleDemoLogin);
}

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const statusDiv = document.getElementById('loginStatus');
    
    statusDiv.innerHTML = '⏳ Fazendo login...';
    
    try {
        const response = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('hiresight_token', data.token);
            currentUser = data.user;
            isLoggedIn = true;
            statusDiv.innerHTML = '✅ Login realizado com sucesso!';
            setTimeout(showMainInterface, 1000);
        } else {
            statusDiv.innerHTML = `❌ ${data.message || 'Erro no login'}`;
        }
    } catch (error) {
        console.error('❌ Erro no login:', error);
        statusDiv.innerHTML = '❌ Erro de conexão com o servidor';
    }
}

function handleDemoLogin() {
    document.getElementById('email').value = 'admin@hiresight.ai';
    document.getElementById('password').value = 'admin123';
    document.getElementById('loginForm').dispatchEvent(new Event('submit'));
}

async function checkCurrentPage() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const url = tab.url;
        
        if (url.includes('linkedin.com/in/')) {
            document.getElementById('pageStatus').innerHTML = '💼 Perfil LinkedIn Detectado';
            document.getElementById('analyzeSection').style.display = 'block';
            document.getElementById('quickExtract').style.display = 'block';
        } else if (url.includes('linkedin.com')) {
            document.getElementById('pageStatus').innerHTML = '🌐 LinkedIn - Vá para um perfil específico';
            document.getElementById('analyzeSection').style.display = 'none';
            document.getElementById('quickExtract').style.display = 'none';
        } else {
            document.getElementById('pageStatus').innerHTML = '🌍 Funciona melhor no LinkedIn';
            document.getElementById('analyzeSection').style.display = 'none';
            document.getElementById('quickExtract').style.display = 'none';
        }
    } catch (error) {
        console.error('❌ Erro ao verificar página:', error);
        document.getElementById('pageStatus').innerHTML = '❌ Erro ao detectar página';
    }
}

function showMainInterface() {
    document.getElementById('app').innerHTML = `
        <div class="main-container">
            <div class="header">
                <h2>🎯 HireSight.ai</h2>
                <p>Olá, ${currentUser?.name || 'Usuário'}!</p>
            </div>
            
            <div id="pageStatus" class="page-status">
                🔍 Verificando página...
            </div>
            
            <div id="quickExtract" class="quick-extract" style="display: none;">
                <button id="quickExtractBtn" class="btn-quick">
                    🔍 Super Extração
                </button>
                <small>Extração robusta com múltiplas estratégias</small>
            </div>
            
            <div id="analyzeSection" class="analyze-section" style="display: none;">
                <div class="job-description-section">
                    <label for="jobDescription">📝 Descrição da Vaga:</label>
                    <textarea 
                        id="jobDescription" 
                        placeholder="Cole a descrição da vaga aqui...&#10;&#10;💡 Inclua skills específicas para melhor análise"
                        rows="5"
                    ></textarea>
                    
                    <div class="analyze-buttons">
                        <button id="analyzeButton" class="btn-primary">
                            🧠 Analisar Compatibilidade
                        </button>
                        <button id="manualInputBtn" class="btn-secondary">
                            ✏️ Entrada Manual
                        </button>
                    </div>
                </div>
            </div>
            
            <div id="extractionPreview" class="extraction-preview" style="display: none;">
                <h4>📋 Dados Extraídos:</h4>
                <div id="previewContent"></div>
                <div class="preview-buttons">
                    <button id="useExtractedBtn" class="btn-primary">✅ Usar Dados</button>
                    <button id="editExtractedBtn" class="btn-secondary">✏️ Editar</button>
                </div>
            </div>
            
            <div id="manualInput" class="manual-input" style="display: none;">
                <h4>✏️ Dados do Candidato:</h4>
                <div class="manual-fields">
                    <input type="text" id="manual_name" placeholder="Nome completo">
                    <input type="text" id="manual_title" placeholder="Cargo atual">
                    <input type="text" id="manual_location" placeholder="Localização">
                    <textarea id="manual_about" placeholder="Sobre/Resumo profissional" rows="3"></textarea>
                    <textarea id="manual_skills" placeholder="Skills (uma por linha ou separadas por vírgula)" rows="3"></textarea>
                </div>
                <div class="manual-buttons">
                    <button id="analyzeManualBtn" class="btn-primary">🧠 Analisar</button>
                    <button id="cancelManualBtn" class="btn-cancel">❌ Cancelar</button>
                </div>
            </div>
            
            <div class="actions">
                <button id="dashboardButton" class="btn-secondary">
                    📊 Dashboard
                </button>
                <button id="logoutButton" class="btn-logout">
                    🚪 Sair
                </button>
            </div>
            
            <div id="analysisResult" class="analysis-result" style="display: none;">
                <!-- Resultado da análise será mostrado aqui -->
            </div>
            
            <div id="actionStatus" class="status-message"></div>
        </div>
    `;
    
    // Event listeners
    document.getElementById('quickExtractBtn').addEventListener('click', superExtractData);
    document.getElementById('analyzeButton').addEventListener('click', analyzeProfileCompatibility);
    document.getElementById('manualInputBtn').addEventListener('click', showManualInput);
    document.getElementById('analyzeManualBtn').addEventListener('click', analyzeManualData);
    document.getElementById('cancelManualBtn').addEventListener('click', hideManualInput);
    document.getElementById('useExtractedBtn').addEventListener('click', useExtractedData);
    document.getElementById('editExtractedBtn').addEventListener('click', editExtractedData);
    document.getElementById('dashboardButton').addEventListener('click', openDashboard);
    document.getElementById('logoutButton').addEventListener('click', handleLogout);
    
    // Verificar página atual
    checkCurrentPage();
}

async function superExtractData() {
    const statusDiv = document.getElementById('actionStatus');
    const quickBtn = document.getElementById('quickExtractBtn');
    
    statusDiv.innerHTML = '🔍 Executando super extração...';
    quickBtn.disabled = true;
    quickBtn.innerHTML = '⏳ Extraindo...';
    
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: superExtractLinkedInData
        });
        
        if (results && results[0] && results[0].result) {
            const data = results[0].result;
            
            if (data.success) {
                profileData = data;
                showExtractionPreview(data.data);
                statusDiv.innerHTML = '✅ Super extração concluída! Revise os dados.';
            } else {
                statusDiv.innerHTML = `❌ ${data.error}`;
                showManualInput();
            }
        }
        
    } catch (error) {
        console.error('❌ Erro na super extração:', error);
        statusDiv.innerHTML = '❌ Erro na extração. Use entrada manual.';
        showManualInput();
    } finally {
        quickBtn.disabled = false;
        quickBtn.innerHTML = '🔍 Super Extração';
    }
}

// Função super robusta para extrair dados do LinkedIn
function superExtractLinkedInData() {
    try {
        console.log('🔍 Iniciando super extração do LinkedIn...');
        
        const data = {
            name: '',
            title: '',
            location: '',
            about: '',
            skills: [],
            experience: '',
            education: '',
            profileUrl: window.location.href,
            extractedAt: new Date().toISOString()
        };
        
        // Função auxiliar para tentar múltiplos seletores
        function trySelectors(selectors, getAttribute = null) {
            for (const selector of selectors) {
                try {
                    const elements = document.querySelectorAll(selector);
                    for (const element of elements) {
                        if (element) {
                            const text = getAttribute ? element.getAttribute(getAttribute) : element.textContent;
                            if (text && text.trim()) {
                                return text.trim();
                            }
                        }
                    }
                } catch (e) {
                    continue;
                }
            }
            return '';
        }
        
        // Função para extrair texto de múltiplos elementos
        function extractMultipleTexts(selectors, maxItems = 10) {
            const texts = [];
            for (const selector of selectors) {
                try {
                    const elements = document.querySelectorAll(selector);
                    for (const element of elements) {
                        if (element && element.textContent.trim()) {
                            const text = element.textContent.trim();
                            if (text.length > 2 && !texts.includes(text)) {
                                texts.push(text);
                                if (texts.length >= maxItems) break;
                            }
                        }
                    }
                    if (texts.length >= maxItems) break;
                } catch (e) {
                    continue;
                }
            }
            return texts;
        }
        
        // 1. NOME - seletores expandidos
        const nameSelectors = [
            'h1.text-heading-xlarge',
            'h1[data-anonymize="person-name"]',
            '.pv-text-details__left-panel h1',
            'h1.break-words',
            '.pv-top-card h1',
            '.pv-top-card__profile-photo-container + div h1',
            '.ph5 h1',
            '[data-field="name"] h1',
            '.artdeco-entity-lockup__title h1'
        ];
        data.name = trySelectors(nameSelectors);
        
        // 2. TÍTULO/CARGO - seletores expandidos
        const titleSelectors = [
            '.text-body-medium.break-words',
            '.pv-text-details__left-panel .text-body-medium',
            'h2.break-words',
            '.pv-top-card .text-body-medium',
            '.pv-top-card__headline',
            '.ph5 .text-body-medium',
            '[data-field="headline"]',
            '.artdeco-entity-lockup__subtitle'
        ];
        data.title = trySelectors(titleSelectors);
        
        // 3. LOCALIZAÇÃO - seletores expandidos
        const locationSelectors = [
            '.text-body-small.inline.t-black--light.break-words',
            '.pv-text-details__left-panel .text-body-small',
            '.pv-top-card .text-body-small',
            '.ph5 .text-body-small',
            '[data-field="location"]',
            '.pv-top-card__location'
        ];
        data.location = trySelectors(locationSelectors);
        
        // 4. SOBRE - estratégias múltiplas
        console.log('🔍 Extraindo seção Sobre...');
        
        const aboutSelectors = [
            '.pv-about__summary-text .inline-show-more-text',
            '.pv-about__summary-text',
            '.pvs-about__summary-text',
            '.pv-about-section .pv-about__summary-text',
            '.about-section .pv-about__summary-text',
            '[data-field="summary"]',
            '.summary-section .pv-about__summary-text'
        ];
        
        data.about = trySelectors(aboutSelectors);
        
        // Se não encontrou sobre pelos seletores, tentar por texto
        if (!data.about) {
            console.log('🔍 Tentando extrair Sobre por texto...');
            const pageText = document.body.innerText;
            
            // Estratégias de regex para encontrar seção sobre
            const aboutPatterns = [
                /Sobre\s*\n\s*([^]*?)(?:\n\s*(?:Atividade|Experiência|Formação|Educação|Licenças|Competências|Skills|Idiomas|Recomendações|Cursos|Projetos|Publicações|Patentes|Prêmios|Organizações|Causas|Interesses)|\n\s*Ver\s+(?:mais|menos)|$)/i,
                /About\s*\n\s*([^]*?)(?:\n\s*(?:Activity|Experience|Education|Licenses|Skills|Languages|Recommendations|Courses|Projects|Publications|Patents|Honors|Organizations|Causes|Interests)|\n\s*See\s+(?:more|less)|$)/i
            ];
            
            for (const pattern of aboutPatterns) {
                const match = pageText.match(pattern);
                if (match && match[1] && match[1].trim().length > 20) {
                    data.about = match[1].trim().substring(0, 1000); // Limitar a 1000 chars
                    console.log('✅ Sobre extraído por regex:', data.about.substring(0, 100) + '...');
                    break;
                }
            }
        }
        
        // 5. SKILLS - estratégias múltiplas
        console.log('🔍 Extraindo skills...');
        
        const skillSelectors = [
            '.pv-skill-category-entity__name span[aria-hidden="true"]',
            '.pv-skill-category-entity__name .visually-hidden',
            '.skill-category-entity__name',
            '.pv-skill-entity__skill-name',
            '.skill-entity__skill-name',
            '[data-field="skill_name"]',
            '.skills-section .pv-skill-category-entity__name span',
            '.pvs-entity__caption-wrapper span[aria-hidden="true"]'
        ];
        
        data.skills = extractMultipleTexts(skillSelectors, 15);
        
        // Se não encontrou skills pelos seletores, tentar por texto
        if (data.skills.length === 0) {
            console.log('🔍 Tentando extrair Skills por texto...');
            const pageText = document.body.innerText;
            
            // Procurar seção de competências/skills
            const skillsPatterns = [
                /(?:Competências|Skills)\s*\n\s*([^]*?)(?:\n\s*(?:Idiomas|Languages|Recomendações|Recommendations|Cursos|Courses|Projetos|Projects|Publicações|Publications|Patentes|Patents|Prêmios|Honors|Organizações|Organizations|Causas|Causes|Interesses|Interests)|\n\s*Ver\s+(?:mais|menos)|$)/i
            ];
            
            for (const pattern of skillsPatterns) {
                const match = pageText.match(pattern);
                if (match && match[1]) {
                    const skillsText = match[1].trim();
                    // Dividir por linhas e filtrar
                    const skillsArray = skillsText.split('\n')
                        .map(s => s.trim())
                        .filter(s => s.length > 2 && s.length < 50 && !s.includes('Ver mais') && !s.includes('See more'))
                        .slice(0, 15);
                    
                    if (skillsArray.length > 0) {
                        data.skills = skillsArray;
                        console.log('✅ Skills extraídas por regex:', data.skills);
                        break;
                    }
                }
            }
        }
        
        // 6. EXPERIÊNCIA - extrair texto da seção
        console.log('🔍 Extraindo experiência...');
        const pageText = document.body.innerText;
        const experienceMatch = pageText.match(/Experiência\s*\n\s*([^]*?)(?:\n\s*(?:Formação|Educação|Licenças|Competências|Skills)|\n\s*Ver\s+(?:mais|menos)|$)/i);
        if (experienceMatch && experienceMatch[1]) {
            data.experience = experienceMatch[1].trim().substring(0, 1500); // Limitar
        }
        
        // 7. EDUCAÇÃO - extrair texto da seção
        console.log('🔍 Extraindo educação...');
        const educationMatch = pageText.match(/(?:Formação|Educação|Education)\s*\n\s*([^]*?)(?:\n\s*(?:Licenças|Competências|Skills|Idiomas)|\n\s*Ver\s+(?:mais|menos)|$)/i);
        if (educationMatch && educationMatch[1]) {
            data.education = educationMatch[1].trim().substring(0, 800); // Limitar
        }
        
        // Validação final
        const hasValidData = data.name || data.title;
        
        console.log('📊 Dados extraídos:', {
            name: data.name ? '✅' : '❌',
            title: data.title ? '✅' : '❌',
            location: data.location ? '✅' : '❌',
            about: data.about ? `✅ (${data.about.length} chars)` : '❌',
            skills: data.skills.length > 0 ? `✅ (${data.skills.length} skills)` : '❌',
            experience: data.experience ? `✅ (${data.experience.length} chars)` : '❌',
            education: data.education ? `✅ (${data.education.length} chars)` : '❌'
        });
        
        if (hasValidData) {
            return {
                success: true,
                data: data,
                message: `Dados extraídos: ${data.name ? 'Nome' : ''} ${data.title ? 'Cargo' : ''} ${data.about ? 'Sobre' : ''} ${data.skills.length > 0 ? `${data.skills.length} Skills` : ''}`
            };
        } else {
            return {
                success: false,
                error: 'Não foi possível encontrar dados básicos do perfil.',
                data: null
            };
        }
        
    } catch (error) {
        console.error('❌ Erro na super extração:', error);
        return {
            success: false,
            error: 'Erro ao extrair dados: ' + error.message,
            data: null
        };
    }
}

function showExtractionPreview(data) {
    const previewDiv = document.getElementById('extractionPreview');
    const contentDiv = document.getElementById('previewContent');
    
    contentDiv.innerHTML = `
        <div class="preview-item">
            <strong>👤 Nome:</strong> ${data.name || 'Não encontrado'}
        </div>
        <div class="preview-item">
            <strong>💼 Cargo:</strong> ${data.title || 'Não encontrado'}
        </div>
        <div class="preview-item">
            <strong>📍 Localização:</strong> ${data.location || 'Não encontrado'}
        </div>
        <div class="preview-item">
            <strong>📝 Sobre:</strong> ${data.about ? `${data.about.substring(0, 100)}${data.about.length > 100 ? '...' : ''}` : 'Não encontrado'}
        </div>
        <div class="preview-item">
            <strong>🎯 Skills (${data.skills.length}):</strong> ${data.skills.length > 0 ? data.skills.slice(0, 5).join(', ') + (data.skills.length > 5 ? '...' : '') : 'Não encontrado'}
        </div>
        <div class="preview-item">
            <strong>💼 Experiência:</strong> ${data.experience ? `${data.experience.substring(0, 100)}...` : 'Não encontrado'}
        </div>
    `;
    
    previewDiv.style.display = 'block';
    document.getElementById('analyzeSection').style.display = 'none';
}

function useExtractedData() {
    document.getElementById('extractionPreview').style.display = 'none';
    document.getElementById('analyzeSection').style.display = 'block';
    
    const jobDescription = document.getElementById('jobDescription').value.trim();
    if (jobDescription) {
        analyzeWithExtractedData();
    } else {
        document.getElementById('actionStatus').innerHTML = '📝 Insira a descrição da vaga para analisar!';
    }
}

function editExtractedData() {
    const data = profileData.data;
    
    // Preencher campos manuais com dados extraídos
    document.getElementById('manual_name').value = data.name || '';
    document.getElementById('manual_title').value = data.title || '';
    document.getElementById('manual_location').value = data.location || '';
    document.getElementById('manual_about').value = data.about || '';
    document.getElementById('manual_skills').value = data.skills.join('\n') || '';
    
    document.getElementById('extractionPreview').style.display = 'none';
    showManualInput();
}

async function analyzeWithExtractedData() {
    const jobDescription = document.getElementById('jobDescription').value.trim();
    currentJobDescription = jobDescription;
    
    const analysis = await analyzeJobCompatibilityAdvanced(profileData.data, jobDescription);
    
    if (analysis.success) {
        analysisResult = analysis.result;
        showAnalysisResult(analysis.result);
        document.getElementById('actionStatus').innerHTML = '✅ Análise concluída com dados extraídos!';
    }
}

function showManualInput() {
    document.getElementById('manualInput').style.display = 'block';
    document.getElementById('analyzeSection').style.display = 'none';
    document.getElementById('extractionPreview').style.display = 'none';
}

function hideManualInput() {
    document.getElementById('manualInput').style.display = 'none';
    document.getElementById('analyzeSection').style.display = 'block';
    document.getElementById('actionStatus').innerHTML = '';
}

async function analyzeManualData() {
    const jobDescription = document.getElementById('jobDescription').value.trim();
    
    if (!jobDescription) {
        document.getElementById('actionStatus').innerHTML = '❌ Insira a descrição da vaga primeiro!';
        return;
    }
    
    const manualData = {
        name: document.getElementById('manual_name').value.trim(),
        title: document.getElementById('manual_title').value.trim(),
        location: document.getElementById('manual_location').value.trim(),
        about: document.getElementById('manual_about').value.trim(),
        skills: document.getElementById('manual_skills').value.trim().split(/[\n,]/).map(s => s.trim()).filter(s => s),
        profileUrl: window.location.href,
        source: 'manual'
    };
    
    if (!manualData.name && !manualData.title) {
        document.getElementById('actionStatus').innerHTML = '❌ Preencha pelo menos o nome ou cargo!';
        return;
    }
    
    profileData = { success: true, data: manualData };
    
    const analysis = await analyzeJobCompatibilityAdvanced(manualData, jobDescription);
    
    if (analysis.success) {
        analysisResult = analysis.result;
        showAnalysisResult(analysis.result);
        hideManualInput();
    }
}

async function analyzeProfileCompatibility() {
    const statusDiv = document.getElementById('actionStatus');
    const analyzeButton = document.getElementById('analyzeButton');
    const jobDescription = document.getElementById('jobDescription').value.trim();
    
    if (!jobDescription) {
        statusDiv.innerHTML = '❌ Por favor, insira a descrição da vaga primeiro!';
        return;
    }
    
    if (!profileData || !profileData.success) {
        statusDiv.innerHTML = '❌ Execute a super extração primeiro!';
        return;
    }
    
    currentJobDescription = jobDescription;
    statusDiv.innerHTML = '🧠 Analisando compatibilidade...';
    analyzeButton.disabled = true;
    
    try {
        const analysis = await analyzeJobCompatibilityAdvanced(profileData.data, jobDescription);
        
        if (analysis.success) {
            analysisResult = analysis.result;
            statusDiv.innerHTML = '✅ Análise concluída!';
            showAnalysisResult(analysis.result);
        } else {
            statusDiv.innerHTML = `❌ Erro na análise: ${analysis.error}`;
        }
        
    } catch (error) {
        console.error('❌ Erro na análise:', error);
        statusDiv.innerHTML = '❌ Erro ao analisar: ' + error.message;
    } finally {
        analyzeButton.disabled = false;
    }
}

// Função de análise avançada (mesma da versão anterior, mas melhorada)
async function analyzeJobCompatibilityAdvanced(profileData, jobDescription) {
    try {
        console.log('🧠 Analisando compatibilidade avançada...');
        
        const analysis = {
            overallScore: 0,
            matches: [],
            missingSkills: [],
            strengths: [],
            concerns: [],
            recommendation: '',
            detailedAnalysis: {
                technicalFit: 0,
                experienceFit: 0,
                locationFit: 0,
                softSkillsFit: 0
            }
        };
        
        // Normalizar textos
        const jobLower = jobDescription.toLowerCase();
        const profileText = `${profileData.name} ${profileData.title} ${profileData.about} ${profileData.experience || ''} ${profileData.education || ''} ${profileData.skills ? profileData.skills.join(' ') : ''}`.toLowerCase();
        
        // 1. ANÁLISE TÉCNICA EXPANDIDA (40% do score)
        const technicalSkills = [
            // Desenvolvimento Web
            'javascript', 'typescript', 'react', 'angular', 'vue', 'node', 'nodejs', 'express',
            'html', 'css', 'sass', 'scss', 'bootstrap', 'tailwind', 'jquery', 'webpack',
            // Backend
            'python', 'java', 'php', 'c#', 'ruby', 'go', 'rust', 'scala', 'kotlin',
            'django', 'flask', 'spring', 'laravel', 'rails', 'fastapi',
            // Banco de Dados
            'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'oracle',
            'sqlite', 'cassandra', 'dynamodb', 'firebase',
            // Cloud/DevOps
            'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'git', 'github',
            'gitlab', 'terraform', 'ansible', 'ci/cd', 'devops',
            // Mobile
            'android', 'ios', 'react native', 'flutter', 'swift', 'kotlin',
            // Data Science
            'pandas', 'numpy', 'scikit-learn', 'tensorflow', 'pytorch', 'r', 'matlab',
            'tableau', 'powerbi', 'excel', 'sql server', 'spark', 'hadoop',
            // Metodologias
            'agile', 'scrum', 'kanban', 'lean', 'waterfall',
            // Business/Marketing
            'marketing', 'vendas', 'sales', 'crm', 'salesforce', 'hubspot',
            'seo', 'sem', 'google ads', 'facebook ads', 'analytics',
            // Design
            'photoshop', 'illustrator', 'figma', 'sketch', 'adobe', 'ui/ux', 'design'
        ];
        
        let technicalMatches = 0;
        let technicalRequired = 0;
        
        technicalSkills.forEach(skill => {
            if (jobLower.includes(skill)) {
                technicalRequired++;
                if (profileText.includes(skill)) {
                    technicalMatches++;
                    analysis.matches.push(`✅ ${skill.toUpperCase()}`);
                } else {
                    analysis.missingSkills.push(`❌ ${skill.toUpperCase()}`);
                }
            }
        });
        
        analysis.detailedAnalysis.technicalFit = technicalRequired > 0 ? 
            Math.round((technicalMatches / technicalRequired) * 100) : 80;
        
        // 2. ANÁLISE DE EXPERIÊNCIA (30% do score)
        const experienceMatch = jobLower.match(/(\d+)\+?\s*anos?/);
        let experienceScore = 70; // Score padrão
        
        if (experienceMatch) {
            const requiredYears = parseInt(experienceMatch[1]);
            if (profileData.experience && profileData.experience.length > 200) {
                experienceScore = 90; // Tem experiência detalhada
                analysis.strengths.push(`💼 Experiência profissional detalhada (${Math.floor(profileData.experience.length/100)} pontos)`);
            } else if (profileData.about && profileData.about.length > 100) {
                experienceScore = 75;
                analysis.strengths.push(`💼 Resumo profissional presente`);
            } else {
                experienceScore = 60;
                analysis.concerns.push(`⚠️ Verificar se tem ${requiredYears}+ anos de experiência`);
            }
        }
        
        analysis.detailedAnalysis.experienceFit = experienceScore;
        
        // 3. ANÁLISE DE LOCALIZAÇÃO (15% do score)
        let locationScore = 60; // Score padrão
        
        if (profileData.location) {
            if (jobLower.includes('remoto') || jobLower.includes('remote')) {
                locationScore = 100;
                analysis.strengths.push(`🌍 Trabalho remoto disponível`);
            } else if (jobLower.includes(profileData.location.toLowerCase())) {
                locationScore = 100;
                analysis.strengths.push(`📍 Localização compatível: ${profileData.location}`);
            } else {
                locationScore = 70;
                analysis.strengths.push(`📍 Localização: ${profileData.location}`);
            }
        }
        
        analysis.detailedAnalysis.locationFit = locationScore;
        
        // 4. ANÁLISE DE SOFT SKILLS (15% do score)
        const softSkills = [
            'liderança', 'leadership', 'comunicação', 'communication', 'teamwork', 'team', 
            'equipe', 'gestão', 'management', 'criatividade', 'creativity', 'inovação',
            'innovation', 'problem solving', 'analytical', 'analítico', 'proativo',
            'proactive', 'adaptabilidade', 'adaptability', 'colaboração', 'collaboration'
        ];
        
        let softSkillMatches = 0;
        let softSkillsRequired = 0;
        
        softSkills.forEach(skill => {
            if (jobLower.includes(skill)) {
                softSkillsRequired++;
                if (profileText.includes(skill)) {
                    softSkillMatches++;
                    analysis.matches.push(`🤝 ${skill.charAt(0).toUpperCase() + skill.slice(1)}`);
                }
            }
        });
        
        analysis.detailedAnalysis.softSkillsFit = softSkillsRequired > 0 ? 
            Math.round((softSkillMatches / softSkillsRequired) * 100) : 75;
        
        // 5. BONUS POR SKILLS EXTRAÍDAS
        if (profileData.skills && profileData.skills.length > 0) {
            analysis.strengths.push(`🎯 ${profileData.skills.length} skills identificadas no perfil`);
            // Bonus de 5 pontos se tem muitas skills
            if (profileData.skills.length >= 5) {
                analysis.detailedAnalysis.technicalFit = Math.min(analysis.detailedAnalysis.technicalFit + 10, 100);
            }
        }
        
        // 6. BONUS POR SEÇÃO SOBRE COMPLETA
        if (profileData.about && profileData.about.length > 200) {
            analysis.strengths.push(`📝 Perfil com descrição detalhada (${profileData.about.length} caracteres)`);
            analysis.detailedAnalysis.experienceFit = Math.min(analysis.detailedAnalysis.experienceFit + 5, 100);
        }
        
        // 7. CÁLCULO DO SCORE FINAL
        const weights = {
            technical: 0.4,
            experience: 0.3,
            location: 0.15,
            softSkills: 0.15
        };
        
        analysis.overallScore = Math.round(
            analysis.detailedAnalysis.technicalFit * weights.technical +
            analysis.detailedAnalysis.experienceFit * weights.experience +
            analysis.detailedAnalysis.locationFit * weights.location +
            analysis.detailedAnalysis.softSkillsFit * weights.softSkills
        );
        
        // 8. GERAR RECOMENDAÇÃO INTELIGENTE
        if (analysis.overallScore >= 85) {
            analysis.recommendation = '🎯 CANDIDATO EXCELENTE! Alta compatibilidade - recomendo entrevista imediata.';
        } else if (analysis.overallScore >= 70) {
            analysis.recommendation = '👍 CANDIDATO MUITO BOM! Boa compatibilidade - vale a pena considerar.';
        } else if (analysis.overallScore >= 55) {
            analysis.recommendation = '🤔 CANDIDATO REGULAR. Algumas lacunas, mas pode ter potencial.';
        } else if (analysis.overallScore >= 40) {
            analysis.recommendation = '⚠️ BAIXA COMPATIBILIDADE. Verificar se outras qualidades compensam.';
        } else {
            analysis.recommendation = '❌ INCOMPATÍVEL com os requisitos principais da vaga.';
        }
        
        // 9. INSIGHTS ESPECÍFICOS
        if (analysis.detailedAnalysis.technicalFit < 50) {
            analysis.concerns.push('🔧 Faltam skills técnicas importantes');
        }
        
        if (analysis.detailedAnalysis.technicalFit > 80) {
            analysis.strengths.push('💪 Forte compatibilidade técnica');
        }
        
        if (analysis.matches.length > 8) {
            analysis.strengths.push(`🎯 ${analysis.matches.length} compatibilidades encontradas`);
        }
        
        return {
            success: true,
            result: analysis
        };
        
    } catch (error) {
        console.error('❌ Erro na análise avançada:', error);
        return {
            success: false,
            error: 'Erro ao analisar compatibilidade: ' + error.message
        };
    }
}

function showAnalysisResult(analysis) {
    const resultDiv = document.getElementById('analysisResult');
    
    // Determinar cor do score
    let scoreColor = '#dc3545'; // Vermelho
    if (analysis.overallScore >= 70) scoreColor = '#28a745'; // Verde
    else if (analysis.overallScore >= 55) scoreColor = '#ffc107'; // Amarelo
    
    resultDiv.innerHTML = `
        <div class="analysis-header">
            <h3>📊 Análise de Compatibilidade</h3>
            <div class="score-circle" style="background: ${scoreColor}">
                <div class="score-number">${analysis.overallScore}%</div>
                <div class="score-label">Match</div>
            </div>
        </div>
        
        <div class="detailed-scores">
            <div class="score-item">
                <span>🔧 Técnico:</span>
                <div class="score-bar">
                    <div class="score-fill" style="width: ${analysis.detailedAnalysis.technicalFit}%"></div>
                    <span>${analysis.detailedAnalysis.technicalFit}%</span>
                </div>
            </div>
            <div class="score-item">
                <span>💼 Experiência:</span>
                <div class="score-bar">
                    <div class="score-fill" style="width: ${analysis.detailedAnalysis.experienceFit}%"></div>
                    <span>${analysis.detailedAnalysis.experienceFit}%</span>
                </div>
            </div>
            <div class="score-item">
                <span>📍 Localização:</span>
                <div class="score-bar">
                    <div class="score-fill" style="width: ${analysis.detailedAnalysis.locationFit}%"></div>
                    <span>${analysis.detailedAnalysis.locationFit}%</span>
                </div>
            </div>
            <div class="score-item">
                <span>🤝 Soft Skills:</span>
                <div class="score-bar">
                    <div class="score-fill" style="width: ${analysis.detailedAnalysis.softSkillsFit}%"></div>
                    <span>${analysis.detailedAnalysis.softSkillsFit}%</span>
                </div>
            </div>
        </div>
        
        <div class="analysis-content">
            <div class="recommendation">
                <h4>💡 Recomendação:</h4>
                <p>${analysis.recommendation}</p>
            </div>
            
            ${analysis.matches.length > 0 ? `
                <div class="matches-section">
                    <h4>✅ Compatibilidades (${analysis.matches.length}):</h4>
                    <div class="matches-list">
                        ${analysis.matches.slice(0, 10).map(match => `<span class="match-tag">${match}</span>`).join('')}
                        ${analysis.matches.length > 10 ? `<span class="more-tag">+${analysis.matches.length - 10} mais</span>` : ''}
                    </div>
                </div>
            ` : ''}
            
            ${analysis.strengths.length > 0 ? `
                <div class="strengths-section">
                    <h4>💪 Pontos Fortes:</h4>
                    <ul>
                        ${analysis.strengths.map(strength => `<li>${strength}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
            
            ${analysis.missingSkills.length > 0 ? `
                <div class="missing-section">
                    <h4>⚠️ Skills em Falta (${analysis.missingSkills.length}):</h4>
                    <div class="missing-list">
                        ${analysis.missingSkills.slice(0, 8).map(skill => `<span class="missing-tag">${skill}</span>`).join('')}
                        ${analysis.missingSkills.length > 8 ? `<span class="more-tag">+${analysis.missingSkills.length - 8} mais</span>` : ''}
                    </div>
                </div>
            ` : ''}
            
            ${analysis.concerns.length > 0 ? `
                <div class="concerns-section">
                    <h4>🤔 Pontos de Atenção:</h4>
                    <ul>
                        ${analysis.concerns.map(concern => `<li>${concern}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
        </div>
        
        <div class="analysis-actions">
            <button id="saveAnalysis" class="btn-primary">
                💾 Salvar Análise
            </button>
            <button id="newAnalysis" class="btn-secondary">
                🔄 Nova Análise
            </button>
        </div>
    `;
    
    resultDiv.style.display = 'block';
    
    // Event listeners
    document.getElementById('saveAnalysis').addEventListener('click', saveAnalysisResult);
    document.getElementById('newAnalysis').addEventListener('click', startNewAnalysis);
}

async function saveAnalysisResult() {
    const statusDiv = document.getElementById('actionStatus');
    const saveButton = document.getElementById('saveAnalysis');
    
    statusDiv.innerHTML = '💾 Salvando análise...';
    saveButton.disabled = true;
    
    try {
        const analysisData = {
            candidateName: profileData.data.name || 'Candidato',
            candidateTitle: profileData.data.title || '',
            candidateLocation: profileData.data.location || '',
            candidateAbout: profileData.data.about || '',
            candidateSkills: profileData.data.skills || [],
            profileUrl: profileData.data.profileUrl,
            jobDescription: currentJobDescription,
            overallScore: analysisResult.overallScore,
            detailedScores: analysisResult.detailedAnalysis,
            matches: analysisResult.matches,
            missingSkills: analysisResult.missingSkills,
            strengths: analysisResult.strengths,
            concerns: analysisResult.concerns,
            recommendation: analysisResult.recommendation,
            analyzedAt: new Date().toISOString(),
            source: 'LinkedIn - HireSight.ai Super Extrator'
        };
        
        const token = localStorage.getItem('hiresight_token');
        const response = await fetch(`${API_BASE}/candidates`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(analysisData)
        });
        
        if (response.ok) {
            statusDiv.innerHTML = '✅ Análise salva com sucesso!';
            setTimeout(() => {
                statusDiv.innerHTML = `
                    ✅ Análise de "${analysisData.candidateName}" salva!
                    <button id="viewDashboard" class="btn-success" style="margin-left: 10px;">
                        👁️ Ver no Dashboard
                    </button>
                `;
                document.getElementById('viewDashboard').addEventListener('click', openDashboard);
            }, 1000);
        } else {
            statusDiv.innerHTML = '❌ Erro ao salvar análise';
        }
        
    } catch (error) {
        console.error('❌ Erro ao salvar:', error);
        statusDiv.innerHTML = '❌ Erro de conexão ao salvar';
    } finally {
        saveButton.disabled = false;
    }
}

function startNewAnalysis() {
    document.getElementById('analysisResult').style.display = 'none';
    document.getElementById('manualInput').style.display = 'none';
    document.getElementById('extractionPreview').style.display = 'none';
    document.getElementById('analyzeSection').style.display = 'block';
    document.getElementById('actionStatus').innerHTML = '';
    document.getElementById('jobDescription').value = '';
    
    // Limpar campos manuais
    document.getElementById('manual_name').value = '';
    document.getElementById('manual_title').value = '';
    document.getElementById('manual_location').value = '';
    document.getElementById('manual_about').value = '';
    document.getElementById('manual_skills').value = '';
    
    profileData = null;
    analysisResult = null;
}

function openDashboard() {
    chrome.tabs.create({ url: 'http://localhost:5173/dashboard' });
}

function handleLogout() {
    localStorage.removeItem('hiresight_token');
    currentUser = null;
    isLoggedIn = false;
    showLoginForm();
}

