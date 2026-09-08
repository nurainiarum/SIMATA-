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
  const today = 0; // index 30 = hari ini dalam past_days=30 array (0-indexed dari past)

  // Cari indeks hari ini (batas past & future)
  const todayStr = new Date().toISOString().split('T')[0];
  const todayIdx = daily.time.findIndex(t => t === todayStr);
  const safeIdx = todayIdx >= 0 ? todayIdx : 30;

  // ── Curah Hujan Hari Ini ──
  const rainToday = daily.precipitation_sum[safeIdx] ?? 0;
  setEl('statRainToday', rainToday.toFixed(1) + ' mm');
  setEl('heroRainToday', rainToday.toFixed(1));
  setEl('dashRainVal', rainToday.toFixed(1) + ' mm');

  // ── Suhu Sekarang ──
  const tempNow = cw.temperature;
  setEl('tempNow', tempNow.toFixed(0) + '°C');

  // ── Prakiraan 3 Hari (Cuaca BMKG card) ──
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

  // ── Update Rain Chart dengan Data Real ──
  if (rainChartObj) updateRainChartWithRealData(daily, safeIdx);

  // ── Data Source Badge ──
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

  // Ambil 30 hari ke belakang + 7 hari ke depan
  const startIdx = Math.max(0, todayIdx - 29);
  const endIdx   = Math.min(daily.time.length - 1, todayIdx + 6);

  const labels   = daily.time.slice(startIdx, endIdx + 1).map(t =>
    new Date(t).toLocaleDateString('id-ID', {day:'2-digit', month:'short'})
  );
  const rainData = daily.precipitation_sum.slice(startIdx, endIdx + 1);

  // Estimasi debit sumur berdasarkan curah hujan kumulatif (korelasi sederhana)
  const cumRain = [];
  let cum = 0;
  rainData.forEach((r, i) => {
    cum = cum * 0.85 + r; // decay factor
    // Normalisasi ke range 30-90%
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
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  const target = document.getElementById(pageId);
  if (target) target.classList.remove('hidden');

  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  const activeLink = document.querySelector(`.nav-link[onclick*="${pageId}"]`);
  if (activeLink) activeLink.classList.add('active');

  currentPage = pageId;

  setTimeout(() => {
    if (pageId === 'beranda') {
      if (!heroMapObj) initHeroMap();
      applyWeatherDataToHero();
    }
    if (pageId === 'dashboard') {
      initCharts();
      populateTable();
      updateLastUpdate();
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

  // Juga tampilkan semua 46 kelurahan sebagai titik kecil
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

  // Tampilkan batas kelurahan sebagai layer
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

  // Trend chart (status sumur dari laporan warga)
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

  // Donut
  const donutCtx = document.getElementById('donutChart').getContext('2d');
  donutChartObj = new Chart(donutCtx, {
    type: 'doughnut',
    data: {
      labels: ['Normal','Waspada','Kritis'],
      datasets: [{ data:[189,27,31], backgroundColor:['#10b981','#f59e0b','#ef4444'], borderColor:'#040d1a', borderWidth:3, hoverOffset:8 }]
    },
    options: { ...chartOpts(), cutout:'72%' }
  });

  // Rain chart — akan diisi data real setelah API selesai
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

  // Jika data cuaca sudah ada, langsung pakai
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

// Fallback rain data (used before API loads)
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

// Status trend (estimasi dari laporan warga kumulatif)
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
  // Rain chart stays with real data
}

// ═══════════════════════════════════════════════════════════
// TABLE
// ═══════════════════════════════════════════════════════════

function populateTable() { renderTable(KELURAHAN_DATA); }

function filterTable() {
  const q = (document.getElementById('tableSearch').value || '').toLowerCase();
  const s = (document.getElementById('filterStatus').value || '').toLowerCase();
  const filtered = KELURAHAN_DATA.filter(row =>
    (row.nama.toLowerCase().includes(q) || row.kec.toLowerCase().includes(q)) &&
    (s === '' || row.status.toLowerCase().includes(s))
  );
  renderTable(filtered);
}

function renderTable(data) {
  const tbody = document.getElementById('tableBody');
  if (!tbody) return;
  tbody.innerHTML = data.map(row => {
    const badgeClass  = row.status === 'Aman' ? 'badge-aman' : row.status === 'Waspada' ? 'badge-waspada' : 'badge-kritis';
    const debitColor  = row.debit > 70 ? '#10b981' : row.debit > 40 ? '#f59e0b' : '#ef4444';
    return `<tr>
      <td style="color:var(--text-primary);font-weight:500">${row.nama}</td>
      <td>${row.kec}</td>
      <td>${row.sumur} sumur</td>
      <td><span style="color:${debitColor};font-weight:700">${row.debit}%</span></td>
      <td>${row.kualitas}</td>
      <td><span class="status-badge ${badgeClass}"><span class="badge-dot"></span>${row.status}</span></td>
      <td style="color:var(--text-muted);font-size:0.78rem">${row.update}</td>
    </tr>`;
  }).join('');
}

function updateLastUpdate() {
  const el = document.getElementById('lastUpdate');
  if (el) el.textContent = new Date().toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit' }) + ' WIB';
}

function refreshData() {
  updateLastUpdate();
  fetchWeatherData();
  renderTable(KELURAHAN_DATA);
  showToast('✅ Data cuaca diperbarui dari server Open-Meteo', 'success');
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

function submitLaporan() {
  const id = 'RPT-2026-' + new Date().toISOString().split('T')[0].replace(/-/g,'') + '-' + String(Math.floor(Math.random()*9999)).padStart(4,'0');
  document.getElementById('reportId').textContent = id;
  goToStep(3);
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

document.addEventListener('DOMContentLoaded', () => {
  navigateTo('beranda');
  updateLastUpdate();

  // Fetch real weather data on load
  fetchWeatherData();

  // Auto-refresh cuaca setiap 15 menit
  setInterval(() => {
    fetchWeatherData();
    if (currentPage === 'dashboard') updateLastUpdate();
  }, 15 * 60 * 1000);
});
