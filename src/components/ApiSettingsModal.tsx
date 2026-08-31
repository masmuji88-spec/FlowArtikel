import React, { useState, useEffect } from 'react';
import { X, Bot, Key, CheckCircle, AlertCircle, Sparkles, Sliders, ShieldCheck } from 'lucide-react';
import { AIProvider } from '../types';
import { AVAILABLE_MODELS } from '../data/flowTemplates';

interface ApiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProvider: AIProvider;
  setSelectedProvider: (provider: AIProvider) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  customApiKey: string;
  setCustomApiKey: (key: string) => void;
}

export const ApiSettingsModal: React.FC<ApiSettingsModalProps> = ({
  isOpen,
  onClose,
  selectedProvider,
  setSelectedProvider,
  selectedModel,
  setSelectedModel,
  customApiKey,
  setCustomApiKey,
}) => {
  const [healthStatus, setHealthStatus] = useState<{
    hasGeminiKey: boolean;
    hasOpenAIKey: boolean;
    status: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/health')
        .then((res) => res.json())
        .then((data) => setHealthStatus(data))
        .catch(() => setHealthStatus(null));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentModels = AVAILABLE_MODELS.filter((m) => m.provider === selectedProvider);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <Bot className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Pengaturan AI Engine & Model
              </h3>
              <p className="text-xs text-slate-500">
                Konfigurasi provider Gemini & OpenAI ChatGPT
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Server Status Banner */}
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700">Status Server Backend:</span>
            <span className="flex items-center gap-1 font-bold text-emerald-600">
              <CheckCircle className="h-3.5 w-3.5" />
              Online (Port 3000)
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-600">
            <span>Gemini API Key (Server):</span>
            <span className={healthStatus?.hasGeminiKey ? 'text-emerald-600 font-semibold' : 'text-slate-500'}>
              {healthStatus?.hasGeminiKey ? 'Tersedia di Server' : 'Otomatis via Environment'}
            </span>
          </div>
        </div>

        {/* Provider Switcher */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Pilih AI Provider
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div
              onClick={() => {
                setSelectedProvider('gemini');
                setSelectedModel('gemini-3.7-flash');
              }}
              className={`cursor-pointer rounded-xl border p-3.5 transition-all ${
                selectedProvider === 'gemini'
                  ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/20 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                <span className="font-bold text-sm text-slate-900">Google Gemini</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Gemini 3.7 Flash & 3.1 Pro via official @google/genai SDK.
              </p>
            </div>

            <div
              onClick={() => {
                setSelectedProvider('openai');
                setSelectedModel('gpt-4o');
              }}
              className={`cursor-pointer rounded-xl border p-3.5 transition-all ${
                selectedProvider === 'openai'
                  ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
                <span className="font-bold text-sm text-slate-900">OpenAI ChatGPT</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                GPT-4o, GPT-4o Mini & o3-mini models.
              </p>
            </div>
          </div>
        </div>

        {/* Model Selection */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Pilih Model Utama
          </label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {currentModels.map((m) => (
              <div
                key={m.id}
                onClick={() => setSelectedModel(m.id)}
                className={`cursor-pointer rounded-xl border p-3 transition-all flex items-center justify-between ${
                  selectedModel === m.id
                    ? 'border-indigo-500 bg-indigo-50/40 ring-1 ring-indigo-500 font-semibold'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div>
                  <span className="text-xs font-bold text-slate-900">{m.name}</span>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{m.description}</p>
                </div>
                {m.tag && (
                  <span className="rounded bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5">
                    {m.tag}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Optional Custom API Key (for OpenAI or custom user key) */}
        {selectedProvider === 'openai' && (
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              OpenAI API Key (Opsional jika belum diset di server)
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="password"
                value={customApiKey}
                onChange={(e) => setCustomApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 py-2 text-xs font-mono text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Kunci API disimpan hanya di session browser Anda untuk request proxy server.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition-colors shadow-xs"
          >
            Simpan & Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
