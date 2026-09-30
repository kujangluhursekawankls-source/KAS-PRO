import React, { useState } from 'react';
import { Banner } from '../types';
import { uploadImageToStorage, saveFirestoreBanner, deleteFirestoreBanner } from '../utils/storage';
import { useToast } from '../context/ToastContext';
import {
  X,
  Upload,
  Image as ImageIcon,
  Trash2,
  Check,
  Plus,
  ExternalLink,
  Layers,
  Loader2,
  Sparkles,
} from 'lucide-react';

interface BannerModalProps {
  isOpen: boolean;
  userId: string;
  banners: Banner[];
  onClose: () => void;
  onRefreshBanners?: () => void;
}

export const BannerModal: React.FC<BannerModalProps> = ({
  isOpen,
  userId,
  banners,
  onClose,
  onRefreshBanners,
}) => {
  const toast = useToast();
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check valid format: JPG, JPEG, PNG, WEBP
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Format gambar harus JPG, JPEG, PNG, atau WEBP.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setPreviewImage(dataUrl);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewImage) {
      toast.warning('Silakan pilih gambar banner terlebih dahulu.');
      return;
    }

    setIsUploading(true);
    try {
      const imageUrl = await uploadImageToStorage(userId, previewImage, 'banners');

      const newBanner: Banner = {
        id: `banner-${Date.now()}`,
        userId,
        title: title.trim() || 'Promo Kas Usaha',
        subtitle: subtitle.trim() || 'Kelola keuangan lebih berkah dan rapi',
        imageUrl,
        linkUrl: linkUrl.trim() || '',
        isActive: true,
        createdAt: Date.now(),
      };

      await saveFirestoreBanner(userId, newBanner);
      toast.success('Banner baru berhasil diunggah dan disimpan ke Firebase!', 'Banner Ditambahkan');
      setTitle('');
      setSubtitle('');
      setLinkUrl('');
      setPreviewImage(null);
      if (onRefreshBanners) onRefreshBanners();
    } catch (err: any) {
      console.error(err);
      toast.error('Gagal menyimpan banner: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteBanner = async (bannerId: string) => {
    if (!window.confirm('Yakin ingin menghapus banner ini?')) return;
    setIsDeletingId(bannerId);
    try {
      await deleteFirestoreBanner(userId, bannerId);
      toast.success('Banner berhasil dihapus.');
      if (onRefreshBanners) onRefreshBanners();
    } catch (err: any) {
      console.error(err);
      toast.error('Gagal menghapus banner.');
    } finally {
      setIsDeletingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Kelola Banner Usaha
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Upload banner promosi, pengumuman, atau moto usaha
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto py-3 space-y-4 pr-1 text-xs">
          {/* Upload Form */}
          <form onSubmit={handleSaveBanner} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40 space-y-3">
            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs">
              <Sparkles className="w-4 h-4 text-purple-500" /> Tambah Banner Baru
            </span>

            {/* Image Picker & Preview */}
            <div>
              <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Pilih File Gambar (JPG, JPEG, PNG, WEBP) *
              </label>

              {previewImage ? (
                <div className="relative rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-700 shadow-xs">
                  <img
                    src={previewImage}
                    alt="Preview Banner"
                    className="w-full h-36 object-cover"
                  />
                  <div className="absolute top-2 right-2 flex gap-1">
                    <button
                      type="button"
                      onClick={() => setPreviewImage(null)}
                      className="rounded-lg bg-slate-900/80 p-1.5 text-white hover:bg-rose-600 transition shadow"
                      title="Ganti Gambar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-0.5 text-[10px] text-white">
                    Preview Banner Siap Simpan
                  </span>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-white p-5 cursor-pointer hover:border-purple-500 hover:bg-purple-50/30 dark:border-slate-700 dark:bg-slate-800/80 dark:hover:border-purple-400 transition">
                  <Upload className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  <div className="text-center">
                    <p className="font-semibold text-slate-700 dark:text-slate-200">
                      Klik untuk memilih gambar banner
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Rasio rekomendasi 2:1 atau 16:9 (Maks 5MB)
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Judul Banner
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Promo Spesial Hari Ini"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Sub-Judul / Keterangan Singkat
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Contoh: Dapatkan diskon belanja sembako"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Tautan / Link URL (Opsional)
              </label>
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://wa.me/62... atau link promo"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <button
              type="submit"
              disabled={isUploading || !previewImage}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-purple-600 py-2.5 font-bold text-white shadow hover:bg-purple-500 active:scale-98 transition disabled:opacity-50"
            >
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              <span>Simpan Banner ke Cloud</span>
            </button>
          </form>

          {/* Existing Banners List */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-2">
              Daftar Banner Aktif ({banners.length})
            </h4>

            {banners.length === 0 ? (
              <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-6 text-center text-slate-400 dark:border-slate-800 dark:bg-slate-800/30">
                <ImageIcon className="mx-auto w-8 h-8 text-slate-300 dark:text-slate-700 mb-1" />
                <p>Belum ada banner yang diunggah.</p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Unggah gambar banner di atas untuk mempercantik halaman utama aplikasi Anda.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {banners.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-2.5 shadow-2xs dark:border-slate-800 dark:bg-slate-850"
                  >
                    <img
                      src={b.imageUrl}
                      alt={b.title}
                      className="h-16 w-28 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 dark:text-white truncate">
                        {b.title}
                      </p>
                      <p className="text-slate-500 dark:text-slate-400 truncate text-[11px]">
                        {b.subtitle}
                      </p>
                      {b.linkUrl && (
                        <a
                          href={b.linkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-purple-600 hover:underline flex items-center gap-1 mt-0.5 truncate"
                        >
                          <ExternalLink className="w-3 h-3" /> {b.linkUrl}
                        </a>
                      )}
                    </div>
                    <button
                      type="button"
                      disabled={isDeletingId === b.id}
                      onClick={() => handleDeleteBanner(b.id)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400 transition"
                      title="Hapus Banner"
                    >
                      {isDeletingId === b.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-slate-100 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
