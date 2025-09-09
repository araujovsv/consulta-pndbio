// Variáveis globais
let allData = [];
let weeklyData = [];

// Configuração das cores dos gráficos (tons esverdeados escuros)
const chartColors = [
    '#2d5016', '#1a4731', '#0d3d29', '#1e5631', '#2f7d32',
    '#388e3c', '#43a047', '#4caf50', '#66bb6a', '#81c784',
    '#1b5e20', '#2e7d32', '#4caf50', '#689f38', '#827717'
];

// Função para parsear data no formato DD/MM/AAAA HH:MM
function parseDate(dateString) {
    if (!dateString || typeof dateString !== 'string') {
        throw new Error('Data inválida ou vazia');
    }
    
    const trimmed = dateString.trim();
    const parts = trimmed.split(' ');
    
    if (parts.length !== 2) {
        throw new Error(`Formato de data inválido: ${dateString}. Esperado: DD/MM/AAAA HH:MM`);
    }
    
    const [datePart, timePart] = parts;
    const dateParts = datePart.split('/');
    const timeParts = timePart.split(':');
    
    if (dateParts.length !== 3 || timeParts.length !== 2) {
        throw new Error(`Formato de data inválido: ${dateString}. Esperado: DD/MM/AAAA HH:MM`);
    }
    
    const [day, month, year] = dateParts.map(p => parseInt(p, 10));
    const [hour, minute] = timeParts.map(p => parseInt(p, 10));
    
    if (isNaN(day) || isNaN(month) || isNaN(year) || isNaN(hour) || isNaN(minute)) {
        throw new Error(`Valores numéricos inválidos na data: ${dateString}`);
    }
    
    const date = new Date(year, month - 1, day, hour, minute);
    
    if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
        throw new Error(`Data inválida: ${dateString}`);
    }
    
    return date;
}

// Função para formatar data para exibição
function formatDate(date) {
    return date.toLocaleDateString('pt-BR');
}

// Função para obter data de X dias atrás
function getDaysAgo(days) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    date.setHours(0, 0, 0, 0);
    return date;
}

// Função para parsear linha CSV considerando aspas
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++; // Skip next quote
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ';' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    
    result.push(current);
    return result;
}

// Função para processar dados do CSV
function processData(csvData) {
    try {
        console.log('Iniciando processamento dos dados CSV...');
        const lines = csvData.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
            throw new Error('CSV deve ter pelo menos cabeçalho e uma linha de dados');
        }
        
        const headers = lines[0].split(';').map(h => h.trim());
        console.log('Cabeçalhos encontrados:', headers);
        
        const data = [];

        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim()) {
                try {
                    const values = parseCSVLine(lines[i]);
                    
                    if (values.length > 0) {
                        const row = {};
                        headers.forEach((header, index) => {
                            const value = values[index] || '';
                            row[header] = value.trim().replace(/^"(.*)"$/, '$1'); // Remove aspas externas
                        });
                        
                        // Parsear a data se existir
                        if (row.data && row.data.trim()) {
                            try {
                                row.parsedDate = parseDate(row.data);
                            } catch (dateError) {
                                console.warn(`Erro ao parsear data na linha ${i + 1}:`, row.data, dateError);
                                row.parsedDate = null;
                            }
                        }
                        
                        data.push(row);
                    }
                } catch (lineError) {
                    console.warn(`Erro ao processar linha ${i + 1}:`, lines[i], lineError);
                }
            }
        }
        
        console.log(`${data.length} registros processados com sucesso`);
        return data;
        
    } catch (error) {
        console.error('Erro no processamento dos dados:', error);
        throw error;
    }
}

// Função para filtrar dados da última semana
function getWeeklyData(data) {
    const oneWeekAgo = getDaysAgo(7);
    return data.filter(row => {
        if (row.parsedDate) {
            return row.parsedDate >= oneWeekAgo;
        }
        return false;
    });
}

// Função para atualizar estatísticas gerais
function updateStats(data, weeklyData) {
    // Estatísticas acumuladas (filtra apenas registros válidos)
    const validData = data.filter(row => row.id_autor && row.id_autor.trim() !== '' && row.id_autor !== 'id_autor');
    const totalContributions = validData.length;
    const uniqueContributors = new Set(validData.map(row => row.id_autor)).size;
    
    // Seção mais comentada
    const sectionCounts = {};
    validData.forEach(row => {
        if (row.secao) {
            sectionCounts[row.secao] = (sectionCounts[row.secao] || 0) + 1;
        }
    });
    
    let mostCommentedSection = '-';
    let maxCount = 0;
    for (const [section, count] of Object.entries(sectionCounts)) {
        if (count > maxCount) {
            maxCount = count;
            mostCommentedSection = section;
        }
    }

    // Truncar nome da seção se muito longo
    if (mostCommentedSection.length > 30) {
        mostCommentedSection = mostCommentedSection.substring(0, 30) + '...';
    }
    
    // Atualizar DOM
    document.getElementById('total-contributions').textContent = totalContributions;
    document.getElementById('unique-contributors').textContent = uniqueContributors;
    document.getElementById('most-commented-section').textContent = mostCommentedSection;
    
    // Estatísticas semanais
    const validWeeklyData = weeklyData.filter(row => row.id_autor && row.id_autor.trim() !== '' && row.id_autor !== 'id_autor');
    document.getElementById('weekly-total').textContent = validWeeklyData.length;
}

// Função para criar gráfico de pizza
function createPieChart(canvasId, data, labelKey, title) {
    try {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            throw new Error(`Canvas com ID '${canvasId}' não encontrado`);
        }
        
        const ctx = canvas.getContext('2d');
        
        // Filtrar dados válidos
        const validData = data.filter(row => row.id_autor && row.id_autor.trim() !== '' && row.id_autor !== 'id_autor');
        
        // Contar ocorrências
        const counts = {};
        validData.forEach(row => {
            const value = row[labelKey];
            if (value && value !== 'NDA' && value.trim() !== '') {
                const cleanValue = value.trim();
                counts[cleanValue] = (counts[cleanValue] || 0) + 1;
            }
        });
        
        // Verificar se há dados para exibir
        if (Object.keys(counts).length === 0) {
            // Exibir mensagem de "sem dados"
            const container = canvas.parentElement;
            container.innerHTML = `
                <h3>${title}</h3>
                <div style="text-align: center; padding: 50px; color: #7f8c8d;">
                    <p>Nenhum dado disponível para este período</p>
                </div>
            `;
            return null;
        }
        
        // Preparar dados para o gráfico
        const labels = Object.keys(counts);
        const values = Object.values(counts);
        
        // Truncar labels longos
        const truncatedLabels = labels.map(label => {
            if (label.length > 25) {
                return label.substring(0, 25) + '...';
            }
            return label;
        });
        
        return new Chart(ctx, {
            type: 'pie',
            data: {
                labels: truncatedLabels,
                datasets: [{
                    data: values,
                    backgroundColor: chartColors.slice(0, labels.length),
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            font: {
                                size: 11
                            },
                            generateLabels: function(chart) {
                                const original = Chart.defaults.plugins.legend.labels.generateLabels;
                                const labelsOriginal = original.call(this, chart);
                                
                                labelsOriginal.forEach((label, index) => {
                                    label.text = labels[index] + ` (${values[index]})`;
                                });
                                
                                return labelsOriginal;
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const fullLabel = labels[context.dataIndex];
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${fullLabel}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
        
    } catch (error) {
        console.error(`Erro ao criar gráfico ${canvasId}:`, error);
        const container = document.getElementById(canvasId)?.parentElement;
        if (container) {
            container.innerHTML = `
                <h3>${title}</h3>
                <div style="text-align: center; padding: 50px; color: #e74c3c;">
                    <p>Erro ao carregar gráfico</p>
                    <p style="font-size: 0.8em; color: #7f8c8d;">${error.message}</p>
                </div>
            `;
        }
        return null;
    }
}

// Função para criar gráfico de linha temporal
function createTimelineChart(canvasId, data, title) {
    try {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            throw new Error(`Canvas com ID '${canvasId}' não encontrado`);
        }
        
        const ctx = canvas.getContext('2d');
        
        // Filtrar dados válidos
        const validData = data.filter(row => row.id_autor && row.id_autor.trim() !== '' && row.id_autor !== 'id_autor');
        
        // Agrupar por data
        const dateCounts = {};
        validData.forEach(row => {
            if (row.parsedDate) {
                const dateKey = formatDate(row.parsedDate);
                dateCounts[dateKey] = (dateCounts[dateKey] || 0) + 1;
            }
        });
        
        // Ordenar datas
        const sortedDates = Object.keys(dateCounts).sort((a, b) => {
            const dateA = new Date(a.split('/').reverse().join('-'));
            const dateB = new Date(b.split('/').reverse().join('-'));
            return dateA - dateB;
        });
        
        const values = sortedDates.map(date => dateCounts[date]);
        
        return new Chart(ctx, {
            type: 'line',
            data: {
                labels: sortedDates,
                datasets: [{
                    label: 'Contribuições',
                    data: values,
                    borderColor: '#2d5016',
                    backgroundColor: 'rgba(45, 80, 22, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#2d5016',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 5
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
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Data'
                        },
                        ticks: {
                            maxTicksLimit: 10
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Número de Contribuições'
                        },
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
        
    } catch (error) {
        console.error(`Erro ao criar gráfico de timeline ${canvasId}:`, error);
        const container = document.getElementById(canvasId)?.parentElement;
        if (container) {
            container.innerHTML = `
                <h3>${title}</h3>
                <div style="text-align: center; padding: 50px; color: #e74c3c;">
                    <p>Erro ao carregar gráfico de timeline</p>
                    <p style="font-size: 0.8em; color: #7f8c8d;">${error.message}</p>
                </div>
            `;
        }
        return null;
    }
}

// Função para carregar e processar dados
function loadData() {
    try {
        console.log('Iniciando carregamento dos dados...');
        
        // Dados incorporados diretamente no código
        const csvText = `data;tipo_contribuicao;tipo_autor;autor;id_autor;texto;id_proposta;secao;mudanca_proposta;risco_implementacao;divergencia;recomendacao;comentarios_coalizao;decisao_mma;comentarios_mma
08/09/2025 08:22;Individual;Pessoa Física;HENRIQUE;1643611;"Sugiro o termo ""sociobiodiversidade"". A transformação, no fim do dia, parte das pessoas. A redação atual enfatiza muito a tecnologia e sua ""matéria-prima"" (biodiversidade). tecnologia sozinhas não alteram paradigmas.";42627;Seção 4.1 - Desafio societal: T...;Alterar texto;Baixo;;Considerar;Termo amplamente reconhecido em políticas públicas brasieliras e alinhado ao PNDBio, ;;
06/09/2025 13:01;Individual;Pessoa Física;PEDRO;1643485;Criar o recorte "Interiorização & Fronteiras" nas metas, com indicadores de: nº de municípios interioranos atendidos, nº de empreendimentos apoiados em zonas de fronteira, nº de mulheres e jovens líderes apoiados.;42619;Seção 4.2 - Missões, Metas e Aç...;Inserir texto;Médio;;Validação;Importante reconhecer especificidades regionais, mas a criação de um novo recorte é onerosa. Validar com CGEE;;
05/09/2025 10:17;Individual;Pessoa Física;Diego Corrêa Furtado;1586737;É importante considerar o conjunto de guardiães da sociobiodiversidade (povos indígenas, os 28 segmentos de PCTs e agricultores familiares), não apenas os 3 segmentos listados.;42600;Ação Estratégica 22: Desenvolve...;Inserir texto;Baixo;;Considerar;Fortalece o protagonismo de PCTs, em linha com os princípios da PNDBio. Implementação factível;;
05/09/2025 11:42;Individual;Pessoa Física;LEONARDO;1643420;Desenvolver incentivos fiscais para a cadeia produtiva de equipamentos de geração de biogás, considerando também a inclusão como item do Nova Indústria Brasil visando criar uma oferta de equipamentos interna diminuindo da dependência de importações.;42612;Ação Estratégica 6: Melhorar as...;Inserir texto;Alto;;Validação;Relevante à bioeconomia, mas envolve impactos no orçamento público e regulatório. Validar com CGEE;;
05/09/2025 10:20;Individual;Pessoa Física;Diego Corrêa Furtado;1586737;"Seria interessante incluir ""associações"" junto de cooperativas, pois são uma forma jurídica importante assumida por coletivos de povos indígenas, povos e comunidades tradicionais e agricultores familiares.";42601;Ação Estratégica 4: Fomentar am...;Inserir texto;Baixo;;Considerar;Proposta de simples inserção e amplia a representatividade;;
05/09/2025 10:23;Individual;Pessoa Física;Diego Corrêa Furtado;1586737;"Seria interessante incluir ""setor financeiro"" na lista de atores, logo após ""investidores"", pois ""investidores"", a meu ver, podem incluir atores do setor financeiro, mas não há uma plena sobreposição entre os dois segmentos.";42603;Ação Estratégica 4: Fomentar am...;Inserir texto;Médio;;Validação;Aparentemente de simples inserção, mas pode gerar conflitos de interesse. Verificar com o CGEE;;
06/09/2025 12:55;Individual;Pessoa Física;PEDRO;1643485;"Incluir o "Eixo Fronteiras de difícil acesso" como prioridade transversal na governança, com assento específico para representantes de municípios fronteiriços e PIPCTAFs. 
 A realidade das fronteiras de difícil acesso têm desafios logísticos, sanitários e de mercado distintos, que precisam de voz e votos nas decisões.";42618;CAPÍTULO 2 - GOVERNANÇA DO PNDB...;Inserir texto;Médio;;Validação;Criação de um eixo pode fragmentar a estrutura do plano. Validar com CGEE;;
06/09/2025 13:02;Individual;Pessoa Física;PEDRO;1643485;Incluir critérios de pontuação em editais que valorizem projetos do interior e fronteira, proponentes mulheres/jovens e parcerias com ambientes de inovação e ICTs locais.;42620;Missão 4 - Aproveitamento integ...;Inserir texto;Médio;;Validação;É de fácil implementação? Validar com CGEE;;
05/09/2025 11:47;Individual;Pessoa Física;LEONARDO;1643420;Criar leia federal que fomente o desenvolvimento de leis estaduais e resoluções regulatórias para combinar o uso do biometano com redes de gás natural. A lei pode estabelecer metas de % de inclusão do insumo com o gás natural e também fomentar que os potenciais geradores da insumo via biomassa de fontes diversas promovam o tratamento para gerar oferta potencial. Essa poderia se associar ao fomento no desenvolvimento de infraestruturas de distribuição e transporte (gasodutos) nas regiões desabastecidas mais a Oeste do litoral nacional. Lei que pode ser associar a metas de enfrentamento da pobreza energética visando deslocar inclusive o uso de lenha.;42613;Missão 6 - Produção de biomassa...;NDA;Alto;;Não considerar;Implementação complexo, envolvendo a política tributária nacional e outros órgãos públicos relevantes;;
08/09/2025 08:51;Individual;Pessoa Física;HENRIQUE;1643611;"Em relação a ""Pergunta para a consulta pública II: Que outros dados ou informações poderiam complementar o diagnóstico do financiamento da bioeconomia no Brasil?""
 
 Sugiro que se levante informações do FNDCT, para compreender quanto de seu financiamento esteve / está voltado para Bioeconomia.";42629;CAPÍTULO 5: FINANCIAMENTO DO PL...;NDA;Médio;;;;;
05/09/2025 10:56;Individual;Pessoa Física;Diego Corrêa Furtado;1586737;"Existe grande confusão entre os termos ""serviços ambientais"" e ""serviços ecossistêmicos"". Embora o texto sob consulta cite ""serviços ambientais"" poucas vezes, creio que seria interessante incluir no glossário seu conceito, por causa da confusão citada. Caso haja concordância, sugiro reproduzir/adaptar o conceito apresentado na LEI Nº 14.119, DE 13 DE JANEIRO DE 2021";42609;GLOSSÁRIO PNDBio...;Inserir texto;Baixo;;Considerar;Inclusão de fácil implementação no glossário;;
05/09/2025 11:00;Individual;Pessoa Física;Diego Corrêa Furtado;1586737;Sugiro incluir o conceito de Povos e Comunidades Tradicionais, ressaltando a existência de 28 segmentos identificados até o momento, com referência ao Decreto 6.040/2007 e ao Decreto 8.750/2016.;42610;GLOSSÁRIO PNDBio...;Inserir texto;Baixo;;Considerar;Inclusão de fácil implementação;;
05/09/2025 10:52;Individual;Pessoa Física;Diego Corrêa Furtado;1586737;"O conceito de ""sociobiodiversadade"" foi construído com base no Decreto 6.040/2007, todavia, salvo engano, o próprio decreto citado não conceitua ""sociobiodiversidade"", nem mesmo utiliza o termo. Desse modo, sugiro incluir a categoria de ""agricultores familiares"" no rol de segmentos que compõem a sociobiodiversidade. Existe sólida literatura acadêmica indicando esse pertencimento da agricultura familiar ao quadro da sociobiodiversidade e a legislação citada como referência do conceito apresentado não respalda a exclusão.";42607;GLOSSÁRIO PNDBio...;Inserir texto;Médio;;Validação;De fácil implementação, mas não temos conhecimento do impacto da inserção de uma nova categoria nesse contexto;;
05/09/2025 10:54;Individual;Pessoa Física;Diego Corrêa Furtado;1586737;"É muito importante citar a LEI Nº 14.119, DE 13 DE JANEIRO DE 2021 como referência para o conceito de ""serviços ecossistêmicos"", nos termos do Art. 2º, inciso II.";42608;GLOSSÁRIO PNDBio...;Inserir texto;Baixo;;Considerar;Fácil implementação;;
06/09/2025 13:06;Individual;Pessoa Física;PEDRO;1643485;Incluir definições de serviços ambientais e serviços ecossistêmicos (Lei 14.119/2021 - sugiro Tese da Dra Thaísa em https://tede.ufam.edu.br/handle/tede/6072), explicitar os 28 segmentos de PCTs, e reconhecer agricultores familiares no conceito operativo de sociobiodiversidade.;42622;GLOSSÁRIO PNDBio...;Inserir texto;Baixo;;Validação;De fácil implementação, mas não temos conhecimento do impacto da inserção de uma nova categoria nesse contexto;;
05/09/2025 10:33;Individual;Pessoa Física;Diego Corrêa Furtado;1586737;"Complementar ""espécies da sociobiodiversidade"" como ""espécies da sociobiodiversidade nativa"". O termo ""patrimônio genético nacional"", no fim da frase, se inclui em uma lista de alternativas de incentivo e não delimita adequadamente a origem nacional das ""espécies da sociobiodiversidade"" mencionadas na primeira parte da ação.";42606;Ação Estratégica 5: Fomentar ca...;Alterar texto;Baixo;;Considerar;Pertinente e de fácil implementação;;
06/09/2025 13:03;Individual;Pessoa Física;PEDRO;1643485;Priorizar a integração de bases existentes organizadas por ICTs públicas e organizações da sociedade civil (vide Rede RHISA, Conexsus, IEMA), com indicadores de gênero/juventude e filtros por associações e cooperativas.;42621;Ação Estratégica 4: Disponibili...;NDA;Baixo;;Validação;;;
08/09/2025 08:42;Individual;Pessoa Física;HENRIQUE;1643611;As chamadas de apoio a pesquisa desenvolvimento e inovação podem conter critério / diretrizes que valorizem aqueles projetos de ICTs e empresas que estejam em parceria com as cooperativas participantes dos elos iniciais das cadeias da bioeconomia.;42628;Ação Estratégica 10: Apoiar coo...;Inserir texto;Médio;;Considerar parcialmente;Sugere-se a consideração desse ponto, mas com restrições d epontuação adicional, visando equilíbrio entre diversos elos;;`;
        
        console.log('Processando dados CSV...');
        allData = processData(csvText);
        console.log(`${allData.length} registros processados`);
        
        if (allData.length === 0) {
            throw new Error('Nenhum dado válido encontrado no CSV');
        }
        
        weeklyData = getWeeklyData(allData);
        console.log(`${weeklyData.length} registros da última semana`);
        
        // Atualizar estatísticas
        updateStats(allData, weeklyData);
        
        // Criar gráficos - Dados Acumulados
        createPieChart('sectionsChart', allData, 'secao', 'Contribuições por Seção');
        createPieChart('changesChart', allData, 'mudanca_proposta', 'Tipos de Mudança');
        createTimelineChart('timelineChart', allData, 'Timeline Geral');
        
        // Criar gráficos - Dados Semanais
        createPieChart('weeklySectionsChart', weeklyData, 'secao', 'Seções (Última Semana)');
        createPieChart('weeklyChangesChart', weeklyData, 'mudanca_proposta', 'Mudanças (Última Semana)');
        createTimelineChart('weeklyTimelineChart', weeklyData, 'Timeline Semanal');
        
        console.log('Dashboard carregado com sucesso!');
        
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        
        // Exibir mensagem de erro mais detalhada
        const errorMessage = `Erro: ${error.message}`;
        
        document.querySelectorAll('.highlight').forEach(el => {
            el.textContent = '0';
        });
        
        document.getElementById('most-commented-section').textContent = 'Erro';
        
        document.querySelectorAll('.chart-container').forEach(container => {
            const title = container.querySelector('h3')?.textContent || 'Gráfico';
            container.innerHTML = `
                <h3>${title}</h3>
                <div class="loading">
                    <p style="color: #e74c3c; text-align: center;">${errorMessage}</p>
                </div>
            `;
        });
    }
}

// Função para mostrar loading
function showLoading() {
    document.querySelectorAll('canvas').forEach(canvas => {
        const container = canvas.parentElement;
        const title = container.querySelector('h3')?.textContent || 'Carregando...';
        container.innerHTML = `
            <h3>${title}</h3>
            <div class="loading">
                <div class="spinner"></div>
            </div>
        `;
    });
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado, iniciando dashboard...');
    showLoading();
    setTimeout(loadData, 100); // Pequeno delay para garantir que o DOM está pronto
});

// Atualizar dados a cada 5 minutos
setInterval(loadData, 5 * 60 * 1000);
