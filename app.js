
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
  let md = `# ${title}\n\n`;

  // Info
  const fields = [
    ['Date', d.info.date], ['Location', d.info.location], ['Seller', d.info.seller],
    ['Asking Price', d.info.price], ['VIN', d.info.vin], ['Mileage', d.info.mileage]
  ];
  const infoLines = fields.filter(f => f[1]).map(f => `**${f[0]}:** ${f[1]}`);
  if (infoLines.length) md += infoLines.join('  \n') + '\n\n';

  // Stats
  md += `> **${d.stats.ok}** passed · **${d.stats.issues}** issues · **${d.stats.pending}** pending · **${d.stats.na}** N/A\n\n`;

  // Issues summary
  const issueSections = d.sections.filter(s => s.items.some(it => it.status === 'issue'));
  if (issueSections.length) {
    md += '## Issues Found\n\n';
    for (const s of issueSections) {
      md += `### ${s.title}\n`;
      for (const it of s.items.filter(it => it.status === 'issue')) {
        md += `- ${it.critical ? '🔴 ' : ''}${it.text}`;
        if (it.note) md += ` — *${it.note}*`;
        if (it.input) md += ` (${it.input})`;
        md += '\n';
      }
      md += '\n';
    }
  }

  // Full checklist
  md += '## Full Checklist\n\n';
  for (const s of d.sections) {
    md += `### ${s.title}\n`;
    for (const it of s.items) {
      md += `- [${it.status === 'ok' ? 'x' : ' '}] ${statusSymbol(it.status)} ${it.critical ? '🔴 ' : ''}${it.text}`;
      if (it.input) md += ` — ${it.input}`;
      if (it.note) md += ` — *${it.note}*`;
      md += '\n';
    }
    md += '\n';
  }

  // Summary fields
  const sf = d.summary;
  if (sf.condition || sf.action || sf.majorIssues || sf.minorIssues || sf.repairCosts) {
    md += '## Assessment\n\n';
    if (sf.condition) md += `**Overall Condition:** ${sf.condition}  \n`;
    if (sf.action) md += `**Recommended Action:** ${sf.action}  \n`;
    if (sf.majorIssues) md += `**Major Issues:** ${sf.majorIssues}  \n`;
    if (sf.minorIssues) md += `**Minor Issues:** ${sf.minorIssues}  \n`;
    if (sf.repairCosts) md += `**Estimated Repair Costs:** ${sf.repairCosts}  \n`;
  }

  const filename = (title.replace(/[^a-zA-Z0-9 _-]/g, '') || 'inspection') + '.md';
  downloadBlob(new Blob([md], { type: 'text/markdown' }), filename);
  showToast('Markdown exported');
}

// ---- PDF EXPORT (with photos) ----
async function exportPDF() {
  showToast('Generating PDF…', false, 10000);
  const d = gatherExportData();
  const title = d.info.name || 'RV Inspection';

  // Collect all photos grouped by item key
  const photoMap = {};
  try {
    const db = await openPhotoDB();
    await new Promise((resolve, reject) => {
      const tx = db.transaction('photos', 'readonly');
      const req = tx.objectStore('photos').openCursor();
      req.onsuccess = e => {
        const cursor = e.target.result;
        if (cursor) {
          const parts = cursor.key.split('_');
          parts.pop(); // remove index
          const itemKey = parts.join('_');
          if (!photoMap[itemKey]) photoMap[itemKey] = [];
          photoMap[itemKey].push(cursor.value);
          cursor.continue();
        } else resolve();
      };
      req.onerror = () => resolve();
    });
  } catch (e) { /* no photos, that's fine */ }

  // Build HTML document for printing to PDF
  const statusLabel = s => s === 'ok' ? '✓ OK' : s === 'issue' ? '✗ ISSUE' : s === 'na' ? '— N/A' : '○ Pending';
  const statusColor = s => s === 'ok' ? '#4caf50' : s === 'issue' ? '#ff5252' : s === 'na' ? '#888' : '#aaa';

  let html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${escHtml(title)}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 11px; color: #222; padding: 20px; max-width: 800px; margin: 0 auto; }
  h1 { font-size: 20px; margin-bottom: 4px; }
  .info { color: #555; margin-bottom: 12px; line-height: 1.6; }
  .stats { display: flex; gap: 16px; margin: 12px 0; font-weight: 600; font-size: 13px; }
  .stat-ok { color: #4caf50; } .stat-issue { color: #ff5252; } .stat-pending { color: #888; }
  h2 { font-size: 14px; margin: 16px 0 6px; padding-bottom: 3px; border-bottom: 2px solid #333; }
  h3 { font-size: 12px; margin: 10px 0 4px; color: #444; }
  .item { display: flex; align-items: baseline; gap: 6px; padding: 2px 0; page-break-inside: avoid; }
  .item-status { font-weight: 700; min-width: 18px; text-align: center; }
  .item-text { flex: 1; }
  .item-note { color: #555; font-style: italic; }
  .critical { font-weight: 700; }
  .critical::before { content: "🔴 "; }
  .photos { display: flex; flex-wrap: wrap; gap: 6px; margin: 4px 0 8px 24px; }
  .photos img { width: 120px; height: 90px; object-fit: cover; border-radius: 4px; border: 1px solid #ddd; }
  .assessment { margin-top: 16px; padding: 10px; background: #f5f5f5; border-radius: 6px; }
  .assessment p { margin: 3px 0; }
  .section-block { page-break-inside: avoid; }
  @media print { body { padding: 0; } }
</style></head><body>`;

  html += `<h1>${escHtml(title)}</h1>`;

  // Info line
  const infoItems = [];
  if (d.info.date) infoItems.push(d.info.date);
  if (d.info.location) infoItems.push(d.info.location);
  if (d.info.seller) infoItems.push('Seller: ' + d.info.seller);
  if (d.info.price) infoItems.push('Price: ' + d.info.price);
  if (d.info.vin) infoItems.push('VIN: ' + d.info.vin);
  if (d.info.mileage) infoItems.push('Mileage: ' + d.info.mileage);
  if (infoItems.length) html += `<div class="info">${infoItems.map(escHtml).join(' · ')}</div>`;

  // Stats bar
  html += `<div class="stats">
    <span class="stat-ok">✓ ${d.stats.ok} passed</span>
    <span class="stat-issue">✗ ${d.stats.issues} issues</span>
    <span class="stat-pending">○ ${d.stats.pending} pending</span>
  </div>`;

  // Issues summary
  const issueSections = d.sections.filter(s => s.items.some(it => it.status === 'issue'));
  if (issueSections.length) {
    html += '<h2>Issues Found</h2>';
    for (const s of issueSections) {
      html += `<h3>${escHtml(s.title)}</h3>`;
      for (const it of s.items.filter(it => it.status === 'issue')) {
        html += `<div class="item">
          <span class="item-status" style="color:${statusColor('issue')}">✗</span>
          <span class="item-text${it.critical ? ' critical' : ''}">${escHtml(it.text)}`;
        if (it.note) html += ` <span class="item-note">— ${escHtml(it.note)}</span>`;
        if (it.input) html += ` <span class="item-note">(${escHtml(it.input)})</span>`;
        html += '</span></div>';
        if (photoMap[it.key]?.length) {
          html += '<div class="photos">' + photoMap[it.key].map(src => `<img src="${src}">`).join('') + '</div>';
        }
      }
    }
  }

  // Full checklist with photos
  html += '<h2>Full Checklist</h2>';
  for (const s of d.sections) {
    html += `<div class="section-block"><h3>${escHtml(s.title)}</h3>`;
    for (const it of s.items) {
      html += `<div class="item">
        <span class="item-status" style="color:${statusColor(it.status)}">${statusSymbol(it.status)}</span>
        <span class="item-text${it.critical ? ' critical' : ''}">${escHtml(it.text)}`;
      if (it.input) html += ` <span class="item-note">— ${escHtml(it.input)}</span>`;
      if (it.note) html += ` <span class="item-note">— ${escHtml(it.note)}</span>`;
      html += '</span></div>';
      if (photoMap[it.key]?.length) {
        html += '<div class="photos">' + photoMap[it.key].map(src => `<img src="${src}">`).join('') + '</div>';
      }
    }
    html += '</div>';
  }

  // Assessment
  const sf = d.summary;
  if (sf.condition || sf.action || sf.majorIssues || sf.minorIssues || sf.repairCosts) {
    html += '<div class="assessment"><h2 style="border:0;margin:0 0 6px">Assessment</h2>';
    if (sf.condition) html += `<p><strong>Overall Condition:</strong> ${escHtml(sf.condition)}</p>`;
    if (sf.action) html += `<p><strong>Recommended Action:</strong> ${escHtml(sf.action)}</p>`;
    if (sf.majorIssues) html += `<p><strong>Major Issues:</strong> ${escHtml(sf.majorIssues)}</p>`;
    if (sf.minorIssues) html += `<p><strong>Minor Issues:</strong> ${escHtml(sf.minorIssues)}</p>`;
    if (sf.repairCosts) html += `<p><strong>Estimated Repair Costs:</strong> ${escHtml(sf.repairCosts)}</p>`;
    html += '</div>';
  }

  html += '</body></html>';

  // Open print dialog in a new window — this produces a PDF on all platforms
  const printWin = window.open('', '_blank');
  if (!printWin) { showToast('Please allow popups to export PDF', true); return; }
  printWin.document.write(html);
  printWin.document.close();
  // Wait for images to load before triggering print
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

