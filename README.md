# Figma Token Inspector

Plugin completo para inspecionar e gerenciar TODOS os tokens no Figma.

## 🎨 Funcionalidades

### Lista todos os tipos de tokens:
- **Figma Styles**: Paint, Text, Effect e Grid Styles
- **Figma Variables**: Cores, números, strings e booleanos com suporte a modos
- **Token Studio**: Detecta e lista automaticamente tokens do plugin Token Studio

### Interface avançada:
- 🔍 **Busca**: Por nome, valor ou descrição
- 🏷️ **Filtros**: Por fonte (Figma/Variables/Studio) e tipo (cor/texto/efeitos)
- 📊 **Estatísticas**: Total de tokens por categoria
- 💾 **Exportação**: JSON estruturado com todos os dados
- 👁️ **Preview visual**: Cores, tipografia e efeitos

## 📦 Instalação

1. **Download do plugin**:
   - Clone este repositório ou baixe os arquivos

2. **No Figma Desktop**:
   - Vá em `Plugins → Development → Import plugin from manifest`
   - Selecione o arquivo `manifest.json`
   - Plugin será adicionado como "Token Inspector - Complete"

3. **Executar**:
   - `Plugins → Development → Token Inspector - Complete`

## 🚀 Como usar

1. **Abra o plugin** no seu arquivo Figma
2. **Clique em "Atualizar"** para carregar todos os tokens
3. **Use os filtros** para navegar pelos tokens:
   - Tabs superiores: Todos, Figma Styles, Variables, Token Studio
   - Chips de filtro: Cor, Tipografia, Efeitos, Grid
4. **Busque** tokens específicos pelo nome ou valor
5. **Exporte** todos os tokens em JSON estruturado

## 📋 Estrutura do Export

```json
{
  "meta": {
    "exportDate": "2024-01-01T00:00:00.000Z",
    "fileName": "Nome do arquivo",
    "totalTokens": 100
  },
  "figmaStyles": [...],
  "figmaVariables": [...],
  "tokenStudio": [...]
}
```

## 🛠️ Desenvolvimento

### Estrutura mínima:
```
figma-token-inspector/
├── manifest.json        # Configuração do plugin
├── code-complete.js     # Código principal
├── ui-complete.html     # Interface do usuário
└── README.md           # Documentação
```

### Tecnologias:
- JavaScript vanilla (compatível com Figma)
- HTML/CSS para interface
- Figma Plugin API

## 📄 Licença

MIT - Veja o arquivo LICENSE para detalhes

## 👨‍💻 Autor

Andrey Andrade

---

**Nota**: Este plugin é independente e não é afiliado ao Figma ou Token Studio.