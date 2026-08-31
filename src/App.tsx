/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { FlowCanvas } from './components/FlowCanvas';
import { ArticleConfigForm } from './components/ArticleConfigForm';
import { AgentExecutionTrace } from './components/AgentExecutionTrace';
import { ArticleEditorWorkspace } from './components/ArticleEditorWorkspace';
import { HistoryDrawer } from './components/HistoryDrawer';
import { ApiSettingsModal } from './components/ApiSettingsModal';
import {
  AgentStep,
  ArticleInput,
  StepExecutionResult,
  GeneratedArticle,
  AIProvider,
  AgentFlowPreset,
} from './types';
import { FLOW_TEMPLATES, AVAILABLE_MODELS } from './data/flowTemplates';
import {
  interpolateTemplate,
  extractArticleTitle,
  calculateWordCount,
  calculateReadingTimeMinutes,
  calculateSeoScore,
  loadSavedArticles,
  saveArticleToStorage,
  deleteArticleFromStorage,
} from './utils/textUtils';

export default function App() {
  const [activeTab, setActiveTab] = useState<'generator' | 'flow-builder' | 'history'>('generator');
  const [selectedPresetId, setSelectedPresetId] = useState<string>(FLOW_TEMPLATES[0].id);
  const [currentSteps, setCurrentSteps] = useState<AgentStep[]>(FLOW_TEMPLATES[0].steps);

  const [input, setInput] = useState<ArticleInput>({
    topic: '',
    keywords: '',
    targetAudience: 'Umum & Publik Luas',
    tone: 'Informatif, Terstruktur & Berwibawa (Otoritatif)',
    language: 'Bahasa Indonesia',
    wordCount: 1500,
    additionalInstructions: '',
    provider: 'gemini',
    model: 'gemini-3.7-flash',
    includeFaq: true,
    includeTakeaways: true,
    includeTable: false,
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [isStepByStepMode, setIsStepByStepMode] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [stepResults, setStepResults] = useState<StepExecutionResult[]>([]);
  const [articleContent, setArticleContent] = useState<string>('');
  const [savedArticles, setSavedArticles] = useState<GeneratedArticle[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [customApiKey, setCustomApiKey] = useState('');
  const [activePresetName, setActivePresetName] = useState<string>(FLOW_TEMPLATES[0].name);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Load saved articles from local storage on mount
  useEffect(() => {
    const saved = loadSavedArticles();
    setSavedArticles(saved);
  }, []);

  const handleApplyPreset = (preset: AgentFlowPreset) => {
    setSelectedPresetId(preset.id);
    setActivePresetName(preset.name);
    setCurrentSteps(JSON.parse(JSON.stringify(preset.steps)));
  };

  // Helper to execute a single step
  const executeSingleStep = async (
    stepIdx: number,
    previousOutput: string,
    currentResults: StepExecutionResult[]
  ): Promise<string> => {
    const step = currentSteps[stepIdx];
    if (!step || !step.enabled) return previousOutput;

    const startTime = Date.now();
    const prompt = interpolateTemplate(step.promptTemplate, input, previousOutput);

    // Update status to running
    setStepResults((prev) =>
      prev.map((res, idx) =>
        idx === stepIdx ? { ...res, status: 'running', timestamp: Date.now() } : res
      )
    );

    try {
      const response = await fetch('/api/generate-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: input.provider,
          model: step.modelOverride || input.model,
          systemInstruction: step.systemInstruction,
          prompt,
          temperature: step.temperature,
          apiKey: customApiKey || undefined,
        }),
        signal: abortControllerRef.current?.signal,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP error ${response.status}`);
      }

      const data = await response.json();
      const outputText = data.text || '';
      const durationMs = Date.now() - startTime;

      setStepResults((prev) =>
        prev.map((res, idx) =>
          idx === stepIdx
            ? {
                ...res,
                status: 'completed',
                output: outputText,
                durationMs,
                error: undefined,
              }
            : res
        )
      );

      return outputText;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new Error('Proses dihentikan oleh pengguna.');
      }
      const durationMs = Date.now() - startTime;
      const errorMsg = err.message || 'Gagal memproses AI step.';

      setStepResults((prev) =>
        prev.map((res, idx) =>
          idx === stepIdx
            ? {
                ...res,
                status: 'error',
                error: errorMsg,
                durationMs,
              }
            : res
        )
      );
      throw err;
    }
  };

  // Run full automatic pipeline
  const handleGenerateFull = async () => {
    if (!input.topic.trim()) return;

    setIsGenerating(true);
    setIsStepByStepMode(false);
    abortControllerRef.current = new AbortController();

    const activeSteps = currentSteps.filter((s) => s.enabled);
    if (activeSteps.length === 0) {
      alert('Pilih minimal 1 agen aktif dalam alur kerja.');
      setIsGenerating(false);
      return;
    }

    // Initialize blank results
    const initialResults: StepExecutionResult[] = currentSteps.map((step) => ({
      stepId: step.id,
      stepName: step.name,
      role: step.role,
      status: step.enabled ? 'pending' : 'skipped',
      output: '',
      durationMs: 0,
      timestamp: Date.now(),
    }));

    setStepResults(initialResults);

    let accumulatedOutput = '';

    try {
      for (let i = 0; i < currentSteps.length; i++) {
        const step = currentSteps[i];
        if (!step.enabled) continue;

        setCurrentStepIndex(i);
        const output = await executeSingleStep(i, accumulatedOutput, initialResults);
        accumulatedOutput = output;
      }

      // Final article ready
      setArticleContent(accumulatedOutput);

      // Auto save article
      const title = extractArticleTitle(accumulatedOutput, input.topic);
      const wordCount = calculateWordCount(accumulatedOutput);
      const readingTime = calculateReadingTimeMinutes(wordCount);
      const seoScore = calculateSeoScore(accumulatedOutput, input.keywords, input.wordCount).score;

      const newArticle: GeneratedArticle = {
        id: `art-${Date.now()}`,
        title,
        content: accumulatedOutput,
        createdAt: new Date().toISOString(),
        topic: input.topic,
        provider: input.provider,
        model: input.model,
        flowPresetName: activePresetName,
        stepResults: initialResults,
        wordCount,
        readingTimeMinutes: readingTime,
        seoScore,
        keywords: input.keywords
          ? input.keywords.split(',').map((k) => k.trim()).filter(Boolean)
          : [],
      };

      saveArticleToStorage(newArticle);
      setSavedArticles(loadSavedArticles());
    } catch (err: any) {
      console.error('Pipeline error:', err);
    } finally {
      setIsGenerating(false);
      setCurrentStepIndex(-1);
    }
  };

  // Start Step-by-Step execution (pauses at each step for review)
  const handleStartStepByStep = async () => {
    if (!input.topic.trim()) return;

    setIsGenerating(true);
    setIsStepByStepMode(true);
    abortControllerRef.current = new AbortController();

    const initialResults: StepExecutionResult[] = currentSteps.map((step) => ({
      stepId: step.id,
      stepName: step.name,
      role: step.role,
      status: step.enabled ? 'pending' : 'skipped',
      output: '',
      durationMs: 0,
      timestamp: Date.now(),
    }));

    setStepResults(initialResults);

    // Find first enabled step
    const firstEnabledIdx = currentSteps.findIndex((s) => s.enabled);
    if (firstEnabledIdx === -1) {
      alert('Pilih minimal 1 agen aktif dalam alur kerja.');
      setIsGenerating(false);
      return;
    }

    try {
      setCurrentStepIndex(firstEnabledIdx);
      const output = await executeSingleStep(firstEnabledIdx, '', initialResults);
      // Finished step 1, pause for review
    } catch (err: any) {
      console.error('Step error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Proceed to next step in Step-by-Step mode
  const handleProceedNextStep = async () => {
    // Find current completed step
    const lastCompletedIdx = stepResults.reduce(
      (max, res, idx) => (res.status === 'completed' ? idx : max),
      -1
    );

    // Find next enabled step
    let nextStepIdx = -1;
    for (let i = lastCompletedIdx + 1; i < currentSteps.length; i++) {
      if (currentSteps[i].enabled) {
        nextStepIdx = i;
        break;
      }
    }

    if (nextStepIdx === -1) {
      // All steps completed
      const finalOutput = stepResults[lastCompletedIdx]?.output || '';
      setArticleContent(finalOutput);

      const title = extractArticleTitle(finalOutput, input.topic);
      const wordCount = calculateWordCount(finalOutput);
      const readingTime = calculateReadingTimeMinutes(wordCount);
      const seoScore = calculateSeoScore(finalOutput, input.keywords, input.wordCount).score;

      const newArticle: GeneratedArticle = {
        id: `art-${Date.now()}`,
        title,
        content: finalOutput,
        createdAt: new Date().toISOString(),
        topic: input.topic,
        provider: input.provider,
        model: input.model,
        flowPresetName: activePresetName,
        stepResults,
        wordCount,
        readingTimeMinutes: readingTime,
        seoScore,
        keywords: input.keywords
          ? input.keywords.split(',').map((k) => k.trim()).filter(Boolean)
          : [],
      };

      saveArticleToStorage(newArticle);
      setSavedArticles(loadSavedArticles());
      alert('Selamat! Seluruh tahapan pipeline agen berhasil diselesaikan.');
      return;
    }

    // Previous output is the output from last completed step
    const prevOutput = stepResults[lastCompletedIdx]?.output || '';

    setIsGenerating(true);
    setCurrentStepIndex(nextStepIdx);
    abortControllerRef.current = new AbortController();

    try {
      const output = await executeSingleStep(nextStepIdx, prevOutput, stepResults);

      // If this was the last enabled step, set article content
      const remainingEnabled = currentSteps
        .slice(nextStepIdx + 1)
        .some((s) => s.enabled);
      if (!remainingEnabled) {
        setArticleContent(output);
      }
    } catch (err) {
      console.error('Step execution error', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Retry a step
  const handleRetryStep = async (index: number) => {
    // Find previous step output
    let prevOutput = '';
    for (let i = index - 1; i >= 0; i--) {
      if (stepResults[i]?.status === 'completed') {
        prevOutput = stepResults[i].output;
        break;
      }
    }

    setIsGenerating(true);
    setCurrentStepIndex(index);
    abortControllerRef.current = new AbortController();

    try {
      await executeSingleStep(index, prevOutput, stepResults);
    } catch (err) {
      console.error('Retry step error', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Update step output manually (Human-in-the-loop)
  const handleUpdateStepOutput = (index: number, newOutput: string) => {
    setStepResults((prev) =>
      prev.map((res, idx) => (idx === index ? { ...res, output: newOutput } : res))
    );
    // If it's the last step, also update main article content
    if (index === currentSteps.length - 1 || index === stepResults.length - 1) {
      setArticleContent(newOutput);
    }
  };

  // Cancel generation
  const handleCancelGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsGenerating(false);
    setCurrentStepIndex(-1);
  };

  // Save to history explicitly
  const handleSaveToHistory = () => {
    if (!articleContent.trim()) return;
    const title = extractArticleTitle(articleContent, input.topic);
    const wordCount = calculateWordCount(articleContent);
    const readingTime = calculateReadingTimeMinutes(wordCount);
    const seoScore = calculateSeoScore(articleContent, input.keywords, input.wordCount).score;

    const newArticle: GeneratedArticle = {
      id: `art-${Date.now()}`,
      title,
      content: articleContent,
      createdAt: new Date().toISOString(),
      topic: input.topic,
      provider: input.provider,
      model: input.model,
      flowPresetName: activePresetName,
      stepResults,
      wordCount,
      readingTimeMinutes: readingTime,
      seoScore,
      keywords: input.keywords
        ? input.keywords.split(',').map((k) => k.trim()).filter(Boolean)
        : [],
    };

    saveArticleToStorage(newArticle);
    setSavedArticles(loadSavedArticles());
  };

  // Restore article from history
  const handleSelectHistoryArticle = (article: GeneratedArticle) => {
    setArticleContent(article.content);
    setInput((prev) => ({
      ...prev,
      topic: article.topic,
      keywords: article.keywords.join(', '),
      provider: article.provider,
      model: article.model,
    }));
    if (article.stepResults && article.stepResults.length > 0) {
      setStepResults(article.stepResults);
    }
    setActiveTab('generator');
  };

  // Delete article from history
  const handleDeleteHistoryArticle = (id: string) => {
    const updated = deleteArticleFromStorage(id);
    setSavedArticles(updated);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedProvider={input.provider}
        selectedModel={input.model}
        onOpenSettings={() => setIsSettingsOpen(true)}
        savedCount={savedArticles.length}
        activeFlowName={activePresetName}
        isGenerating={isGenerating}
      />

      {/* Main Content Area */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Tab 1: Generator Workspace */}
        {activeTab === 'generator' && (
          <div className="space-y-6">
            {/* Input Config Form */}
            <ArticleConfigForm
              input={input}
              setInput={setInput}
              onGenerateFull={handleGenerateFull}
              onStartStepByStep={handleStartStepByStep}
              isGenerating={isGenerating}
              activeFlowPresetName={activePresetName}
              activeStepsCount={currentSteps.filter((s) => s.enabled).length}
            />

            {/* Live Pipeline Execution Trace */}
            {stepResults.length > 0 && (
              <AgentExecutionTrace
                steps={currentSteps}
                stepResults={stepResults}
                currentStepIndex={currentStepIndex}
                isGenerating={isGenerating}
                isStepByStepMode={isStepByStepMode}
                onProceedNextStep={handleProceedNextStep}
                onRetryStep={handleRetryStep}
                onUpdateStepOutput={handleUpdateStepOutput}
                onCancelGeneration={handleCancelGeneration}
              />
            )}

            {/* Article Workspace (Markdown preview, raw editor & SEO audits) */}
            {(articleContent || stepResults.some((r) => r.status === 'completed')) && (
              <ArticleEditorWorkspace
                content={articleContent}
                setContent={setArticleContent}
                topic={input.topic}
                keywords={input.keywords}
                stepResults={stepResults}
                onSaveToHistory={handleSaveToHistory}
              />
            )}
          </div>
        )}

        {/* Tab 2: Agent Flow Builder (Google Flow Visualizer & Editor) */}
        {activeTab === 'flow-builder' && (
          <FlowCanvas
            currentSteps={currentSteps}
            setCurrentSteps={setCurrentSteps}
            selectedPresetId={selectedPresetId}
            setSelectedPresetId={setSelectedPresetId}
            onApplyPreset={handleApplyPreset}
          />
        )}

        {/* Tab 3: History & Saved Articles */}
        {activeTab === 'history' && (
          <HistoryDrawer
            articles={savedArticles}
            onSelectArticle={handleSelectHistoryArticle}
            onDeleteArticle={handleDeleteHistoryArticle}
            onClose={() => setActiveTab('generator')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>FlowArticle AI &bull; Agentic Pipeline Article Generator</span>
          <span className="text-slate-400">
            Powered by Google Gemini &amp; OpenAI &bull; Google Flow Architecture
          </span>
        </div>
      </footer>

      {/* Settings Modal */}
      <ApiSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        selectedProvider={input.provider}
        setSelectedProvider={(p: AIProvider) =>
          setInput((prev) => ({
            ...prev,
            provider: p,
            model: p === 'gemini' ? 'gemini-3.7-flash' : 'gpt-4o',
          }))
        }
        selectedModel={input.model}
        setSelectedModel={(m: string) => setInput((prev) => ({ ...prev, model: m }))}
        customApiKey={customApiKey}
        setCustomApiKey={setCustomApiKey}
      />
    </div>
  );
}
