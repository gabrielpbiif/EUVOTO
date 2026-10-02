'use strict';
(() => {
  // ================= Configuração =================
  // Modo "card": arte 1100×1600 com círculo transparente para a foto
  const CARD = { W: 1100, H: 1600, circ: { x: 549.5, y: 397, r: 283 } };
  const MODELOS = { vermelho: 'img/vermelho.webp', azul: 'img/azul.webp', amarelo: 'img/amarelo.webp' };
  // Modo "colinha": coordenadas no modelo 1099×1600, imagens em 2x (2198×3200)
  const COL = { W: 1099, H: 1600, S: 2, foto: { x: 155, y: 69, w: 225, h: 225, r: 20 },
                linhaY: i => Math.round(327 + 204.4 * i), linha: { x: 138, w: 824, h: 206 } };
  const FONTE = '"Montserrat", "Archivo", Arial, sans-serif';

  // ================= Estado =================
  let modo = 'card', cor = 'vermelho', comFoto = true;
  
  
  const ajuste = { card: { escala: 1, offX: 0, offY: 0 }, colinha: { escala: 1, offX: 0, offY: 0 } };
  let foto = null, original = null, giro = 0;

  // ================= Elementos =================
  const $ = id => document.getElementById(id);
  const tela = $('tela'), ctx = tela.getContext('2d'), preview = $('preview');
  const inp = $('arquivo'), zoom = $('zoom'), zoomVal = $('zoomVal'), status = $('status');

  const carregar = src => { const im = new Image(); im.onload = () => desenhar(); im.src = src; return im; };
  const cards = {}; for (const [k, s] of Object.entries(MODELOS)) cards[k] = carregar(s);
  const colVazia = carregar('img/colinha-vazia.jpg'), colCheia = carregar('img/colinha-cheia.jpg');
  const ok = im => im && im.complete && im.naturalWidth;

  // ================= Geometria da foto =================
  function alvo(){
    if (modo === 'card'){ const c = CARD.circ; return { cx: c.x, cy: c.y, w: c.r * 2, h: c.r * 2 }; }
    const f = COL.foto; return { cx: f.x + f.w / 2, cy: f.y + f.h / 2, w: f.w, h: f.h };
  }
  function geo(){
    const a = alvo(), st = ajuste[modo];
    const s = Math.max(a.w / foto.width, a.h / foto.height) * st.escala;
    const dw = foto.width * s, dh = foto.height * s;
    const mx = (dw - a.w) / 2, my = (dh - a.h) / 2;
    st.offX = Math.max(-mx, Math.min(mx, st.offX)); st.offY = Math.max(-my, Math.min(my, st.offY));
    return { x: a.cx + st.offX - dw / 2, y: a.cy + st.offY - dh / 2, dw, dh };
  }
  function arred(c, x, y, w, h, r){
    c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  }

  // ================= Desenho =================
  function tamanho(w, h){ if (tela.width !== w || tela.height !== h){ tela.width = w; tela.height = h; } }

  function desenharCard(){
    const { W, H, circ } = CARD;
    tamanho(W, H); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, W, H);
    ctx.save(); ctx.beginPath(); ctx.arc(circ.x, circ.y, circ.r + 3, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = '#ffffff'; ctx.fillRect(circ.x - circ.r - 5, circ.y - circ.r - 5, circ.r * 2 + 10, circ.r * 2 + 10);
    if (foto){ const g = geo(); ctx.imageSmoothingQuality = 'high'; ctx.drawImage(foto, g.x, g.y, g.dw, g.dh); }
    else { ctx.fillStyle = '#c3c8de'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = `800 46px ${FONTE}`; ctx.fillText('SUA FOTO', circ.x, circ.y - 40); }
    ctx.restore();
    if (ok(cards[cor])) ctx.drawImage(cards[cor], 0, 0, W, H);
  }

  function copiarLinha(i){
    const y0 = COL.linhaY(i), L = COL.linha, k = colCheia.naturalWidth / COL.W;
    ctx.drawImage(colCheia, L.x * k, y0 * k, L.w * k, L.h * k, L.x, y0, L.w, L.h);
  }
  function desenharColinha(){
    const { W, H, S } = COL;
    tamanho(W * S, H * S); ctx.setTransform(S, 0, 0, S, 0, 0); ctx.imageSmoothingQuality = 'high';
    ctx.clearRect(0, 0, W, H);
    if (!ok(colVazia) || !ok(colCheia)){ ctx.setTransform(1, 0, 0, 1, 0, 0); return; }
    ctx.drawImage(colVazia, 0, 0, W, H);
    for (let i = 0; i < 6; i++) copiarLinha(i);   // todos fixos: Lindbergh, André, Benedita, Pedro Paulo, Paes, Lula
    if (!comFoto){
      // cabeçalho sem a caixa de foto: desloca o título e recompõe o fundo
      const HY = 313, SH = 150, cab = document.createElement('canvas'); cab.width = W * S; cab.height = HY * S;
      cab.getContext('2d').drawImage(colVazia, 0, 0, W * S, HY * S, 0, 0, W * S, HY * S);
      ctx.fillStyle = 'rgb(20,23,186)'; ctx.fillRect(0, 0, W, HY);
      ctx.drawImage(cab, 400 * S, 0, (W - 400) * S, HY * S, 400 - SH, 0, W - 400, HY);
      ctx.fillStyle = 'rgb(3,5,152)'; ctx.fillRect(W - SH - 2, 0, SH + 2, HY);
    } else if (foto){
      const f = COL.foto, g = geo();
      ctx.save(); arred(ctx, f.x, f.y, f.w, f.h, f.r); ctx.fillStyle = '#fff'; ctx.fill(); ctx.clip();
      ctx.drawImage(foto, g.x, g.y, g.dw, g.dh); ctx.restore();
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  function desenhar(){ modo === 'card' ? desenharCard() : desenharColinha(); }
  if (document.fonts && document.fonts.load) document.fonts.load(`800 46px Montserrat`).then(desenhar).catch(() => {});

  // ================= Abas e opções =================
  function setModo(m){
    modo = m;
    document.querySelectorAll('.aba').forEach(b => b.setAttribute('aria-selected', b.dataset.modo === m));
    document.querySelectorAll('[data-so]').forEach(el => { el.hidden = el.dataset.so !== m; });
    $('blocoFoto').hidden = (m === 'colinha' && !comFoto); $('dica').hidden = true;
    sincZoom(); desenhar();
    status.textContent = m === 'card' ? 'Coloque sua foto e escolha a cor. O card muda na hora.' : 'Coloque sua foto ou escolha "Sem foto" e compartilhe.';
  }
  document.querySelectorAll('.aba').forEach(b => b.addEventListener('click', () => setModo(b.dataset.modo)));

  document.querySelectorAll('.cor').forEach(b => b.addEventListener('click', () => {
    cor = b.dataset.cor; document.querySelectorAll('.cor').forEach(x => x.setAttribute('aria-pressed', x === b)); desenhar();
  }));
  const setFotoCol = v => {
    comFoto = v; $('colComFoto').setAttribute('aria-pressed', v); $('colSemFoto').setAttribute('aria-pressed', !v);
    $('blocoFoto').hidden = !v; $('dica').hidden = true; desenhar();
  };
  $('colComFoto').addEventListener('click', () => setFotoCol(true));
  $('colSemFoto').addEventListener('click', () => setFotoCol(false));

  // ================= Foto =================
  function sincZoom(){ const e = ajuste[modo].escala; zoom.value = Math.round(e * 100); zoomVal.textContent = zoom.value + '%'; }
  const setZoom = v => { ajuste[modo].escala = v; sincZoom(); };
  function aplicarGiro(){
    if (!giro){ foto = original; return; }
    const c = document.createElement('canvas'), vira = giro % 180 !== 0;
    c.width = vira ? original.height : original.width; c.height = vira ? original.width : original.height;
    const g = c.getContext('2d'); g.translate(c.width / 2, c.height / 2); g.rotate(giro * Math.PI / 180);
    g.drawImage(original, -original.width / 2, -original.height / 2); foto = c;
  }
  const zerar = () => { for (const k in ajuste) ajuste[k] = { escala: 1, offX: 0, offY: 0 }; sincZoom(); };

  const aviso = $('avisoFoto');
  function avisoFoto(msg, neutro){ aviso.textContent = msg; aviso.hidden = !msg; aviso.classList.toggle('neutro', !!neutro); }
  inp.addEventListener('click', () => { inp.value = ''; });
  inp.addEventListener('change', e => {
    const f = e.target.files && e.target.files[0]; if (!f) return;
    if (f.type && !/^image\//i.test(f.type)){ avisoFoto('Esse arquivo não é uma foto. Escolha uma imagem da galeria.'); inp.value = ''; return; }
    if (f.size > 25 * 1024 * 1024){ avisoFoto('Foto muito grande (máx. 25 MB). Escolha outra.'); inp.value = ''; return; }
    avisoFoto('Carregando foto…', true);
    const url = URL.createObjectURL(f), img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      if (!img.width || !img.height || img.width * img.height > 60e6){ avisoFoto('Não consegui usar essa foto. Tente outra.'); return; }
      const k = Math.min(1, 2400 / Math.max(img.width, img.height));
      const c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      avisoFoto(''); original = c; giro = 0; aplicarGiro(); zerar();
      preview.classList.add('tem-foto');
      const dc = $('dica'); dc.hidden = false; setTimeout(() => { dc.hidden = true; }, 3500);
      $('ajuste').hidden = false; $('txtFoto').textContent = 'Trocar foto';
      status.textContent = 'Pronto! Agora é só compartilhar.';
      desenhar();
      if (window.innerWidth < 840) preview.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    img.onerror = () => { URL.revokeObjectURL(url); avisoFoto(/hei[cf]/i.test((f.type || '') + (f.name || '')) ? 'Esse celular salvou a foto em HEIC, que o navegador não abre. Tire um print da foto e envie o print.' : 'Não consegui abrir essa foto. Tente outra imagem.'); };
    img.src = url; inp.value = '';
  });
  zoom.addEventListener('input', () => { setZoom(zoom.value / 100); desenhar(); });
  $('girar').addEventListener('click', () => { if (!original) return; giro = (giro + 90) % 360; aplicarGiro(); zerar(); desenhar(); });
  $('centralizar').addEventListener('click', () => { ajuste[modo] = { escala: 1, offX: 0, offY: 0 }; sincZoom(); desenhar(); });

  // arrastar e pinça (em coordenadas do modelo)
  const toques = new Map(); let dist0 = 0;
  const fator = () => (modo === 'card' ? CARD.W : COL.W) / tela.getBoundingClientRect().width;
  const podeMexer = () => foto && (modo === 'card' || comFoto);
  tela.addEventListener('pointerdown', e => {
    if (!podeMexer()) return; $('dica').hidden = true; tela.setPointerCapture(e.pointerId);
    toques.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (toques.size === 2){ const [a, b] = [...toques.values()]; dist0 = Math.hypot(a.x - b.x, a.y - b.y); }
  });
  tela.addEventListener('pointermove', e => {
    if (!podeMexer() || !toques.has(e.pointerId)) return;
    const ant = toques.get(e.pointerId), at = { x: e.clientX, y: e.clientY }; toques.set(e.pointerId, at);
    const st = ajuste[modo];
    if (toques.size === 1){ const k = fator(); st.offX += (at.x - ant.x) * k; st.offY += (at.y - ant.y) * k; }
    else if (toques.size === 2){
      const [a, b] = [...toques.values()], d = Math.hypot(a.x - b.x, a.y - b.y);
      if (dist0) setZoom(Math.max(1, Math.min(3, st.escala * d / dist0))); dist0 = d;
    }
    desenhar();
  });
  const soltar = e => { toques.delete(e.pointerId); if (toques.size < 2) dist0 = 0; };
  tela.addEventListener('pointerup', soltar); tela.addEventListener('pointercancel', soltar);
  tela.addEventListener('wheel', e => {
    if (!podeMexer()) return; e.preventDefault();
    setZoom(Math.max(1, Math.min(3, ajuste[modo].escala * (e.deltaY < 0 ? 1.06 : 0.94)))); desenhar();
  }, { passive: false });

  // ================= Baixar / compartilhar =================
  const nomeArquivo = () => modo === 'card' ? 'eu-voto-andre-13567-lindbergh-1300.jpg' : 'colinha-andre-13567-lindbergh-1300.jpg';
  const pronto = () => {
    if (!foto && (modo === 'card' || comFoto)){
      status.textContent = modo === 'card' ? 'Coloque sua foto no passo 1.' : 'Coloque sua foto no passo 1 ou escolha "Sem foto".';
      return false;
    }
    return true;
  };
  // card sai no tamanho da arte; colinha em 1540×2242 (o WhatsApp recebe como foto, não como documento)
  const gerar = () => new Promise(r => {
    desenhar();
    const [w, h] = modo === 'card' ? [CARD.W, CARD.H] : [1540, 2242];
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d'); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h); g.drawImage(tela, 0, 0, w, h);
    c.toBlob(r, 'image/jpeg', 0.92);
  });

  $('baixar').addEventListener('click', async () => {
    if (!pronto()) return;
    const blob = await gerar();
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = nomeArquivo();
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    status.textContent = 'Imagem salva! No WhatsApp, anexe pela Galeria (não por "Documento") pra ir como foto.';
  });
  const btnZap = $('compartilhar');
  btnZap.addEventListener('click', async () => {
    if (!pronto()) return;
    const blob = await gerar(), arq = new File([blob], nomeArquivo(), { type: 'image/jpeg' });
    try { await navigator.share({ files: [arq] }); status.textContent = 'Enviado! Mande também o link do site pra mais gente montar o seu.'; }
    catch (err){ if (!err || err.name !== 'AbortError') status.textContent = 'Não abriu o compartilhamento. Use "Baixar imagem" e anexe no WhatsApp.'; }
  });
  try {
    const teste = new File([new Blob(['x'], { type: 'image/jpeg' })], 't.jpg', { type: 'image/jpeg' });
    if (navigator.canShare && navigator.canShare({ files: [teste] })) btnZap.hidden = false;
  } catch (e) {}

  // ================= Vídeo com música (30 s) =================
  const JINGLES = { lindbergh: 'audio/lindbergh.mp3', andre: 'audio/andre.mp3' };
  const DUR = 30, VW = 720, VH = 1048, FPS = 30;
  let jingle = 'lindbergh', videoBlob = null, videoExt = 'mp4', gravando = false, saiu = false, trava = null, vcAtual = null, capt = null, recAtual = null, streamAtual = null;
  // se a pessoa sair da tela no meio, o celular congela o desenho: cancela e avisa
  document.addEventListener('visibilitychange', () => { if (gravando && document.hidden) saiu = true; });
  const statusV = $('statusVideo');
  document.querySelectorAll('.jingle').forEach(b => b.addEventListener('click', () => {
    if (gravando) return;
    jingle = b.dataset.j; document.querySelectorAll('.jingle').forEach(x => x.setAttribute('aria-pressed', x === b));
  }));

  const ease = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  // câmera: lista de [tempo, centroX, centroY, zoom] em coordenadas do modelo
  function roteiro(){
    if (modo === 'card'){
      const C = [550, 800], F = [549, 397];
      return [[0, ...F, 2.1], [2.6, ...C, 1], [3.3, 550, 730, 1.1], [4.1, ...C, 1], [5, ...C, 1],
              [9.5, 320, 1180, 1.55], [11.5, ...C, 1], [12.5, ...C, 1], [17, 780, 1180, 1.55], [19, ...C, 1],
              [20, ...C, 1], [24, ...F, 1.55], [26, ...C, 1], [30, ...C, 1.05]];
    }
    const C = [549.5, 800], k = [[0, 267, 181, comFoto ? 2.3 : 1.6], [3, ...C, 1], [3.6, ...C, 1]];
    let t = 3.6;
    for (let i = 0; i < 6; i++){ const y = COL.linhaY(i) + 103; k.push([t + .9, 550, y, 1.22], [t + 3.2, 550, y, 1.28]); t += 3.2; }
    k.push([t + 1.2, ...C, 1], [30, ...C, 1.04]);
    return k;
  }
  function camera(t, k){
    if (t <= k[0][0]) return k[0].slice(1);
    for (let i = 1; i < k.length; i++) if (t <= k[i][0]){
      const [t0, ...a] = k[i - 1], [t1, ...b] = k[i], p = ease((t - t0) / (t1 - t0));
      return a.map((v, j) => v + (b[j] - v) * p);
    }
    return k[k.length - 1].slice(1);
  }
  function quadroVideo(g, src, uW, uH, t, k){
    let [cx, cy, z] = camera(t, k);
    const vw = uW / z, vh = uH / z;
    cx = Math.max(vw / 2, Math.min(uW - vw / 2, cx)); cy = Math.max(vh / 2, Math.min(uH - vh / 2, cy));
    const s = src.width / uW;
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, VW, VH);
    g.drawImage(src, (cx - vw / 2) * s, (cy - vh / 2) * s, vw * s, vh * s, 0, 0, VW, VH);
    if (t < .5){ g.fillStyle = `rgba(255,255,255,${1 - t / .5})`; g.fillRect(0, 0, VW, VH); }   // entrada suave
  }
  function tipoVideo(){
    const op = ['video/mp4;codecs=avc1.42E01E,mp4a.40.2', 'video/mp4;codecs=avc1,mp4a', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'];
    return op.find(t => window.MediaRecorder && MediaRecorder.isTypeSupported(t)) || '';
  }

  const btnGerar = $('gerarVideo'), barra = $('barra');
  btnGerar.addEventListener('click', async () => {
    if (gravando || !pronto()) return;
    if (!window.MediaRecorder || !HTMLCanvasElement.prototype.captureStream){ statusV.textContent = 'Este navegador não grava vídeo. Abra o site no Chrome (Android) ou Safari (iPhone) atualizado, ou use "Baixar imagem".'; return; }
    gravando = true; btnGerar.disabled = true; $('txtVideo').textContent = 'Preparando…';
    $('videoPronto').hidden = true; $('progresso').hidden = false; barra.style.width = '0%';
    let ac;
    try {
      // quadro estático em alta (o mesmo da imagem) e áudio do jingle
      desenhar();
      const src = document.createElement('canvas'); src.width = tela.width; src.height = tela.height; src.getContext('2d').drawImage(tela, 0, 0);
      const [uW, uH] = modo === 'card' ? [CARD.W, CARD.H] : [COL.W, COL.H], k = roteiro();
      ac = new (window.AudioContext || window.webkitAudioContext)();
      const buf = await ac.decodeAudioData(await (await fetch(JINGLES[jingle])).arrayBuffer());
      const vc = document.createElement('canvas'); vc.width = VW; vc.height = VH;
      const g = vc.getContext('2d'); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
      quadroVideo(g, src, uW, uH, 0, k);
      // o canvas da gravação fica visível na prévia (celular não para de gerar quadros de canvas fora da tela)
      vc.className = 'gravacao'; tela.hidden = true; tela.after(vc); vcAtual = vc;
      try { if (navigator.wakeLock) trava = await navigator.wakeLock.request('screen'); } catch (e) {}
      saiu = false;
      const destino = ac.createMediaStreamDestination(), fonte = ac.createBufferSource();
      fonte.buffer = buf; fonte.connect(destino);
      // quadro a quadro: cada desenho vira um quadro do vídeo (requestFrame), senão captura a 30 fps
      // guarda a referência do stream: se o navegador recolher o stream da memória, o vídeo congela (era o travamento no zoom)
      capt = vc.captureStream(0); let vtrack = capt.getVideoTracks()[0];
      if (!vtrack || typeof vtrack.requestFrame !== 'function'){ if (vtrack) vtrack.stop(); capt = vc.captureStream(FPS); vtrack = capt.getVideoTracks()[0]; }
      const empurra = () => { if (vtrack.requestFrame) vtrack.requestFrame(); };
      const stream = new MediaStream([vtrack, ...destino.stream.getAudioTracks()]);
      const tipo = tipoVideo(); videoExt = /mp4/.test(tipo) ? 'mp4' : 'webm';
      streamAtual = stream;
      const rec = recAtual = new MediaRecorder(stream, tipo ? { mimeType: tipo, videoBitsPerSecond: 2_500_000, audioBitsPerSecond: 128_000 } : undefined);
      const partes = []; rec.ondataavailable = e => { if (e.data && e.data.size) partes.push(e.data); };
      const fim = new Promise(r => { rec.onstop = r; });
      $('txtVideo').textContent = 'Gravando… 0%';
      await ac.resume(); rec.start(500);
      const t0 = ac.currentTime; fonte.start();
      let ultimo = -1;
      await new Promise(res => {
        const passo = () => {
          const t = ac.currentTime - t0;
          if (saiu) return res();
          if (t - ultimo >= 1 / FPS - .008 || t >= DUR){ ultimo = t; quadroVideo(g, src, uW, uH, Math.min(t, DUR), k); empurra(); }   // 30 quadros/s mesmo em tela de 120 Hz
          const p = Math.min(100, Math.round(t / DUR * 100)); barra.style.width = p + '%'; $('txtVideo').textContent = `Gravando… ${p}%`;
          if (t >= DUR) return res();
          requestAnimationFrame(passo);
        };
        requestAnimationFrame(passo);
      });
      rec.stop(); await fim; fonte.stop();
      if (saiu) throw new Error('saiu');
      videoBlob = new Blob(partes, { type: (rec.mimeType || tipo || 'video/webm').split(';')[0] });
      $('videoPronto').hidden = false;
      statusV.textContent = videoExt === 'mp4' ? 'Vídeo pronto! Baixe ou mande direto no WhatsApp.'
        : 'Vídeo pronto (formato WebM). Se o WhatsApp não aceitar, use o Chrome atualizado ou mande a imagem.';
    } catch (err){
      statusV.textContent = saiu ? 'A gravação parou porque a tela saiu do site. Toque em gerar de novo e deixe a tela aberta até 100%.'
        : 'Não consegui gravar o vídeo neste aparelho. Tente de novo ou use "Baixar imagem".';
    } finally {
      if (vcAtual){ vcAtual.remove(); vcAtual = null; } tela.hidden = false;
      if (streamAtual) streamAtual.getTracks().forEach(tr => tr.stop()); capt = recAtual = streamAtual = null;
      if (trava){ trava.release().catch(() => {}); trava = null; }
      gravando = false; btnGerar.disabled = false; $('txtVideo').textContent = 'Gerar vídeo de novo';
      if (ac) ac.close().catch(() => {});
    }
  });

  const nomeVideo = () => (modo === 'card' ? 'eu-voto' : 'colinha') + '-' + jingle + '.' + videoExt;
  $('baixarVideo').addEventListener('click', () => {
    if (!videoBlob) return;
    const a = document.createElement('a'); a.href = URL.createObjectURL(videoBlob); a.download = nomeVideo();
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 8000);
    statusV.textContent = 'Vídeo salvo! No WhatsApp, anexe pela Galeria.';
  });
  const btnZapV = $('compartilharVideo');
  btnZapV.addEventListener('click', async () => {
    if (!videoBlob) return;
    const arq = new File([videoBlob], nomeVideo(), { type: videoBlob.type });
    try { await navigator.share({ files: [arq] }); statusV.textContent = 'Vídeo enviado!'; }
    catch (err){ if (!err || err.name !== 'AbortError') statusV.textContent = 'Não abriu o compartilhamento. Use "Baixar vídeo" e anexe no WhatsApp.'; }
  });
  try {
    const tv = new File([new Blob(['x'], { type: 'video/mp4' })], 't.mp4', { type: 'video/mp4' });
    if (navigator.canShare && navigator.canShare({ files: [tv] })) btnZapV.hidden = false;
  } catch (e) {}
  // trocar aba/foto/cor invalida o vídeo já gerado
  const invalidar = () => { if (!gravando){ videoBlob = null; $('videoPronto').hidden = true; } };
  document.querySelectorAll('.aba,.cor,#colComFoto,#colSemFoto,.jingle').forEach(b => b.addEventListener('click', invalidar));
  inp.addEventListener('change', invalidar);

  // ================= Mensagem pronta para mandar =================
  const msgEl = $('mensagem'), btnCopiar = $('copiarMsg');
  btnCopiar.addEventListener('click', async () => {
    const txt = msgEl.innerText.trim() + '\n\nMonte seu card e sua colinha: ' + location.origin;
    try { await navigator.clipboard.writeText(txt); btnCopiar.textContent = 'Mensagem copiada!'; }
    catch (e){
      const r = document.createRange(); r.selectNodeContents(msgEl); const s = getSelection(); s.removeAllRanges(); s.addRange(r);
      btnCopiar.textContent = 'Texto selecionado: copie e cole';
    }
    setTimeout(() => { btnCopiar.textContent = 'Copiar mensagem'; }, 3000);
  });

  setModo('card');
})();
