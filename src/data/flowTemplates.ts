import { AgentFlowPreset, ModelOption } from '../types';

export const AVAILABLE_MODELS: ModelOption[] = [
  // Gemini Models (Server-side @google/genai)
  {
    id: 'gemini-3.7-flash',
    name: 'Gemini 3.7 Flash',
    provider: 'gemini',
    description: 'Model terdepan tercepat dan terpintar untuk generasi teks artikel dan reasoning.',
    recommendedFor: 'Rekomendasi Utama (Tercepat & Berkualitas Tinggi)',
    tag: 'Default',
  },
  {
    id: 'gemini-3.1-pro-preview',
    name: 'Gemini 3.1 Pro (Preview)',
    provider: 'gemini',
    description: 'Model penalaran mendalam untuk riset teknis rumit, struktur artikel ilmiah, dan argumen mendalam.',
    recommendedFor: 'Riset Mendalam & Analisis Kompleks',
    tag: 'Advanced',
  },
  {
    id: 'gemini-3.1-flash-lite',
    name: 'Gemini 3.1 Flash Lite',
    provider: 'gemini',
    description: 'Model sangat ringan dan super cepat untuk drafting cepat dan outline.',
    recommendedFor: 'Kecepatan Ultra Tinggi & Batch Ringan',
  },

  // OpenAI Models
  {
    id: 'gpt-4o',
    name: 'OpenAI GPT-4o',
    provider: 'openai',
    description: 'Model multimodal serbaguna OpenAI dengan gaya penulisan natural.',
    recommendedFor: 'Penulisan Kreatif & SEO Bahasa Inggris / Indo',
    tag: 'Popular',
  },
  {
    id: 'gpt-4o-mini',
    name: 'OpenAI GPT-4o Mini',
    provider: 'openai',
    description: 'Model hemat biaya dan responsif dari OpenAI untuk outline dan drafting.',
    recommendedFor: 'Hemat Biaya & Cepat',
  },
  {
    id: 'o3-mini',
    name: 'OpenAI o3-mini',
    provider: 'openai',
    description: 'Model reasoning terarah OpenAI untuk analisis logika dan struktur faktual.',
    recommendedFor: 'Penalaran dan Outline Terstruktur',
  },
];

export const FLOW_TEMPLATES: AgentFlowPreset[] = [
  {
    id: 'google-flow-master-seo',
    name: 'Google Flow 5-Stage: Master SEO & Humanized Article',
    description: 'Alur kerja 5 agen berjenjang bergaya Google Flow: Riset Mendalam -> Strategi Keyword & Hook -> Penulisan Lengkap -> Humanizer & Fact Checker -> FAQ & Key Takeaways.',
    category: 'SEO & Content Marketing',
    badge: 'Paling Populer',
    icon: 'Layers',
    steps: [
      {
        id: 'step-1-research-outline',
        name: 'Agent 1: Research & Structure Architect',
        role: 'Senior Research Analyst & SEO Architect',
        description: 'Menganalisis topik, mencari search intent pengguna, sudut pandang unik, dan membuat kerangka H1, H2, H3 yang komprehensif.',
        iconName: 'Compass',
        systemInstruction: `Anda adalah Senior Research Analyst dan SEO Content Architect kelas dunia.
Tugas Anda adalah merancang kerangka artikel (outline) yang sangat terstruktur, mendalam, dan memuaskan search intent pembaca.
Gunakan prinsip E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness).
Berikan output berupa:
1. Target Search Intent & Sudut Pandang Unik (Unique Angle)
2. Analisis Target Audiens & Pain Points
3. Rencana Struktur Heading (H1, H2, H3) lengkap dengan poin-poin bahasan tiap sub-heading.`,
        promptTemplate: `Tolong buatkan riset mendalam dan outline komprehensif untuk artikel berikut:
- Topik: {{topic}}
- Kata Kunci Utama/LSI: {{keywords}}
- Target Pembaca: {{targetAudience}}
- Gaya Bahasa / Tone: {{tone}}
- Bahasa: {{language}}
- Target Panjang Keseluruhan: {{wordCount}} kata
- Instruksi Tambahan: {{additionalInstructions}}

Rancang struktur outline H1, H2, H3 yang logis, kaya informasi, dan menarik perhatian pembaca dari awal hingga akhir.`,
        temperature: 0.6,
        enabled: true,
        outputVar: 'outline',
      },
      {
        id: 'step-2-seo-hook',
        name: 'Agent 2: SEO Hook & Narrative Lead Specialist',
        role: 'Conversion Copywriter & SEO Specialist',
        description: 'Menyusun pembuka artikel (Introduction Hook) yang memukau, meta description, dan integrasi keyword alami.',
        iconName: 'Sparkles',
        systemInstruction: `Anda adalah Conversion Copywriter dan SEO Lead Specialist.
Tugas Anda adalah membuat bagian pengantar (Introduction) yang sangat memikat menggunakan teknik Hook (Story, Problem-Agitate-Solve, atau Surprising Stat), serta memetakan bagaimana kata kunci akan disisipkan secara halus tanpa keyword stuffing.`,
        promptTemplate: `Berdasarkan outline yang telah dibuat oleh Agen 1:
=== OUTLINE AGENT 1 ===
{{previous_step_output}}
=======================

Tolong buatkan:
1. Judul H1 Alternatif yang Click-Worthy & SEO-Friendly (3 pilihan)
2. Meta Description menarik (150-160 karakter)
3. Bagian Pembuka (Introduction) lengkap yang memikat, langsung menyentuh masalah utama audiens, dan memberikan preview solusi yang akan mereka dapatkan dalam artikel ini.
Gaya bahasa: {{tone}}, Bahasa: {{language}}.`,
        temperature: 0.7,
        enabled: true,
        outputVar: 'intro_and_hooks',
      },
      {
        id: 'step-3-content-writer',
        name: 'Agent 3: Deep Content Writer & Section Expander',
        role: 'Master Content Writer & Subject Matter Expert',
        description: 'Menulis naskah utama artikel secara mendalam dari H2 sampai H3, lengkap dengan data, analogi, dan penjelasan praktis.',
        iconName: 'FileText',
        systemInstruction: `Anda adalah Master Content Writer dan Subject Matter Expert.
Tuliskan seluruh isi badan artikel (Body Sections) secara lengkap, mendalam, dan komprehensif sesuai outline dan pembuka yang telah dibuat.
Aturan Penulisan:
- Jangan membuat teks generik atau basa-basi.
- Gunakan formatting Markdown yang kaya (subheading H2/H3, bullet point, numbered list, bolding untuk emphasis, quote block jika relevan).
- Berikan contoh nyata, tips aksi langsung, dan penjelasan mendalam.
- Pertahankan konsistensi gaya bahasa dan alur logika yang mengalir.`,
        promptTemplate: `Tolong tuliskan naskah isi artikel lengkap berdasarkan data dari langkah sebelumnya:
- Topik: {{topic}}
- Kata Kunci: {{keywords}}
- Bahasa: {{language}}
- Tone: {{tone}}

Rujukan Outline & Intro:
=== OUTLINE & INTRO ===
{{previous_step_output}}
======================

Tuliskan seluruh bagian naskah artikel dari awal hingga pembahasan sebelum kesimpulan, dengan kualitas tinggi, mendalam, dan panjang yang proporsional untuk target {{wordCount}} kata. Gunakan Markdown rapi.`,
        temperature: 0.7,
        enabled: true,
        outputVar: 'full_draft',
      },
      {
        id: 'step-4-humanizer-polisher',
        name: 'Agent 4: Humanizer & Anti-AI Detection Polisher',
        role: 'Senior Executive Editor & Tone Humanizer',
        description: 'Memoles naskah agar terasa 100% ditulis oleh pakar manusia sejati, menghilangkan repetisi, dan memperlancar transisi kalimat.',
        iconName: 'UserCheck',
        systemInstruction: `Anda adalah Senior Executive Editor & Humanizer Specialist.
Tugas Anda adalah mereview dan menyempurnakan naskah artikel:
1. Hilangkan frasa klise AI yang membosankan (seperti "Di era digital yang serba cepat ini...", "Tak dapat dipungkiri bahwa...", "Mari kita selami...").
2. Variasikan panjang kalimat (perpaduan kalimat pendek tajam dan kalimat penjelas berbobot) untuk ritme baca (burstiness) yang alami.
3. Pastikan transisi antar paragraf mulus dan logis.
4. Outputkan naskah artikel lengkap yang sudah dipoles dari Judul hingga akhir bab pembahasan.`,
        promptTemplate: `Poles dan humanisasi naskah artikel berikut agar mengalir sangat natural, berwibawa, dan memikat pembaca:
=== DRAFT ARTIKEL ===
{{previous_step_output}}
=====================

Format akhir harus berupa artikel Markdown utuh yang bersih, bebas klise AI, dan sangat enak dibaca.`,
        temperature: 0.5,
        enabled: true,
        outputVar: 'polished_article',
      },
      {
        id: 'step-5-value-booster',
        name: 'Agent 5: Value Booster (FAQ, Takeaways & Conclusion)',
        role: 'Audience Engagement & Rich Snippets Specialist',
        description: 'Menambahkan Kesimpulan Kuat, Box Poin Kunci (Key Takeaways), FAQ interaktif, dan Call to Action (CTA).',
        iconName: 'Award',
        systemInstruction: `Anda adalah Audience Engagement & Rich Snippets Specialist.
Tugas Anda adalah melengkapi naskah artikel final dengan:
1. Bagian Kesimpulan & Rekomendasi Aksi (Actionable Conclusion)
2. Box Key Takeaways (Poin-poin penting untuk pembaca cepat)
3. FAQ (Frequently Asked Questions) 3-5 pertanyaan yang sering dicari pengguna lengkap dengan jawaban padat
4. Call to Action (CTA) yang relevan.
Gabungkan semuanya menjadi SATU ARTIKEL FINAL LENGKAP dan UTUH dalam format Markdown.`,
        promptTemplate: `Berikut adalah naskah artikel yang sudah dipoles:
=== ARTIKEL DIPOLEH ===
{{previous_step_output}}
=======================

Tambahkan bagian:
- Ringkasan / Key Takeaways Box (Gunakan format blockquote / callout)
- Kesimpulan & Saran Praktis
- FAQ (3-5 Pertanyaan umum & Jawaban tajam)
- Penutup / Call to Action

Keluarkan ARTIKEL LENGKAP UTUH TERPADU dari judul H1 sampai FAQ penutup dalam format Markdown yang siap dipublikasikan!`,
        temperature: 0.6,
        enabled: true,
        outputVar: 'final_article',
      },
    ],
  },
  {
    id: 'tech-tutorial-deep-dive',
    name: 'Tech & Developer Guide Pipeline (4-Stage)',
    description: 'Dikhususkan untuk tutorial teknologi, coding, arsitektur sistem, dan panduan teknis langkah demi langkah.',
    category: 'Teknologi & Tutorial',
    badge: 'Teknis & Kode',
    icon: 'Terminal',
    steps: [
      {
        id: 'tech-step-1-spec',
        name: 'Agent 1: Tech Architecture & Prerequisites Analyst',
        role: 'Lead Solutions Architect',
        description: 'Menganalisis prasyarat sistem, stack teknologi, diagram alur, dan roadmap tutorial.',
        iconName: 'Cpu',
        systemInstruction: `Anda adalah Lead Solutions Architect.
Susunlah spesifikasi teknis dan outline tutorial:
- Daftar Prasyarat (Prerequisites: tools, versi library, pemahaman awal)
- Konsep Dasar yang Diterapkan
- Arsitektur / Alur Kerja Sistem (dalam teks / diagram ASCII)
- Outline Langkah demi Langkah implementasi (Step 1 hingga Step N).`,
        promptTemplate: `Rancang spesifikasi teknis dan outline untuk tutorial teknologi berikut:
- Topik: {{topic}}
- Target Pembaca: {{targetAudience}}
- Bahasa: {{language}}
- Kata Kunci / Framework: {{keywords}}
- Catatan Khusus: {{additionalInstructions}}`,
        temperature: 0.4,
        enabled: true,
        outputVar: 'tech_spec',
      },
      {
        id: 'tech-step-2-implementation',
        name: 'Agent 2: Code & Step-by-Step Implementation Author',
        role: 'Senior Staff Engineer & Tech Writer',
        description: 'Menulis tutorial lengkap dengan snippet kode bersih, penjelasan baris kode, dan langkah instalasi.',
        iconName: 'Code',
        systemInstruction: `Anda adalah Senior Staff Engineer dan Technical Writer berpengalaman.
Tuliskan naskah tutorial lengkap:
- Jelaskan setiap langkah dengan jelas dan sistematis.
- Sertakan blok kode lengkap dengan sintaks yang valid, komentar penjelasan di baris penting, dan struktur folder.
- Berikan output perintah terminal atau konfigurasi yang siap disalin.`,
        promptTemplate: `Tuliskan artikel tutorial teknis lengkap berdasarkan spesifikasi:
=== SPEC & OUTLINE ===
{{previous_step_output}}
======================

Bahasa pengantar: {{language}}, Target panjang: {{wordCount}} kata. Pastikan semua kode jelas, mutakhir, dan bebas bug.`,
        temperature: 0.5,
        enabled: true,
        outputVar: 'code_tutorial',
      },
      {
        id: 'tech-step-3-troubleshooting',
        name: 'Agent 3: Troubleshooting & Best Practices Auditor',
        role: 'QA & Security Engineer',
        description: 'Menambahkan bagian penanganan error umum (troubleshooting), praktik terbaik (best practices), dan tips performa.',
        iconName: 'ShieldAlert',
        systemInstruction: `Anda adalah QA & Security Auditor.
Tambahkan bagian krusial pada tutorial teknis:
1. Masalah Umum & Cara Mengatasinya (Common Pitfalls & Fixes)
2. Best Practices untuk Security, Performance & Scalability
3. Tips Testing & Verifikasi bahwa sistem berjalan benar.`,
        promptTemplate: `Lengkapi tutorial teknis berikut dengan audit error dan best practices:
=== TUTORIAL ===
{{previous_step_output}}
================

Tambahkan bagian Troubleshooting dan Security/Performance Best Practices secara mendalam.`,
        temperature: 0.4,
        enabled: true,
        outputVar: 'tutorial_with_troubleshooting',
      },
      {
        id: 'tech-step-4-final-summary',
        name: 'Agent 4: Quick Reference & Final Polish',
        role: 'Technical Documentation Lead',
        description: 'Menyatukan semua naskah menjadi satu panduan lengkap disertai Cheatsheet perintah cepat dan rangkuman.',
        iconName: 'CheckCircle',
        systemInstruction: `Anda adalah Technical Documentation Lead.
Gabungkan seluruh tutorial menjadi SATU DOKUMEN ARTIKEL UTUH BERSIH. Tambahkan Cheatsheet / Quick Reference di bagian akhir beserta tautan/langkah lanjutan (Next Steps).`,
        promptTemplate: `Satukan dan rapikan seluruh dokumen tutorial di atas menjadi naskah artikel akhir dalam format Markdown terstruktur yang elegan dan siap baca.`,
        temperature: 0.3,
        enabled: true,
        outputVar: 'final_tech_guide',
      },
    ],
  },
  {
    id: 'product-review-comparison',
    name: 'Affiliate Review & Product Comparison Flow (4-Stage)',
    description: 'Dirancang untuk artikel ulasan produk, perbandingan gadget/software, analisis kelebihan-kekurangan, dan panduan belanja.',
    category: 'E-Commerce & Reviews',
    badge: 'Review & Buying Guide',
    icon: 'ShoppingBag',
    steps: [
      {
        id: 'rev-step-1-criteria',
        name: 'Agent 1: Product Benchmark & Criteria Evaluator',
        role: 'Consumer Tech Analyst & Market Researcher',
        description: 'Menentukan metrik perbandingan, kriteria pengujian, dan profil pengguna ideal.',
        iconName: 'Sliders',
        systemInstruction: `Anda adalah Consumer Analyst.
Tentukan kriteria penilaian objektif untuk topik ulasan/perbandingan produk ini:
- Parameter Penilaian (Desain, Fitur, Performa, Harga, Value for Money)
- Target Persona Pengguna
- Outline struktur review komparatif.`,
        promptTemplate: `Buat kriteria evaluasi dan outline review untuk:
- Produk/Topik: {{topic}}
- Kata Kunci: {{keywords}}
- Audiens: {{targetAudience}}
- Bahasa: {{language}}`,
        temperature: 0.5,
        enabled: true,
        outputVar: 'review_criteria',
      },
      {
        id: 'rev-step-2-deep-review',
        name: 'Agent 2: In-Depth Features & Hands-on Breakdown',
        role: 'Senior Product Reviewer',
        description: 'Menulis ulasan mendalam per produk/fitur dengan analisis kelebihan dan kekurangan (Pros & Cons).',
        iconName: 'Layers',
        systemInstruction: `Anda adalah Senior Product Reviewer.
Tuliskan review mendalam:
- Analisis fitur unggulan dengan pengalaman penggunaan nyata
- Rincian Kelebihan (Pros) & Kekurangan (Cons) yang jujur dan berimbang
- Analisis perbandingan performa di dunia nyata.`,
        promptTemplate: `Tuliskan ulasan mendalam berdasarkan kriteria:
=== KRITERIA ===
{{previous_step_output}}
================

Tulis naskah review yang meyakinkan, objektif, dan detail.`,
        temperature: 0.6,
        enabled: true,
        outputVar: 'features_breakdown',
      },
      {
        id: 'rev-step-3-comparison-table',
        name: 'Agent 3: Comparison Table & Winner Verdict Engine',
        role: 'Data Comparison & Verdict Specialist',
        description: 'Membuat tabel perbandingan Markdown yang rapi, skor rating, dan pemenang per kategori.',
        iconName: 'Table',
        systemInstruction: `Anda adalah Data Comparison Specialist.
Buatkan:
1. Tabel Perbandingan Spesifikasi & Fitur lengkap dalam format Markdown
2. Matriks Skor Rating (1-10) untuk tiap kategori
3. Rekomendasi Pemenang ("Terbaik Secara Keseluruhan", "Paling Hemat Anggaran", "Pilihan Profesional").`,
        promptTemplate: `Lengkapi review dengan tabel perbandingan dan verdict rekomendasi:
=== REVIEW DRAFT ===
{{previous_step_output}}
====================`,
        temperature: 0.5,
        enabled: true,
        outputVar: 'comparison_matrix',
      },
      {
        id: 'rev-step-4-buying-guide',
        name: 'Agent 4: Buyer\'s Decision Guide & Final Polish',
        role: 'E-Commerce Editor-in-Chief',
        description: 'Menyusun Buying Guide Checklist, FAQ pembelian, dan menyatukan seluruh review menjadi satu artikel utuh.',
        iconName: 'CheckSquare',
        systemInstruction: `Anda adalah Editor-in-Chief.
Gabungkan seluruh komponen review menjadi SATU ARTIKEL FINAL LENGKAP. Tambahkan panduan belanja (Apa yang harus diperhatikan sebelum membeli), FAQ, dan kesimpulan akhir.`,
        promptTemplate: `Satukan seluruh naskah review, tabel perbandingan, pros & cons, dan buying guide menjadi SATU ARTIKEL FINAL UTUH dalam format Markdown yang rapi.`,
        temperature: 0.5,
        enabled: true,
        outputVar: 'final_review_article',
      },
    ],
  },
  {
    id: 'express-fast-flow',
    name: 'Express 2-Stage: Instant High-Impact Article',
    description: 'Alur cepat 2 langkah untuk pembuatan artikel instan berkecepatan tinggi tanpa mengorbankan kualitas struktur.',
    category: 'Kecepatan Cepat',
    badge: 'Super Cepat',
    icon: 'Zap',
    steps: [
      {
        id: 'fast-step-1-outline',
        name: 'Agent 1: Smart Rapid Outline Architect',
        role: 'Rapid Content Strategist',
        description: 'Membuat blueprint artikel ringkas, fokus, dan kaya poin kunci.',
        iconName: 'ListOrdered',
        systemInstruction: `Anda adalah Rapid Content Strategist. Buatkan kerangka artikel ringkas, fokus, dan tajam yang mencakup hook pembuka, 4-6 sub-topik utama, dan kesimpulan aksi.`,
        promptTemplate: `Buat outline ringkas untuk topik: {{topic}}, Kata kunci: {{keywords}}, Tone: {{tone}}, Bahasa: {{language}}.`,
        temperature: 0.6,
        enabled: true,
        outputVar: 'quick_outline',
      },
      {
        id: 'fast-step-2-full-article',
        name: 'Agent 2: Comprehensive Article Generator',
        role: 'Master Copywriter & Publisher',
        description: 'Menulis artikel lengkap siap publikasi dari outline yang telah disusun.',
        iconName: 'PenTool',
        systemInstruction: `Anda adalah Master Copywriter. Tuliskan artikel utuh dan lengkap dalam format Markdown berdasarkan outline yang diberikan. Gunakan formatting rapi (H1, H2, H3, bullet points, callout takeaways). Target panjang: {{wordCount}} kata.`,
        promptTemplate: `Tulis artikel lengkap berdasarkan outline berikut:
=== OUTLINE ===
{{previous_step_output}}
================

Topik: {{topic}}
Bahasa: {{language}}
Tone: {{tone}}
Target Kata: {{wordCount}}
Instruksi Tambahan: {{additionalInstructions}}`,
        temperature: 0.7,
        enabled: true,
        outputVar: 'final_article',
      },
    ],
  },
];
