// script.js — PixelGarden core (commit 2)
(() => {
  const GRID_DEFAULT = 16;
  const TICK_MS = 600; // growth tick
  const garden = document.getElementById('garden');

  // state
  let state = {
    size: GRID_DEFAULT,
    tiles: [], // array of {growth: 0-100, planted: bool}
    running: true
  };
  let tickTimer = null;

  // helpers
  const index = (r, c, size) => r * size + c;

  function createGrid(size = GRID_DEFAULT) {
    garden.innerHTML = '';
    garden.style.gridTemplateColumns = `repeat(${size}, var(--tile-size, 28px))`;
    garden.style.gridTemplateRows = `repeat(${size}, var(--tile-size, 28px))`;
    state.size = size;
    state.tiles = new Array(size * size).fill(0).map(() => ({growth: 0, planted: false}));
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const el = document.createElement('button');
        el.className = 'tile';
        el.setAttribute('data-r', r);
        el.setAttribute('data-c', c);
        el.style.width = 'var(--tile-size)';
        el.style.height = 'var(--tile-size)';
        el.style.borderRadius = '6px';
        el.style.border = 'none';
        el.style.cursor = 'pointer';
        el.style.outline = 'none';
        el.style.transition = 'transform 180ms ease, box-shadow 180ms ease';
        el.style.background = 'linear-gradient(180deg,#062022,#052024)';
        el.addEventListener('click', () => togglePlant(r, c));
        garden.appendChild(el);
      }
    }
    renderAll();
  }

  function togglePlant(r, c) {
    const idx = index(r, c, state.size);
    const tile = state.tiles[idx];
    tile.planted = !tile.planted;
    if (tile.planted && tile.growth === 0) tile.growth = 4; // initial sprout
    if (!tile.planted) tile.growth = 0;
    renderTile(idx);
  }

  function renderTile(idx) {
    const el = garden.children[idx];
    const tile = state.tiles[idx];
    if (!el) return;
    const g = tile.growth;
    if (!tile.planted || g <= 0) {
      el.style.background = 'linear-gradient(180deg,#0b1320,#07121a)';
      el.style.boxShadow = 'none';
      el.title = 'empty';
      el.innerText = '';
      el.style.transform = 'scale(1)';
      return;
    }

    // visual mapping: growth 1-30 = sprout, 31-70 = leaf, 71-100 = bloom
    let sizeFactor = 0.9 + (g / 120);
    el.style.transform = `scale(${sizeFactor})`;

    if (g < 30) {
      el.style.background = `linear-gradient(180deg, rgba(90,160,110,0.95), rgba(70,140,100,0.95))`;
      el.style.boxShadow = `0 3px 8px rgba(40,120,80,${g/120})`;
      el.title = `sprout ${Math.round(g)}%`;
      el.innerText = '';
    } else if (g < 70) {
      el.style.background = `linear-gradient(180deg, rgba(100,190,120,0.98), rgba(60,150,90,0.98))`;
      el.style.boxShadow = `0 4px 12px rgba(60,160,100,${g/120})`;
      el.title = `growing ${Math.round(g)}%`;
      el.innerText = '';
    } else {
      // bloom: show a small colored dot (emoji-free)
      el.style.background = `radial-gradient(circle at 50% 40%, rgba(255,215,145,${g/120}), rgba(70,200,120,0.95))`;
      el.style.boxShadow = `0 6px 18px rgba(80,200,140,${g/120})`;
      el.title = `bloom ${Math.round(g)}% — click to harvest`;
      el.innerText = '✿';
      el.style.fontSize = '14px';
      el.style.lineHeight = 'var(--tile-size)';
    }
  }

  function renderAll() {
    for (let i = 0; i < state.tiles.length; i++) renderTile(i);
  }

  function tick() {
    for (let i = 0; i < state.tiles.length; i++) {
      const t = state.tiles[i];
      if (t.planted && t.growth < 100) {
        t.growth = Math.min(100, t.growth + (1 + Math.random() * 6));
        if (t.growth > 100) t.growth = 100;
      }
      // automatic harvest when fully grown and clicked will reset; we keep blooming until clicked
    }
    renderAll();
  }

  function startTicker() {
    if (tickTimer) clearInterval(tickTimer);
    tickTimer = setInterval(() => {
      if (state.running) tick();
    }, TICK_MS);
  }

  // basic keyboard toggle: space toggles running
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      state.running = !state.running;
      e.preventDefault();
    }
  });

  // init
  createGrid(GRID_DEFAULT);
  startTicker();

  // expose for debugging in console (will be replaced with UI later)
  window.PixelGarden = {
    state, createGrid, tick, startTicker
  };

})();
