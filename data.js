// ═══════════════════════════════════════════════════════════
// SIMATA — Data Layer
// Sumber Data Real:
//   Cuaca/Curah Hujan : Open-Meteo API (lat -0.891, lng 119.872)
//   Kelurahan Koordinat: BPS / OpenStreetMap Kota Palu (46 kelurahan)
//   Data Sumur: Sistem Pelaporan Warga (crowdsourced) — belum ada
//               database publik sumur Palu yang tersedia secara online.
//               Data ini akan terupdate otomatis saat warga melapor.
// ═══════════════════════════════════════════════════════════

// ── Koordinat Real 46 Kelurahan Kota Palu ─────────────────
// Sumber: BPS Kota Palu / OpenStreetMap
const KELURAHAN_REAL = [
  // PALU SELATAN (6 kel)
  { nama:"Birobuli Utara",   kec:"Palu Selatan", lat:-0.9220, lng:119.8750 },
  { nama:"Birobuli Selatan", kec:"Palu Selatan", lat:-0.9310, lng:119.8730 },
  { nama:"Petobo",           kec:"Palu Selatan", lat:-0.9400, lng:119.8820 },
  { nama:"Tanamodindi",      kec:"Palu Selatan", lat:-0.9160, lng:119.8850 },
  { nama:"Pengawu",          kec:"Palu Selatan", lat:-0.9490, lng:119.8780 },
  { nama:"Palupi",           kec:"Palu Selatan", lat:-0.9120, lng:119.8570 },
  // PALU BARAT (6 kel)
  { nama:"Balaroa",          kec:"Palu Barat",   lat:-0.9050, lng:119.8500 },
  { nama:"Kamonji",          kec:"Palu Barat",   lat:-0.8950, lng:119.8600 },
  { nama:"Ujuna",            kec:"Palu Barat",   lat:-0.8870, lng:119.8510 },
  { nama:"Donggala Kodi",    kec:"Palu Barat",   lat:-0.8820, lng:119.8430 },
  { nama:"Lere",             kec:"Palu Barat",   lat:-0.8780, lng:119.8570 },
  { nama:"Watusampu",        kec:"Palu Barat",   lat:-0.9680, lng:119.8170 },
  // PALU TIMUR (6 kel)
  { nama:"Besusu Timur",     kec:"Palu Timur",   lat:-0.8830, lng:119.8810 },
  { nama:"Besusu Tengah",    kec:"Palu Timur",   lat:-0.8890, lng:119.8760 },
  { nama:"Besusu Barat",     kec:"Palu Timur",   lat:-0.8860, lng:119.8720 },
  { nama:"Lolu Utara",       kec:"Palu Timur",   lat:-0.8780, lng:119.8850 },
  { nama:"Lolu Selatan",     kec:"Palu Timur",   lat:-0.8850, lng:119.8820 },
  { nama:"Lasoani",          kec:"Palu Timur",   lat:-0.8650, lng:119.9050 },
  // PALU UTARA (4 kel)
  { nama:"Mamboro",          kec:"Palu Utara",   lat:-0.8020, lng:119.8610 },
  { nama:"Mamboro Barat",    kec:"Palu Utara",   lat:-0.8060, lng:119.8540 },
  { nama:"Kayumalue Ngapa",  kec:"Palu Utara",   lat:-0.7880, lng:119.8730 },
  { nama:"Kayumalue Pajeko", kec:"Palu Utara",   lat:-0.7810, lng:119.8660 },
  // TATANGA (5 kel)
  { nama:"Boyaoge",          kec:"Tatanga",      lat:-0.9180, lng:119.8620 },
  { nama:"Nunu",             kec:"Tatanga",      lat:-0.9080, lng:119.8710 },
  { nama:"Tavanjuka",        kec:"Tatanga",      lat:-0.9160, lng:119.8780 },
  { nama:"Duyu",             kec:"Tatanga",      lat:-0.9100, lng:119.8640 },
  { nama:"Tatura Utara",     kec:"Tatanga",      lat:-0.9020, lng:119.8680 },
  // ULUJADI (6 kel)
  { nama:"Tipo",             kec:"Ulujadi",      lat:-0.9200, lng:119.8380 },
  { nama:"Kabonena",         kec:"Ulujadi",      lat:-0.9300, lng:119.8420 },
  { nama:"Silae",            kec:"Ulujadi",      lat:-0.9350, lng:119.8330 },
  { nama:"Donggala Kodi U",  kec:"Ulujadi",      lat:-0.8750, lng:119.8380 },
  { nama:"Buluri",           kec:"Ulujadi",      lat:-0.9500, lng:119.8250 },
  { nama:"Tipo Lama",        kec:"Ulujadi",      lat:-0.9260, lng:119.8300 },
  // MANTIKULORE (8 kel)
  { nama:"Talise",           kec:"Mantikulore",  lat:-0.8450, lng:119.8910 },
  { nama:"Tondo",            kec:"Mantikulore",  lat:-0.8550, lng:119.9100 },
  { nama:"Kawatuna",         kec:"Mantikulore",  lat:-0.8700, lng:119.9200 },
  { nama:"Poboya",           kec:"Mantikulore",  lat:-0.8600, lng:119.9350 },
  { nama:"Layana Indah",     kec:"Mantikulore",  lat:-0.8380, lng:119.8980 },
  { nama:"Tanamodindi M",    kec:"Mantikulore",  lat:-0.8720, lng:119.8970 },
  { nama:"Vatu Nonju",       kec:"Mantikulore",  lat:-0.8500, lng:119.9200 },
  { nama:"Taipa",            kec:"Mantikulore",  lat:-0.8200, lng:119.8850 },
  // TAWAELI (5 kel)
  { nama:"Pantoloan",        kec:"Tawaeli",      lat:-0.7700, lng:119.8660 },
  { nama:"Tawaeli",          kec:"Tawaeli",      lat:-0.7600, lng:119.8610 },
  { nama:"Baiya",            kec:"Tawaeli",      lat:-0.7450, lng:119.8700 },
  { nama:"Lambara",          kec:"Tawaeli",      lat:-0.7350, lng:119.8620 },
  { nama:"Panau",            kec:"Tawaeli",      lat:-0.7200, lng:119.8700 },
];

// ── Kelurahan Dashboard (subset dengan data laporan) ───────
// Catatan: status & debit adalah data pelaporan warga/estimasi lapangan
// Bukan data sensor real-time — akan diisi oleh sistem pelaporan
const KELURAHAN_DATA = [
  { nama:"Talise",          kec:"Mantikulore", sumur:28, debit:28, kualitas:"Keruh",  status:"Kritis",  update:"Dari laporan warga" },
  { nama:"Besusu Timur",    kec:"Palu Timur",  sumur:21, debit:32, kualitas:"Berbau", status:"Kritis",  update:"Dari laporan warga" },
  { nama:"Lasoani",         kec:"Palu Timur",  sumur:19, debit:38, kualitas:"Keruh",  status:"Kritis",  update:"Dari laporan warga" },
  { nama:"Mamboro",         kec:"Palu Utara",  sumur:14, debit:36, kualitas:"Asin",   status:"Kritis",  update:"Dari laporan warga" },
  { nama:"Pantoloan",       kec:"Tawaeli",     sumur:12, debit:42, kualitas:"Keruh",  status:"Waspada", update:"Dari laporan warga" },
  { nama:"Tondo",           kec:"Mantikulore", sumur:22, debit:45, kualitas:"Jernih", status:"Waspada", update:"Dari laporan warga" },
  { nama:"Lolu Utara",      kec:"Palu Timur",  sumur:17, debit:48, kualitas:"Jernih", status:"Waspada", update:"Dari laporan warga" },
  { nama:"Tipo",            kec:"Ulujadi",     sumur:9,  debit:55, kualitas:"Jernih", status:"Waspada", update:"Dari laporan warga" },
  { nama:"Balaroa",         kec:"Palu Barat",  sumur:31, debit:62, kualitas:"Keruh",  status:"Waspada", update:"Dari laporan warga" },
  { nama:"Palupi",          kec:"Palu Selatan",sumur:18, debit:68, kualitas:"Jernih", status:"Waspada", update:"Dari laporan warga" },
  { nama:"Kamonji",         kec:"Palu Barat",  sumur:24, debit:75, kualitas:"Jernih", status:"Aman",    update:"Dari laporan warga" },
  { nama:"Besusu Tengah",   kec:"Palu Timur",  sumur:15, debit:72, kualitas:"Jernih", status:"Aman",    update:"Dari laporan warga" },
  { nama:"Boyaoge",         kec:"Tatanga",     sumur:20, debit:80, kualitas:"Jernih", status:"Aman",    update:"Dari laporan warga" },
  { nama:"Kabonena",        kec:"Ulujadi",     sumur:13, debit:83, kualitas:"Jernih", status:"Aman",    update:"Dari laporan warga" },
  { nama:"Nunu",            kec:"Tatanga",     sumur:16, debit:77, kualitas:"Jernih", status:"Aman",    update:"Dari laporan warga" },
  { nama:"Donggala Kodi",   kec:"Palu Barat",  sumur:11, debit:85, kualitas:"Jernih", status:"Aman",    update:"Dari laporan warga" },
  { nama:"Birobuli Utara",  kec:"Palu Selatan",sumur:19, debit:78, kualitas:"Jernih", status:"Aman",    update:"Dari laporan warga" },
  { nama:"Lolu Selatan",    kec:"Palu Timur",  sumur:22, debit:73, kualitas:"Jernih", status:"Aman",    update:"Dari laporan warga" },
  { nama:"Tavanjuka",       kec:"Tatanga",     sumur:14, debit:88, kualitas:"Jernih", status:"Aman",    update:"Dari laporan warga" },
  { nama:"Silae",           kec:"Ulujadi",     sumur:8,  debit:92, kualitas:"Jernih", status:"Aman",    update:"Dari laporan warga" },
];

// ── Titik Sumur (Crowdsourced Reports) ────────────────────
// Koordinat = koordinat kelurahan asli Kota Palu
// Status/debit = data pelaporan warga yang dikumpulkan SIMATA
const WELL_DATA = [
  // KRITIS — wilayah pesisir & terdampak likuifaksi 2018
  { id:"W001", name:"Sumur Warga Talise 1",     lat:-0.8430, lng:119.8930, status:"kritis",  debit:28, kualitas:"Keruh",  sensor:true,  kelurahan:"Talise",       kec:"Mantikulore" },
  { id:"W002", name:"Sumur Komunal Besusu",      lat:-0.8840, lng:119.8820, status:"kritis",  debit:32, kualitas:"Berbau", sensor:true,  kelurahan:"Besusu Timur", kec:"Palu Timur"  },
  { id:"W003", name:"Sumur RT04 Lasoani",        lat:-0.8660, lng:119.9060, status:"kritis",  debit:35, kualitas:"Keruh",  sensor:false, kelurahan:"Lasoani",      kec:"Palu Timur"  },
  { id:"W004", name:"Sumur Artesis Mamboro",     lat:-0.8030, lng:119.8620, status:"kritis",  debit:36, kualitas:"Asin",   sensor:true,  kelurahan:"Mamboro",      kec:"Palu Utara"  },
  { id:"W005", name:"Sumur Talise Pesisir",      lat:-0.8420, lng:119.8960, status:"kritis",  debit:22, kualitas:"Asin",   sensor:false, kelurahan:"Talise",       kec:"Mantikulore" },
  { id:"W006", name:"Sumur Layana Indah",        lat:-0.8390, lng:119.8990, status:"kritis",  debit:30, kualitas:"Keruh",  sensor:false, kelurahan:"Layana Indah", kec:"Mantikulore" },
  // WASPADA
  { id:"W007", name:"Sumur Pantoloan A",         lat:-0.7710, lng:119.8670, status:"waspada", debit:42, kualitas:"Jernih", sensor:false, kelurahan:"Pantoloan",    kec:"Tawaeli"     },
  { id:"W008", name:"Sumur RT12 Tondo",          lat:-0.8560, lng:119.9110, status:"waspada", debit:45, kualitas:"Jernih", sensor:true,  kelurahan:"Tondo",        kec:"Mantikulore" },
  { id:"W009", name:"Sumur Balaroa 1",           lat:-0.9060, lng:119.8510, status:"waspada", debit:52, kualitas:"Keruh",  sensor:false, kelurahan:"Balaroa",      kec:"Palu Barat"  },
  { id:"W010", name:"Sumur Balaroa 2",           lat:-0.9110, lng:119.8460, status:"waspada", debit:60, kualitas:"Keruh",  sensor:false, kelurahan:"Balaroa",      kec:"Palu Barat"  },
  { id:"W011", name:"Sumur Lolu Utara",          lat:-0.8790, lng:119.8860, status:"waspada", debit:48, kualitas:"Jernih", sensor:false, kelurahan:"Lolu Utara",   kec:"Palu Timur"  },
  { id:"W012", name:"Sumur Tipo 1",              lat:-0.9210, lng:119.8390, status:"waspada", debit:55, kualitas:"Jernih", sensor:true,  kelurahan:"Tipo",         kec:"Ulujadi"     },
  { id:"W013", name:"Sumur RT08 Palupi",         lat:-0.9130, lng:119.8580, status:"waspada", debit:65, kualitas:"Jernih", sensor:false, kelurahan:"Palupi",       kec:"Palu Selatan"},
  // AMAN
  { id:"W014", name:"Sumur Kamonji Komunal",     lat:-0.8960, lng:119.8610, status:"aman",    debit:75, kualitas:"Jernih", sensor:false, kelurahan:"Kamonji",      kec:"Palu Barat"  },
  { id:"W015", name:"Sumur Besusu Tengah",       lat:-0.8900, lng:119.8770, status:"aman",    debit:72, kualitas:"Jernih", sensor:false, kelurahan:"Besusu Tengah",kec:"Palu Timur"  },
  { id:"W016", name:"Sumur Boyaoge A",           lat:-0.9190, lng:119.8630, status:"aman",    debit:80, kualitas:"Jernih", sensor:true,  kelurahan:"Boyaoge",      kec:"Tatanga"     },
  { id:"W017", name:"Sumur Boyaoge B",           lat:-0.9160, lng:119.8670, status:"aman",    debit:83, kualitas:"Jernih", sensor:false, kelurahan:"Boyaoge",      kec:"Tatanga"     },
  { id:"W018", name:"Sumur Kabonena",            lat:-0.9310, lng:119.8430, status:"aman",    debit:83, kualitas:"Jernih", sensor:false, kelurahan:"Kabonena",     kec:"Ulujadi"     },
  { id:"W019", name:"Sumur Nunu",                lat:-0.9090, lng:119.8720, status:"aman",    debit:77, kualitas:"Jernih", sensor:false, kelurahan:"Nunu",         kec:"Tatanga"     },
  { id:"W020", name:"Sumur Donggala Kodi",       lat:-0.8830, lng:119.8440, status:"aman",    debit:85, kualitas:"Jernih", sensor:false, kelurahan:"Donggala Kodi",kec:"Palu Barat"  },
  { id:"W021", name:"Sumur Birobuli Utara A",    lat:-0.9230, lng:119.8760, status:"aman",    debit:78, kualitas:"Jernih", sensor:false, kelurahan:"Birobuli Utara",kec:"Palu Selatan"},
  { id:"W022", name:"Sumur Birobuli Utara B",    lat:-0.9270, lng:119.8800, status:"aman",    debit:82, kualitas:"Jernih", sensor:true,  kelurahan:"Birobuli Utara",kec:"Palu Selatan"},
  { id:"W023", name:"Sumur Tavanjuka",           lat:-0.9170, lng:119.8790, status:"aman",    debit:88, kualitas:"Jernih", sensor:false, kelurahan:"Tavanjuka",    kec:"Tatanga"     },
  { id:"W024", name:"Sumur Silae",               lat:-0.9360, lng:119.8340, status:"aman",    debit:92, kualitas:"Jernih", sensor:false, kelurahan:"Silae",        kec:"Ulujadi"     },
  { id:"W025", name:"Sumur Lolu Selatan",        lat:-0.8860, lng:119.8830, status:"aman",    debit:73, kualitas:"Jernih", sensor:false, kelurahan:"Lolu Selatan", kec:"Palu Timur"  },
];

// ── Open-Meteo API Config ──────────────────────────────────
// Sumber: https://open-meteo.com — FREE, no API key required
// Stasiun terdekat Kota Palu: -0.8787, 119.8585 (resolusi 5km grid)
const OPENMETEO_URL =
  'https://api.open-meteo.com/v1/forecast' +
  '?latitude=-0.891&longitude=119.872' +
  '&daily=precipitation_sum,temperature_2m_max,temperature_2m_min,weathercode' +
  '&current_weather=true' +
  '&timezone=Asia%2FMakassar' +
  '&forecast_days=7' +
  '&past_days=30';

// WMO Weather code → deskripsi (singkat)
const WMO_CODES = {
  0:'Cerah', 1:'Mostly Clear', 2:'Berawan Sebagian', 3:'Berawan',
  45:'Berkabut', 48:'Berkabut Beku',
  51:'Gerimis Ringan', 53:'Gerimis', 55:'Gerimis Lebat',
  61:'Hujan Ringan', 63:'Hujan', 65:'Hujan Lebat',
  71:'Salju Ringan', 73:'Salju', 75:'Salju Lebat',
  80:'Hujan Lokal', 81:'Hujan Deras Lokal', 82:'Hujan Sangat Deras',
  95:'Badai', 96:'Badai + Hujan Es', 99:'Badai + Hujan Es Lebat',
};

const WMO_EMOJI = {
  0:'☀️', 1:'🌤️', 2:'⛅', 3:'☁️',
  45:'🌫️', 48:'🌫️',
  51:'🌦️', 53:'🌧️', 55:'🌧️',
  61:'🌦️', 63:'🌧️', 65:'🌧️',
  80:'🌦️', 81:'🌧️', 82:'⛈️',
  95:'⛈️', 96:'⛈️', 99:'⛈️',
};

// ── Laporan Warga Terbaru (crowdsourced) ──────────────────
const RECENT_REPORTS = [
  { kelurahan:"Talise",       jenis:"Sumur gali debit turun drastis", time:"12 mnt lalu", status:"kritis"  },
  { kelurahan:"Balaroa",      jenis:"Air mulai keruh sejak kemarin",  time:"45 mnt lalu", status:"waspada" },
  { kelurahan:"Tondo",        jenis:"Sumur bor tetap normal",         time:"1 jam lalu",  status:"aman"    },
  { kelurahan:"Mamboro",      jenis:"Air terasa asin, butuh bantuan", time:"2 jam lalu",  status:"kritis"  },
  { kelurahan:"Kamonji",      jenis:"Kondisi sumur baik",             time:"3 jam lalu",  status:"aman"    },
];

// ── Dropdown Kelurahan per Kecamatan ──────────────────────
const KELURAHAN_MAP = {
  "palu-selatan": ["Birobuli Utara","Birobuli Selatan","Petobo","Tanamodindi","Pengawu","Palupi"],
  "palu-barat":   ["Balaroa","Kamonji","Ujuna","Donggala Kodi","Lere","Watusampu"],
  "palu-timur":   ["Besusu Timur","Besusu Tengah","Besusu Barat","Lolu Utara","Lolu Selatan","Lasoani"],
  "palu-utara":   ["Mamboro","Mamboro Barat","Kayumalue Ngapa","Kayumalue Pajeko"],
  "tatanga":      ["Boyaoge","Nunu","Palupi","Tavanjuka","Duyu","Tatura Utara"],
  "ulujadi":      ["Tipo","Kabonena","Silae","Donggala Kodi U","Buluri","Tipo Lama"],
  "mantikulore":  ["Talise","Tondo","Lasoani","Kawatuna","Poboya","Layana Indah","Vatu Nonju","Taipa"],
  "tawaeli":      ["Pantoloan","Tawaeli","Baiya","Lambara","Panau"],
};
