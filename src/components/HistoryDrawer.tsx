import React, { useState } from 'react';
import {
  History,
  Trash2,
  ExternalLink,
  Search,
  FileText,
  Clock,
  Type,
  TrendingUp,
  Bot,
  Calendar,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { GeneratedArticle } from '../types';

interface HistoryDrawerProps {
  articles: GeneratedArticle[];
  onSelectArticle: (article: GeneratedArticle) => void;
  onDeleteArticle: (id: string) => void;
  onClose: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  articles,
  onSelectArticle,
  onDeleteArticle,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredArticles = articles.filter((a) => {
    const q = searchQuery.toLowerCase();
    return (
      a.title.toLowerCase().includes(q) ||
      a.topic.toLowerCase().includes(q) ||
      a.flowPresetName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <History className="h-5 w-5 text-indigo-600" />
            Riwayat Artikel yang Disimpan
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar artikel yang telah dihasilkan sebelumnya dan tersimpan di browser Anda.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari artikel..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Articles List */}
      {filteredArticles.length === 0 ? (
        <div className="py-16 text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <p className="font-bold text-sm text-slate-700">
              {searchQuery ? 'Tidak ada artikel yang cocok' : 'Belum ada riwayat artikel'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {searchQuery
                ? 'Coba gunakan kata kunci pencarian yang lain.'
                : 'Buat artikel pertama Anda menggunakan tombol Generator di atas.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredArticles.map((article) => {
            const dateStr = new Date(article.createdAt).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={article.id}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-bold text-indigo-700 border border-indigo-100">
                      {article.flowPresetName}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Hapus artikel "${article.title}"?`)) {
                          onDeleteArticle(article.id);
                        }
                      }}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-slate-100 opacity-60 group-hover:opacity-100 transition-opacity"
                      title="Hapus dari Riwayat"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 mt-2.5 line-clamp-2 leading-snug">
                    {article.title}
                  </h3>

                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {article.topic}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Type className="h-3 w-3" />
                      {article.wordCount} kata
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {dateStr}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onSelectArticle(article);
                      onClose();
                    }}
                    className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800"
                  >
                    <span>Buka Editor</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
