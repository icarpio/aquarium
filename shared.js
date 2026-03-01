const API_BASE = 'http://localhost:8000';
const SOURCE   = 'aquarium';

function getToken() { return localStorage.getItem('aq_token'); }
function getUser()  { return JSON.parse(localStorage.getItem('aq_user') || 'null'); }
function setAuth(token, user) {
  localStorage.setItem('aq_token', token);
  localStorage.setItem('aq_user', JSON.stringify(user));
}
function clearAuth() {
  localStorage.removeItem('aq_token');
  localStorage.removeItem('aq_user');
}
function requireAuth() {
  if (!getToken()) { window.location.href = 'index.html'; return false; }
  return true;
}

async function api(path, method = 'GET', body = null, auth = true) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) { const t = getToken(); if (t) headers['Authorization'] = `Token ${t}`; }
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  const res  = await fetch(API_BASE + path, opts);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw { status: res.status, data };
  return data;
}

async function logout() {
  setLoading(true);
  try { await api('/accounts/api/auth/logout/', 'POST'); } catch(e) {}
  clearAuth();
  window.location.href = 'index.html';
}

let toastTimer;
function toast(msg, type = 'info') {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.className = `show ${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.className = ''; }, 3000);
}

function setLoading(on) {
  const el = document.getElementById('loading');
  if (el) el.classList.toggle('on', on);
}

function apiErrorMsg(e) {
  if (e?.data) return Object.values(e.data).flat().join(' · ');
  return 'Error de conexión';
}

function setActiveNav() {
  const page = window.location.pathname.split('/').pop();
  document.querySelectorAll('.nav-link[data-page]').forEach(link => {
    link.classList.toggle('active', link.dataset.page === page);
  });
}

function renderNav() {
  const navEl = document.getElementById('nav');
  if (!navEl) return;
  const user = getUser();

  if (!user) {
    navEl.innerHTML = `
      <a href="index.html" class="nav-logo">
        <span class="nav-logo-dot"></span>Aquarium
      </a>`;
    return;
  }

  navEl.innerHTML = `
    <a href="draw.html" class="nav-logo">
      <span class="nav-logo-dot"></span>Aquarium
    </a>
    <!-- Desktop links -->
    <div class="nav-links">
      <a href="draw.html"     class="nav-link" data-page="draw.html">✦ Crear</a>
      <a href="aquarium.html" class="nav-link" data-page="aquarium.html">◎ Acuario</a>
      <a href="gallery.html"  class="nav-link" data-page="gallery.html">⬡ Galería</a>
      <span class="nav-link" style="cursor:default;border:none;background:none;color:#7eb8d4;">
        ${user.username}
      </span>
      <button onclick="logout()" class="nav-link logout">Salir</button>
    </div>
    <!-- Mobile hamburger -->
    <button class="nav-hamburger" id="navHamburger" onclick="toggleDrawer()" aria-label="Menú">
      <span></span><span></span><span></span>
    </button>`;

  // Inject mobile drawer right after nav
  let drawer = document.getElementById('navDrawer');
  if (!drawer) {
    drawer = document.createElement('div');
    drawer.className = 'nav-drawer';
    drawer.id = 'navDrawer';
    document.body.insertBefore(drawer, document.body.firstChild);
  }
  drawer.innerHTML = `
    <span style="display:block;padding:0.5rem 1rem 0.4rem;font-size:0.72rem;color:#7eb8d4;font-family:var(--font-mono);border-bottom:1px solid rgba(56,189,248,0.08);margin-bottom:0.25rem;">
      ${user.username}
    </span>
    <a href="draw.html"     class="nav-link" data-page="draw.html">✦ Crear</a>
    <a href="aquarium.html" class="nav-link" data-page="aquarium.html">◎ Acuario</a>
    <a href="gallery.html"  class="nav-link" data-page="gallery.html">⬡ Galería</a>
    <button onclick="logout()" class="nav-link logout">Salir</button>`;

  setActiveNav();

  // Close drawer on outside click
  document.addEventListener('click', (e) => {
    const hamburger = document.getElementById('navHamburger');
    const dr = document.getElementById('navDrawer');
    if (dr && !dr.contains(e.target) && hamburger && !hamburger.contains(e.target)) {
      dr.classList.remove('open');
      hamburger.classList.remove('open');
    }
  });
}

function toggleDrawer() {
  const drawer    = document.getElementById('navDrawer');
  const hamburger = document.getElementById('navHamburger');
  if (!drawer) return;
  drawer.classList.toggle('open');
  hamburger.classList.toggle('open');
}