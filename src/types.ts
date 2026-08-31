export type AIProvider = 'gemini' | 'openai';

export interface AgentStep {
  id: string;
  name: string;
  role: string;
  description: string;
  iconName: string;
  systemInstruction: string;
  promptTemplate: string;
  temperature: number;
  enabled: boolean;
  modelOverride?: string;
  outputVar: string;
}

export interface AgentFlowPreset {
  id: string;
  name: string;
  description: string;
  category: string;
  badge: string;
  icon: string;
  steps: AgentStep[];
}

export interface ArticleInput {
  topic: string;
  keywords: string;
  targetAudience: string;
  tone: string;
  language: string;
  wordCount: number;
  additionalInstructions: string;
  provider: AIProvider;
  model: string;
  customApiKey?: string;
  includeFaq: boolean;
  includeTakeaways: boolean;
  includeTable: boolean;
}

export interface StepExecutionResult {
  stepId: string;
  stepName: string;
  role: string;
  status: 'pending' | 'running' | 'completed' | 'error' | 'skipped';
  output: string;
  durationMs: number;
  error?: string;
  timestamp: number;
}

export interface GeneratedArticle {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  topic: string;
  provider: AIProvider;
  model: string;
  flowPresetName: string;
  stepResults: StepExecutionResult[];
  wordCount: number;
  readingTimeMinutes: number;
  seoScore: number;
  keywords: string[];
}

export interface ModelOption {
  id: string;
  name: string;
  provider: AIProvider;
  description: string;
  recommendedFor?: string;
  tag?: string;
}
