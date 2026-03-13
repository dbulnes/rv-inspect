
// ====== TOAST ======
// In-app notification — replaces browser alert() calls
let toastTimer;
function showToast(msg, isWarn = false, duration = 2000) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'toast show' + (isWarn ? ' warn' : '');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), duration);
}

// ====== CONFIRM DIALOG ======
// In-app confirmation — replaces browser confirm() calls
function appConfirm(msg) {
  return new Promise(resolve => {
    const overlay = document.getElementById('confirmOverlay');
    document.getElementById('confirmMsg').textContent = msg;
    overlay.classList.add('show');
    const ok = document.getElementById('confirmOk');
    const cancel = document.getElementById('confirmCancel');
    ok.focus();
    function cleanup(result) {
      overlay.classList.remove('show');
      ok.removeEventListener('click', onOk);
      cancel.removeEventListener('click', onCancel);
      overlay.removeEventListener('click', onBg);
      document.removeEventListener('keydown', onKey);
      resolve(result);
    }
    function onOk() { cleanup(true); }
    function onCancel() { cleanup(false); }
    function onBg(e) { if (e.target === overlay) cleanup(false); }
    function onKey(e) { if (e.key === 'Escape') cleanup(false); }
    ok.addEventListener('click', onOk);
    cancel.addEventListener('click', onCancel);
    overlay.addEventListener('click', onBg);
    document.addEventListener('keydown', onKey);
  });
}

// ====== STATE ======
// state.info    — inspection metadata (name, date, location, seller, etc.)
// state.checks  — per-item check status keyed by "sectionId_itemIndex"
// state.notes   — per-item text notes, same key format
// state.inputs  — per-item measurement/input values (e.g. tire pressure)
// state.summary — overall condition, recommended action, cost notes
function freshState() { return { info: {}, checks: {}, notes: {}, inputs: {}, summary: {} }; }
let state = freshState();

// Tracks the currently-loaded named save so auto-save updates it too
let currentSaveName = null;

// ====== RENDER ======
// Builds the checklist UI from the SECTIONS array. Each section is a collapsible
// card with a badge showing progress. Items render as tappable check rows.
function renderSections() {
  const container = document.getElementById('sectionsContainer');
  container.innerHTML = '';
  SECTIONS.forEach(section => {
    const div = document.createElement('div');
    div.className = 'section';
    div.id = 'section_' + section.id;

    const itemCount = section.items.length;
    div.innerHTML = `
      <div class="section-header" onclick="toggleSection('${section.id}')">
        <div style="display:flex;align-items:center;gap:8px;flex:1;min-width:0">
          <span>${section.icon}</span>
          <h2 style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${section.title}</h2>
          ${section.priority ? '<span class="priority-tag">HIGH PRIORITY</span>' : ''}
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <span class="section-badge" id="badge_${section.id}">0/${itemCount}</span>
          <span class="section-chevron">▶</span>
        </div>
      </div>
      <div class="section-content" id="content_${section.id}">
        ${section.items.map((item, i) => renderItem(section.id, item, i)).join('')}
      </div>
    `;
    container.appendChild(div);
  });
  updateProgress();
}

function renderItem(sectionId, item, idx) {
  const key = `${sectionId}_${idx}`;
  const isObj = typeof item === 'object';
  const text = isObj ? item.text : item;
  const isCritical = isObj && item.critical;
  const hasInput = isObj && item.input;
  const inputLabel = isObj && item.inputLabel ? item.inputLabel : '';
  const checkState = state.checks[key] || 'unchecked';
  const noteVal = state.notes[key] || '';
  const inputVal = state.inputs[key] || '';

  let checkIcon = '';
  if (checkState === 'ok') checkIcon = '✓';
  else if (checkState === 'issue') checkIcon = '✗';
  else if (checkState === 'na') checkIcon = '—';

  let checkClass = '';
  if (checkState === 'ok') checkClass = 'checked';
  else if (checkState === 'issue') checkClass = 'issue';
  else if (checkState === 'na') checkClass = 'na';

  return `
    <div class="check-item ${isCritical && sectionId === 'red_flags' ? 'red-flag' : ''}">
      <div class="check-row">
        <div class="check-box ${checkClass}" onclick="cycleCheck('${key}')" id="box_${key}">${checkIcon}</div>
        <span class="check-label ${isCritical ? 'critical' : ''}" onclick="cycleCheck('${key}')">${text}</span>
      </div>
      ${hasInput ? `<input class="check-note visible" style="display:block" placeholder="${inputLabel}" value="${escHtml(inputVal)}" oninput="setInput('${key}',this.value)">` : ''}
      <div class="item-actions">
        <span class="note-toggle" onclick="toggleNote('${key}')">+ note</span>
        <span class="photo-toggle" onclick="capturePhoto('${key}')">📷 photo</span>
      </div>
      <div class="photo-thumbs" id="photos_${key}"></div>
      <textarea class="check-note ${noteVal ? 'visible' : ''}" id="note_${key}" placeholder="Add note..." oninput="setNote('${key}',this.value)">${escHtml(noteVal)}</textarea>
    </div>
  `;
}

function escHtml(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

// ====== INTERACTIONS ======
// Tap cycle: unchecked → ok (✓) → issue (✗) → na (—) → unchecked.
// Notes and measurement inputs are per-item, keyed by "sectionId_itemIndex".
function toggleSection(id) {
  document.getElementById('section_' + id).classList.toggle('open');
}

function cycleCheck(key) {
  const states = ['unchecked', 'ok', 'issue', 'na'];
  const cur = state.checks[key] || 'unchecked';
  const next = states[(states.indexOf(cur) + 1) % states.length];
  state.checks[key] = next;

  const box = document.getElementById('box_' + key);
  box.className = 'check-box';
  box.textContent = '';
  if (next === 'ok') { box.classList.add('checked'); box.textContent = '✓'; }
  else if (next === 'issue') { box.classList.add('issue'); box.textContent = '✗'; }
  else if (next === 'na') { box.classList.add('na'); box.textContent = '—'; }

  updateBadge(key.split('_').slice(0, -1).join('_'));
  updateProgress();
  autoSave();
}

function toggleNote(key) {
  const el = document.getElementById('note_' + key);
  el.classList.toggle('visible');
  if (el.classList.contains('visible')) el.focus();
}

function setNote(key, val) { state.notes[key] = val; autoSave(); }
function setInput(key, val) { state.inputs[key] = val; autoSave(); }

// ====== PHOTOS (IndexedDB) ======
// Photos are stored in IndexedDB (not localStorage) because images are too large.
// Each photo is resized to max 1200px and compressed to JPEG before storing.
// DB schema: object store "photos", key = "itemKey_index", value = dataUrl string
const PHOTO_DB_NAME = 'rv_inspect_photos';
const PHOTO_DB_VERSION = 1;
let photoDB = null;
let pendingPhotoKey = null;
let lightboxKey = null;
let lightboxIdx = null;

function openPhotoDB() {
  return new Promise((resolve, reject) => {
    if (photoDB) { resolve(photoDB); return; }
    const req = indexedDB.open(PHOTO_DB_NAME, PHOTO_DB_VERSION);
    req.onupgradeneeded = e => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('photos')) {
        db.createObjectStore('photos');
      }
    };
    req.onsuccess = e => { photoDB = e.target.result; resolve(photoDB); };
    req.onerror = () => reject(req.error);
  });
}

function resizeImage(file, maxDim = 800, quality = 0.6) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        const ratio = Math.min(maxDim / width, maxDim / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const c = document.createElement('canvas');
      c.width = width; c.height = height;
      c.getContext('2d').drawImage(img, 0, 0, width, height);
      resolve(c.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Failed to load image')); };
    img.src = url;
  });
}

function capturePhoto(key) {
  pendingPhotoKey = key;
  document.getElementById('photoInput').click();
}

document.getElementById('photoInput').addEventListener('change', async function() {
  if (!this.files.length || !pendingPhotoKey) return;
  try {
    const dataUrl = await resizeImage(this.files[0]);
    const db = await openPhotoDB();
    const photos = await getPhotosForKey(pendingPhotoKey);
    const idx = photos.length;
    const tx = db.transaction('photos', 'readwrite');
    tx.objectStore('photos').put(dataUrl, `${pendingPhotoKey}_${idx}`);
    tx.oncomplete = () => {
      renderThumbs(pendingPhotoKey);
      pushPhotoToCloud(pendingPhotoKey, idx, dataUrl);
    };
  } catch (e) { console.error('Photo capture error:', e); }
  this.value = '';
});

async function getPhotosForKey(key) {
  const db = await openPhotoDB();
  return new Promise(resolve => {
    const results = [];
    const tx = db.transaction('photos', 'readonly');
    const store = tx.objectStore('photos');
    const range = IDBKeyRange.bound(key + '_', key + '_\uffff');
    const req = store.openCursor(range);
    req.onsuccess = e => {
      const cursor = e.target.result;
      if (cursor) {
        const idx = parseInt(cursor.key.split('_').pop());
        results.push({ idx, dataUrl: cursor.value, dbKey: cursor.key });
        cursor.continue();
      } else {
        resolve(results.sort((a, b) => a.idx - b.idx));
      }
    };
    req.onerror = () => resolve([]);
  });
}

async function renderThumbs(key) {
  const el = document.getElementById('photos_' + key);
  if (!el) return;
  const photos = await getPhotosForKey(key);
  if (photos.length === 0) { el.innerHTML = ''; return; }
  el.innerHTML = photos.map(p =>
    `<img class="photo-thumb" src="${p.dataUrl}" onclick="openLightbox('${key}',${p.idx})">`
  ).join('');
}

function openLightbox(key, idx) {
  lightboxKey = key;
  lightboxIdx = idx;
  getPhotosForKey(key).then(photos => {
    const photo = photos.find(p => p.idx === idx);
    if (!photo) return;
    document.getElementById('lightboxImg').src = photo.dataUrl;
    document.getElementById('lightbox').classList.add('show');
  });
}

function closeLightbox(e) {
  if (e && e.target !== e.currentTarget && !e.target.classList.contains('lightbox-close')) return;
  document.getElementById('lightbox').classList.remove('show');
  lightboxKey = null; lightboxIdx = null;
}

async function deleteLightboxPhoto() {
  if (lightboxKey === null || lightboxIdx === null) return;
  if (!await appConfirm('Delete this photo?')) return;
  const db = await openPhotoDB();
  const tx = db.transaction('photos', 'readwrite');
  tx.objectStore('photos').delete(`${lightboxKey}_${lightboxIdx}`);
  const delKey = lightboxKey, delIdx = lightboxIdx;
  tx.oncomplete = () => {
    renderThumbs(delKey);
    deletePhotoFromCloud(delKey, delIdx);
    closeLightbox();
  };
}

// Load all thumbnails after sections are rendered
async function loadAllThumbs() {
  const db = await openPhotoDB();
  const tx = db.transaction('photos', 'readonly');
  const keys = new Set();
  const req = tx.objectStore('photos').openCursor();
  req.onsuccess = e => {
    const cursor = e.target.result;
    if (cursor) {
      // Extract the item key (everything except the last _N index)
      const parts = cursor.key.split('_');
      parts.pop();
      keys.add(parts.join('_'));
      cursor.continue();
    } else {
      keys.forEach(k => renderThumbs(k));
    }
  };
}

// ====== PHOTO CLOUD SYNC (Supabase Storage) ======
// Photos are uploaded to a Supabase Storage bucket named "inspection-photos".
// Path convention: {user_id}/{inspection_name}/{item_key}_{photo_index}.jpg
// IndexedDB remains the local cache; cloud sync happens in the background.
// Data URLs are converted to Blobs for upload and back for download.

function photoStoragePath(itemKey, idx) {
  const inspectionName = encodeURIComponent(currentSaveName || '__autosave__');
  return `${currentUser.id}/${inspectionName}/${itemKey}_${idx}.jpg`;
}

function dataUrlToBlob(dataUrl) {
  const [header, b64] = dataUrl.split(',');
  const mime = header.match(/:(.*?);/)[1];
  const bytes = atob(b64);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

async function pushPhotoToCloud(itemKey, idx, dataUrl) {
  if (!supabaseClient || !currentUser) return;
  try {
    const path = photoStoragePath(itemKey, idx);
    const blob = dataUrlToBlob(dataUrl);
    const { error } = await supabaseClient.storage
      .from('inspection-photos')
      .upload(path, blob, { contentType: 'image/jpeg', upsert: true });
    if (error) throw error;
  } catch (e) { console.error('Photo upload error:', e); }
}

async function deletePhotoFromCloud(itemKey, idx) {
  if (!supabaseClient || !currentUser) return;
  try {
    const path = photoStoragePath(itemKey, idx);
    await supabaseClient.storage.from('inspection-photos').remove([path]);
  } catch (e) { console.error('Photo cloud delete error:', e); }
}

async function pullPhotosFromCloud() {
  if (!supabaseClient || !currentUser) return;
  const inspectionName = encodeURIComponent(currentSaveName || '__autosave__');
  const folder = `${currentUser.id}/${inspectionName}`;
  try {
    const { data: files, error } = await supabaseClient.storage
      .from('inspection-photos').list(folder);
    if (error) throw error;
    if (!files || files.length === 0) return;

    const db = await openPhotoDB();
    const keysToRender = new Set();
    for (const file of files) {
      // Parse filename: {item_key}_{photo_index}.jpg
      const name = file.name.replace(/\.jpg$/, '');
      const parts = name.split('_');
      const idx = parseInt(parts.pop());
      const itemKey = parts.join('_');
      const dbKey = `${itemKey}_${idx}`;

      // Skip if already cached locally
      const existing = await new Promise(r => {
        const tx = db.transaction('photos', 'readonly');
        const req = tx.objectStore('photos').get(dbKey);
        req.onsuccess = () => r(req.result);
        req.onerror = () => r(null);
      });
      if (existing) continue;

      // Download and cache
      const { data: blob, error: dlErr } = await supabaseClient.storage
        .from('inspection-photos').download(`${folder}/${file.name}`);
      if (dlErr || !blob) continue;
      const dataUrl = await new Promise(r => {
        const reader = new FileReader();
        reader.onload = () => r(reader.result);
        reader.readAsDataURL(blob);
      });
      const tx = db.transaction('photos', 'readwrite');
      tx.objectStore('photos').put(dataUrl, dbKey);
      keysToRender.add(itemKey);
    }
    keysToRender.forEach(k => renderThumbs(k));
  } catch (e) { console.error('Photo cloud pull error:', e); }
}

async function pushAllPhotosToCloud() {
  if (!supabaseClient || !currentUser) return;
  const db = await openPhotoDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('photos', 'readonly');
    const uploads = [];
    const req = tx.objectStore('photos').openCursor();
    req.onsuccess = e => {
      const cursor = e.target.result;
      if (cursor) {
        const parts = cursor.key.split('_');
        const idx = parseInt(parts.pop());
        const itemKey = parts.join('_');
        uploads.push(pushPhotoToCloud(itemKey, idx, cursor.value));
        cursor.continue();
      } else {
        Promise.all(uploads).then(resolve).catch(reject);
      }
    };
    req.onerror = () => resolve();
  });
}

// ====== VIN BARCODE SCANNER ======
// Uses the BarcodeDetector API to read VIN barcodes (Code 39 / Code 128) from
// the device camera. On browsers without native support (iOS Safari/Chrome),
// a WASM-based polyfill is loaded on demand from CDN (~200KB, cached by SW).
let scannerStream = null;
let scannerAnimFrame = null;

async function ensureBarcodeDetector() {
  if ('BarcodeDetector' in window) return true;
  const status = document.getElementById('scannerStatus');
  if (status) status.textContent = 'Loading barcode scanner...';
  try {
    await import('https://cdn.jsdelivr.net/npm/barcode-detector@2/dist/es/polyfill.min.js');
    return 'BarcodeDetector' in window;
  } catch (e) {
    return false;
  }
}

// Generic barcode/QR scanner — accepts formats, a status message, and a callback.
// callback(rawValue) should return true to accept the result and stop scanning.
let scannerCallback = null;
async function startScan(formats, statusMsg, failMsg, callback) {
  const overlay = document.getElementById('scannerOverlay');
  const video = document.getElementById('scannerVideo');
  const status = document.getElementById('scannerStatus');
  scannerCallback = callback;
  overlay.classList.add('show');
  status.textContent = 'Loading scanner...';

  if (!(await ensureBarcodeDetector())) {
    status.textContent = failMsg;
    setTimeout(() => stopScan(), 2000);
    return;
  }

  try {
    scannerStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
    });
    video.srcObject = scannerStream;
    await video.play();
    status.textContent = statusMsg;

    const detector = new BarcodeDetector({ formats });
    const scan = async () => {
      if (!scannerStream) return;
      try {
        const barcodes = await detector.detect(video);
        if (barcodes.length > 0) {
          const value = barcodes[0].rawValue.trim();
          if (scannerCallback && scannerCallback(value)) {
            stopScan();
            return;
          }
        }
      } catch (e) {}
      scannerAnimFrame = requestAnimationFrame(scan);
    };
    scannerAnimFrame = requestAnimationFrame(scan);
  } catch (e) {
    status.textContent = 'Camera access denied.';
    setTimeout(() => stopScan(), 2000);
  }
}

function startVinScan() {
  startScan(['code_39', 'code_128'], 'Point camera at VIN barcode...', 'Barcode scanning not available. Please enter VIN manually.', value => {
    const vin = value.toUpperCase();
    if (vin.length >= 11) {
      const vinInput = document.querySelector('[data-info="vin"]');
      vinInput.value = vin;
      state.info.vin = vin;
      autoSave();
      return true;
    }
    return false;
  });
}

function stopScan() {
  if (scannerAnimFrame) cancelAnimationFrame(scannerAnimFrame);
  scannerAnimFrame = null;
  scannerCallback = null;
  if (scannerStream) {
    scannerStream.getTracks().forEach(t => t.stop());
    scannerStream = null;
  }
  document.getElementById('scannerVideo').srcObject = null;
  document.getElementById('scannerOverlay').classList.remove('show');
}

function updateBadge(sectionId) {
  const section = SECTIONS.find(s => s.id === sectionId);
  if (!section) return;
  const total = section.items.length;
  let done = 0, issues = 0;
  section.items.forEach((_, i) => {
    const s = state.checks[`${sectionId}_${i}`];
    if (s && s !== 'unchecked') done++;
    if (s === 'issue') issues++;
  });
  const badge = document.getElementById('badge_' + sectionId);
  badge.textContent = `${done}/${total}`;
  badge.className = 'section-badge';
  if (done === total && issues === 0) badge.classList.add('complete');
  else if (issues > 0) badge.classList.add('has-issues');
}

function updateProgress() {
  let total = 0, done = 0;
  SECTIONS.forEach(s => {
    s.items.forEach((_, i) => {
      total++;
      const st = state.checks[`${s.id}_${i}`];
      if (st && st !== 'unchecked') done++;
    });
  });
  const pct = total ? (done / total * 100) : 0;
  document.getElementById('progressFill').style.width = pct + '%';
  const saveLabel = currentSaveName ? ` — ${currentSaveName}` : '';
  document.getElementById('progressText').textContent = `${done} / ${total} (${Math.round(pct)}%)${saveLabel}`;
}

// ====== INFO FIELDS ======
// Bind each data-info input to state.info and auto-save on change.
// The "name" field also updates the app header title dynamically.
document.querySelectorAll('[data-info]').forEach(el => {
  el.addEventListener('input', () => {
    state.info[el.dataset.info] = el.value;
    if (el.dataset.info === 'name') {
      updateAppTitle();
      handleNameChange(el.value);
      return;
    }
    autoSave();
  });
});

function updateAppTitle() {
  const name = (state.info.name || '').trim();
  document.getElementById('appTitle').textContent = name ? '🏕️ ' + name : '🏕️ RV Inspect';
  document.title = name || 'RV Inspect';
}

function loadInfoFields() {
  document.querySelectorAll('[data-info]').forEach(el => {
    el.value = state.info[el.dataset.info] || '';
  });
  updateAppTitle();
}

// ====== SUMMARY ======
function showSummary() {
  switchView('summary', document.querySelectorAll('.nav-btn')[1]);
}

function buildSummary() {
  let total = 0, ok = 0, issues = 0, na = 0, pending = 0;
  const issueList = [];

  SECTIONS.forEach(s => {
    s.items.forEach((item, i) => {
      total++;
      const key = `${s.id}_${i}`;
      const st = state.checks[key] || 'unchecked';
      if (st === 'ok') ok++;
      else if (st === 'issue') {
        issues++;
        const text = typeof item === 'object' ? item.text : item;
        const note = state.notes[key] || '';
        issueList.push({ section: s.title, text, note });
      }
      else if (st === 'na') na++;
      else pending++;
    });
  });

  const statsEl = document.getElementById('summaryStats');
  statsEl.innerHTML = `
    <div class="stat-box stat-ok"><div class="stat-num">${ok}</div><div class="stat-label">Passed</div></div>
    <div class="stat-box stat-issue"><div class="stat-num">${issues}</div><div class="stat-label">Issues</div></div>
    <div class="stat-box stat-pending"><div class="stat-num">${pending}</div><div class="stat-label">Pending</div></div>
  `;

  const issuesEl = document.getElementById('summaryIssues');
  if (issueList.length) {
    issuesEl.innerHTML = `<h3>⚠️ Issues Found (${issueList.length})</h3>` +
      issueList.map(i => `<div class="summary-issue-item"><strong>${i.section}:</strong> ${i.text}${i.note ? ' — <em>' + escHtml(i.note) + '</em>' : ''}</div>`).join('');
  } else {
    issuesEl.innerHTML = '<p style="color:var(--ok);font-size:.85rem">No issues flagged yet.</p>';
  }

  // Condition radio
  const conditions = ['Excellent', 'Good', 'Fair', 'Poor'];
  document.getElementById('conditionGroup').innerHTML = conditions.map(c =>
    `<span class="radio-btn ${state.summary.condition === c ? (c === 'Poor' ? 'warn-selected' : 'selected') : ''}" onclick="setRadio('condition','${c}',this)">${c}</span>`
  ).join('');

  // Action radio
  const actions = ['Purchase as-is', 'Negotiate price', 'Request repairs', 'Walk away'];
  document.getElementById('actionGroup').innerHTML = actions.map(a =>
    `<span class="radio-btn ${state.summary.action === a ? (a === 'Walk away' ? 'warn-selected' : 'selected') : ''}" onclick="setRadio('action','${a}',this)">${a}</span>`
  ).join('');

  // Text fields
  document.querySelectorAll('[data-summary]').forEach(el => {
    el.value = state.summary[el.dataset.summary] || '';
    el.oninput = () => { state.summary[el.dataset.summary] = el.value; autoSave(); };
  });
}

function setRadio(field, value, el) {
  state.summary[field] = value;
  const warn = (value === 'Poor' || value === 'Walk away');
  el.parentElement.querySelectorAll('.radio-btn').forEach(b => b.className = 'radio-btn');
  el.classList.add(warn ? 'warn-selected' : 'selected');
  autoSave();
}

// Gather all inspection data into a structured object for export
function gatherExportData() {
  const info = state.info;
  let ok = 0, issues = 0, pending = 0, na = 0;
  SECTIONS.forEach(s => s.items.forEach((_, i) => {
    const st = state.checks[`${s.id}_${i}`] || 'unchecked';
    if (st === 'ok') ok++;
    else if (st === 'issue') issues++;
    else if (st === 'na') na++;
    else pending++;
  }));

  const sections = SECTIONS.map(s => {
    const items = s.items.map((item, i) => {
      const key = `${s.id}_${i}`;
      const text = typeof item === 'object' ? item.text : item;
      const status = state.checks[key] || 'unchecked';
      const note = state.notes[key] || '';
      const input = state.inputs[key] || '';
      const critical = typeof item === 'object' && item.critical;
      return { key, text, status, note, input, critical };
    });
    return { id: s.id, title: s.title, items };
  });

  return { info, stats: { ok, issues, pending, na }, sections, summary: state.summary };
}

// Status symbols for text/markdown
function statusSymbol(s) {
  return s === 'ok' ? '✓' : s === 'issue' ? '✗' : s === 'na' ? '—' : '○';
}

// ---- MARKDOWN EXPORT (no photos) ----
function exportMarkdown() {
  const d = gatherExportData();
  const title = d.info.name || 'RV Inspection';
  const total = d.stats.ok + d.stats.issues + d.stats.pending + d.stats.na;
  let md = `# ${title}\n\n`;

  // Info table
  const fields = [
    ['Date', d.info.date], ['Location', d.info.location], ['Seller', d.info.seller],
    ['Asking Price', d.info.price], ['VIN', d.info.vin], ['Mileage', d.info.mileage]
  ].filter(f => f[1]);
  if (fields.length) {
    md += '| | |\n|---|---|\n';
    for (const [k, v] of fields) md += `| **${k}** | ${v} |\n`;
    md += '\n';
  }

  // Stats
  const pct = n => total ? (n / total * 100).toFixed(0) + '%' : '0%';
  md += `> **${d.stats.ok}** passed (${pct(d.stats.ok)}) · **${d.stats.issues}** issues · **${d.stats.pending}** pending · **${d.stats.na}** N/A\n\n`;

  // Assessment (up front, like the PDF)
  const sf = d.summary;
  if (sf.condition || sf.action || sf.majorIssues || sf.minorIssues || sf.repairCosts) {
    md += '## Assessment\n\n';
    if (sf.condition) md += `- **Overall Condition:** ${sf.condition}\n`;
    if (sf.action) md += `- **Recommended Action:** ${sf.action}\n`;
    if (sf.repairCosts) md += `- **Est. Repair Costs:** ${sf.repairCosts}\n`;
    md += '\n';
    if (sf.majorIssues) md += `**Major Issues:** ${sf.majorIssues}\n\n`;
    if (sf.minorIssues) md += `**Minor Issues:** ${sf.minorIssues}\n\n`;
  }

  // Issues table
  const allIssues = [];
  d.sections.forEach(s => s.items.forEach(it => {
    if (it.status === 'issue') allIssues.push({ section: s.title, ...it });
  }));
  if (allIssues.length) {
    md += `## Issues Found (${allIssues.length})\n\n`;
    md += '| Section | Item | Notes |\n|---|---|---|\n';
    for (const it of allIssues) {
      const notes = [it.input, it.note].filter(Boolean).join(' · ');
      md += `| ${it.section} | ${it.critical ? '**' : ''}${it.text}${it.critical ? '**' : ''} | ${notes ? '*' + notes + '*' : '—'} |\n`;
    }
    md += '\n';
  }

  // Full checklist — sections with per-section stats
  md += '---\n\n## Full Checklist\n\n';
  for (const s of d.sections) {
    const st = { ok: 0, issue: 0, pending: 0 };
    s.items.forEach(it => {
      if (it.status === 'ok') st.ok++;
      else if (it.status === 'issue') st.issue++;
      else if (it.status !== 'na') st.pending++;
    });
    const tag = st.issue ? ` — ${st.issue} issue${st.issue > 1 ? 's' : ''}` : '';
    md += `### ${s.title}  \n`;
    md += `*${st.ok}/${s.items.length} passed${tag}*\n\n`;
    for (const it of s.items) {
      const sym = it.status === 'ok' ? 'x' : ' ';
      const prefix = it.status === 'issue' ? '**' : '';
      const suffix = it.status === 'issue' ? '**' : '';
      md += `- [${sym}] ${prefix}${it.critical ? '\\[!\\] ' : ''}${it.text}${suffix}`;
      const meta = [it.input, it.note].filter(Boolean).join(' · ');
      if (meta) md += ` — *${meta}*`;
      if (it.status === 'na') md += ' *(N/A)*';
      md += '\n';
    }
    md += '\n';
  }

  // Footer
  md += `---\n*Generated ${new Date().toLocaleDateString()} · RV Inspect*\n`;

  const filename = (title.replace(/[^a-zA-Z0-9 _-]/g, '') || 'inspection') + '.md';
  downloadBlob(new Blob([md], { type: 'text/markdown' }), filename);
  showToast('Markdown exported');
}

// ---- PDF EXPORT (with photos) ----
async function exportPDF() {
  showToast('Generating PDF…', false, 10000);
  const d = gatherExportData();
  const title = d.info.name || 'RV Inspection';
  const total = d.stats.ok + d.stats.issues + d.stats.pending + d.stats.na;

  // Collect all photos grouped by item key
  const photoMap = {};
  try {
    const db = await openPhotoDB();
    await new Promise((resolve) => {
      const tx = db.transaction('photos', 'readonly');
      const req = tx.objectStore('photos').openCursor();
      req.onsuccess = e => {
        const cursor = e.target.result;
        if (cursor) {
          const parts = cursor.key.split('_');
          parts.pop();
          const itemKey = parts.join('_');
          if (!photoMap[itemKey]) photoMap[itemKey] = [];
          photoMap[itemKey].push(cursor.value);
          cursor.continue();
        } else resolve();
      };
      req.onerror = () => resolve();
    });
  } catch (e) { /* no photos */ }

  // Per-section stats
  function sectionStats(s) {
    let ok = 0, issue = 0, na = 0, pending = 0;
    s.items.forEach(it => {
      if (it.status === 'ok') ok++;
      else if (it.status === 'issue') issue++;
      else if (it.status === 'na') na++;
      else pending++;
    });
    return { ok, issue, na, pending, total: s.items.length };
  }

  const statusPill = (status) => {
    const map = {
      ok: { bg: '#e8f5e9', fg: '#2e7d32', label: 'PASS' },
      issue: { bg: '#fce4ec', fg: '#c62828', label: 'ISSUE' },
      na: { bg: '#f5f5f5', fg: '#757575', label: 'N/A' },
      unchecked: { bg: '#fff3e0', fg: '#e65100', label: 'TODO' }
    };
    const s = map[status] || map.unchecked;
    return `<span style="display:inline-block;font-size:9px;font-weight:700;letter-spacing:.5px;padding:2px 7px;border-radius:3px;background:${s.bg};color:${s.fg}">${s.label}</span>`;
  };

  const progressBar = (stats) => {
    const pOk = (stats.ok / stats.total * 100).toFixed(1);
    const pIssue = (stats.issue / stats.total * 100).toFixed(1);
    const pNa = (stats.na / stats.total * 100).toFixed(1);
    return `<div style="display:flex;height:4px;border-radius:2px;overflow:hidden;background:#eee;margin-top:6px">
      <div style="width:${pOk}%;background:#4caf50"></div>
      <div style="width:${pIssue}%;background:#ef5350"></div>
      <div style="width:${pNa}%;background:#bdbdbd"></div>
    </div>`;
  };

  let html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${escHtml(title)}</title>
<style>
  @page { margin: 16mm 14mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; font-size: 12px; color: #1a1a1a; line-height: 1.5; max-width: 780px; margin: 0 auto; -webkit-print-color-adjust: exact; print-color-adjust: exact; }

  /* Header */
  .header { border-bottom: 3px solid #1a1a1a; padding-bottom: 16px; margin-bottom: 20px; }
  .header h1 { font-size: 26px; font-weight: 800; letter-spacing: -.5px; margin-bottom: 8px; }
  .info-grid { display: flex; flex-wrap: wrap; gap: 4px 20px; font-size: 11px; color: #555; }
  .info-grid dt { font-weight: 600; color: #333; }
  .info-grid dd { margin: 0; }
  .info-pair { display: flex; gap: 5px; }

  /* Stats cards */
  .stats-row { display: flex; gap: 12px; margin-bottom: 24px; }
  .stat-card { flex: 1; padding: 12px 14px; border-radius: 8px; text-align: center; }
  .stat-card .num { font-size: 28px; font-weight: 800; line-height: 1; }
  .stat-card .label { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: .8px; margin-top: 4px; }
  .stat-ok { background: #e8f5e9; color: #2e7d32; }
  .stat-issue { background: #fce4ec; color: #c62828; }
  .stat-pending { background: #fff3e0; color: #e65100; }
  .stat-na { background: #f5f5f5; color: #757575; }

  /* Overall progress */
  .progress-wrap { margin-bottom: 24px; }
  .progress-bar { display: flex; height: 8px; border-radius: 4px; overflow: hidden; background: #eee; }
  .progress-bar .ok { background: #4caf50; }
  .progress-bar .issue { background: #ef5350; }
  .progress-bar .na { background: #bdbdbd; }
  .progress-legend { display: flex; gap: 14px; margin-top: 6px; font-size: 10px; color: #777; }
  .progress-legend span::before { content: ''; display: inline-block; width: 8px; height: 8px; border-radius: 2px; margin-right: 4px; vertical-align: middle; }
  .legend-ok::before { background: #4caf50; }
  .legend-issue::before { background: #ef5350; }
  .legend-pending::before { background: #fff3e0; border: 1px solid #e65100; width: 6px; height: 6px; }
  .legend-na::before { background: #bdbdbd; }

  /* Issues alert */
  .issues-alert { background: #fce4ec; border: 1px solid #ef9a9a; border-radius: 8px; padding: 14px 16px; margin-bottom: 24px; page-break-inside: avoid; }
  .issues-alert h2 { font-size: 14px; font-weight: 700; color: #b71c1c; margin-bottom: 10px; }
  .issues-alert .issue-row { display: flex; align-items: flex-start; gap: 8px; padding: 6px 0; border-top: 1px solid #f8bbd0; }
  .issues-alert .issue-row:first-of-type { border-top: none; }
  .issues-alert .issue-section { font-size: 10px; font-weight: 600; color: #c62828; text-transform: uppercase; letter-spacing: .3px; min-width: 100px; padding-top: 1px; }
  .issues-alert .issue-text { flex: 1; font-size: 12px; }
  .issues-alert .issue-note { color: #555; font-style: italic; font-size: 11px; }
  .issues-alert .issue-photos { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
  .issues-alert .issue-photos img { width: 100px; height: 75px; object-fit: cover; border-radius: 4px; border: 1px solid #ef9a9a; }

  /* Assessment */
  .assessment { background: linear-gradient(135deg, #e3f2fd, #f3e5f5); border-radius: 8px; padding: 16px; margin-bottom: 24px; page-break-inside: avoid; }
  .assessment h2 { font-size: 14px; font-weight: 700; margin-bottom: 8px; color: #1a1a1a; }
  .assessment-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .assessment-item { font-size: 11px; }
  .assessment-item .a-label { font-weight: 600; color: #555; font-size: 10px; text-transform: uppercase; letter-spacing: .3px; }
  .assessment-item .a-value { margin-top: 2px; }
  .assessment-full { grid-column: 1 / -1; }

  /* Section cards */
  .section { border: 1px solid #e0e0e0; border-radius: 8px; margin-bottom: 14px; overflow: hidden; page-break-inside: avoid; }
  .section-head { background: #fafafa; padding: 10px 14px; border-bottom: 1px solid #e0e0e0; display: flex; justify-content: space-between; align-items: center; }
  .section-head h3 { font-size: 13px; font-weight: 700; color: #1a1a1a; }
  .section-counts { display: flex; gap: 8px; font-size: 10px; font-weight: 600; }
  .section-count { padding: 2px 6px; border-radius: 3px; }
  .section-body { padding: 6px 0; }
  .item { display: flex; align-items: flex-start; gap: 10px; padding: 5px 14px; }
  .item:nth-child(even) { background: #fafafa; }
  .item-pill { flex-shrink: 0; margin-top: 1px; }
  .item-content { flex: 1; min-width: 0; }
  .item-text { font-size: 12px; }
  .item-critical { font-weight: 700; color: #c62828; }
  .item-critical::before { content: "\\26A0\\FE0F "; }
  .item-meta { font-size: 10.5px; color: #666; font-style: italic; margin-top: 1px; }
  .item-photos { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
  .item-photos img { width: 110px; height: 82px; object-fit: cover; border-radius: 5px; border: 1px solid #ddd; }

  /* Footer */
  .footer { margin-top: 24px; padding-top: 12px; border-top: 1px solid #ddd; font-size: 10px; color: #999; text-align: center; }

  @media print {
    body { padding: 0; }
    .section { break-inside: avoid; }
  }
</style></head><body>`;

  // ---- HEADER ----
  html += `<div class="header"><h1>${escHtml(title)}</h1><div class="info-grid">`;
  const infoFields = [
    ['Date', d.info.date], ['Location', d.info.location], ['Seller', d.info.seller],
    ['Asking Price', d.info.price], ['VIN', d.info.vin], ['Mileage', d.info.mileage]
  ];
  for (const [label, val] of infoFields) {
    if (val) html += `<div class="info-pair"><dt>${label}:</dt><dd>${escHtml(val)}</dd></div>`;
  }
  html += '</div></div>';

  // ---- STATS CARDS ----
  html += `<div class="stats-row">
    <div class="stat-card stat-ok"><div class="num">${d.stats.ok}</div><div class="label">Passed</div></div>
    <div class="stat-card stat-issue"><div class="num">${d.stats.issues}</div><div class="label">Issues</div></div>
    <div class="stat-card stat-pending"><div class="num">${d.stats.pending}</div><div class="label">Pending</div></div>
    <div class="stat-card stat-na"><div class="num">${d.stats.na}</div><div class="label">N/A</div></div>
  </div>`;

  // ---- OVERALL PROGRESS BAR ----
  if (total > 0) {
    const pOk = (d.stats.ok / total * 100).toFixed(1);
    const pIssue = (d.stats.issues / total * 100).toFixed(1);
    const pNa = (d.stats.na / total * 100).toFixed(1);
    html += `<div class="progress-wrap">
      <div class="progress-bar">
        <div class="ok" style="width:${pOk}%"></div>
        <div class="issue" style="width:${pIssue}%"></div>
        <div class="na" style="width:${pNa}%"></div>
      </div>
      <div class="progress-legend">
        <span class="legend-ok">Passed ${pOk}%</span>
        <span class="legend-issue">Issues ${pIssue}%</span>
        <span class="legend-pending">Pending</span>
        <span class="legend-na">N/A</span>
      </div>
    </div>`;
  }

  // ---- ASSESSMENT (before details, if filled) ----
  const sf = d.summary;
  if (sf.condition || sf.action || sf.majorIssues || sf.minorIssues || sf.repairCosts) {
    html += '<div class="assessment"><h2>Assessment</h2><div class="assessment-grid">';
    if (sf.condition) html += `<div class="assessment-item"><div class="a-label">Overall Condition</div><div class="a-value">${escHtml(sf.condition)}</div></div>`;
    if (sf.action) html += `<div class="assessment-item"><div class="a-label">Recommended Action</div><div class="a-value">${escHtml(sf.action)}</div></div>`;
    if (sf.repairCosts) html += `<div class="assessment-item"><div class="a-label">Est. Repair Costs</div><div class="a-value">${escHtml(sf.repairCosts)}</div></div>`;
    if (sf.majorIssues) html += `<div class="assessment-item assessment-full"><div class="a-label">Major Issues</div><div class="a-value">${escHtml(sf.majorIssues)}</div></div>`;
    if (sf.minorIssues) html += `<div class="assessment-item assessment-full"><div class="a-label">Minor Issues</div><div class="a-value">${escHtml(sf.minorIssues)}</div></div>`;
    html += '</div></div>';
  }

  // ---- ISSUES ALERT ----
  const allIssues = [];
  d.sections.forEach(s => s.items.forEach(it => {
    if (it.status === 'issue') allIssues.push({ section: s.title, ...it });
  }));
  if (allIssues.length) {
    html += `<div class="issues-alert"><h2>${allIssues.length} Issue${allIssues.length > 1 ? 's' : ''} Found</h2>`;
    for (const it of allIssues) {
      html += `<div class="issue-row">
        <div class="issue-section">${escHtml(it.section)}</div>
        <div>
          <div class="issue-text${it.critical ? ' item-critical' : ''}">${escHtml(it.text)}</div>`;
      if (it.note || it.input) {
        html += '<div class="issue-note">';
        if (it.note) html += escHtml(it.note);
        if (it.note && it.input) html += ' · ';
        if (it.input) html += escHtml(it.input);
        html += '</div>';
      }
      if (photoMap[it.key]?.length) {
        html += '<div class="issue-photos">' + photoMap[it.key].map(src => `<img src="${src}">`).join('') + '</div>';
      }
      html += '</div></div>';
    }
    html += '</div>';
  }

  // ---- SECTION CARDS ----
  for (const s of d.sections) {
    const st = sectionStats(s);
    html += `<div class="section"><div class="section-head"><div><h3>${escHtml(s.title)}</h3>${progressBar(st)}</div><div class="section-counts">`;
    if (st.ok) html += `<span class="section-count" style="background:#e8f5e9;color:#2e7d32">${st.ok} pass</span>`;
    if (st.issue) html += `<span class="section-count" style="background:#fce4ec;color:#c62828">${st.issue} issue</span>`;
    if (st.pending) html += `<span class="section-count" style="background:#fff3e0;color:#e65100">${st.pending} todo</span>`;
    html += '</div></div><div class="section-body">';
    for (const it of s.items) {
      html += `<div class="item"><div class="item-pill">${statusPill(it.status)}</div><div class="item-content">`;
      html += `<div class="item-text${it.critical ? ' item-critical' : ''}">${escHtml(it.text)}</div>`;
      if (it.note || it.input) {
        html += '<div class="item-meta">';
        if (it.input) html += escHtml(it.input);
        if (it.input && it.note) html += ' · ';
        if (it.note) html += escHtml(it.note);
        html += '</div>';
      }
      if (photoMap[it.key]?.length) {
        html += '<div class="item-photos">' + photoMap[it.key].map(src => `<img src="${src}">`).join('') + '</div>';
      }
      html += '</div></div>';
    }
    html += '</div></div>';
  }

  // ---- FOOTER ----
  html += `<div class="footer">Generated ${new Date().toLocaleDateString()} · RV Inspect</div>`;

  html += '</body></html>';

  // Open print dialog in a new window
  const printWin = window.open('', '_blank');
  if (!printWin) { showToast('Please allow popups to export PDF', true); return; }
  printWin.document.write(html);
  printWin.document.close();
  const images = printWin.document.querySelectorAll('img');
  const loaded = images.length ? Promise.all(Array.from(images).map(img =>
    img.complete ? Promise.resolve() : new Promise(r => { img.onload = r; img.onerror = r; })
  )) : Promise.resolve();
  await loaded;
  showToast('Opening print dialog…', false, 3000);
  printWin.print();
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ====== VIEW SWITCHING ======
function switchView(view, btn) {
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  document.getElementById('viewChecklist').classList.toggle('active', view === 'checklist');
  const summary = document.getElementById('summaryCard');
  summary.classList.toggle('active', view === 'summary');
  summary.classList.toggle('visible', view === 'summary');

  if (view === 'summary') buildSummary();
}

