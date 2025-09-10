// Dados das contribuições
const contributionsData = [
    {data: '08/09/2025 08:22', autor: 'HENRIQUE', id_autor: '1643611', secao: 'Seção 4.1 - Desafio societal', mudanca_proposta: 'Alterar texto'},
    {data: '06/09/2025 13:01', autor: 'PEDRO', id_autor: '1643485', secao: 'Seção 4.2 - Missões, Metas e Ações', mudanca_proposta: 'Inserir texto'},
    {data: '05/09/2025 10:17', autor: 'Diego Corrêa Furtado', id_autor: '1586737', secao: 'Ação Estratégica 22', mudanca_proposta: 'Inserir texto'},
    {data: '05/09/2025 11:42', autor: 'LEONARDO', id_autor: '1643420', secao: 'Ação Estratégica 6', mudanca_proposta: 'Inserir texto'},
    {data: '05/09/2025 10:20', autor: 'Diego Corrêa Furtado', id_autor: '1586737', secao: 'Ação Estratégica 4', mudanca_proposta: 'Inserir texto'},
    {data: '05/09/2025 10:23', autor: 'Diego Corrêa Furtado', id_autor: '1586737', secao: 'Ação Estratégica 4', mudanca_proposta: 'Inserir texto'},
    {data: '06/09/2025 12:55', autor: 'PEDRO', id_autor: '1643485', secao: 'CAPÍTULO 2 - GOVERNANÇA', mudanca_proposta: 'Inserir texto'},
    {data: '06/09/2025 13:02', autor: 'PEDRO', id_autor: '1643485', secao: 'Missão 4 - Aproveitamento', mudanca_proposta: 'Inserir texto'},
    {data: '05/09/2025 11:47', autor: 'LEONARDO', id_autor: '1643420', secao: 'Missão 6 - Produção de biomassa', mudanca_proposta: 'NDA'},
    {data: '08/09/2025 08:51', autor: 'HENRIQUE', id_autor: '1643611', secao: 'CAPÍTULO 5: FINANCIAMENTO', mudanca_proposta: 'NDA'},
    {data: '05/09/2025 10:56', autor: 'Diego Corrêa Furtado', id_autor: '1586737', secao: 'GLOSSÁRIO PNDBio', mudanca_proposta: 'Inserir texto'},
    {data: '05/09/2025 11:00', autor: 'Diego Corrêa Furtado', id_autor: '1586737', secao: 'GLOSSÁRIO PNDBio', mudanca_proposta: 'Inserir texto'},
    {data: '05/09/2025 10:52', autor: 'Diego Corrêa Furtado', id_autor: '1586737', secao: 'GLOSSÁRIO PNDBio', mudanca_proposta: 'Inserir texto'},
    {data: '05/09/2025 10:54', autor: 'Diego Corrêa Furtado', id_autor: '1586737', secao: 'GLOSSÁRIO PNDBio', mudanca_proposta: 'Inserir texto'},
    {data: '06/09/2025 13:06', autor: 'PEDRO', id_autor: '1643485', secao: 'GLOSSÁRIO PNDBio', mudanca_proposta: 'Inserir texto'},
    {data: '05/09/2025 10:33', autor: 'Diego Corrêa Furtado', id_autor: '1586737', secao: 'Ação Estratégica 5', mudanca_proposta: 'Alterar texto'},
    {data: '06/09/2025 13:03', autor: 'PEDRO', id_autor: '1643485', secao: 'Ação Estratégica 4', mudanca_proposta: 'NDA'},
    {data: '08/09/2025 08:42', autor: 'HENRIQUE', id_autor: '1643611', secao: 'Ação Estratégica 10', mudanca_proposta: 'Inserir texto'}
];

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

// Função para obter dados da última semana
function getWeeklyData() {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    return contributionsData.filter(item => {
        const [datePart] = item.data.split(' ');
        const [day, month, year] = datePart.split('/');
        const itemDate = new Date(year, month - 1, day);
        return itemDate >= oneWeekAgo;
    });
}

// Atualizar estatísticas com animação
function updateStats() {
    const totalContributions = contributionsData.length;
    const uniqueContributors = new Set(contributionsData.map(item => item.id_autor)).size;
    
    // Contar seções
    const sectionCounts = {};
    contributionsData.forEach(item => {
        sectionCounts[item.secao] = (sectionCounts[item.secao] || 0) + 1;
    });
    
    const mostCommentedSection = Object.keys(sectionCounts).reduce((a, b) => 
        sectionCounts[a] > sectionCounts[b] ? a : b
    );
    
    const weeklyData = getWeeklyData();
    const weeklyTotal = weeklyData.length;
    const weeklyUniqueContributors = new Set(weeklyData.map(item => item.id_autor)).size;
    
    // Contar seções semanais
    const weeklySectionCounts = {};
    weeklyData.forEach(item => {
        weeklySectionCounts[item.secao] = (weeklySectionCounts[item.secao] || 0) + 1;
    });
    
    const weeklyMostCommentedSection = Object.keys(weeklySectionCounts).length > 0 ? 
        Object.keys(weeklySectionCounts).reduce((a, b) => 
            weeklySectionCounts[a] > weeklySectionCounts[b] ? a : b
        ) : '-';
    
    // Animar os números
    animateNumber('total-contributions', totalContributions);
    animateNumber('unique-contributors', uniqueContributors);
    animateNumber('weekly-total', weeklyTotal);
    animateNumber('weekly-contributors', weeklyUniqueContributors);
    
    document.getElementById('most-commented-section').textContent = mostCommentedSection;
    document.getElementById('weekly-most-commented-section').textContent = weeklyMostCommentedSection;
    
    // Atualizar timestamp
    const now = new Date();
    document.getElementById('update-time').textContent = now.toLocaleString('pt-BR');
}

// Função para animar números
function animateNumber(elementId, finalValue) {
    const element = document.getElementById(elementId);
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

// Criar gráfico donut moderno com Chart.js
function createModernDonutChart(canvasId, data, title) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
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

// Criar gráfico de linha moderno com Chart.js
function createModernLineChart(canvasId, data, title) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    // Processar dados para timeline
    const timelineData = {};
    data.forEach(item => {
        const [datePart] = item.data.split(' ');
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
    
    new Chart(ctx, {
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

// Inicializar dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Adicionar canvas aos containers
    addCanvasToCharts();
    
    // Aguardar um pouco para os canvas serem criados
    setTimeout(() => {
        // Atualizar estatísticas
        updateStats();
        
        // SEÇÃO ACUMULADA
        
        // Gráfico de seções (acumulado)
        const sectionCounts = {};
        contributionsData.forEach(item => {
            sectionCounts[item.secao] = (sectionCounts[item.secao] || 0) + 1;
        });
        createModernDonutChart('sectionsChartCanvas', sectionCounts, 'Contribuições por Seção');
        
        // Gráfico de tipos de mudança (acumulado)
        const changeCounts = {};
        contributionsData.forEach(item => {
            changeCounts[item.mudanca_proposta] = (changeCounts[item.mudanca_proposta] || 0) + 1;
        });
        createModernDonutChart('changesChartCanvas', changeCounts, 'Tipos de Mudança');
        
        // Timeline acumulado
        createModernLineChart('timelineChartCanvas', contributionsData, 'Evolução das Contribuições');
        
        // SEÇÃO SEMANAL
        const weeklyData = getWeeklyData();
        
        // Gráfico de seções (semanal)
        const weeklySectionCounts = {};
        weeklyData.forEach(item => {
            weeklySectionCounts[item.secao] = (weeklySectionCounts[item.secao] || 0) + 1;
        });
        createModernDonutChart('weeklySectionsChartCanvas', weeklySectionCounts, 'Seções (Semanal)');
        
        // Gráfico de tipos de mudança (semanal)
        const weeklyChangeCounts = {};
        weeklyData.forEach(item => {
            weeklyChangeCounts[item.mudanca_proposta] = (weeklyChangeCounts[item.mudanca_proposta] || 0) + 1;
        });
        createModernDonutChart('weeklyChangesChartCanvas', weeklyChangeCounts, 'Mudanças (Semanal)');
        
        // Timeline semanal
        createModernLineChart('weeklyTimelineChartCanvas', weeklyData, 'Tendência Semanal');
        
        // Adicionar efeitos de hover nos cards
        addHoverEffects();
    }, 100);
});

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
