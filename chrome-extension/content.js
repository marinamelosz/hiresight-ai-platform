// HireSight.ai - Content Script Robusto para LinkedIn
// Versão avançada com múltiplas estratégias de extração

class LinkedInExtractorRobusto {
    constructor() {
        this.profileData = {}
        this.extractionStrategies = []
        this.currentStrategy = 0
        this.maxRetries = 3
        this.retryCount = 0
        
        this.initializeStrategies()
        this.setupMessageListener()
    }
    
    initializeStrategies() {
        // Estratégia 1: Layout novo do LinkedIn (2024)
        this.extractionStrategies.push({
            name: 'LinkedIn New Layout 2024',
            selectors: {
                name: [
                    'h1.text-heading-xlarge.inline.t-24.v-align-middle.break-words',
                    'h1[data-generated-suggestion-target]',
                    '.pv-text-details__left-panel h1',
                    '.ph5.pb5 h1'
                ],
                title: [
                    '.text-body-medium.break-words',
                    '.pv-text-details__left-panel .text-body-medium',
                    '.mt2.relative .text-body-medium',
                    '.pv-entity__summary-info h2'
                ],
                location: [
                    '.text-body-small.inline.t-black--light.break-words',
                    '.pv-text-details__left-panel .text-body-small',
                    '.pb2 .text-body-small',
                    '.pv-contact-info__contact-type'
                ],
                photo: [
                    '.pv-top-card-profile-picture__image--show img',
                    'img.pv-top-card-profile-picture__image',
                    '.profile-photo-edit__preview img',
                    '.presence-entity__image img'
                ],
                about: [
                    '#about ~ .pvs-list__outer-container .full-width .visually-hidden',
                    '.pv-about-section .pv-about__summary-text .visually-hidden',
                    '.summary .pv-entity__summary-info',
                    '.pv-about-section .inline-show-more-text'
                ],
                experience: [
                    '#experience ~ .pvs-list__outer-container .pvs-entity',
                    '.pv-profile-section.experience-section .pv-entity__summary-info',
                    '.experience .pv-entity__summary-info',
                    '.pv-experience-section .pv-entity'
                ],
                education: [
                    '#education ~ .pvs-list__outer-container .pvs-entity',
                    '.pv-profile-section.education-section .pv-entity__summary-info',
                    '.education .pv-entity__summary-info',
                    '.pv-education-section .pv-entity'
                ],
                skills: [
                    '#skills ~ .pvs-list__outer-container .mr1.t-bold span[aria-hidden="true"]',
                    '.pv-skill-categories-section .pv-skill-category-entity__name span',
                    '.skills-section .pv-skill-entity span',
                    '.pv-skills-section .pv-skill-entity__skill-name'
                ]
            }
        })
        
        // Estratégia 2: Layout clássico do LinkedIn
        this.extractionStrategies.push({
            name: 'LinkedIn Classic Layout',
            selectors: {
                name: [
                    '.pv-top-card--list .pv-top-card__content h1',
                    '.pv-top-card-section__name',
                    '.profile-topcard .profile-topcard__name',
                    '.pv-entity__summary-info h1'
                ],
                title: [
                    '.pv-top-card--list .pv-top-card__content h2',
                    '.pv-top-card-section__headline',
                    '.profile-topcard .profile-topcard__headline',
                    '.pv-entity__summary-info h2'
                ],
                location: [
                    '.pv-top-card--list .pv-top-card__content h3',
                    '.pv-top-card-section__location',
                    '.profile-topcard .profile-topcard__connections',
                    '.pv-contact-info__contact-type'
                ],
                photo: [
                    '.pv-top-card__photo img',
                    '.profile-topcard__image img',
                    '.pv-top-card-section__photo img',
                    '.presence-entity__image img'
                ],
                about: [
                    '.pv-about-section .pv-about__summary-text',
                    '.summary .pv-entity__summary-info',
                    '.pv-about-section .inline-show-more-text',
                    '.description .pv-entity__summary-info'
                ],
                experience: [
                    '.experience-section .pv-entity__summary-info',
                    '.pv-experience-section .pv-entity',
                    '.experience .pv-entity__summary-info',
                    '.pv-profile-section.experience .pv-entity'
                ],
                education: [
                    '.education-section .pv-entity__summary-info',
                    '.pv-education-section .pv-entity',
                    '.education .pv-entity__summary-info',
                    '.pv-profile-section.education .pv-entity'
                ],
                skills: [
                    '.pv-skill-categories-section .pv-skill-category-entity__name span',
                    '.skills-section .pv-skill-entity span',
                    '.pv-skills-section .pv-skill-entity__skill-name',
                    '.skill .pv-entity__summary-info'
                ]
            }
        })
        
        // Estratégia 3: Seletores genéricos (fallback)
        this.extractionStrategies.push({
            name: 'Generic Fallback',
            selectors: {
                name: [
                    'h1',
                    '[data-test="profile-name"]',
                    '.name',
                    '.profile-name'
                ],
                title: [
                    'h2',
                    '.headline',
                    '.title',
                    '.job-title'
                ],
                location: [
                    '.location',
                    '.geo',
                    '.address',
                    '[data-test="location"]'
                ],
                photo: [
                    '.profile-photo img',
                    '.avatar img',
                    '.photo img',
                    'img[alt*="profile"]'
                ],
                about: [
                    '.about',
                    '.summary',
                    '.description',
                    '.bio'
                ],
                experience: [
                    '.experience .item',
                    '.work .item',
                    '.job .item',
                    '.position'
                ],
                education: [
                    '.education .item',
                    '.school .item',
                    '.degree .item',
                    '.university'
                ],
                skills: [
                    '.skills .item',
                    '.skill',
                    '.competency',
                    '.expertise'
                ]
            }
        })
    }
    
    setupMessageListener() {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === 'extractProfile') {
                this.extractProfileData()
                    .then(data => sendResponse({ success: true, data }))
                    .catch(error => sendResponse({ success: false, error: error.message }))
                return true // Indica resposta assíncrona
            }
        })
    }
    
    async extractProfileData() {
        console.log('🎯 Iniciando extração robusta do LinkedIn...')
        
        // Aguardar carregamento da página
        await this.waitForPageLoad()
        
        // Tentar diferentes estratégias
        for (let i = 0; i < this.extractionStrategies.length; i++) {
            this.currentStrategy = i
            const strategy = this.extractionStrategies[i]
            
            console.log(`🔍 Tentando estratégia: ${strategy.name}`)
            
            try {
                const data = await this.extractWithStrategy(strategy)
                
                // Verificar se extraiu dados suficientes
                if (this.isValidExtraction(data)) {
                    console.log('✅ Extração bem-sucedida!', data)
                    return data
                } else {
                    console.log('⚠️ Dados insuficientes, tentando próxima estratégia...')
                }
            } catch (error) {
                console.log(`❌ Erro na estratégia ${strategy.name}:`, error)
            }
            
            // Delay entre tentativas
            await this.delay(1000)
        }
        
        // Se chegou aqui, nenhuma estratégia funcionou
        throw new Error('Não foi possível extrair dados do perfil')
    }
    
    async extractWithStrategy(strategy) {
        const data = {
            name: '',
            title: '',
            location: '',
            photo: '',
            about: '',
            experience: [],
            education: [],
            skills: [],
            profileUrl: window.location.href,
            extractedAt: new Date().toISOString(),
            strategy: strategy.name
        }
        
        // Extrair cada campo
        data.name = await this.extractField(strategy.selectors.name, 'text')
        data.title = await this.extractField(strategy.selectors.title, 'text')
        data.location = await this.extractField(strategy.selectors.location, 'text')
        data.photo = await this.extractField(strategy.selectors.photo, 'src')
        data.about = await this.extractField(strategy.selectors.about, 'text')
        
        // Extrair arrays
        data.experience = await this.extractExperience(strategy.selectors.experience)
        data.education = await this.extractEducation(strategy.selectors.education)
        data.skills = await this.extractSkills(strategy.selectors.skills)
        
        return data
    }
    
    async extractField(selectors, attribute = 'text') {
        for (const selector of selectors) {
            try {
                const element = document.querySelector(selector)
                if (element) {
                    let value = ''
                    
                    if (attribute === 'text') {
                        value = element.textContent?.trim() || ''
                    } else if (attribute === 'src') {
                        value = element.src || element.getAttribute('src') || ''
                    } else {
                        value = element.getAttribute(attribute) || ''
                    }
                    
                    if (value && value.length > 0) {
                        console.log(`✅ Encontrado ${attribute} com seletor: ${selector}`)
                        return value
                    }
                }
            } catch (error) {
                console.log(`❌ Erro com seletor ${selector}:`, error)
            }
            
            // Pequeno delay entre tentativas
            await this.delay(100)
        }
        
        return ''
    }
    
    async extractExperience(selectors) {
        const experiences = []
        
        for (const selector of selectors) {
            try {
                const elements = document.querySelectorAll(selector)
                
                if (elements.length > 0) {
                    console.log(`✅ Encontradas ${elements.length} experiências com: ${selector}`)
                    
                    for (let i = 0; i < Math.min(elements.length, 5); i++) {
                        const exp = elements[i]
                        
                        const experience = {
                            title: this.extractFromElement(exp, [
                                '.mr1.t-bold span[aria-hidden="true"]',
                                '.pv-entity__summary-info h3',
                                'h3',
                                '.title'
                            ]),
                            company: this.extractFromElement(exp, [
                                '.t-14.t-normal span[aria-hidden="true"]',
                                '.pv-entity__secondary-title',
                                '.company',
                                '.subtitle'
                            ]),
                            duration: this.extractFromElement(exp, [
                                '.t-14.t-normal.t-black--light span[aria-hidden="true"]',
                                '.pv-entity__bullet-item',
                                '.duration',
                                '.date-range'
                            ])
                        }
                        
                        if (experience.title || experience.company) {
                            experiences.push(experience)
                        }
                    }
                    
                    if (experiences.length > 0) break
                }
            } catch (error) {
                console.log(`❌ Erro ao extrair experiência:`, error)
            }
        }
        
        return experiences
    }
    
    async extractEducation(selectors) {
        const educations = []
        
        for (const selector of selectors) {
            try {
                const elements = document.querySelectorAll(selector)
                
                if (elements.length > 0) {
                    console.log(`✅ Encontradas ${elements.length} educações com: ${selector}`)
                    
                    for (let i = 0; i < Math.min(elements.length, 3); i++) {
                        const edu = elements[i]
                        
                        const education = {
                            school: this.extractFromElement(edu, [
                                '.mr1.t-bold span[aria-hidden="true"]',
                                '.pv-entity__school-name',
                                'h3',
                                '.school'
                            ]),
                            degree: this.extractFromElement(edu, [
                                '.t-14.t-normal span[aria-hidden="true"]',
                                '.pv-entity__degree-name',
                                '.degree',
                                '.field-of-study'
                            ])
                        }
                        
                        if (education.school || education.degree) {
                            educations.push(education)
                        }
                    }
                    
                    if (educations.length > 0) break
                }
            } catch (error) {
                console.log(`❌ Erro ao extrair educação:`, error)
            }
        }
        
        return educations
    }
    
    async extractSkills(selectors) {
        const skills = []
        
        for (const selector of selectors) {
            try {
                const elements = document.querySelectorAll(selector)
                
                if (elements.length > 0) {
                    console.log(`✅ Encontradas ${elements.length} habilidades com: ${selector}`)
                    
                    for (let i = 0; i < Math.min(elements.length, 15); i++) {
                        const skill = elements[i].textContent?.trim()
                        if (skill && skill.length > 0 && !skills.includes(skill)) {
                            skills.push(skill)
                        }
                    }
                    
                    if (skills.length > 0) break
                }
            } catch (error) {
                console.log(`❌ Erro ao extrair habilidades:`, error)
            }
        }
        
        return skills
    }
    
    extractFromElement(parentElement, selectors) {
        for (const selector of selectors) {
            try {
                const element = parentElement.querySelector(selector)
                if (element) {
                    const text = element.textContent?.trim()
                    if (text && text.length > 0) {
                        return text
                    }
                }
            } catch (error) {
                // Continuar tentando outros seletores
            }
        }
        return ''
    }
    
    isValidExtraction(data) {
        // Verificar se extraiu pelo menos nome OU título
        const hasBasicInfo = data.name || data.title
        
        // Verificar se extraiu pelo menos uma categoria adicional
        const hasAdditionalInfo = 
            data.location || 
            data.about || 
            data.experience.length > 0 || 
            data.education.length > 0 || 
            data.skills.length > 0
        
        return hasBasicInfo && hasAdditionalInfo
    }
    
    async waitForPageLoad() {
        return new Promise((resolve) => {
            if (document.readyState === 'complete') {
                resolve()
            } else {
                window.addEventListener('load', resolve)
                // Timeout de segurança
                setTimeout(resolve, 5000)
            }
        })
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms))
    }
}

// Inicializar extrator quando a página carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new LinkedInExtractorRobusto()
    })
} else {
    new LinkedInExtractorRobusto()
}

// Também inicializar em mudanças de URL (SPA)
let currentUrl = window.location.href
setInterval(() => {
    if (window.location.href !== currentUrl) {
        currentUrl = window.location.href
        console.log('🔄 URL mudou, reinicializando extrator...')
        setTimeout(() => {
            new LinkedInExtractorRobusto()
        }, 2000)
    }
}, 1000)

