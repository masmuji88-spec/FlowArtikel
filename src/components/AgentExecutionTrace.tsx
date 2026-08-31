import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Loader2,
  AlertCircle,
  Play,
  RotateCcw,
  Edit3,
  Bot,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight,
  Eye,
} from 'lucide-react';
import { StepExecutionResult, AgentStep } from '../types';

interface AgentExecutionTraceProps {
  steps: AgentStep[];
  stepResults: StepExecutionResult[];
  currentStepIndex: number;
  isGenerating: boolean;
  isStepByStepMode: boolean;
  onProceedNextStep: () => void;
  onRetryStep: (index: number) => void;
  onUpdateStepOutput: (index: number, newOutput: string) => void;
  onCancelGeneration: () => void;
}

export const AgentExecutionTrace: React.FC<AgentExecutionTraceProps> = ({
  steps,
  stepResults,
  currentStepIndex,
  isGenerating,
  isStepByStepMode,
  onProceedNextStep,
  onRetryStep,
  onUpdateStepOutput,
  onCancelGeneration,
}) => {
  const [selectedResultIndex, setSelectedResultIndex] = useState<number>(
    currentStepIndex >= 0 ? currentStepIndex : 0
  );
  const [isEditingCurrentOutput, setIsEditingCurrentOutput] = useState(false);

  const activeResult = stepResults[selectedResultIndex];
  const activeStepConfig = steps[selectedResultIndex];

  // Auto focus latest result
  React.useEffect(() => {
    if (currentStepIndex >= 0 && currentStepIndex < stepResults.length) {
      setSelectedResultIndex(currentStepIndex);
    }
  }, [currentStepIndex, stepResults.length]);

  return (
    <div className="rounded-2xl border border-indigo-200 bg-white p-6 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              Pipeline Eksekusi AI Agents (Google Flow Trace)
              {isGenerating && (
                <span className="flex items-center gap-1 text-xs font-semibold text-indigo-600 animate-pulse">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Memproses...
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500">
              {isStepByStepMode
                ? 'Mode Step-by-Step: Anda dapat meninjau dan mengedit output setiap agen sebelum berlanjut.'
                : 'Mode Otomatis: Pipeline berjalan secara berantai dari agen pertama hingga selesai.'}
            </p>
          </div>
        </div>

        {isGenerating && (
          <button
            type="button"
            onClick={onCancelGeneration}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors"
          >
            Hentikan Proses
          </button>
        )}
      </div>

      {/* Steps Visual Progress Tracker */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
        {stepResults.map((result, idx) => {
          const stepConfig = steps[idx];
          const isCurrent = currentStepIndex === idx && isGenerating;
          const isSelected = selectedResultIndex === idx;

          let statusBg = 'bg-slate-50 border-slate-200 text-slate-500';
          if (result.status === 'completed') {
            statusBg = 'bg-emerald-50/70 border-emerald-300 text-emerald-800';
          } else if (result.status === 'running') {
            statusBg = 'bg-indigo-50 border-indigo-400 text-indigo-900 ring-2 ring-indigo-200';
          } else if (result.status === 'error') {
            statusBg = 'bg-rose-50 border-rose-300 text-rose-800';
          }

          return (
            <div
              key={result.stepId}
              onClick={() => setSelectedResultIndex(idx)}
              className={`cursor-pointer rounded-xl border p-3 transition-all relative ${statusBg} ${
                isSelected ? 'shadow-sm ring-2 ring-indigo-500/30' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900/10 text-[11px] font-bold">
                  {idx + 1}
                </span>
                {result.status === 'completed' && (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                )}
                {result.status === 'running' && (
                  <Loader2 className="h-4 w-4 text-indigo-600 animate-spin" />
                )}
                {result.status === 'error' && (
                  <AlertCircle className="h-4 w-4 text-rose-600" />
                )}
                {result.status === 'pending' && (
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                )}
              </div>

              <h4 className="font-bold text-xs mt-2 line-clamp-1">
                {result.stepName.split(':')[1] || result.stepName}
              </h4>
              <p className="text-[11px] opacity-80 mt-0.5 line-clamp-1">
                {result.role}
              </p>

              {result.durationMs > 0 && (
                <span className="block text-[10px] opacity-70 mt-1 font-mono">
                  {(result.durationMs / 1000).toFixed(1)}s
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Step Detail & Output Viewer */}
      {activeResult && (
        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
          {/* Header of Active Step */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900">
                  Langkah {selectedResultIndex + 1}: {activeResult.stepName}
                </span>
                <span className="rounded bg-slate-200/80 px-2 py-0.5 text-xs text-slate-700 font-medium">
                  {activeResult.role}
                </span>
              </div>
              {activeStepConfig && (
                <p className="text-xs text-slate-500 mt-0.5">
                  {activeStepConfig.description}
                </p>
              )}
            </div>

            {/* Actions for Step-by-Step Mode */}
            <div className="flex items-center gap-2">
              {activeResult.status === 'completed' && (
                <button
                  type="button"
                  onClick={() => setIsEditingCurrentOutput(!isEditingCurrentOutput)}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>{isEditingCurrentOutput ? 'Selesai Edit' : 'Edit Output Agen Ini'}</span>
                </button>
              )}

              {activeResult.status === 'error' && (
                <button
                  type="button"
                  onClick={() => onRetryStep(selectedResultIndex)}
                  className="flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-1 text-xs font-bold text-white hover:bg-rose-700 transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Coba Lagi Langkah Ini</span>
                </button>
              )}

              {/* In step-by-step mode and completed, button to proceed */}
              {isStepByStepMode &&
                activeResult.status === 'completed' &&
                selectedResultIndex < stepResults.length - 1 &&
                !isGenerating && (
                  <button
                    type="button"
                    onClick={onProceedNextStep}
                    className="flex items-center gap-1 rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition-colors"
                  >
                    <span>Lanjut ke Agen Berikutnya</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
            </div>
          </div>

          {/* Output Content */}
          <div>
            {activeResult.status === 'running' && (
              <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
                <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Agen {activeResult.stepName} sedang berpikir dan menulis...
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Menerapkan System Instructions dan merangkai data kontekstual.
                  </p>
                </div>
              </div>
            )}

            {activeResult.status === 'error' && (
              <div className="rounded-lg bg-rose-50 border border-rose-200 p-4 text-xs text-rose-800 space-y-2">
                <div className="flex items-center gap-2 font-bold text-rose-900">
                  <AlertCircle className="h-4 w-4" />
                  <span>Terjadi Kesalahan pada Langkah Ini</span>
                </div>
                <p className="font-mono">{activeResult.error || 'Gagal memproses AI step.'}</p>
              </div>
            )}

            {activeResult.status === 'completed' && (
              <div>
                {isEditingCurrentOutput ? (
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                      Edit Langsung Output Sebelum Diteruskan ke Agen Selanjutnya:
                    </span>
                    <textarea
                      rows={10}
                      value={activeResult.output}
                      onChange={(e) =>
                        onUpdateStepOutput(selectedResultIndex, e.target.value)
                      }
                      className="w-full rounded-xl border border-slate-300 bg-white p-3 font-mono text-xs text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 leading-relaxed"
                    />
                  </div>
                ) : (
                  <div className="max-h-64 overflow-y-auto rounded-xl bg-white border border-slate-200 p-3 font-mono text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {activeResult.output}
                  </div>
                )}
              </div>
            )}

            {activeResult.status === 'pending' && (
              <div className="py-6 text-center text-xs text-slate-400">
                Menunggu giliran eksekusi pipeline...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
