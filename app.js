// ═══════════════════════════════════════════════════════════
// SIMATA — Main Application Logic
// Data cuaca: Open-Meteo API (real, gratis, tanpa API key)
// Data sumur: Crowdsourced pelaporan warga SIMATA
// ═══════════════════════════════════════════════════════════
'use strict';

// ── State ──────────────────────────────────────────────────
let currentPage = 'beranda';
let heroMapObj = null, mainMapObj = null, formMapObj = null;
let trendChartObj = null, donutChartObj = null, rainChartObj = null;
let allMarkers = [];
let formMarker = null;
let formStep = 1;

// ── Dropdown Nav ───────────────────────────────────────────
function toggleDropdown(forceClose) {
  const dd = document.getElementById('navDropdown');
  if (!dd) return;
  if (forceClose === false || dd.classList.contains('open')) {
    dd.classList.remove('open');
  } else {
    dd.classList.add('open');
  }
}
document.addEventListener('click', (e) => {
  // Tutup dropdown navigasi jika klik di luar
  if (!e.target.closest('.nav-dropdown-wrapper')) {
    const dd = document.getElementById('navDropdown');
    if (dd) dd.classList.remove('open');
  }
  // Tutup admin menu jika klik di luar
  if (!e.target.closest('.admin-badge')) {
    const am = document.getElementById('adminMenu');
    if (am) am.classList.remove('open');
  }
});

// ── Akun Admin — dari Database ────────────────────────────
// Login sekarang menggunakan DB.users (localStorage database)
// Data akun tersimpan permanen di tb_users

// ── Auth State ─────────────────────────────────────────────
let isLoggedIn = false;
let currentAdmin = null;

function checkLoginState() {
  const saved = sessionStorage.getItem('simata_admin');
  if (saved) {
    try {
      currentAdmin = JSON.parse(saved);
      isLoggedIn   = true;
      applyLoginState();
    } catch(e) {
      sessionStorage.removeItem('simata_admin');
    }
  }
}

function applyLoginState() {
  const badge    = document.getElementById('adminBadge');
  const btnLogin = document.getElementById('btnLoginNav');
  const navDash  = document.getElementById('navDashboardItem');

  if (isLoggedIn && currentAdmin) {
    badge.style.display    = 'flex';
    btnLogin.style.display = 'none';
    navDash.style.display  = 'list-item';
    // Fix: gunakan nama langsung, tanpa split yang bisa undefined
    document.getElementById('adminName').textContent =
      `${currentAdmin.role} · ${currentAdmin.nama}`;
  } else {
    badge.style.display    = 'none';
    btnLogin.style.display = 'inline-flex';
    navDash.style.display  = 'none';
    const am = document.getElementById('adminMenu');
    if (am) am.classList.remove('open');
  }
}

// ── Role-based Dashboard ───────────────────────────────────
const ROLE_CONFIG = {
  DLH: {
    icon: '🌿', color: '#10b981',
    sub:  'Dinas Lingkungan Hidup — Akses: Validasi Laporan, Export Data',
    chips: [
      { label: '✅ Validasi Laporan', c: 'rgba(16,185,129,0.15)', fc: '#6ee7b7', bc: 'rgba(16,185,129,0.3)' },
      { label: '⬇️ Export Data',       c: 'rgba(0,180,216,0.12)',  fc: '#67e8f9', bc: 'rgba(0,180,216,0.3)' },
      { label: '📊 Dashboard',          c: 'rgba(0,119,182,0.15)', fc: '#93c5fd', bc: 'rgba(0,119,182,0.3)' },
    ],
    panels: ['panelDLH'],
  },
  BPBD: {
    icon: '🚒', color: '#ef4444',
    sub:  'Badan Penanggulangan Bencana — Akses: Distribusi Air, Kontak Darurat',
    chips: [
      { label: '🚒 Distribusi Air',    c: 'rgba(239,68,68,0.12)', fc: '#fca5a5', bc: 'rgba(239,68,68,0.3)' },
      { label: '📞 Kontak Darurat',    c: 'rgba(245,158,11,0.12)',fc: '#fcd34d', bc: 'rgba(245,158,11,0.3)' },
      { label: '📊 Dashboard',          c: 'rgba(0,119,182,0.15)', fc: '#93c5fd', bc: 'rgba(0,119,182,0.3)' },
    ],
    panels: ['panelBPBD'],
  },
  Superadmin: {
    icon: '⭐', color: '#f59e0b',
    sub:  'Superadmin — Akses Penuh: Semua Fitur + Manajemen Pengguna',
    chips: [
      { label: '⭐ Akses Penuh',        c: 'rgba(245,158,11,0.15)',fc: '#fcd34d', bc: 'rgba(245,158,11,0.3)' },
      { label: '👥 Kelola Pengguna',    c: 'rgba(124,58,237,0.15)',fc: '#c4b5fd', bc: 'rgba(124,58,237,0.3)' },
      { label: '🌿 Panel DLH',          c: 'rgba(16,185,129,0.12)',fc: '#6ee7b7', bc: 'rgba(16,185,129,0.25)' },
      { label: '🚒 Panel BPBD',         c: 'rgba(239,68,68,0.10)', fc: '#fca5a5', bc: 'rgba(239,68,68,0.25)' },
    ],
    panels: ['panelSuperadmin', 'panelDLH', 'panelBPBD'],
  },
};

// ── Tampilkan halaman login jika akses ditolak ────────────
function showAccessDenied() {
  // Sembunyikan semua halaman
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  // Tampilkan overlay akses ditolak di atas halaman login
  const loginSection = document.getElementById('login');
  if (loginSection) loginSection.classList.remove('hidden');

  // Tampilkan pesan error di form login
  setTimeout(() => {
    const errEl = document.getElementById('loginError');
    if (errEl) {
      errEl.textContent = '⛔ Anda harus login sebagai Admin untuk mengakses Dashboard.';
      errEl.style.display = 'block';
    }
  }, 100);

  currentPage = 'login';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function applyRoleDashboard() {
  ['panelDLH','panelBPBD','panelSuperadmin'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  const banner = document.getElementById('roleBanner');
  if (!isLoggedIn || !currentAdmin) {
    if (banner) banner.style.display = 'none';
    return;
  }

  const cfg = ROLE_CONFIG[currentAdmin.role];
  if (!cfg) return;

  banner.style.display = 'flex';
  document.getElementById('roleBannerIcon').textContent  = cfg.icon;
  document.getElementById('roleBannerTitle').textContent = currentAdmin.nama;
  document.getElementById('roleBannerSub').textContent   = cfg.sub;

  const chipTargets = {
    'DLH':        { '✅ Validasi Laporan': 'panelDLH',  '⬇️ Export Data': 'panelDLH', '📊 Dashboard': null },
    'BPBD':       { '🚒 Distribusi Air': 'panelBPBD', '📞 Kontak Darurat': 'panelBPBD', '📊 Dashboard': null },
    'Superadmin': { '⭐ Akses Penuh': null, '👥 Kelola Pengguna': 'panelSuperadmin', '🌿 Panel DLH': 'panelDLH', '🚒 Panel BPBD': 'panelBPBD' },
  };
  const targets = chipTargets[currentAdmin.role] || {};
  const chipsEl = document.getElementById('roleBannerChips');
  chipsEl.innerHTML = cfg.chips.map(c => {
    const target = targets[c.label] || null;
    const onclick = target ? `onclick="document.getElementById('${target}').scrollIntoView({behavior:'smooth',block:'start'})"` : '';
    const cursor = target ? 'cursor:pointer' : '';
    return `<span class="role-chip-item" style="background:${c.c};color:${c.fc};border-color:${c.bc};${cursor}" ${onclick}>${c.label}</span>`;
  }).join('');

  cfg.panels.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'block';
  });

  if (currentAdmin.role === 'DLH' || currentAdmin.role === 'Superadmin') {
    await renderValidasiList();
  }
  if (currentAdmin.role === 'Superadmin') {
    await renderUserTable();
  }

  setTimeout(() => {
    const firstPanel = document.getElementById(cfg.panels[0]);
    if (firstPanel) firstPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 400);
}


async function renderValidasiList() {
  const el = document.getElementById('validasiList');
  if (!el) return;
  el.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-muted)">⏳ Memuat dari Supabase...</div>';

  const pendingList = await SB.laporan.findPending();

  if (pendingList.length === 0) {
    el.innerHTML = '<div style="text-align:center;padding:30px;color:var(--text-muted)">✅ Tidak ada laporan menunggu validasi</div>';
    return;
  }
  el.innerHTML = pendingList.map((r, i) => {
    const dc = r.debit_persen < 40 ? '#ef4444' : r.debit_persen < 70 ? '#f59e0b' : '#10b981';
    const waktu = new Date(r.tanggal_lapor).toLocaleString('id-ID', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' });
    return `<div class="validasi-item" id="vi-${i}" data-id="${r.id_laporan}">
      <span class="v-id">${r.id_laporan}</span>
      <span class="v-loc">${r.kelurahan} · ${r.kec}</span>
      <span class="v-cond">Debit: <strong style="color:${dc}">${r.debit_persen}%</strong> · ${r.kualitas_air}</span>
      <span class="v-time">${r.nama_pelapor} · ${waktu} WIB</span>
      <div class="v-actions">
        <button class="v-btn-approve" onclick="approveValidasi(${i})">&#10003; Setujui</button>
        <button class="v-btn-reject"  onclick="rejectValidasi(${i})">&#10007; Tolak</button>
      </div>
    </div>`;
  }).join('');
}

async function approveValidasi(i) {
  const el = document.getElementById(`vi-${i}`);
  const idLaporan = el?.dataset.id;
  if (el) {
    el.style.borderColor = 'rgba(16,185,129,0.4)';
    el.style.background  = 'rgba(16,185,129,0.06)';
    el.querySelector('.v-actions').innerHTML =
      '<span style="color:#6ee7b7;font-size:0.82rem;font-weight:700">⏳ Menyimpan...</span>';
  }
  if (idLaporan) {
    await SB.laporan.updateStatus(idLaporan, 'Valid', currentAdmin?.id_user);
    if (el) el.querySelector('.v-actions').innerHTML =
      '<span style="color:#6ee7b7;font-size:0.82rem;font-weight:700">✅ Disetujui — Tersimpan di Supabase</span>';
  }
  showToast(`✅ Laporan ${idLaporan} disetujui & tersimpan di Supabase!`, 'success');
}

async function rejectValidasi(i) {
  const el = document.getElementById(`vi-${i}`);
  const idLaporan = el?.dataset.id;
  if (el) {
    el.style.borderColor = 'rgba(239,68,68,0.3)';
    el.style.background  = 'rgba(239,68,68,0.04)';
    el.querySelector('.v-actions').innerHTML =
      '<span style="color:#f87171;font-size:0.82rem;font-weight:700">⏳ Menyimpan...</span>';
  }
  if (idLaporan) {
    await SB.laporan.updateStatus(idLaporan, 'Ditolak', currentAdmin?.id_user);
    if (el) el.querySelector('.v-actions').innerHTML =
      '<span style="color:#f87171;font-size:0.82rem;font-weight:700">✕ Ditolak — Tersimpan di Supabase</span>';
  }
  showToast(`❌ Laporan ${idLaporan} ditolak & tersimpan di Supabase!`, 'warning');
}

async function exportDataDLH() {
  showToast('⬇️ Mengekspor data dari Supabase...', 'info');
  await SB.exportJSON();
  showToast('✅ Data berhasil diekspor dari Supabase!', 'success');
}

// ── Modal Functions ────────────────────────────────────────
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

// ── Tambah Rute (BPBD) ────────────────────────────────────
function tambahRute() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  document.getElementById('ruteTanggal').value = tomorrowStr;
  document.getElementById('ruteJam').value = '08:00';
  document.getElementById('ruteTruk').value = '';
  document.getElementById('ruteKelurahan').value = '';
  document.getElementById('ruteCatatan').value = '';
  document.getElementById('ruteError').style.display = 'none';
  openModal('modalTambahRute');
}

async function submitTambahRute() {
  const kelurahan = document.getElementById('ruteKelurahan').value;
  const zona      = document.getElementById('ruteZona').value;
  const truk      = document.getElementById('ruteTruk').value.trim().toUpperCase();
  const tanggal   = document.getElementById('ruteTanggal').value;
  const jam       = document.getElementById('ruteJam').value;
  const catatan   = document.getElementById('ruteCatatan').value.trim();
  const errEl     = document.getElementById('ruteError');

  if (!kelurahan) { errEl.textContent = '⚠️ Pilih kelurahan tujuan.'; errEl.style.display='block'; return; }
  if (!truk)      { errEl.textContent = '⚠️ Nomor truk tidak boleh kosong.'; errEl.style.display='block'; return; }
  if (!tanggal)   { errEl.textContent = '⚠️ Pilih tanggal pengiriman.'; errEl.style.display='block'; return; }

  errEl.style.display = 'none';

  let newRute;
  try {
    newRute = await SB.distribusi.insert({ kelurahan, zona, no_truk: truk, volume: document.getElementById('ruteVolume').value, tanggal, jam, catatan });
  } catch(e) {
    errEl.textContent = '❌ Gagal menyimpan ke Supabase: ' + e.message;
    errEl.style.display = 'block';
    return;
  }

  let dList = zona === 'kritis' ? document.getElementById('distribusiKritis') : null;
  if (!dList) {
    const cards = document.querySelectorAll('.distribusi-card');
    dList = zona === 'kritis' ? cards[0]?.querySelector('.d-list') : cards[1]?.querySelector('.d-list');
  }
  if (dList) {
    const tgl = new Date(tanggal);
    const tglLabel = tgl.toLocaleDateString('id-ID', { weekday:'long', day:'numeric', month:'long' });
    const item = document.createElement('div');
    item.className = 'd-item';
    item.style.animation = 'fadeIn 0.3s ease';
    item.setAttribute('data-id', newRute.id_distribusi);
    item.innerHTML = `
      <span class="d-kelurahan">${kelurahan}</span>
      <span class="d-info">Truk #${truk} · ${tglLabel} ${jam}</span>
      <span class="d-badge b-scheduled">Terjadwal</span>
    `;
    dList.appendChild(item);
  }

  closeModal('modalTambahRute');
  showToast(`✅ Rute ${kelurahan} (Truk #${truk}) tersimpan ke Supabase! ID: ${newRute.id_distribusi}`, 'success');
}

// ── Tambah Pengguna (Superadmin) ──────────────────────────
function tambahPengguna() {
  ['pgNama','pgUsername','pgPassword','pgEmail','pgHp'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.getElementById('pgError').style.display = 'none';
  openModal('modalTambahPengguna');
}

async function submitTambahPengguna() {
  const nama     = document.getElementById('pgNama').value.trim();
  const role     = document.getElementById('pgRole').value;
  const username = document.getElementById('pgUsername').value.trim();
  const password = document.getElementById('pgPassword').value;
  const email    = document.getElementById('pgEmail').value.trim();
  const hp       = document.getElementById('pgHp').value.trim();
  const errEl    = document.getElementById('pgError');

  if (!nama)               { errEl.textContent = '⚠️ Nama lengkap tidak boleh kosong.'; errEl.style.display='block'; return; }
  if (!username)           { errEl.textContent = '⚠️ Username tidak boleh kosong.'; errEl.style.display='block'; return; }
  if (password.length < 8) { errEl.textContent = '⚠️ Password minimal 8 karakter.'; errEl.style.display='block'; return; }

  errEl.innerHTML = '⏳ Mengecek username di Supabase...';
  errEl.style.display = 'block';

  const existing = await SB.users.findByUsername(username);
  if (existing) { errEl.textContent = '❌ Username sudah digunakan.'; return; }

  errEl.innerHTML = '⏳ Menyimpan ke Supabase...';

  let newUser;
  try {
    newUser = await SB.users.insert({ username, password, role, nama, email, hp });
  } catch(e) {
    errEl.textContent = '❌ Gagal: ' + e.message;
    return;
  }

  errEl.style.display = 'none';

  const tbody = document.querySelector('#panelSuperadmin .data-table tbody');
  if (tbody) {
    const roleIcon  = role === 'DLH' ? '🌿' : '🚒';
    const chipClass = role === 'DLH' ? 'chip-dlh' : 'chip-bpbd';
    const now = new Date().toLocaleString('id-ID', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
    const tr = document.createElement('tr');
    tr.style.animation = 'fadeIn 0.3s ease';
    tr.innerHTML = `
      <td style="color:var(--text-primary);font-weight:500">${nama}</td>
      <td><code style="color:var(--cyan)">${username}</code></td>
      <td><span class="role-chip ${chipClass}">${roleIcon} ${role}</span></td>
      <td style="color:var(--text-muted);font-size:0.8rem">${now}</td>
      <td><span class="status-badge badge-aman"><span class="badge-dot"></span>Aktif</span></td>
      <td><button class="tbl-act-btn" onclick="showToast('Fitur edit akan segera hadir','info')">✏️ Edit</button></td>
    `;
    tbody.appendChild(tr);
  }
  closeModal('modalTambahPengguna');
  showToast(`✅ Akun "${username}" (${role}) tersimpan ke Supabase! ID: ${newUser.id_user}`, 'success');
}

async function renderUserTable() {
  const tbody = document.querySelector('#panelSuperadmin .data-table tbody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:16px">⏳ Memuat dari Supabase...</td></tr>';
  const users = await SB.users.findAll();
  tbody.innerHTML = users.map(u => {
    const roleIcon  = u.role === 'DLH' ? '🌿' : u.role === 'BPBD' ? '🚒' : '⭐';
    const chipClass = u.role === 'DLH' ? 'chip-dlh' : u.role === 'BPBD' ? 'chip-bpbd' : 'chip-super';
    const lastLogin = u.last_login
      ? new Date(u.last_login).toLocaleString('id-ID', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })
      : 'Belum pernah';
    const isRoot = u.role === 'Superadmin';
    return `<tr>
      <td style="color:var(--text-primary);font-weight:500">${u.nama}</td>
      <td><code style="color:var(--cyan)">${u.username}</code></td>
      <td><span class="role-chip ${chipClass}">${roleIcon} ${u.role}</span></td>
      <td style="color:var(--text-muted);font-size:0.8rem">${lastLogin}</td>
      <td><span class="status-badge badge-aman"><span class="badge-dot"></span>${u.status}</span></td>
      <td>${isRoot
        ? '<button class="tbl-act-btn" style="opacity:0.3;cursor:not-allowed">🔒 Root</button>'
        : `<button class="tbl-act-btn" onclick="showToast('Fitur edit akan segera hadir','info')">✏️ Edit</button>`
      }</td>
    </tr>`;
  }).join('');
}

async function doLogin() {
  const username     = document.getElementById('inputUsername').value.trim();
  const password     = document.getElementById('inputPassword').value;
  const selectedRole = document.querySelector('input[name="loginRole"]:checked')?.value || 'DLH';
  const errEl        = document.getElementById('loginError');
  const btn          = document.getElementById('loginBtn');

  if (!username || !password) {
    errEl.textContent = '⚠️ Username dan password tidak boleh kosong.';
    errEl.style.display = 'block'; return;
  }

  btn.disabled = true;
  document.getElementById('loginBtnText').textContent = 'Memeriksa di Supabase…';

  const match = await SB.users.findByCredentials(username, password, selectedRole);

  if (match) {
    await SB.users.updateLastLogin(username);
    currentAdmin = { ...match, loginTime: new Date().toISOString() };
    isLoggedIn   = true;
    sessionStorage.setItem('simata_admin', JSON.stringify(currentAdmin));
    applyLoginState();
    errEl.style.display = 'none';
    btn.disabled = false;
    document.getElementById('loginBtnText').textContent = 'Masuk ke Dashboard →';
    document.getElementById('inputUsername').value = '';
    document.getElementById('inputPassword').value = '';
    showToast(`✅ Selamat datang, ${match.nama}! (Supabase)`, 'success');
    navigateTo('dashboard');
  } else {
    errEl.textContent   = '❌ Username, password, atau role salah.';
    errEl.style.display = 'block';
    btn.disabled = false;
    document.getElementById('loginBtnText').textContent = 'Masuk ke Dashboard →';
    document.getElementById('inputPassword').value = '';
  }
}

function doLogout() {
  isLoggedIn   = false;
  currentAdmin = null;
  sessionStorage.removeItem('simata_admin');
  applyLoginState();
  showToast('👋 Anda telah keluar dari panel admin.', 'info');
  navigateTo('beranda');
}

function toggleAdminMenu(event) {
  event.stopPropagation();
  const menu = document.getElementById('adminMenu');
  if (menu) menu.classList.toggle('open');
}

function gantiAkun() {
  isLoggedIn   = false;
  currentAdmin = null;
  sessionStorage.removeItem('simata_admin');
  applyLoginState();
  navigateTo('login');
  showToast('🔑 Silakan masuk dengan akun lain.', 'info');
}

function togglePassword() {
  const input = document.getElementById('inputPassword');
  const btn   = document.getElementById('pwToggleBtn');
  if (input.type === 'password') {
    input.type      = 'text';
    btn.textContent = '🙈';
  } else {
    input.type      = 'password';
    btn.textContent = '👁️';
  }
}

function selectRole(value) {
  document.querySelectorAll('.lf-role').forEach(el => el.classList.remove('selected'));
  const input = document.querySelector(`input[name="loginRole"][value="${value}"]`);
  if (input) {
    input.checked = true;
    input.closest('.lf-role').classList.add('selected');
  }
}

// ── Weather State (from Open-Meteo API) ───────────────────
let weatherData = null;
let weatherLoaded = false;

// ═══════════════════════════════════════════════════════════
// OPEN-METEO API — Real Weather Data
// ═══════════════════════════════════════════════════════════

async function fetchWeatherData() {
  try {
    showWeatherLoading(true);
    const res = await fetch(OPENMETEO_URL);
    if (!res.ok) throw new Error('Network error: ' + res.status);
    weatherData = await res.json();
    weatherLoaded = true;
    applyWeatherData();
    showWeatherLoading(false);
    console.log('[SIMATA] ✅ Data cuaca real berhasil dimuat dari Open-Meteo');
  } catch (err) {
    console.warn('[SIMATA] ⚠️ Gagal memuat data cuaca:', err.message);
    showWeatherLoading(false);
    showToast('Peringatan: Tidak bisa memuat data cuaca real. Menggunakan estimasi.', 'warning');
    applyFallbackWeather();
  }
}

function showWeatherLoading(show) {
  const els = document.querySelectorAll('.weather-loading');
  els.forEach(el => el.style.display = show ? 'block' : 'none');
}

function applyWeatherData() {
  if (!weatherData) return;

  const cw = weatherData.current_weather;
  const daily = weatherData.daily;
  const todayStr = new Date().toISOString().split('T')[0];
  const todayIdx = daily.time.findIndex(t => t === todayStr);
  const safeIdx = todayIdx >= 0 ? todayIdx : 30;

  const rainToday = daily.precipitation_sum[safeIdx] ?? 0;
  setEl('statRainToday', rainToday.toFixed(1) + ' mm');
  setEl('heroRainToday', rainToday.toFixed(1));
  setEl('dashRainVal', rainToday.toFixed(1) + ' mm');

  const tempNow = cw.temperature;
  setEl('tempNow', tempNow.toFixed(0) + '°C');

  const forecastDays = [safeIdx, safeIdx + 1, safeIdx + 2];
  const labels = ['Hari ini', 'Besok', 'Lusa'];
  forecastDays.forEach((idx, i) => {
    if (idx < daily.time.length) {
      const wcode = daily.weathercode[idx];
      const tmax  = daily.temperature_2m_max[idx];
      const rain  = daily.precipitation_sum[idx];
      setEl(`forecast-icon-${i}`, WMO_EMOJI[wcode] || '🌤️');
      setEl(`forecast-temp-${i}`, Math.round(tmax) + '°C');
      setEl(`forecast-rain-${i}`, rain.toFixed(1) + 'mm');
      setEl(`forecast-label-${i}`, labels[i]);
    }
  });

  if (rainChartObj) updateRainChartWithRealData(daily, safeIdx);

  const ts = '✅ Open-Meteo — ' + new Date().toLocaleTimeString('id-ID', {hour:'2-digit',minute:'2-digit'}) + ' WIB';
  setEl('weatherSource', ts);
  setEl('weatherSource2', ts);
}

function applyFallbackWeather() {
  setEl('statRainToday', '2.6 mm');
  setEl('heroRainToday', '2.6');
  setEl('dashRainVal', '2.6 mm');
  setEl('tempNow', '27°C');
  setEl('forecast-icon-0', '⛅'); setEl('forecast-temp-0', '34°C'); setEl('forecast-rain-0', '2.6mm'); setEl('forecast-label-0', 'Hari ini');
  setEl('forecast-icon-1', '🌧️'); setEl('forecast-temp-1', '34°C'); setEl('forecast-rain-1', '3.3mm'); setEl('forecast-label-1', 'Besok');
  setEl('forecast-icon-2', '⛅'); setEl('forecast-temp-2', '36°C'); setEl('forecast-rain-2', '1.7mm'); setEl('forecast-label-2', 'Lusa');
  setEl('weatherSource', '⚠️ Estimasi (offline)');
}

function updateRainChartWithRealData(daily, todayIdx) {
  if (!rainChartObj || !daily) return;
  const startIdx = Math.max(0, todayIdx - 29);
  const endIdx   = Math.min(daily.time.length - 1, todayIdx + 6);
  const labels   = daily.time.slice(startIdx, endIdx + 1).map(t =>
    new Date(t).toLocaleDateString('id-ID', {day:'2-digit', month:'short'})
  );
  const rainData = daily.precipitation_sum.slice(startIdx, endIdx + 1);
  const cumRain = [];
  let cum = 0;
  rainData.forEach((r, i) => {
    cum = cum * 0.85 + r;
    cumRain.push(Math.min(90, Math.max(30, 45 + cum * 1.8)));
  });
  rainChartObj.data.labels = labels;
  rainChartObj.data.datasets[0].data = rainData;
  rainChartObj.data.datasets[1].data = cumRain;
  rainChartObj.update('active');
}

function setEl(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

// ═══════════════════════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════════════════════

function navigateTo(pageId) {
  if (pageId === 'dashboard' && !isLoggedIn) {
    showToast('⛔ Akses ditolak! Silakan login terlebih dahulu.', 'error');
    showAccessDenied();
    return;
  }
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  const target = document.getElementById(pageId);
  if (target) target.classList.remove('hidden');

  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  const activeLink = document.querySelector(`.nav-link[onclick*="${pageId}"]`);
  if (activeLink) activeLink.classList.add('active');

  currentPage = pageId;

  setTimeout(async () => {
    if (pageId === 'beranda') {
      if (!heroMapObj) initHeroMap();
      applyWeatherDataToHero();
    }
    if (pageId === 'dashboard') {
      initCharts();
      await populateTable();
      updateLastUpdate();
      await applyRoleDashboard();
      if (weatherLoaded) applyWeatherData();
    }
    if (pageId === 'peta') {
      if (!mainMapObj) initMainMap();
      else setTimeout(() => mainMapObj.invalidateSize(), 200);
    }
    if (pageId === 'laporan') {
      initFormMap();
      renderRecentReports();
      if (weatherLoaded) applyWeatherData();
    }
  }, 80);

  document.getElementById('navLinks').classList.remove('open');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleMenu() {
  document.getElementById('navLinks').classList.toggle('open');
}

window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 40);
});

function applyWeatherDataToHero() {
  if (!weatherLoaded || !weatherData) return;
  applyWeatherData();
}

// ═══════════════════════════════════════════════════════════
// MAPS
// ═══════════════════════════════════════════════════════════

function statusColor(status) {
  return status === 'aman' ? '#10b981'
       : status === 'waspada' ? '#f59e0b'
       : '#ef4444';
}

function initHeroMap() {
  heroMapObj = L.map('heroMap', {
    center: [-0.891, 119.872], zoom: 12,
    zoomControl: false, attributionControl: false,
    dragging: false, scrollWheelZoom: false,
    doubleClickZoom: false, touchZoom: false,
  });
  addTileLayer(heroMapObj);

  WELL_DATA.forEach(w => {
    const color = statusColor(w.status);
    L.circleMarker([w.lat, w.lng], {
      radius: w.sensor ? 8 : 6,
      fillColor: color, color: 'rgba(255,255,255,0.6)',
      weight: 1.5, fillOpacity: 0.85,
    }).addTo(heroMapObj);
    if (w.sensor) {
      L.circleMarker([w.lat, w.lng], {
        radius: 15, fillColor: 'transparent',
        color: color, weight: 1.2, fillOpacity: 0, opacity: 0.45,
      }).addTo(heroMapObj);
    }
  });

  KELURAHAN_REAL.forEach(k => {
    L.circleMarker([k.lat, k.lng], {
      radius: 3, fillColor: '#48cae4', color: 'transparent',
      weight: 0, fillOpacity: 0.3,
    }).addTo(heroMapObj);
  });
}

function initMainMap() {
  mainMapObj = L.map('mainMap', {
    center: [-0.891, 119.872], zoom: 13,
    zoomControl: true, attributionControl: true,
  });
  addTileLayer(mainMapObj);

  KELURAHAN_REAL.forEach(k => {
    L.circleMarker([k.lat, k.lng], {
      radius: 4, fillColor: '#48cae4', color: 'rgba(255,255,255,0.3)',
      weight: 1, fillOpacity: 0.25,
    }).bindTooltip(k.nama + ' · ' + k.kec, {
      direction: 'top', className: 'kelurahan-tooltip'
    }).addTo(mainMapObj);
  });

  renderMapMarkers('all');
  renderSidebarWells();
}

function addTileLayer(mapObj) {
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org">OpenStreetMap</a> contributors',
    maxZoom: 18,
  }).addTo(mapObj);
}

function renderMapMarkers(filter) {
  allMarkers.forEach(m => mainMapObj.removeLayer(m));
  allMarkers = [];
  const filtered = filter === 'all' ? WELL_DATA : WELL_DATA.filter(w => w.status === filter);
  filtered.forEach(w => {
    const color = statusColor(w.status);
    if (w.sensor) {
      const ring = L.circleMarker([w.lat, w.lng], {
        radius: 17, fillColor: 'transparent',
        color, weight: 1.5, fillOpacity: 0, opacity: 0.45,
      }).addTo(mainMapObj);
      allMarkers.push(ring);
    }
    const statusLabel = w.status === 'aman' ? 'Normal' : w.status === 'waspada' ? 'Waspada' : 'Kritis';
    const badgeClass  = `badge-${w.status}`;
    const marker = L.circleMarker([w.lat, w.lng], {
      radius: w.sensor ? 9 : 7,
      fillColor: color, color: 'rgba(255,255,255,0.7)',
      weight: 2, fillOpacity: 0.9,
    }).bindPopup(`
      <div class="popup-title">${w.name}</div>
      <div class="popup-row"><span class="popup-label">Kelurahan</span><span class="popup-value">${w.kelurahan}</span></div>
      <div class="popup-row"><span class="popup-label">Kecamatan</span><span class="popup-value">${w.kec}</span></div>
      <div class="popup-row"><span class="popup-label">Debit Air</span><span class="popup-value" style="color:${color}">${w.debit}%</span></div>
      <div class="popup-row"><span class="popup-label">Kualitas</span><span class="popup-value">${w.kualitas}</span></div>
      <div class="popup-row"><span class="popup-label">Sensor IoT</span><span class="popup-value">${w.sensor ? '📡 Aktif' : '👤 Laporan'}</span></div>
      <div class="popup-row"><span class="popup-label">Koordinat</span><span class="popup-value">${w.lat.toFixed(4)}, ${w.lng.toFixed(4)}</span></div>
      <span class="popup-status ${badgeClass}">${statusLabel}</span>
    `, { maxWidth: 260 }).addTo(mainMapObj);
    allMarkers.push(marker);
  });
}

function filterMap(filter, btn) {
  document.querySelectorAll('.filter-chips .chip').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  renderMapMarkers(filter);
}

function renderSidebarWells() {
  const container = document.getElementById('sidebarWellList');
  if (!container) return;
  const kritisWells = WELL_DATA.filter(w => w.status === 'kritis').slice(0, 5);
  container.innerHTML = '<h4>Sumur Kritis Terdekat</h4>' +
    kritisWells.map(w => `
      <div class="well-item">
        <div>
          <div class="well-name">${w.name}</div>
          <div class="well-sub">${w.kelurahan} · ${w.sensor ? '📡 Sensor' : '👤 Laporan'}</div>
        </div>
        <div class="well-pct">${w.debit}%</div>
      </div>
    `).join('');
}

let heatmapVisible = false;
function toggleHeatmap() {
  heatmapVisible = !heatmapVisible;
  const btn = document.getElementById('heatmapBtn');
  btn.style.borderColor = heatmapVisible ? 'var(--cyan)' : '';
  btn.style.color = heatmapVisible ? 'var(--cyan)' : '';
}

function initFormMap() {
  if (formMapObj) { setTimeout(() => formMapObj.invalidateSize(), 100); return; }
  formMapObj = L.map('formMap', {
    center: [-0.891, 119.872], zoom: 13,
    zoomControl: true, attributionControl: false,
  });
  addTileLayer(formMapObj);
  formMapObj.on('click', (e) => {
    if (formMarker) formMapObj.removeLayer(formMarker);
    formMarker = L.marker(e.latlng, {
      icon: L.divIcon({
        className: '',
        html: '<div style="width:16px;height:16px;background:#00b4d8;border-radius:50%;border:3px solid white;box-shadow:0 0 10px rgba(0,180,216,0.7)"></div>',
        iconSize: [16,16], iconAnchor: [8,8],
      })
    }).addTo(formMapObj);
  });
}

// ═══════════════════════════════════════════════════════════
// CHARTS
// ═══════════════════════════════════════════════════════════

function initCharts() {
  if (trendChartObj) { updateCharts(); return; }

  Chart.defaults.color = '#8ab4d4';
  Chart.defaults.font.family = "'Inter', sans-serif";
  Chart.defaults.font.size = 12;

  const trendData = generateTrendData(30);
  const trendCtx = document.getElementById('trendChart').getContext('2d');
  trendChartObj = new Chart(trendCtx, {
    type: 'line',
    data: {
      labels: trendData.labels,
      datasets: [
        { label:'Normal',  data:trendData.amanData,    borderColor:'#10b981', backgroundColor:'rgba(16,185,129,0.08)',  fill:true, tension:0.4, pointRadius:0, borderWidth:2.5 },
        { label:'Waspada', data:trendData.waspadaData, borderColor:'#f59e0b', backgroundColor:'rgba(245,158,11,0.06)',  fill:true, tension:0.4, pointRadius:0, borderWidth:2 },
        { label:'Kritis',  data:trendData.kritisData,  borderColor:'#ef4444', backgroundColor:'rgba(239,68,68,0.08)',   fill:true, tension:0.4, pointRadius:0, borderWidth:2 },
      ]
    },
    options: chartOpts('index', false)
  });

  const donutCtx = document.getElementById('donutChart').getContext('2d');
  donutChartObj = new Chart(donutCtx, {
    type: 'doughnut',
    data: {
      labels: ['Normal','Waspada','Kritis'],
      datasets: [{ data:[189,27,31], backgroundColor:['#10b981','#f59e0b','#ef4444'], borderColor:'#040d1a', borderWidth:3, hoverOffset:8 }]
    },
    options: { ...chartOpts(), cutout:'72%' }
  });

  const rainCtx = document.getElementById('rainChart').getContext('2d');
  const { labels, rainData, debitData } = generateFallbackRain(30);
  rainChartObj = new Chart(rainCtx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label:'Curah Hujan (mm)', data:rainData, backgroundColor:'rgba(0,180,216,0.5)', borderColor:'#00b4d8', borderWidth:1, borderRadius:3, yAxisID:'y' },
        { label:'Debit Sumur (%)',  data:debitData, type:'line', borderColor:'#a78bfa', backgroundColor:'rgba(167,139,250,0.1)', fill:true, tension:0.4, pointRadius:0, borderWidth:2.5, yAxisID:'y1' },
      ]
    },
    options: {
      ...chartOpts('index', false),
      scales: {
        x:  { grid:{ color:'rgba(0,180,216,0.06)' }, ticks:{ maxTicksLimit:10 } },
        y:  { grid:{ color:'rgba(0,180,216,0.06)' }, title:{ display:true, text:'mm', color:'#4a7a9b' }, position:'left' },
        y1: { grid:{ display:false }, title:{ display:true, text:'%', color:'#4a7a9b' }, position:'right', min:0, max:100 },
      }
    }
  });

  if (weatherLoaded && weatherData) {
    const daily = weatherData.daily;
    const todayStr = new Date().toISOString().split('T')[0];
    const todayIdx = daily.time.findIndex(t => t === todayStr);
    updateRainChartWithRealData(daily, todayIdx >= 0 ? todayIdx : 30);
  }
}

function chartOpts(interactionMode = 'index', displayLegend = false) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: interactionMode, intersect: false },
    plugins: {
      legend: { display: displayLegend },
      tooltip: {
        backgroundColor: '#0b1f36', borderColor: 'rgba(0,180,216,0.2)',
        borderWidth: 1, padding: 12, titleColor: '#e8f4fd', bodyColor: '#8ab4d4',
      },
    },
    scales: {
      x: { grid: { color: 'rgba(0,180,216,0.06)' }, ticks: { maxTicksLimit: 8 } },
      y: { grid: { color: 'rgba(0,180,216,0.06)' } },
    }
  };
}

function generateFallbackRain(days) {
  const labels = [], rainData = [], debitData = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now); d.setDate(d.getDate() - i);
    labels.push(d.toLocaleDateString('id-ID', { day:'2-digit', month:'short' }));
    const rain = Math.max(0, Math.round(8 + Math.sin(i * 0.5) * 5 + Math.random() * 4 - 2));
    rainData.push(rain);
    debitData.push(Math.min(90, Math.max(30, 50 + rain * 1.5)));
  }
  return { labels, rainData, debitData };
}

function generateTrendData(days) {
  const labels = [], amanData = [], waspadaData = [], kritisData = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now); d.setDate(d.getDate() - i);
    labels.push(d.toLocaleDateString('id-ID', { day:'2-digit', month:'short' }));
    const base = days - i;
    const aman   = Math.round(Math.max(175, 200 - base * 0.4 + (Math.random() * 8 - 4)));
    const kritis = Math.round(Math.min(35, 15 + base * 0.45 + (Math.random() * 4 - 2)));
    amanData.push(aman);
    kritisData.push(kritis);
    waspadaData.push(247 - aman - kritis);
  }
  return { labels, amanData, waspadaData, kritisData };
}

function updateCharts() {
  if (!trendChartObj) return;
  const days = parseInt(document.getElementById('periodSelect').value);
  const td = generateTrendData(days);
  trendChartObj.data.labels = td.labels;
  trendChartObj.data.datasets[0].data = td.amanData;
  trendChartObj.data.datasets[1].data = td.waspadaData;
  trendChartObj.data.datasets[2].data = td.kritisData;
  trendChartObj.update('active');
}

// ═══════════════════════════════════════════════════════════
// TABLE
// ═══════════════════════════════════════════════════════════

async function populateTable() {
  const tbody = document.getElementById('tableBody');
  if (tbody) tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:20px">⏳ Memuat dari Supabase...</td></tr>';
  const data = await SB.kelurahan.findAll();
  renderTable(data);
}

async function filterTable() {
  const q = (document.getElementById('tableSearch').value || '').toLowerCase();
  const s = (document.getElementById('filterStatus').value || '').toLowerCase();
  const data = await SB.kelurahan.findAll();
  const filtered = data.filter(row =>
    (row.nama.toLowerCase().includes(q) || row.kec.toLowerCase().includes(q)) &&
    (s === '' || row.zona_status.toLowerCase().includes(s))
  );
  renderTable(filtered);
}

function renderTable(data) {
  const tbody = document.getElementById('tableBody');
  if (!tbody) return;
  tbody.innerHTML = data.map(row => {
    const status     = row.status || row.zona_status;
    const badgeClass = status === 'Aman' ? 'badge-aman' : status === 'Waspada' ? 'badge-waspada' : 'badge-kritis';
    const debitColor = row.debit > 70 ? '#10b981' : row.debit > 40 ? '#f59e0b' : '#ef4444';
    const updateStr  = row.update || (row.id_kelurahan ? 'Data DB #' + row.id_kelurahan : 'Dari laporan warga');
    return `<tr>
      <td style="color:var(--text-primary);font-weight:500">${row.nama}</td>
      <td>${row.kec}</td>
      <td>${row.sumur} sumur</td>
      <td><span style="color:${debitColor};font-weight:700">${row.debit}%</span></td>
      <td>${row.kualitas}</td>
      <td><span class="status-badge ${badgeClass}"><span class="badge-dot"></span>${status}</span></td>
      <td style="color:var(--text-muted);font-size:0.78rem">${updateStr}</td>
    </tr>`;
  }).join('');
}

function updateLastUpdate() {
  const el = document.getElementById('lastUpdate');
  if (el) el.textContent = new Date().toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit' }) + ' WIB';
}

async function refreshData() {
  updateLastUpdate();
  fetchWeatherData();
  await populateTable();
  const stats = await SB.stats();
  showToast(`✅ Data Supabase diperbarui — ${stats.laporan} laporan, ${stats.kelurahan} kelurahan`, 'success');
}

// ═══════════════════════════════════════════════════════════
// FORM
// ═══════════════════════════════════════════════════════════

function goToStep(step) {
  if (step === 2) {
    const kec = document.getElementById('kecamatanLapor').value;
    const kel = document.getElementById('kelurahanLapor').value;
    if (!kec || !kel) { showToast('⚠️ Pilih Kecamatan dan Kelurahan terlebih dahulu', 'warning'); return; }
  }
  formStep = step;
  ['formStep1','formStep2','formStep3'].forEach(id => document.getElementById(id).classList.add('hidden'));
  document.getElementById(`formStep${step}`).classList.remove('hidden');
  ['step1Ind','step2Ind','step3Ind'].forEach((id, i) => {
    const el = document.getElementById(id);
    el.classList.remove('active','done');
    if (i + 1 === step) el.classList.add('active');
    else if (i + 1 < step) el.classList.add('done');
  });
}

function updateKelurahan() {
  const kec = document.getElementById('kecamatanLapor').value;
  const sel = document.getElementById('kelurahanLapor');
  sel.innerHTML = '<option value="">Pilih Kelurahan</option>';
  (KELURAHAN_MAP[kec] || []).forEach(k => sel.innerHTML += `<option value="${k}">${k}</option>`);
}

function updateSlider() {
  const val = document.getElementById('levelAir').value;
  document.getElementById('sliderVal').textContent = val + '%';
  const slider = document.getElementById('levelAir');
  slider.style.background = `linear-gradient(to right, var(--cyan) ${val}%, var(--bg-secondary) ${val}%)`;
}

async function submitLaporan() {
  const kecEl    = document.getElementById('kecamatanLapor');
  const kelEl    = document.getElementById('kelurahanLapor');
  const namaEl   = document.getElementById('namaLapor');
  const noHpEl   = document.getElementById('noHp');
  const alamatEl = document.getElementById('alamatSumur');
  const jenisEl  = document.querySelector('input[name="jenisSumur"]:checked');
  const levelEl  = document.getElementById('levelAir');
  const kualEl   = document.querySelector('input[name="kualitas"]:checked');
  const catEl    = document.getElementById('catatanLapor');

  const submitBtn = document.querySelector('#formStep2 .btn-primary');
  if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = '⏳ Menyimpan ke Supabase...'; }

  try {
    const newLaporan = await SB.laporan.insert({
      kelurahan:    kelEl?.value    || '',
      kec:          kecEl?.options[kecEl?.selectedIndex]?.text || '',
      nama_pelapor: namaEl?.value   || 'Anonim',
      no_hp:        noHpEl?.value   || '',
      alamat:       alamatEl?.value || '',
      jenis_sumur:  jenisEl?.value  || 'Gali',
      debit_persen: parseInt(levelEl?.value || 65),
      kualitas_air: kualEl?.value   || 'Jernih',
      catatan:      catEl?.value    || '',
      lat_sumur:    formMarker ? formMarker.getLatLng().lat : null,
      lng_sumur:    formMarker ? formMarker.getLatLng().lng : null,
    });
    document.getElementById('reportId').textContent = newLaporan.id_laporan;
    showToast(`☁️ Laporan ${newLaporan.id_laporan} tersimpan ke Supabase!`, 'success');
    goToStep(3);
  } catch(e) {
    showToast('❌ Gagal menyimpan laporan: ' + e.message, 'error');
  } finally {
    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Kirim Laporan ✓'; }
  }
}

function resetForm() {
  ['namaLapor','noHp','alamatSumur','catatanLapor'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
  });
  document.getElementById('kecamatanLapor').value = '';
  document.getElementById('kelurahanLapor').innerHTML = '<option value="">Pilih Kelurahan</option>';
  document.getElementById('levelAir').value = 65;
  document.getElementById('sliderVal').textContent = '65%';
  if (formMarker && formMapObj) { formMapObj.removeLayer(formMarker); formMarker = null; }
  goToStep(1);
}

function renderRecentReports() {
  const container = document.getElementById('recentReports');
  if (!container) return;
  container.innerHTML = RECENT_REPORTS.map(r => `
    <div class="recent-item">
      <span class="recent-dot" style="background:${r.status==='kritis'?'#ef4444':r.status==='waspada'?'#f59e0b':'#10b981'}"></span>
      <div class="recent-text"><strong>${r.kelurahan}</strong>: ${r.jenis}</div>
      <span class="recent-time">${r.time}</span>
    </div>
  `).join('');
}

// ═══════════════════════════════════════════════════════════
// TOAST
// ═══════════════════════════════════════════════════════════

function showToast(msg, type = 'info') {
  const toast = document.createElement('div');
  const colors = { warning:'#f59e0b', success:'#10b981', error:'#ef4444', info:'#00b4d8' };
  toast.style.cssText = `
    position:fixed;bottom:24px;right:24px;z-index:9999;
    background:#0b1f36;border:1px solid ${colors[type]||'#00b4d8'};
    color:#e8f4fd;padding:14px 20px;border-radius:12px;
    font-size:0.875rem;font-family:'Inter',sans-serif;
    box-shadow:0 8px 30px rgba(0,0,0,0.5);max-width:340px;
    animation:toastIn 0.3s ease;
  `;
  document.head.insertAdjacentHTML('beforeend','<style>@keyframes toastIn{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}</style>');
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4500);
}

// ═══════════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', async () => {
  checkLoginState();
  navigateTo('beranda');
  updateLastUpdate();

  // Inisialisasi Supabase (seed data jika tabel kosong)
  try {
    await SB.init();
    console.log('[SIMATA] ✅ Supabase connected:', SUPABASE_URL);
  } catch(e) {
    console.error('[SIMATA] Supabase init error:', e);
    showToast('⚠️ Gagal terhubung ke Supabase. Cek koneksi internet.', 'warning');
  }

  // Fetch real weather data on load
  fetchWeatherData();

  // Auto-refresh cuaca setiap 15 menit
  setInterval(() => {
    fetchWeatherData();
    if (currentPage === 'dashboard') updateLastUpdate();
  }, 15 * 60 * 1000);
});

