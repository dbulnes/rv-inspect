// ====== CHECKLIST DATA ======
// Each section has: id (unique key), title, icon, optional priority flag, and items[].
// Items can be plain strings or objects with {text, critical, input, inputLabel}.
const SECTIONS = [
  {
    id: 'ext_body', title: 'Fiberglass Body & Structure', icon: '🏠',
    items: [
      'Check entire exterior for delamination (bulges/bubbles)',
      'Inspect all seams and joints for proper caulking',
      'Examine for cracks, dents, or stress fractures',
      'Look for paint fading or discoloration',
      'Check corners and edges for separation',
      {text: 'CRITICAL: Check for any signs of roof leaks (common issue)', critical: true}
    ]
  },
  {
    id: 'roof', title: 'Roof System', icon: '🔝', priority: true,
    items: [
      'Inspect entire roof membrane for cracks, tears, or punctures',
      'Check all roof penetrations (vents, AC, antenna) for proper sealing',
      'Verify condition of roof-mounted AC unit',
      'Look for soft spots or sponginess (water intrusion)',
      'Check rubber roof material condition',
      'Inspect roof ladder mounting points'
    ]
  },
  {
    id: 'windows_doors', title: 'Windows & Doors', icon: '🪟',
    items: [
      'Test all windows open/close smoothly',
      'Check all window seals and weatherstripping',
      'Verify window latches and locks function',
      'Note: Windows are single-pane (less insulation)',
      'Check bedroom window crank (prone to failure)',
      'Verify entry door seal is intact',
      'Test door locks, latches, and deadbolt',
      'Check door alignment',
      'Inspect screen door and latch'
    ]
  },
  {
    id: 'tires', title: 'Tires & Wheels', icon: '🛞',
    items: [
      {text: 'Tire 1 DOT date / Condition', input: true, inputLabel: 'DOT date & condition'},
      {text: 'Tire 2 DOT date / Condition', input: true, inputLabel: 'DOT date & condition'},
      'Check for uneven wear, dry rot, sidewall cracks',
      {text: 'Verify tire pressure', input: true, inputLabel: 'L: ___ psi  R: ___ psi'},
      'Check tread depth (min 4/32")',
      'Inspect wheel bearings for play',
      'Check lug nuts for proper torque',
      'Examine brakes and pads',
      'Test electric brake connection'
    ]
  },
  {
    id: 'frame', title: 'Frame & Undercarriage', icon: '🔩',
    items: [
      'Inspect frame rails for rust or corrosion',
      'Check axles for alignment and damage',
      'Examine suspension components',
      'Check hitch and tongue area structure',
      'Test all four stabilizer jacks',
      'Test electric tongue jack operation',
      'Check battery box mounting',
      'Inspect underbelly liner for holes or tears',
      'Verify all mounting hardware secure'
    ]
  },
  {
    id: 'hitch', title: 'Hitch & Towing Components', icon: '🔗',
    items: [
      'Inspect hitch coupler (2-5/16" ball)',
      'Test coupler latch mechanism',
      'Check safety chains and mounting points',
      'Test breakaway switch and cable',
      'Test brake lights',
      'Test turn signals (left and right)',
      'Test running lights',
      'Test reverse lights',
      'Test 7-pin connector with tow vehicle'
    ]
  },
  {
    id: 'awning', title: 'Awning System', icon: '⛱️',
    items: [
      'Fully extend awning - operates smoothly',
      'Check fabric for tears, mildew, fading',
      'Test LED lighting in awning',
      'Test awning motor and controller',
      'Check awning wiring cover (prone to falling off)',
      'Verify mounting hardware secure',
      'Check arms extend and lock properly',
      'Test wind sensor if equipped'
    ]
  },
  {
    id: 'storage', title: 'Storage Compartments', icon: '📦',
    items: [
      'Open and test all exterior compartment latches',
      'Check for water stains or rust inside',
      'Verify doors seal properly',
      'Check hinges and gas struts',
      'Check propane compartment ventilation',
      'Test outdoor shower hose',
      'Check dump valve access'
    ]
  },
  {
    id: 'water_damage', title: 'Water Damage (Interior)', icon: '💧', priority: true,
    items: [
      {text: 'CRITICAL: Inspect entire ceiling for stains/soft spots', critical: true},
      'Check walls around all windows for moisture',
      {text: 'CRITICAL: Press floor throughout - check for soft spots', critical: true},
      'Look under dinette for sawdust (moisture damage)',
      'Look under bed for sawdust',
      'Check all corners and seams for separation',
      'Check cabinetry for water damage or swelling',
      'Check walls for proper attachment',
      {text: 'Moisture meter reading (if available)', input: true, inputLabel: 'Reading'}
    ]
  },
  {
    id: 'plumbing', title: 'Plumbing System', icon: '🚿',
    items: [
      'Check under kitchen sink - plumbing connections (common factory defect)',
      'Check under bathroom sink - plumbing connections',
      'Look for sawdust around sink plumbing',
      'Test kitchen sink faucet hot and cold',
      'Check kitchen faucet nozzle (prone to breakage)',
      'Test bathroom sink faucet hot and cold',
      'Check bathroom hot water knob (plastic, prone to breaking)',
      'Test shower on/off valve (common failure point)',
      'Turn on water pump - listen for proper operation',
      'Check for leaks while pump running',
      'Verify pump cycles and builds pressure',
      'Test city water connection',
      'Test outdoor shower',
      'Test toilet flush mechanism',
      'Check toilet hoses (proper length, not bent/kinked)'
    ]
  },
  {
    id: 'water_heater', title: 'Water Heater System', icon: '🔥',
    items: [
      'Access panel under bathroom sink',
      'Check wiring connections secure (often loose from factory)',
      'Test main inlet valve (common failure)',
      'Test electric mode (120V) - heats properly',
      'Test propane mode - ignites and heats',
      {text: 'Check water temperature reaches 120-140°F', input: true, inputLabel: 'Temp °F'},
      'Check for leaks around tank and connections',
      'Check relief valve condition',
      'Test bypass valve operation'
    ]
  },
  {
    id: 'tanks', title: 'Tank Systems', icon: '🪣',
    items: [
      'Test black tank valve (known to bind/fail)',
      'Test gray tank valve',
      'Check protective liner underneath',
      'Test tank sensors (if equipped)',
      'Check dump hose condition',
      'Check tank vent pipes on roof',
      'Look for leaks or staining around tanks'
    ]
  },
  {
    id: 'kitchen', title: 'Kitchen Appliances', icon: '🍳',
    items: [
      'Test refrigerator on electric mode (common cooling issues)',
      'Test refrigerator on propane mode',
      {text: 'Wait 2-4 hours - check temperature', input: true, inputLabel: 'Temp °F'},
      'Check refrigerator door seals and latches',
      'Check freezer cools adequately',
      'Test stove burner 1 on propane',
      'Test stove burner 2 on propane',
      'Test stove burner 3 on propane',
      'Check propane regulator (consistent flame)',
      'Test oven operation and temperature',
      'Test oven vent fan (fan blade secure on spindle)',
      'Test microwave/convection oven',
      'Check microwave door latch (opens while driving issue)',
      'Test range hood fan and light',
      'Test all kitchen cabinet/drawer mechanisms'
    ]
  },
  {
    id: 'climate', title: 'Climate Control', icon: '❄️',
    items: [
      'Test furnace on propane (inconsistency issues reported)',
      'Verify furnace ignites reliably',
      'Check airflow from all vents',
      'Run AC unit - verify cooling (13,500 BTU)',
      {text: 'Let AC run 15-20 min - temp drop', input: true, inputLabel: 'Temp drop °F'},
      'Listen for unusual AC noises',
      'Test all roof vents open/close',
      'Test fantastic fan (if equipped)',
      'Check all vent screens intact'
    ]
  },
  {
    id: 'electrical', title: 'Electrical System', icon: '⚡',
    items: [
      'Test ALL outlets with circuit tester (common power issues)',
      {text: 'Kitchen outlets', input: true, inputLabel: 'Status'},
      {text: 'Bathroom outlets', input: true, inputLabel: 'Status'},
      {text: 'Bedroom outlets', input: true, inputLabel: 'Status'},
      {text: 'Living area outlets', input: true, inputLabel: 'Status'},
      'Test converter/charger operation',
      'Test GFCI outlets and reset buttons',
      'Test all interior lights (LED flickering common)',
      'Test bathroom light specifically (frequent flickering)',
      'Verify 12V system functions',
      'Verify 120V system functions',
      {text: 'Test battery charging with multimeter', input: true, inputLabel: 'Voltage'},
      'Check battery condition and connections',
      'Check breaker panel - no tripped breakers',
      'Check for burnt wires or electrical smells',
      'Test USB charging ports',
      'Test all switches and dimmers'
    ]
  },
  {
    id: 'propane', title: 'Propane System', icon: '🔶',
    items: [
      'Test propane regulator at stove (pressure consistent)',
      'Check automatic changeover valve',
      'Inspect propane hoses (not too short or aggressively bent)',
      'Test propane detector alarm',
      'Check for propane smell',
      'Test stove on propane',
      'Test oven on propane',
      'Test water heater on propane',
      'Test furnace on propane',
      'Check propane tank mounting',
      'Check propane compartment ventilation',
      {text: 'Propane tank 1 cert date', input: true, inputLabel: 'Date'},
      {text: 'Propane tank 2 cert date', input: true, inputLabel: 'Date'}
    ]
  },
  {
    id: 'interior', title: 'Interior Features', icon: '🛋️',
    items: [
      'Test dinette table mechanisms',
      'Check cushion condition',
      'Open all cabinets - smooth operation',
      'Open all drawers - smooth operation',
      'Check pull-down shade holders (especially dinette - prone to loosening)',
      'Check window treatment mounting',
      'Test all cabinet latches',
      'Test bedroom vent fan',
      'Test TV mounting and connections',
      'Test AV system (AM/FM/CD/DVD/USB/Bluetooth)',
      'Inspect flooring for damage or stains',
      'Check upholstery for tears or stains'
    ]
  },
  {
    id: 'full_electrical', title: 'Full Electrical Test', icon: '🔌',
    items: [
      'Connect to 30-amp shore power',
      'Run AC + microwave + water heater simultaneously',
      'No breakers trip under load',
      {text: 'Check voltage at outlets (should be 110-120V)', input: true, inputLabel: 'Voltage'},
      {text: 'Check converter output (should be 13.2-13.8V)', input: true, inputLabel: 'Voltage'},
      'All systems maintain power'
    ]
  },
  {
    id: 'full_water', title: 'Full Water Test', icon: '💦',
    items: [
      'Connect to city water with pressure regulator',
      'Turn on all faucets - consistent pressure',
      'Water heater heats on electric',
      'Fill fresh water tank - test pump',
      'Run all fixtures simultaneously',
      'Check for any leaks throughout test'
    ]
  },
  {
    id: 'full_propane', title: 'Full Propane Test', icon: '🔥',
    items: [
      'Open propane tanks',
      'Test automatic changeover',
      'Run all propane appliances together',
      'No gas smell or hissing',
      'Propane detector stays quiet'
    ]
  },
  {
    id: 'docs', title: 'Documentation Review', icon: '📄',
    items: [
      'Request maintenance records',
      'Check warranty status (1-year limited from purchase date)',
      'Verify clean title - no liens/salvage',
      {text: 'VIN recall check', input: true, inputLabel: 'Results'},
      'Ask about winterization history',
      'Get list of modifications/repairs',
      'Obtain owner\'s manual and appliance manuals',
      'Review previous inspection reports (if any)'
    ]
  },
  {
    id: 'seller_q', title: 'Questions for Seller', icon: '🗣️',
    items: [
      {text: 'Has trailer ever leaked? Where? Repairs done?', input: true, inputLabel: 'Answer'},
      {text: 'Any warranty claims or repairs?', input: true, inputLabel: 'Answer'},
      {text: 'Storage method (covered/uncovered/climate-controlled)?', input: true, inputLabel: 'Answer'},
      {text: 'Maintenance performed (roof seal, bearings, etc.)?', input: true, inputLabel: 'Answer'},
      {text: 'Any known issues or concerns?', input: true, inputLabel: 'Answer'},
      {text: 'Reason for selling?', input: true, inputLabel: 'Answer'},
      {text: 'What\'s included (hoses, accessories)?', input: true, inputLabel: 'Answer'}
    ]
  },
  {
    id: 'red_flags', title: 'Red Flags - Dealbreakers', icon: '🚩', priority: true,
    items: [
      {text: 'Multiple roof leak locations', critical: true},
      {text: 'Plumbing with wrong fittings', critical: true},
      {text: 'Excessive sawdust under sinks', critical: true},
      {text: 'Black tank valve binding', critical: true},
      {text: 'Water heater not heating', critical: true},
      {text: 'Multiple appliance failures', critical: true},
      {text: 'Many broken plastic components', critical: true},
      {text: 'Severe LED flickering throughout', critical: true},
      {text: 'Improperly routed propane hoses', critical: true}
    ]
  },
  {
    id: 'tools', title: 'Tools Needed', icon: '🧰',
    items: [
      'Flashlight (bright LED)',
      'Multimeter or circuit tester',
      'Moisture meter (optional)',
      'Ladder for roof access',
      'Creeper or towel for undercarriage',
      'Camera/smartphone for photos',
      'This checklist',
      'Tire pressure gauge',
      'Level',
      'Gloves and knee pads'
    ]
  }
];

// ====== STATE ======
// state.info    — inspection metadata (name, date, location, seller, etc.)
// state.checks  — per-item check status keyed by "sectionId_itemIndex"
// state.notes   — per-item text notes, same key format
// state.inputs  — per-item measurement/input values (e.g. tire pressure)
// state.summary — overall condition, recommended action, cost notes
let state = { info: {}, checks: {}, notes: {}, inputs: {}, summary: {} };

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

function resizeImage(file, maxDim = 1200, quality = 0.7) {
  return new Promise(resolve => {
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
    img.src = url;
  });
}

function capturePhoto(key) {
  pendingPhotoKey = key;
  document.getElementById('photoInput').click();
}

document.getElementById('photoInput').addEventListener('change', async function() {
  if (!this.files.length || !pendingPhotoKey) return;
  const dataUrl = await resizeImage(this.files[0]);
  const db = await openPhotoDB();
  // Find next index for this key
  const photos = await getPhotosForKey(pendingPhotoKey);
  const idx = photos.length;
  const tx = db.transaction('photos', 'readwrite');
  tx.objectStore('photos').put(dataUrl, `${pendingPhotoKey}_${idx}`);
  tx.oncomplete = () => renderThumbs(pendingPhotoKey);
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
  if (!confirm('Delete this photo?')) return;
  const db = await openPhotoDB();
  const tx = db.transaction('photos', 'readwrite');
  tx.objectStore('photos').delete(`${lightboxKey}_${lightboxIdx}`);
  tx.oncomplete = () => {
    renderThumbs(lightboxKey);
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

// ====== VIN BARCODE SCANNER ======
// Uses the BarcodeDetector API (Chrome 83+, Safari 17.2+) to read VIN barcodes
// (Code 39 or Code 128) from the device camera. Falls back to manual entry.
let scannerStream = null;
let scannerAnimFrame = null;

async function startVinScan() {
  if (!('BarcodeDetector' in window)) {
    alert('Barcode scanning is not supported in this browser. Please enter the VIN manually.');
    return;
  }
  const overlay = document.getElementById('scannerOverlay');
  const video = document.getElementById('scannerVideo');
  const status = document.getElementById('scannerStatus');
  overlay.classList.add('show');
  status.textContent = 'Starting camera...';

  try {
    scannerStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
    });
    video.srcObject = scannerStream;
    await video.play();
    status.textContent = 'Point camera at VIN barcode...';

    const detector = new BarcodeDetector({ formats: ['code_39', 'code_128'] });
    const scan = async () => {
      if (!scannerStream) return;
      try {
        const barcodes = await detector.detect(video);
        if (barcodes.length > 0) {
          const vin = barcodes[0].rawValue.trim().toUpperCase();
          if (vin.length >= 11) {
            // VIN found — fill the field
            const vinInput = document.querySelector('[data-info="vin"]');
            vinInput.value = vin;
            state.info.vin = vin;
            autoSave();
            stopVinScan();
            return;
          }
        }
      } catch (e) {}
      scannerAnimFrame = requestAnimationFrame(scan);
    };
    scannerAnimFrame = requestAnimationFrame(scan);
  } catch (e) {
    status.textContent = 'Camera access denied. Please enter VIN manually.';
    setTimeout(() => stopVinScan(), 2000);
  }
}

function stopVinScan() {
  if (scannerAnimFrame) cancelAnimationFrame(scannerAnimFrame);
  scannerAnimFrame = null;
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
    if (el.dataset.info === 'name') updateAppTitle();
    autoSave();
  });
});

function updateAppTitle() {
  const name = (state.info.name || '').trim();
  document.getElementById('appTitle').textContent = name ? '🏕️ ' + name : '🏕️ Camper Trailer Inspector';
  document.title = name || 'Camper Trailer Inspector';
}

function loadInfoFields() {
  document.querySelectorAll('[data-info]').forEach(el => {
    if (state.info[el.dataset.info]) el.value = state.info[el.dataset.info];
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

function exportSummary() {
  const summaryTitle = (state.info.name || 'CAMPER TRAILER INSPECTION').toUpperCase();
  let text = `=== ${summaryTitle} SUMMARY ===\n\n`;

  // Info
  const info = state.info;
  if (info.date) text += `Date: ${info.date}\n`;
  if (info.location) text += `Location: ${info.location}\n`;
  if (info.seller) text += `Seller: ${info.seller}\n`;
  if (info.price) text += `Asking Price: ${info.price}\n`;
  if (info.vin) text += `VIN: ${info.vin}\n`;
  if (info.mileage) text += `Mileage: ${info.mileage}\n`;
  text += '\n';

  // Stats
  let ok = 0, issues = 0, pending = 0;
  SECTIONS.forEach(s => s.items.forEach((_, i) => {
    const st = state.checks[`${s.id}_${i}`] || 'unchecked';
    if (st === 'ok') ok++;
    else if (st === 'issue') issues++;
    else if (st === 'unchecked') pending++;
  }));
  text += `RESULTS: ${ok} passed | ${issues} issues | ${pending} pending\n\n`;

  // Issues by section
  const issuesBySection = {};
  SECTIONS.forEach(s => s.items.forEach((item, i) => {
    const key = `${s.id}_${i}`;
    if (state.checks[key] === 'issue') {
      if (!issuesBySection[s.title]) issuesBySection[s.title] = [];
      const t = typeof item === 'object' ? item.text : item;
      const note = state.notes[key] || '';
      issuesBySection[s.title].push(t + (note ? ` — ${note}` : ''));
    }
  }));

  if (Object.keys(issuesBySection).length) {
    text += '--- ISSUES FOUND ---\n';
    for (const [sec, items] of Object.entries(issuesBySection)) {
      text += `\n${sec}:\n`;
      items.forEach(i => text += `  ✗ ${i}\n`);
    }
    text += '\n';
  }

  // Notes
  const allNotes = [];
  SECTIONS.forEach(s => s.items.forEach((item, i) => {
    const key = `${s.id}_${i}`;
    if (state.notes[key]) {
      const t = typeof item === 'object' ? item.text : item;
      allNotes.push({ section: s.title, text: t, note: state.notes[key] });
    }
    if (state.inputs[key]) {
      const t = typeof item === 'object' ? item.text : item;
      allNotes.push({ section: s.title, text: t, note: state.inputs[key] });
    }
  }));

  if (allNotes.length) {
    text += '--- NOTES & MEASUREMENTS ---\n';
    allNotes.forEach(n => text += `${n.section} > ${n.text}: ${n.note}\n`);
    text += '\n';
  }

  // Summary fields
  if (state.summary.condition) text += `Overall Condition: ${state.summary.condition}\n`;
  if (state.summary.action) text += `Recommended Action: ${state.summary.action}\n`;
  if (state.summary.majorIssues) text += `Major Issues: ${state.summary.majorIssues}\n`;
  if (state.summary.minorIssues) text += `Minor Issues: ${state.summary.minorIssues}\n`;
  if (state.summary.repairCosts) text += `Estimated Repair Costs: ${state.summary.repairCosts}\n`;

  // Copy or share
  if (navigator.share) {
    navigator.share({ title: 'RV Inspection Summary', text }).catch(() => copyText(text));
  } else {
    copyText(text);
  }
}

function copyText(text) {
  navigator.clipboard.writeText(text).then(() => alert('Summary copied to clipboard!')).catch(() => {
    const ta = document.createElement('textarea');
    ta.value = text; document.body.appendChild(ta); ta.select();
    document.execCommand('copy'); document.body.removeChild(ta);
    alert('Summary copied to clipboard!');
  });
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

// ====== SAVE / LOAD ======
// localStorage keys:
//   rv_inspect_autosave — auto-saved state (updated on every change)
//   rv_inspect_saves    — { "name": { data: state, ts: timestamp }, ... }
// Named saves can be created, loaded, and deleted from the save modal.
// When a named save is loaded or created, currentSaveName is set so that
// subsequent auto-saves also update that named save automatically.
const STORAGE_KEY = 'rv_inspect_saves';
const AUTOSAVE_KEY = 'rv_inspect_autosave';

function autoSave() {
  localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(state));
  // If working on a named save, keep it updated too
  if (currentSaveName) {
    const saves = getSaves();
    saves[currentSaveName] = { data: JSON.parse(JSON.stringify(state)), ts: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saves));
  }
  debouncedCloudSync();
}

function autoLoad() {
  const data = localStorage.getItem(AUTOSAVE_KEY);
  if (data) {
    try { state = JSON.parse(data); } catch(e) {}
  }
}

function getSaves() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; }
}

function showSaveModal() {
  const saves = getSaves();
  const slotsEl = document.getElementById('saveSlots');
  const keys = Object.keys(saves).sort((a,b) => (saves[b].ts || 0) - (saves[a].ts || 0));

  let html = '';
  if (keys.length === 0) {
    html = '<p style="color:var(--text2);font-size:.85rem;padding:8px 0">No saved inspections yet.</p>';
  } else {
    html = '<p style="font-size:.7rem;color:var(--text2);text-transform:uppercase;letter-spacing:.5px;margin:8px 0 4px">Local Saves</p>';
    html += keys.map(k => {
      const s = saves[k];
      const d = s.ts ? new Date(s.ts).toLocaleString() : 'Unknown date';
      const safeName = escHtml(k).replace(/'/g, "\\'");
      return `
        <div class="save-slot">
          <div class="save-slot-name">${escHtml(k)}</div>
          <div class="save-slot-date">${d}</div>
          <div class="save-slot-actions">
            <button class="save-slot-btn" onclick="loadSave('${safeName}')">Load</button>
            <button class="save-slot-btn delete" onclick="deleteSave('${safeName}')">Delete</button>
          </div>
        </div>`;
    }).join('');
  }

  slotsEl.innerHTML = html + '<div id="cloudSaveSlots"></div>';
  const suggestedName = state.info.name || (state.info.location ? `${state.info.location} - ${state.info.date || 'Inspection'}` : '');
  document.getElementById('newSaveName').value = suggestedName;
  document.getElementById('saveModal').classList.add('show');

  // Fetch cloud saves
  loadCloudSavesIntoModal(keys);
}

async function loadCloudSavesIntoModal(localKeys) {
  const container = document.getElementById('cloudSaveSlots');
  if (!supabaseClient || !currentUser) return;

  container.innerHTML = '<p style="font-size:.75rem;color:var(--text2);padding:8px 0">Loading cloud saves...</p>';
  try {
    const { data, error } = await supabaseClient.from('inspections')
      .select('name,state,updated_at')
      .eq('user_id', currentUser.id)
      .neq('name', '__autosave__')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    if (!data || data.length === 0) {
      container.innerHTML = '';
      return;
    }

    // Find cloud-only saves (not in local)
    const cloudOnly = data.filter(d => !localKeys.includes(d.name));
    // Find saves that exist in both (show cloud badge)
    const synced = data.filter(d => localKeys.includes(d.name));

    let html = '';

    // Add cloud badge to synced local saves
    if (synced.length > 0) {
      synced.forEach(s => {
        const slot = document.querySelector(`[onclick*="loadSave('${escHtml(s.name).replace(/'/g, "\\'")}')"]`);
        if (slot) {
          const nameEl = slot.closest('.save-slot')?.querySelector('.save-slot-name');
          if (nameEl && !nameEl.querySelector('.cloud-badge')) {
            nameEl.insertAdjacentHTML('afterbegin', '<span style="font-size:.6rem;background:var(--accent);color:#fff;padding:1px 5px;border-radius:4px;margin-right:6px;vertical-align:middle">☁️</span>');
          }
        }
      });
    }

    if (cloudOnly.length > 0) {
      html += '<p style="font-size:.7rem;color:var(--text2);text-transform:uppercase;letter-spacing:.5px;margin:12px 0 4px">☁️ Cloud Only</p>';
      html += cloudOnly.map(cs => {
        const d = new Date(cs.updated_at).toLocaleString();
        const safeName = escHtml(cs.name).replace(/'/g, "\\'");
        return `
          <div class="save-slot" style="border-color:#2a3a5a">
            <div class="save-slot-name">${escHtml(cs.name)}</div>
            <div class="save-slot-date">${d}</div>
            <div class="save-slot-actions">
              <button class="save-slot-btn" onclick="loadCloudSave('${safeName}')">Load</button>
              <button class="save-slot-btn delete" onclick="deleteCloudOnlySave('${safeName}')">Delete</button>
            </div>
          </div>`;
      }).join('');
    }

    container.innerHTML = html;
  } catch (e) {
    console.error('Failed to load cloud saves:', e);
    container.innerHTML = '<p style="font-size:.75rem;color:var(--warn);padding:8px 0">Failed to load cloud saves.</p>';
  }
}

async function loadCloudSave(name) {
  if (!supabaseClient || !currentUser) return;
  if (!confirm(`Load "${name}" from cloud? Current unsaved progress will be lost.`)) return;
  try {
    const { data, error } = await supabaseClient.from('inspections')
      .select('state').eq('user_id', currentUser.id).eq('name', name).single();
    if (error) throw error;
    state = data.state;
    currentSaveName = name;
    autoSaveLocal();
    // Also save to local named saves
    const saves = getSaves();
    saves[name] = { data: JSON.parse(JSON.stringify(state)), ts: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saves));
    renderSections();
    loadInfoFields();
    SECTIONS.forEach(s => updateBadge(s.id));
    closeSaveModal();
  } catch (e) {
    console.error('Failed to load cloud save:', e);
    alert('Failed to load from cloud.');
  }
}

async function deleteCloudOnlySave(name) {
  if (!confirm(`Delete "${name}" from cloud?`)) return;
  await deleteSaveFromCloud(name);
  showSaveModal();
}

function closeSaveModal(e) {
  if (!e || e.target === e.currentTarget) {
    document.getElementById('saveModal').classList.remove('show');
  }
}

function saveNew() {
  const name = document.getElementById('newSaveName').value.trim();
  if (!name) { alert('Enter a name for this save'); return; }
  const saves = getSaves();
  saves[name] = { data: JSON.parse(JSON.stringify(state)), ts: Date.now() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saves));
  currentSaveName = name;
  pushSaveToCloud(name, state);
  closeSaveModal();
  alert('Saved!');
}

function loadSave(name) {
  if (!confirm(`Load "${name}"? Current unsaved progress will be lost.`)) return;
  const saves = getSaves();
  if (saves[name]) {
    state = JSON.parse(JSON.stringify(saves[name].data));
    currentSaveName = name;
    autoSave();
    renderSections();
    loadInfoFields();
    SECTIONS.forEach(s => updateBadge(s.id));
    closeSaveModal();
  }
}

function deleteSave(name) {
  if (!confirm(`Delete "${name}"?`)) return;
  const saves = getSaves();
  delete saves[name];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saves));
  deleteSaveFromCloud(name);
  showSaveModal();
}

function resetAll() {
  if (!confirm('Reset all progress?')) return;
  state = { info: {}, checks: {}, notes: {}, inputs: {}, summary: {} };
  currentSaveName = null;
  autoSave();
  renderSections();
  loadInfoFields();
}

// ====== CLOUD SYNC (SUPABASE) ======
// Offline-first: localStorage is always the source of truth. Supabase is optional.
// BYO model — users provide their own Supabase project URL and publishable key.
// Auth uses email magic links. State is stored as JSONB in an "inspections" table,
// one row per named save per user. Auto-save uses the reserved name "__autosave__".
// Changes are debounced (2s) before pushing to cloud. On load, cloud and local
// are reconciled with conflict detection (newer version wins, user chooses).
const BYO_CONFIG_KEY = 'rv_inspect_supabase';
let supabaseClient = null;
let currentUser = null;
let cloudSyncTimer = null;
let lastSyncTime = null;
let pendingCloudAutosave = null;

function loadBYOConfig() {
  try { return JSON.parse(localStorage.getItem(BYO_CONFIG_KEY)); } catch { return null; }
}

function saveBYOConfig() {
  const url = document.getElementById('byoUrl').value.trim();
  const key = document.getElementById('byoKey').value.trim();
  const msgEl = document.getElementById('byoMsg');
  if (!url || !key) {
    showCloudMsg(msgEl, 'Please enter both URL and publishable key.', true);
    return;
  }
  if (!url.includes('supabase')) {
    showCloudMsg(msgEl, 'URL should be a Supabase project URL.', true);
    return;
  }
  localStorage.setItem(BYO_CONFIG_KEY, JSON.stringify({ url, key }));
  showCloudMsg(msgEl, 'Saved! Connecting...', false);
  initSupabase();
}

function disconnectSupabase() {
  if (!confirm('Disconnect from Supabase? Local data will be kept.')) return;
  localStorage.removeItem(BYO_CONFIG_KEY);
  supabaseClient = null;
  currentUser = null;
  updateCloudUI();
  closeCloudModal();
}

function initSupabase() {
  const config = loadBYOConfig();
  if (!config) { updateCloudUI(); return; }
  try {
    supabaseClient = window.supabase.createClient(config.url, config.key);
    supabaseClient.auth.onAuthStateChange((event, session) => {
      currentUser = session?.user || null;
      updateCloudUI();
      if (currentUser) reconcileOnLoad();
    });
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      currentUser = session?.user || null;
      updateCloudUI();
      if (currentUser) reconcileOnLoad();
    });
    ensureTable();
  } catch (e) {
    console.error('Supabase init failed:', e);
    supabaseClient = null;
    updateCloudUI();
  }
}

async function ensureTable() {
  if (!supabaseClient) return;
  // Try a lightweight query; if table doesn't exist, create it via rpc
  const { error } = await supabaseClient.from('inspections').select('id').limit(1);
  if (error && error.code === '42P01') {
    // Table doesn't exist — guide user to create it
    const msgEl = document.getElementById('byoMsg');
    showCloudMsg(msgEl, 'Table "inspections" not found. Please run the SQL migration in your Supabase SQL Editor. See README for the schema.', true);
  }
}

// Auth
function sendMagicLink() {
  if (!supabaseClient) {
    const msgEl = document.getElementById('magicLinkMsg');
    showCloudMsg(msgEl, 'Connect your Supabase project first (see setup below).', true);
    return;
  }
  const email = document.getElementById('magicLinkEmail').value.trim();
  const msgEl = document.getElementById('magicLinkMsg');
  if (!email) { showCloudMsg(msgEl, 'Enter your email address.', true); return; }

  const redirectUrl = window.location.href.split('#')[0].split('?')[0];
  supabaseClient.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectUrl } })
    .then(({ error }) => {
      if (error) showCloudMsg(msgEl, error.message, true);
      else showCloudMsg(msgEl, 'Check your email for the magic link!', false);
    });
}

function signOut() {
  if (!supabaseClient) return;
  supabaseClient.auth.signOut().then(() => {
    currentUser = null;
    updateCloudUI();
  });
}

// UI
function showCloudModal() {
  const config = loadBYOConfig();
  if (config) {
    document.getElementById('byoUrl').value = config.url;
    document.getElementById('byoKey').value = config.key;
  }
  document.getElementById('cloudModal').classList.add('show');
  updateCloudUI();
}

function closeCloudModal(e) {
  if (!e || e.target === e.currentTarget) {
    document.getElementById('cloudModal').classList.remove('show');
  }
}

function showCloudMsg(el, msg, isError) {
  el.textContent = msg;
  el.className = 'cloud-msg visible' + (isError ? ' error' : '');
}

function updateCloudUI() {
  const loggedIn = document.getElementById('cloudLoggedIn');
  const loggedOut = document.getElementById('cloudLoggedOut');
  const dot = document.getElementById('syncDot');

  if (currentUser) {
    loggedIn.style.display = 'block';
    loggedOut.style.display = 'none';
    document.getElementById('cloudUserEmail').textContent = currentUser.email;
    if (lastSyncTime) {
      document.getElementById('cloudSyncStatus').textContent = 'Last synced: ' + new Date(lastSyncTime).toLocaleString();
    }
  } else {
    loggedIn.style.display = 'none';
    loggedOut.style.display = 'block';
  }

  if (!supabaseClient) { dot.className = 'sync-dot'; }
  else if (!currentUser) { dot.className = 'sync-dot'; }
}

function setSyncStatus(status) {
  const dot = document.getElementById('syncDot');
  dot.className = 'sync-dot ' + status;
}

// Sync
let debounceTimer = null;
function debouncedCloudSync() {
  if (!supabaseClient || !currentUser) return;
  clearTimeout(debounceTimer);
  setSyncStatus('pending');
  debounceTimer = setTimeout(() => cloudSync(), 2000);
}

async function cloudSync() {
  if (!supabaseClient || !currentUser) return;
  setSyncStatus('syncing');
  try {
    const { error } = await supabaseClient.from('inspections').upsert({
      user_id: currentUser.id,
      name: '__autosave__',
      state: state
    }, { onConflict: 'user_id,name' });
    if (error) throw error;
    // Also sync the current named save to cloud
    if (currentSaveName) {
      await pushSaveToCloud(currentSaveName, state);
    }
    lastSyncTime = Date.now();
    setSyncStatus('synced');
    updateCloudUI();
  } catch (e) {
    console.error('Cloud sync error:', e);
    setSyncStatus('error');
  }
}

function cloudSyncNow() {
  cloudSync();
  // Also sync all named saves
  const saves = getSaves();
  for (const [name, save] of Object.entries(saves)) {
    pushSaveToCloud(name, save.data);
  }
}

async function pushSaveToCloud(name, data) {
  if (!supabaseClient || !currentUser) return;
  try {
    await supabaseClient.from('inspections').upsert({
      user_id: currentUser.id,
      name: name,
      state: data
    }, { onConflict: 'user_id,name' });
  } catch (e) { console.error('Cloud push error:', e); }
}

async function deleteSaveFromCloud(name) {
  if (!supabaseClient || !currentUser) return;
  try {
    await supabaseClient.from('inspections').delete()
      .eq('user_id', currentUser.id).eq('name', name);
  } catch (e) { console.error('Cloud delete error:', e); }
}

async function reconcileOnLoad() {
  if (!supabaseClient || !currentUser) return;
  try {
    // Check cloud autosave
    const { data: cloudAuto } = await supabaseClient.from('inspections')
      .select('state,updated_at').eq('user_id', currentUser.id).eq('name', '__autosave__').single();

    if (cloudAuto) {
      const cloudTs = new Date(cloudAuto.updated_at).getTime();
      const localTs = (() => {
        try {
          const raw = localStorage.getItem(AUTOSAVE_KEY);
          if (!raw) return 0;
          // We don't store a timestamp in autosave, so compare with last known sync
          return lastSyncTime || 0;
        } catch { return 0; }
      })();

      // If we've never synced (fresh device), or cloud is newer, offer to load
      const localHasData = Object.keys(state.checks).length > 0;
      if (!lastSyncTime && localHasData && Object.keys(cloudAuto.state?.checks || {}).length > 0) {
        // Both have data, show conflict
        pendingCloudAutosave = cloudAuto.state;
        document.getElementById('conflictBanner').classList.add('visible');
      } else if (!localHasData && Object.keys(cloudAuto.state?.checks || {}).length > 0) {
        // Local is empty, just load cloud
        state = cloudAuto.state;
        autoSaveLocal();
        renderSections();
        loadInfoFields();
        SECTIONS.forEach(s => updateBadge(s.id));
      }
    }

    // Sync named saves from cloud to local
    const { data: cloudSaves } = await supabaseClient.from('inspections')
      .select('name,state,updated_at').eq('user_id', currentUser.id).neq('name', '__autosave__');

    if (cloudSaves && cloudSaves.length > 0) {
      const localSaves = getSaves();
      let updated = false;
      for (const cs of cloudSaves) {
        if (!localSaves[cs.name]) {
          localSaves[cs.name] = { data: cs.state, ts: new Date(cs.updated_at).getTime() };
          updated = true;
        }
      }
      // Push local-only saves to cloud
      for (const [name, save] of Object.entries(localSaves)) {
        if (!cloudSaves.find(cs => cs.name === name)) {
          pushSaveToCloud(name, save.data);
        }
      }
      if (updated) localStorage.setItem(STORAGE_KEY, JSON.stringify(localSaves));
    }

    lastSyncTime = Date.now();
    setSyncStatus('synced');
  } catch (e) {
    console.error('Reconcile error:', e);
    setSyncStatus('error');
  }
}

// Save to localStorage without triggering cloud sync (used during cloud load)
function autoSaveLocal() {
  localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(state));
}

function loadCloudAutosave() {
  if (pendingCloudAutosave) {
    state = pendingCloudAutosave;
    pendingCloudAutosave = null;
    autoSaveLocal();
    renderSections();
    loadInfoFields();
    SECTIONS.forEach(s => updateBadge(s.id));
  }
  document.getElementById('conflictBanner').classList.remove('visible');
}

function dismissConflict() {
  pendingCloudAutosave = null;
  document.getElementById('conflictBanner').classList.remove('visible');
  // Push local version to cloud
  cloudSync();
}

// Handle auth callback (magic link redirect)
function handleAuthCallback() {
  const hash = window.location.hash;
  if (hash && (hash.includes('access_token') || hash.includes('type=magiclink'))) {
    // Supabase client auto-detects the hash, but ensure we clean the URL
    setTimeout(() => {
      if (window.location.hash) {
        history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    }, 1000);
  }
}

// Online/offline listeners
window.addEventListener('online', () => {
  if (supabaseClient && currentUser) debouncedCloudSync();
});

// ====== INIT ======
autoLoad();
renderSections();
loadInfoFields();
SECTIONS.forEach(s => updateBadge(s.id));
openPhotoDB().then(() => loadAllThumbs()).catch(() => {});

// Init Supabase if configured
if (typeof window.supabase !== 'undefined') {
  handleAuthCallback();
  initSupabase();
}

// Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./service-worker.js').catch(() => {});
}
