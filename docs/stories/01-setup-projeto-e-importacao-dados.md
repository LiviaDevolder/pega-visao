# Setup do Projeto e Importação de Dados

## História de Usuário

Como **analista do CompStat Municipal**,
eu quero **ter a infraestrutura técnica preparada e os dados criminais carregados no banco geoespacial**,
para que **eu possa começar a realizar análises de cruzamento geográfico entre ocorrências, denúncias e fatores urbanos**.

## Critérios de Aceitação

- [ ] A aplicação Next.js está acessível em ambiente de desenvolvimento com Chakra UI v3 renderizando corretamente
- [ ] O banco Neon PostgreSQL possui a extensão PostGIS habilitada e acessível via connection string
- [ ] As 6 tabelas do schema estão criadas no banco: `ocorrencias`, `denuncias`, `fatores_urbanos`, `cameras`, `dominios_territoriais` e `areas_fm`
- [ ] Os 115.000 registros de ocorrências foram importados com latitude e longitude preservadas
- [ ] Os 83.500 registros de denúncias foram importados respeitando o encoding ISO-8859-1 e separador ponto-e-vírgula
- [ ] Os 2.085 registros de fatores urbanos foram importados com coordenadas geográficas válidas
- [ ] Os 985 registros de câmeras, 1.628 de domínios territoriais e 22 polígonos FM foram importados com geometrias válidas
- [ ] Índices geoespaciais estão criados em todas as colunas de geometria para otimizar queries espaciais

## Notas

- **Dependências:** Conta Neon PostgreSQL criada, API key da Claude disponível, acesso aos arquivos em `dados/` e `sh_area_forca/`
- **Fora do escopo:** Interface de visualização, validação de qualidade/limpeza dos dados, queries de cruzamento, deploy em produção
- **Contexto:** História enabler que habilita todas as funcionalidades futuras. Next.js App Router. Encoding ISO-8859-1 e separador `;` no `disk_denuncia.csv` requerem tratamento especial na importação.
