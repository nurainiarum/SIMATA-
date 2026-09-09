// ═══════════════════════════════════════════════════════════
// SIMATA — Supabase Database Layer
// Project : SIMATA Kota Palu
// URL     : https://gjtunexojmrqjogeiepi.supabase.co
// Tables  : tb_users · tb_kelurahan · tb_laporan · tb_distribusi
// ═══════════════════════════════════════════════════════════

const SUPABASE_URL  = 'https://gjtunexojmrqjogeiepi.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqdHVuZXhvam1ycWpvZ2VpZXBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5NDMwNTUsImV4cCI6MjEwNDUxOTA1NX0.beSfAUV5CV-8aRARURRFbagGIiBpxcxPB0oKT1aJYO0';

const { createClient } = supabase;
const _sb = createClient(SUPABASE_URL, SUPABASE_ANON);

console.log('[Supabase] Client initialized →', SUPABASE_URL);

// ── Seed Data ─────────────────────────────────────────────

const SEED_USERS = [
  { username:'admin',      password:'simata2026', role:'DLH',        nama:'Admin DLH Palu',   email:'admin@dlh.palukota.go.id',   hp:'0451-421456', status:'aktif' },
  { username:'bpbd',       password:'bpbd2026',   role:'BPBD',       nama:'Admin BPBD Palu',  email:'admin@bpbd.palukota.go.id',  hp:'0451-421234', status:'aktif' },
  { username:'superadmin', password:'super2026',  role:'Superadmin', nama:'Superadmin SIMATA', email:'super@simata.palukota.go.id', hp:'0451-000000', status:'aktif' },
];

const SEED_KELURAHAN = [
  { nama:'Talise',         kec:'Mantikulore',  sumur:28, debit:28, kualitas:'Keruh',  zona_status:'Kritis',  lat:-0.8450, lng:119.8910 },
  { nama:'Besusu Timur',   kec:'Palu Timur',   sumur:21, debit:32, kualitas:'Berbau', zona_status:'Kritis',  lat:-0.8830, lng:119.8810 },
  { nama:'Lasoani',        kec:'Palu Timur',   sumur:19, debit:38, kualitas:'Keruh',  zona_status:'Kritis',  lat:-0.8650, lng:119.9050 },
  { nama:'Mamboro',        kec:'Palu Utara',   sumur:14, debit:36, kualitas:'Asin',   zona_status:'Kritis',  lat:-0.8020, lng:119.8610 },
  { nama:'Pantoloan',      kec:'Tawaeli',      sumur:12, debit:42, kualitas:'Keruh',  zona_status:'Waspada', lat:-0.7700, lng:119.8660 },
  { nama:'Tondo',          kec:'Mantikulore',  sumur:22, debit:45, kualitas:'Jernih', zona_status:'Waspada', lat:-0.8550, lng:119.9100 },
  { nama:'Lolu Utara',     kec:'Palu Timur',   sumur:17, debit:48, kualitas:'Jernih', zona_status:'Waspada', lat:-0.8780, lng:119.8850 },
  { nama:'Tipo',           kec:'Ulujadi',      sumur:9,  debit:55, kualitas:'Jernih', zona_status:'Waspada', lat:-0.9200, lng:119.8380 },
  { nama:'Balaroa',        kec:'Palu Barat',   sumur:31, debit:62, kualitas:'Keruh',  zona_status:'Waspada', lat:-0.9050, lng:119.8500 },
  { nama:'Palupi',         kec:'Palu Selatan', sumur:18, debit:68, kualitas:'Jernih', zona_status:'Waspada', lat:-0.9120, lng:119.8570 },
  { nama:'Kamonji',        kec:'Palu Barat',   sumur:24, debit:75, kualitas:'Jernih', zona_status:'Aman',    lat:-0.8950, lng:119.8600 },
  { nama:'Besusu Tengah',  kec:'Palu Timur',   sumur:15, debit:72, kualitas:'Jernih', zona_status:'Aman',    lat:-0.8890, lng:119.8760 },
  { nama:'Boyaoge',        kec:'Tatanga',      sumur:20, debit:80, kualitas:'Jernih', zona_status:'Aman',    lat:-0.9180, lng:119.8620 },
  { nama:'Kabonena',       kec:'Ulujadi',      sumur:13, debit:83, kualitas:'Jernih', zona_status:'Aman',    lat:-0.9300, lng:119.8420 },
  { nama:'Nunu',           kec:'Tatanga',      sumur:16, debit:77, kualitas:'Jernih', zona_status:'Aman',    lat:-0.9080, lng:119.8710 },
  { nama:'Donggala Kodi',  kec:'Palu Barat',   sumur:11, debit:85, kualitas:'Jernih', zona_status:'Aman',    lat:-0.8820, lng:119.8430 },
  { nama:'Birobuli Utara', kec:'Palu Selatan', sumur:19, debit:78, kualitas:'Jernih', zona_status:'Aman',    lat:-0.9220, lng:119.8750 },
  { nama:'Lolu Selatan',   kec:'Palu Timur',   sumur:22, debit:73, kualitas:'Jernih', zona_status:'Aman',    lat:-0.8850, lng:119.8820 },
  { nama:'Tavanjuka',      kec:'Tatanga',      sumur:14, debit:88, kualitas:'Jernih', zona_status:'Aman',    lat:-0.9160, lng:119.8780 },
  { nama:'Silae',          kec:'Ulujadi',      sumur:8,  debit:92, kualitas:'Jernih', zona_status:'Aman',    lat:-0.9350, lng:119.8330 },
];

const SEED_LAPORAN = [
  { id_laporan:'RPT-20260909-0012', kelurahan:'Talise',      kec:'Mantikulore', nama_pelapor:'Bapak Arif',   no_hp:'0812-3311-2200', alamat:'Jl. Talise No.12 RT.03',       jenis_sumur:'Gali',   debit_persen:22, kualitas_air:'Asin',   catatan:'Air terasa asin sejak 3 hari lalu',           status_validasi:'Pending' },
  { id_laporan:'RPT-20260909-0031', kelurahan:'Balaroa',     kec:'Palu Barat',  nama_pelapor:'Ibu Nining',   no_hp:'0813-4422-1100', alamat:'Jl. Balaroa RT.07',              jenis_sumur:'Gali',   debit_persen:48, kualitas_air:'Keruh',  catatan:'Air mulai keruh sejak seminggu',               status_validasi:'Pending' },
  { id_laporan:'RPT-20260909-0044', kelurahan:'Lolu Utara',  kec:'Palu Timur',  nama_pelapor:'Bapak Dedi',   no_hp:'0811-5533-9900', alamat:'Jl. Lolu Blok C RT.02',         jenis_sumur:'Bor',    debit_persen:61, kualitas_air:'Jernih', catatan:'Kondisi masih normal tapi debit turun',        status_validasi:'Pending' },
  { id_laporan:'RPT-20260909-0056', kelurahan:'Mamboro',     kec:'Palu Utara',  nama_pelapor:'Ibu Sari',     no_hp:'0812-6644-8800', alamat:'Jl. Mamboro Barat RT.05',       jenis_sumur:'Gali',   debit_persen:18, kualitas_air:'Berbau', catatan:'Air berbau sejak setelah hujan kemarin',       status_validasi:'Pending' },
  { id_laporan:'RPT-20260908-0098', kelurahan:'Besusu Timur',kec:'Palu Timur',  nama_pelapor:'Bapak Rahmat', no_hp:'0814-7755-3300', alamat:'Jl. Besusu Timur RT.01',        jenis_sumur:'Gali',   debit_persen:30, kualitas_air:'Berbau', catatan:'Sumur bau amis tidak bisa dipakai',           status_validasi:'Valid'   },
  { id_laporan:'RPT-20260908-0077', kelurahan:'Kamonji',     kec:'Palu Barat',  nama_pelapor:'Ibu Fatimah',  no_hp:'0815-8866-4400', alamat:'Jl. Kamonji RT.09',             jenis_sumur:'Artesis',debit_persen:78, kualitas_air:'Jernih', catatan:'Sumur artesis masih bagus',                   status_validasi:'Valid'   },
];

const SEED_DISTRIBUSI = [
  { kelurahan:'Talise',       kec:'Mantikulore', zona:'kritis',  no_truk:'A03', volume:'8.000 L', tanggal:'2026-09-10', jam:'08:00:00', catatan:'Titik distribusi di masjid kelurahan', status:'Terjadwal' },
  { kelurahan:'Besusu Timur', kec:'Palu Timur',  zona:'kritis',  no_truk:'B07', volume:'8.000 L', tanggal:'2026-09-10', jam:'10:00:00', catatan:'Koordinasi RT.01 dan RT.02',           status:'Terjadwal' },
  { kelurahan:'Mamboro',      kec:'Palu Utara',  zona:'kritis',  no_truk:null,  volume:'8.000 L', tanggal:null,         jam:null,         catatan:'Menunggu konfirmasi',                  status:'Menunggu'  },
  { kelurahan:'Lasoani',      kec:'Palu Timur',  zona:'kritis',  no_truk:null,  volume:'8.000 L', tanggal:null,         jam:null,         catatan:'Menunggu konfirmasi',                  status:'Menunggu'  },
  { kelurahan:'Balaroa',      kec:'Palu Barat',  zona:'waspada', no_truk:'C02', volume:'5.000 L', tanggal:'2026-09-11', jam:'09:00:00', catatan:'',                                     status:'Terjadwal' },
  { kelurahan:'Pantoloan',    kec:'Tawaeli',     zona:'waspada', no_truk:null,  volume:'5.000 L', tanggal:null,         jam:null,         catatan:'Cek kondisi dulu',                     status:'Standby'   },
];

// ═══════════════════════════════════════════════════════════
// SB — Supabase Database API
// ═══════════════════════════════════════════════════════════

const SB = {

  // ── Inisialisasi & Seed ────────────────────────────────────
  async init() {
    try {
      // Cek apakah tb_kelurahan sudah terisi
      const { data, error } = await _sb.from('tb_kelurahan').select('id_kelurahan').limit(1);
      if (error) {
        console.error('[Supabase] Error checking tables:', error.message);
        showToast('⚠️ Gagal terhubung ke database. Cek koneksi internet.', 'warning');
        return;
      }

      if (data && data.length > 0) {
        console.log('[Supabase] ✅ Database already seeded, ready to use');
        return;
      }

      // Seed data jika tabel kosong
      console.log('[Supabase] Seeding database...');
      showToast('⏳ Menyiapkan database pertama kali...', 'info');

      const { error: e1 } = await _sb.from('tb_users').insert(SEED_USERS);
      if (e1) console.warn('[Supabase] Seed users:', e1.message);

      const { error: e2 } = await _sb.from('tb_kelurahan').insert(SEED_KELURAHAN);
      if (e2) console.warn('[Supabase] Seed kelurahan:', e2.message);

      const { error: e3 } = await _sb.from('tb_laporan').insert(SEED_LAPORAN);
      if (e3) console.warn('[Supabase] Seed laporan:', e3.message);

      const { error: e4 } = await _sb.from('tb_distribusi').insert(SEED_DISTRIBUSI);
      if (e4) console.warn('[Supabase] Seed distribusi:', e4.message);

      console.log('[Supabase] ✅ Database seeded successfully');
      showToast('✅ Database Supabase berhasil diinisialisasi!', 'success');
    } catch(e) {
      console.error('[Supabase] Init error:', e);
    }
  },

  // ═══════════════════════════════════════════════════════════
  //  tb_users
  // ═══════════════════════════════════════════════════════════
  users: {
    async findAll() {
      const { data, error } = await _sb
        .from('tb_users').select('*').order('id_user');
      if (error) { console.error('[SB] users.findAll:', error.message); return []; }
      return data;
    },

    async findByUsername(username) {
      const { data } = await _sb
        .from('tb_users').select('*').eq('username', username).maybeSingle();
      return data || null;
    },

    async findByCredentials(username, password, role) {
      const { data, error } = await _sb
        .from('tb_users').select('*')
        .eq('username', username)
        .eq('password', password)
        .eq('role', role)
        .maybeSingle();
      if (error || !data) return null;
      return data;
    },

    async insert(user) {
      const { data, error } = await _sb
        .from('tb_users')
        .insert({ ...user, status: user.status || 'aktif' })
        .select().single();
      if (error) throw new Error(error.message);
      console.log('[SB] INSERT tb_users:', data.username);
      return data;
    },

    async updateLastLogin(username) {
      await _sb.from('tb_users')
        .update({ last_login: new Date().toISOString() })
        .eq('username', username);
    },

    async updateStatus(id_user, status) {
      await _sb.from('tb_users').update({ status }).eq('id_user', id_user);
    },
  },

  // ═══════════════════════════════════════════════════════════
  //  tb_kelurahan
  // ═══════════════════════════════════════════════════════════
  kelurahan: {
    async findAll() {
      const { data, error } = await _sb
        .from('tb_kelurahan').select('*').order('id_kelurahan');
      if (error) { console.error('[SB] kelurahan.findAll:', error.message); return []; }
      return data;
    },

    async findByStatus(status) {
      const { data } = await _sb
        .from('tb_kelurahan').select('*').eq('zona_status', status);
      return data || [];
    },

    async update(id_kelurahan, fields) {
      const { error } = await _sb
        .from('tb_kelurahan').update(fields).eq('id_kelurahan', id_kelurahan);
      if (error) console.error('[SB] kelurahan.update:', error.message);
    },
  },

  // ═══════════════════════════════════════════════════════════
  //  tb_laporan
  // ═══════════════════════════════════════════════════════════
  laporan: {
    async findAll() {
      const { data, error } = await _sb
        .from('tb_laporan').select('*')
        .order('tanggal_lapor', { ascending: false });
      if (error) { console.error('[SB] laporan.findAll:', error.message); return []; }
      return data;
    },

    async findPending() {
      const { data, error } = await _sb
        .from('tb_laporan').select('*')
        .eq('status_validasi', 'Pending')
        .order('tanggal_lapor', { ascending: false });
      if (error) { console.error('[SB] laporan.findPending:', error.message); return []; }
      return data;
    },

    async insert(laporan) {
      const now = new Date();
      const dateStr = now.toISOString().slice(0,10).replace(/-/g,'');
      const seq = String(Math.floor(Math.random() * 8999) + 1000);
      const id  = 'RPT-' + dateStr + '-' + seq;

      const payload = {
        id_laporan:      id,
        kelurahan:       laporan.kelurahan    || '',
        kec:             laporan.kec          || '',
        nama_pelapor:    laporan.nama_pelapor || 'Anonim',
        no_hp:           laporan.no_hp        || '',
        alamat:          laporan.alamat       || '',
        jenis_sumur:     laporan.jenis_sumur  || 'Gali',
        debit_persen:    laporan.debit_persen || 0,
        kualitas_air:    laporan.kualitas_air || 'Jernih',
        catatan:         laporan.catatan      || '',
        lat_sumur:       laporan.lat_sumur    || null,
        lng_sumur:       laporan.lng_sumur    || null,
        status_validasi: 'Pending',
      };

      const { data, error } = await _sb
        .from('tb_laporan').insert(payload).select().single();
      if (error) throw new Error(error.message);
      console.log('[SB] INSERT tb_laporan:', data.id_laporan);
      return data;
    },

    async updateStatus(id_laporan, status, id_validator) {
      const { error } = await _sb.from('tb_laporan')
        .update({
          status_validasi:  status,
          tanggal_validasi: new Date().toISOString(),
          id_validator:     id_validator || null,
        })
        .eq('id_laporan', id_laporan);
      if (error) console.error('[SB] laporan.updateStatus:', error.message);
      else console.log('[SB] UPDATE tb_laporan:', id_laporan, '→', status);
    },
  },

  // ═══════════════════════════════════════════════════════════
  //  tb_distribusi
  // ═══════════════════════════════════════════════════════════
  distribusi: {
    async findAll() {
      const { data, error } = await _sb
        .from('tb_distribusi').select('*')
        .order('id_distribusi', { ascending: false });
      if (error) { console.error('[SB] distribusi.findAll:', error.message); return []; }
      return data;
    },

    async findByZona(zona) {
      const { data } = await _sb
        .from('tb_distribusi').select('*').eq('zona', zona)
        .order('id_distribusi', { ascending: false });
      return data || [];
    },

    async insert(rute) {
      const payload = {
        kelurahan: rute.kelurahan || '',
        kec:       rute.kec      || '',
        zona:      rute.zona     || 'kritis',
        no_truk:   rute.no_truk  || null,
        volume:    rute.volume   || '8.000 L',
        tanggal:   rute.tanggal  || null,
        jam:       rute.jam ? rute.jam + ':00' : null,
        catatan:   rute.catatan  || '',
        status:    'Terjadwal',
      };
      const { data, error } = await _sb
        .from('tb_distribusi').insert(payload).select().single();
      if (error) throw new Error(error.message);
      console.log('[SB] INSERT tb_distribusi:', data.kelurahan, 'Truk #' + data.no_truk);
      return data;
    },

    async updateStatus(id_distribusi, status) {
      await _sb.from('tb_distribusi').update({ status }).eq('id_distribusi', id_distribusi);
    },
  },

  // ═══════════════════════════════════════════════════════════
  //  Utilities
  // ═══════════════════════════════════════════════════════════
  async stats() {
    const [u, k, l, d, p] = await Promise.all([
      _sb.from('tb_users').select('*', { count:'exact', head:true }),
      _sb.from('tb_kelurahan').select('*', { count:'exact', head:true }),
      _sb.from('tb_laporan').select('*', { count:'exact', head:true }),
      _sb.from('tb_distribusi').select('*', { count:'exact', head:true }),
      _sb.from('tb_laporan').select('*', { count:'exact', head:true }).eq('status_validasi','Pending'),
    ]);
    return {
      users:      u.count || 0,
      kelurahan:  k.count || 0,
      laporan:    l.count || 0,
      distribusi: d.count || 0,
      pending:    p.count || 0,
    };
  },

  async exportJSON() {
    const [users, kelurahan, laporan, distribusi] = await Promise.all([
      _sb.from('tb_users').select('*'),
      _sb.from('tb_kelurahan').select('*'),
      _sb.from('tb_laporan').select('*'),
      _sb.from('tb_distribusi').select('*'),
    ]);
    const data = {
      project:     'SIMATA Kota Palu',
      exported_at: new Date().toISOString(),
      stats:       await SB.stats(),
      tb_users:    (users.data || []).map(u => ({ ...u, password: '***' })),
      tb_kelurahan:  kelurahan.data  || [],
      tb_laporan:    laporan.data    || [],
      tb_distribusi: distribusi.data || [],
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement('a'), {
      href: url,
      download: 'SIMATA_Supabase_Export_' + new Date().toLocaleDateString('id-ID').replace(/\//g,'-') + '.json',
    });
    a.click(); URL.revokeObjectURL(url);
  },
};
