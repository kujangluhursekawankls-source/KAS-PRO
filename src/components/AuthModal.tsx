import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { RecaptchaVerifier, ConfirmationResult } from 'firebase/auth';
import { auth } from '../firebase';
import {
  X,
  Mail,
  Lock,
  Smartphone,
  ArrowRight,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register' | 'phone' | 'forgot';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const { loginWithEmail, registerWithEmail, loginWithGoogle, loginAnonymously, sendPasswordReset, sendPhoneOtp } = useAuth();
  const toast = useToast();

  const [mode, setMode] = useState<'login' | 'register' | 'phone' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setOtpCode('');
      setConfirmationResult(null);
    }
  }, [isOpen, initialMode]);

  // Clean up recaptcha on unmount
  useEffect(() => {
    return () => {
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch {}
      }
    };
  }, []);

  if (!isOpen) return null;

  // Handle Email Login
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.warning('Silakan masukkan email dan kata sandi.');
      return;
    }

    setIsLoading(true);
    try {
      await loginWithEmail(email, password);
      toast.success('Login berhasil! Data Anda tersinkronisasi online.', 'Selamat Datang');
      onClose();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        toast.error('Email atau kata sandi tidak cocok.');
      } else if (err.code === 'auth/user-not-found') {
        toast.error('Akun belum terdaftar. Silakan buat akun baru.');
      } else {
        toast.error(err.message || 'Gagal login. Periksa koneksi internet Anda.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Register
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.warning('Silakan isi seluruh formulir pendaftaran.');
      return;
    }
    if (password.length < 6) {
      toast.warning('Kata sandi minimal 6 karakter.');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Konfirmasi kata sandi tidak cocok!');
      return;
    }

    setIsLoading(true);
    try {
      await registerWithEmail(email, password);
      toast.success('Akun baru berhasil dibuat! Selamat datang di Buku Kas Pro.', 'Registrasi Sukses');
      onClose();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        toast.error('Email ini sudah terdaftar. Silakan beralih ke menu Masuk.');
      } else if (err.code === 'auth/operation-not-allowed') {
        toast.error('Pendaftaran Email belum diaktifkan di Firebase Console. Gunakan opsi Masuk Cepat Instan.');
      } else if (err.code === 'auth/weak-password') {
        toast.error('Kata sandi terlalu pendek. Minimal 6 karakter.');
      } else if (err.code === 'auth/invalid-email') {
        toast.error('Format alamat email tidak valid.');
      } else {
        toast.error(err.message || 'Gagal membuat akun.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Quick / Instant Account (1-Click without password)
  const handleQuickLogin = async () => {
    setIsLoading(true);
    try {
      await loginAnonymously();
      toast.success('Akun online instan berhasil dibuat! Data tersinkronisasi realtime.', 'Akun Terhubung');
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error('Gagal membuat akun instan: ' + (err.message || 'Periksa koneksi'));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google Login
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle();
      toast.success('Berhasil login dengan akun Google.', 'Sukses');
      onClose();
    } catch (err: any) {
      console.error(err);
      if (err.code !== 'auth/popup-closed-by-user') {
        toast.error('Gagal menghubungkan Google: ' + (err.message || 'Coba lagi.'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Forgot Password
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.warning('Masukkan alamat email untuk reset kata sandi.');
      return;
    }

    setIsLoading(true);
    try {
      await sendPasswordReset(email);
      toast.success('Tautan reset kata sandi telah dikirim ke email Anda. Periksa kotak masuk / spam.', 'Email Terkirim');
      setMode('login');
    } catch (err: any) {
      console.error(err);
      toast.error('Gagal mengirim email reset: ' + (err.message || 'Periksa email Anda.'));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Phone OTP Request
  const handleSendPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    let formatted = phoneNumber.trim().replace(/\s+/g, '');
    if (formatted.startsWith('0')) {
      formatted = '+62' + formatted.slice(1);
    } else if (!formatted.startsWith('+')) {
      formatted = '+62' + formatted;
    }

    if (formatted.length < 10) {
      toast.warning('Masukkan nomor HP yang valid.');
      return;
    }

    setIsLoading(true);
    try {
      if (!recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
        });
      }

      const confirmation = await sendPhoneOtp(formatted, recaptchaVerifierRef.current);
      setConfirmationResult(confirmation);
      toast.info(`Kode OTP dikirimkan via SMS ke ${formatted}.`);
    } catch (err: any) {
      console.error(err);
      toast.error('Gagal mengirim SMS OTP: ' + (err.message || 'Periksa format nomor HP.'));
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
          recaptchaVerifierRef.current = null;
        } catch {}
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6 || !confirmationResult) {
      toast.warning('Masukkan 6-digit kode OTP SMS.');
      return;
    }

    setIsLoading(true);
    try {
      await confirmationResult.confirm(otpCode);
      toast.success('Nomor HP terverifikasi! Anda telah masuk.', 'Login Berhasil');
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error('Kode OTP salah atau kedaluwarsa.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col">
        {/* Invisible Recaptcha container */}
        <div id="recaptcha-container" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand header */}
        <div className="text-center mb-5">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 font-black text-white shadow-md text-base mb-2">
            BK
          </div>
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
            {mode === 'login' && 'Masuk Akun'}
            {mode === 'register' && 'Daftar Akun Baru'}
            {mode === 'phone' && (confirmationResult ? 'Masukkan Kode OTP' : 'Login Nomor HP')}
            {mode === 'forgot' && 'Reset Kata Sandi'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {mode === 'login' && 'Sinkronkan data kas Anda secara otomatis & aman'}
            {mode === 'register' && 'Buat akun untuk akses realtime di semua perangkat'}
            {mode === 'phone' && 'Masuk cepat menggunakan verifikasi SMS'}
            {mode === 'forgot' && 'Masukkan email terdaftar untuk menerima link reset'}
          </p>
        </div>

        {/* Segment Tabs for Login / Register */}
        {(mode === 'login' || mode === 'register') && (
          <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800 mb-4 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`rounded-lg py-2 transition ${
                mode === 'login'
                  ? 'bg-white text-emerald-600 shadow-xs dark:bg-slate-700 dark:text-emerald-400'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Masuk
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`rounded-lg py-2 transition ${
                mode === 'register'
                  ? 'bg-white text-emerald-600 shadow-xs dark:bg-slate-700 dark:text-emerald-400'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Daftar
            </button>
          </div>
        )}

        {/* Form 1: Email & Password (Login) */}
        {mode === 'login' && (
          <form onSubmit={handleEmailLogin} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Alamat Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-600 dark:text-slate-300">
                  Kata Sandi
                </label>
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-[11px] text-emerald-600 hover:underline dark:text-emerald-400 font-medium"
                >
                  Lupa Sandi?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 font-bold text-white shadow-md hover:bg-emerald-500 active:scale-98 transition disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              <span>Masuk ke Buku Kas</span>
            </button>
          </form>
        )}

        {/* Form 2: Register */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Alamat Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Kata Sandi (Min. 6 Karakter)
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Ulangi Kata Sandi
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 font-bold text-white shadow-md hover:bg-emerald-500 active:scale-98 transition disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              <span>Daftar Akun Online</span>
            </button>
          </form>
        )}

        {/* Form 3: Phone OTP Login */}
        {mode === 'phone' && (
          <div className="space-y-3 text-xs">
            {!confirmationResult ? (
              <form onSubmit={handleSendPhoneOtp} className="space-y-3">
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Nomor WhatsApp / HP
                  </label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="08123456789 atau +62812..."
                      required
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Kode verifikasi 6-angka akan dikirim melalui SMS.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 font-bold text-white shadow-md hover:bg-emerald-500 active:scale-98 transition disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Smartphone className="w-4 h-4" />}
                  <span>Kirim Kode OTP</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-3">
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Kode OTP 6-Digit
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="123456"
                    className="w-full tracking-widest text-center text-xl font-bold py-2.5 rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otpCode.length < 6}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 font-bold text-white shadow-md hover:bg-emerald-500 active:scale-98 transition disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>Verifikasi & Masuk</span>
                </button>

                <button
                  type="button"
                  onClick={() => setConfirmationResult(null)}
                  className="w-full text-center text-[11px] text-slate-500 hover:underline"
                >
                  Ganti nomor HP
                </button>
              </form>
            )}

            <button
              type="button"
              onClick={() => setMode('login')}
              className="w-full text-center text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 pt-2"
            >
              Kembali ke Login Email
            </button>
          </div>
        )}

        {/* Form 4: Forgot Password */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Alamat Email Terdaftar
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 font-bold text-white shadow-md hover:bg-emerald-500 active:scale-98 transition disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
              <span>Kirim Tautan Reset</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('login')}
              className="w-full text-center text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 pt-2"
            >
              Ingat sandi? Kembali ke Login
            </button>
          </form>
        )}

        {/* Alternative login methods (Google & Phone) */}
        {(mode === 'login' || mode === 'register') && (
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-750 transition"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Lanjutkan dengan Google</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('phone')}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-750 transition"
            >
              <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Masuk dengan Nomor HP (SMS)</span>
            </button>

            {/* 1-Click Fast Instant Account */}
            <div className="pt-2 border-t border-dashed border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={handleQuickLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 py-2.5 px-3 text-xs font-bold text-white shadow-sm active:scale-98 transition"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-200" />
                <span>Masuk Cepat / Buat Akun Instan (1-Klik)</span>
              </button>
              <p className="text-[10px] text-center text-slate-400 mt-1">
                Langsung aktif dengan database cloud tanpa perlu verifikasi email/SMS.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
