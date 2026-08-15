# 07 — Cena Hero → Features com vídeo traqueado pelo scroll

Segunda spec sem node-id, pelo mesmo motivo da `06`: o Figma tem um frame estático de 1440px, sem protótipo. Tudo aqui é decisão de implementação.

Antes desta mudança, o Hero e a Features mostravam **a mesma tela do app em dois celulares parados** (`hero/iphone-hero.png` inclinado à direita, `imgs/iphone-section-2.png` reto à esquerda). Duas fotos do mesmo produto, e nada ligando uma seção à outra.

Agora é uma cena só: enquanto o scroll atravessa um trilho de 250vh com o palco preso no topo, o celular viaja da direita para a esquerda, a tela dentro dele é *scrubbada* quadro a quadro por um vídeo, e o texto de "Uifry Premium" sobe no lugar do texto do Hero.

## Divisão de trabalho: o que é vídeo e o que é DOM

A IA gera **apenas o conteúdo da tela**. O deslocamento, a rotação, a escala e a subida do texto são CSS/JS determinísticos.

Isso não foi economia — é o que preserva a fidelidade que as specs `02` e `03` cobram. Um modelo de vídeo não colocaria o celular em `left: -133.155px`; o `getBoundingClientRect()` de aceite abaixo é possível justamente porque a coreografia é código.

Restrições do `google/gemini-omni-flash/image-to-video`, lidas do schema: máximo **8s**, aspect ratio só `16:9` ou `9:16`, saída **opaca** (sem canal alpha), com áudio. ~US$1 por geração.

## A faixa de vídeo dentro do celular

`hero/iphone-hero.png` tem 720×1421 com **a tela rasterizada junto do bezel** — não existe recorte transparente por onde encaixar vídeo por baixo. O vídeo entra por cima, e por isso precisou de medida, não de estimativa.

Método: `ffmpeg` despeja o PNG em RGBA cru e um script varre o buffer procurando (a) corridas de branco puro, que só existem dentro da tela, e (b) blobs escuros no topo. Resultados, em px do PNG:

| | Medida | Como saiu |
|---|---|---|
| tela (x) | `38 → 681` | corrida de branco puro idêntica em 126 linhas |
| tela (y) | `30 → 1387` | primeira/última linha branca em `x=44` e `x=675`, batendo |
| raio do canto | ≈ 90 | ajuste de círculo no perfil de recuo (`inset(d) = R − √(2Rd − d²)`), erro < 2px |
| Dynamic Island | `x 263→456`, `y 49→104` | blob escuro no terço central |
| topo da tab bar | ≈ 1250 | primeira linha do rodapé de navegação |

A faixa de vídeo é o **miolo entre a ilha e a tab bar**: `x 38, y 105, 644×1115`.

Duas consequências boas caíram daí:

- `644 / 1115 = 0.5776`, a **0.02% de 9:16** — o único aspect vertical que o modelo aceita. A referência precisa de apenas 30px de padding branco embaixo, recortados de volta no encode.
- A ilha, a tab bar, o indicador de home e o bezel continuam vindo do PNG. **Chrome de app não deve animar**; só o conteúdo é vídeo, e o vídeo nunca encosta nos cantos arredondados da tela.

O poster (`video/uifry-screen-poster.jpg`) é o recorte exato dessa mesma faixa do PNG, então antes de o MP4 carregar não existe salto nenhum — o que se vê é o pixel que já estava ali.

## Geração

Endpoint `google/gemini-omni-flash/image-to-video`, `aspect_ratio: "9:16"`, `duration: 8`, primeiro quadro = a faixa recortada do próprio PNG (subida para a CDN da fal). Partir do quadro real do app é o que mantém a linguagem visual — cards arredondados, tiles `#EAF2F6`, coral `#FF5555`.

O prompt amarra três beats de ~2.6s às três features de `FEATURES` em `Features.tsx`:

| t | Beat | Feature | O que o take escolhido entregou |
|---|---|---|---|
| 0–2.6s | anel de orçamento até 80%, virando coral, com chip de aviso | Orçamento por período | anel **"80% spent"** + chip **"near limit"** |
| 2.6–5.3s | linhas de transação ganhando etiquetas de categoria | Categorização automática | 4 linhas com tags **food / rent / gas / fun** |
| 5.3–8s | tiles de conta colapsando num saldo único | Todas as contas em um lugar | card **"total balance $4,350.00"** |

O chip "near limit" caiu melhor do que o pedido: o texto da feature fala em *aviso ao chegar em 80% do limite*, não em estouro.

Os rótulos do app continuam em inglês, como no PNG. Trocar para pt-BR só no vídeo criaria uma troca de idioma visível no primeiro quadro, já que a faixa nasce do próprio PNG.

### O que precisou estar explícito no prompt

Quatro gerações até fechar (~US$4). Cada rodada corrigiu um modo de falha específico, e vale registrar porque nenhum era óbvio de antemão:

1. **Códigos hex viram texto na tela.** Escrever `#EAF2F6` e `#FF5555` no prompt fez o modelo *desenhar as strings* — "#EAF2F6" no meio do anel, "AFF5555" no chip. Cores precisam ser descritas por nome ("pale ice-blue", "coral red").
2. **Placeholders inventados.** Sem a regra "toda etiqueta é uma palavra inglesa real, corretamente escrita", saem coisas como "Cansacsion" e "Brapure". Microtexto ilegível é tolerável (no render o celular tem 255–355px de largura), rótulo grande e quebrado não é.
3. **Valores absurdos.** Sem restrição, o saldo final saiu "$158,986,628" num app de finanças pessoais — e é justamente o quadro em que a cena descansa (`p = 1`), o mais visto de todos. A regra que resolveu foi dizer o formato: *"a four-digit number of dollars with cents, for example 4,350.00"*.
4. **Status bar fantasma.** Uma das rodadas desenhou hora/sinal/bateria no topo, duplicando a status bar dentro do nosso celular. Entrou `no status bar` na lista de coisas que não existem no quadro.

Os demais guardrails: câmera **fixa** (sem zoom/pan/rotação), **sem device/moldura/mão**, tudo dentro do enquadramento, e os 4% de baixo sempre brancos — é a área que o encode recorta.

### O fundo não fica branco, e isso se resolve no encode

O modelo **não segura branco puro**, por mais explícita que seja a instrução. Medido amostrando o canto superior esquerdo a cada 1/3s:

| take | fundo |
|---|---|
| 2 | `237,238,242` constante |
| 3 | oscila `244 → 238 → 255` |
| 4 (escolhido) | `247,247,247` constante |

Isso importa porque a faixa encosta no branco liso do PNG em volta da Dynamic Island: 8 níveis de diferença numa área grande viram uma linha reta bem visível.

`normalize` **não** resolve — o modelo desenha cards brancos sobre página cinza, então o quadro já contém `255` e não há o que esticar. O que resolve é fixar o ponto de branco de entrada em `247/255 = 0.96863`:

```
colorlevels=rimin=0:rimax=0.96863:gimin=0:gimax=0.96863:bimin=0:bimax=0.96863
```

O fundo vai para `255`, os cards claros sobem proporcionalmente e continuam se distinguindo. Isso só funciona com um fundo **constante** — foi um critério de escolha do take, não só a qualidade dos beats. (Para o take 2, que puxava para azul, os três canais precisariam de valores diferentes: `0.9294 / 0.9333 / 0.9490`.)

## Encode: todo quadro é keyframe

```bash
ffmpeg -i raw.mp4 -an \
  -vf "colorlevels=rimin=0:rimax=0.96863:gimin=0:gimax=0.96863:bimin=0:bimax=0.96863,\
crop=720:1246:0:0,fps=24" \
  -c:v libx264 -profile:v high -pix_fmt yuv420p \
  -x264-params keyint=1:min-keyint=1:scenecut=0:bframes=0:ref=1 \
  -crf 22 -movflags +faststart \
  public/video/uifry-screen-scroll.mp4
```

- **`keyint=1:min-keyint=1`** é o ponto todo. Sem isso, cada escrita em `currentTime` obriga o browser a decodificar desde o I-frame anterior, e o scrub anda aos solavancos. Com todo quadro sendo keyframe, o seek é O(1).
- **`bframes=0:ref=1`**: com tudo intra, B-frames não teriam o que prever, mas desligá-los explicitamente elimina qualquer reordenação de quadros que atrapalhe o seek.
- **`crop=720:1246`** desfaz o padding branco que a referência precisou para virar 9:16 (`30/1145` da altura, = 34px em 1280), devolvendo a proporção `644:1115` da faixa.
- **`-an`** derruba o áudio que o omni-flash gera junto — inútil aqui e são bytes.
- **Sem `scale`**: fica na resolução nativa de 720×1246, que já é ~2× a largura máxima de render (354.7px). Não havia motivo para reduzir — ver o parágrafo de peso abaixo.

**O peso surpreendeu para baixo.** A expectativa era 20–40 MB e o limite acordado era 8; o resultado foi **2,81 MB**. Todo-keyframe assusta na teoria, mas o conteúdo é UI chapada sobre branco — pouquíssima entropia espacial — então cada quadro intra comprime muito bem. Medições em 540×934: 1,66 MB a CRF 24, 1,26 a CRF 27, 0,97 a CRF 30. Foi essa folga que permitiu ficar na resolução nativa e em CRF 22.

Conferido no arquivo final: **192 quadros, zero com `key_frame=0`**, via
`ffprobe -select_streams v:0 -show_entries frame=key_frame -of csv=p=0`.

## A cena

### Estrutura e os dois modos

```
.scene                       ← as variáveis de progresso moram aqui
  .scene__track              ← 250vh, `position: relative`
    .scene__anchor ×2        ← marcadores de #home / #features
    .scene__stage            ← `sticky top:0`, 100vh, grid centrado
      .scene__box            ← 1090×700, `scale(--scene-fit)`
        .scene__hero         → <Hero />
        .scene__features     → <Features />
        .scene__phone        → <TravelPhone />
```

O **estado padrão do CSS é a página estática de sempre**: `track`, `stage`, `box`, `hero` e `features` são `display: contents` — somem do layout — e `.scene__phone` é `display: none`. Tudo o que a cena acrescenta vive dentro de uma única media query:

```css
@media (min-width: 1024px) and (min-height: 620px) and (prefers-reduced-motion: no-preference)
```

Consequências:

- **Sem JS** o gate `[data-js]` (spec 06) já derruba a cena inteira. Verificado: o HTML do SSR sai sem `data-js`, com os ids nas próprias `<section>`, 27 `data-reveal` e zero `data-revealed`.
- **Movimento reduzido** não é um segundo caminho de código — está na própria condição, então cai no mesmo caminho estático.
- **Abaixo de 1024px** a cena não existe e o vídeo nem é baixado. Todo o trabalho mobile validado nas specs 02 e 03 fica intacto.

`display: contents` foi escolhido em vez de `display: block` sem estilo justamente para que os wrappers não introduzam caixa nenhuma no modo estático — qualquer div a mais mudaria o fluxo que as specs mediram.

### Sistema de coordenadas

A origem da cena é o **canto superior esquerdo do device no estado Hero**. Isso faz as duas seções entrarem na caixa com um simples deslocamento vertical, e **nenhuma coordenada de decorativo precisou ser reescrita**:

```css
.scene__hero     > .scene-section { top: -33.74px; }  /* section-y do device do Hero */
.scene__features > .scene-section { top: -266px;   }  /* 256 (palco) − (−10) */
```

`DECOR`, `STAGE` e as margens das colunas de texto seguem exatamente como as specs 02 e 03 as deixaram. As conversões de percentagem para px estão em `src/lib/scene.ts`, feitas uma vez:

| | Hero | Features |
|---|---|---|
| device left | `524 + .256491×721 = 708.93` | `−133.155 + .325981×724 = 102.86` |
| device top | `−48 + .09042×904 = 33.74` → **0** | `256 + .141919×761 = 364` → **98** |
| device w×h | `354.70 × 700.00` | `255.54 × 504.32` |

O `y = 98` da chegada é o único número que não sai do design: centralizar o celular menor na caixa de 700 (`(700 − 504.32) / 2`) é decisão desta cena, porque o Figma não tem um estado "os dois na mesma altura".

`--scene-fit: clamp(0.7, calc((100vh - 130px) / 700), 1)` encolhe a caixa inteira em telas baixas. Abaixo de 620px de altura a media query nem entra.

### Progresso

Um `requestAnimationFrame` só, ligado e desligado por `IntersectionObserver` sobre o trilho — mesmo padrão throttled do `Navbar.tsx`, nada de rAF rodando a página inteira.

```
p = clamp(−rect.top / (rect.height − innerHeight), 0, 1)
value += (p − value) × 0.12
```

O amortecimento é o que tira o aspecto mecânico de mapear 1:1, e de quebra esconde a latência do seek do vídeo. O valor é escrito com `setProperty` direto no nó, sem estado React: é presentacional, ninguém mais lê, e um re-render por frame seria desperdício (mesma razão registrada na spec 06 para o `data-revealed`).

Cinco fases, todas com *smoothstep* (`t²(3−2t)`) dentro da própria sub-faixa:

| variável | faixa de `p` | o que move |
|---|---|---|
| `--p-phone` | 0.10 – 0.62 | translação, escala, rotação e escala dos anéis |
| `--p-hero` | 0.05 – 0.38 | texto, card preto, estrelas e glow do título saindo |
| `--p-glow` | 0.10 – 0.42 | crossfade dos glows |
| `--p-feat` | 0.45 – 0.88 | coluna de texto da Features subindo |

### O celular

Uma caixa de 354.7×700 (a do estado Hero) movida **só por transform**, então a cena inteira roda no compositor:

- `.scene__phone` — `translate3d` + `scale`, com `transform-origin: 0 0`, que é o ponto cuja trajetória as constantes descrevem.
- `.scene__device` — `rotate(−10deg → 0)` em torno do **centro**, como o `rotate-[-10deg]` do Hero. Rotação e escala precisam de origens diferentes; daí serem dois elementos.
- `.scene__rings` — não giram (no Hero também não giram; só o device gira dentro deles). A escala local vai de `721/724 = 0.9959` a `724/724 ÷ 0.7206 = 1.3878`, porque a proporção anéis/celular é **diferente** nas duas pontas.

O deslocamento entre o centro dos anéis e o centro do device saiu **igual** nos dois estados quando resolvido: `(−1.78, +20.3)` em unidades dos anéis. Por isso ele é aplicado *dentro* de `scale()` no encadeamento `translate(-50%,-50%) scale(s) translate(-1.78px, 20.3px)` — assim acompanha a escala sozinho, e o par anéis+celular fecha nas duas pontas com uma única interpolação.

### O glow viaja junto

Primeira versão deixava o glow do Hero parado e fazia crossfade com o da Features na posição final. Ficava ruim: no meio da travessia o celular está no centro da tela e sobra **uma mancha vermelha sozinha à direita**, onde o celular não está mais.

Agora o glow é filho de `.scene__phone`, em coordenadas locais (`GLOW.local`), e viaja junto. Os valores são os da Features divididos pela escala de chegada, o que faz ele renderizar exatamente na caixa do design em `p = 1`:

```
left = (−21.0 − 236.01) / 0.720552 = −356.68   →   −356.68 × 0.720552 + 102.86 = −154.15 ✓
```

`.scene__phone` recebe `z-index: 0` para ficar **abaixo** das colunas de texto (que já eram `relative z-10` nas duas seções): o glow é luz difusa e não pode lavar o texto do Hero enquanto ele ainda está saindo.

### Âncoras da navbar

Os ids `#home` e `#features` **trocam de dono** conforme o modo, e isso não é firula.

O scroll-spy da navbar (`Navbar.tsx`) usa `rect.top + scrollY − scrollMarginTop`. No modo cena as duas seções estão dentro do palco `sticky`, e aí `rect.top` é **constante** enquanto a cena está presa — as duas ficariam ativas ao mesmo tempo, e "recursos" acenderia junto com "início" no instante em que a cena prende, sem nunca voltar.

Por isso existem dois marcadores de altura zero **no trilho** (que continua rolando normalmente), em `top: 0` e `top: 55%`. O SSR sai com os ids nas seções — é a marcação correta sem JS, e é ela que faz os links funcionarem antes da hidratação; ao entrar no modo cena, um efeito move os ids para os marcadores, e um listener de `matchMedia` desfaz isso no caminho de volta.

### Vídeo

`<video muted playsInline preload="none" disableRemotePlayback>` sem `controls` e sem `autoPlay`. **Este vídeo nunca toca** — o único jeito de ele avançar é alguém escrever `currentTime`.

- Seek só com `readyState >= 2` e quando o delta passa de meio quadro (`1/48`). Buscar de novo o mesmo quadro só ocupa o decodificador.
- A borda de cima da faixa tem uma `mask-image` de 3%. O branco corrigido no encode fecha a emenda em quase todo o clipe, mas um modelo generativo não garante o valor exato quadro a quadro — o degradê é o seguro barato contra isso. Embaixo **não** há máscara de propósito: ali a faixa termina no topo da tab bar do PNG, e borda dura é o que se espera (conteúdo passando por baixo da navegação); suavizar faria a "Transaction" do PNG fantasmar sobre o vídeo.
- **Carregamento adiado, não preguiçoso.** A cena é a primeira coisa da página, então o trilho já está visível no load e não existe "carregar quando chegar perto". O que dá para fazer é sair da frente do primeiro paint: a busca vai para `requestIdleCallback` com `timeout: 2000`, e o poster cobre a faixa até lá.
- **iOS**: um `play().then(pause)` no primeiro `pointerdown` destrava o decodificador — seeks num vídeo que nunca foi tocado simplesmente não pintam por lá.

### `<Reveal>` desligado dentro da cena

`[data-js] .scene [data-reveal]` zera opacidade/transform/transition. O `Reveal` anima no *tempo*, a partir de um `IntersectionObserver`; dentro da cena tudo está preso na tela desde o primeiro quadro, então ele dispararia de uma vez e brigaria com as regras de progresso. Fora do modo cena ele continua sendo a entrada do Hero, intacto.

## Arquivos

| Arquivo | |
|---|---|
| `src/lib/scene.ts` | **novo** — toda a geometria resolvida, com as contas à vista |
| `src/components/sections/ScrollScene.tsx` | **novo**, client — trilho, progresso, âncoras, scrub |
| `src/components/ui/TravelPhone.tsx` | **novo** — glow + anéis + device + vídeo |
| `src/components/sections/Hero.tsx` | `data-section`, classes `scene-*` nos decorativos |
| `src/components/sections/Features.tsx` | `data-section`, `scene-feat-item` com `--i` de cascata |
| `src/app/page.tsx` | Hero e Features viram slots de `<ScrollScene>` |
| `src/app/globals.css` | bloco da cena no fim do arquivo |
| `public/video/uifry-screen-scroll.mp4` | **novo** |
| `public/video/uifry-screen-poster.jpg` | **novo** |

Reaproveitados sem alteração: `Reveal`, `Glow` (as 4 variantes já existiam), `imgs/rings.svg`, `--ease-fluid`.

`imgs/iphone-section-2.png` continua em uso — é o celular da Features no modo estático.

## Checklist de aceite

- [x] `npm run build`, `npx tsc --noEmit` e `npm run lint` sem erros.
- [x] Em `p = 1`, `getBoundingClientRect()` do device dá `102.86, 98, 255.57×504.39` contra os `102.86, 98, 255.54×504.32` do design — **dentro de 0.07px**. É o teste que garante que a cena não quebrou a fidelidade da spec 03.
- [x] Estado `p = 0` idêntico ao Hero de antes: celular inclinado −10°, anéis, card preto, estrelas, glow do título.
- [x] Travessia sem colisão: em `p ≈ 0.4` o texto do Hero já saiu e o da Features ainda não entrou.
- [x] Glow acompanha o celular — sem mancha órfã no meio da travessia.
- [x] MP4 final: **192 quadros, zero não-keyframe**, 720×1246, 24fps, 8s, **2,81 MB** (teto acordado era 8 MB).
- [x] Scrub ligado ao scroll: com `--p = 0.9188`, `video.currentTime = 7.35` — exatamente `0.9188 × 8`.
- [x] Emenda da faixa: em `p = 0` o primeiro quadro do vídeo é indistinguível do PNG embaixo; com a correção de ponto de branco não há degrau visível no resto do clipe.
- [x] Scroll-spy: "recursos" acende na segunda metade do trilho e "início" na primeira.
- [x] Modo estático (`data-js` removido): trilho vira `display: contents`, celular viajante some, os dois estáticos voltam, altura do documento cai de 3901 para 3229, `heroTop = 96` e `phoneTop = 48` — a geometria original.
- [x] HTML do SSR sem `data-js`, ids nas `<section>`, marcadores sem id, sem `src` de vídeo.
- [ ] **Scrub conferido a olho durante o scroll.** A aba do Chrome automation fica em `visibilityState: "hidden"` e o browser congela `requestAnimationFrame` nela — a mesma pendência herdada da spec 06. O loop foi verificado por outros meios (o `--p-phone` avança e o `p` calculado bate com a posição de scroll), mas vale rolar a página manualmente uma vez.
- [ ] Verificação em viewport mobile real (< 1024px) — pendência herdada das specs 02 e 03; o `resize_window` do Chrome automation não respondeu nesta sessão.
- [ ] Teste em Safari/iOS do destravamento por `pointerdown`.
