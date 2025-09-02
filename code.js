figma.showUI(__html__, { 
  width: 400, 
  height: 600,
  title: "Token Lister"
});

// Escutar mensagens da UI
figma.ui.onmessage = msg => {
  console.log('Plugin recebeu mensagem:', msg);
  
  if (msg.type === 'get-tokens') {
    console.log('Iniciando coleta de tokens...');
    
    const tokens = [];
    
    // Coletar cores
    try {
      const paintStyles = figma.getLocalPaintStyles();
      console.log('Estilos de cor encontrados:', paintStyles.length);
      
      paintStyles.forEach(style => {
        try {
          if (style.paints && style.paints.length > 0) {
            const paint = style.paints[0];
            if (paint.type === 'SOLID') {
              const { r, g, b } = paint.color;
              const hex = '#' + [r, g, b].map(x => {
                const hex = Math.round(x * 255).toString(16);
                return hex.length === 1 ? '0' + hex : hex;
              }).join('').toUpperCase();
              
              tokens.push({
                name: style.name,
                value: hex,
                type: 'color',
                description: style.description || ''
              });
              console.log(`Cor adicionada: ${style.name} = ${hex}`);
            } else if (paint.type === 'GRADIENT_LINEAR' || paint.type === 'GRADIENT_RADIAL') {
              tokens.push({
                name: style.name,
                value: 'Gradient',
                type: 'color',
                description: style.description || ''
              });
            }
          }
        } catch (e) {
          console.error('Erro ao processar cor:', e);
        }
      });
    } catch (e) {
      console.error('Erro ao coletar cores:', e);
    }
    
    // Coletar textos
    try {
      const textStyles = figma.getLocalTextStyles();
      console.log('Estilos de texto encontrados:', textStyles.length);
      
      textStyles.forEach(style => {
        try {
          const fontInfo = `${style.fontSize}px / ${style.fontName.family} ${style.fontName.style}`;
          tokens.push({
            name: style.name,
            value: fontInfo,
            type: 'typography',
            description: style.description || ''
          });
          console.log(`Texto adicionado: ${style.name} = ${fontInfo}`);
        } catch (e) {
          console.error('Erro ao processar texto:', e);
        }
      });
    } catch (e) {
      console.error('Erro ao coletar textos:', e);
    }
    
    // Se não houver tokens, adicionar alguns de exemplo
    if (tokens.length === 0) {
      console.log('Nenhum token encontrado. Adicionando exemplos...');
      tokens.push(
        { name: 'Primary', value: '#5551FF', type: 'color' },
        { name: 'Secondary', value: '#00C896', type: 'color' },
        { name: 'Heading', value: '32px', type: 'typography' },
        { name: 'Body', value: '16px', type: 'typography' }
      );
    }
    
    console.log('Enviando tokens para UI:', tokens);
    
    // Enviar tokens para a UI
    figma.ui.postMessage({
      type: 'tokens-data',
      tokens: tokens
    });
  }
  
  if (msg.type === 'create-samples') {
    try {
      // Criar cor primária
      const primary = figma.createPaintStyle();
      primary.name = 'Primary Color';
      primary.paints = [{ type: 'SOLID', color: { r: 0.333, g: 0.318, b: 1 } }];
      
      // Criar texto
      const heading = figma.createTextStyle();
      heading.name = 'Heading';
      heading.fontSize = 32;
      heading.fontName = { family: 'Inter', style: 'Bold' };
      
      figma.notify('Tokens de exemplo criados!');
      
      // Recarregar tokens
      setTimeout(() => {
        figma.ui.postMessage({ type: 'reload' });
      }, 500);
      
    } catch (e) {
      console.error('Erro ao criar samples:', e);
      figma.notify('Erro ao criar tokens: ' + e.message);
    }
  }
  
  if (msg.type === 'import-tokens') {
    console.log('Importando tokens do arquivo...');
    const data = msg.data;
    let importedCount = 0;
    let errors = [];
    
    try {
      // Processar tokens de cor
      if (data.color) {
        Object.entries(data.color).forEach(([groupName, group]) => {
          Object.entries(group).forEach(([tokenName, token]) => {
            try {
              const name = `${groupName}/${tokenName}`;
              
              // Verificar formato Design Tokens (W3C)
              const value = token.$value || token.value || token;
              
              if (typeof value === 'string' && value.startsWith('#')) {
                // Converter hex para RGB
                const hex = value.replace('#', '');
                const r = parseInt(hex.substr(0, 2), 16) / 255;
                const g = parseInt(hex.substr(2, 2), 16) / 255;
                const b = parseInt(hex.substr(4, 2), 16) / 255;
                
                // Criar ou atualizar estilo de cor
                let paintStyle = figma.getLocalPaintStyles().find(s => s.name === name);
                if (!paintStyle) {
                  paintStyle = figma.createPaintStyle();
                  paintStyle.name = name;
                }
                paintStyle.paints = [{ type: 'SOLID', color: { r, g, b } }];
                paintStyle.description = token.$description || '';
                
                importedCount++;
                console.log(`Cor importada: ${name} = ${value}`);
              }
            } catch (e) {
              errors.push(`Erro em ${groupName}/${tokenName}: ${e.message}`);
            }
          });
        });
      }
      
      // Notificar resultado
      if (importedCount > 0) {
        figma.notify(`✅ ${importedCount} tokens importados com sucesso!`);
      }
      
      if (errors.length > 0) {
        console.error('Erros na importação:', errors);
      }
      
      // Recarregar lista de tokens
      setTimeout(() => {
        figma.ui.postMessage({ type: 'reload' });
      }, 500);
      
    } catch (e) {
      console.error('Erro geral na importação:', e);
      figma.notify('❌ Erro ao importar tokens: ' + e.message);
    }
  }
};