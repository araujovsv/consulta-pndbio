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

// Paleta de cores verdes
const greenPalette = [
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
    
    // Atualizar data e hora da última atualização
    const now = new Date();
    const dateTime = now.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    document.getElementById('update-time').textContent = dateTime;
}

// Função para criar gráfico de donut (pizza) com ApexCharts
function createDonutChart(containerId, data, field, title) {
    try {
        console.log(`Criando gráfico donut ${containerId}`);
        
        // Contar valores
        const counts = {};
        data.forEach(item => {
            const value = item[field];
            if (value && value !== 'NDA') {
                const shortValue = value.length > 20 ? value.substring(0, 20) + '...' : value;
                counts[shortValue] = (counts[shortValue] || 0) + 1;
            }
        });
        
        const labels = Object.keys(counts);
        const series = Object.values(counts);
        
        if (labels.length === 0) {
            document.getElementById(containerId).innerHTML = '<p style="text-align: center; padding: 50px; color: #666;">Sem dados disponíveis</p>';
            return;
        }
        
        const options = {
            chart: {
                type: 'donut',
                height: 350,
                animations: {
                    enabled: true,
                    easing: 'easeinout',
                    speed: 800,
                },
                toolbar: {
                    show: false
                }
            },
            series: series,
            labels: labels,
            colors: greenPalette.slice(0, labels.length),
            dataLabels: {
                enabled: false
            },
            legend: {
                position: 'bottom',
                fontSize: '12px',
                markers: {
                    width: 12,
                    height: 12
                },
                formatter: function(seriesName, opts) {
                    return seriesName + ": " + opts.w.globals.series[opts.seriesIndex]
                }
            },
            plotOptions: {
                pie: {
                    donut: {
                        size: '65%',
                        labels: {
                            show: true,
                            total: {
                                show: true,
                                showAlways: true,
                                label: 'Total',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                color: '#2e7d32',
                                formatter: function (w) {
                                    return w.globals.seriesTotals.reduce((a, b) => a + b, 0)
                                }
                            },
                            value: {
                                show: false
                            },
                            name: {
                                show: false
                            }
                        }
                    }
                }
            },
            tooltip: {
                enabled: true,
                custom: function({series, seriesIndex, dataPointIndex, w}) {
                    const value = series[seriesIndex];
                    const label = w.globals.labels[seriesIndex];
                    const total = series.reduce((a, b) => a + b, 0);
                    const percent = ((value / total) * 100).toFixed(1);
                    
                    return `<div style="padding: 8px 12px; background: rgba(0,0,0,0.8); color: white; border-radius: 4px; font-size: 12px;">
                        <strong>${label}</strong><br/>
                        ${value} contribuições (${percent}%)
                    </div>`;
                }
            },
            responsive: [{
                breakpoint: 768,
                options: {
                    chart: {
                        height: 300
                    },
                    legend: {
                        fontSize: '10px'
                    }
                }
            }]
        };
        
        const chart = new ApexCharts(document.querySelector(`#${containerId}`), options);
        chart.render();
        
        console.log(`Gráfico ${containerId} criado com sucesso`);
        
    } catch (error) {
        console.error(`Erro ao criar gráfico ${containerId}:`, error);
        document.getElementById(containerId).innerHTML = `<p style="color: red; text-align: center;">Erro: ${error.message}</p>`;
    }
}

// Função para criar gráfico de linha com ApexCharts
function createLineChart(containerId, data, title) {
    try {
        console.log(`Criando gráfico linha ${containerId}`);
        
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
        
        const seriesData = sortedDates.map(date => ({
            x: date,
            y: dateCounts[date]
        }));
        
        if (seriesData.length === 0) {
            document.getElementById(containerId).innerHTML = '<p style="text-align: center; padding: 50px; color: #666;">Sem dados disponíveis</p>';
            return;
        }
        
        const options = {
            chart: {
                type: 'area',
                height: 350,
                animations: {
                    enabled: true,
                    easing: 'easeinout',
                    speed: 800,
                },
                toolbar: {
                    show: false
                },
                zoom: {
                    enabled: false
                }
            },
            series: [{
                name: 'Contribuições',
                data: seriesData
            }],
            colors: ['#2e7d32'],
            stroke: {
                curve: 'smooth',
                width: 3
            },
            fill: {
                type: 'gradient',
                gradient: {
                    shadeIntensity: 1,
                    opacityFrom: 0.7,
                    opacityTo: 0.3,
                    stops: [0, 100]
                }
            },
            dataLabels: {
                enabled: false
            },
            xaxis: {
                type: 'category',
                labels: {
                    style: {
                        fontSize: '12px'
                    }
                }
            },
            yaxis: {
                title: {
                    text: 'Número de Contribuições',
                    style: {
                        fontSize: '12px'
                    }
                },
                labels: {
                    style: {
                        fontSize: '12px'
                    }
                }
            },
            grid: {
                borderColor: '#e0e6ed',
                strokeDashArray: 5
            },
            tooltip: {
                x: {
                    format: 'dd/MM/yyyy'
                }
            },
            responsive: [{
                breakpoint: 768,
                options: {
                    chart: {
                        height: 300
                    }
                }
            }]
        };
        
        const chart = new ApexCharts(document.querySelector(`#${containerId}`), options);
        chart.render();
        
        console.log(`Gráfico linha ${containerId} criado com sucesso`);
        
    } catch (error) {
        console.error(`Erro ao criar gráfico linha ${containerId}:`, error);
        document.getElementById(containerId).innerHTML = `<p style="color: red; text-align: center;">Erro: ${error.message}</p>`;
    }
}

// Função para criar todos os gráficos
function createAllCharts() {
    console.log('Criando todos os gráficos com ApexCharts...');
    
    const weeklyData = getWeeklyData();
    
    // Aguardar um pouco para garantir que os elementos estão no DOM
    setTimeout(() => {
        // Gráficos acumulados
        createDonutChart('sectionsChart', contributionsData, 'secao', 'Seções');
        createDonutChart('changesChart', contributionsData, 'mudanca_proposta', 'Mudanças');
        createLineChart('timelineChart', contributionsData, 'Timeline');
        
        // Gráficos semanais
        createDonutChart('weeklySectionsChart', weeklyData, 'secao', 'Seções Semanais');
        createDonutChart('weeklyChangesChart', weeklyData, 'mudanca_proposta', 'Mudanças Semanais');
        createLineChart('weeklyTimelineChart', weeklyData, 'Timeline Semanal');
    }, 200);
}

// Inicializar dashboard
function initDashboard() {
    console.log('Inicializando dashboard com ApexCharts...');
    
    // Verificar se ApexCharts carregou
    if (typeof ApexCharts === 'undefined') {
        console.log('ApexCharts ainda não carregou, tentando novamente...');
        setTimeout(initDashboard, 500);
        return;
    }
    
    console.log('ApexCharts carregado!');
    
    // Atualizar estatísticas
    updateStats();
    
    // Criar gráficos
    createAllCharts();
    
    console.log('Dashboard inicializado com sucesso!');
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
