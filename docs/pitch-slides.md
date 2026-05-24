---
marp: true
theme: default
class: invert
paginate: false
size: 16:9
backgroundColor: '#0a0a0a'
color: '#f5f5f5'
style: |
  section {
    font-family: 'Inter', 'Helvetica Neue', sans-serif;
    padding: 80px;
    justify-content: center;
  }
  h1 { font-size: 3.2em; font-weight: 800; line-height: 1.05; letter-spacing: -0.02em; }
  h2 { font-size: 2em; font-weight: 600; color: #f5f5f5; }
  h3 { font-size: 1.4em; font-weight: 500; color: #a0a0a0; }
  p, li { font-size: 1.6em; line-height: 1.4; }
  strong { color: #FFD700; }
  blockquote {
    border-left: 6px solid #FFD700;
    padding-left: 30px;
    font-style: italic;
    color: #d0d0d0;
    font-size: 1.6em;
  }
  .big { font-size: 8em; font-weight: 900; line-height: 1; letter-spacing: -0.04em; color: #FFD700; }
  .label { font-size: 1.4em; color: #a0a0a0; text-transform: uppercase; letter-spacing: 0.15em; }
  .center { text-align: center; }
  .small { font-size: 1em; color: #888; }
  .url { font-size: 2.2em; color: #FFD700; font-weight: 600; }
  .columns { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; }
  .pill { display: inline-block; padding: 8px 20px; background: #FFD700; color: #0a0a0a; border-radius: 999px; font-size: 0.9em; font-weight: 700; }
  footer { color: #555; font-size: 0.8em; }
---

<!-- _backgroundColor: '#000000' -->
<!-- _paginate: false -->

<div class="center">
<p class="label">CompStat Municipal · Rio de Janeiro</p>
<h1 style="font-size: 5em; margin-top: 60px;">7:00 AM</h1>
<h2 style="margin-top: 20px; color: #888;">Terça-feira.</h2>
</div>

<!--
NARRADOR (voz baixa, devagar):
"Imagina uma terça-feira no Rio. Sete da manhã."
[pausa de 2s antes do próximo slide]
-->

---

<!-- _backgroundColor: '#0a0a0a' -->

<div class="center">
<p class="label">Em cinco arquivos diferentes…</p>
<p class="big" style="margin-top: 40px;">115 mil</p>
<h2 style="color: #f5f5f5; margin-top: 20px;">ocorrências georreferenciadas</h2>
</div>

<!--
"Em um deles, 115 mil ocorrências."
-->

---

<div class="center">
<p class="big">83 mil</p>
<h2 style="color: #f5f5f5; margin-top: 20px;">denúncias anônimas</h2>
<p style="color: #a0a0a0; margin-top: 30px;"><em>que alguém teve coragem de fazer.</em></p>
</div>

<!--
"Em outro, 83 mil denúncias que pessoas anônimas tiveram coragem de fazer."
-->

---

<div class="center">
<p class="big">2 mil</p>
<h2 style="color: #f5f5f5; margin-top: 20px;">fatores urbanos mapeados em campo</h2>
<p style="color: #a0a0a0; margin-top: 30px;"><em>cada ponto é uma esquina mal iluminada,<br>um terreno abandonado, um poste apagado<br>que alguém andou — e teve medo.</em></p>
</div>

<!--
"Num terceiro, dois mil fatores urbanos — cada ponto desses é uma esquina mal iluminada, um terreno abandonado, um poste apagado que alguém andou e teve medo."
-->

---

<!-- _backgroundColor: '#000000' -->

<div class="center">
<p class="label">E ele tem até sexta para responder uma pergunta.</p>
<h1 style="font-size: 4em; margin-top: 60px; color: #FFD700;">
Onde colocar os<br>600 agentes da<br>Força Municipal?
</h1>
</div>

<!--
[pausa]
"Ele tem até sexta para responder uma pergunta. Uma só."
"Onde colocar os 600 agentes da Força Municipal nesta semana?"
[pausa 2s]
"E enquanto ele copia e cola planilha, o relógio anda. E na rua, alguém também está andando."
-->

---

<!-- _backgroundColor: '#0a0a0a' -->

# O dado **existe.**

<h3 style="margin-top: 40px;">Está coletado. Está ali.</h3>
<h3 style="color: #555;">Em silos.</h3>

<div style="margin-top: 60px; display: grid; grid-template-columns: repeat(5, 1fr); gap: 20px; text-align: center;">
<div><p style="font-size: 1.2em; color: #FFD700; font-weight: 700;">.csv</p><p class="small">Ocorrências</p></div>
<div><p style="font-size: 1.2em; color: #FFD700; font-weight: 700;">.csv</p><p class="small">Denúncias</p></div>
<div><p style="font-size: 1.2em; color: #FFD700; font-weight: 700;">.csv</p><p class="small">Fatores urbanos</p></div>
<div><p style="font-size: 1.2em; color: #FFD700; font-weight: 700;">.docx</p><p class="small">RELINTs</p></div>
<div><p style="font-size: 1.2em; color: #FFD700; font-weight: 700;">.shp</p><p class="small">Áreas FM</p></div>
</div>

<!--
"A gente vive numa cidade onde o dado existe. Foi coletado. Está ali. Em cinco bases diferentes."
"Mas o dado está em silos. E o tempo de cruzar silo é tempo que a cidade não tem."
-->

---

<!-- _backgroundColor: '#000000' -->

<div class="center">
<h1 style="color: #FFD700; font-size: 3.5em;">
O gargalo do CompStat<br>não é dado.
</h1>
<h1 style="margin-top: 60px; font-size: 4em;">
É <span style="color: #FFD700;">tempo</span> de<br>interpretar dado.
</h1>
</div>

<!--
"Foi aí que a ficha caiu pra gente."
"O gargalo do CompStat não é tecnologia. Não é dado. É o tempo humano gasto cruzando o que a máquina cruza em segundos."
[pausa]
"Se a gente devolver esse tempo, a inteligência chega antes do crime. Não depois."
-->

---

<!-- _backgroundColor: '#000000' -->

<div class="center">
<img src="../public/logo.svg" alt="Pega Visão" style="width: 600px; filter: brightness(0) invert(1);" />
<h3 style="margin-top: 40px; color: #FFD700;">Inteligência criminal para o CompStat Rio.</h3>
<p style="color: #888; margin-top: 20px;">De <strong style="color: #FFD700;">horas</strong> para <strong style="color: #FFD700;">minutos.</strong></p>
</div>

<!--
"Foi isso que a gente construiu."
[pausa 2s]
"Pega Visão."
-->

---

<!-- _backgroundColor: '#0a0a0a' -->

<div class="center">
<p class="label">A próxima tela é o produto rodando ao vivo.</p>
<h1 style="margin-top: 60px;">Vou agir como o analista do CompStat.</h1>
<h2 style="margin-top: 40px; color: #888;">Não sou desenvolvedor.<br>Não escrevo SQL.</h2>
<p style="margin-top: 60px; font-size: 1.4em; color: #FFD700;"><em>Tudo o que você vai ver é clique.</em></p>
</div>

<!--
[Esse slide é a transição para a demo ao vivo.]
"Deixa eu te mostrar a semana de um analista do CompStat com Pega Visão. E lembra: ele não é desenvolvedor. Não escreve SQL. Tudo o que você vai ver é clique."
[A partir daqui: ALT+TAB para o navegador.]
-->

---

<!-- DEMO AO VIVO — esse slide fica de pano de fundo se precisar voltar -->
<!-- _backgroundColor: '#000000' -->

![bg opacity:.35](../public/pega_visao.png)

<div class="center">
<p class="label" style="color: #FFD700;">⬤ DEMO AO VIVO</p>
<h2 style="margin-top: 40px;">Mapa → Coincidências → IA → RELINT<br>→ Cobertura FM → Plano por Órgão</h2>
</div>

<!--
[Esse slide NUNCA aparece pro júri em modo normal — só é fallback se a demo cair.]
[Operador: ALT+TAB pro navegador AGORA.]
-->

---

<!-- _backgroundColor: '#0a0a0a' -->

<p class="label">Por baixo</p>

# Engenharia que aguenta produção.

<div class="columns" style="margin-top: 60px;">
<div>
<h3 style="color: #FFD700;">① Escala</h3>
<p>PostGIS no Neon — cruzamento geoespacial roda no banco, não no laptop.</p>
</div>
<div>
<h3 style="color: #FFD700;">② Ingestão</h3>
<p>Pipeline idempotente — base nova da semana entra com um comando.</p>
</div>
</div>

<div style="margin-top: 40px; max-width: 50%;">
<h3 style="color: #FFD700;">③ IA auditável</h3>
<p>Toda análise da Claude carrega os IDs dos registros que a fundamentaram.<br><em style="color: #888; font-size: 0.8em;">Sem caixa-preta. Quem decide, assina embaixo.</em></p>
</div>

<!--
"Embaixo disso tudo: Next.js, Claude API, PostGIS no Neon."
"Três coisas que importam pra prefeitura levar isso a sério: escala, ingestão idempotente, e IA rastreável até o registro de origem."
-->

---

<!-- _backgroundColor: '#0a0a0a' -->

<p class="label">Honestidade</p>

# O que está pronto hoje<br>vs. próximos 30 dias.

<div class="columns" style="margin-top: 50px;">
<div>
<h3 style="color: #FFD700;">✅ Hoje</h3>
<ul style="font-size: 1.1em;">
<li>5 fontes integradas</li>
<li>Análise por IA</li>
<li>RELINT em .docx</li>
<li>Cobertura FM</li>
<li>Plano por órgão</li>
<li>Redes sociais</li>
</ul>
<p style="color: #FFD700; margin-top: 30px; font-size: 1.1em;"><em>Rodando com dado real.</em></p>
</div>
<div>
<h3 style="color: #a0a0a0;">⏭️ Próximos 30 dias</h3>
<ul style="font-size: 1.1em;">
<li>Integração ETL CompStat</li>
<li>SSO da prefeitura</li>
<li>Log de auditoria por usuário</li>
</ul>
<p style="color: #888; margin-top: 30px; font-size: 1.1em;"><em>Estrada conhecida.<br>Não é pesquisa — é trabalho.</em></p>
</div>
</div>

<!--
"A gente precisa ser honesto com vocês sobre o que está pronto hoje e o que vem nos próximos 30 dias."
"A gente não veio aqui prometer revolução. A gente veio entregar terça-feira de manhã."
-->

---

<!-- _backgroundColor: '#000000' -->

<div class="center">
<h1 style="font-size: 3.5em;">
Existe um analista no CompStat<br>
<span style="color: #FFD700;">agora,</span><br>
formatando planilha,<br>
que poderia estar<br>
<span style="color: #FFD700;">olhando o Rio.</span>
</h1>
</div>

<!--
[fala devagar, olha pro júri, NÃO pra tela]
"Existe um analista no CompStat agora, formatando planilha, que poderia estar olhando o Rio."
-->

---

<!-- _backgroundColor: '#000000' -->

<div class="center">
<h1 style="font-size: 3em; color: #FFD700;">
O Pega Visão<br>
devolve a terça-feira<br>
pro CompStat.
</h1>
<h2 style="margin-top: 60px; color: #f5f5f5;">
E devolve a semana<br>pra cidade.
</h2>
</div>

<!--
[FRASE FINAL — devagar, com peso]
"O Pega Visão devolve a terça-feira pro CompStat. E devolve a semana pra cidade."
-->

---

<!-- _backgroundColor: '#0a0a0a' -->

<div class="center">
<p class="label">Nossa pergunta pra prefeitura do Rio:</p>
<h1 style="font-size: 4em; margin-top: 60px; color: #FFD700;">
Topam um piloto<br>
de 2 semanas<br>
em 1 das 22 áreas?
</h1>
</div>

<!--
[olha pro centro do júri, não sorri]
"Nossa pergunta pra prefeitura do Rio é direta:"
[pausa]
"Topam um piloto de duas semanas em uma das 22 áreas FM?"
-->

---

<!-- _backgroundColor: '#000000' -->

<div class="center">
<img src="../public/logo.svg" alt="Pega Visão" style="width: 400px; filter: brightness(0) invert(1);" />
<p class="url" style="margin-top: 60px;">pegavisao.xyz</p>
<p style="margin-top: 80px; color: #888; font-size: 1.2em;">
Laíssa Saraiva · Lívia Devolder · Paulo Rosa · Roberta Amaro<br>
<span class="small">Claude Impact Lab Rio · 2026</span>
</p>
<p style="margin-top: 60px; color: #FFD700; font-size: 1.8em;"><em>Obrigado.</em></p>
</div>

<!--
[silêncio de 2s antes de falar]
"pegavisao.xyz está no ar. Pode testar agora."
"Obrigado."
[silêncio. NÃO sorria. Espere as perguntas.]
-->
