import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Copy,
  Check,
  Download,
  FolderGit2,
  Terminal,
  ExternalLink,
  Code2,
} from 'lucide-react';

interface AndroidStudioGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidStudioGuideModal: React.FC<AndroidStudioGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const mainActivityKotlin = `package com.jamhur.bukukaspro

import android.annotation.SuppressLint
import android.os.Bundle
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    private lateinit var webView: WebView

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        webView = findViewById(R.id.webView)
        val settings: WebSettings = webView.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.databaseEnabled = true
        settings.allowFileAccess = true
        settings.allowContentAccess = true
        settings.cacheMode = WebSettings.LOAD_DEFAULT

        webView.webViewClient = WebViewClient()
        // Load local asset or hosted offline app
        webView.loadUrl("file:///android_asset/index.html")
    }

    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }
}`;

  const capacitorSteps = `# 1. Buat APK menggunakan Capacitor (Sangat Cepat & Resmi)
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "Buku Kas Pro" "com.jamhur.bukukaspro" --web-dir dist
npm run build
npx cap add android
npx cap open android

# 2. Di Android Studio:
# Klik menu Build > Build Bundle(s) / APK(s) > Build APK(s)
# File APK siap diinstal di semua smartphone Android!`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs transition-opacity overflow-y-auto">
      <div className="w-full max-w-xl rounded-3xl bg-white p-5 shadow-2xl dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col max-h-[88vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Panduan Build APK & Android Studio
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Langkah membuat file .APK dari source code Buku Kas Pro
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto py-3 space-y-4 pr-1 text-xs">
          {/* Option 1: Direct PWA Install (Fastest for testing) */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-800/80 dark:bg-emerald-950/40">
            <div className="flex items-center gap-2 mb-1.5 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
              <Smartphone className="h-4 w-4" />
              <span>Metode 1: Pasang Langsung di Layar HP (PWA Native Feel)</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Buka aplikasi ini di browser Chrome Android pada HP Anda, ketuk titik tiga (⋮) di pojok kanan atas, lalu pilih <strong>"Tambahkan ke Layar Utama" (Install App)</strong>. Aplikasi akan otomatis terinstal seperti aplikasi APK biasa, full offline, tanpa browser bar!
            </p>
          </div>

          {/* Option 2: Capacitor / Android Studio */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Terminal className="h-4 w-4 text-blue-500" /> Metode 2: Build APK via Capacitor (Rekomendasi)
              </span>
              <button
                onClick={() => copyToClipboard(capacitorSteps, 'cap')}
                className="flex items-center gap-1 rounded-lg bg-white px-2 py-1 text-[11px] font-medium text-slate-700 shadow-2xs hover:bg-slate-100 dark:bg-slate-700 dark:text-slate-200"
              >
                {copiedSection === 'cap' ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                <span>{copiedSection === 'cap' ? 'Tersalin' : 'Salin Perintah'}</span>
              </button>
            </div>
            <pre className="rounded-xl bg-slate-900 p-3 font-mono text-[11px] text-emerald-400 overflow-x-auto leading-relaxed">
              {capacitorSteps}
            </pre>
          </div>

          {/* Option 3: Pure Android Studio WebView (MainActivity.kt) */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Code2 className="h-4 w-4 text-purple-500" /> Source Code: MainActivity.kt Android Studio
              </span>
              <button
                onClick={() => copyToClipboard(mainActivityKotlin, 'kt')}
                className="flex items-center gap-1 rounded-lg bg-white px-2 py-1 text-[11px] font-medium text-slate-700 shadow-2xs hover:bg-slate-100 dark:bg-slate-700 dark:text-slate-200"
              >
                {copiedSection === 'kt' ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                <span>{copiedSection === 'kt' ? 'Tersalin' : 'Salin Kode'}</span>
              </button>
            </div>
            <p className="text-slate-500 dark:text-slate-400 mb-2">
              Cukup buat project "Empty Views Activity" baru di Android Studio, salin build folder hasil `npm run build` ke folder `app/src/main/assets/`, dan gunakan kode Kotlin di bawah ini:
            </p>
            <pre className="rounded-xl bg-slate-900 p-3 font-mono text-[10px] text-slate-300 overflow-x-auto max-h-48 leading-relaxed">
              {mainActivityKotlin}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-slate-100 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
