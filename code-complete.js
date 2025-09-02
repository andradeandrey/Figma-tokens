// Plugin completo para listar TODOS os tokens (Figma nativos + Token Studio)
figma.showUI(__html__, { 
  width: 500, 
  height: 700,
  title: "Token Lister - Complete"
});

// Função para detectar tokens do Token Studio
function detectTokenStudioTokens() {
  console.log('Procurando tokens do Token Studio...');
  const tokens = [];
  
  // Token Studio armazena dados em shared plugin data
  try {
    // Buscar dados do Token Studio (namespace comum)
    const tokenStudioNamespaces = [
      'tokens', // namespace atual
      'figma-tokens', // namespace antigo
      'Token Studio for Figma'
    ];
    
    for (const namespace of tokenStudioNamespaces) {
      try {
        const data = figma.root.getSharedPluginData(namespace, 'values');
        if (data) {
          console.log(`Token Studio data encontrado em ${namespace}`);
          const parsed = JSON.parse(data);
          
          // Processar tokens do Token Studio
          Object.entries(parsed).forEach(([setName, setData]) => {
            if (typeof setData === 'object') {
              processTokenSet(setData, setName, tokens);
            }
          });
        }
      } catch (e) {
        // Namespace não existe ou sem dados
      }
    }
  } catch (e) {
    console.log('Erro ao buscar Token Studio data:', e);
  }
  
  return tokens;
}

// Processar conjunto de tokens recursivamente
function processTokenSet(obj, prefix, tokens, depth = 0) {
  if (depth > 10) return; // Prevenir recursão infinita
  
  Object.entries(obj).forEach(([key, value]) => {
    const fullPath = prefix ? `${prefix}.${key}` : key;
    
    if (value && typeof value === 'object') {
      // Se tem $value ou value, é um token
      if (value.$value !== undefined || value.value !== undefined) {
        const tokenValue = value.$value || value.value;
        const tokenType = value.$type || value.type || detectType(tokenValue);
        
        tokens.push({
          name: fullPath,
          value: formatTokenValue(tokenValue),
          type: tokenType,
          source: 'Token Studio',
          description: value.$description || value.description || ''
        });
      } else {
        // Recursão para objetos aninhados
        processTokenSet(value, fullPath, tokens, depth + 1);
      }
    }
  });
}

// Detectar tipo do token baseado no valor
function detectType(value) {
  if (typeof value === 'string') {
    if (value.startsWith('#') || value.startsWith('rgb')) return 'color';
    if (value.includes('px') || value.includes('rem')) return 'dimension';
    if (value.startsWith('{') && value.endsWith('}')) return 'reference';
  }
  return 'other';
}

// Formatar valor do token para exibição
function formatTokenValue(value) {
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
}

// Coletar TODOS os estilos locais do Figma
function collectAllFigmaStyles() {
  const tokens = [];
  
  // 1. Paint Styles (cores, gradientes)
  try {
    const paintStyles = figma.getLocalPaintStyles();
    console.log(`Paint Styles: ${paintStyles.length}`);
    
    paintStyles.forEach(style => {
      try {
        let value = 'Complex';
        if (style.paints && style.paints.length > 0) {
          const paint = style.paints[0];
          if (paint.type === 'SOLID') {
            const { r, g, b } = paint.color;
            value = '#' + [r, g, b].map(x => {
              const hex = Math.round(x * 255).toString(16);
              return hex.length === 1 ? '0' + hex : hex;
            }).join('').toUpperCase();
          } else if (paint.type === 'GRADIENT_LINEAR') {
            value = 'Linear Gradient';
          } else if (paint.type === 'GRADIENT_RADIAL') {
            value = 'Radial Gradient';
          } else if (paint.type === 'IMAGE') {
            value = 'Image Fill';
          }
        }
        
        tokens.push({
          name: style.name,
          value: value,
          type: 'color',
          source: 'Figma',
          id: style.id,
          description: style.description || '',
          consumers: (style.consumers && style.consumers.length) || 0
        });
      } catch (e) {
        console.error(`Erro em paint style ${style.name}:`, e);
      }
    });
  } catch (e) {
    console.error('Erro ao coletar paint styles:', e);
  }
  
  // 2. Text Styles
  try {
    const textStyles = figma.getLocalTextStyles();
    console.log(`Text Styles: ${textStyles.length}`);
    
    textStyles.forEach(style => {
      try {
        const fontInfo = `${style.fontSize}px / ${style.lineHeight ? style.lineHeight.value + style.lineHeight.unit : 'auto'} / ${style.fontName.family} ${style.fontName.style}`;
        
        tokens.push({
          name: style.name,
          value: fontInfo,
          type: 'typography',
          source: 'Figma',
          id: style.id,
          description: style.description || '',
          consumers: (style.consumers && style.consumers.length) || 0,
          details: {
            fontSize: style.fontSize,
            fontFamily: style.fontName.family,
            fontWeight: style.fontName.style,
            lineHeight: style.lineHeight,
            letterSpacing: style.letterSpacing,
            textCase: style.textCase,
            textDecoration: style.textDecoration
          }
        });
      } catch (e) {
        console.error(`Erro em text style ${style.name}:`, e);
      }
    });
  } catch (e) {
    console.error('Erro ao coletar text styles:', e);
  }
  
  // 3. Effect Styles (sombras, blur)
  try {
    const effectStyles = figma.getLocalEffectStyles();
    console.log(`Effect Styles: ${effectStyles.length}`);
    
    effectStyles.forEach(style => {
      try {
        let value = 'No effects';
        if (style.effects && style.effects.length > 0) {
          const effects = style.effects.map(effect => {
            if (effect.type === 'DROP_SHADOW' || effect.type === 'INNER_SHADOW') {
              return `${effect.type}: ${effect.offset.x}px ${effect.offset.y}px ${effect.radius}px`;
            }
            return effect.type;
          }).join(', ');
          value = effects;
        }
        
        tokens.push({
          name: style.name,
          value: value,
          type: 'effect',
          source: 'Figma',
          id: style.id,
          description: style.description || '',
          consumers: (style.consumers && style.consumers.length) || 0
        });
      } catch (e) {
        console.error(`Erro em effect style ${style.name}:`, e);
      }
    });
  } catch (e) {
    console.error('Erro ao coletar effect styles:', e);
  }
  
  // 4. Grid Styles
  try {
    const gridStyles = figma.getLocalGridStyles();
    console.log(`Grid Styles: ${gridStyles.length}`);
    
    gridStyles.forEach(style => {
      try {
        let value = 'No grids';
        if (style.layoutGrids && style.layoutGrids.length > 0) {
          const grids = style.layoutGrids.map(grid => {
            if (grid.pattern === 'GRID') {
              return `Grid: ${grid.sectionSize}px`;
            } else if (grid.pattern === 'COLUMNS' || grid.pattern === 'ROWS') {
              return `${grid.pattern}: ${grid.count} × ${grid.gutterSize}px`;
            }
            return grid.pattern;
          }).join(', ');
          value = grids;
        }
        
        tokens.push({
          name: style.name,
          value: value,
          type: 'grid',
          source: 'Figma',
          id: style.id,
          description: style.description || '',
          consumers: (style.consumers && style.consumers.length) || 0
        });
      } catch (e) {
        console.error(`Erro em grid style ${style.name}:`, e);
      }
    });
  } catch (e) {
    console.error('Erro ao coletar grid styles:', e);
  }
  
  return tokens;
}

// Coletar variáveis locais (Figma Variables)
function collectFigmaVariables() {
  const tokens = [];
  
  try {
    const collections = figma.variables.getLocalVariableCollections();
    console.log(`Variable Collections: ${collections.length}`);
    
    collections.forEach(collection => {
      const variables = collection.variableIds.map(id => figma.variables.getVariableById(id));
      
      variables.forEach(variable => {
        if (variable) {
          try {
            // Pegar valores para cada modo
            const modes = Object.entries(variable.valuesByMode).map(([modeId, value]) => {
              const mode = collection.modes.find(m => m.modeId === modeId);
              return {
                mode: (mode && mode.name) || 'Default',
                value: formatVariableValue(value)
              };
            });
            
            tokens.push({
              name: variable.name,
              value: (modes[0] && modes[0].value) || 'N/A',
              type: variable.resolvedType,
              source: 'Figma Variables',
              collection: collection.name,
              id: variable.id,
              description: variable.description || '',
              modes: modes,
              scopes: variable.scopes
            });
          } catch (e) {
            console.error(`Erro em variable ${variable.name}:`, e);
          }
        }
      });
    });
  } catch (e) {
    console.error('Erro ao coletar variables:', e);
  }
  
  return tokens;
}

// Formatar valor de variável
function formatVariableValue(value) {
  if (typeof value === 'object') {
    if (value.r !== undefined && value.g !== undefined && value.b !== undefined) {
      // É uma cor
      const hex = '#' + [value.r, value.g, value.b].map(x => {
        const hex = Math.round(x * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      }).join('').toUpperCase();
      return hex;
    }
    return JSON.stringify(value);
  }
  return String(value);
}

// Handler de mensagens
figma.ui.onmessage = msg => {
  console.log('Mensagem recebida:', msg);
  
  if (msg.type === 'get-all-tokens') {
    console.log('Coletando TODOS os tokens...');
    
    // Coletar de todas as fontes
    const figmaStyles = collectAllFigmaStyles();
    const figmaVariables = collectFigmaVariables();
    const tokenStudioTokens = detectTokenStudioTokens();
    
    // Combinar todos
    const allTokens = [
      ...figmaStyles,
      ...figmaVariables,
      ...tokenStudioTokens
    ];
    
    console.log(`Total de tokens encontrados: ${allTokens.length}`);
    console.log(`- Figma Styles: ${figmaStyles.length}`);
    console.log(`- Figma Variables: ${figmaVariables.length}`);
    console.log(`- Token Studio: ${tokenStudioTokens.length}`);
    
    // Enviar para UI
    figma.ui.postMessage({
      type: 'all-tokens-data',
      tokens: allTokens,
      stats: {
        total: allTokens.length,
        figmaStyles: figmaStyles.length,
        figmaVariables: figmaVariables.length,
        tokenStudio: tokenStudioTokens.length,
        byType: {
          color: allTokens.filter(t => t.type === 'color').length,
          typography: allTokens.filter(t => t.type === 'typography').length,
          effect: allTokens.filter(t => t.type === 'effect').length,
          grid: allTokens.filter(t => t.type === 'grid').length,
          other: allTokens.filter(t => !['color', 'typography', 'effect', 'grid'].includes(t.type)).length
        }
      }
    });
  }
  
  if (msg.type === 'export-all') {
    // Exportar em formato estruturado
    const figmaStyles = collectAllFigmaStyles();
    const figmaVariables = collectFigmaVariables();
    const tokenStudioTokens = detectTokenStudioTokens();
    
    const exportData = {
      meta: {
        exportDate: new Date().toISOString(),
        fileName: figma.root.name,
        totalTokens: figmaStyles.length + figmaVariables.length + tokenStudioTokens.length
      },
      figmaStyles: figmaStyles,
      figmaVariables: figmaVariables,
      tokenStudio: tokenStudioTokens
    };
    
    figma.ui.postMessage({
      type: 'export-data',
      data: JSON.stringify(exportData, null, 2)
    });
  }
};