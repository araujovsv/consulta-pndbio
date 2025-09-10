# Consulta Pública PNDBio - Geochart

Dashboard interativo para acompanhar as contribuições da consulta pública do Plano Nacional de Desenvolvimento da Bioeconomia (PNDBio).

## 📊 Funcionalidades

### Espaço 1: Contribuições Acumuladas
- **Estatísticas gerais**: Total de contribuições, número de participantes únicos e seção mais comentada
- **Gráfico de pizza**: Distribuição das contribuições por seção
- **Gráfico de pizza**: Tipos de mudanças propostas
- **Gráfico de linha**: Timeline completa das contribuições

### Espaço 2: Contribuições da Semana
- **Estatísticas semanais**: Contribuições dos últimos 7 dias
- **Gráficos filtrados**: Mesmos tipos de gráficos, mas apenas com dados da última semana

## 🚀 Como usar

1. Clone ou baixe os arquivos do repositório
2. Certifique-se de que o arquivo `database_dashboard.csv` está na mesma pasta
3. Abra o arquivo `index.html` em um navegador web
4. O dashboard será carregado automaticamente

## 📱 Design Responsivo

- **Desktop**: Layout em duas colunas lado a lado
- **Mobile**: Layout em coluna única, com contribuições acumuladas no topo
- **Adaptação automática**: Interface se ajusta a diferentes tamanhos de tela

## 🔧 Tecnologias Utilizadas

- **HTML5**: Estrutura da página
- **CSS3**: Estilização responsiva com grid e flexbox
- **JavaScript**: Processamento de dados e interatividade
- **Chart.js**: Biblioteca para criação dos gráficos interativos
- **PapaParse**: Parser de arquivos CSV

## 📁 Estrutura do Projeto

```
dashboard/
├── index.html           # Página principal
├── styles.css          # Estilos CSS
├── script.js           # Lógica JavaScript
├── database_dashboard.csv  # Dados das contribuições
└── README.md           # Documentação
```

## 💡 Formato dos Dados

O arquivo CSV deve conter as seguintes colunas:
- `data`: Data e hora da contribuição (DD/MM/AAAA HH:MM)
- `id_autor`: ID único do autor
- `secao`: Seção do documento comentada
- `mudanca_proposta`: Tipo de mudança sugerida

## 🔄 Atualização Automática

O dashboard verifica automaticamente por atualizações nos dados a cada 5 minutos, mantendo as informações sempre atualizadas.

## 🎨 Características Visuais

- **Gradiente moderno**: Design com cores suaves e profissionais
- **Cards interativos**: Efeitos hover e animações suaves
- **Gráficos interativos**: Tooltips informativos ao passar o mouse
- **Tipografia clara**: Fonte system para melhor legibilidade

## 📱 Compatibilidade

- ✅ Chrome, Firefox, Safari, Edge (versões modernas)
- ✅ Dispositivos móveis (iOS, Android)
- ✅ Tablets e desktops

---

Desenvolvido para acompanhar a Consulta Pública do PNDBio
