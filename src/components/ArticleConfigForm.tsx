import React from 'react';
import {
  Sparkles,
  Bot,
  Globe,
  Sliders,
  FileText,
  Users,
  Smile,
  ListPlus,
  Play,
  StepForward,
  HelpCircle,
  Hash,
  Lightbulb,
} from 'lucide-react';
import { ArticleInput, AIProvider } from '../types';
import { AVAILABLE_MODELS } from '../data/flowTemplates';

interface ArticleConfigFormProps {
  input: ArticleInput;
  setInput: React.Dispatch<React.SetStateAction<ArticleInput>>;
  onGenerateFull: () => void;
  onStartStepByStep: () => void;
  isGenerating: boolean;
  activeFlowPresetName: string;
  activeStepsCount: number;
}

const SAMPLE_TOPICS = [
  {
    topic: 'Panduan Lengkap Implementasi AI Generatif untuk Bisnis dan Produktivitas 2026',
    keywords: 'AI generatif bisnis, otomatisasi AI, produktivitas kerja, implementasi AI',
  },
  {
    topic: 'Strategi Optimasi SEO Modern untuk Meningkatkan Traffic Organik Website',
    keywords: 'SEO modern, teknik on-page SEO, optimasi search intent, audit website',
  },
  {
    topic: 'Perbandingan Lengkap Laptop Terbaik untuk Pemrograman dan Desain Grafis',
    keywords: 'laptop programmer terbaik, laptop desain 2026, spesifikasi laptop coding',
  },
  {
    topic: 'Langkah Awal Membangun Startup Digital: Dari Validasi Ide hingga Monetisasi',
    keywords: 'cara membuat startup, validasi ide bisnis, MVP startup, strategi pitching',
  },
];

export const ArticleConfigForm: React.FC<ArticleConfigFormProps> = ({
  input,
  setInput,
  onGenerateFull,
  onStartStepByStep,
  isGenerating,
  activeFlowPresetName,
  activeStepsCount,
}) => {
  const handleInputChange = (field: keyof ArticleInput, value: any) => {
    setInput((prev) => ({ ...prev, [field]: value }));
  };

  const handleProviderChange = (provider: AIProvider) => {
    const defaultModel =
      provider === 'gemini' ? 'gemini-3.7-flash' : 'gpt-4o';
    setInput((prev) => ({ ...prev, provider, model: defaultModel }));
  };

  const availableModelsForProvider = AVAILABLE_MODELS.filter(
    (m) => m.provider === input.provider
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-600" />
            Parameter & Konfigurasi Artikel
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tentukan topik, kata kunci, audiens, dan biarkan AI Agents menjalankan pipeline instruksi.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 border border-indigo-100">
            Pipeline: {activeFlowPresetName} ({activeStepsCount} Agen)
          </span>
        </div>
      </div>

      {/* Quick Sample Topics */}
      <div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-2">
          <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
          <span>Inspirasi Topik Cepat:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {SAMPLE_TOPICS.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setInput((prev) => ({
                  ...prev,
                  topic: item.topic,
                  keywords: item.keywords,
                }));
              }}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600 hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-800 transition-colors text-left"
            >
              {item.topic.length > 40 ? item.topic.slice(0, 40) + '...' : item.topic}
            </button>
          ))}
        </div>
      </div>

      {/* Main Form Fields */}
      <div className="space-y-4">
        {/* Topic Input */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Topik Utama / Judul Artikel <span className="text-rose-500">*</span>
          </label>
          <input
            id="input-article-topic"
            type="text"
            value={input.topic}
            onChange={(e) => handleInputChange('topic', e.target.value)}
            placeholder="Contoh: Panduan Lengkap Membangun Website E-Commerce dari Nol"
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            disabled={isGenerating}
          />
        </div>

        {/* Keywords */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Kata Kunci Target / SEO Keywords (Pisahkan dengan koma)
          </label>
          <div className="relative">
            <Hash className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              id="input-article-keywords"
              type="text"
              value={input.keywords}
              onChange={(e) => handleInputChange('keywords', e.target.value)}
              placeholder="Contoh: toko online pemula, platform e-commerce, payment gateway, SEO toko online"
              className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              disabled={isGenerating}
            />
          </div>
        </div>

        {/* Dual Column: Target Audience & Tone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Target Audience */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              <Users className="inline h-3.5 w-3.5 mr-1 text-slate-500" />
              Target Pembaca (Audience)
            </label>
            <select
              value={input.targetAudience}
              onChange={(e) => handleInputChange('targetAudience', e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              disabled={isGenerating}
            >
              <option value="Umum & Publik Luas">Umum & Publik Luas</option>
              <option value="Pemula & Pelajar / Mahasiswa">Pemula & Pelajar / Mahasiswa</option>
              <option value="Praktisi & Profesional Industri">Praktisi & Profesional Industri</option>
              <option value="Pemilik Bisnis & Pengusaha / UMKM">Pemilik Bisnis & Pengusaha / UMKM</option>
              <option value="Tech Developer & Engineer">Tech Developer & Engineer</option>
              <option value="Pengambil Keputusan & C-Level Executive">Pengambil Keputusan & C-Level Executive</option>
            </select>
          </div>

          {/* Tone & Style */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              <Smile className="inline h-3.5 w-3.5 mr-1 text-slate-500" />
              Gaya Bahasa & Tone
            </label>
            <select
              value={input.tone}
              onChange={(e) => handleInputChange('tone', e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              disabled={isGenerating}
            >
              <option value="Informatif, Terstruktur & Berwibawa (Otoritatif)">
                Informatif & Berwibawa (Otoritatif)
              </option>
              <option value="Santai, Mengalir & Kasual (Conversational)">
                Santai & Mengalir (Conversational)
              </option>
              <option value="Bisnis, Formal & Profesional">
                Bisnis, Formal & Profesional
              </option>
              <option value="Storytelling, Naratif & Menghibur">
                Storytelling & Naratif
              </option>
              <option value="Persuasif, Berorientasi Aksi (Copywriting)">
                Persuasif & Copywriting
              </option>
              <option value="Akademis, Faktual & Berbasis Riset">
                Akademis & Riset Faktual
              </option>
            </select>
          </div>
        </div>

        {/* Dual Column: Language & Word Count */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Language */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              <Globe className="inline h-3.5 w-3.5 mr-1 text-slate-500" />
              Bahasa Artikel
            </label>
            <select
              value={input.language}
              onChange={(e) => handleInputChange('language', e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              disabled={isGenerating}
            >
              <option value="Bahasa Indonesia">Bahasa Indonesia</option>
              <option value="English (US)">English (US)</option>
              <option value="English (UK)">English (UK)</option>
              <option value="Español (Spanish)">Español (Spanish)</option>
              <option value="Deutsch (German)">Deutsch (German)</option>
              <option value="Français (French)">Français (French)</option>
              <option value="日本語 (Japanese)">日本語 (Japanese)</option>
            </select>
          </div>

          {/* Word Count Slider */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Target Panjang Kata
              </label>
              <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                ~{input.wordCount} Kata
              </span>
            </div>
            <input
              type="range"
              min="500"
              max="3500"
              step="250"
              value={input.wordCount}
              onChange={(e) => handleInputChange('wordCount', parseInt(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer mt-2"
              disabled={isGenerating}
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>Ringkas (500)</span>
              <span>Standar (1500)</span>
              <span>Pilar Mendalam (3500)</span>
            </div>
          </div>
        </div>

        {/* AI Provider & Model Deck */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Bot className="h-4 w-4 text-indigo-600" />
              Pilih Mesin AI & Model
            </span>

            {/* Provider Switcher */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => handleProviderChange('gemini')}
                className={`rounded px-2.5 py-1 transition-all ${
                  input.provider === 'gemini'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Google Gemini
              </button>
              <button
                type="button"
                onClick={() => handleProviderChange('openai')}
                className={`rounded px-2.5 py-1 transition-all ${
                  input.provider === 'openai'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                OpenAI (ChatGPT)
              </button>
            </div>
          </div>

          {/* Model selection */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {availableModelsForProvider.map((m) => {
              const isSelected = input.model === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => handleInputChange('model', m.id)}
                  className={`cursor-pointer rounded-xl border p-2.5 transition-all text-left ${
                    isSelected
                      ? 'border-indigo-500 bg-white ring-2 ring-indigo-500/20 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">{m.name}</span>
                    {m.tag && (
                      <span className="rounded bg-indigo-50 px-1.5 py-0.2 text-[10px] font-semibold text-indigo-700">
                        {m.tag}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {m.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Additional Custom Instructions */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Instruksi Khusus Tambahan (Opsional)
          </label>
          <textarea
            rows={2}
            value={input.additionalInstructions}
            onChange={(e) => handleInputChange('additionalInstructions', e.target.value)}
            placeholder="Contoh: Tolong sertakan contoh studi kasus nyata di Indonesia, gunakan format tabel perbandingan di bab 3, dan hindari kata klise."
            className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 leading-relaxed"
            disabled={isGenerating}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
        {/* Full Flow Auto */}
        <button
          id="btn-run-full-flow"
          type="button"
          onClick={onGenerateFull}
          disabled={isGenerating || !input.topic.trim()}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-indigo-200 hover:from-indigo-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play className="h-4 w-4 fill-white" />
          <span>{isGenerating ? 'AI Agents Sedang Bekerja...' : 'Jalankan Full Flow Otomatis'}</span>
        </button>

        {/* Step-by-Step Human-in-the-Loop */}
        <button
          id="btn-run-step-by-step"
          type="button"
          onClick={onStartStepByStep}
          disabled={isGenerating || !input.topic.trim()}
          className="flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-5 py-3.5 text-sm font-bold text-indigo-700 hover:bg-indigo-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <StepForward className="h-4 w-4" />
          <span>Jalankan Step-by-Step (Review Tiap Agen)</span>
        </button>
      </div>
    </div>
  );
};
