import React from 'react';
import { Sparkles, Bot, History, Settings, Zap, ArrowRight, Layers } from 'lucide-react';
import { AIProvider } from '../types';

interface NavbarProps {
  activeTab: 'generator' | 'flow-builder' | 'history';
  setActiveTab: (tab: 'generator' | 'flow-builder' | 'history') => void;
  selectedProvider: AIProvider;
  selectedModel: string;
  onOpenSettings: () => void;
  savedCount: number;
  activeFlowName: string;
  isGenerating: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  selectedProvider,
  selectedModel,
  onOpenSettings,
  savedCount,
  activeFlowName,
  isGenerating,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white shadow-sm shadow-indigo-200">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-slate-900 text-lg">FlowArticle</span>
              <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700 border border-indigo-100/80">
                Agent Instructions
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Multi-Agent Pipeline Article Generator
            </p>
          </div>
        </div>

        {/* Center Tabs */}
        <nav className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 text-sm font-medium text-slate-600">
          <button
            id="tab-generator"
            onClick={() => setActiveTab('generator')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 transition-all ${
              activeTab === 'generator'
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'hover:text-slate-900 text-slate-600'
            }`}
          >
            <Sparkles className="h-4 w-4 text-indigo-600" />
            <span>Generator</span>
          </button>

          <button
            id="tab-flow-builder"
            onClick={() => setActiveTab('flow-builder')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 transition-all ${
              activeTab === 'flow-builder'
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'hover:text-slate-900 text-slate-600'
            }`}
          >
            <Layers className="h-4 w-4 text-indigo-600" />
            <span className="flex items-center gap-1.5">
              Agent Flow
              <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.2">
                Google Flow Style
              </span>
            </span>
          </button>

          <button
            id="tab-history"
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 transition-all ${
              activeTab === 'history'
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'hover:text-slate-900 text-slate-600'
            }`}
          >
            <History className="h-4 w-4 text-slate-600" />
            <span>Riwayat</span>
            {savedCount > 0 && (
              <span className="rounded-full bg-slate-200 text-slate-700 text-xs px-1.5 py-0.2">
                {savedCount}
              </span>
            )}
          </button>
        </nav>

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          {/* Active Model Indicator */}
          <div
            onClick={onOpenSettings}
            className="hidden md:flex items-center gap-2 cursor-pointer rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 transition-colors"
            title="Klik untuk konfigurasi provider & API key"
          >
            <span
              className={`h-2 w-2 rounded-full ${
                selectedProvider === 'gemini' ? 'bg-blue-500' : 'bg-emerald-500'
              }`}
            />
            <span className="font-medium capitalize">{selectedProvider}</span>
            <span className="text-slate-400">/</span>
            <span className="font-mono text-slate-600 truncate max-w-[110px]">
              {selectedModel}
            </span>
          </div>

          {/* Settings button */}
          <button
            id="btn-open-settings"
            onClick={onOpenSettings}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            title="Pengaturan API & Konfigurasi"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
