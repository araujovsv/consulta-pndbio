// Dados fixos para garantir funcionamento
const rawData = [
    {data: '08/09/2025 08:22', autor: 'HENRIQUE', id_autor: '1643611', secao: 'Seção 4.1 - Desafio societal', mudanca_proposta: 'Alterar texto'},
    {data: '06/09/2025 13:01', autor: 'PEDRO', id_autor: '1643485', secao: 'Seção 4.2 - Missões, Metas e Açõe', mudanca_proposta: 'Inserir texto'},
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

// Cores verdes
const greenColors = [
    '#1b5e20', '#2e7d32', '#388e3c', '#43a047', '#4caf50', 
    '#66bb6a', '#81c784', '#a5d6a7', '#2d5016', '#1a4731',
    '#0d3d29', '#1e5631', '#2f7d32', '#689f38', '#827717'
];

// Função para calcular dados da última semana
function getWeeklyData() {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    return rawData.filter(item => {
        const [datePart] = item.data.split(' ');
        const [day, month, year] = datePart.split('/');
        const itemDate = new Date(year, month - 1, day);
        return itemDate >= oneWeekAgo;
    });
}

// Atualizar estatísticas
function updateStats() {
    const totalContributions = rawData.length;
    const uniqueContributors = new Set(rawData.map(item => item.id_autor)).size;
    
    // Contar seções
    const sectionCounts = {};
    rawData.forEach(item => {
        sectionCounts[item.secao] = (sectionCounts[item.secao] || 0) + 1;
    });
    
    const mostCommented = Object.entries(sectionCounts)
        .sort(([,a], [,b]) => b - a)[0][0];
    
    const weeklyData = getWeeklyData();
    
    // Atualizar DOM
    document.getElementById('total-contributions').textContent = totalContributions;
    document.getElementById('unique-contributors').textContent = uniqueContributors;
    document.getElementById('most-commented-section').textContent = mostCommented.length > 30 
        ? mostCommented.substring(0, 30) + '...' 
        : mostCommented;
    document.getElementById('weekly-total').textContent = weeklyData.length;
}

// Função para criar gráfico de pizza simples
function createSimplePieChart(canvasId, data, field, title) {
    try {
        console.log(`Criando gráfico ${canvasId} com ${data.length} itens`);
        
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`Canvas ${canvasId} não encontrado`);
            return;
        }
        
        // Contar valores
        const counts = {};
        data.forEach(item => {
            const value = item[field];
            if (value && value !== 'NDA') {
                counts[value] = (counts[value] || 0) + 1;
            }
        });
        
        const labels = Object.keys(counts);
        const values = Object.values(counts);
        
        if (labels.length === 0) {
            const container = canvas.parentElement;
            container.innerHTML = `<h3>${title}</h3><p>Sem dados para exibir</p>`;
            return;
        }
        
        // Limpar canvas anterior
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        
        // Criar gráfico
        new Chart(canvas, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: greenColors.slice(0, labels.length),
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 10,
                            font: { size: 10 },
                            generateLabels: function(chart) {
                                const data = chart.data;
                                return data.labels.map((label, i) => ({
                                    text: `${label} (${data.datasets[0].data[i]})`,
                                    fillStyle: data.datasets[0].backgroundColor[i],
                                    hidden: false,
                                    index: i
                                }));
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return `${context.label}: ${context.parsed} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
        
        console.log(`Gráfico ${canvasId} criado com sucesso`);
        
    } catch (error) {
        console.error(`Erro ao criar gráfico ${canvasId}:`, error);
        const container = document.getElementById(canvasId)?.parentElement;
        if (container) {
            container.innerHTML = `<h3>${title}</h3><p style="color: red;">Erro: ${error.message}</p>`;
        }
    }
}

// Função para criar gráfico de linha temporal
function createTimelineChart(canvasId, data, title) {
    try {
        console.log(`Criando timeline ${canvasId} com ${data.length} itens`);
        
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`Canvas ${canvasId} não encontrado`);
            return;
        }
        
        // Agrupar por data
        const dateCounts = {};
        data.forEach(item => {
            const [datePart] = item.data.split(' ');
            dateCounts[datePart] = (dateCounts[datePart] || 0) + 1;
        });
        
        // Ordenar datas
        const sortedDates = Object.keys(dateCounts).sort((a, b) => {
            const [dayA, monthA, yearA] = a.split('/');
            const [dayB, monthB, yearB] = b.split('/');
            const dateA = new Date(yearA, monthA - 1, dayA);
            const dateB = new Date(yearB, monthB - 1, dayB);
            return dateA - dateB;
        });
        
        const values = sortedDates.map(date => dateCounts[date]);
        
        // Limpar canvas anterior
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        
        // Criar gráfico
        new Chart(canvas, {
            type: 'line',
            data: {
                labels: sortedDates,
                datasets: [{
                    label: 'Contribuições',
                    data: values,
                    borderColor: '#2e7d32',
                    backgroundColor: 'rgba(46, 125, 50, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#2e7d32',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { mode: 'index', intersect: false }
                },
                scales: {
                    x: {
                        display: true,
                        title: { display: true, text: 'Data' },
                        ticks: { maxTicksLimit: 8 }
                    },
                    y: {
                        display: true,
                        title: { display: true, text: 'Contribuições' },
                        beginAtZero: true,
                        ticks: { stepSize: 1 }
                    }
                }
            }
        });
        
        console.log(`Timeline ${canvasId} criado com sucesso`);
        
    } catch (error) {
        console.error(`Erro ao criar timeline ${canvasId}:`, error);
        const container = document.getElementById(canvasId)?.parentElement;
        if (container) {
            container.innerHTML = `<h3>${title}</h3><p style="color: red;">Erro: ${error.message}</p>`;
        }
    }
}

// Função principal para inicializar tudo
function initDashboard() {
    console.log('Iniciando dashboard...');
    
    try {
        // Aguardar Chart.js carregar
        if (typeof Chart === 'undefined') {
            console.log('Chart.js ainda não carregou, tentando novamente...');
            setTimeout(initDashboard, 500);
            return;
        }
        
        console.log('Chart.js carregado, criando gráficos...');
        
        // Atualizar estatísticas
        updateStats();
        
        // Dados semanais
        const weeklyData = getWeeklyData();
        
        // Criar gráficos acumulados
        createSimplePieChart('sectionsChart', rawData, 'secao', 'Seções - Acumulado');
        createSimplePieChart('changesChart', rawData, 'mudanca_proposta', 'Mudanças - Acumulado');
        createTimelineChart('timelineChart', rawData, 'Timeline - Acumulado');
        
        // Criar gráficos semanais
        createSimplePieChart('weeklySectionsChart', weeklyData, 'secao', 'Seções - Semanal');
        createSimplePieChart('weeklyChangesChart', weeklyData, 'mudanca_proposta', 'Mudanças - Semanal');
        createTimelineChart('weeklyTimelineChart', weeklyData, 'Timeline - Semanal');
        
        console.log('Dashboard inicializado com sucesso!');
        
    } catch (error) {
        console.error('Erro na inicialização:', error);
        
        // Exibir erro em todos os containers
        document.querySelectorAll('.chart-container').forEach(container => {
            const title = container.querySelector('h3')?.textContent || 'Gráfico';
            container.innerHTML = `
                <h3>${title}</h3>
                <div style="text-align: center; padding: 50px; color: #e74c3c;">
                    <p>Erro ao carregar: ${error.message}</p>
                </div>
            `;
        });
    }
}

// Aguardar DOM e inicializar
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado');
    setTimeout(initDashboard, 100);
});

// Fallback caso DOMContentLoaded já tenha disparado
if (document.readyState === 'loading') {
    console.log('Aguardando DOM...');
} else {
    console.log('DOM já carregado, iniciando...');
    setTimeout(initDashboard, 100);
}
