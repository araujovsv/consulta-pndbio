// Sistema dinâmico de carregamento de dados do CSV

// Paleta de cores natural e moderna
const naturalColors = {
    primary: ['#2d5016', '#1a4731', '#0d9488', '#059669', '#166534'],
    secondary: ['#4ade80', '#22c55e', '#16a34a', '#15803d', '#14532d'],
    teal: ['#0d9488', '#0f766e', '#134e4a', '#115e59', '#042f2e'],
    gradients: {
        green: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)',
        forest: 'linear-gradient(135deg, #1a4731 0%, #166534 100%)',
        teal: 'linear-gradient(135deg, #0d9488 0%, #0f3460 100%)'
    }
};

// Configuração padrão do Chart.js
Chart.defaults.font.family = 'Inter, sans-serif';
Chart.defaults.font.size = 12;
Chart.defaults.color = '#6b7280';

// Função para carregar e processar CSV dinamicamente
async function loadCSVData() {
    try {
        const response = await fetch('database_dashboard.csv');
        const csvText = await response.text();
        
        // Processar CSV
        const lines = csvText.trim().split('\n');
        const headers = lines[0].split(';').map(header => header.trim());
        
        const data = [];
        
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(';').map(value => value.trim());
            const entry = {};
            
            headers.forEach((header, index) => {
                entry[header] = values[index] || '';
            });
            
            data.push(entry);
        }
        
        console.log(`✅ Carregados ${data.length} registros do CSV`);
        console.log('📊 Campos detectados:', headers);
        
        return data;
    } catch (error) {
        console.error('❌ Erro ao carregar CSV:', error);
        return [];
    }
}

// Função para obter dados da semana (começando na terça-feira)
function getWeeklyData(data) {
    if (!data || data.length === 0) {
        console.warn('⚠️ Nenhum dado fornecido para filtro semanal');
        return [];
    }
    
    // Data de referência: terça-feira, 9 de setembro de 2025
    const referenceDate = new Date(2025, 8, 9); // Mês 8 = setembro (0-indexed)
    
    // Encontrar a terça-feira mais recente
    const today = new Date();
    const currentDay = today.getDay(); // 0 = domingo, 1 = segunda, 2 = terça, etc.
    
    let daysToSubtract;
    if (currentDay >= 2) { // Se hoje é terça ou depois
        daysToSubtract = currentDay - 2; // Dias desde a terça
    } else { // Se hoje é domingo ou segunda
        daysToSubtract = currentDay + 5; // Dias desde a terça passada
    }
    
    const currentTuesday = new Date(today);
    currentTuesday.setDate(today.getDate() - daysToSubtract);
    currentTuesday.setHours(0, 0, 0, 0);
    
    console.log(`📅 Terça-feira atual: ${currentTuesday.toLocaleDateString('pt-BR')}`);
    
    return data.filter(item => {
        // Detectar campo de data dinamicamente
        const dateField = item.data || item.Data || item.DATE || item.date || Object.values(item)[0];
        
        if (!dateField) return false;
        
        try {
            const [datePart] = dateField.split(' ');
            const [day, month, year] = datePart.split('/');
            const itemDate = new Date(year, month - 1, day);
            
            return itemDate >= currentTuesday;
        } catch (error) {
            console.warn(`⚠️ Erro ao processar data: ${dateField}`);
            return false;
        }
    });
}

// Função para animar números
function animateNumber(elementId, finalValue) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const duration = 1500;
    const steps = 60;
    const increment = finalValue / steps;
    let current = 0;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= finalValue) {
            element.textContent = finalValue;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, duration / steps);
}

// Criar gráfico donut dinâmico
function createDynamicDonutChart(canvasId, data, title) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    if (!data || Object.keys(data).length === 0) {
        // Se não há dados, mostrar mensagem
        ctx.fillStyle = '#6b7280';
        ctx.font = '14px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('Sem dados disponíveis', ctx.canvas.width / 2, ctx.canvas.height / 2);
        return null;
    }
    
    // Limitar labels longos
    const labels = Object.keys(data).map(label => {
        if (label.length > 25) {
            return label.substring(0, 22) + '...';
        }
        return label;
    });
    
    const values = Object.values(data);
    const total = values.reduce((a, b) => a + b, 0);
    
    // Plugin único para texto central dinâmico
    const centerTextPlugin = {
        id: 'centerText',
        beforeDraw: function(chart) {
            const ctx = chart.ctx;
            const centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
            const centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;
            
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Pegar os valores dinâmicos ou usar padrão
            const displayValue = chart.hoverValue || total;
            const displayLabel = chart.hoverLabel || 'Total';
            
            ctx.fillStyle = '#2d5016';
            ctx.font = 'bold 24px Inter';
            ctx.fillText(displayValue, centerX, centerY - 8);
            
            ctx.fillStyle = '#6b7280';
            ctx.font = '14px Inter';
            ctx.fillText(displayLabel, centerX, centerY + 15);
            ctx.restore();
        }
    };
    
    const chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: naturalColors.primary,
                borderColor: '#ffffff',
                borderWidth: 3,
                hoverBorderWidth: 4,
                hoverOffset: 6,
                hoverBackgroundColor: naturalColors.secondary
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: true,
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: '#2d5016',
                    borderWidth: 2,
                    cornerRadius: 8,
                    displayColors: false,
                    padding: 12,
                    titleFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 13
                    },
                    animation: {
                        duration: 200
                    },
                    callbacks: {
                        title: function(context) {
                            const originalLabels = Object.keys(data);
                            return originalLabels[context[0].dataIndex];
                        },
                        label: function(context) {
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return `${context.parsed} contribuições (${percentage}%)`;
                        }
                    }
                }
            },
            cutout: '65%',
            animation: {
                animateRotate: true,
                animateScale: true,
                duration: 1200,
                easing: 'easeInOutQuart'
            },
            interaction: {
                intersect: false,
                mode: 'point'
            },
            onHover: (event, activeElements, chart) => {
                if (activeElements.length > 0) {
                    const dataIndex = activeElements[0].index;
                    const value = values[dataIndex];
                    const percentage = ((value / total) * 100).toFixed(1);
                    
                    // Definir valores para hover
                    chart.hoverValue = value;
                    chart.hoverLabel = `${percentage}%`;
                } else {
                    // Limpar valores de hover
                    chart.hoverValue = null;
                    chart.hoverLabel = null;
                }
                chart.update('none');
            }
        },
        plugins: [centerTextPlugin]
    });
    
    return chart;
}

// Criar gráfico de linha dinâmico
function createDynamicLineChart(canvasId, data, title) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    if (!data || data.length === 0) {
        // Se não há dados, mostrar mensagem
        ctx.fillStyle = '#6b7280';
        ctx.font = '14px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('Sem dados disponíveis', ctx.canvas.width / 2, ctx.canvas.height / 2);
        return null;
    }
    
    // Detectar campo de data dinamicamente
    const dateField = data.length > 0 ? 
        (data[0].data || data[0].Data || data[0].DATE || data[0].date || Object.keys(data[0])[0]) : null;
    
    if (!dateField) {
        ctx.fillStyle = '#6b7280';
        ctx.font = '14px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('Campo de data não encontrado', ctx.canvas.width / 2, ctx.canvas.height / 2);
        return null;
    }
    
    // Processar dados para timeline
    const timelineData = {};
    data.forEach(item => {
        const dateValue = item[dateField] || item[Object.keys(item)[0]];
        if (!dateValue) return;
        
        const [datePart] = dateValue.split(' ');
        timelineData[datePart] = (timelineData[datePart] || 0) + 1;
    });
    
    const sortedDates = Object.keys(timelineData).sort((a, b) => {
        const [dayA, monthA, yearA] = a.split('/');
        const [dayB, monthB, yearB] = b.split('/');
        return new Date(yearA, monthA - 1, dayA) - new Date(yearB, monthB - 1, dayB);
    });
    
    const values = sortedDates.map(date => timelineData[date]);
    const labels = sortedDates.map(date => {
        const [day, month] = date.split('/');
        return `${day}/${month}`;
    });
    
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Contribuições',
                data: values,
                borderColor: '#059669',
                backgroundColor: 'rgba(5, 150, 105, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#ffffff',
                pointBorderColor: '#059669',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7,
                pointHoverBackgroundColor: '#059669',
                pointHoverBorderColor: '#ffffff',
                pointHoverBorderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: '#2d5016',
                    borderWidth: 1,
                    cornerRadius: 8,
                    displayColors: false,
                    callbacks: {
                        title: function(context) {
                            const originalDate = sortedDates[context[0].dataIndex];
                            return `Data: ${originalDate}`;
                        },
                        label: function(context) {
                            const value = context.parsed.y;
                            return `${value} ${value === 1 ? 'contribuição' : 'contribuições'}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#6b7280',
                        font: {
                            size: 11
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(107, 114, 128, 0.1)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#6b7280',
                        font: {
                            size: 11
                        },
                        stepSize: 1
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeInOutQuart'
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
    
    return chart;
}

// Adicionar canvas aos containers de gráficos
function addCanvasToCharts() {
    const chartContainers = [
        'sectionsChart', 'changesChart', 'timelineChart',
        'weeklySectionsChart', 'weeklyChangesChart', 'weeklyTimelineChart'
    ];
    
    chartContainers.forEach(containerId => {
        const container = document.getElementById(containerId);
        if (container && !container.querySelector('canvas')) {
            const canvas = document.createElement('canvas');
            canvas.id = containerId + 'Canvas';
            canvas.style.maxHeight = '300px';
            container.appendChild(canvas);
        }
    });
}

// Inicializar dashboard com dados dinâmicos
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Inicializando dashboard dinâmico...');
    
    // Adicionar canvas aos containers primeiro
    addCanvasToCharts();
    
    console.log('📊 Canvas adicionados, aguardando carregamento...');
    
    try {
        // Carregar dados do CSV
        const csvData = await loadCSVData();
        
        if (!csvData || csvData.length === 0) {
            console.warn('⚠️ Nenhum dado encontrado no CSV');
            return;
        }
        
        console.log(`✅ ${csvData.length} registros carregados do CSV`);
        
        // Debug: mostrar primeiros registros
        console.log('🔍 Primeiros 3 registros:', csvData.slice(0, 3));
        console.log('🔍 Campos detectados:', Object.keys(csvData[0] || {}));
        
        // Calcular estatísticas dinâmicas
        const stats = calculateStats(csvData);
        console.log('📊 Estatísticas calculadas:', stats);
        
        // PRIMEIRO: Atualizar cards de estatísticas
        console.log('🎯 Atualizando cards...');
        updateStatsCards(csvData);
        
        // SEGUNDO: Aguardar um pouco para os cards serem atualizados
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // TERCEIRO: Processar dados para gráficos dinâmicos
        console.log('📈 Processando dados para gráficos...');
        const authorData = processAuthorData(csvData);
        const sectionData = processSectionData(csvData);
        const weeklyData = getWeeklyData(csvData);
        
        console.log('👥 Dados por autor:', authorData);
        console.log('📝 Dados por seção:', sectionData);
        console.log('📅 Dados semanais:', weeklyData.length, 'contribuições');
        
        // QUARTO: Criar gráficos dinâmicos
        console.log('🎨 Criando gráficos...');
        createDynamicDonutChart('sectionsChartCanvas', sectionData, 'Contribuições por Seção');
        createDynamicDonutChart('changesChartCanvas', processChangeData(csvData), 'Tipos de Mudança Proposta');
        createDynamicLineChart('timelineChartCanvas', csvData, 'Evolução das Contribuições');
        
        // SEÇÃO SEMANAL - usando dados filtrados
        const weeklySectionData = processSectionData(weeklyData);
        const weeklyChangeData = processChangeData(weeklyData);
        
        createDynamicDonutChart('weeklySectionsChartCanvas', weeklySectionData, 'Seções (Semanal)');
        createDynamicDonutChart('weeklyChangesChartCanvas', weeklyChangeData, 'Tipos de Mudança (Semanal)');
        createDynamicLineChart('weeklyTimelineChartCanvas', weeklyData, 'Tendência Semanal');
        
        // QUINTO: Adicionar efeitos de hover nos cards
        addHoverEffects();
        
        // SEXTO: Atualizar timestamp
        updateLastUpdate();
        
        console.log('✨ Dashboard dinâmico inicializado com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro ao carregar dados do CSV:', error);
        
        // Fallback: mostrar mensagem de erro
        const containers = document.querySelectorAll('.chart-container canvas');
        containers.forEach(canvas => {
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#6b7280';
            ctx.font = '14px Inter';
            ctx.textAlign = 'center';
            ctx.fillText('Erro ao carregar dados', canvas.width / 2, canvas.height / 2);
            ctx.fillText('Verifique o arquivo CSV', canvas.width / 2, canvas.height / 2 + 20);
        });
    }
});

// Calcular estatísticas gerais dos dados
function calculateStats(data) {
    const stats = {
        total: data.length,
        thisWeek: 0,
        authors: new Set(),
        sections: new Set()
    };
    
    const weeklyData = getWeeklyData(data);
    stats.thisWeek = weeklyData.length;
    
    // Contar autores únicos
    data.forEach(item => {
        const author = item[Object.keys(item).find(key => 
            key.toLowerCase().includes('autor') || key.toLowerCase().includes('author')
        )];
        if (author) stats.authors.add(author);
        
        const section = item[Object.keys(item).find(key => 
            key.toLowerCase().includes('seção') || 
            key.toLowerCase().includes('secao') || 
            key.toLowerCase().includes('section')
        )];
        if (section) stats.sections.add(section);
    });
    
    return {
        total: stats.total,
        thisWeek: stats.thisWeek,
        authors: stats.authors.size,
        sections: stats.sections.size
    };
}

// Atualizar cards de estatísticas com dados reais
function updateStatsCards(data) {
    console.log('🔧 Iniciando updateStatsCards com', data.length, 'registros');
    
    const stats = calculateStats(data);
    console.log('📊 Stats calculadas em updateStatsCards:', stats);
    
    // Verificar se os elementos existem
    const elements = {
        totalElement: document.getElementById('total-contributions'),
        contributorsElement: document.getElementById('unique-contributors'),
        weeklyTotalElement: document.getElementById('weekly-total'),
        weeklyContributorsElement: document.getElementById('weekly-contributors'),
        mostCommentedElement: document.getElementById('most-commented-section'),
        weeklyMostCommentedElement: document.getElementById('weekly-most-commented-section')
    };
    
    Object.entries(elements).forEach(([name, element]) => {
        console.log(`🔍 Elemento ${name}:`, element ? 'ENCONTRADO' : 'NÃO ENCONTRADO');
    });
    
    // Atualizar elementos por ID
    if (elements.totalElement) {
        console.log('📈 Atualizando total-contributions para:', stats.total);
        animateNumber('total-contributions', stats.total);
    }
    if (elements.contributorsElement) {
        console.log('📈 Atualizando unique-contributors para:', stats.authors);
        animateNumber('unique-contributors', stats.authors);
    }
    if (elements.weeklyTotalElement) {
        console.log('📈 Atualizando weekly-total para:', stats.thisWeek);
        animateNumber('weekly-total', stats.thisWeek);
    }
    if (elements.weeklyContributorsElement) {
        // Para dados semanais, calcular autores únicos da semana
        const weeklyData = getWeeklyData(data);
        const weeklyAuthors = new Set();
        weeklyData.forEach(item => {
            const author = item[Object.keys(item).find(key => 
                key.toLowerCase().includes('autor') || key.toLowerCase().includes('author')
            )];
            if (author) weeklyAuthors.add(author);
        });
        console.log('📈 Atualizando weekly-contributors para:', weeklyAuthors.size);
        animateNumber('weekly-contributors', weeklyAuthors.size);
    }
    
    // Atualizar seção mais comentada (total)
    if (elements.mostCommentedElement) {
        const sectionData = processSectionData(data);
        console.log('📊 Dados de seções:', sectionData);
        const mostCommented = Object.keys(sectionData).length > 0 ? 
            Object.keys(sectionData).reduce((a, b) => 
                sectionData[a] > sectionData[b] ? a : b
            ) : 'Nenhuma seção';
        
        // Limitar texto longo
        const displayText = mostCommented.length > 30 ? 
            mostCommented.substring(0, 27) + '...' : mostCommented;
        console.log('📈 Atualizando most-commented-section para:', displayText);
        elements.mostCommentedElement.textContent = displayText;
    }
    
    // Atualizar seção mais comentada (semanal)
    if (elements.weeklyMostCommentedElement) {
        const weeklyData = getWeeklyData(data);
        const weeklySectionData = processSectionData(weeklyData);
        console.log('📊 Dados de seções semanais:', weeklySectionData);
        const weeklyMostCommented = Object.keys(weeklySectionData).length > 0 ? 
            Object.keys(weeklySectionData).reduce((a, b) => 
                weeklySectionData[a] > weeklySectionData[b] ? a : b
            ) : 'Nenhuma seção';
        
        // Limitar texto longo
        const displayText = weeklyMostCommented.length > 30 ? 
            weeklyMostCommented.substring(0, 27) + '...' : weeklyMostCommented;
        console.log('📈 Atualizando weekly-most-commented-section para:', displayText);
        elements.weeklyMostCommentedElement.textContent = displayText;
    }
    
    console.log('✅ Cards atualizados com sucesso!');
}

// Processar dados por autor dinamicamente
function processAuthorData(data) {
    const authorStats = {};
    
    data.forEach(item => {
        const author = item[Object.keys(item).find(key => 
            key.toLowerCase().includes('autor') || key.toLowerCase().includes('author')
        )] || 'Autor não identificado';
        
        authorStats[author] = (authorStats[author] || 0) + 1;
    });
    
    return authorStats;
}

// Processar dados por tipo de mudança dinamicamente
function processChangeData(data) {
    const changeStats = {};
    
    data.forEach(item => {
        const change = item.mudanca_proposta || item['mudança_proposta'] || item.mudanca || 'Tipo não identificado';
        changeStats[change] = (changeStats[change] || 0) + 1;
    });
    
    return changeStats;
}

// Processar dados por seção dinamicamente
function processSectionData(data) {
    const sectionStats = {};
    
    data.forEach(item => {
        const section = item[Object.keys(item).find(key => 
            key.toLowerCase().includes('seção') || 
            key.toLowerCase().includes('secao') || 
            key.toLowerCase().includes('section') ||
            key.toLowerCase().includes('categoria') ||
            key.toLowerCase().includes('category')
        )] || 'Seção não identificada';
        
        sectionStats[section] = (sectionStats[section] || 0) + 1;
    });
    
    return sectionStats;
}

// Atualizar timestamp da última atualização
function updateLastUpdate() {
    const now = new Date();
    const timestamp = now.toLocaleString('pt-BR');
    
    const updateElement = document.getElementById('update-time');
    if (updateElement) {
        updateElement.textContent = timestamp;
    }
    
    console.log(`🕐 Última atualização: ${timestamp}`);
}

// Adicionar efeitos de hover modernos
function addHoverEffects() {
    const cards = document.querySelectorAll('.modern-stat, .modern-chart');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-4px) scale(1.02)';
            this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// Função para atualização em tempo real (simulada)
function simulateRealTimeUpdates() {
    setInterval(() => {
        const now = new Date();
        document.getElementById('update-time').textContent = now.toLocaleString('pt-BR');
    }, 60000); // Atualiza a cada minuto
}
