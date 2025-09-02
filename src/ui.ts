interface Token {
  name: string;
  value: string;
  type: 'color' | 'typography' | 'spacing' | 'radius' | 'shadow' | 'other';
  description?: string;
}

let allTokens: Token[] = [];
let filteredTokens: Token[] = [];

const tokenList = document.getElementById('tokenList') as HTMLDivElement;
const searchInput = document.getElementById('searchInput') as HTMLInputElement;
const filterSelect = document.getElementById('filterSelect') as HTMLSelectElement;
const refreshBtn = document.getElementById('refreshBtn') as HTMLButtonElement;
const exportBtn = document.getElementById('exportBtn') as HTMLButtonElement;
const createSamplesBtn = document.getElementById('createSamplesBtn') as HTMLButtonElement;
const totalCount = document.getElementById('totalCount') as HTMLSpanElement;
const filteredCount = document.getElementById('filteredCount') as HTMLSpanElement;

function renderTokens(tokens: Token[]) {
  if (tokens.length === 0) {
    tokenList.innerHTML = '<div class="empty-state">Nenhum token encontrado</div>';
    return;
  }
  
  tokenList.innerHTML = tokens.map(token => {
    const isColor = token.type === 'color';
    const colorStyle = isColor ? `style="background-color: ${token.value}"` : '';
    const colorClass = isColor ? 'token-color' : '';
    
    return `
      <div class="token-item">
        ${isColor ? `<div class="${colorClass}" ${colorStyle}></div>` : ''}
        <div class="token-info">
          <div class="token-name">${escapeHtml(token.name)}</div>
          <div class="token-value">${escapeHtml(token.value)}</div>
          ${token.description ? `<div class="token-description">${escapeHtml(token.description)}</div>` : ''}
        </div>
        <span class="token-type">${getTypeLabel(token.type)}</span>
      </div>
    `;
  }).join('');
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function getTypeLabel(type: string): string {
  const labels: { [key: string]: string } = {
    'color': 'Cor',
    'typography': 'Tipografia',
    'spacing': 'Espaçamento',
    'radius': 'Raio',
    'shadow': 'Sombra',
    'other': 'Outro'
  };
  return labels[type] || type;
}

function filterTokens() {
  const searchTerm = searchInput.value.toLowerCase();
  const filterType = filterSelect.value;
  
  filteredTokens = allTokens.filter(token => {
    const matchesSearch = token.name.toLowerCase().includes(searchTerm) || 
                          token.value.toLowerCase().includes(searchTerm) ||
                          (token.description && token.description.toLowerCase().includes(searchTerm));
    const matchesFilter = filterType === 'all' || token.type === filterType;
    
    return matchesSearch && matchesFilter;
  });
  
  updateStats();
  renderTokens(filteredTokens);
}

function updateStats() {
  totalCount.textContent = allTokens.length.toString();
  filteredCount.textContent = filteredTokens.length.toString();
}

function loadTokens() {
  console.log('Solicitando tokens...');
  parent.postMessage({ pluginMessage: { type: 'get-tokens' } }, '*');
}

function exportTokens() {
  console.log('Exportando tokens...');
  parent.postMessage({ pluginMessage: { type: 'export-tokens' } }, '*');
}

function createSampleTokens() {
  console.log('Criando tokens de exemplo...');
  parent.postMessage({ pluginMessage: { type: 'create-samples' } }, '*');
}

searchInput.addEventListener('input', filterTokens);
filterSelect.addEventListener('change', filterTokens);
refreshBtn.addEventListener('click', loadTokens);
exportBtn.addEventListener('click', exportTokens);
createSamplesBtn.addEventListener('click', createSampleTokens);

window.onmessage = (event: MessageEvent) => {
  console.log('Mensagem recebida na UI:', event.data);
  const msg = event.data.pluginMessage;
  
  if (msg && msg.type === 'tokens-data') {
    console.log('Tokens recebidos:', msg.tokens);
    allTokens = msg.tokens;
    filteredTokens = allTokens;
    updateStats();
    renderTokens(filteredTokens);
  }
  
  if (msg.type === 'export-data') {
    const blob = new Blob([msg.data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'figma-tokens.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};

loadTokens();