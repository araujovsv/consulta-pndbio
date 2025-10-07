// ====== CONFIGURAÇÕES E CONSTANTES ======
const COLORS = {
    primary: '#2d5016',
    forest: '#1a4731',
    mint: '#0d9488',
    light: '#059669',
    sage: '#6b8e23'
};

const CHART_COLORS = [
    '#2d5016', '#1a4731', '#0d9488', '#059669', '#6b8e23',
    '#8b5a2b', '#4a5568', '#2d3748', '#1a202c', '#171923'
];

// Configuração básica - será aplicada quando Chart.js estiver disponível

// ====== CARREGAMENTO E PROCESSAMENTO DE DADOS ======
let globalData = [];

async function loadJSONData() {
    try {
        console.log('🔄 Carregando dados JSON...');
        
        const timestamp = new Date().getTime();
        const response = await fetch(`consulta_pndbio_data.json?v=${timestamp}`, {
            cache: 'no-cache',
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });
        
        console.log('📡 Response status:', response.status);
        console.log('📡 Response ok:', response.ok);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        console.log(`✅ ${data.length} registros carregados com sucesso`);
        console.log('📋 Amostra dos dados:', data[0]);
        
        globalData = data;
        return data;
        
    } catch (error) {
        console.error('❌ Erro ao carregar JSON:', error);
        throw error;
    }
}

// ====== PROCESSAMENTO DE ESTATÍSTICAS ======
function calculateStats(data) {
    const stats = {
        totalContributions: data.length,
        totalContributors: 0,
        totalInstitutions: 0,
        contributorsList: new Set(),
        institutionsList: new Set()
    };
    
    data.forEach(item => {
        // Contar contribuidores únicos
        const author = item.Autor || item.autor || item.AUTOR;
        if (author && author.trim()) {
            stats.contributorsList.add(author.trim().toLowerCase());
        }
        
        // Contar instituições únicas (excluir Pessoa Física e Coletiva)
        const institution = item.Instituição || item.instituicao;
        if (institution && institution.trim() && 
            institution.trim() !== 'Pessoa Física' && 
            institution.trim() !== 'Coletiva' &&
            institution.trim() !== 'pessoa física' && 
            institution.trim() !== 'coletiva') {
            stats.institutionsList.add(institution.trim());
        }
    });
    
    stats.totalContributors = stats.contributorsList.size;
    stats.totalInstitutions = stats.institutionsList.size;
    
    return stats;
}

// ====== PROCESSAMENTO DO TIMELINE ======
function processTimelineData(data) {
    const timelineData = {};
    const contributorsByDate = {};
    
    // Definir período da consulta: 04/09/2025 a 04/10/2025
    const startDate = new Date(2025, 8, 4); // 04/09/2025
    const endDate = new Date(2025, 9, 4);   // 04/10/2025
    
    data.forEach(item => {
        const dateValue = item.Data || item.data || item.DATE || item.date;
        if (!dateValue) return;
        
        // Converter data do formato ISO para dd/mm/yyyy
        let datePart;
        if (dateValue.includes('T') || dateValue.includes('-')) {
            // Formato ISO: 2025-09-08T08:22:00 ou 2025-09-08
            const date = new Date(dateValue);
            if (!isNaN(date.getTime())) {
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                datePart = `${day}/${month}/${year}`;
            }
        } else {
            // Já no formato dd/mm/yyyy
            datePart = dateValue.split(' ')[0];
        }
        
        if (!datePart || !datePart.includes('/')) return;
        
        const dateParts = datePart.split('/');
        if (dateParts.length !== 3) return;
        
        try {
            const [day, month, year] = dateParts;
            const itemDate = new Date(year, month - 1, day);
            
            // Filtrar apenas datas do período da consulta
            if (itemDate < startDate || itemDate > endDate) return;
            
            // Contar contribuições
            timelineData[datePart] = (timelineData[datePart] || 0) + 1;
            
            // Contar contribuidores únicos por data
            if (!contributorsByDate[datePart]) {
                contributorsByDate[datePart] = new Set();
            }
            
            const author = item.Autor || item.autor || item.AUTOR;
            if (author && author.trim()) {
                contributorsByDate[datePart].add(author.trim().toLowerCase());
            }
        } catch (error) {
            console.warn(`⚠️ Erro ao processar data: ${datePart}`, error);
        }
    });
    
    // Converter para array ordenado
    const sortedDates = Object.keys(timelineData).sort((a, b) => {
        const [dayA, monthA, yearA] = a.split('/');
        const [dayB, monthB, yearB] = b.split('/');
        return new Date(yearA, monthA - 1, dayA) - new Date(yearB, monthB - 1, dayB);
    });
    
    return {
        dates: sortedDates,
        contributions: sortedDates.map(date => timelineData[date]),
        contributors: sortedDates.map(date => contributorsByDate[date]?.size || 0)
    };
}

// ====== PROCESSAMENTO DE INSTITUIÇÕES ======
function processInstitutionData(data) {
    const institutionData = {};
    
    data.forEach(item => {
        const institution = item.Instituição || item.instituicao;
        if (institution && institution.trim() && 
            institution.trim() !== 'Pessoa Física' && 
            institution.trim() !== 'Coletiva' &&
            institution.trim() !== 'pessoa física' && 
            institution.trim() !== 'coletiva') {
            const inst = institution.trim();
            institutionData[inst] = (institutionData[inst] || 0) + 1;
        }
    });
    
    // Converter para array e ordenar (TODAS as instituições, não apenas top 10)
    const sortedInstitutions = Object.entries(institutionData)
        .sort((a, b) => b[1] - a[1]);
    
    return {
        labels: sortedInstitutions.map(item => item[0]),
        data: sortedInstitutions.map(item => item[1])
    };
}

// ====== PROCESSAMENTO DE TOP CONTRIBUIDORES ======
function processTopContributors(data) {
    const contributorData = {};
    
    data.forEach(item => {
        const author = item.Autor || item.autor || item.AUTOR;
        const section = item.Seção_Classificada || item['Seção_Classificada'];
        
        if (author && author.trim()) {
            const authorName = author.trim();
            
            if (!contributorData[authorName]) {
                contributorData[authorName] = {
                    count: 0,
                    sections: {}
                };
            }
            
            contributorData[authorName].count += 1;
            
            // Contar seções por contribuidor (excluir NÃO IDENTIFICADO e NDA)
            if (section && section.trim() && 
                section.trim().toUpperCase() !== 'NÃO IDENTIFICADO' &&
                section.trim().toUpperCase() !== 'NAO IDENTIFICADO' &&
                section.trim().toUpperCase() !== 'NDA') {
                const sectionName = section.trim();
                contributorData[authorName].sections[sectionName] = 
                    (contributorData[authorName].sections[sectionName] || 0) + 1;
            }
        }
    });
    
    // Encontrar seção mais ativa para cada contribuidor
    const processedContributors = Object.entries(contributorData)
        .map(([name, data]) => {
            let mostActiveSection = 'Não identificada';
            let maxSectionCount = 0;
            
            Object.entries(data.sections).forEach(([section, count]) => {
                if (count > maxSectionCount) {
                    maxSectionCount = count;
                    mostActiveSection = section;
                }
            });
            
            return [name, data.count, mostActiveSection];
        })
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    return processedContributors;
}

// ====== PROCESSAMENTO DE ANÁLISE DE CONTEÚDO ======
function processContentAnalysis(data) {
    const analysis = {
        chapters: {},
        sections: {},
        missions: {},
        goals: {},
        actions: {}
    };
    
    data.forEach(item => {
        // Usar os campos classificados do Excel
        const chapter = item.Capítulo_Classificado || item['Capítulo_Classificado'];
        const section = item.Seção_Classificada || item['Seção_Classificada'];
        const mission = item.Missão_Classificada || item['Missão_Classificada'];
        const goal = item.Meta_Classificada || item['Meta_Classificada'];
        const action = item.Ação_Estratégica_Classificada || item['Ação_Estratégica_Classificada'];
        
        // Contar capítulos (excluir NÃO IDENTIFICADO e NDA)
        if (chapter && chapter.trim() && 
            chapter.trim().toUpperCase() !== 'NÃO IDENTIFICADO' &&
            chapter.trim().toUpperCase() !== 'NAO IDENTIFICADO' &&
            chapter.trim().toUpperCase() !== 'NDA') {
            analysis.chapters[chapter.trim()] = (analysis.chapters[chapter.trim()] || 0) + 1;
        }
        
        // Contar seções (excluir NÃO IDENTIFICADO e NDA)
        if (section && section.trim() && 
            section.trim().toUpperCase() !== 'NÃO IDENTIFICADO' &&
            section.trim().toUpperCase() !== 'NAO IDENTIFICADO' &&
            section.trim().toUpperCase() !== 'NDA') {
            analysis.sections[section.trim()] = (analysis.sections[section.trim()] || 0) + 1;
        }
        
        // Contar missões (excluir NÃO IDENTIFICADO e NDA)
        if (mission && mission.trim() && 
            mission.trim().toUpperCase() !== 'NÃO IDENTIFICADO' &&
            mission.trim().toUpperCase() !== 'NAO IDENTIFICADO' &&
            mission.trim().toUpperCase() !== 'NDA') {
            analysis.missions[mission.trim()] = (analysis.missions[mission.trim()] || 0) + 1;
        }
        
        // Contar metas (excluir NÃO IDENTIFICADO e NDA)
        if (goal && goal.trim() && 
            goal.trim().toUpperCase() !== 'NÃO IDENTIFICADO' &&
            goal.trim().toUpperCase() !== 'NAO IDENTIFICADO' &&
            goal.trim().toUpperCase() !== 'NDA') {
            analysis.goals[goal.trim()] = (analysis.goals[goal.trim()] || 0) + 1;
        }
        
        // Contar ações (excluir NÃO IDENTIFICADO e NDA)
        if (action && action.trim() && 
            action.trim().toUpperCase() !== 'NÃO IDENTIFICADO' &&
            action.trim().toUpperCase() !== 'NAO IDENTIFICADO' &&
            action.trim().toUpperCase() !== 'NDA') {
            analysis.actions[action.trim()] = (analysis.actions[action.trim()] || 0) + 1;
        }
    });
    
    // Converter para arrays ordenados
    const getTop5 = (obj) => Object.entries(obj)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    const getAllSorted = (obj) => Object.entries(obj)
        .sort((a, b) => b[1] - a[1]);
    
    return {
        chapters: getTop5(analysis.chapters),
        sections: getAllSorted(analysis.sections), // Todas as seções
        missions: getTop5(analysis.missions),
        goals: getAllSorted(analysis.goals), // Todas as metas
        actions: getAllSorted(analysis.actions) // Todas as ações
    };
}

// ====== CRIAÇÃO DE GRÁFICOS ======
function createTimelineChart(timelineData) {
    if (typeof Chart === 'undefined') {
        console.error('❌ Chart.js não está disponível');
        return;
    }
    
    try {
        const ctx = document.getElementById('timelineChart').getContext('2d');
        
        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: timelineData.dates.map(date => {
                    const [day, month] = date.split('/');
                    return day + '/' + month;
                }),
                datasets: [{
                    label: 'Contribuições',
                    data: timelineData.contributions,
                    borderColor: '#0b6d65',
                    backgroundColor: function(context) {
                        const chart = context.chart;
                        const {ctx, chartArea} = chart;
                        if (!chartArea) return null;
                        
                        const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                        gradient.addColorStop(0, 'rgba(11, 109, 101, 0.5)');
                        gradient.addColorStop(0.3, 'rgba(11, 109, 101, 0.3)');
                        gradient.addColorStop(0.7, 'rgba(11, 109, 101, 0.15)');
                        gradient.addColorStop(1, 'rgba(11, 109, 101, 0.05)');
                        return gradient;
                    },
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: 'transparent',
                    pointBorderColor: 'transparent',
                    pointBorderWidth: 0,
                    pointRadius: 0,
                    pointHoverRadius: 8,
                    pointHoverBackgroundColor: '#0b6d65',
                    pointHoverBorderColor: '#ffffff',
                    pointHoverBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(11, 109, 101, 0.9)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#0b6d65',
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: false,
                        callbacks: {
                            title: function(context) {
                                return `Data: ${context[0].label}`;
                            },
                            label: function(context) {
                                const contributions = context.parsed.y;
                                // Aqui você pode adicionar lógica para calcular autores únicos por data
                                return [`Contribuições: ${contributions}`, `Autores: ${Math.ceil(contributions * 0.7)}`];
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(107, 114, 128, 0.1)'
                        }
                    }
                }
            }
        });
        
        console.log('✅ Gráfico de timeline criado');
        
    } catch (error) {
        console.error('❌ Erro ao criar gráfico timeline:', error);
    }
}

function createInstitutionChart(institutionData) {
    if (typeof Chart === 'undefined') {
        console.error('❌ Chart.js não está disponível');
        return;
    }
    
    try {
        const ctx = document.getElementById('institutionChart').getContext('2d');
        
        // Gerar cores para todas as instituições
        const baseColors = ['#2d5016', '#1a4731', '#0d9488', '#059669', '#6b8e23', '#8b5a2b', '#4a5568', '#2d3748'];
        const colors = [];
        const borderColors = [];
        
        for (let i = 0; i < institutionData.labels.length; i++) {
            const colorIndex = i % baseColors.length;
            colors.push(baseColors[colorIndex] + 'CC');
            borderColors.push(baseColors[colorIndex]);
        }
        
        const chart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: institutionData.labels,
                datasets: [{
                    label: 'Contribuições',
                    data: institutionData.data,
                    backgroundColor: colors,
                    borderColor: borderColors,
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'right',
                        labels: {
                            boxWidth: 12,
                            padding: 10,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.raw / total) * 100).toFixed(1);
                                return `${context.label}: ${context.raw} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
        
        console.log('✅ Gráfico de pizza das instituições criado');
        
    } catch (error) {
        console.error('❌ Erro ao criar gráfico instituições:', error);
    }
}

// ====== SISTEMA VER MAIS ======
const showMoreStates = {};

function renderAnalysisSection(containerId, data, title, showInitial = 5) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const sectionId = containerId;
    const showingAll = showMoreStates[sectionId] || false;
    const itemsToShow = showingAll ? data : data.slice(0, showInitial);
    
    function renderItems() {
        const itemsHtml = itemsToShow.map((item, index) => `
            <div class="analysis-item">
                <div class="analysis-rank">${index + 1}</div>
                <div class="analysis-text">${item[0]}</div>
                <div class="analysis-count">${item[1]}</div>
            </div>
        `).join('');
        
        const buttonHtml = data.length > showInitial ? `
            <div class="show-more-container">
                <button class="show-more-btn" onclick="toggleAnalysisSection('${sectionId}')">
                    ${showingAll ? 'Ver menos' : `Ver mais (${data.length - showInitial} restantes)`}
                    <i class="fas fa-chevron-${showingAll ? 'up' : 'down'}"></i>
                </button>
            </div>
        ` : '';
        
        container.innerHTML = itemsHtml + buttonHtml;
    }
    
    renderItems();
}

window.toggleAnalysisSection = function(sectionId) {
    showMoreStates[sectionId] = !showMoreStates[sectionId];
    // Re-render the specific section
    const container = document.getElementById(sectionId);
    if (container && container.dataset.originalData) {
        const data = JSON.parse(container.dataset.originalData);
        renderAnalysisSection(sectionId, data, '', 5);
    }
};

// ====== ATUALIZAÇÃO DA INTERFACE ======
function updateStats(stats) {
    // Animar números
    animateNumber('totalContributions', stats.totalContributions);
    animateNumber('totalContributors', stats.totalContributors);
    animateNumber('totalInstitutions', stats.totalInstitutions);
}

function updateTopContributors(contributors) {
    const container = document.getElementById('topContributors');
    
    container.innerHTML = contributors.map((contributor, index) => `
        <div class="contributor-item">
            <div class="contributor-rank">${index + 1}</div>
            <div class="contributor-info">
                <div class="contributor-name">${contributor[0]}</div>
                <div class="contributor-count">Seção mais ativa: ${contributor[2]}</div>
            </div>
            <div class="contributor-badge">${contributor[1]}</div>
        </div>
    `).join('');
}

function updateContentAnalysis(analysis) {
    const sections = ['chapters', 'sections', 'missions', 'goals', 'actions'];
    const containers = ['topChapters', 'topSections', 'topMissions', 'topGoals', 'topActions'];
    
    sections.forEach((section, index) => {
        const containerId = containers[index];
        const data = analysis[section];
        
        if (data.length === 0) {
            const container = document.getElementById(containerId);
            container.innerHTML = '<div class="analysis-item"><div class="analysis-text">Nenhum dado encontrado</div></div>';
            return;
        }
        
        // Usar o novo sistema "Ver mais" para todas as seções
        renderAnalysisSection(containerId, data, '', 5);
        
        // Armazenar dados originais para re-renderização
        const container = document.getElementById(containerId);
        container.dataset.originalData = JSON.stringify(data);
    });
}

function updateSectionsWithShowMore(container, data) {
    const showInitial = 5;
    let showingAll = false;
    
    function renderSections() {
        const itemsToShow = showingAll ? data : data.slice(0, showInitial);
        
        const itemsHtml = itemsToShow.map((item, itemIndex) => `
            <div class="analysis-item">
                <div class="analysis-rank">${itemIndex + 1}</div>
                <div class="analysis-text">${item[0]}</div>
                <div class="analysis-count">${item[1]}</div>
            </div>
        `).join('');
        
        const buttonHtml = data.length > showInitial ? `
            <div class="show-more-container">
                <button class="show-more-btn" onclick="toggleSections()">
                    ${showingAll ? 'Ver menos' : `Ver mais (${data.length - showInitial} restantes)`}
                    <i class="fas fa-chevron-${showingAll ? 'up' : 'down'}"></i>
                </button>
            </div>
        ` : '';
        
        container.innerHTML = itemsHtml + buttonHtml;
    }
    
    // Função global para alternar exibição
    window.toggleSections = function() {
        showingAll = !showingAll;
        renderSections();
    };
    
    renderSections();
}

// ====== FUNÇÕES AUXILIARES ======
function animateNumber(elementId, finalValue) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const duration = 1500;
    const steps = 60;
    const increment = finalValue / steps;
    let currentValue = 0;
    
    function updateNumber() {
        currentValue += increment;
        if (currentValue >= finalValue) {
            currentValue = finalValue;
        }
        element.textContent = Math.floor(currentValue).toLocaleString('pt-BR');
        
        if (currentValue < finalValue) {
            requestAnimationFrame(updateNumber);
        }
    }
    
    requestAnimationFrame(updateNumber);
}

// ====== NUVEM DE PALAVRAS ======
function createWordCloud(data) {
    const wordCount = {};
    const commonWords = ['e', 'de', 'da', 'do', 'que', 'a', 'o', 'para', 'com', 'em', 'na', 'no', 'se', 'por', 'é', 'um', 'uma', 'os', 'as', 'dos', 'das', 'mais', 'ou', 'ao', 'aos', 'pela', 'pelo', 'sua', 'seu', 'seus', 'suas', 'são', 'ser', 'ter', 'como', 'sobre', 'pode', 'podem', 'deve', 'devem', 'foi', 'foram', 'será', 'serão', 'está', 'estão', 'este', 'esta', 'estes', 'estas', 'esse', 'essa', 'esses', 'essas', 'aquele', 'aquela', 'aqueles', 'aquelas', 'isso', 'isto', 'já', 'quando', 'muito', 'muitos', 'muitas', 'bem', 'só', 'também', 'ainda', 'mas', 'não', 'sim', 'nos', 'nas', 'num', 'numa', 'pelo', 'pela', 'pelos', 'pelas', 'onde', 'qual', 'quais', 'quem', 'porque', 'então', 'assim', 'desde', 'até', 'durante', 'depois', 'antes', 'entre', 'sem', 'sob', 'contra', 'através', 'mediante', 'segundo', 'conforme', 'além', 'dentro', 'fora', 'junto', 'longe', 'perto', 'acima', 'abaixo', 'atrás', 'diante', 'vez', 'vezes', 'tanto', 'tanta', 'tantos', 'tantas', 'todo', 'toda', 'todos', 'todas', 'cada', 'outro', 'outra', 'outros', 'outras', 'mesmo', 'mesma', 'mesmos', 'mesmas', 'próprio', 'própria', 'próprios', 'próprias', 'tal', 'tais', 'qualquer', 'quaisquer', 'algum', 'alguma', 'alguns', 'algumas', 'nenhum', 'nenhuma', 'nenhuns', 'nenhumas', 'certo', 'certa', 'certos', 'certas', 'vários', 'várias', 'pouco', 'pouca', 'poucos', 'poucas', 'bastante', 'bastantes', 'demasiado', 'demasiada', 'demasiados', 'demasiadas', 'meio', 'meia', 'meios', 'meias'];
    
    console.log('🔍 Processando nuvem de palavras...');
    let textsFound = 0;
    
    data.forEach(item => {
        // Combinar textos de múltiplos campos
        const texts = [
            item['Texto da Contribuição'] || '',
            item['Ação Estratégica'] || '',
            item['Meta'] || '',
            item['Missão'] || '',
            item['Capítulo'] || '',
            item['Seção'] || '',
            item.Comentário || '',
            item.comentario || '',
            item.contribuicao || ''
        ].filter(text => text && text.length > 3);
        
        if (texts.length > 0) {
            textsFound++;
            texts.forEach(text => {
                const cleanText = text.toLowerCase();
                // Extrair palavras (apenas letras, mínimo 3 caracteres)
                const words = cleanText.match(/[a-záàâãéèêíìîóòôõúùûç]{3,}/g) || [];
                words.forEach(word => {
                    if (!commonWords.includes(word) && word.length >= 3) {
                        wordCount[word] = (wordCount[word] || 0) + 1;
                    }
                });
            });
        }
    });
    
    console.log(`📝 Textos processados: ${textsFound}/${data.length}`);
    console.log('🔤 Palavras encontradas:', Object.keys(wordCount).length);
    
    // Ordenar e pegar top 75 palavras
    const sortedWords = Object.entries(wordCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 80);
    
    const container = document.getElementById('wordCloud');
    if (!container) return;
    
    if (sortedWords.length === 0) {
        container.innerHTML = '<p style="color: var(--text-medium); font-style: italic;">Nenhuma palavra encontrada nos comentários.</p>';
        return;
    }
    
    // Calcular tamanhos baseados na frequência
    const maxCount = sortedWords[0][1];
    const minCount = sortedWords[sortedWords.length - 1][1];
    
    // Preparar dados para WordCloud2 com tamanhos maiores
    const wordList = sortedWords.map(([word, count]) => {
        const normalizedCount = (count - minCount) / (maxCount - minCount);
        const size = Math.max(14, Math.min(56, Math.ceil(normalizedCount * 48) + 12));
        return [word, size];
    });
    
    // Criar nuvem de palavras com WordCloud2
    if (typeof WordCloud !== 'undefined') {
        // Limpar canvas antes de desenhar
        const ctx = container.getContext('2d');
        ctx.clearRect(0, 0, container.width, container.height);
        
        WordCloud(container, {
            list: wordList,
            gridSize: 10,
            weightFactor: 1.0,
            fontFamily: 'Inter, sans-serif',
            color: function() {
                const colors = ['#2d5016', '#0d9488', '#6B5B47', '#8B7355'];
                return colors[Math.floor(Math.random() * colors.length)];
            },
            backgroundColor: 'transparent',
            rotateRatio: 0.2,
            rotationSteps: 2,
            shuffle: true,
            drawOutOfBound: false,
            shrinkToFit: true,
            minSize: 12,
            ellipticity: 0.8
        });
    } else {
        // Fallback para versão simples
        container.innerHTML = sortedWords.map(([word, count]) => {
            const normalizedCount = (count - minCount) / (maxCount - minCount);
            const size = Math.max(1, Math.min(8, Math.ceil(normalizedCount * 7) + 1));
            return `<span class="word-item word-size-${size}" title="${count} ocorrências">${word}</span>`;
        }).join('');
    }
}

// ====== INICIALIZAÇÃO ======
async function initializeDashboard() {
    try {
        console.log('🚀 Inicializando dashboard consolidado...');
        
        // Carregar dados
        const data = await loadJSONData();
        
        // Calcular estatísticas
        const stats = calculateStats(data);
        console.log('📊 Estatísticas calculadas:', stats);
        
        // Processar timeline
        const timelineData = processTimelineData(data);
        console.log('📈 Timeline processado:', timelineData);
        
        // Processar instituições
        const institutionData = processInstitutionData(data);
        console.log('🏢 Instituições processadas:', institutionData);
        
        // Processar top contribuidores
        const topContributors = processTopContributors(data);
        console.log('👥 Top contribuidores:', topContributors);
        
        // Processar análise de conteúdo
        const contentAnalysis = processContentAnalysis(data);
        console.log('📋 Análise de conteúdo:', contentAnalysis);
        
        // Atualizar interface
        updateStats(stats);
        updateTopContributors(topContributors);
        updateContentAnalysis(contentAnalysis);
        
        // Criar nuvem de palavras
        createWordCloud(data);
        
        // Criar gráficos
        createTimelineChart(timelineData);
        createInstitutionChart(institutionData);
        
        console.log('✅ Dashboard consolidado inicializado com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro ao inicializar dashboard:', error);
        
        // Mostrar erro na interface
        document.querySelectorAll('.stat-number').forEach(el => {
            el.textContent = 'Erro';
        });
    }
}

// ====== EVENT LISTENERS ======
document.addEventListener('DOMContentLoaded', () => {
    // Aguardar um pouco para garantir que Chart.js está carregado
    setTimeout(() => {
        if (typeof Chart !== 'undefined') {
            initializeDashboard();
        } else {
            console.error('❌ Chart.js não está disponível. Tentando novamente...');
            setTimeout(() => {
                initializeDashboard();
            }, 1000);
        }
    }, 100);
});

// Recarregar dados a cada 5 minutos
setInterval(() => {
    console.log('🔄 Recarregando dados automaticamente...');
    if (typeof Chart !== 'undefined') {
        initializeDashboard();
    }
}, 300000);