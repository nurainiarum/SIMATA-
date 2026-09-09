// ═══════════════════════════════════════════════════════════
// SIMATA — Database Layer (localStorage)
// Mensimulasikan MySQL di browser dengan localStorage
//
// Tabel:
//   tb_users        — akun admin (DLH, BPBD, Superadmin)
//   tb_kelurahan    — data status sumur per kelurahan
//   tb_laporan      — laporan kondisi sumur dari warga
//   tb_distribusi   — rencana distribusi air BPBD
//
// Semua perubahan data PERSISTEN antar sesi browser.
// ═══════════════════════════════════════════════════════════

const DB_VERSION = '2.0';

// ── Seed Data ──────────────────────────────────────────────

const SEED_USERS = [
  { id_user:1, username:'admin',      password:'simata2026', role:'DLH',        nama:'Admin DLH Palu',   email:'admin@dlh.palukota.go.id',   hp:'0451-421456', status:'aktif', created_at:'2026-01-01T00:00:00Z', last_login:null },
  { id_user:2, username:'bpbd',       password:'bpbd2026',   role:'BPBD',       nama:'Admin BPBD Palu',  email:'admin@bpbd.palukota.go.id',  hp:'0451-421234', status:'aktif', created_at:'2026-01-01T00:00:00Z', last_login:null },
  { id_user:3, username:'superadmin', password:'super2026',  role:'Superadmin', nama:'Superadmin SIMATA', email:'super@simata.palukota.go.id', hp:'0451-000000', status:'aktif', created_at:'2026-01-01T00:00:00Z', last_login:null },
];

const SEED_KELURAHAN = [
  { id_kelurahan:1,  nama:'Talise',         kec:'Mantikulore',  sumur:28, debit:28, kualitas:'Keruh',  zona_status:'Kritis',  lat:-0.8450, lng:119.8910 },
  { id_kelurahan:2,  nama:'Besusu Timur',   kec:'Palu Timur',   sumur:21, debit:32, kualitas:'Berbau', zona_status:'Kritis',  lat:-0.8830, lng:119.8810 },
  { id_kelurahan:3,  nama:'Lasoani',        kec:'Palu Timur',   sumur:19, debit:38, kualitas:'Keruh',  zona_status:'Kritis',  lat:-0.8650, lng:119.9050 },
  { id_kelurahan:4,  nama:'Mamboro',        kec:'Palu Utara',   sumur:14, debit:36, kualitas:'Asin',   zona_status:'Kritis',  lat:-0.8020, lng:119.8610 },
  { id_kelurahan:5,  nama:'Pantoloan',      kec:'Tawaeli',      sumur:12, debit:42, kualitas:'Keruh',  zona_status:'Waspada', lat:-0.7700, lng:119.8660 },
  { id_kelurahan:6,  nama:'Tondo',          kec:'Mantikulore',  sumur:22, debit:45, kualitas:'Jernih', zona_status:'Waspada', lat:-0.8550, lng:119.9100 },
  { id_kelurahan:7,  nama:'Lolu Utara',     kec:'Palu Timur',   sumur:17, debit:48, kualitas:'Jernih', zona_status:'Waspada', lat:-0.8780, lng:119.8850 },
  { id_kelurahan:8,  nama:'Tipo',           kec:'Ulujadi',      sumur:9,  debit:55, kualitas:'Jernih', zona_status:'Waspada', lat:-0.9200, lng:119.8380 },
  { id_kelurahan:9,  nama:'Balaroa',        kec:'Palu Barat',   sumur:31, debit:62, kualitas:'Keruh',  zona_status:'Waspada', lat:-0.9050, lng:119.8500 },
  { id_kelurahan:10, nama:'Palupi',         kec:'Palu Selatan', sumur:18, debit:68, kualitas:'Jernih', zona_status:'Waspada', lat:-0.9120, lng:119.8570 },
  { id_kelurahan:11, nama:'Kamonji',        kec:'Palu Barat',   sumur:24, debit:75, kualitas:'Jernih', zona_status:'Aman',    lat:-0.8950, lng:119.8600 },
  { id_kelurahan:12, nama:'Besusu Tengah',  kec:'Palu Timur',   sumur:15, debit:72, kualitas:'Jernih', zona_status:'Aman',    lat:-0.8890, lng:119.8760 },
  { id_kelurahan:13, nama:'Boyaoge',        kec:'Tatanga',      sumur:20, debit:80, kualitas:'Jernih', zona_status:'Aman',    lat:-0.9180, lng:119.8620 },
  { id_kelurahan:14, nama:'Kabonena',       kec:'Ulujadi',      sumur:13, debit:83, kualitas:'Jernih', zona_status:'Aman',    lat:-0.9300, lng:119.8420 },
  { id_kelurahan:15, nama:'Nunu',           kec:'Tatanga',      sumur:16, debit:77, kualitas:'Jernih', zona_status:'Aman',    lat:-0.9080, lng:119.8710 },
  { id_kelurahan:16, nama:'Donggala Kodi',  kec:'Palu Barat',   sumur:11, debit:85, kualitas:'Jernih', zona_status:'Aman',    lat:-0.8820, lng:119.8430 },
  { id_kelurahan:17, nama:'Birobuli Utara', kec:'Palu Selatan', sumur:19, debit:78, kualitas:'Jernih', zona_status:'Aman',    lat:-0.9220, lng:119.8750 },
  { id_kelurahan:18, nama:'Lolu Selatan',   kec:'Palu Timur',   sumur:22, debit:73, kualitas:'Jernih', zona_status:'Aman',    lat:-0.8850, lng:119.8820 },
  { id_kelurahan:19, nama:'Tavanjuka',      kec:'Tatanga',      sumur:14, debit:88, kualitas:'Jernih', zona_status:'Aman',    lat:-0.9160, lng:119.8780 },
  { id_kelurahan:20, nama:'Silae',          kec:'Ulujadi',      sumur:8,  debit:92, kualitas:'Jernih', zona_status:'Aman',    lat:-0.9350, lng:119.8330 },
];

const SEED_LAPORAN = [
  { id_laporan:'RPT-20260909-0012', id_kelurahan:1, kelurahan:'Talise',     kec:'Mantikulore', nama_pelapor:'Bapak Arif',   no_hp:'0812-3311-2200', alamat:'Jl. Talise No.12 RT.03', jenis_sumur:'Gali',  debit_persen:22, kualitas_air:'Asin',   catatan:'Air terasa asin sejak 3 hari lalu', tanggal_lapor:'2026-09-09T01:12:00Z', status_validasi:'Pending', tanggal_validasi:null, id_validator:null },
  { id_laporan:'RPT-20260909-0031', id_kelurahan:9, kelurahan:'Balaroa',    kec:'Palu Barat',  nama_pelapor:'Ibu Nining',   no_hp:'0813-4422-1100', alamat:'Jl. Balaroa RT.07',      jenis_sumur:'Gali',  debit_persen:48, kualitas_air:'Keruh',  catatan:'Air mulai keruh sejak seminggu', tanggal_lapor:'2026-09-09T00:55:00Z', status_validasi:'Pending', tanggal_validasi:null, id_validator:null },
  { id_laporan:'RPT-20260909-0044', id_kelurahan:7, kelurahan:'Lolu Utara', kec:'Palu Timur',  nama_pelapor:'Bapak Dedi',   no_hp:'0811-5533-9900', alamat:'Jl. Lolu Blok C RT.02',  jenis_sumur:'Bor',   debit_persen:61, kualitas_air:'Jernih', catatan:'Kondisi masih normal tapi debit turun', tanggal_lapor:'2026-09-09T00:30:00Z', status_validasi:'Pending', tanggal_validasi:null, id_validator:null },
  { id_laporan:'RPT-20260909-0056', id_kelurahan:4, kelurahan:'Mamboro',    kec:'Palu Utara',  nama_pelapor:'Ibu Sari',     no_hp:'0812-6644-8800', alamat:'Jl. Mamboro Barat RT.05', jenis_sumur:'Gali',  debit_persen:18, kualitas_air:'Berbau', catatan:'Air berbau sejak setelah hujan kemarin', tanggal_lapor:'2026-09-08T23:45:00Z', status_validasi:'Pending', tanggal_validasi:null, id_validator:null },
  { id_laporan:'RPT-20260908-0098', id_kelurahan:2, kelurahan:'Besusu Timur',kec:'Palu Timur', nama_pelapor:'Bapak Rahmat', no_hp:'0814-7755-3300', alamat:'Jl. Besusu Timur RT.01',  jenis_sumur:'Gali',  debit_persen:30, kualitas_air:'Berbau', catatan:'Sumur bau amis tidak bisa dipakai', tanggal_lapor:'2026-09-08T14:20:00Z', status_validasi:'Valid',   tanggal_validasi:'2026-09-08T16:00:00Z', id_validator:1 },
  { id_laporan:'RPT-20260908-0077', id_kelurahan:11,kelurahan:'Kamonji',    kec:'Palu Barat',  nama_pelapor:'Ibu Fatimah',  no_hp:'0815-8866-4400', alamat:'Jl. Kamonji RT.09',       jenis_sumur:'Artesis',debit_persen:78, kualitas_air:'Jernih', catatan:'Sumur artesis masih bagus', tanggal_lapor:'2026-09-08T10:15:00Z', status_validasi:'Valid',   tanggal_validasi:'2026-09-08T12:30:00Z', id_validator:1 },
];

const SEED_DISTRIBUSI = [
  { id_distribusi:1001, kelurahan:'Talise',       kec:'Mantikulore', zona:'kritis',  no_truk:'A03', volume:'8.000 L', tanggal:'2026-09-10', jam:'08:00', catatan:'Titik distribusi di masjid kelurahan', status:'Terjadwal', created_at:'2026-09-09T02:00:00Z' },
  { id_distribusi:1002, kelurahan:'Besusu Timur', kec:'Palu Timur',  zona:'kritis',  no_truk:'B07', volume:'8.000 L', tanggal:'2026-09-10', jam:'10:00', catatan:'Koordinasi RT.01 dan RT.02',           status:'Terjadwal', created_at:'2026-09-09T02:05:00Z' },
  { id_distribusi:1003, kelurahan:'Mamboro',      kec:'Palu Utara',  zona:'kritis',  no_truk:null,  volume:'8.000 L', tanggal:null,         jam:null,    catatan:'Menunggu konfirmasi',                  status:'Menunggu',  created_at:'2026-09-09T02:10:00Z' },
  { id_distribusi:1004, kelurahan:'Lasoani',      kec:'Palu Timur',  zona:'kritis',  no_truk:null,  volume:'8.000 L', tanggal:null,         jam:null,    catatan:'Menunggu konfirmasi',                  status:'Menunggu',  created_at:'2026-09-09T02:15:00Z' },
  { id_distribusi:1005, kelurahan:'Balaroa',      kec:'Palu Barat',  zona:'waspada', no_truk:'C02', volume:'5.000 L', tanggal:'2026-09-11', jam:'09:00', catatan:'',                                     status:'Terjadwal', created_at:'2026-09-09T02:20:00Z' },
  { id_distribusi:1006, kelurahan:'Pantoloan',    kec:'Tawaeli',     zona:'waspada', no_truk:null,  volume:'5.000 L', tanggal:null,         jam:null,    catatan:'Cek kondisi dulu',                     status:'Standby',   created_at:'2026-09-09T02:25:00Z' },
];

// ── Database Engine ────────────────────────────────────────

const DB = {

  // ── Internal helpers ──────────────────────────────────────
  _get(table) {
    try {
      const raw = localStorage.getItem('simata_' + table);
      return raw ? JSON.parse(raw) : [];
    } catch(e) { return []; }
  },

  _set(table, data) {
    localStorage.setItem('simata_' + table, JSON.stringify(data));
  },

  // ── Inisialisasi (seed) ────────────────────────────────────
  init() {
    if (localStorage.getItem('simata_db_ver') === DB_VERSION) return;
    console.log('[SIMATA DB] Initializing database v' + DB_VERSION + '...');
    this._set('tb_users',       SEED_USERS);
    this._set('tb_kelurahan',   SEED_KELURAHAN);
    this._set('tb_laporan',     SEED_LAPORAN);
    this._set('tb_distribusi',  SEED_DISTRIBUSI);
    localStorage.setItem('simata_db_ver', DB_VERSION);
    console.log('[SIMATA DB] ✅ Database ready — 4 tables initialized');
  },

  // ═══════════════════════════════════════════════════════════
  //  tb_users
  // ═══════════════════════════════════════════════════════════
  users: {
    findAll() {
      return DB._get('tb_users');
    },
    findByUsername(username) {
      return DB._get('tb_users').find(u => u.username === username) || null;
    },
    findByCredentials(username, password, role) {
      return DB._get('tb_users').find(
        u => u.username === username && u.password === password && u.role === role
      ) || null;
    },
    insert(user) {
      const all = DB._get('tb_users');
      const maxId = all.reduce((m, u) => Math.max(m, u.id_user), 0);
      const newUser = {
        id_user:    maxId + 1,
        username:   user.username,
        password:   user.password,
        role:       user.role,
        nama:       user.nama,
        email:      user.email || '',
        hp:         user.hp   || '',
        status:     'aktif',
        created_at: new Date().toISOString(),
        last_login: null,
      };
      all.push(newUser);
      DB._set('tb_users', all);
      console.log('[DB] INSERT tb_users:', newUser.username, '(' + newUser.role + ')');
      return newUser;
    },
    updateLastLogin(username) {
      const all = DB._get('tb_users');
      const idx = all.findIndex(u => u.username === username);
      if (idx !== -1) {
        all[idx].last_login = new Date().toISOString();
        DB._set('tb_users', all);
      }
    },
    updateStatus(id_user, status) {
      const all = DB._get('tb_users');
      const idx = all.findIndex(u => u.id_user === id_user);
      if (idx !== -1) { all[idx].status = status; DB._set('tb_users', all); }
    },
  },

  // ═══════════════════════════════════════════════════════════
  //  tb_kelurahan
  // ═══════════════════════════════════════════════════════════
  kelurahan: {
    findAll() {
      return DB._get('tb_kelurahan');
    },
    findById(id) {
      return DB._get('tb_kelurahan').find(k => k.id_kelurahan === id) || null;
    },
    findByStatus(status) {
      return DB._get('tb_kelurahan').filter(k => k.zona_status === status);
    },
    update(id_kelurahan, fields) {
      const all = DB._get('tb_kelurahan');
      const idx = all.findIndex(k => k.id_kelurahan === id_kelurahan);
      if (idx !== -1) {
        Object.assign(all[idx], fields);
        DB._set('tb_kelurahan', all);
      }
    },
  },

  // ═══════════════════════════════════════════════════════════
  //  tb_laporan
  // ═══════════════════════════════════════════════════════════
  laporan: {
    findAll() {
      return DB._get('tb_laporan');
    },
    findPending() {
      return DB._get('tb_laporan').filter(l => l.status_validasi === 'Pending');
    },
    findByKelurahan(nama) {
      return DB._get('tb_laporan').filter(l => l.kelurahan === nama);
    },
    insert(data) {
      const all  = DB._get('tb_laporan');
      const now  = new Date();
      const dateStr = now.toISOString().slice(0,10).replace(/-/g,'');
      const seq  = String(all.length + 1).padStart(4, '0');
      const newL = {
        id_laporan:       'RPT-' + dateStr + '-' + seq,
        id_kelurahan:     data.id_kelurahan || null,
        kelurahan:        data.kelurahan    || '',
        kec:              data.kec          || '',
        nama_pelapor:     data.nama_pelapor || 'Anonim',
        no_hp:            data.no_hp        || '',
        alamat:           data.alamat       || '',
        jenis_sumur:      data.jenis_sumur  || 'Gali',
        debit_persen:     data.debit_persen || 0,
        kualitas_air:     data.kualitas_air || 'Jernih',
        catatan:          data.catatan      || '',
        tanggal_lapor:    now.toISOString(),
        status_validasi:  'Pending',
        tanggal_validasi: null,
        id_validator:     null,
      };
      all.unshift(newL);
      DB._set('tb_laporan', all);
      console.log('[DB] INSERT tb_laporan:', newL.id_laporan, '-', newL.kelurahan);
      return newL;
    },
    updateStatus(id_laporan, status, id_validator) {
      const all = DB._get('tb_laporan');
      const idx = all.findIndex(l => l.id_laporan === id_laporan);
      if (idx !== -1) {
        all[idx].status_validasi  = status;
        all[idx].tanggal_validasi = new Date().toISOString();
        all[idx].id_validator     = id_validator || null;
        DB._set('tb_laporan', all);
        console.log('[DB] UPDATE tb_laporan:', id_laporan, '→', status);
      }
    },
  },

  // ═══════════════════════════════════════════════════════════
  //  tb_distribusi
  // ═══════════════════════════════════════════════════════════
  distribusi: {
    findAll() {
      return DB._get('tb_distribusi');
    },
    findByZona(zona) {
      return DB._get('tb_distribusi').filter(d => d.zona === zona);
    },
    insert(data) {
      const all = DB._get('tb_distribusi');
      const maxId = all.reduce((m, d) => Math.max(m, d.id_distribusi), 1000);
      const newD = {
        id_distribusi: maxId + 1,
        kelurahan:  data.kelurahan || '',
        kec:        data.kec       || '',
        zona:       data.zona      || 'kritis',
        no_truk:    data.no_truk   || null,
        volume:     data.volume    || '8.000 L',
        tanggal:    data.tanggal   || null,
        jam:        data.jam       || null,
        catatan:    data.catatan   || '',
        status:     'Terjadwal',
        created_at: new Date().toISOString(),
      };
      all.unshift(newD);
      DB._set('tb_distribusi', all);
      console.log('[DB] INSERT tb_distribusi:', newD.kelurahan, 'Truk #' + newD.no_truk);
      return newD;
    },
    updateStatus(id_distribusi, status) {
      const all = DB._get('tb_distribusi');
      const idx = all.findIndex(d => d.id_distribusi === id_distribusi);
      if (idx !== -1) { all[idx].status = status; DB._set('tb_distribusi', all); }
    },
    delete(id_distribusi) {
      const all = DB._get('tb_distribusi').filter(d => d.id_distribusi !== id_distribusi);
      DB._set('tb_distribusi', all);
    },
  },

  // ═══════════════════════════════════════════════════════════
  //  Utilities
  // ═══════════════════════════════════════════════════════════
  stats() {
    return {
      users:      this._get('tb_users').length,
      kelurahan:  this._get('tb_kelurahan').length,
      laporan:    this._get('tb_laporan').length,
      pending:    this._get('tb_laporan').filter(l => l.status_validasi === 'Pending').length,
      distribusi: this._get('tb_distribusi').length,
    };
  },

  reset() {
    ['tb_users','tb_kelurahan','tb_laporan','tb_distribusi'].forEach(t =>
      localStorage.removeItem('simata_' + t)
    );
    localStorage.removeItem('simata_db_ver');
    this.init();
    console.log('[SIMATA DB] 🔄 Database reset to seed data');
  },

  exportJSON() {
    const data = {
      version:     DB_VERSION,
      exported_at: new Date().toISOString(),
      stats:       this.stats(),
      tb_users:    this._get('tb_users').map(u => ({ ...u, password: '***' })),
      tb_kelurahan:  this._get('tb_kelurahan'),
      tb_laporan:    this._get('tb_laporan'),
      tb_distribusi: this._get('tb_distribusi'),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'SIMATA_DB_Export_' + new Date().toLocaleDateString('id-ID').replace(/\//g,'-') + '.json';
    a.click(); URL.revokeObjectURL(url);
    console.log('[DB] Database exported');
  },
};

// Auto-init on load
DB.init();
