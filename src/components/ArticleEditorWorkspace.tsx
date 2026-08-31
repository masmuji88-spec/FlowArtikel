import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  FileText,
  Copy,
  Download,
  Check,
  Eye,
  Code,
  Sparkles,
  TrendingUp,
  Clock,
  Type,
  Printer,
  Save,
  CheckCircle2,
  ChevronDown,
  Layers,
  HelpCircle,
  Share2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { GeneratedArticle, StepExecutionResult } from '../types';
import {
  calculateWordCount,
  calculateReadingTimeMinutes,
  calculateSeoScore,
  downloadAsFile,
} from '../utils/textUtils';

interface ArticleEditorWorkspaceProps {
  content: string;
  setContent: (content: string) => void;
  topic: string;
  keywords: string;
  stepResults: StepExecutionResult[];
  onSaveToHistory: () => void;
  isAutoSaved?: boolean;
}

export const ArticleEditorWorkspace: React.FC<ArticleEditorWorkspaceProps> = ({
  content,
  setContent,
  topic,
  keywords,
  stepResults,
  onSaveToHistory,
  isAutoSaved,
}) => {
  const [viewMode, setViewMode] = useState<'preview' | 'raw' | 'traces'>('preview');
  const [copied, setCopied] = useState<string | null>(null);
  const [showSeoDetails, setShowSeoDetails] = useState(false);

  const wordCount = calculateWordCount(content);
  const readingTime = calculateReadingTimeMinutes(wordCount);
  const charCount = content.length;
  const seoAudit = calculateSeoScore(content, keywords, 1000);

  const handleCopy = (type: 'markdown' | 'text') => {
    if (!content) return;
    if (type === 'markdown') {
      navigator.clipboard.writeText(content);
      setCopied('markdown');
    } else {
      // Strip markdown tags roughly
      const plain = content.replace(/[#*`_~]/g, '');
      navigator.clipboard.writeText(plain);
      setCopied('text');
    }
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDownloadMarkdown = () => {
    const slug = topic
      ? topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      : 'artikel-ai';
    downloadAsFile(`${slug}.md`, content, 'text/markdown;charset=utf-8');
  };

  const handleDownloadHtml = () => {
    const slug = topic
      ? topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      : 'artikel-ai';
    const htmlTemplate = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${topic || 'Artikel AI'}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.7; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #1e293b; }
    h1, h2, h3, h4 { color: #0f172a; margin-top: 1.5em; line-height: 1.3; }
    h1 { font-size: 2.2em; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.3em; }
    blockquote { border-left: 4px solid #6366f1; margin: 1.5em 0; padding: 0.5em 1em; background: #f8fafc; color: #334155; }
    table { width: 100%; border-collapse: collapse; margin: 1.5em 0; }
    th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; }
    th { background: #f1f5f9; }
    code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 0.9em; }
    pre code { display: block; padding: 15px; overflow-x: auto; background: #0f172a; color: #f8fafc; border-radius: 8px; }
  </style>
</head>
<body>
  ${content}
</body>
</html>`;
    downloadAsFile(`${slug}.html`, htmlTemplate, 'text/html;charset=utf-8');
  };

  const handlePrint = () => {
    window.print();
  };

  const triggerCelebration = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
    onSaveToHistory();
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden space-y-0">
      {/* Workspace Header & Stats */}
      <div className="border-b border-slate-200 bg-slate-50/70 p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
            <button
              id="view-mode-preview"
              type="button"
              onClick={() => setViewMode('preview')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                viewMode === 'preview'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Pratinjau Baca (Preview)</span>
            </button>

            <button
              id="view-mode-raw"
              type="button"
              onClick={() => setViewMode('raw')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                viewMode === 'raw'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Code className="h-3.5 w-3.5" />
              <span>Editor Markdown (Mentah)</span>
            </button>

            {stepResults.length > 0 && (
              <button
                id="view-mode-traces"
                type="button"
                onClick={() => setViewMode('traces')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  viewMode === 'traces'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                <span>Jejak Agen ({stepResults.length})</span>
              </button>
            )}
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1 border border-slate-200 text-slate-700">
              <Type className="h-3.5 w-3.5 text-indigo-500" />
              <span className="font-bold">{wordCount}</span>
              <span className="text-slate-400">kata</span>
            </div>

            <div className="flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1 border border-slate-200 text-slate-700">
              <Clock className="h-3.5 w-3.5 text-amber-500" />
              <span className="font-bold">~{readingTime}</span>
              <span className="text-slate-400">menit baca</span>
            </div>

            {/* SEO Score Pill */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowSeoDetails(!showSeoDetails)}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 border text-xs font-bold transition-all ${
                  seoAudit.score >= 80
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : seoAudit.score >= 50
                    ? 'bg-amber-50 border-amber-300 text-amber-800'
                    : 'bg-rose-50 border-rose-300 text-rose-800'
                }`}
              >
                <TrendingUp className="h-3.5 w-3.5" />
                <span>SEO Score: {seoAudit.score}/100</span>
                <ChevronDown className="h-3 w-3 opacity-60" />
              </button>

              {/* SEO Checklist Dropdown */}
              {showSeoDetails && (
                <div className="absolute right-0 top-full mt-2 z-30 w-72 sm:w-80 rounded-xl border border-slate-200 bg-white p-4 shadow-xl text-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="font-bold text-slate-900">Audit SEO & Struktur</span>
                    <span className="font-bold text-indigo-600">{seoAudit.score}%</span>
                  </div>
                  <div className="space-y-2">
                    {seoAudit.checks.map((check, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        {check.passed ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border border-slate-300 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p className="font-semibold text-slate-800">{check.label}</p>
                          <p className="text-[11px] text-slate-500">{check.feedback}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Save to History */}
            <button
              type="button"
              onClick={triggerCelebration}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-50 border border-indigo-200 px-3 py-1 font-bold text-indigo-700 hover:bg-indigo-100 transition-colors"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{isAutoSaved ? 'Tersimpan' : 'Simpan Artikel'}</span>
            </button>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="mt-3 pt-3 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Copy Markdown */}
            <button
              type="button"
              onClick={() => handleCopy('markdown')}
              className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              {copied === 'markdown' ? (
                <Check className="h-3.5 w-3.5 text-emerald-600" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              <span>{copied === 'markdown' ? 'Tersalin (MD)!' : 'Salin Markdown'}</span>
            </button>

            {/* Copy Plain Text */}
            <button
              type="button"
              onClick={() => handleCopy('text')}
              className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              {copied === 'text' ? (
                <Check className="h-3.5 w-3.5 text-emerald-600" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              <span>{copied === 'text' ? 'Tersalin (Teks)!' : 'Salin Teks Polos'}</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {/* Download MD */}
            <button
              type="button"
              onClick={handleDownloadMarkdown}
              className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Unduh (.md)</span>
            </button>

            {/* Download HTML */}
            <button
              type="button"
              onClick={handleDownloadHtml}
              className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Unduh (.html)</span>
            </button>

            {/* Print */}
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
              title="Cetak atau Ekspor ke PDF"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Cetak / PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Workspace Body */}
      <div className="p-5 sm:p-8 bg-white min-h-[500px]">
        {/* Mode 1: Rendered Markdown Preview */}
        {viewMode === 'preview' && (
          <div className="prose prose-slate max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-h1:text-2xl sm:prose-h1:text-3xl prose-h2:text-xl sm:prose-h2:text-2xl prose-h2:border-b prose-h2:border-slate-100 prose-h2:pb-2 prose-h3:text-lg prose-p:leading-relaxed prose-p:text-slate-700 prose-li:text-slate-700 prose-blockquote:border-l-indigo-500 prose-blockquote:bg-indigo-50/40 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:text-slate-700 prose-blockquote:font-normal prose-table:border-collapse prose-th:border prose-th:border-slate-200 prose-th:bg-slate-50 prose-th:p-2.5 prose-td:border prose-td:border-slate-200 prose-td:p-2.5">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content || '_Belum ada konten artikel. Silakan jalankan generator di atas._'}
            </ReactMarkdown>
          </div>
        )}

        {/* Mode 2: Raw Markdown Source Editor */}
        {viewMode === 'raw' && (
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Editor Markdown Mentah (Dapat Diedit Langsung)
            </span>
            <textarea
              rows={24}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50/40 p-4 font-mono text-xs text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 leading-relaxed"
            />
          </div>
        )}

        {/* Mode 3: Agent Intermediate Traces Explorer */}
        {viewMode === 'traces' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Jejak Tahapan Eksekusi Agen (Google Flow History)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Periksa output intermediate yang dihasilkan oleh setiap agen di setiap tahapan pipeline.
              </p>
            </div>

            <div className="space-y-4">
              {stepResults.map((res, index) => (
                <div
                  key={res.stepId}
                  className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-2"
                >
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
                        {index + 1}
                      </span>
                      <span className="font-bold text-xs text-slate-900">
                        {res.stepName}
                      </span>
                      <span className="rounded bg-slate-200 px-1.5 py-0.2 text-[10px] font-medium text-slate-700">
                        {res.role}
                      </span>
                    </div>
                    {res.durationMs > 0 && (
                      <span className="font-mono text-[10px] text-slate-500">
                        {(res.durationMs / 1000).toFixed(1)} detik
                      </span>
                    )}
                  </div>
                  <pre className="max-h-56 overflow-y-auto whitespace-pre-wrap font-mono text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-200 leading-relaxed">
                    {res.output || '(Tidak ada output)'}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
