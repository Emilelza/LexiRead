/**
 * services/aiService.js
 * All AI-powered text processing functions.
 * Wraps the OpenAI API with mode-specific prompts.
 */

const OpenAI = require('openai');
const config = require('../config');

const client = new OpenAI({
  apiKey: config.openai.apiKey,
  baseURL: config.openai.baseURL,
});

/**
 * Mode definitions — each has a system prompt and a display label.
 */
const MODES = {
  easy_reader: {
    label: 'Easy Reader',
    system: `You are a reading assistant for people with dyslexia or reading difficulties.
Rewrite the given text using:
- Very short sentences (under 12 words each)
- Simple, everyday vocabulary (Grade 5 level)
- Active voice throughout
- Clear line breaks between ideas
- No jargon or technical terms
Return only the rewritten text. No headers, no explanations.`,
  },
  child_friendly: {
    label: 'Child Friendly',
    system: `You explain things to a curious 8-year-old child.
Rewrite the text so a young child can fully understand it:
- Use very simple words they already know
- Use short fun sentences
- Replace hard words with easy ones and a quick explanation in brackets
- Keep it engaging and friendly
Return only the rewritten text.`,
  },
  student_mode: {
    label: 'Student Mode',
    system: `You are a study assistant helping a secondary school student understand difficult content.
Rewrite the text so it's easy to understand and study-ready:
- Break complex ideas into clear steps
- Define any technical words in simple terms
- Use examples where helpful
- Keep sentences short and clear
Return only the rewritten, study-friendly text.`,
  },
  academic_simplifier: {
    label: 'Academic Simplifier',
    system: `You simplify dense academic and research writing for a general adult reader.
Rewrite the text:
- Keep all the core facts and arguments intact
- Replace academic jargon with plain language equivalents
- Shorten and split long sentences
- Preserve logical structure
Return only the simplified text.`,
  },
  exam_notes: {
    label: 'Exam Notes',
    system: `You are an expert study coach. Convert the given text into concise exam-ready notes.
Format your output as:
📌 KEY TOPIC: [topic name]
• [bullet point fact]
• [bullet point fact]
(repeat for each main topic)
⚡ REMEMBER: [most important points in 1-2 lines]
Be thorough but concise. Return only the formatted notes.`,
  },
  bullet_summary: {
    label: 'Bullet Summary',
    system: `You create clear, structured bullet-point summaries.
Convert the given text into:
• 5-10 crisp bullet points
• Each bullet is one idea, max 15 words
• Order from most to least important
• Start each bullet with an action verb or key noun
Return only the bullet list.`,
  },
  key_points: {
    label: 'Key Points',
    system: `You extract the most important information from any text.
Identify and present:
1. The 3-5 most important points
2. Any critical numbers, dates, or names
3. The main conclusion or takeaway
Use bold for the most critical words. Keep everything brief and scannable.
Return only the extracted key points.`,
  },
  vocabulary_builder: {
    label: 'Vocabulary Builder',
    system: `You are a vocabulary teacher. Identify the 8-12 most difficult or important words in the given text.
For each word, provide in this exact format:
WORD: [word]
MEANING: [simple 1-sentence definition]
EASIER WORD: [simpler synonym]
EXAMPLE: [new example sentence using the word]
---
Return only this structured vocabulary list.`,
  },
  quick_revision: {
    label: 'Quick Revision',
    system: `You create ultra-fast revision material for students.
From the given text, produce:
🎯 TOPIC IN ONE LINE: [summarise the whole topic in 1 sentence]
⚡ 5 MUST-KNOW FACTS:
1. [fact]
2. [fact]
3. [fact]
4. [fact]
5. [fact]
❓ LIKELY EXAM QUESTION: [one probable exam question from this material]
✅ ANSWER HINT: [2-3 line answer guide]
Return only this formatted revision card.`,
  },
  beginner_mode: {
    label: 'Beginner Mode',
    system: `You explain concepts from scratch to a complete beginner with no prior knowledge.
Explain the given text as if the reader knows absolutely nothing about the topic:
- Start with the most basic definition
- Build understanding step by step
- Use real-life analogies and comparisons
- Avoid all assumed knowledge
- End with a simple one-sentence summary
Return only the beginner-friendly explanation.`,
  },
};

/**
 * Process text with a given AI mode.
 * @param {string} text - Input text to process
 * @param {string} mode - Mode key from MODES object
 * @returns {Promise<string>} - Processed result
 */
const processText = async (text, mode = 'easy_reader') => {
  const modeConfig = MODES[mode];
  if (!modeConfig) {
    throw new Error(`Unknown mode: ${mode}`);
  }

  const completion = await client.chat.completions.create({
    model: config.openai.model,
    max_tokens: config.openai.maxTokens,
    messages: [
      { role: 'system', content: modeConfig.system },
      { role: 'user', content: text },
    ],
  });

  return completion.choices[0].message.content.trim();
};

/**
 * Generate study materials from text.
 * @param {string} text - Input text
 * @param {string} studyType - Type of study material
 * @returns {Promise<string>}
 */
const generateStudyMaterial = async (text, studyType) => {
  const prompts = {
    mcq: `Generate 5 multiple-choice questions (MCQs) from the given text.
Format each question exactly as:
Q[N]. [question]
A) [option]
B) [option]
C) [option]
D) [option]
✅ Answer: [correct letter]) [brief explanation]
---
Return only the MCQs.`,

    flashcards: `Create 8 flashcards from the given text.
Format each as:
🃏 FRONT: [question or term]
   BACK: [answer or definition]
---
Return only the flashcards.`,

    viva_questions: `Generate 8 viva/oral exam questions from the given text, ordered from easy to hard.
Format as:
[N]. [question]
💡 Key points in answer: [2-3 key points]
---
Return only the questions.`,

    mind_map: `Create a text-based mind map from the given content.
Format as:
🧠 CENTRAL TOPIC: [main topic]
├── Branch 1: [subtopic]
│   ├── [detail]
│   └── [detail]
├── Branch 2: [subtopic]
│   ├── [detail]
│   └── [detail]
└── Branch 3: [subtopic]
    ├── [detail]
    └── [detail]
Include 3-5 main branches with 2-3 details each. Return only the mind map.`,

    cheat_sheet: `Create a one-page cheat sheet from the given content.
Use this format:
📋 TOPIC: [topic name]
━━━━━━━━━━━━━━━━━━━━━━━━
DEFINITIONS:
• [term]: [definition]

FORMULAS / RULES:
• [formula or rule]

KEY FACTS:
• [fact]

COMMON MISTAKES TO AVOID:
• [mistake]

Return only the cheat sheet.`,
  };

  const systemPrompt = prompts[studyType];
  if (!systemPrompt) {
    throw new Error(`Unknown study type: ${studyType}`);
  }

  const completion = await client.chat.completions.create({
    model: config.openai.model,
    max_tokens: config.openai.maxTokens,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: text },
    ],
  });

  return completion.choices[0].message.content.trim();
};

/**
 * Explain a single word in context.
 * @param {string} word - The word to explain
 * @param {string} [context] - Surrounding sentence for context
 * @returns {Promise<object>}
 */
const explainWord = async (word, context = '') => {
  const contextNote = context ? `\nThe word appears in this sentence: "${context}"` : '';

  const completion = await client.chat.completions.create({
    model: config.openai.model,
    max_tokens: 400,
    messages: [
      {
        role: 'system',
        content: `You explain individual words simply. Always respond with valid JSON only, no markdown.`,
      },
      {
        role: 'user',
        content: `Explain the word "${word}".${contextNote}
Respond with this JSON structure:
{
  "word": "${word}",
  "pronunciation": "phonetic guide",
  "definition": "simple one sentence definition",
  "simpleExplanation": "explain it like I'm 10 years old",
  "synonyms": ["synonym1", "synonym2", "synonym3"],
  "exampleSentence": "a simple example sentence using the word"
}`,
      },
    ],
  });

  const raw = completion.choices[0].message.content.trim();
  try {
    return JSON.parse(raw);
  } catch {
    // Fallback if JSON parse fails
    return {
      word,
      pronunciation: '',
      definition: raw,
      simpleExplanation: raw,
      synonyms: [],
      exampleSentence: '',
    };
  }
};

/**
 * Chat assistant — context-aware Q&A about uploaded content.
 * @param {string} userMessage - User's question
 * @param {string} documentContext - The document/text being discussed
 * @param {Array} history - Previous messages [{role, content}]
 * @returns {Promise<string>}
 */
const chatWithAssistant = async (userMessage, documentContext, history = []) => {
  const systemPrompt = documentContext
    ? `You are LexiRead's AI study assistant. You are helping a user understand and study the following document or text:

--- DOCUMENT START ---
${documentContext.slice(0, 8000)}
--- DOCUMENT END ---

Answer questions clearly and helpfully based on this content. If asked something not in the document, say so and help from your general knowledge. Use simple, accessible language.`
    : `You are LexiRead's AI study assistant. Help the user with reading, studying, and understanding difficult content. Use simple, accessible language. Be encouraging and patient.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-10), // keep last 10 turns for context
    { role: 'user', content: userMessage },
  ];

  const completion = await client.chat.completions.create({
    model: config.openai.model,
    max_tokens: 800,
    messages,
  });

  return completion.choices[0].message.content.trim();
};

module.exports = {
  MODES,
  processText,
  generateStudyMaterial,
  explainWord,
  chatWithAssistant,
};
