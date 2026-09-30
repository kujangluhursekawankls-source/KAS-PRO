# 📊 Buku Kas Pro

Aplikasi Pengelolaan Kas Usaha & Keuangan Toko / Pribadi Online Berbasis **Firebase**, siap pakai sebagai **Progressive Web App (PWA)** dengan sinkronisasi *realtime*, multi-user, backup otomatis, dan integrasi WhatsApp.

---

## 🌟 Fitur Utama

1. **Sistem Online Firebase Realtime**
   - Menggunakan **Cloud Firestore** untuk sinkronisasi transaksi, kategori, dan banner secara *real-time*.
   - Mode *offline-first* dengan auto-cache di perangkat lokal.

2. **Multi-User & Keamanan Data (Security Rules)**
   - Setiap pengguna memiliki ruang data terisolasi berdasarkan Firebase Auth UID.
   - Data Pengguna A tidak dapat dibaca atau diubah oleh Pengguna B.
   - Aturan keamanan (*Security Rules*) sudah terpasang dan tervalidasi.

3. **Banner Usaha Dinamis Terintegrasi**
   - Banner promo / toko tampil langsung menyatu di kartu Saldo Beranda (*Hero Card*).
   - Menu update, ganti foto, dan hapus banner lengkap di menu **Setting**.
   - Mendukung format JPG, PNG, dan WEBP dengan kompresi otomatis.

4. **Siap Diinstal Sebagai PWA (Progressive Web App)**
   - Dapat diinstal langsung di Android, iPhone, dan Komputer/Laptop.
   - Mendukung akses cepat dan offline caching via Service Worker.

5. **Laporan & Ekspor Lengkap**
   - Cetak laporan PDF resmi dengan kop toko & logo usaha.
   - Ekspor data transaksi ke Microsoft Excel (`.xlsx`).
   - Kirim struk nota digital dan laporan kas langsung ke WhatsApp via `wa.me`.

6. **Backup & Keamanan**
   - Backup otomatis setiap transaksi diperbarui.
   - Ekspor dan impor data cadangan JSON terenkripsi/tervalidasi.
   - Fitur Kunci Aplikasi dengan PIN keamanan.

---

## 🚀 Panduan Menjalankan di Komputer Lokal

### 1. Prasyarat
- **Node.js** versi 18 atau lebih baru.
- **npm** atau **bun**.

### 2. Instalasi & Menjalankan Dev Server
```bash
# Clone repository dari GitHub
git clone https://github.com/USERNAME/buku-kas-pro.git
cd buku-kas-pro

# Install seluruh dependencies
npm install

# Jalankan server pengembangan lokal (port 3000)
npm run dev
```
Buka browser di: `http://localhost:3000`

### 3. Build untuk Produksi
```bash
npm run build
```
File hasil build akan berada di folder `dist/` dan siap diunggah ke penyedia hosting mana pun.

---

## 🌐 Panduan Deploy ke Layanan Hosting Gratis

### Opsi A: Deploy ke Vercel (Paling Mudah & Populer)
1. Buka [vercel.com](https://vercel.com) dan login dengan akun GitHub Anda (`kujangluhursekawan.kls@gmail.com`).
2. Klik **"Add New Project"** -> Pilih repository GitHub **Buku Kas Pro**.
3. Biarkan pengaturan default (Framework Preset: **Vite**).
4. Klik **Deploy**. Aplikasi akan langsung aktif dalam hitungan detik dengan domain gratis `.vercel.app` (dan HTTPS).

### Opsi B: Deploy ke Netlify
1. Buka [netlify.com](https://netlify.com) dan login dengan GitHub.
2. Klik **"Import an existing project"** -> Pilih repository.
3. Build command: `npm run build`, Publish directory: `dist`.
4. Klik **Deploy Site**.

### Opsi C: Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
# Tentukan build directory: dist
# Konfigurasi single-page app: Yes
npm run build
firebase deploy --only hosting
```

---

## 📂 Struktur Proyek
```
├── index.html                  # Entry point HTML & PWA manifest
├── firestore.rules             # Aturan keamanan database Firestore
├── firebase-applet-config.json # Konfigurasi Firebase client
├── public/
│   ├── manifest.json           # Manifest PWA (Android/iOS)
│   ├── sw.js                   # Service worker untuk offline caching
│   └── icons/                  # Ikon aplikasi PWA
└── src/
    ├── App.tsx                 # Root component & realtime listeners
    ├── components/             # Komponen UI (Dashboard, Transaksi, Laporan, Setting)
    ├── context/                # AuthContext (Firebase Auth) & ToastContext
    ├── utils/                  # Firebase storage, excel & PDF export, formatters
    └── types/                  # TypeScript interface & types
```

---

*Dikembangkan untuk efisiensi pembukuan UMKM, toko kelontong, bisnis jasa, dan kas komunitas.*
