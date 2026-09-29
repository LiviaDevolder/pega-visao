# Plano de Desenvolvimento: Versão Mobile Responsiva

**Story:** [09-versao-mobile-responsiva](../stories/09-versao-mobile-responsiva.md)
**Estimativa total:** ~33 horas (aprox. 4 a 5 dias de uma pessoa)
**Abordagem:** web responsivo (mesmo app Next.js + Chakra UI v3), com ponto de quebra em `md` (768px). Desktop não muda.

## Diagnóstico do código atual

| Ponto | Onde | Problema no celular |
|---|---|---|
| Sidebar fixa 240px | `components/shell/Sidebar.tsx` | Ocupa ~65% de uma tela de 375px |
| Margem lateral do conteúdo | `components/shell/AppShell.tsx` (`ml={SIDEBAR_WIDTH}`) | Empurra o conteúdo para fora da tela |
| Header com `left: 240px` e 3 selects em linha | `components/shell/Header.tsx` | Filtros não cabem e o header fica fora da tela |
| Altura `calc(100vh - 56px)` | `MapContainer`, `CoberturaFmView`, `CoincidenciasView` e outras 3 views | `100vh` no celular ignora a barra do navegador e corta o conteúdo |
| Painéis flutuantes de 320 a 460px | `AreaAnalysisPanel` (460), `FatoresUrbanosPanel` (420), `AreaFmDetail` (320+), `RiskDetailPanel`, `FmSuggestionPanel` | Cobrem o mapa inteiro e passam da largura da tela |
| Controles sobre o mapa | `MapControls` (canto direito), `MapFilters` (canto esquerdo) | Sobrepõem-se entre si e cobrem o mapa em 375px |
| Coincidências com lista fixa de 400px ao lado | `CoincidenciasView.tsx:102` | Lista + mapa não cabem lado a lado |
| Heatmap dia/hora com colunas de 14px e rótulo de 60px | `HeatmapDiaHora.tsx` | Precisa de rolagem horizontal interna |

Já está correto: o Next.js 15 injeta `<meta name="viewport" content="width=device-width, initial-scale=1">` por padrão, então não é preciso adicioná-lo.

## Tasks

Estimativas em horas, incluindo teste manual da própria task.

### Fase 1 — Fundação

| # | Task | Arquivos | Est. |
|---|---|---|---|
| T1 | Criar utilitários de responsividade: constante do ponto de quebra (`md`), hook `useIsMobile()` e constante `VIEW_HEIGHT` com `100dvh` (fallback `100vh`) para substituir `calc(100vh - 56px)` | `src/lib/responsive.ts` (novo), `src/lib/hooks/useIsMobile.ts` (novo) | 1,5 |
| T2 | Criar componente reutilizável `BottomSheet` (largura total, altura máx. ~85dvh, alça, botão fechar, rolagem interna) que vira painel lateral no desktop | `src/components/ui/BottomSheet.tsx` (novo) | 3 |

### Fase 2 — Shell (navegação e cabeçalho)

| # | Task | Arquivos | Est. |
|---|---|---|---|
| T3 | `AppShell`: remover `ml` e `pt` fixos no mobile; sidebar visível só a partir de `md` | `AppShell.tsx` | 1 |
| T4 | `Sidebar`: extrair a lista de navegação em componente compartilhado e abri-la em uma gaveta (Drawer do Chakra) no celular, fechando ao navegar | `Sidebar.tsx`, novo `NavList` | 3 |
| T5 | `Header`: no mobile, `left: 0`, botão de menu, marca "Pega Visão" e botão "Filtros" que abre os selects em painel; no desktop permanece igual | `Header.tsx` | 4 |
| T6 | Trocar `calc(100vh - 56px)` por `VIEW_HEIGHT` nas 7 ocorrências (mapa e 6 views) | `MapContainer`, `CoberturaFmView`, `CoincidenciasView`, `PlanoAcaoView`, `RedesSociaisView`, `RelintsView` | 1 |

### Fase 3 — Mapa operacional

| # | Task | Arquivos | Est. |
|---|---|---|---|
| T7 | `MapControls` e `MapFilters`: iniciar recolhidos no mobile, reposicionar para não sobrepor (ex.: barra de botões no topo, um aberto por vez) e ajustar `minW`/`maxH` | `MapControls.tsx`, `MapFilters.tsx` | 3 |
| T8 | Migrar os 5 painéis de detalhe para `BottomSheet` no mobile (`AreaFmDetail`, `AreaAnalysisPanel`, `FatoresUrbanosPanel`, `RiskDetailPanel`, `FmSuggestionPanel`), mantendo o layout flutuante atual no desktop | 5 arquivos em `components/panels/` | 6 |
| T9 | Leaflet: chamar `invalidateSize()` ao abrir/fechar painéis e ao rotacionar a tela; conferir controle de zoom, toque em polígonos de área FM e `z-index` do Drawer/BottomSheet sobre os panes do Leaflet | `MapContainer.tsx` | 2 |

### Fase 4 — Demais telas

| # | Task | Arquivos | Est. |
|---|---|---|---|
| T10 | Coincidências: no mobile, alternar entre abas "Lista" e "Mapa" no lugar da lista fixa de 400px | `CoincidenciasView.tsx`, `RiskTop10Panel.tsx` | 4 |
| T11 | Cobertura FM, Plano de Ação, RELINTs e Redes Sociais: cabeçalhos com `wrap`, `px` menor, botões principais em largura total, remoção de `minW` que estoure a largura | 4 arquivos em `components/views/` | 4 |
| T12 | Tabelas e `HeatmapDiaHora`: contêiner com `overflow-x: auto` dentro do componente, sem quebrar a página | `FmAllocationTable.tsx`, `HeatmapDiaHora.tsx`, tabelas de Plano de Ação | 1,5 |
| T13 | Área de toque de 44px em botões, itens do menu e controles do mapa | shell, controles, painéis | 1,5 |

### Fase 5 — Desempenho e validação

| # | Task | Arquivos | Est. |
|---|---|---|---|
| T14 | Medir o mapa no celular com throttling 4G/CPU 4x: peso das respostas (fatores ~545 KB, câmeras ~193 KB) e custo do heatmap com ~114 mil pontos; se travar, limitar pontos por zoom/viewport ou carregar camadas sob demanda | `MapContainer.tsx`, rotas `/api/geo/*` | 3 |
| T15 | QA: emulação em 360, 390 e 768px (Chrome DevTools) e ao menos um celular real; checar as 6 telas, rotação de tela, regressão do desktop em 1280px e `npm run build` | — | 3 |

## Ordem de execução e dependências

```
T1 ─┬─> T3 ─> T4 ─> T5 ─> T6 ─┬─> T7 ─> T8 ─> T9 ─┐
T2 ─┘                         └─> T10 ─> T11 ─> T12 ─> T13 ─> T14 ─> T15
```

- T1 e T2 primeiro: T8 depende do `BottomSheet` (T2) e T6 depende do `VIEW_HEIGHT` (T1)
- T3 a T6 formam o shell e desbloqueiam todo o resto: sem eles nenhuma tela cabe na largura do celular
- T8 é a task maior e mais arriscada, então vale fazê-la logo após o mapa básico ficar utilizável
- Entrega incremental possível: ao terminar a Fase 2, o app já é navegável no celular (ainda com painéis desajustados)

## Riscos

| Risco | Impacto | Mitigação |
|---|---|---|
| Sobreposição de `z-index` entre o Drawer/BottomSheet do Chakra e os panes do Leaflet (a sidebar usa 1100, o Leaflet chega a 1000) | Menu ou painel aparece atrás do mapa | Definir escala única de `z-index` na T1 e testar na T9 |
| Mapa de calor com ~114 mil pontos pesado em celular | Travamento ao abrir o mapa | T14 mede antes de otimizar; opções na própria task |
| Mapa não redesenha ao mudar o tamanho do contêiner | Faixas cinzas ou tiles cortados | `invalidateSize()` na T9 |
| Regressão do desktop ao mexer em componentes compartilhados | Layout atual quebra | Toda mudança condicionada a `base` vs `md`, e checagem em 1280px na T15 |
| CSS do Leaflet carregado do `unpkg.com` | Sem rede para o CDN, o mapa quebra | Fora do escopo agora; considerar servir localmente na story do PWA |

## Definição de pronto

- Todos os critérios de aceitação da story 09 verificados em 360px, 390px e 768px
- Sem rolagem horizontal na página em nenhuma das 6 telas
- Desktop (1280px) idêntico ao comportamento atual
- `npm run build` passa e o app roda com `npm run start`

## Fora do plano (possível story futura)

PWA (manifest, ícones, service worker, instalação na tela inicial), app nativo, modo offline.
