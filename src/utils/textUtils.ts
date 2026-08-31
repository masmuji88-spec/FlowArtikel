import { ArticleInput, GeneratedArticle } from '../types';

export function calculateWordCount(text: string): number {
  if (!text || typeof text !== 'string') return 0;
  const words = text.trim().match(/[\w\d\u00C0-\u024F\u1E00-\u1EFF]+/g);
  return words ? words.length : 0;
}

export function calculateReadingTimeMinutes(wordCount: number): number {
  const wordsPerMinute = 200;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

export function extractArticleTitle(content: string, fallbackTopic: string): string {
  if (!content) return fallbackTopic || 'Artikel Tanpa Judul';
  const h1Match = content.match(/^#\s+(.+)$/m);
  if (h1Match && h1Match[1]) {
    return h1Match[1].replace(/\*\*/g, '').trim();
  }
  const titleMatch = content.match(/Judul:\s*(.+)/i) || content.match(/Title:\s*(.+)/i);
  if (titleMatch && titleMatch[1]) {
    return titleMatch[1].replace(/\*\*/g, '').trim();
  }
  return fallbackTopic || 'Artikel Tanpa Judul';
}

export function calculateSeoScore(content: string, keywords: string, targetWordCount: number = 1000): {
  score: number;
  checks: { label: string; passed: boolean; scoreDelta: number; feedback: string }[];
} {
  const checks: { label: string; passed: boolean; scoreDelta: number; feedback: string }[] = [];
  let score = 0;

  const wordCount = calculateWordCount(content);
  const keywordList = keywords
    ? keywords.split(',').map((k) => k.trim().toLowerCase()).filter(Boolean)
    : [];

  // Check 1: Title / H1 presence
  const hasH1 = /^#\s+/m.test(content);
  if (hasH1) {
    score += 20;
    checks.push({
      label: 'Struktur Heading Utama (H1)',
      passed: true,
      scoreDelta: 20,
      feedback: 'Judul H1 utama terdeteksi dengan jelas.',
    });
  } else {
    checks.push({
      label: 'Struktur Heading Utama (H1)',
      passed: false,
      scoreDelta: 0,
      feedback: 'Tambahkan heading H1 (# Judul) di awal artikel.',
    });
  }

  // Check 2: Sub-headings (H2/H3)
  const h2Count = (content.match(/^##\s+/gm) || []).length;
  const h3Count = (content.match(/^###\s+/gm) || []).length;
  if (h2Count >= 3) {
    score += 20;
    checks.push({
      label: 'Sub-heading H2 & H3 Terstruktur',
      passed: true,
      scoreDelta: 20,
      feedback: `Ditemukan ${h2Count} H2 dan ${h3Count} H3 untuk keterbacaan optimal.`,
    });
  } else {
    score += h2Count > 0 ? 10 : 0;
    checks.push({
      label: 'Sub-heading H2 & H3 Terstruktur',
      passed: false,
      scoreDelta: h2Count > 0 ? 10 : 0,
      feedback: `Minimal butuh 3 sub-heading H2 (saat ini ada ${h2Count}).`,
    });
  }

  // Check 3: Word Count Target
  const minRequired = Math.min(targetWordCount * 0.7, 500);
  if (wordCount >= minRequired) {
    score += 20;
    checks.push({
      label: 'Kecukupan Panjang Konten',
      passed: true,
      scoreDelta: 20,
      feedback: `Total ${wordCount} kata, memenuhi kedalaman pembahasan.`,
    });
  } else {
    const ratio = Math.min(1, wordCount / (minRequired || 1));
    const partialScore = Math.round(ratio * 15);
    score += partialScore;
    checks.push({
      label: 'Kecukupan Panjang Konten',
      passed: false,
      scoreDelta: partialScore,
      feedback: `Panjang ${wordCount} kata masih di bawah target (${minRequired} kata).`,
    });
  }

  // Check 4: Keyword presence
  if (keywordList.length > 0) {
    const lowerContent = content.toLowerCase();
    const foundKeywords = keywordList.filter((k) => lowerContent.includes(k));
    const ratio = foundKeywords.length / keywordList.length;
    const kwScore = Math.round(ratio * 20);
    score += kwScore;
    checks.push({
      label: 'Integrasi Keyword Target',
      passed: ratio >= 0.7,
      scoreDelta: kwScore,
      feedback: `${foundKeywords.length} dari ${keywordList.length} kata kunci terdistribusi dalam artikel.`,
    });
  } else {
    score += 15;
    checks.push({
      label: 'Integrasi Keyword Target',
      passed: true,
      scoreDelta: 15,
      feedback: 'Belum ada keyword spesifik yang ditentukan.',
    });
  }

  // Check 5: Rich Formatting (Lists, Callouts, or Tables)
  const hasLists = /^[\*\-\+]\s+/m.test(content) || /^\d+\.\s+/m.test(content);
  const hasTable = /\|.+\|.+\|/m.test(content);
  const hasQuotes = /^>\s+/m.test(content);

  if (hasLists && (hasTable || hasQuotes)) {
    score += 20;
    checks.push({
      label: 'Format Kaya & Visual (List, Kutipan/Tabel)',
      passed: true,
      scoreDelta: 20,
      feedback: 'Konten memiliki variasi format bullet list, tabel, dan kutipan.',
    });
  } else if (hasLists || hasQuotes) {
    score += 10;
    checks.push({
      label: 'Format Kaya & Visual (List, Kutipan/Tabel)',
      passed: true,
      scoreDelta: 10,
      feedback: 'Memiliki formatting list/kutipan. Tambahkan tabel untuk nilai ekstra.',
    });
  } else {
    checks.push({
      label: 'Format Kaya & Visual (List, Kutipan/Tabel)',
      passed: false,
      scoreDelta: 0,
      feedback: 'Gunakan bullet points, kutipan, atau tabel untuk memecah teks panjang.',
    });
  }

  return {
    score: Math.min(100, Math.max(0, score)),
    checks,
  };
}

export function interpolateTemplate(
  template: string,
  input: ArticleInput,
  previousOutput: string
): string {
  let result = template;
  result = result.replace(/\{\{topic\}\}/g, input.topic || '');
  result = result.replace(/\{\{keywords\}\}/g, input.keywords || 'N/A');
  result = result.replace(/\{\{targetAudience\}\}/g, input.targetAudience || 'Umum');
  result = result.replace(/\{\{tone\}\}/g, input.tone || 'Informatif & Berwibawa');
  result = result.replace(/\{\{language\}\}/g, input.language || 'Bahasa Indonesia');
  result = result.replace(/\{\{wordCount\}\}/g, String(input.wordCount || 1000));
  result = result.replace(/\{\{additionalInstructions\}\}/g, input.additionalInstructions || 'Tidak ada');
  result = result.replace(/\{\{previous_step_output\}\}/g, previousOutput || '(Belum ada output sebelumnya)');
  return result;
}

export function downloadAsFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// LocalStorage management for history
const STORAGE_KEY_ARTICLES = 'flowarticle_saved_articles_v1';

export function loadSavedArticles(): GeneratedArticle[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ARTICLES);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load saved articles from localStorage', e);
    return [];
  }
}

export function saveArticleToStorage(article: GeneratedArticle): void {
  try {
    const current = loadSavedArticles();
    const filtered = current.filter((a) => a.id !== article.id);
    const updated = [article, ...filtered].slice(0, 50); // Keep last 50
    localStorage.setItem(STORAGE_KEY_ARTICLES, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save article to localStorage', e);
  }
}

export function deleteArticleFromStorage(id: string): GeneratedArticle[] {
  try {
    const current = loadSavedArticles();
    const updated = current.filter((a) => a.id !== id);
    localStorage.setItem(STORAGE_KEY_ARTICLES, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to delete article from localStorage', e);
    return [];
  }
}
