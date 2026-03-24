/**
 * CodeScan 2.0 – script.js
 * Complete AI-powered debugging assistant with:
 * - Auto language detection
 * - Single file analysis
 * - Full project folder scanning
 * - Project requirement detection
 * - Fixed project ZIP download
 * - Jarvis AI chat assistant
 */

/* ═══════════════════════════════════════════════════════════════
   STATE
═══════════════════════════════════════════════════════════════ */
const state = {
  theme: 'dark',
  learningMode: false,
  activeTab: 'single',       // 'single' | 'project'
  // Single-file state
  issues: [],
  lastCode: '',
  lastLang: 'auto',
  lastContext: '',
  chart: null,
  // Project state
  projectFiles: [],          // [{ path, name, content, ext, lang, issues, fixedContent, status }]
  projectName: '',
  projectType: null,         // 'node', 'python', 'java', 'generic'
  projectReqs: [],           // [{ name, found, type }]
  activeFileIndex: -1,
  scanAborted: false,
  // Chat
  chatHistory: [],
  analysisPerformed: false,
};

/* ═══════════════════════════════════════════════════════════════
   DOM REFS
═══════════════════════════════════════════════════════════════ */
const $ = id => document.getElementById(id);
const dom = {
  html: document.documentElement,
  apiKey: $('apiKeyInput'), toggleApiKey: $('toggleApiKey'),
  themeToggle: $('themeToggle'), themeIcon: $('themeIcon'),
  learningMode: $('learningMode'),
  langSelect: $('langSelect'), langAutoBadge: $('langAutoBadge'),
  codeInput: $('codeInput'), lineNums: $('lineNums'),
  contextInput: $('contextInput'),
  analyzeBtn: $('analyzeBtn'), copyCodeBtn: $('copyCodeBtn'), clearCodeBtn: $('clearCodeBtn'),
  exportBtn: $('exportBtn'),
  // Tabs
  tabSingle: $('tabSingle'), tabProject: $('tabProject'), tabIndicator: $('tabIndicator'),
  editorPanel: $('editorPanel'), uploadPanel: $('uploadPanel'),
  // Upload
  folderInput: $('folderInput'), dropZone: $('dropZone'), browseFolderBtn: $('browseFolderBtn'),
  fileTreeWrap: $('fileTreeWrap'), fileTree: $('fileTree'),
  projectName: $('projectName'),
  ftTotalFiles: $('ftTotalFiles'), ftScanned: $('ftScanned'),
  reqPanel: $('reqPanel'), reqContent: $('reqContent'),
  scanAllBtn: $('scanAllBtn'), downloadFixedBtn: $('downloadFixedBtn'),
  // Results
  emptyState: $('emptyState'), resultsContent: $('resultsContent'),
  resultsMeta: $('resultsMeta'), countHigh: $('countHigh'), countMed: $('countMed'), countLow: $('countLow'),
  issuesList: $('issuesList'), chartCard: $('chartCard'),
  activeFileBar: $('activeFileBar'), activeFileName: $('activeFileName'),
  // Scan progress
  scanProgress: $('scanProgress'), scanProgressLabel: $('scanProgressLabel'), scanProgressFill: $('scanProgressFill'),
  // Chat
  chatMessages: $('chatMessages'), chatInput: $('chatInput'), chatSendBtn: $('chatSendBtn'), clearChatBtn: $('clearChatBtn'),
  // Loading
  loadingOverlay: $('loadingOverlay'), loadingSubText: $('loadingSubText'),
  // Toast
  toast: $('toast'),
};

/* ═══════════════════════════════════════════════════════════════
   AUTO-DETECT LANGUAGE
═══════════════════════════════════════════════════════════════ */
const EXT_MAP = {
  js: 'javascript', jsx: 'javascript', mjs: 'javascript', cjs: 'javascript',
  ts: 'typescript', tsx: 'typescript',
  py: 'python', pyw: 'python',
  java: 'java',
  c: 'c', h: 'c',
  cpp: 'cpp', cc: 'cpp', cxx: 'cpp', hpp: 'cpp',
  go: 'go',
  rs: 'rust',
  rb: 'ruby',
  php: 'php',
  swift: 'swift',
  kt: 'kotlin', kts: 'kotlin',
  html: 'html', htm: 'html',
  css: 'css', scss: 'css', sass: 'css', less: 'css',
  sql: 'sql',
  sh: 'shell', bash: 'shell', zsh: 'shell',
  json: 'json', yaml: 'yaml', yml: 'yaml', toml: 'toml',
  md: 'markdown', txt: 'text',
  xml: 'xml', svg: 'xml',
};

const LANG_PATTERNS = [
  { lang: 'python',     patterns: [/^import\s+\w/m, /^from\s+\w+\s+import/m, /def\s+\w+\s*\(/, /print\s*\(/, /__name__\s*==\s*['"]__main__['"]/] },
  { lang: 'javascript', patterns: [/\bconst\s+\w+\s*=/, /\blet\s+\w+\s*=/, /\bfunction\s+\w+\s*\(/, /=>\s*\{/, /console\.\w+\(/, /require\s*\(/, /module\.exports/] },
  { lang: 'typescript', patterns: [/:\s*(string|number|boolean|void|any)\b/, /interface\s+\w+/, /type\s+\w+\s*=/, /<\w+>\s*\(/] },
  { lang: 'java',       patterns: [/public\s+(static\s+)?class\s+/, /System\.out\.print/, /public\s+static\s+void\s+main/, /import\s+java\./] },
  { lang: 'cpp',        patterns: [/#include\s*</, /std::/, /cout\s*<</, /cin\s*>>/, /using\s+namespace\s+std/] },
  { lang: 'c',          patterns: [/#include\s*<stdio\.h>/, /printf\s*\(/, /scanf\s*\(/, /int\s+main\s*\(/] },
  { lang: 'go',         patterns: [/^package\s+\w+/m, /func\s+\w+\s*\(/, /fmt\.Print/, /import\s+\(/] },
  { lang: 'rust',       patterns: [/fn\s+\w+\s*\(/, /let\s+mut\s+/, /println!\s*\(/, /use\s+std::/] },
  { lang: 'ruby',       patterns: [/def\s+\w+/, /puts\s+/, /class\s+\w+\s*<\s*\w+/, /require\s+['"]/, /end$/m] },
  { lang: 'php',        patterns: [/<\?php/, /\$\w+\s*=/, /echo\s+/, /function\s+\w+\s*\(/] },
  { lang: 'swift',      patterns: [/var\s+\w+\s*:\s*\w+/, /func\s+\w+\s*\(/, /import\s+UIKit/, /override\s+func/] },
  { lang: 'kotlin',     patterns: [/fun\s+\w+\s*\(/, /val\s+\w+\s*[:=]/, /var\s+\w+\s*:\s*\w+/, /println\s*\(/] },
  { lang: 'sql',        patterns: [/SELECT\s+/i, /FROM\s+/i, /INSERT\s+INTO/i, /CREATE\s+TABLE/i] },
  { lang: 'shell',      patterns: [/^#!/m, /echo\s+/, /\bfi\b/, /\bdone\b/, /\bif\s+\[/] },
  { lang: 'html',       patterns: [/<html/i, /<div/i, /<head/i, /<!DOCTYPE/i] },
  { lang: 'css',        patterns: [/\{[\s\S]*?:\s*[\w#]+;/m, /@media\s*\(/, /\.[\w-]+\s*\{/] },
];

function detectLangFromCode(code) {
  if (!code || code.trim().length < 10) return null;
  let best = null, bestScore = 0;
  for (const { lang, patterns } of LANG_PATTERNS) {
    let score = 0;
    for (const pat of patterns) {
      if (pat.test(code)) score++;
    }
    if (score > bestScore) { bestScore = score; best = lang; }
  }
  return bestScore >= 2 ? best : null;
}

function detectLangFromExt(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  return EXT_MAP[ext] || null;
}

function getEffectiveLang(code, manualLang) {
  if (manualLang && manualLang !== 'auto') return manualLang;
  const detected = detectLangFromCode(code);
  if (detected) {
    dom.langAutoBadge.style.display = '';
    dom.langAutoBadge.textContent = `Detected: ${detected}`;
  }
  return detected || 'javascript';
}

/* ═══════════════════════════════════════════════════════════════
   GEMINI API
═══════════════════════════════════════════════════════════════ */
const GEMINI_URL = key =>
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;

async function gemini(key, contents) {
  const res = await fetch(GEMINI_URL(key), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents }),
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e?.error?.message || `API ${res.status}`);
  }
  const d = await res.json();
  return d?.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

function analysisPrompt(code, lang, context) {
  return `You are an expert ${lang} code reviewer and security analyst.

Analyze the following${context ? ` (Context: "${context}")` : ''} ${lang} code and return a JSON array of issues.

Each issue MUST follow this structure:
[{"issue":"title","severity":"High|Medium|Low","explanation":"why it's a problem","fix":"how to fix with improved code","originalSnippet":"problematic code (1-3 lines)","fixedSnippet":"corrected code (1-3 lines)","concept":"underlying concept","bestPractice":"best practice tip","confidence":0-100}]

Rules:
- Return ONLY the JSON array, no markdown, no fences
- Find 1-8 issues. If no real bugs, suggest improvements
- Keep snippets SHORT

Code:
\`\`\`${lang}
${code}
\`\`\``;
}

function parseIssues(raw) {
  let c = raw.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  const s = c.indexOf('['), e = c.lastIndexOf(']');
  if (s === -1 || e === -1) throw new Error('No JSON array in response');
  return JSON.parse(c.substring(s, e + 1));
}

/* ═══════════════════════════════════════════════════════════════
   LOADING & TOASTS
═══════════════════════════════════════════════════════════════ */
const STEPS = ['Sending to Gemini AI...','Parsing code structure...','Detecting security issues...','Analyzing performance...','Generating fixes...','Building report...'];
let loadingInt;
function showLoading() {
  dom.loadingOverlay.style.display = 'flex';
  let i = 0; dom.loadingSubText.textContent = STEPS[0];
  loadingInt = setInterval(() => { i = (i + 1) % STEPS.length; dom.loadingSubText.textContent = STEPS[i]; }, 1400);
}
function hideLoading() { dom.loadingOverlay.style.display = 'none'; clearInterval(loadingInt); }

let toastT;
function toast(msg, type = '') {
  dom.toast.textContent = msg;
  dom.toast.className = `toast${type ? ' ' + type : ''}`;
  void dom.toast.offsetWidth;
  dom.toast.classList.add('show');
  clearTimeout(toastT);
  toastT = setTimeout(() => dom.toast.classList.remove('show'), 3500);
}

/* ═══════════════════════════════════════════════════════════════
   LINE NUMBERS
═══════════════════════════════════════════════════════════════ */
function updateLineNums() {
  const n = dom.codeInput.value.split('\n').length;
  dom.lineNums.textContent = Array.from({ length: n }, (_, i) => i + 1).join('\n');
  dom.lineNums.scrollTop = dom.codeInput.scrollTop;
}

/* ═══════════════════════════════════════════════════════════════
   THEME
═══════════════════════════════════════════════════════════════ */
function setTheme(t) {
  state.theme = t;
  dom.html.setAttribute('data-theme', t);
  if (t === 'dark') {
    dom.themeIcon.innerHTML = '<path d="M10 3.333V1.667M10 18.333v-1.666M3.333 10H1.667M18.333 10h-1.666M5.286 5.286L4.107 4.107M15.893 15.893l-1.179-1.179M5.286 14.714l-1.179 1.179M15.893 4.107l-1.179 1.179M13.333 10a3.333 3.333 0 11-6.667 0 3.333 3.333 0 016.667 0z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>';
  } else {
    dom.themeIcon.innerHTML = '<path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>';
  }
  localStorage.setItem('cs2_theme', t);
  if (state.chart) renderChart(state.issues);
}

/* ═══════════════════════════════════════════════════════════════
   TABS
═══════════════════════════════════════════════════════════════ */
function setTab(tab) {
  state.activeTab = tab;
  dom.tabSingle.classList.toggle('active', tab === 'single');
  dom.tabProject.classList.toggle('active', tab === 'project');
  dom.editorPanel.style.display = tab === 'single' ? '' : 'none';
  dom.uploadPanel.style.display = tab === 'project' ? '' : 'none';

  // Move indicator
  const active = tab === 'single' ? dom.tabSingle : dom.tabProject;
  dom.tabIndicator.style.left = active.offsetLeft + 'px';
  dom.tabIndicator.style.width = active.offsetWidth + 'px';

  // Reset results when switching tabs
  if (tab === 'single') {
    dom.activeFileBar.style.display = 'none';
    if (state.issues.length > 0) renderResults(state.issues);
  }
}

/* ═══════════════════════════════════════════════════════════════
   CHART (Chart.js)
═══════════════════════════════════════════════════════════════ */
function renderChart(issues) {
  const counts = { High: 0, Medium: 0, Low: 0 };
  issues.forEach(i => { const s = normSev(i.severity); if (counts[s] !== undefined) counts[s]++; });

  const data = {
    labels: ['High', 'Medium', 'Low'],
    datasets: [{
      data: [counts.High, counts.Medium, counts.Low],
      backgroundColor: ['rgba(239,68,68,.85)', 'rgba(245,158,11,.85)', 'rgba(34,197,94,.85)'],
      borderColor: ['#ef4444', '#f59e0b', '#22c55e'],
      borderWidth: 2, hoverOffset: 6,
    }],
  };

  const ctx = document.getElementById('severityChart').getContext('2d');
  if (state.chart) { state.chart.data = data; state.chart.update('active'); }
  else {
    state.chart = new Chart(ctx, {
      type: 'doughnut', data,
      options: {
        cutout: '70%', responsive: true, maintainAspectRatio: true,
        animation: { animateRotate: true, duration: 700 },
        plugins: { legend: { display: false }, tooltip: { backgroundColor: 'rgba(12,14,25,.95)', titleColor: '#eaecf4', bodyColor: '#8890b0', borderColor: 'rgba(124,58,237,.4)', borderWidth: 1, padding: 10, cornerRadius: 8 } },
      },
    });
  }

  const legend = document.getElementById('chartLegend');
  legend.innerHTML = [
    { l: 'High', c: '#ef4444', n: counts.High },
    { l: 'Medium', c: '#f59e0b', n: counts.Medium },
    { l: 'Low', c: '#22c55e', n: counts.Low },
  ].map(x => `<div class="legend-item"><div class="legend-dot" style="background:${x.c}"></div><span style="color:var(--text);font-weight:700">${x.n}</span><span style="color:var(--text2)">${x.l}</span></div>`).join('');
}

/* ═══════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════ */
function normSev(s) { const v = (s || '').toLowerCase(); return v === 'high' ? 'High' : v === 'medium' || v === 'med' ? 'Medium' : 'Low'; }
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

function renderDiff(orig, fixed) {
  if (!orig || !fixed) return '';
  return `<div class="diff-wrap"><div class="diff-header">SUGGESTED FIX</div>${
    orig.split('\n').map(l => `<div class="diff-line del"><span class="diff-sign">−</span><span>${esc(l)}</span></div>`).join('') +
    fixed.split('\n').map(l => `<div class="diff-line add"><span class="diff-sign">+</span><span>${esc(l)}</span></div>`).join('')
  }</div>`;
}

function renderIssueCard(issue, i) {
  const sev = normSev(issue.severity), conf = Math.min(100, Math.max(0, parseInt(issue.confidence) || 70));
  const learn = state.learningMode ? `<div class="learning-card"><div class="learning-title">🎓 Learning Mode</div><div class="learning-text"><strong>Concept:</strong> ${esc(issue.concept || 'N/A')}<br/><strong>Why:</strong> ${esc(issue.explanation || '')}<br/><strong>Best Practice:</strong> ${esc(issue.bestPractice || 'Follow coding standards.')}</div></div>` : '';
  return `<div class="issue-card ${sev.toLowerCase()}" data-i="${i}">
    <div class="issue-header"><div class="issue-title">${esc(issue.issue || 'Issue')}</div><span class="severity-badge severity-${sev.toLowerCase()}">${sev}</span></div>
    <div class="issue-explanation${state.learningMode ? '' : ' truncated'}">${esc(issue.explanation || '')}</div>
    <div class="conf-wrap"><div class="conf-label"><span>AI Confidence</span><span>${conf}%</span></div><div class="conf-bar"><div class="conf-fill" style="width:0%" data-target="${conf}"></div></div></div>
    ${renderDiff(issue.originalSnippet, issue.fixedSnippet)}
    ${learn}
    <div><button class="btn-copy-fix" onclick="copyFix(${i})">📋 Copy Fix</button></div>
  </div>`;
}

/* ═══════════════════════════════════════════════════════════════
   RENDER RESULTS (Single or Per-File)
═══════════════════════════════════════════════════════════════ */
function renderResults(issues) {
  state.issues = issues;
  const counts = { High: 0, Medium: 0, Low: 0 };
  issues.forEach(i => { const s = normSev(i.severity); if (counts[s] !== undefined) counts[s]++; });

  dom.countHigh.textContent = `${counts.High} High`;
  dom.countMed.textContent = `${counts.Medium} Med`;
  dom.countLow.textContent = `${counts.Low} Low`;
  dom.resultsMeta.style.display = 'flex';
  dom.emptyState.style.display = 'none';
  dom.resultsContent.style.display = 'flex';

  dom.issuesList.innerHTML = issues.map((is, i) => renderIssueCard(is, i)).join('');
  requestAnimationFrame(() => {
    document.querySelectorAll('.conf-fill').forEach(b => { b.style.width = b.dataset.target + '%'; });
  });
  renderChart(issues);
}

/* ═══════════════════════════════════════════════════════════════
   ANALYZE (SINGLE FILE)
═══════════════════════════════════════════════════════════════ */
async function analyzeCode() {
  const key = dom.apiKey.value.trim();
  const code = dom.codeInput.value.trim();
  const ctx = dom.contextInput.value.trim();
  if (!key) { toast('⚠️ Please enter your Gemini API key', 'error'); dom.apiKey.focus(); return; }
  if (!code) { toast('⚠️ Paste code to analyze', 'error'); dom.codeInput.focus(); return; }

  const lang = getEffectiveLang(code, dom.langSelect.value);
  state.lastCode = code; state.lastLang = lang; state.lastContext = ctx; state.analysisPerformed = true;

  dom.analyzeBtn.disabled = true;
  dom.activeFileBar.style.display = 'none';
  showLoading();

  try {
    const raw = await gemini(key, [{ role: 'user', parts: [{ text: analysisPrompt(code, lang, ctx) }] }]);
    const issues = parseIssues(raw);
    if (!Array.isArray(issues) || !issues.length) throw new Error('No issues returned');
    hideLoading();
    renderResults(issues);
    toast(`✅ ${issues.length} issue${issues.length !== 1 ? 's' : ''} found`, 'success');
    // chat context
    state.chatHistory = [
      { role: 'user', parts: [{ text: `I analyzed ${lang} code. Issues: ${JSON.stringify(issues.map(i => i.issue))}` }] },
      { role: 'model', parts: [{ text: `Found ${issues.length} issues. Ask me anything about them.` }] },
    ];
  } catch (err) {
    hideLoading();
    dom.emptyState.style.display = 'none';
    dom.resultsContent.style.display = 'flex';
    dom.issuesList.innerHTML = `<div class="error-state"><div class="error-icon">⚠️</div><div class="error-title">Analysis Failed</div><div class="error-sub">${esc(err.message)}</div><button class="btn-retry" onclick="analyzeCode()">🔄 Retry</button></div>`;
    dom.resultsMeta.style.display = 'none';
    toast(`❌ ${err.message}`, 'error');
  } finally {
    dom.analyzeBtn.disabled = false;
  }
}

/* ═══════════════════════════════════════════════════════════════
   FOLDER UPLOAD & PROJECT SCAN
═══════════════════════════════════════════════════════════════ */
const CODE_EXTS = new Set(['js','jsx','mjs','cjs','ts','tsx','py','pyw','java','c','h','cpp','cc','cxx','hpp','go','rs','rb','php','swift','kt','kts','html','htm','css','scss','less','sql','sh','bash','zsh','vue','svelte','astro']);
const SKIP_DIRS = new Set(['node_modules', '.git', '__pycache__', '.next', 'dist', 'build', '.cache', 'venv', '.venv', 'target', '.idea', '.vs', '.vscode', 'vendor', 'coverage']);
const CONFIG_FILES = new Set(['package.json','requirements.txt','setup.py','pyproject.toml','pom.xml','build.gradle','Cargo.toml','go.mod','Gemfile','composer.json','CMakeLists.txt','.gitignore','README.md','Makefile','Dockerfile','docker-compose.yml','.env','.env.example','tsconfig.json','webpack.config.js','vite.config.js','next.config.js','.eslintrc.json','.prettierrc']);

function shouldSkip(pathParts) {
  return pathParts.some(p => SKIP_DIRS.has(p));
}

function isCodeFile(name) {
  const ext = name.split('.').pop().toLowerCase();
  return CODE_EXTS.has(ext) || CONFIG_FILES.has(name);
}

async function handleFolderUpload(files) {
  const items = [];
  let rootName = '';

  for (const file of files) {
    const pathParts = file.webkitRelativePath.split('/');
    if (!rootName) rootName = pathParts[0];

    // Skip large dirs
    if (shouldSkip(pathParts.slice(1))) continue;

    // Only code files + configs, skip binary/large files
    if (!isCodeFile(file.name) || file.size > 500000) continue;

    try {
      const content = await file.text();
      const ext = file.name.split('.').pop().toLowerCase();
      items.push({
        path: file.webkitRelativePath,
        relativePath: pathParts.slice(1).join('/'),
        name: file.name,
        content,
        ext,
        lang: detectLangFromExt(file.name) || 'text',
        issues: [],
        fixedContent: null,
        status: 'pending', // pending | scanning | done | error
      });
    } catch (_) { /* skip unreadable */ }
  }

  if (!items.length) {
    toast('⚠️ No code files found in folder', 'error');
    return;
  }

  state.projectFiles = items;
  state.projectName = rootName;
  state.activeFileIndex = -1;
  state.scanAborted = false;

  // Detect project type and requirements
  detectProjectType(items);

  // Show file tree
  dom.dropZone.style.display = 'none';
  dom.fileTreeWrap.style.display = 'flex';
  dom.projectName.textContent = rootName;
  dom.ftTotalFiles.textContent = `${items.length} files`;
  dom.ftScanned.textContent = '0 scanned';

  renderFileTree(items);
  toast(`📁 Loaded ${items.length} files from ${rootName}`, 'success');
}

function detectProjectType(files) {
  const names = new Set(files.map(f => f.name));
  const paths = files.map(f => f.relativePath);
  const reqs = [];

  // Node.js
  if (names.has('package.json')) {
    state.projectType = 'node';
    reqs.push({ name: 'package.json', found: true, type: 'config' });
    reqs.push({ name: 'node_modules', found: false, type: 'info', note: 'Run: npm install' });
    // Parse package.json for deps
    const pkgFile = files.find(f => f.name === 'package.json');
    if (pkgFile) {
      try {
        const pkg = JSON.parse(pkgFile.content);
        if (pkg.dependencies) Object.keys(pkg.dependencies).forEach(d => reqs.push({ name: d, found: true, type: 'dependency', version: pkg.dependencies[d] }));
        if (pkg.devDependencies) Object.keys(pkg.devDependencies).forEach(d => reqs.push({ name: d, found: true, type: 'devDependency', version: pkg.devDependencies[d] }));
        if (pkg.scripts) Object.keys(pkg.scripts).forEach(s => reqs.push({ name: `npm run ${s}`, found: true, type: 'script' }));
      } catch (_) {}
    }
    // Check common required files
    ['README.md', '.gitignore', '.env', 'tsconfig.json'].forEach(f => {
      reqs.push({ name: f, found: names.has(f), type: 'recommended' });
    });
  }
  // Python
  else if (names.has('requirements.txt') || names.has('setup.py') || names.has('pyproject.toml')) {
    state.projectType = 'python';
    ['requirements.txt', 'setup.py', 'pyproject.toml'].forEach(f => {
      if (names.has(f)) reqs.push({ name: f, found: true, type: 'config' });
    });
    const reqFile = files.find(f => f.name === 'requirements.txt');
    if (reqFile) {
      reqFile.content.split('\n').filter(l => l.trim() && !l.startsWith('#')).forEach(l => {
        reqs.push({ name: l.trim(), found: true, type: 'dependency' });
      });
    }
    ['README.md', '.gitignore', 'venv'].forEach(f => reqs.push({ name: f, found: names.has(f), type: 'recommended' }));
  }
  // Java
  else if (names.has('pom.xml') || names.has('build.gradle')) {
    state.projectType = 'java';
    ['pom.xml', 'build.gradle', 'README.md', '.gitignore'].forEach(f => {
      reqs.push({ name: f, found: names.has(f), type: names.has(f) ? 'config' : 'recommended' });
    });
  }
  // Generic
  else {
    state.projectType = 'generic';
    ['README.md', '.gitignore'].forEach(f => {
      reqs.push({ name: f, found: names.has(f), type: 'recommended' });
    });
  }

  state.projectReqs = reqs;
  renderRequirements(reqs);
}

function renderRequirements(reqs) {
  if (!reqs.length) { dom.reqPanel.style.display = 'none'; return; }
  dom.reqPanel.style.display = '';

  const types = {};
  reqs.forEach(r => { (types[r.type] = types[r.type] || []).push(r); });

  let html = '';
  const typeLabels = { config: '⚙️ Config Files', dependency: '📦 Dependencies', devDependency: '🔧 Dev Dependencies', script: '📜 Scripts', recommended: '📋 Recommended', info: 'ℹ️ Info' };

  for (const [type, items] of Object.entries(types)) {
    html += `<div style="margin-bottom:8px"><strong style="font-size:.7rem;color:var(--text3);text-transform:uppercase;letter-spacing:.05em">${typeLabels[type] || type}</strong>`;
    items.forEach(r => {
      const icon = r.found ? '✅' : '❌';
      const cls = r.found ? 'req-found' : 'req-missing';
      html += `<div class="req-item"><span class="req-icon">${icon}</span><span class="${cls}">${esc(r.name)}</span>${r.version ? `<span class="req-tag">${esc(r.version)}</span>` : ''}${r.note ? `<span style="color:var(--text3);font-size:.7rem;margin-left:6px">${esc(r.note)}</span>` : ''}</div>`;
    });
    html += '</div>';
  }

  dom.reqContent.innerHTML = html;
}

function renderFileTree(files) {
  // Build tree structure
  const tree = {};
  files.forEach((f, i) => {
    const parts = f.relativePath.split('/');
    let node = tree;
    parts.forEach((p, pi) => {
      if (pi === parts.length - 1) {
        node[p] = { _file: true, _index: i, _status: f.status };
      } else {
        node[p] = node[p] || {};
      }
    });
  });

  function renderNode(obj, depth = 0) {
    let html = '';
    // Folders first, then files
    const entries = Object.entries(obj).sort(([, a], [, b]) => {
      const aDir = !a._file, bDir = !b._file;
      if (aDir !== bDir) return aDir ? -1 : 1;
      return 0;
    });

    for (const [name, val] of entries) {
      const indent = '<span class="ft-indent"></span>'.repeat(depth);
      if (val._file) {
        const f = files[val._index];
        const active = state.activeFileIndex === val._index ? ' active' : '';
        const statusCls = f.status === 'done' && f.issues.length > 0 ? 'issues' : f.status;
        html += `<div class="ft-item${active}" data-idx="${val._index}" onclick="selectFile(${val._index})">${indent}<svg class="ft-icon" viewBox="0 0 16 16" fill="none"><path d="M9.5 1.5H4a1 1 0 00-1 1v11a1 1 0 001 1h8a1 1 0 001-1V4.5L9.5 1.5z" stroke="currentColor" stroke-width="1.1"/></svg><span class="ft-name">${esc(name)}</span><span class="ft-status ${statusCls}"></span></div>`;
      } else {
        html += `<div class="ft-item folder">${indent}<svg class="ft-icon" viewBox="0 0 16 16" fill="none"><path d="M14 13.5H2A1 1 0 011 12.5v-9a1 1 0 011-1h3.28l1.44 1.5H14a1 1 0 011 1v8a1 1 0 01-1 1z" stroke="currentColor" stroke-width="1.1"/></svg><span class="ft-name">${esc(name)}</span></div>`;
        html += renderNode(val, depth + 1);
      }
    }
    return html;
  }

  dom.fileTree.innerHTML = renderNode(tree);
}

window.selectFile = function(idx) {
  state.activeFileIndex = idx;
  const f = state.projectFiles[idx];
  // Update tree highlights
  dom.fileTree.querySelectorAll('.ft-item').forEach(el => el.classList.toggle('active', parseInt(el.dataset.idx) === idx));
  // Show file issues
  if (f.issues.length > 0) {
    dom.activeFileBar.style.display = 'flex';
    dom.activeFileName.textContent = f.relativePath;
    renderResults(f.issues);
  } else {
    dom.activeFileBar.style.display = 'flex';
    dom.activeFileName.textContent = f.relativePath;
    dom.emptyState.style.display = 'flex';
    dom.resultsContent.style.display = 'none';
    dom.resultsMeta.style.display = 'none';
    const statusMsg = f.status === 'pending' ? 'Not scanned yet' : f.status === 'scanning' ? 'Scanning...' : f.status === 'error' ? 'Scan failed' : 'No issues found ✅';
    document.querySelector('.empty-title').textContent = statusMsg;
    document.querySelector('.empty-sub').textContent = f.status === 'done' ? 'This file looks clean!' : 'Click "Scan All Files" to analyze';
  }
};

/* ═══════════════════════════════════════════════════════════════
   SCAN ALL FILES (Sequential Gemini calls)
═══════════════════════════════════════════════════════════════ */
async function scanAllFiles() {
  const key = dom.apiKey.value.trim();
  if (!key) { toast('⚠️ Enter your Gemini API key', 'error'); dom.apiKey.focus(); return; }

  const codeFiles = state.projectFiles.filter(f => CODE_EXTS.has(f.ext));
  if (!codeFiles.length) { toast('⚠️ No scannable code files', 'error'); return; }

  state.scanAborted = false;
  dom.scanAllBtn.disabled = true;
  dom.scanProgress.style.display = '';
  let scanned = 0;
  const total = codeFiles.length;
  let allIssues = [];

  for (const file of codeFiles) {
    if (state.scanAborted) break;

    file.status = 'scanning';
    renderFileTree(state.projectFiles);
    dom.scanProgressLabel.textContent = `Scanning ${file.name} (${scanned + 1}/${total})`;
    dom.scanProgressFill.style.width = `${(scanned / total) * 100}%`;

    try {
      const prompt = analysisPrompt(file.content.slice(0, 8000), file.lang, `File: ${file.relativePath}`);
      const raw = await gemini(key, [{ role: 'user', parts: [{ text: prompt }] }]);
      const issues = parseIssues(raw);
      file.issues = Array.isArray(issues) ? issues : [];
      file.status = 'done';

      // Generate fixed content
      if (file.issues.length > 0) {
        let fixed = file.content;
        file.issues.forEach(issue => {
          if (issue.originalSnippet && issue.fixedSnippet) {
            fixed = fixed.replace(issue.originalSnippet, issue.fixedSnippet);
          }
        });
        file.fixedContent = fixed;
        allIssues.push(...file.issues.map(is => ({ ...is, file: file.relativePath })));
      } else {
        file.fixedContent = file.content;
      }
    } catch (err) {
      console.error(`Error scanning ${file.name}:`, err);
      file.status = 'error';
      file.issues = [];
      file.fixedContent = file.content;
    }

    scanned++;
    dom.ftScanned.textContent = `${scanned} scanned`;
    renderFileTree(state.projectFiles);
  }

  // Also copy config files as-is to fixed output
  state.projectFiles.filter(f => !CODE_EXTS.has(f.ext)).forEach(f => {
    f.fixedContent = f.content;
    f.status = 'done';
  });

  // -- Generate missing files --
  const missingFiles = state.projectReqs.filter(r => !r.found && r.type === 'recommended');
  const generatedFiles = [];
  for (const missing of missingFiles) {
    try {
      const genPrompt = `Generate the content of a ${missing.name} file for a ${state.projectType} project called "${state.projectName}". Return ONLY the file content, no markdown fences, no explanations. Make it professional.`;
      const content = await gemini(key, [{ role: 'user', parts: [{ text: genPrompt }] }]);
      generatedFiles.push({ relativePath: missing.name, name: missing.name, content: content.trim(), fixedContent: content.trim(), status: 'done', issues: [], generated: true });
      missing.found = true;
      missing.note = '(auto-generated)';
    } catch (_) { /* skip */ }
  }
  state.projectFiles.push(...generatedFiles);
  renderRequirements(state.projectReqs);
  renderFileTree(state.projectFiles);

  dom.scanProgressFill.style.width = '100%';
  dom.scanProgressLabel.textContent = `✅ Complete — ${allIssues.length} issues in ${total} files`;
  dom.scanAllBtn.disabled = false;

  state.analysisPerformed = true;

  // Show overall results
  if (allIssues.length > 0) {
    renderResults(allIssues);
    dom.activeFileBar.style.display = 'flex';
    dom.activeFileName.textContent = 'All Files (Overview)';
  }

  // Show download button
  dom.downloadFixedBtn.style.display = '';
  toast(`✅ Project scan complete — ${allIssues.length} total issues`, 'success');

  // Chat context
  state.chatHistory = [
    { role: 'user', parts: [{ text: `Scanned a ${state.projectType} project "${state.projectName}" with ${total} files. Found ${allIssues.length} issues total.` }] },
    { role: 'model', parts: [{ text: `I've reviewed the project. Found ${allIssues.length} issues across ${total} files. Ask me anything about specific files or issues.` }] },
  ];
}

/* ═══════════════════════════════════════════════════════════════
   DOWNLOAD FIXED PROJECT (ZIP)
═══════════════════════════════════════════════════════════════ */
async function downloadFixedProject() {
  toast('📦 Creating ZIP...', '');
  try {
    const zip = new JSZip();
    const folder = zip.folder(state.projectName + '-fixed');

    state.projectFiles.forEach(f => {
      const content = f.fixedContent || f.content;
      folder.file(f.relativePath, content);
    });

    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, `${state.projectName}-fixed.zip`);
    toast('✅ Fixed project downloaded!', 'success');
  } catch (err) {
    toast(`❌ ZIP error: ${err.message}`, 'error');
  }
}

/* ═══════════════════════════════════════════════════════════════
   COPY FIX
═══════════════════════════════════════════════════════════════ */
window.copyFix = function(i) {
  const issue = state.issues[i];
  if (!issue) return;
  navigator.clipboard.writeText(`Fix for: ${issue.issue}\n\n${issue.fix || issue.fixedSnippet}`).then(() => toast('✅ Copied!', 'success'));
};

/* ═══════════════════════════════════════════════════════════════
   JARVIS CHAT
═══════════════════════════════════════════════════════════════ */
function addChatMsg(role, html) {
  const isBot = role === 'bot';
  const el = document.createElement('div');
  el.className = `chat-msg ${isBot ? 'bot' : 'user'}`;
  el.innerHTML = `<div class="chat-avatar ${isBot ? 'bot-av' : 'user-av'}">${isBot ? 'J' : '👤'}</div><div class="chat-bubble ${isBot ? 'bot-bub' : 'user-bub'}">${html}</div>`;
  dom.chatMessages.appendChild(el);
  dom.chatMessages.scrollTop = dom.chatMessages.scrollHeight;
}

function addThinking() {
  const el = document.createElement('div');
  el.className = 'chat-msg bot'; el.id = 'thinkingBub';
  el.innerHTML = `<div class="chat-avatar bot-av">J</div><div class="chat-bubble bot-bub"><div class="chat-thinking"><span></span><span></span><span></span></div></div>`;
  dom.chatMessages.appendChild(el);
  dom.chatMessages.scrollTop = dom.chatMessages.scrollHeight;
}

async function sendChat() {
  const key = dom.apiKey.value.trim(), text = dom.chatInput.value.trim();
  if (!text) return;
  if (!key) { toast('⚠️ Enter API key', 'error'); return; }
  dom.chatInput.value = '';
  addChatMsg('user', esc(text));
  addThinking();

  const sysCtx = state.analysisPerformed
    ? `You are Jarvis, expert AI debugging assistant. ${state.activeTab === 'project' ? `Project "${state.projectName}" (${state.projectType}) with ${state.projectFiles.length} files.` : `Code analyzed (${state.lastLang}).`} Issues: ${JSON.stringify(state.issues?.slice(0, 5)?.map(i => ({ issue: i.issue, severity: i.severity })))}. Answer concisely. Format code with backticks.`
    : 'You are Jarvis, expert AI coding assistant. Help with debugging, code review, and best practices. Be concise.';

  state.chatHistory.push({ role: 'user', parts: [{ text }] });
  const contents = [{ role: 'user', parts: [{ text: sysCtx }] }, { role: 'model', parts: [{ text: "Ready." }] }, ...state.chatHistory];

  try {
    const raw = await gemini(key, contents);
    document.getElementById('thinkingBub')?.remove();
    const fmt = raw.trim().replace(/\*\*/g, '').replace(/\*/g, '')
      .replace(/```[\s\S]*?```/g, m => { const c = m.replace(/```\w*/, '').replace(/```$/, '').trim(); return `<pre style="background:var(--editor-bg);border-radius:8px;padding:8px 12px;margin:6px 0;font-family:var(--mono);font-size:.72rem;overflow-x:auto;color:var(--code-text)">${esc(c)}</pre>`; })
      .replace(/`([^`]+)`/g, '<code style="background:var(--editor-bg);border-radius:4px;padding:1px 5px;font-family:var(--mono);font-size:.78em">$1</code>');
    addChatMsg('bot', fmt);
    state.chatHistory.push({ role: 'model', parts: [{ text: raw }] });
    if (state.chatHistory.length > 20) state.chatHistory = state.chatHistory.slice(-20);
  } catch (err) {
    document.getElementById('thinkingBub')?.remove();
    addChatMsg('bot', `❌ ${esc(err.message)}`);
  }
}

/* ═══════════════════════════════════════════════════════════════
   EXPORT
═══════════════════════════════════════════════════════════════ */
function exportReport() {
  if (!state.issues?.length) { toast('⚠️ No results to export', 'error'); return; }
  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    let y = 20;
    doc.setFillColor(124, 58, 237); doc.rect(0, 0, 210, 16, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(13); doc.setFont('helvetica', 'bold');
    doc.text('CodeScan 2.0 – Bug Report', 20, 11);
    doc.setFontSize(7); doc.setFont('helvetica', 'normal');
    doc.text(`${new Date().toLocaleString()}`, 190, 11, { align: 'right' });
    y = 24;
    const counts = { High: 0, Medium: 0, Low: 0 };
    state.issues.forEach(i => { const s = normSev(i.severity); if (counts[s] !== undefined) counts[s]++; });
    doc.setTextColor(30, 30, 60); doc.setFontSize(9); doc.setFont('helvetica', 'bold');
    doc.text(`Summary: ${state.issues.length} issues | High: ${counts.High} Medium: ${counts.Medium} Low: ${counts.Low}`, 20, y); y += 8;
    state.issues.forEach((is, idx) => {
      if (y > 265) { doc.addPage(); y = 20; }
      doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(30, 30, 60);
      const hdr = doc.splitTextToSize(`${idx + 1}. [${normSev(is.severity)}] ${is.issue || 'Issue'} (${is.confidence}%)`, 170);
      doc.text(hdr, 20, y); y += hdr.length * 4.5 + 1;
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(60, 60, 80);
      const exp = doc.splitTextToSize(is.explanation || '', 170);
      doc.text(exp, 20, y); y += exp.length * 4 + 1;
      if (is.fix) { doc.setTextColor(34, 139, 34); const fx = doc.splitTextToSize(`Fix: ${is.fix}`, 170); doc.text(fx, 20, y); y += fx.length * 4 + 2; }
      doc.setDrawColor(220, 220, 235); doc.line(20, y, 190, y); y += 5;
    });
    doc.save(`codescan-report-${Date.now()}.pdf`);
    toast('✅ PDF exported', 'success');
  } catch (_) {
    const lines = [`CodeScan 2.0 Report\n${'='.repeat(40)}\n`];
    state.issues.forEach((is, i) => lines.push(`${i + 1}. [${normSev(is.severity)}] ${is.issue}\n   ${is.explanation}\n   Fix: ${is.fix || 'N/A'}\n`));
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/plain' }));
    a.download = `codescan-report-${Date.now()}.txt`; a.click();
    toast('✅ Report exported', 'success');
  }
}

/* ═══════════════════════════════════════════════════════════════
   INIT
═══════════════════════════════════════════════════════════════ */
function init() {
  // Load saved state
  const savedTheme = localStorage.getItem('cs2_theme') || 'dark';
  setTheme(savedTheme);
  const savedKey = localStorage.getItem('cs2_apikey') || '';
  if (savedKey) dom.apiKey.value = savedKey;
  updateLineNums();

  // Tab indicator initial position
  requestAnimationFrame(() => setTab('single'));

  // --- Event Listeners ---

  // Tabs
  dom.tabSingle.addEventListener('click', () => setTab('single'));
  dom.tabProject.addEventListener('click', () => setTab('project'));

  // Analyze
  dom.analyzeBtn.addEventListener('click', analyzeCode);

  // Code editor
  dom.codeInput.addEventListener('input', () => {
    updateLineNums();
    // Auto-detect on paste
    if (dom.langSelect.value === 'auto') {
      const det = detectLangFromCode(dom.codeInput.value);
      if (det) { dom.langAutoBadge.style.display = ''; dom.langAutoBadge.textContent = `Detected: ${det}`; }
    }
  });
  dom.codeInput.addEventListener('scroll', () => { dom.lineNums.scrollTop = dom.codeInput.scrollTop; });
  dom.langSelect.addEventListener('change', () => {
    dom.langAutoBadge.style.display = dom.langSelect.value === 'auto' ? '' : 'none';
    localStorage.setItem('cs2_lang', dom.langSelect.value);
  });

  // Theme
  dom.themeToggle.addEventListener('click', () => setTheme(state.theme === 'dark' ? 'light' : 'dark'));

  // API key
  dom.toggleApiKey.addEventListener('click', () => {
    dom.apiKey.type = dom.apiKey.type === 'password' ? 'text' : 'password';
  });
  dom.apiKey.addEventListener('blur', () => localStorage.setItem('cs2_apikey', dom.apiKey.value));

  // Learning mode
  dom.learningMode.addEventListener('change', () => {
    state.learningMode = dom.learningMode.checked;
    if (state.issues.length > 0) renderResults(state.issues);
    toast(state.learningMode ? '🧠 Learning Mode ON' : '🧠 Learning Mode OFF');
  });

  // Copy & clear code
  dom.copyCodeBtn.addEventListener('click', () => {
    if (!dom.codeInput.value) return toast('⚠️ No code', 'error');
    navigator.clipboard.writeText(dom.codeInput.value).then(() => toast('✅ Copied!', 'success'));
  });
  dom.clearCodeBtn.addEventListener('click', () => { dom.codeInput.value = ''; updateLineNums(); toast('🗑 Cleared'); });

  // Export
  dom.exportBtn.addEventListener('click', exportReport);

  // Chat
  dom.chatSendBtn.addEventListener('click', sendChat);
  dom.chatInput.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(); } });
  dom.clearChatBtn.addEventListener('click', () => {
    dom.chatMessages.innerHTML = '<div class="chat-msg bot"><div class="chat-avatar bot-av">J</div><div class="chat-bubble bot-bub">💬 Chat cleared! Ready for new questions.</div></div>';
    state.chatHistory = [];
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', e => {
    if (e.ctrlKey && e.key === 'Enter') { e.preventDefault(); if (state.activeTab === 'single') analyzeCode(); else scanAllFiles(); }
    if (e.key === 'Tab' && e.target === dom.codeInput) {
      e.preventDefault();
      const s = dom.codeInput.selectionStart, end = dom.codeInput.selectionEnd;
      dom.codeInput.value = dom.codeInput.value.substring(0, s) + '  ' + dom.codeInput.value.substring(end);
      dom.codeInput.selectionStart = dom.codeInput.selectionEnd = s + 2;
      updateLineNums();
    }
  });

  // --- FOLDER UPLOAD ---
  dom.browseFolderBtn.addEventListener('click', () => dom.folderInput.click());
  dom.folderInput.addEventListener('change', e => { if (e.target.files.length) handleFolderUpload(e.target.files); });

  // Drag and drop
  dom.dropZone.addEventListener('click', () => dom.folderInput.click());
  dom.dropZone.addEventListener('dragover', e => { e.preventDefault(); dom.dropZone.classList.add('dragover'); });
  dom.dropZone.addEventListener('dragleave', () => dom.dropZone.classList.remove('dragover'));
  dom.dropZone.addEventListener('drop', e => {
    e.preventDefault();
    dom.dropZone.classList.remove('dragover');
    if (e.dataTransfer.files.length) handleFolderUpload(e.dataTransfer.files);
  });

  // Scan all
  dom.scanAllBtn.addEventListener('click', scanAllFiles);

  // Download fixed
  dom.downloadFixedBtn.addEventListener('click', downloadFixedProject);

  // Console branding
  console.log('%cCodeScan 2.0 🚀', 'background:linear-gradient(135deg,#7c3aed,#2563eb);color:#fff;padding:6px 16px;border-radius:8px;font-size:16px;font-weight:bold');
}

document.addEventListener('DOMContentLoaded', init);
