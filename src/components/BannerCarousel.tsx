import React, { useState, useEffect } from 'react';
import { Banner } from '../types';
import { Layers, ChevronLeft, ChevronRight, Plus, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BannerCarouselProps {
  banners: Banner[];
  onOpenManage: () => void;
}

export const BannerCarousel: React.FC<BannerCarouselProps> = ({ banners, onOpenManage }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-rotate every 5 seconds if multiple banners
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  if (banners.length === 0) {
    return (
      <div
        onClick={onOpenManage}
        className="group relative cursor-pointer overflow-hidden rounded-3xl border border-dashed border-slate-300 bg-gradient-to-r from-slate-50 to-slate-100 p-4 dark:border-slate-800 dark:from-slate-900/60 dark:to-slate-850 hover:border-purple-400 transition"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 group-hover:scale-105 transition">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-white">
                Pasang Banner Usaha / Toko
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Tampilkan promo, foto toko, atau moto usaha Anda di sini
              </p>
            </div>
          </div>
          <span className="flex items-center gap-1 rounded-xl bg-purple-600 px-3 py-1.5 text-[11px] font-bold text-white shadow-xs group-hover:bg-purple-500 transition">
            <Plus className="w-3.5 h-3.5" /> Pasang
          </span>
        </div>
      </div>
    );
  }

  const activeBanner = banners[currentIndex] || banners[0];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl shadow-md border border-slate-200/80 dark:border-slate-800">
      <div className="relative h-40 w-full overflow-hidden bg-slate-900">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeBanner.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="relative h-full w-full"
          >
            <img
              src={activeBanner.imageUrl}
              alt={activeBanner.title}
              className="h-full w-full object-cover"
            />
            {/* Dark gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent flex flex-col justify-end p-4 text-white">
              <div className="flex items-end justify-between">
                <div className="max-w-[80%]">
                  <h4 className="text-sm font-extrabold truncate text-white drop-shadow">
                    {activeBanner.title}
                  </h4>
                  <p className="text-xs text-slate-200 truncate mt-0.5 drop-shadow">
                    {activeBanner.subtitle}
                  </p>
                </div>
                {activeBanner.linkUrl && (
                  <a
                    href={activeBanner.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 rounded-lg bg-white/20 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur-md hover:bg-white/30"
                  >
                    Buka <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Carousel controls if > 1 banner */}
        {banners.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-xs hover:bg-black/60 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-xs hover:bg-black/60 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Indicator dots */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {banners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    currentIndex === i ? 'w-5 bg-white' : 'w-1.5 bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Top-right manage button */}
        <button
          onClick={onOpenManage}
          className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-full bg-slate-900/60 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur-md hover:bg-slate-900/80 transition"
        >
          <Layers className="w-3 h-3" />
          <span>Kelola Banner</span>
        </button>
      </div>
    </div>
  );
};
