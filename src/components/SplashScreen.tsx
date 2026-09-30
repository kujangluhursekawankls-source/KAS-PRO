import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wallet, ShieldCheck, ArrowRight } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
  appName?: string;
  tagline?: string;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  appName = 'BUKU KAS PRO',
  tagline = 'Catat Keuangan Lebih Mudah',
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onFinish, 200);
          return 100;
        }
        return prev + 25;
      });
    }, 280);

    return () => clearInterval(timer);
  }, [onFinish]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.35 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-slate-900 px-6 py-12 text-white select-none"
      >
        <div className="w-full flex justify-end">
          <button
            onClick={onFinish}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors py-1.5 px-3 rounded-full bg-slate-800/80 active:scale-95"
          >
            Lewati <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex flex-col items-center text-center max-w-sm">
          {/* Logo icon with animated pulse ring */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="relative mb-6 flex items-center justify-center"
          >
            <div className="absolute -inset-3 rounded-3xl bg-emerald-500/20 blur-xl animate-pulse" />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 shadow-xl shadow-emerald-500/30">
              <Wallet className="h-12 w-12 text-white" strokeWidth={2.2} />
            </div>
          </motion.div>

          {/* Title and tagline */}
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="text-3xl font-extrabold tracking-tight text-white mb-2"
          >
            {appName}
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="text-emerald-400 font-medium text-base mb-6"
          >
            "{tagline}"
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400"
          >
            <span>UMKM</span>
            <span>·</span>
            <span>Toko</span>
            <span>·</span>
            <span>Warung</span>
            <span>·</span>
            <span>Masjid</span>
            <span>·</span>
            <span>RT/RW</span>
            <span>·</span>
            <span>Komunitas</span>
          </motion.div>
        </div>

        {/* Progress & Bottom Credential */}
        <div className="w-full max-w-xs flex flex-col items-center">
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden mb-3">
            <motion.div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full"
              style={{ width: `${progress}%` }}
              transition={{ ease: 'linear' }}
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% Offline & Data Tersimpan Lokal</span>
          </div>

          <p className="text-[11px] text-slate-500">
            Versi 1.0.0 · Android Ready · Created By Jamhur
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
