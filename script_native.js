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

// Cores verdes
const colors = [
    '#1b5e20', '#2e7d32', '#388e3c', '#43a047', '#4caf50', 
    '#66bb6a', '#81c784', '#a5d6a7', '#2d5016', '#1a4731',
    '#0d3d29', '#1e5631', '#689f38', '#827717', '#33691e'
];

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

// Atualizar estatísticas
function updateStats() {
    const totalContributions = contributionsData.length;
    const uniqueContributors = new Set(contributionsData.map(item => item.id_autor)).size;
    
    // Contar seções
    const sectionCounts = {};
    contributionsData.forEach(item => {
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

// Função para desenhar gráfico de pizza
function drawPieChart(canvasId, data, field, title) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2; // Para tela de alta resolução
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);
    
    const width = rect.width;
    const height = rect.height;
    
    // Limpar canvas
    ctx.clearRect(0, 0, width, height);
    
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
    const total = values.reduce((a, b) => a + b, 0);
    
    if (total === 0) {
        ctx.fillStyle = '#666';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Sem dados', width/2, height/2);
        return;
    }
    
    // Calcular ângulos
    let currentAngle = -Math.PI / 2;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 3;
    
    // Desenhar fatias
    values.forEach((value, index) => {
        const sliceAngle = (value / total) * 2 * Math.PI;
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
        ctx.closePath();
        
        ctx.fillStyle = colors[index % colors.length];
        ctx.fill();
        
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        currentAngle += sliceAngle;
    });
    
    // Adicionar legenda simples
    let legendY = height - 80;
    ctx.font = '11px Arial';
    ctx.textAlign = 'left';
    
    labels.forEach((label, index) => {
        if (index < 4) { // Mostrar apenas primeiros 4 para não sobrecarregar
            const shortLabel = label.length > 20 ? label.substring(0, 20) + '...' : label;
            
            // Quadrado de cor
            ctx.fillStyle = colors[index % colors.length];
            ctx.fillRect(10, legendY, 12, 12);
            
            // Texto
            ctx.fillStyle = '#333';
            ctx.fillText(`${shortLabel} (${values[index]})`, 25, legendY + 10);
            
            legendY += 16;
        }
    });
    
    if (labels.length > 4) {
        ctx.fillStyle = '#666';
        ctx.fillText(`... e mais ${labels.length - 4} itens`, 25, legendY);
    }
}

// Função para desenhar gráfico de linha
function drawLineChart(canvasId, data, title) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);
    
    const width = rect.width;
    const height = rect.height;
    const margin = 40;
    
    // Limpar canvas
    ctx.clearRect(0, 0, width, height);
    
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
    const maxValue = Math.max(...values);
    
    if (sortedDates.length === 0) {
        ctx.fillStyle = '#666';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Sem dados', width/2, height/2);
        return;
    }
    
    // Desenhar eixos
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    
    // Eixo Y
    ctx.beginPath();
    ctx.moveTo(margin, margin);
    ctx.lineTo(margin, height - margin);
    ctx.stroke();
    
    // Eixo X
    ctx.beginPath();
    ctx.moveTo(margin, height - margin);
    ctx.lineTo(width - margin, height - margin);
    ctx.stroke();
    
    // Desenhar linha
    ctx.strokeStyle = '#2e7d32';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    const chartWidth = width - 2 * margin;
    const chartHeight = height - 2 * margin;
    
    sortedDates.forEach((date, index) => {
        const x = margin + (index / (sortedDates.length - 1)) * chartWidth;
        const y = height - margin - (values[index] / maxValue) * chartHeight;
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
        
        // Pontos
        ctx.fillStyle = '#2e7d32';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
    });
    
    ctx.stroke();
    
    // Labels do eixo X (apenas alguns)
    ctx.fillStyle = '#666';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    
    const step = Math.max(1, Math.floor(sortedDates.length / 5));
    for (let i = 0; i < sortedDates.length; i += step) {
        const x = margin + (i / (sortedDates.length - 1)) * chartWidth;
        const shortDate = sortedDates[i].substring(0, 5); // DD/MM
        ctx.fillText(shortDate, x, height - margin + 15);
    }
}

// Função para criar todos os gráficos
function createAllCharts() {
    console.log('Criando gráficos nativos...');
    
    const weeklyData = getWeeklyData();
    
    // Gráficos acumulados
    drawPieChart('sectionsChart', contributionsData, 'secao', 'Seções');
    drawPieChart('changesChart', contributionsData, 'mudanca_proposta', 'Mudanças');
    drawLineChart('timelineChart', contributionsData, 'Timeline');
    
    // Gráficos semanais
    drawPieChart('weeklySectionsChart', weeklyData, 'secao', 'Seções Semanais');
    drawPieChart('weeklyChangesChart', weeklyData, 'mudanca_proposta', 'Mudanças Semanais');
    drawLineChart('weeklyTimelineChart', weeklyData, 'Timeline Semanal');
    
    console.log('Gráficos criados com sucesso!');
}

// Redimensionar gráficos quando a janela mudar
function handleResize() {
    setTimeout(createAllCharts, 100);
}

// Inicializar dashboard
function initDashboard() {
    console.log('Inicializando dashboard...');
    
    // Atualizar estatísticas
    updateStats();
    
    // Criar gráficos
    createAllCharts();
    
    // Adicionar listener de redimensionamento
    window.addEventListener('resize', handleResize);
    
    console.log('Dashboard inicializado!');
}

// Aguardar DOM carregar
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado, iniciando dashboard...');
    setTimeout(initDashboard, 100);
});

// Fallback se DOM já carregou
if (document.readyState !== 'loading') {
    console.log('DOM já carregado');
    setTimeout(initDashboard, 100);
}
