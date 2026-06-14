/**
 * LexiRead — Frontend Application
 * All UI logic: navigation, accessibility, AI processing, TTS, chat, upload, study tools.
 */

'use strict';

// ── State ──────────────────────────────────────────────────────────────────────
const state = {
  currentMode: 'easy_reader',
  currentStudyType: 'mcq',
  currentOutput: '',
  documentContext: '',
  chatHistory: [],
  ttsUtterance: null,
  ttsPlaying: false,
  readingRulerActive: false,
  readingMaskActive: false,
  fontSizeLevel: 1, // 0=small, 1=default, 2=large, 3=xl
  stats: {
    simplifications: 0,
    studyGenerated: 0,
    docsUploaded: 0,
    chatMessages: 0,
  },
  activity: [],
};

// ── DOM References ─────────────────────────────────────────────────────────────
const $ = (id) => document.getElementById(id);
const $$ = (sel) => document.querySelectorAll(sel);

const els = {
  // Navigation
  sidebar:         $('sidebar'),
  sidebarOverlay:  $('sidebarOverlay'),
  menuToggle:      $('menuToggle'),
  topbarTitle:     $('topbarTitle'),
  navItems:        $$('.nav-item'),

  // Reader panel
  inputText:       $('inputText'),
  processBtn:      $('processBtn'),
  clearInputBtn:   $('clearInputBtn'),
  modeChips:       $$('#modeGrid .mode-chip'),
  outputCard:      $('outputCard'),
  outputText:      $('outputText'),
  outputModeLabel: $('outputModeLabel'),

  // TTS
  ttsBar:          $('ttsBar'),
  ttsPlay:         $('ttsPlay'),
  ttsPause:        $('ttsPause'),
  ttsStop:         $('ttsStop'),
  ttsSpeed:        $('ttsSpeed'),
  ttsSpeedLabel:   $('ttsSpeedLabel'),
  readAloudBtn:    $('readAloudBtn'),

  // Output actions
  copyOutputBtn:   $('copyOutputBtn'),
  exportTxtBtn:    $('exportTxtBtn'),

  // Upload panel
  uploadZone:      $('uploadZone'),
  fileInput:       $('fileInput'),
  progressBar:     $('progressBar'),
  progressFill:    $('progressFill'),
  uploadStatus:    $('uploadStatus'),
  uploadResultCard:$('uploadResultCard'),
  uploadExtracted: $('uploadExtracted'),
  uploadWordCount: $('uploadWordCount'),
  sendToReaderBtn: $('sendToReaderBtn'),
  sendToStudyBtn:  $('sendToStudyBtn'),
  sendToChatBtn:   $('sendToChatBtn'),

  // Study panel
  studyInput:      $('studyInput'),
  studyTypeChips:  $$('#studyTypeGrid .mode-chip'),
  generateStudyBtn:$('generateStudyBtn'),
  studyResultCard: $('studyResultCard'),
  studyOutput:     $('studyOutput'),
  studyResultLabel:$('studyResultLabel'),
  copyStudyBtn:    $('copyStudyBtn'),
  exportStudyBtn:  $('exportStudyBtn'),

  // Chat panel
  chatMessages:    $('chatMessages'),
  chatInput:       $('chatInput'),
  chatSend:        $('chatSend'),
  clearChatBtn:    $('clearChatBtn'),
  chatContextBadge:$('chatContextBadge'),
  clearChatContext:$('clearChatContext'),

  // Dashboard
  statSimplifications: $('statSimplifications'),
  statStudyGenerated:  $('statStudyGenerated'),
  statDocsUploaded:    $('statDocsUploaded'),
  statChatMessages:    $('statChatMessages'),
  activityList:        $('activityList'),

  // Accessibility
  btnDyslexicFont: $('btnDyslexicFont'),
  btnSystemFont:   $('btnSystemFont'),
  btnFontUp:       $('btnFontUp'),
  btnFontDown:     $('btnFontDown'),
  btnComfort:      $('btnComfort'),
  btnRuler:        $('btnRuler'),
  btnMask:         $('btnMask'),
  themeDots:       $$('.theme-dot'),

  // Focus tools
  readingRuler:     $('readingRuler'),
  readingMaskTop:   $('readingMaskTop'),
  readingMaskBottom:$('readingMaskBottom'),

  // Word popup
  wordPopupOverlay: $('wordPopupOverlay'),
  wordPopupClose:   $('wordPopupClose'),
  wordPopupTitle:   $('wordPopupTitle'),
  wordPopupPron:    $('wordPopupPron'),
  wordPopupDef:     $('wordPopupDef'),
  wordPopupSimple:  $('wordPopupSimple'),
  wordPopupSynonyms:$('wordPopupSynonyms'),
  wordPopupExample: $('wordPopupExample'),

  // Global clear
  btnClearAll:     $('btnClearAll'),
};

// ── Toast Notifications ────────────────────────────────────────────────────────
const toast = {
  show(message, type = 'info', duration = 3000) {
    const container = $('toastContainer');
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    const icons = { success: '✓', error: '✕', info: 'ℹ' };
    el.innerHTML = `<span>${icons[type] || 'ℹ'}</span> ${message}`;
    container.appendChild(el);
    setTimeout(() => {
      el.classList.add('fade-out');
      setTimeout(() => el.remove(), 300);
    }, duration);
  },
  success: (msg) => toast.show(msg, 'success'),
  error:   (msg) => toast.show(msg, 'error', 4000),
  info:    (msg) => toast.show(msg, 'info'),
};

// ── Navigation ─────────────────────────────────────────────────────────────────
const panelTitles = {
  reader:    'Text Reader',
  upload:    'Upload Document',
  study:     'Study Tools',
  chat:      'AI Chat',
  dashboard: 'Dashboard',
};

function switchPanel(panelName) {
  // Hide all panels
  $$('.panel').forEach((p) => p.classList.remove('active'));
  // Deactivate all nav items
  els.navItems.forEach((n) => {
    n.classList.remove('active');
    n.setAttribute('aria-pressed', 'false');
  });

  // Activate target panel
  const panel = $(`panel-${panelName}`);
  if (panel) panel.classList.add('active');

  // Activate nav item
  const navItem = document.querySelector(`.nav-item[data-panel="${panelName}"]`);
  if (navItem) {
    navItem.classList.add('active');
    navItem.setAttribute('aria-pressed', 'true');
  }

  // Update topbar title
  els.topbarTitle.textContent = panelTitles[panelName] || '';

  // Close sidebar on mobile
  closeSidebar();
}

els.navItems.forEach((item) => {
  item.addEventListener('click', () => switchPanel(item.dataset.panel));
});

// Mobile sidebar
function openSidebar() {
  els.sidebar.classList.add('open');
  els.sidebarOverlay.classList.add('visible');
  els.menuToggle.setAttribute('aria-expanded', 'true');
}
function closeSidebar() {
  els.sidebar.classList.remove('open');
  els.sidebarOverlay.classList.remove('visible');
  els.menuToggle.setAttribute('aria-expanded', 'false');
}
els.menuToggle.addEventListener('click', openSidebar);
els.sidebarOverlay.addEventListener('click', closeSidebar);

// Global clear
els.btnClearAll.addEventListener('click', () => {
  els.inputText.value = '';
  els.outputText.textContent = 'Your result will appear here.';
  els.outputCard.hidden = true;
  els.studyInput.value = '';
  els.studyResultCard.hidden = true;
  state.currentOutput = '';
  toast.info('Content cleared.');
});

// ── Accessibility Controls ─────────────────────────────────────────────────────

// Font toggle
els.btnDyslexicFont.addEventListener('click', () => {
  document.body.classList.remove('system-font');
  els.btnDyslexicFont.classList.add('active');
  els.btnSystemFont.classList.remove('active');
  els.btnDyslexicFont.setAttribute('aria-pressed', 'true');
  els.btnSystemFont.setAttribute('aria-pressed', 'false');
  toast.info('OpenDyslexic font on');
});
els.btnSystemFont.addEventListener('click', () => {
  document.body.classList.add('system-font');
  els.btnSystemFont.classList.add('active');
  els.btnDyslexicFont.classList.remove('active');
  els.btnSystemFont.setAttribute('aria-pressed', 'true');
  els.btnDyslexicFont.setAttribute('aria-pressed', 'false');
  toast.info('System font on');
});

// Font size cycling
const fontSizeClasses = ['', 'large-text', 'xl-text'];
els.btnFontUp.addEventListener('click', () => {
  if (state.fontSizeLevel < fontSizeClasses.length - 1) {
    fontSizeClasses.forEach((c) => { if (c) document.body.classList.remove(c); });
    state.fontSizeLevel++;
    if (fontSizeClasses[state.fontSizeLevel]) {
      document.body.classList.add(fontSizeClasses[state.fontSizeLevel]);
    }
    toast.info('Text size increased');
  }
});
els.btnFontDown.addEventListener('click', () => {
  if (state.fontSizeLevel > 0) {
    fontSizeClasses.forEach((c) => { if (c) document.body.classList.remove(c); });
    state.fontSizeLevel--;
    if (fontSizeClasses[state.fontSizeLevel]) {
      document.body.classList.add(fontSizeClasses[state.fontSizeLevel]);
    }
    toast.info('Text size decreased');
  }
});

// Comfort spacing
els.btnComfort.addEventListener('click', () => {
  const active = els.btnComfort.getAttribute('aria-pressed') === 'true';
  const next = !active;
  els.btnComfort.setAttribute('aria-pressed', String(next));
  els.btnComfort.classList.toggle('active', next);
  document.body.classList.toggle('comfort-mode', next);
  toast.info(next ? 'Comfort spacing on' : 'Comfort spacing off');
});

// Theme switching
els.themeDots.forEach((dot) => {
  dot.addEventListener('click', () => {
    // Remove previous theme classes
    const themes = ['theme-cream','theme-peach','theme-yellow','theme-blue','theme-dark','theme-contrast'];
    themes.forEach((t) => document.body.classList.remove(t));
    document.body.classList.add(dot.dataset.theme);

    // Update active dot
    els.themeDots.forEach((d) => d.classList.remove('active'));
    dot.classList.add('active');
  });
});

// Reading ruler
els.btnRuler.addEventListener('click', () => {
  state.readingRulerActive = !state.readingRulerActive;
  els.btnRuler.classList.toggle('active', state.readingRulerActive);
  els.btnRuler.setAttribute('aria-pressed', String(state.readingRulerActive));
  els.readingRuler.classList.toggle('visible', state.readingRulerActive);
  toast.info(state.readingRulerActive ? 'Reading ruler on — move mouse to follow' : 'Reading ruler off');
});

document.addEventListener('mousemove', (e) => {
  if (state.readingRulerActive) {
    const rulerH = 40;
    els.readingRuler.style.top = `${e.clientY - rulerH / 2}px`;
  }
  if (state.readingMaskActive) {
    const maskH = 44;
    const rulerTop = e.clientY - maskH / 2;
    els.readingMaskTop.style.top    = '0';
    els.readingMaskTop.style.height = `${rulerTop}px`;
    els.readingMaskBottom.style.top    = `${rulerTop + maskH}px`;
    els.readingMaskBottom.style.height = `${window.innerHeight - rulerTop - maskH}px`;
  }
});

// Reading mask
els.btnMask.addEventListener('click', () => {
  state.readingMaskActive = !state.readingMaskActive;
  els.btnMask.classList.toggle('active', state.readingMaskActive);
  els.btnMask.setAttribute('aria-pressed', String(state.readingMaskActive));
  els.readingMaskTop.classList.toggle('visible', state.readingMaskActive);
  els.readingMaskBottom.classList.toggle('visible', state.readingMaskActive);
  toast.info(state.readingMaskActive ? 'Reading mask on — move mouse to follow' : 'Reading mask off');
});

// ── Mode Selection ─────────────────────────────────────────────────────────────
els.modeChips.forEach((chip) => {
  chip.addEventListener('click', () => {
    els.modeChips.forEach((c) => {
      c.classList.remove('active');
      c.setAttribute('aria-pressed', 'false');
    });
    chip.classList.add('active');
    chip.setAttribute('aria-pressed', 'true');
    state.currentMode = chip.dataset.mode;
  });
});

els.studyTypeChips.forEach((chip) => {
  chip.addEventListener('click', () => {
    els.studyTypeChips.forEach((c) => {
      c.classList.remove('active');
      c.setAttribute('aria-pressed', 'false');
    });
    chip.classList.add('active');
    chip.setAttribute('aria-pressed', 'true');
    state.currentStudyType = chip.dataset.type;
  });
});

// ── API Helpers ────────────────────────────────────────────────────────────────
async function apiPost(endpoint, body) {
  const res = await fetch(`/api/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Unknown error');
  return data;
}

function setButtonLoading(btn, loading, originalHTML) {
  btn.disabled = loading;
  if (loading) {
    btn.innerHTML = `<span class="spinner"></span> Working…`;
  } else {
    btn.innerHTML = originalHTML;
  }
}

// ── Text Processing ────────────────────────────────────────────────────────────
const processBtnHTML = els.processBtn.innerHTML;
els.processBtn.addEventListener('click', async () => {
  const text = els.inputText.value.trim();
  if (!text) {
    toast.error('Please paste or type some text first.');
    return;
  }

  setButtonLoading(els.processBtn, true, processBtnHTML);
  els.outputText.classList.add('loading');

  try {
    const data = await apiPost('simplify', { text, mode: state.currentMode });
    state.currentOutput = data.result;

    // Render output with clickable words
    renderClickableOutput(data.result);

    els.outputModeLabel.textContent = data.modeLabel || 'Result';
    els.outputCard.hidden = false;
    els.ttsBar.classList.remove('hidden');
    els.outputCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Update stats & activity
    state.stats.simplifications++;
    addActivity(`Processed with ${data.modeLabel}`);
    updateStats();
  } catch (err) {
    toast.error(`Error: ${err.message}`);
  } finally {
    setButtonLoading(els.processBtn, false, processBtnHTML);
    els.outputText.classList.remove('loading');
  }
});

els.clearInputBtn.addEventListener('click', () => {
  els.inputText.value = '';
  els.outputCard.hidden = true;
  state.currentOutput = '';
  ttsStop();
});

// ── Render clickable word output ───────────────────────────────────────────────
function renderClickableOutput(text) {
  // Split text into words while preserving whitespace/newlines
  const html = text
    .split(/(\s+)/)
    .map((token) => {
      if (/^\s+$/.test(token)) return token.replace(/\n/g, '<br>');
      // Only make substantial words clickable (> 4 chars)
      if (token.length > 4 && /^[a-zA-Z]/.test(token)) {
        const clean = token.replace(/[^a-zA-Z'-]/g, '');
        return `<span class="clickable-word" data-word="${clean}" tabindex="0" role="button" aria-label="Explain word: ${clean}">${token}</span>`;
      }
      return token;
    })
    .join('');
  els.outputText.innerHTML = html;

  // Attach click handlers
  els.outputText.querySelectorAll('.clickable-word').forEach((span) => {
    span.addEventListener('click', () => showWordExplainer(span.dataset.word, text));
    span.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        showWordExplainer(span.dataset.word, text);
      }
    });
  });
}

// ── Word Explainer ─────────────────────────────────────────────────────────────
async function showWordExplainer(word, context) {
  // Show overlay immediately with loading state
  els.wordPopupTitle.textContent = word;
  els.wordPopupPron.textContent = '';
  els.wordPopupDef.textContent = 'Loading…';
  els.wordPopupSimple.textContent = '';
  els.wordPopupSynonyms.innerHTML = '';
  els.wordPopupExample.textContent = '';
  els.wordPopupOverlay.classList.remove('hidden');

  try {
    const data = await apiPost('explain-word', { word, context: context.slice(0, 200) });
    const r = data.result;
    els.wordPopupTitle.textContent   = r.word || word;
    els.wordPopupPron.textContent    = r.pronunciation ? `/${r.pronunciation}/` : '';
    els.wordPopupDef.textContent     = r.definition || '—';
    els.wordPopupSimple.textContent  = r.simpleExplanation || '';
    els.wordPopupExample.textContent = r.exampleSentence || '';

    els.wordPopupSynonyms.innerHTML = (r.synonyms || [])
      .map((s) => `<span class="synonym-tag">${s}</span>`)
      .join('');
  } catch (err) {
    els.wordPopupDef.textContent = `Could not load explanation: ${err.message}`;
  }
}

els.wordPopupClose.addEventListener('click', () => {
  els.wordPopupOverlay.classList.add('hidden');
});
els.wordPopupOverlay.addEventListener('click', (e) => {
  if (e.target === els.wordPopupOverlay) {
    els.wordPopupOverlay.classList.add('hidden');
  }
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') els.wordPopupOverlay.classList.add('hidden');
});

// ── Copy & Export ──────────────────────────────────────────────────────────────
function copyText(text, btn, originalHTML) {
  if (!text.trim()) { toast.error('Nothing to copy.'); return; }
  navigator.clipboard.writeText(text).then(() => {
    btn.innerHTML = '✓ Copied!';
    setTimeout(() => { btn.innerHTML = originalHTML; }, 2000);
    toast.success('Copied to clipboard!');
  }).catch(() => {
    toast.error('Copy failed. Please select and copy manually.');
  });
}

function exportTxt(text, filename) {
  if (!text.trim()) { toast.error('Nothing to export.'); return; }
  const blob = new Blob([text], { type: 'text/plain' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  toast.success(`Exported as ${filename}`);
}

const copyOutputBtnHTML  = els.copyOutputBtn.innerHTML;
const exportTxtBtnHTML   = els.exportTxtBtn.innerHTML;

els.copyOutputBtn.addEventListener('click', () => {
  copyText(state.currentOutput || els.outputText.textContent, els.copyOutputBtn, copyOutputBtnHTML);
});
els.exportTxtBtn.addEventListener('click', () => {
  exportTxt(state.currentOutput || els.outputText.textContent, 'lexiread-output.txt');
});

// ── Text To Speech ─────────────────────────────────────────────────────────────
function ttsStop() {
  window.speechSynthesis.cancel();
  state.ttsPlaying = false;
}

els.ttsSpeed.addEventListener('input', () => {
  els.ttsSpeedLabel.textContent = `${parseFloat(els.ttsSpeed.value).toFixed(1)}×`;
});

const readAloudBtnHTML = els.readAloudBtn.innerHTML;
els.readAloudBtn.addEventListener('click', () => {
  const text = state.currentOutput || els.outputText.textContent;
  if (!text || text === 'Your result will appear here.') return;

  ttsStop();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = parseFloat(els.ttsSpeed.value);
  utterance.onend = () => { state.ttsPlaying = false; };
  state.ttsUtterance = utterance;
  state.ttsPlaying = true;
  window.speechSynthesis.speak(utterance);
  els.ttsBar.classList.remove('hidden');
  toast.info('Reading aloud…');
});

els.ttsPlay.addEventListener('click', () => {
  if (!state.ttsPlaying && state.ttsUtterance) {
    window.speechSynthesis.resume();
    state.ttsPlaying = true;
  } else if (!state.ttsPlaying) {
    els.readAloudBtn.click();
  }
});

els.ttsPause.addEventListener('click', () => {
  if (state.ttsPlaying) {
    window.speechSynthesis.pause();
    state.ttsPlaying = false;
  }
});

els.ttsStop.addEventListener('click', () => {
  ttsStop();
  els.ttsBar.classList.add('hidden');
});

// ── File Upload ────────────────────────────────────────────────────────────────
function showProgress(pct) {
  els.progressBar.classList.add('visible');
  els.progressFill.style.width = `${pct}%`;
}
function hideProgress() {
  setTimeout(() => {
    els.progressBar.classList.remove('visible');
    els.progressFill.style.width = '0%';
  }, 600);
}

async function handleFileUpload(file) {
  if (!file) return;

  const allowed = ['application/pdf', 'text/plain',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (!allowed.includes(file.type) && !file.name.match(/\.(pdf|txt|docx)$/i)) {
    toast.error('Please upload a PDF, TXT, or DOCX file.');
    return;
  }

  els.uploadStatus.textContent = `Uploading ${file.name}…`;
  showProgress(20);

  const formData = new FormData();
  formData.append('file', file);

  try {
    showProgress(60);
    const res  = await fetch('/api/upload', { method: 'POST', body: formData });
    const data = await res.json();
    showProgress(100);

    if (!data.success) throw new Error(data.error);

    els.uploadExtracted.textContent = data.text;
    els.uploadWordCount.textContent = `${data.wordCount.toLocaleString()} words`;
    els.uploadResultCard.hidden = false;
    els.uploadStatus.textContent = `✓ ${data.fileName} loaded successfully.`;
    els.uploadResultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Save extracted text for later use
    state.documentContext = data.text;

    // Show chat context badge
    els.chatContextBadge.style.display = 'block';

    state.stats.docsUploaded++;
    addActivity(`Uploaded: ${data.fileName}`);
    updateStats();
    toast.success('Document extracted successfully!');
  } catch (err) {
    els.uploadStatus.textContent = `Error: ${err.message}`;
    toast.error(`Upload failed: ${err.message}`);
  } finally {
    hideProgress();
  }
}

// Drag and drop
els.uploadZone.addEventListener('click', () => els.fileInput.click());
els.uploadZone.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); els.fileInput.click(); }
});
els.fileInput.addEventListener('change', () => handleFileUpload(els.fileInput.files[0]));

els.uploadZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  els.uploadZone.classList.add('dragover');
});
els.uploadZone.addEventListener('dragleave', () => els.uploadZone.classList.remove('dragover'));
els.uploadZone.addEventListener('drop', (e) => {
  e.preventDefault();
  els.uploadZone.classList.remove('dragover');
  handleFileUpload(e.dataTransfer.files[0]);
});

// Send extracted text to other panels
els.sendToReaderBtn.addEventListener('click', () => {
  els.inputText.value = state.documentContext;
  switchPanel('reader');
  toast.info('Text loaded into Reader.');
});
els.sendToStudyBtn.addEventListener('click', () => {
  els.studyInput.value = state.documentContext;
  switchPanel('study');
  toast.info('Text loaded into Study Tools.');
});
els.sendToChatBtn.addEventListener('click', () => {
  switchPanel('chat');
  toast.info('Document context loaded into Chat.');
});

// ── Study Tools ────────────────────────────────────────────────────────────────
const studyTypeLabelMap = {
  mcq:            'MCQ Questions',
  flashcards:     'Flashcards',
  viva_questions: 'Viva Questions',
  mind_map:       'Mind Map',
  cheat_sheet:    'Cheat Sheet',
};

const generateStudyBtnHTML = els.generateStudyBtn.innerHTML;
els.generateStudyBtn.addEventListener('click', async () => {
  const text = els.studyInput.value.trim();
  if (!text) {
    toast.error('Please paste some text to study first.');
    return;
  }

  setButtonLoading(els.generateStudyBtn, true, generateStudyBtnHTML);

  try {
    const data = await apiPost('study', { text, studyType: state.currentStudyType });
    els.studyOutput.textContent = data.result;
    els.studyResultLabel.textContent = studyTypeLabelMap[state.currentStudyType] || 'Study Material';
    els.studyResultCard.hidden = false;
    els.studyResultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    state.stats.studyGenerated++;
    addActivity(`Generated: ${studyTypeLabelMap[state.currentStudyType]}`);
    updateStats();
  } catch (err) {
    toast.error(`Error: ${err.message}`);
  } finally {
    setButtonLoading(els.generateStudyBtn, false, generateStudyBtnHTML);
  }
});

const copyStudyBtnHTML  = els.copyStudyBtn.innerHTML;
const exportStudyBtnHTML = els.exportStudyBtn.innerHTML;
els.copyStudyBtn.addEventListener('click', () => {
  copyText(els.studyOutput.textContent, els.copyStudyBtn, copyStudyBtnHTML);
});
els.exportStudyBtn.addEventListener('click', () => {
  exportTxt(els.studyOutput.textContent, `lexiread-${state.currentStudyType}.txt`);
});

// ── AI Chat ────────────────────────────────────────────────────────────────────
function appendChatBubble(text, role) {
  const el = document.createElement('div');
  el.className = `chat-bubble ${role}`;
  el.textContent = text;
  els.chatMessages.appendChild(el);
  els.chatMessages.scrollTop = els.chatMessages.scrollHeight;
  return el;
}

function appendTypingBubble() {
  const el = document.createElement('div');
  el.className = 'chat-bubble typing';
  el.textContent = 'Thinking…';
  els.chatMessages.appendChild(el);
  els.chatMessages.scrollTop = els.chatMessages.scrollHeight;
  return el;
}

async function sendChatMessage() {
  const message = els.chatInput.value.trim();
  if (!message) return;

  els.chatInput.value = '';
  els.chatInput.style.height = '';
  appendChatBubble(message, 'user');

  state.chatHistory.push({ role: 'user', content: message });

  const typingEl = appendTypingBubble();
  els.chatSend.disabled = true;

  try {
    const data = await apiPost('chat', {
      message,
      documentContext: state.documentContext,
      history: state.chatHistory.slice(-20),
    });

    typingEl.remove();
    appendChatBubble(data.reply, 'ai');
    state.chatHistory.push({ role: 'assistant', content: data.reply });

    state.stats.chatMessages++;
    updateStats();
  } catch (err) {
    typingEl.remove();
    appendChatBubble(`Sorry, I encountered an error: ${err.message}`, 'ai');
  } finally {
    els.chatSend.disabled = false;
  }
}

els.chatSend.addEventListener('click', sendChatMessage);
els.chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendChatMessage();
  }
});

// Auto-resize chat input
els.chatInput.addEventListener('input', () => {
  els.chatInput.style.height = 'auto';
  els.chatInput.style.height = `${Math.min(els.chatInput.scrollHeight, 120)}px`;
});

els.clearChatBtn.addEventListener('click', () => {
  els.chatMessages.innerHTML = '';
  appendChatBubble('Chat cleared. How can I help you?', 'ai');
  state.chatHistory = [];
  toast.info('Chat cleared.');
});

els.clearChatContext.addEventListener('click', () => {
  state.documentContext = '';
  els.chatContextBadge.style.display = 'none';
  toast.info('Document context removed.');
});

// ── Dashboard ──────────────────────────────────────────────────────────────────
function updateStats() {
  els.statSimplifications.textContent = state.stats.simplifications;
  els.statStudyGenerated.textContent  = state.stats.studyGenerated;
  els.statDocsUploaded.textContent    = state.stats.docsUploaded;
  els.statChatMessages.textContent    = state.stats.chatMessages;
}

function addActivity(message) {
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  state.activity.unshift({ message, time });
  if (state.activity.length > 20) state.activity.pop();
  renderActivity();
}

function renderActivity() {
  if (state.activity.length === 0) {
    els.activityList.innerHTML = '<li class="activity-item" style="color:var(--muted);font-style:italic;">No activity yet.</li>';
    return;
  }
  els.activityList.innerHTML = state.activity
    .slice(0, 10)
    .map((a) => `
      <li class="activity-item">
        <span class="activity-dot"></span>
        ${escapeHtml(a.message)}
        <span class="activity-time">${a.time}</span>
      </li>`)
    .join('');
}

// ── Utilities ──────────────────────────────────────────────────────────────────
function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ── Init ───────────────────────────────────────────────────────────────────────
updateStats();
renderActivity();
