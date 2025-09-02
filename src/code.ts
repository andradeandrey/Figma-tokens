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
  const paintStyles = figma.getLocalPaintStyles();
  
  paintStyles.forEach(style => {
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
        description: style.description
      });
    }
  });
  
  return tokens;
};

const collectTextTokens = (): Token[] => {
  const tokens: Token[] = [];
  const textStyles = figma.getLocalTextStyles();
  
  textStyles.forEach(style => {
    const value = `${style.fontSize}px / ${style.fontName.family} ${style.fontName.style}`;
    tokens.push({
      name: style.name,
      value: value,
      type: 'typography',
      description: style.description
    });
  });
  
  return tokens;
};

const collectEffectTokens = (): Token[] => {
  const tokens: Token[] = [];
  const effectStyles = figma.getLocalEffectStyles();
  
  effectStyles.forEach(style => {
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
        description: style.description
      });
    }
  });
  
  return tokens;
};

const collectGridTokens = (): Token[] => {
  const tokens: Token[] = [];
  const gridStyles = figma.getLocalGridStyles();
  
  gridStyles.forEach(style => {
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
        description: style.description
      });
    }
  });
  
  return tokens;
};

figma.ui.onmessage = msg => {
  if (msg.type === 'get-tokens') {
    const allTokens: Token[] = [
      ...collectColorTokens(),
      ...collectTextTokens(),
      ...collectEffectTokens(),
      ...collectGridTokens()
    ];
    
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
  
  if (msg.type === 'close') {
    figma.closePlugin();
  }
};