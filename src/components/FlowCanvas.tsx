import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Trash2,
  Copy,
  ChevronDown,
  ChevronUp,
  Sliders,
  Sparkles,
  Bot,
  HelpCircle,
  ArrowDown,
  CheckCircle2,
  FileCode,
  RotateCcw,
  BookOpen,
  Zap,
  Info,
} from 'lucide-react';
import { AgentStep, AgentFlowPreset } from '../types';
import { FLOW_TEMPLATES } from '../data/flowTemplates';

interface FlowCanvasProps {
  currentSteps: AgentStep[];
  setCurrentSteps: React.Dispatch<React.SetStateAction<AgentStep[]>>;
  selectedPresetId: string;
  setSelectedPresetId: (id: string) => void;
  onApplyPreset: (preset: AgentFlowPreset) => void;
}

export const FlowCanvas: React.FC<FlowCanvasProps> = ({
  currentSteps,
  setCurrentSteps,
  selectedPresetId,
  setSelectedPresetId,
  onApplyPreset,
}) => {
  const [expandedStepId, setExpandedStepId] = useState<string | null>(
    currentSteps[0]?.id || null
  );

  const toggleExpand = (id: string) => {
    setExpandedStepId(expandedStepId === id ? null : id);
  };

  const handleToggleStep = (index: number) => {
    setCurrentSteps((prev) =>
      prev.map((step, idx) =>
        idx === index ? { ...step, enabled: !step.enabled } : step
      )
    );
  };

  const handleUpdateStep = (index: number, updates: Partial<AgentStep>) => {
    setCurrentSteps((prev) =>
      prev.map((step, idx) => (idx === index ? { ...step, ...updates } : step))
    );
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setCurrentSteps((prev) => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[index - 1];
      next[index - 1] = temp;
      return next;
    });
  };

  const handleMoveDown = (index: number) => {
    if (index === currentSteps.length - 1) return;
    setCurrentSteps((prev) => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[index + 1];
      next[index + 1] = temp;
      return next;
    });
  };

  const handleDeleteStep = (index: number) => {
    if (currentSteps.length <= 1) {
      alert('Alur kerja minimal harus memiliki 1 Agent Step.');
      return;
    }
    const stepToDelete = currentSteps[index];
    if (confirm(`Hapus langkah agen "${stepToDelete.name}"?`)) {
      setCurrentSteps((prev) => prev.filter((_, idx) => idx !== index));
    }
  };

  const handleDuplicateStep = (index: number) => {
    const original = currentSteps[index];
    const newStep: AgentStep = {
      ...original,
      id: `step-${Date.now()}`,
      name: `${original.name} (Salinan)`,
      outputVar: `${original.outputVar}_copy`,
    };
    setCurrentSteps((prev) => {
      const next = [...prev];
      next.splice(index + 1, 0, newStep);
      return next;
    });
    setExpandedStepId(newStep.id);
  };

  const handleAddNewStep = () => {
    const stepNum = currentSteps.length + 1;
    const newStep: AgentStep = {
      id: `custom-step-${Date.now()}`,
      name: `Agent ${stepNum}: Custom Specialist`,
      role: 'Domain Content Specialist',
      description: 'Langkah khusus yang memproses input dan menghasilkan naskah sesuai kebutuhan Anda.',
      iconName: 'Sparkles',
      systemInstruction: 'Anda adalah pakar konten yang bertugas menganalisis dan memperkaya naskah artikel.',
      promptTemplate: `Lakukan penyempurnaan berdasarkan data sebelumnya:\n=== INPUT SEBELUMNYA ===\n{{previous_step_output}}\n========================\n\nTopik: {{topic}}\nKata Kunci: {{keywords}}`,
      temperature: 0.7,
      enabled: true,
      outputVar: `custom_output_${stepNum}`,
    };
    setCurrentSteps((prev) => [...prev, newStep]);
    setExpandedStepId(newStep.id);
  };

  const insertVariable = (index: number, variableName: string) => {
    const step = currentSteps[index];
    const updatedTemplate = `${step.promptTemplate} {{${variableName}}}`;
    handleUpdateStep(index, { promptTemplate: updatedTemplate });
  };

  const resetToPreset = (presetId: string) => {
    const preset = FLOW_TEMPLATES.find((t) => t.id === presetId);
    if (preset) {
      setSelectedPresetId(preset.id);
      onApplyPreset(preset);
      setExpandedStepId(preset.steps[0]?.id || null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Preset Selector Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-900">
                Pilih Preset Agent Flow (Google Flow Style)
              </h2>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Pilih alur kerja multi-agen siap pakai atau sesuaikan setiap instruksi agen secara visual di bawah ini.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {currentSteps.filter((s) => s.enabled).length} dari {currentSteps.length} Agen Aktif
            </span>
          </div>
        </div>

        {/* Template Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
          {FLOW_TEMPLATES.map((tpl) => {
            const isSelected = selectedPresetId === tpl.id;
            return (
              <div
                key={tpl.id}
                id={`preset-card-${tpl.id}`}
                onClick={() => resetToPreset(tpl.id)}
                className={`cursor-pointer rounded-xl border p-4 transition-all ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50/40 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="rounded-full bg-white border border-slate-200 text-indigo-700 text-[11px] font-bold px-2 py-0.5 shadow-xs">
                    {tpl.badge}
                  </span>
                  {isSelected && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-slate-900 text-sm mt-2 line-clamp-1">
                  {tpl.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {tpl.description}
                </p>
                <div className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-slate-600">
                  <Bot className="h-3.5 w-3.5 text-indigo-500" />
                  <span>{tpl.steps.length} Agent Steps Sequential</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Visual Pipeline Flow Chart Banner */}
      <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 via-slate-50 to-blue-50 p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="h-4 w-4 text-indigo-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900">
            Visual Alur Pipeline Eksekusi Berjenjang
          </h3>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {currentSteps.map((step, idx) => (
            <React.Fragment key={step.id}>
              <div
                onClick={() => setExpandedStepId(step.id)}
                className={`cursor-pointer flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  !step.enabled
                    ? 'bg-slate-200/70 text-slate-400 line-through'
                    : expandedStepId === step.id
                    ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-200'
                    : 'bg-white border border-slate-200 text-slate-700 hover:border-indigo-300'
                }`}
              >
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-slate-900/10 text-[10px]">
                  {idx + 1}
                </span>
                <span className="truncate max-w-[140px]">{step.name.split(':')[1] || step.name}</span>
              </div>
              {idx < currentSteps.length - 1 && (
                <div className="text-slate-400">
                  <ArrowDown className="h-3.5 w-3.5 rotate-[-90deg] hidden sm:inline" />
                  <ArrowDown className="h-3.5 w-3.5 sm:hidden" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Steps List */}
      <div className="space-y-4">
        {currentSteps.map((step, index) => {
          const isExpanded = expandedStepId === step.id;
          return (
            <div
              key={step.id}
              id={`agent-step-${index}`}
              className={`rounded-2xl border transition-all ${
                !step.enabled
                  ? 'border-slate-200 bg-slate-50/70 opacity-60'
                  : isExpanded
                  ? 'border-indigo-300 bg-white shadow-md ring-1 ring-indigo-100'
                  : 'border-slate-200 bg-white shadow-xs hover:border-slate-300'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 sm:p-5">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Step Number Badge */}
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-bold text-xs ${
                      step.enabled
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {index + 1}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base truncate">
                        {step.name}
                      </h4>
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                        {step.role}
                      </span>
                      {!step.enabled && (
                        <span className="rounded-md bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 text-[11px] font-semibold">
                          Dinonaktifkan
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-1.5 ml-2">
                  {/* Toggle Enable Checkbox */}
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-600 hover:text-slate-900 mr-2">
                    <input
                      type="checkbox"
                      checked={step.enabled}
                      onChange={() => handleToggleStep(index)}
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="hidden sm:inline font-medium">
                      {step.enabled ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </label>

                  {/* Move Up */}
                  <button
                    type="button"
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded-lg hover:bg-slate-100"
                    title="Pindahkan Ke Atas"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>

                  {/* Move Down */}
                  <button
                    type="button"
                    onClick={() => handleMoveDown(index)}
                    disabled={index === currentSteps.length - 1}
                    className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded-lg hover:bg-slate-100"
                    title="Pindahkan Ke Bawah"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>

                  {/* Duplicate */}
                  <button
                    type="button"
                    onClick={() => handleDuplicateStep(index)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100"
                    title="Duplikasi Step Ini"
                  >
                    <Copy className="h-4 w-4" />
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => handleDeleteStep(index)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                    title="Hapus Step"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  {/* Expand/Collapse Button */}
                  <button
                    type="button"
                    onClick={() => toggleExpand(step.id)}
                    className="ml-1 flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Expanded Step Customizer */}
              {isExpanded && (
                <div className="border-t border-slate-100 p-5 bg-slate-50/50 space-y-4">
                  {/* Step Meta (Name & Role) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Nama Agen (Step Title)
                      </label>
                      <input
                        type="text"
                        value={step.name}
                        onChange={(e) =>
                          handleUpdateStep(index, { name: e.target.value })
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Persona / Peran Agen (Role)
                      </label>
                      <input
                        type="text"
                        value={step.role}
                        onChange={(e) =>
                          handleUpdateStep(index, { role: e.target.value })
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  {/* System Instruction (Agent Directive) */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                        <Bot className="h-3.5 w-3.5 text-indigo-600" />
                        System Instructions (Perintah & Batasan Sistem Agen)
                      </label>
                      <span className="text-[11px] text-slate-500">
                        Aturan utama persona AI untuk langkah ini
                      </span>
                    </div>
                    <textarea
                      rows={4}
                      value={step.systemInstruction}
                      onChange={(e) =>
                        handleUpdateStep(index, {
                          systemInstruction: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-slate-300 bg-white p-3 font-mono text-xs text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 leading-relaxed"
                      placeholder="Masukkan instruksi sistem yang mendalam..."
                    />
                  </div>

                  {/* Prompt Template */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                        <FileCode className="h-3.5 w-3.5 text-indigo-600" />
                        Prompt Template
                      </label>
                      <span className="text-[11px] text-slate-500">
                        Gunakan tag variabel dinamis
                      </span>
                    </div>
                    <textarea
                      rows={4}
                      value={step.promptTemplate}
                      onChange={(e) =>
                        handleUpdateStep(index, {
                          promptTemplate: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-slate-300 bg-white p-3 font-mono text-xs text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 leading-relaxed"
                      placeholder="Masukkan template prompt..."
                    />

                    {/* Quick Variable Tags Injector */}
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-semibold text-slate-500">
                        Sisipkan Variabel:
                      </span>
                      {[
                        { label: '{{topic}}', name: 'topic', tip: 'Topik Utama' },
                        { label: '{{keywords}}', name: 'keywords', tip: 'Kata Kunci SEO' },
                        {
                          label: '{{previous_step_output}}',
                          name: 'previous_step_output',
                          tip: 'Hasil Agen Sebelumnya',
                        },
                        { label: '{{tone}}', name: 'tone', tip: 'Gaya Bahasa' },
                        { label: '{{targetAudience}}', name: 'targetAudience', tip: 'Target Pembaca' },
                        { label: '{{wordCount}}', name: 'wordCount', tip: 'Jumlah Kata' },
                        { label: '{{language}}', name: 'language', tip: 'Bahasa' },
                      ].map((v) => (
                        <button
                          key={v.name}
                          type="button"
                          onClick={() => insertVariable(index, v.name)}
                          className="rounded-md border border-slate-200 bg-white px-2 py-0.5 font-mono text-[11px] text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                          title={v.tip}
                        >
                          +{v.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Settings Row (Temperature & Variable ID) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200/60">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1">
                          <Sliders className="h-3.5 w-3.5 text-slate-500" />
                          Kreativitas / Temperature: {step.temperature}
                        </label>
                        <span className="text-[11px] text-slate-500">
                          {step.temperature < 0.4
                            ? 'Sangat Faktual/Tepat'
                            : step.temperature > 0.8
                            ? 'Sangat Kreatif'
                            : 'Seimbang'}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={step.temperature}
                        onChange={(e) =>
                          handleUpdateStep(index, {
                            temperature: parseFloat(e.target.value),
                          })
                        }
                        className="w-full accent-indigo-600 cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Nama Variabel Output
                      </label>
                      <input
                        type="text"
                        value={step.outputVar}
                        onChange={(e) =>
                          handleUpdateStep(index, { outputVar: e.target.value })
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 font-mono text-xs text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        placeholder="contoh: outline_result"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add New Step Button */}
      <div className="flex justify-center pt-2">
        <button
          type="button"
          id="btn-add-agent-step"
          onClick={handleAddNewStep}
          className="flex items-center gap-2 rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50/50 px-6 py-3 text-sm font-semibold text-indigo-700 hover:border-indigo-400 hover:bg-indigo-50 transition-all shadow-xs"
        >
          <Plus className="h-4 w-4" />
          Tambah Langkah Agen Baru (Custom Step)
        </button>
      </div>
    </div>
  );
};
