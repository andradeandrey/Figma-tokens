figma.showUI(__html__, { 
  width: 400, 
  height: 600,
  title: "Token Lister"
});

interface Token {
  name: string;
  value: string;
  type: 'color' | 'typography' | 'spacing' | 'radius' | 'shadow' | 'other';
  description?: string;
}

const collectColorTokens = (): Token[] => {
  const tokens: Token[] = [];
  try {
    const paintStyles = figma.getLocalPaintStyles();
    console.log(`Encontrados ${paintStyles.length} estilos de cor`);
    
    paintStyles.forEach(style => {
      try {
        const paint = style.paints[0];
        if (paint && paint.type === 'SOLID') {
          const solidPaint = paint as SolidPaint;
          const { r, g, b } = solidPaint.color;
          const hex = '#' + [r, g, b].map(x => {
            const hex = Math.round(x * 255).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
          }).join('');
          
          tokens.push({
            name: style.name,
            value: hex,
            type: 'color',
            description: style.description || ''
          });
          console.log(`Token de cor adicionado: ${style.name} = ${hex}`);
        }
      } catch (err) {
        console.error(`Erro ao processar estilo de cor ${style.name}:`, err);
      }
    });
  } catch (err) {
    console.error('Erro ao coletar tokens de cor:', err);
  }
  
  return tokens;
};

const collectTextTokens = (): Token[] => {
  const tokens: Token[] = [];
  try {
    const textStyles = figma.getLocalTextStyles();
    console.log(`Encontrados ${textStyles.length} estilos de texto`);
    
    textStyles.forEach(style => {
      try {
        const value = `${style.fontSize}px / ${style.fontName.family} ${style.fontName.style}`;
        tokens.push({
          name: style.name,
          value: value,
          type: 'typography',
          description: style.description || ''
        });
        console.log(`Token de texto adicionado: ${style.name}`);
      } catch (err) {
        console.error(`Erro ao processar estilo de texto ${style.name}:`, err);
      }
    });
  } catch (err) {
    console.error('Erro ao coletar tokens de texto:', err);
  }
  
  return tokens;
};

const collectEffectTokens = (): Token[] => {
  const tokens: Token[] = [];
  try {
    const effectStyles = figma.getLocalEffectStyles();
    console.log(`Encontrados ${effectStyles.length} estilos de efeito`);
    
    effectStyles.forEach(style => {
      try {
        const effects = style.effects;
        if (effects.length > 0) {
          const effect = effects[0];
          let value = '';
          
          if (effect.type === 'DROP_SHADOW' || effect.type === 'INNER_SHADOW') {
            value = `${effect.offset.x}px ${effect.offset.y}px ${effect.radius}px`;
          } else {
            value = effect.type;
          }
          
          tokens.push({
            name: style.name,
            value: value,
            type: 'shadow',
            description: style.description || ''
          });
          console.log(`Token de efeito adicionado: ${style.name}`);
        }
      } catch (err) {
        console.error(`Erro ao processar estilo de efeito ${style.name}:`, err);
      }
    });
  } catch (err) {
    console.error('Erro ao coletar tokens de efeito:', err);
  }
  
  return tokens;
};

const collectGridTokens = (): Token[] => {
  const tokens: Token[] = [];
  try {
    const gridStyles = figma.getLocalGridStyles();
    console.log(`Encontrados ${gridStyles.length} estilos de grid`);
    
    gridStyles.forEach(style => {
      try {
        const grids = style.layoutGrids;
        if (grids.length > 0) {
          const grid = grids[0];
          let value = '';
          
          if (grid.pattern === 'GRID') {
            value = `Grid ${grid.sectionSize}px`;
          } else if (grid.pattern === 'COLUMNS' || grid.pattern === 'ROWS') {
            value = `${grid.pattern} - Count: ${grid.count}, Gutter: ${grid.gutterSize}px`;
          }
          
          tokens.push({
            name: style.name,
            value: value,
            type: 'spacing',
            description: style.description || ''
          });
          console.log(`Token de grid adicionado: ${style.name}`);
        }
      } catch (err) {
        console.error(`Erro ao processar estilo de grid ${style.name}:`, err);
      }
    });
  } catch (err) {
    console.error('Erro ao coletar tokens de grid:', err);
  }
  
  return tokens;
};

figma.ui.onmessage = msg => {
  console.log('Mensagem recebida:', msg);
  
  if (msg.type === 'get-tokens') {
    console.log('Coletando tokens...');
    
    const colorTokens = collectColorTokens();
    console.log('Tokens de cor:', colorTokens.length);
    
    const textTokens = collectTextTokens();
    console.log('Tokens de texto:', textTokens.length);
    
    const effectTokens = collectEffectTokens();
    console.log('Tokens de efeito:', effectTokens.length);
    
    const gridTokens = collectGridTokens();
    console.log('Tokens de grid:', gridTokens.length);
    
    const allTokens: Token[] = [
      ...colorTokens,
      ...textTokens,
      ...effectTokens,
      ...gridTokens
    ];
    
    console.log('Total de tokens:', allTokens.length);
    console.log('Tokens:', allTokens);
    
    // Se não houver tokens, adiciona alguns exemplos
    if (allTokens.length === 0) {
      console.log('Nenhum token encontrado. Adicionando tokens de exemplo...');
      allTokens.push(
        { name: 'Primary', value: '#5551FF', type: 'color', description: 'Cor primária' },
        { name: 'Secondary', value: '#00C896', type: 'color', description: 'Cor secundária' },
        { name: 'Heading 1', value: '32px / Inter Bold', type: 'typography', description: 'Título principal' },
        { name: 'Body', value: '16px / Inter Regular', type: 'typography', description: 'Texto do corpo' },
        { name: 'Card Shadow', value: '0px 4px 12px', type: 'shadow', description: 'Sombra de card' },
        { name: 'Grid 8px', value: 'Grid 8px', type: 'spacing', description: 'Grid base' }
      );
    }
    
    figma.ui.postMessage({
      type: 'tokens-data',
      tokens: allTokens
    });
  }
  
  if (msg.type === 'export-tokens') {
    const allTokens: Token[] = [
      ...collectColorTokens(),
      ...collectTextTokens(),
      ...collectEffectTokens(),
      ...collectGridTokens()
    ];
    
    const jsonString = JSON.stringify(allTokens, null, 2);
    
    figma.ui.postMessage({
      type: 'export-data',
      data: jsonString
    });
  }
  
  if (msg.type === 'create-samples') {
    console.log('Criando estilos de exemplo no Figma...');
    
    // Criar estilos de cor
    const primaryColor = figma.createPaintStyle();
    primaryColor.name = 'Primary';
    primaryColor.paints = [{ type: 'SOLID', color: { r: 0.333, g: 0.318, b: 1 } }];
    
    const secondaryColor = figma.createPaintStyle();
    secondaryColor.name = 'Secondary';
    secondaryColor.paints = [{ type: 'SOLID', color: { r: 0, g: 0.784, b: 0.588 } }];
    
    // Criar estilos de texto
    const heading1 = figma.createTextStyle();
    heading1.name = 'Heading 1';
    heading1.fontSize = 32;
    heading1.fontName = { family: 'Inter', style: 'Bold' };
    
    const bodyText = figma.createTextStyle();
    bodyText.name = 'Body';
    bodyText.fontSize = 16;
    bodyText.fontName = { family: 'Inter', style: 'Regular' };
    
    // Criar estilo de efeito
    const cardShadow = figma.createEffectStyle();
    cardShadow.name = 'Card Shadow';
    cardShadow.effects = [{
      type: 'DROP_SHADOW',
      color: { r: 0, g: 0, b: 0, a: 0.1 },
      offset: { x: 0, y: 4 },
      radius: 12,
      visible: true,
      blendMode: 'NORMAL'
    }];
    
    figma.notify('✅ Tokens de exemplo criados com sucesso!');
    
    // Recarregar tokens
    setTimeout(() => {
      figma.ui.postMessage({
        type: 'tokens-data',
        tokens: [
          ...collectColorTokens(),
          ...collectTextTokens(),
          ...collectEffectTokens(),
          ...collectGridTokens()
        ]
      });
    }, 500);
  }
  
  if (msg.type === 'close') {
    figma.closePlugin();
  }
};