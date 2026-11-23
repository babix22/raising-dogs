/* =========================================================
   Raising Dogs — interações
   ========================================================= */

/* ---------- Configuração do formulário ----------
   Para enviar os contactos por email, indique aqui o endpoint:
   - Ficheiro PHP incluído: 'api/contact.php' (servidor com PHP + mail())
   - Ou um serviço externo (ex.: Formspree, Getform, Web3Forms): o URL do formulário
   Enquanto estiver vazio, o envio é simulado (modo demonstração). */
const CONFIG = {
  formEndpoint: '',
};

(() => {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Scroll suave (Lenis) ---------- */
  let lenis = null;
  if (window.Lenis && !reduceMotion) {
    lenis = new window.Lenis({
      lerp: 0.085,          // quanto menor, mais suave
      wheelMultiplier: 0.9,
      anchors: { offset: -70 }, // compensa o header fixo nas ligações internas (#servicos, …)
    });
    const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
  const lockScroll = (lock) => { if (lenis) lock ? lenis.stop() : lenis.start(); };

  /* ---------- Header sticky ---------- */
  const header = $('.site-header');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Menu mobile ---------- */
  const toggle = $('.nav-toggle');
  const nav = $('#menu');
  const setNav = (open) => {
    document.body.classList.toggle('nav-open', open);
    lockScroll(open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    if (open) $('a', nav).focus({ preventScroll: true });
  };
  toggle.addEventListener('click', () => setNav(!document.body.classList.contains('nav-open')));
  $$('a', nav).forEach((a) => a.addEventListener('click', () => setNav(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('nav-open')) { setNav(false); toggle.focus(); }
  });
  window.matchMedia('(min-width: 1024px)').addEventListener('change', (m) => { if (m.matches) setNav(false); });

  /* ---------- Ligação ativa no menu ---------- */
  const navLinks = $$('.main-nav ul a');
  const sections = navLinks.map((a) => $(a.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((a) => a.classList.toggle('is-current', a.getAttribute('href') === '#' + entry.target.id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => spy.observe(s));
  }

  /* ---------- Animações ao scroll ---------- */
  const reveals = $$('.reveal');
  if (!reduceMotion && 'IntersectionObserver' in window) {
    // Pequeno atraso em cascata para elementos irmãos
    reveals.forEach((el) => {
      const siblings = [...el.parentElement.children].filter((c) => c.classList.contains('reveal'));
      const i = siblings.indexOf(el);
      if (i > 0) el.style.setProperty('--d', `${Math.min(i, 5) * 0.08}s`);
    });
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); io.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- Parallax do hero ---------- */
  const hero = $('.hero');
  if (hero && !reduceMotion) {
    let ticking = false;
    const updateHero = () => {
      const p = Math.min(Math.max(window.scrollY / hero.offsetHeight, 0), 1);
      hero.style.setProperty('--p', p.toFixed(4));
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(updateHero); }
    }, { passive: true });
    window.addEventListener('resize', updateHero);
    updateHero();
  }

  /* ---------- Secção "Sobre": linha azul desenha-se com o scroll + parallax ---------- */
  const about = $('.about');
  if (about && !reduceMotion) {
    let tickA = false;
    const drawLine = () => {
      const r = about.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.min(Math.max((vh - r.top) / (r.height + vh * 0.4), 0), 1);
      about.style.setProperty('--draw', p.toFixed(4));
      // parallax: 0 quando o centro da secção está no centro do ecrã
      const ap = Math.min(Math.max((vh / 2 - (r.top + r.height / 2)) / (vh / 2 + r.height / 2), -1), 1);
      about.style.setProperty('--ap', ap.toFixed(4));
      tickA = false;
    };
    window.addEventListener('scroll', () => { if (!tickA) { tickA = true; requestAnimationFrame(drawLine); } }, { passive: true });
    drawLine();
  }

  /* ---------- Linha dos valores (01, 02, 03) desenha-se ao chegar ao bloco ---------- */
  const values = $('.about-values');
  if (values) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      values.classList.add('is-drawn');
    } else {
      const vo = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) { values.classList.add('is-drawn'); vo.disconnect(); }
      }, { threshold: 0.35 });
      vo.observe(values);
    }
  }

  /* ---------- Serviços: bloco fixo que troca de serviço com o scroll ---------- */
  const pin = $('.services-pin');
  if (pin && !reduceMotion) {
    const imgs = $$('.sp-img', pin);
    const panels = $$('.sp-panel', pin);
    const dots = $$('.sp-dot', pin);
    const n = panels.length;
    let current = 0;

    // Pré-carrega e descodifica já todas as imagens, para a transição "cortina" nunca esperar por uma imagem
    imgs.forEach((f) => { const im = $('img', f); if (im) { im.loading = 'eager'; if (im.decode) im.decode().catch(() => {}); } });

    const setActive = (i) => {
      if (i === current) return;
      const down = i > current;
      imgs.forEach((el, k) => {
        el.classList.toggle('is-leaving', k === current);
        el.classList.toggle('from-top', k === i && !down);
        el.classList.toggle('is-active', k === i);
      });
      panels.forEach((el, k) => {
        el.classList.toggle('up', k === current && down);
        el.classList.toggle('is-active', k === i);
        el.setAttribute('aria-hidden', String(k !== i));
      });
      dots.forEach((el, k) => {
        el.classList.toggle('is-active', k === i);
        if (k === i) el.setAttribute('aria-current', 'true'); else el.removeAttribute('aria-current');
      });
      setTimeout(() => imgs.forEach((el, k) => { if (k !== i) el.classList.remove('is-leaving'); }), 1000);
      current = i;
    };

    const onPinScroll = () => {
      const r = pin.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      const p = Math.min(Math.max(-r.top / total, 0), 0.9999);
      setActive(Math.floor(p * n));
    };
    let tickS = false;
    window.addEventListener('scroll', () => { if (!tickS) { tickS = true; requestAnimationFrame(() => { onPinScroll(); tickS = false; }); } }, { passive: true });
    onPinScroll();

    // Leva ao serviço pretendido (bolinhas e ligações com data-svc, ex.: pílula "Novo" do hero)
    const goToService = (i, duration = 1.2) => {
      const top = pin.getBoundingClientRect().top + window.scrollY;
      const step = (pin.offsetHeight - window.innerHeight) / n;
      const target = top + step * i + step * 0.5;
      if (lenis) lenis.scrollTo(target, { duration }); else window.scrollTo({ top: target, behavior: 'smooth' });
    };
    dots.forEach((dot, i) => dot.addEventListener('click', () => goToService(i)));
    $$('[data-svc]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); goToService(Number(a.dataset.svc), 1.8); }));
  }

  /* ---------- Título dos serviços: linhas deslizam em sentidos opostos ---------- */
  const svcHead = $('.svc-head');
  if (svcHead && !reduceMotion) {
    let tickH = false;
    const slide = () => {
      const r = svcHead.getBoundingClientRect();
      const vh = window.innerHeight;
      const sh = Math.min(Math.max((vh / 2 - (r.top + r.height / 2)) / (vh / 2 + r.height / 2), -1), 1);
      svcHead.style.setProperty('--sh', sh.toFixed(4));
      tickH = false;
    };
    window.addEventListener('scroll', () => { if (!tickH) { tickH = true; requestAnimationFrame(slide); } }, { passive: true });
    slide();
  }

  /* ---------- Pet Shop: linha desenhada com o scroll ---------- */
  const draw = $('.shop-draw');
  if (draw) {
    const items = $$('.sd-item', draw);
    const cta = $('.sd-cta');
    let st = null; // estado da versão visível (desktop ou mobile)

    const setup = () => {
      const svg = $$('.sd-path', draw).find((el) => getComputedStyle(el).display !== 'none');
      if (!svg) return;
      const line = $('.sd-line', svg);
      const pen = $('.sd-pen', svg);
      const vb = svg.viewBox.baseVal;
      const len = line.getTotalLength();
      const mobile = svg.classList.contains('sd-path--mob');
      // amostras do caminho para descobrir em que ponto da linha está cada produto
      const N = 1600; const samples = [];
      for (let k = 0; k <= N; k++) { const l = (len * k) / N; const p = line.getPointAtLength(l); samples.push([l, p.x, p.y]); }
      const stopLen = items.map((it) => {
        const x = +it.dataset[mobile ? 'mx' : 'x']; const y = +it.dataset[mobile ? 'my' : 'y'];
        let best = 0; let bd = Infinity;
        samples.forEach(([l, px, py]) => { const d = (px - x) ** 2 + (py - y) ** 2; if (d < bd) { bd = d; best = l; } });
        return { y, l: best };
      });
      // pontos de ancoragem (altura -> comprimento), para os loops se desenharem gradualmente
      const anchors = [{ y: 0, l: 0 }, ...stopLen, { y: vb.height, l: len }];
      line.style.strokeDasharray = `${len} ${len}`;
      st = { svg, line, pen, vb, len, stopLen, anchors };
    };

    const render = () => {
      if (!st) return;
      const { svg, line, pen, vb, len, stopLen, anchors } = st;
      const r = svg.getBoundingClientRect();
      const scale = r.height / vb.height;
      let drawn = len;
      if (!reduceMotion) {
        const ty = (window.innerHeight * 0.62 - r.top) / scale; // a ponta da linha acompanha ~62% do ecrã
        drawn = 0;
        if (ty >= vb.height) drawn = len;
        else if (ty > 0) {
          for (let k = 0; k < anchors.length - 1; k++) {
            const a = anchors[k], b = anchors[k + 1];
            if (ty <= b.y) { drawn = a.l + ((ty - a.y) / (b.y - a.y)) * (b.l - a.l); break; }
          }
        }
      }
      line.style.strokeDashoffset = String(len - drawn);
      const p = line.getPointAtLength(Math.max(drawn, 0.01));
      pen.setAttribute('cx', p.x); pen.setAttribute('cy', p.y);
      pen.style.opacity = drawn > 1 && drawn < len - 1 ? 1 : 0;
      items.forEach((it, k) => it.classList.toggle('is-on', drawn >= stopLen[k].l - 2));
      if (cta) cta.classList.toggle('is-on', drawn >= len - 4);
    };

    setup(); render();
    let tickD = false;
    window.addEventListener('scroll', () => { if (!tickD) { tickD = true; requestAnimationFrame(() => { render(); tickD = false; }); } }, { passive: true });
    window.addEventListener('resize', () => { setup(); render(); });
  }

  /* ---------- Galeria: filtros ---------- */
  const filters = $$('.filter');
  const items = $$('.m-item');
  filters.forEach((btn) => btn.addEventListener('click', () => {
    const f = btn.dataset.filter;
    filters.forEach((b) => { const on = b === btn; b.classList.toggle('is-active', on); b.setAttribute('aria-pressed', String(on)); });
    items.forEach((item) => {
      const show = f === 'all' || item.dataset.cat === f;
      if (show && item.classList.contains('is-hidden')) {
        item.classList.remove('is-hidden');
        item.classList.add('is-entering');
        requestAnimationFrame(() => requestAnimationFrame(() => item.classList.remove('is-entering')));
      } else if (!show) {
        item.classList.add('is-hidden');
      }
    });
    if (typeof galLayout === 'function') {
      galLayout();
      // volta ao início da galeria ao mudar de filtro
      const top = galPin.getBoundingClientRect().top + window.scrollY;
      if (window.scrollY > top) { if (lenis) lenis.scrollTo(top, { immediate: true }); else window.scrollTo(0, top); }
    }
  }));

  /* ---------- Galeria: bloco fixo com deslocamento horizontal ---------- */
  const galPin = $('.gal-pin');
  const galTrack = $('.gal-track');
  const galBar = $('.gal-bar span');
  let galDist = 0;
  const galLayout = () => {
    if (!galPin || reduceMotion) return;
    galDist = Math.max(galTrack.scrollWidth - window.innerWidth, 0);
    galPin.style.height = `${window.innerHeight + galDist}px`;
    galRender();
  };
  const galRender = () => {
    if (!galPin || reduceMotion) return;
    const r = galPin.getBoundingClientRect();
    const p = galDist ? Math.min(Math.max(-r.top / galDist, 0), 1) : 0;
    galTrack.style.transform = `translate3d(${-p * galDist}px, 0, 0)`;
    galBar.style.transform = `scaleX(${p})`;
    // número da imagem que está mais perto do centro do ecrã
    const vis = items.filter((i) => !i.classList.contains('is-hidden'));
    let best = 0; let bd = Infinity;
    vis.forEach((it, k) => { const b = it.getBoundingClientRect(); const d = Math.abs(b.left + b.width / 2 - window.innerWidth / 2); if (d < bd) { bd = d; best = k; } });
  };
  if (galPin && !reduceMotion) {
    let tickG = false;
    window.addEventListener('scroll', () => { if (!tickG) { tickG = true; requestAnimationFrame(() => { galRender(); tickG = false; }); } }, { passive: true });
    window.addEventListener('resize', galLayout);
    window.addEventListener('load', galLayout);
    $$('img', galTrack).forEach((img) => { if (!img.complete) img.addEventListener('load', galLayout, { once: true }); });
    galLayout();
  }

  /* ---------- Galeria: lightbox ---------- */
  const lb = $('#lightbox');
  const lbImg = $('#lb-img');
  const lbCap = $('#lb-caption');
  let current = 0;
  let lastFocus = null;
  const visibleItems = () => items.filter((i) => !i.classList.contains('is-hidden'));

  const show = (index) => {
    const list = visibleItems();
    current = (index + list.length) % list.length;
    const btn = $('.m-btn', list[current]);
    const thumb = $('img', btn);
    lbImg.src = btn.dataset.full;
    lbImg.alt = thumb.alt;
    lbCap.textContent = `${thumb.alt} · ${current + 1}/${list.length}`;
  };
  const openLb = (index) => {
    lastFocus = document.activeElement;
    lb.hidden = false;
    requestAnimationFrame(() => lb.classList.add('is-open'));
    document.body.style.overflow = 'hidden';
    lockScroll(true);
    show(index);
    $('.lb-close', lb).focus();
  };
  const closeLb = () => {
    lb.classList.remove('is-open');
    document.body.style.overflow = '';
    lockScroll(false);
    setTimeout(() => { lb.hidden = true; lbImg.src = ''; }, 250);
    if (lastFocus) lastFocus.focus();
  };

  items.forEach((item) => $('.m-btn', item).addEventListener('click', () => openLb(visibleItems().indexOf(item))));
  $('.lb-close', lb).addEventListener('click', closeLb);
  $('.lb-prev', lb).addEventListener('click', () => show(current - 1));
  $('.lb-next', lb).addEventListener('click', () => show(current + 1));
  lb.addEventListener('click', (e) => { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', (e) => {
    if (lb.hidden) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowRight') show(current + 1);
    if (e.key === 'ArrowLeft') show(current - 1);
    if (e.key === 'Tab') { // manter o foco dentro do lightbox
      const f = $$('button', lb);
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  // Gesto de deslizar em ecrãs táteis
  let touchX = null;
  lb.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
    touchX = null;
  });

  /* ---------- Pré-seleção do serviço a partir dos botões ---------- */
  const select = $('#f-servico');
  $$('[data-service]').forEach((el) => el.addEventListener('click', () => {
    select.value = el.dataset.service;
    validateField(select);
  }));

  /* ---------- Formulário de contacto ---------- */
  const form = $('#contact-form');
  const success = $('#form-success');
  const rules = {
    nome: (v) => (v.trim().length < 2 ? 'Indique o seu nome.' : ''),
    email: (v) => (!v.trim() ? 'Indique o seu email.'
      : !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? 'Indique um email válido (ex.: nome@dominio.pt).' : ''),
    telefone: (v) => (v.trim() && !/^\+?[\d\s()-]{9,16}$/.test(v.trim()) ? 'Indique um número de telefone válido.' : ''),
    servico: (v) => (!v ? 'Selecione o serviço pretendido.' : ''),
    mensagem: (v) => (v.trim().length < 10 ? 'Escreva uma mensagem com pelo menos 10 caracteres.' : ''),
  };

  function validateField(input) {
    const rule = rules[input.name];
    if (!rule) return true;
    const msg = rule(input.value);
    const field = input.closest('.field');
    const err = $(`#e-${input.name}`);
    field.classList.toggle('has-error', !!msg);
    field.classList.toggle('is-valid', !msg && input.value.trim() !== '');
    input.setAttribute('aria-invalid', String(!!msg));
    if (msg) input.setAttribute('aria-describedby', err.id); else input.removeAttribute('aria-describedby');
    err.textContent = msg;
    return !msg;
  }

  Object.keys(rules).forEach((name) => {
    const input = form.elements[name];
    input.addEventListener('blur', () => { if (input.value || input.closest('.field').classList.contains('has-error')) validateField(input); });
    input.addEventListener('input', () => { if (input.closest('.field').classList.contains('has-error')) validateField(input); });
    input.addEventListener('change', () => validateField(input));
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const inputs = Object.keys(rules).map((n) => form.elements[n]);
    const results = inputs.map(validateField);
    const firstInvalid = inputs[results.indexOf(false)];
    if (firstInvalid) { firstInvalid.focus(); return; }
    if (form.elements.website.value) return; // honeypot preenchido: provável spam

    const btn = $('button[type="submit"]', form);
    btn.classList.add('is-loading');
    btn.firstChild.textContent = 'A enviar… ';

    try {
      if (CONFIG.formEndpoint) {
        const res = await fetch(CONFIG.formEndpoint, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: new FormData(form),
        });
        if (!res.ok) throw new Error('Falha no envio');
      } else {
        await new Promise((r) => setTimeout(r, 900)); // modo demonstração
      }
      form.hidden = true;
      success.hidden = false;
      success.focus();
      form.reset();
      $$('.field', form).forEach((f) => f.classList.remove('is-valid', 'has-error'));
    } catch (err) {
      const msgEl = $('#e-mensagem');
      msgEl.textContent = 'Não foi possível enviar a mensagem. Tente novamente ou contacte-nos por telefone.';
    } finally {
      btn.classList.remove('is-loading');
      btn.firstChild.textContent = 'Enviar mensagem ';
    }
  });

  $('#form-reset').addEventListener('click', () => {
    success.hidden = true;
    form.hidden = false;
    form.elements.nome.focus();
  });

  /* ---------- Ano no rodapé ---------- */
  $('#ano').textContent = new Date().getFullYear();
})();
