# Pendências

Registro do que ficou em aberto durante o trabalho da versão mobile (story 09) e da configuração do banco e da IA.
Atualizado em 26/09/2026.

## 1. Depende de você

### 1.1 Redes Sociais zerada: falta coletar os tweets

**Situação:** a tela mostra 0 menções porque a tabela `social_mentions` está vazia. O código de coleta existe (`src/lib/social/`, rota `POST /api/social`), mas nunca foi executado.

**Falta no `.env.local`:**

| Variável | O que é |
|---|---|
| `APIFY_API_TOKEN` | Token da sua conta no [Apify](https://apify.com). O actor `apidojo~tweet-scraper` raspa o Twitter e é cobrado por uso. |
| `SOCIAL_CRON_SECRET` | Uma senha inventada por você, usada para autorizar a rotina. |

**Como rodar depois de configurar:** com o app no ar, chamar `POST /api/social` com o cabeçalho `Authorization: Bearer <SOCIAL_CRON_SECRET>`. A rotina busca os tweets das áreas, grava em `social_mentions` e classifica com a IA (usa `ANTHROPIC_API_KEY`). A rota tem limite de 60 s (`maxDuration`), então pode ser preciso rodar mais de uma vez.

**Alternativa:** carregar tweets de exemplo marcados como "demonstração", só para a tela funcionar. Não foi feito por serem dados inventados dentro do banco.

**Já feito no código:** a mensagem de tela vazia agora diz "Ainda não há menções coletadas" em vez de "com os filtros aplicados".

### 1.2 Só 8 das 22 áreas FM têm polígono

**Situação:** o shapefile `base_data/sh_area_forca/areas_forca_municipal.shp` traz 8 polígonos (ids 2, 9, 10, 11, 12, 14, 19 e 20 de 22). Os 8 relatórios de exemplo em `base_data/relints/` batem com esses 8. Não dá para gerar os outros 14 a partir dos dados atuais.

**O que fazer:** pedir ao responsável pelo desafio o shapefile completo com as 22 áreas. Quando chegar:
1. Substituir os arquivos em `base_data/sh_area_forca/`.
2. Rodar de novo `python db/import_data.py` (ele recria `areas_fm`).
3. Atualizar as views: `REFRESH MATERIALIZED VIEW area_stats_mv;` e `REFRESH MATERIALIZED VIEW hotspots_mv;`.

**Alternativa opcional:** as câmeras (`cameras_areas_fm.csv`) citam 9 áreas, 2 a mais que o shapefile: "Rua Lauro Müller – Avenida General Severiano – Avenida Venceslau Brás" e "Bangu: Calçadão - Bangu Shopping". Dá para aproximar esses dois polígonos pelo contorno das câmeras, marcados como "aproximada". Não foi feito.

**Já feito no código:** o texto de Cobertura FM e o pedido enviado à IA usam o número real de áreas carregadas, em vez de "22" fixo.


## 2. Acentuação e textos

O varredor de acentos foi **cancelado a pedido** antes de aplicar as correções. Já foram corrigidos os painéis do mapa, as camadas e algumas mensagens. Ainda faltam:

- **`src/components/panels/FatorCard.tsx`:** "Acao sugerida:" deve ser "Ação sugerida:".
- **`src/lib/action-plan-builder.ts`:**
  - Os textos de sugestão estão sem acento ("iluminacao", "intervencao"…).
  - **Bug:** as chaves de busca (`"vegetacao"`, `"iluminacao"`…) são comparadas com o texto do banco, que tem acento ("Vegetação…"). Quase nada casa, e quase todo fator cai na sugestão genérica "Avaliar situacao no local…". A correção é normalizar o texto (tirar acentos e usar minúsculas) antes de comparar.
- **`src/components/map/layers/FatoresUrbanosLayer.tsx`:** as chaves de cor têm o mesmo problema de comparação com o texto acentuado.
- **Mensagens de erro da API** (`src/app/api/**`): "Parametro area_fm_id obrigatorio", "Erro ao gerar relatorio", "Erro ao buscar ocorrencias" etc.
- **Modo demonstração da IA:** `src/lib/ai/demo-fallbacks.ts` (ex.: "A area ... concentra ... ocorrencias criminais ... O delito predominante e ...").
- **Prompts da IA:** `src/lib/ai/prompts/*.ts` (texto corrido; as chaves do JSON não podem mudar).
- **Relatório .docx:** `src/lib/report/relint-template.ts` e `report-generator.ts` ("RELATORIO ANALITICO", "DINAMICA CRIMINAL", "Acao Sugerida"…).
- **Cuidado ao aplicar:** não alterar nomes de variável, colunas e tabelas do banco, chaves de API nem o valor `"pendente de classificacao"` de `social_mentions.status`, que é dado do banco.

## 3. Verificações antes de encerrar a branch

- Rodar `npm run build` completo com as últimas mudanças, numa cópia isolada. O último build limpo foi antes das últimas edições.
- Refazer a checagem mobile (390px) depois da correção do `BottomSheet` (o `position` fixo). Só o desktop foi refeito.
- Medir no celular os itens ajustados no fim e ainda não medidos: botão "Atualizar" de Redes Sociais e select de raio de Coincidências.
- Testar num celular real, não só na emulação do navegador.
- Commitar as alterações restantes na branch `feat/versao-mobile-responsiva` (o primeiro commit foi `bbe0ac2`).

## 4. Melhorias sugeridas (opcionais)

**Feitas em 26/09/2026 (verificadas no navegador):**

- ~~**Coincidências:** clique no hotspot da lista~~. Agora troca para a aba "Mapa" no celular, centraliza no ponto (zoom 16) e o marca com um círculo e um popup.
- ~~**Mapa de calor sem legenda**~~. Legenda no canto inferior esquerdo, com o mesmo gradiente da camada (`HEATMAP_GRADIENT`); some quando a camada é desligada.
- ~~**Toque nas áreas pequenas**~~. Em tela de toque, um toque a até 28px da borda de uma área seleciona essa área (`NearestAreaTap`). No desktop não muda nada.
- ~~**Código morto**~~. `FmSuggestionPanel.tsx` removido.
- ~~**Builds que se corrompem**~~. `next.config.ts` aceita `NEXT_DIST_DIR` (ex.: `.next-teste`), e a pasta está no `.gitignore` (`.next-*/`). Verificado: um build completo nessa pasta não altera a `.next` do servidor que estiver rodando. Uso documentado no README.

**Continua em aberto:**

- **PWA:** instalar na tela inicial, ícone e cache offline. Ficou fora do escopo da story 09 e pode virar uma story própria.
- **Desenvolvimento:** usar `npm run dev` no dia a dia. O `npm run start` só serve o último `npm run build`.
