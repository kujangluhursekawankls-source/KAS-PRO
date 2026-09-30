import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, Fingerprint, Delete, ShieldAlert } from 'lucide-react';

interface PinLockScreenProps {
  correctPin: string;
  biometricEnabled: boolean;
  onUnlock: () => void;
}

export const PinLockScreen: React.FC<PinLockScreenProps> = ({
  correctPin,
  biometricEnabled,
  onUnlock,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [biometricFeedback, setBiometricFeedback] = useState<string | null>(null);

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      setError(false);

      if (nextPin.length === 4) {
        if (nextPin === correctPin) {
          setTimeout(onUnlock, 150);
        } else {
          setError(true);
          setTimeout(() => {
            setPin('');
            setError(false);
          }, 600);
        }
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  const handleBiometric = () => {
    setBiometricFeedback('Memindai sidik jari...');
    setTimeout(() => {
      setBiometricFeedback('Sidik jari cocok!');
      setTimeout(onUnlock, 250);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-slate-900 px-6 py-12 text-white select-none">
      <div className="flex flex-col items-center mt-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800 text-emerald-400 mb-4 border border-slate-700/60 shadow-lg">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-1">Aplikasi Terkunci</h2>
        <p className="text-sm text-slate-400">Masukkan 4-digit PIN keamanan Anda</p>

        {/* PIN Dots */}
        <motion.div
          animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.35 }}
          className="flex items-center gap-4 mt-8"
        >
          {[0, 1, 2, 3].map((i) => {
            const isFilled = pin.length > i;
            return (
              <div
                key={i}
                className={`h-4 w-4 rounded-full transition-all duration-200 ${
                  error
                    ? 'bg-rose-500 scale-110'
                    : isFilled
                    ? 'bg-emerald-500 scale-110'
                    : 'bg-slate-700'
                }`}
              />
            );
          })}
        </motion.div>

        {error && (
          <div className="flex items-center gap-1.5 text-xs text-rose-400 mt-4 font-medium">
            <ShieldAlert className="w-4 h-4" />
            <span>PIN salah, silakan coba lagi</span>
          </div>
        )}

        {biometricFeedback && (
          <p className="text-xs text-emerald-400 mt-4 animate-pulse">
            {biometricFeedback}
          </p>
        )}
      </div>

      {/* Keypad */}
      <div className="w-full max-w-xs mb-4">
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleKeyPress(String(num))}
              className="flex h-16 items-center justify-center rounded-2xl bg-slate-800/80 text-xl font-semibold text-white shadow hover:bg-slate-700 active:scale-95 transition"
            >
              {num}
            </button>
          ))}

          {/* Biometric trigger */}
          {biometricEnabled ? (
            <button
              type="button"
              onClick={handleBiometric}
              className="flex h-16 items-center justify-center rounded-2xl bg-slate-800/40 text-emerald-400 hover:bg-slate-800 active:scale-95 transition"
              title="Gunakan Sidik Jari"
            >
              <Fingerprint className="w-7 h-7" />
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={() => handleKeyPress('0')}
            className="flex h-16 items-center justify-center rounded-2xl bg-slate-800/80 text-xl font-semibold text-white shadow hover:bg-slate-700 active:scale-95 transition"
          >
            0
          </button>

          <button
            type="button"
            onClick={handleDelete}
            className="flex h-16 items-center justify-center rounded-2xl bg-slate-800/40 text-slate-400 hover:text-white hover:bg-slate-800 active:scale-95 transition"
            title="Hapus"
          >
            <Delete className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};
