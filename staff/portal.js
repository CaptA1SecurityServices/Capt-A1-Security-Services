/* Only the language preference persists; no tokens, guard data or drafts in storage. */
(function () {
  'use strict';
  const C = window.A1StaffCore, config = window.A1_STAFF_CONFIG;
  const I = window.A1StaffI18n, ui = I.phrase, join = I.join;
  const roleLabel = value => ui('role_' + value);
  const statusLabels = { DRAFT: ui('जानकारी अधूरी · Draft'), HR_REVIEW: ui('HR की जाँच बाकी'), APPROVED: ui('HR मंजूरी मिली'), ACTIVE: ui('काम कर रहे हैं'), EXIT_REQUESTED: ui('छोड़ने का अनुरोध'), FNF_PENDING: ui('काम बंद · भुगतान बाकी'), CLOSED: ui('हिसाब पूरा · Closed') };
  const labels = { name: ui('नाम · Name'), fatherName: ui('पिता का नाम'), dob: ui('जन्म तारीख'), mobile: ui('मोबाइल नंबर'), emergencyMobile: ui('आपातकालीन संपर्क'), education: ui('Qualification'), experience: ui('पहले का अनुभव'), address: ui('वर्तमान पता'), aadhaar: ui('आधार कार्ड'), pan: ui('PAN कार्ड'), passbook: ui('बैंक पासबुक'), selfie: ui('गार्ड की फोटो'), police: ui('पुलिस सत्यापन'), pf: ui('PF विवरण'), esi: ui('ESI विवरण'), uan: ui('UAN विवरण'), agreement: ui('हस्ताक्षर किया समझौता'), feeReceipt: ui('₹200 फीस की रसीद'), exitLetter: ui('छोड़ने का पत्र'), settlementStatement: ui('अंतिम हिसाब का विवरण'), settlementReceipt: ui('अंतिम भुगतान का प्रमाण') };
  let token = '', user, guard, activeTab = 'details', query = '', filter = '', offset = 0, busy = false, preview, queryTimer, searchGeneration = 0;
  let lastActivity = Date.now(), pendingRequest = null, uploadRetry = null;
  const app = document.getElementById('app'), account = document.getElementById('account');
  function node(tag, props = {}, children = []) { const n = document.createElement(tag); Object.entries(props).forEach(([k,v]) => { if (k === 'class') n.className = v; else if (k === 'text') I.bind(n, 'textContent', v); else if (k.startsWith('on')) n.addEventListener(k.slice(2), v); else if (k === 'checked' || k === 'disabled') n[k] = !!v; else if (I.isPhrase(v)) I.bind(n, k, v); else n.setAttribute(k, v); }); for (const c of children) n.append(typeof c === 'string' || I.isPhrase(c) ? I.text(c) : c); return n; }
  function button(text, fn, cls = '') { return node('button', { type: 'button', text, class: cls, onclick: fn }); }
  function showDialog(dialog) {
    dialog.prepend(node('div', { class: 'language-switch dialog-language', role: 'group', 'aria-label': 'Language / भाषा' }, ['hi','en'].map(lang => node('button', { type: 'button', 'data-language': lang, lang, 'aria-pressed': String(lang === I.language), text: lang === 'hi' ? 'हिन्दी' : 'English', onclick: () => setLanguage(lang, true) }))));
    document.body.append(dialog); dialog.showModal();
  }
  function notify(message, error) { const n = document.getElementById('notice'); n.className = 'notice' + (error ? ' error' : ''); I.bind(n, 'textContent', I.error(message)); clearTimeout(notify.timer); notify.timer = setTimeout(() => { I.bind(n, 'textContent', ''); n.className = ''; }, error ? 10000 : 5000); }
  async function api(path, options) {
    const r = await fetch(config.apiOrigin + path, { ...options, cache: 'no-store', credentials: 'omit', headers: { Authorization: 'Bearer ' + token, ...(options?.headers || {}) } });
    if (!r.ok) { const e = await r.json().catch(() => ({ message: ui('Connection interrupted. Retry the same action.') })); if (r.status === 401) signout(); const error = new Error(e.message); error.code = e.code; throw error; }
    return r;
  }
  async function call(action, data = {}, id, version, requestId = crypto.randomUUID()) {
    if (preview) return preview.call(action, data, id, version, requestId);
    const r = await api('/v1/command', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, data, guardId: id, version, requestId }) }); return (await r.json()).data;
  }
  async function task(fn) { if (busy) return; busy = true; document.querySelectorAll('button:not([data-language])').forEach(b => b.disabled = true); try { await fn(); } catch (e) { notify(e.message, true); } finally { busy = false; document.querySelectorAll('button:not([data-language])').forEach(b => b.disabled = false); } }
  async function change(action, data = {}) {
    const payload = JSON.stringify([action, data, guard.id, guard.version]);
    if (!pendingRequest || pendingRequest.payload !== payload) pendingRequest = { payload, id: crypto.randomUUID() };
    const r = await call(action, data, guard.id, guard.version, pendingRequest.id); pendingRequest = null; guard = r.guard; renderRecord(); notify(ui('सुरक्षित हो गया · Saved')); refreshRoster().catch(e => notify(e.message, true));
  }
  const canHR = () => ['HR', 'SUPER_ADMIN'].includes(user?.role);
  const canManager = () => ['MANAGER', 'HR', 'SUPER_ADMIN'].includes(user?.role);
  function field(label, key, value = '', type = 'text', hint = '', required = true, markRequired = required) {
    const input = type === 'textarea' ? node('textarea', { name: key, maxlength: '700', rows: '3' }) : type === 'checkbox' ? node('input', { name: key, type, checked: value }) : node('input', { name: key, type, value: String(value ?? ''), maxlength: type === 'email' ? '254' : '160' });
    if (required && type !== 'checkbox') input.required = true;
    if (type === 'tel') { input.inputMode = 'tel'; input.pattern = '(\\+91)?[6-9][0-9]{9}'; }
    if (type === 'number') { input.min = '0'; input.step = '0.01'; }
    if (key === 'experience') { input.step = '1'; input.max = '60'; I.bind(input, 'placeholder', ui('Experience years placeholder')); }
    if (key.startsWith('quantity_')) { input.step = '1'; input.min = '1'; }
    if (type === 'textarea') input.value = value;
    return node('label', { class: 'field' }, [markRequired && type !== 'checkbox' ? join(label, ' *') : label, input, ...(hint ? [node('span', { class: 'hint', text: hint })] : [])]);
  }
  function select(label, key, choices, value, markRequired = false) { const s = node('select', { name: key }, choices.map(([v,l]) => node('option', { value: v, text: l }))); s.value = value || choices[0][0]; return node('label', { class: 'field' }, [markRequired ? join(label, ' *') : label, s]); }
  function form(fields, submitText, fn) { const f = node('form', {}, [node('div', { class: 'formgrid' }, fields), node('div', { class: 'formfoot' }, [node('button', { type: 'submit', text: submitText, class: 'primary' })])]); f.addEventListener('submit', e => { e.preventDefault(); if (!f.reportValidity()) return; const values = Object.fromEntries(new FormData(f)); f.querySelectorAll('input[type=checkbox]').forEach(i => values[i.name] = i.checked); task(() => fn(values)); }); return f; }
  function amount(v) { const n = Number(v); C.requireThat(Number.isFinite(n) && n >= 0 && n <= 1000000, ui('Enter a valid rupee amount.')); return Math.round(n * 100); }
  function section(title, contents) { return node('section', { class: 'section' }, [node('h3', { text: title }), ...contents]); }
  async function login() { const r = await call('bootstrap'); user = r.user; guard = null; activeTab = 'details'; pendingRequest = null; uploadRetry = null; renderShell(); if (r.roster) renderRoster(r.roster); else await refreshRoster(); }
  function signout() { token = ''; user = null; guard = null; pendingRequest = null; uploadRetry = null; account.replaceChildren(); app.replaceChildren(node('section', { class: 'welcome' }, [node('h1', { text: ui('Signed out · साइन आउट') }), node('p', { text: ui('दोबारा साइन इन करने के लिए पेज खोलें।') }), button(ui('पेज फिर खोलें'), () => location.reload())])); }
  function renderShell() {
    account.replaceChildren(node('span', { text: roleLabel(user.role) }), button(ui('साइन आउट'), signout));
    const city = node('select', { 'aria-label': ui('Issuing city'), id: 'city' }, Object.keys(C.PREFIXES).filter(c => user.role === 'SUPER_ADMIN' || user.cities.includes(c)).map(c => node('option', { value: c, text: c === 'AJMER' ? ui('Ajmer · अजमेर') : ui('Jaipur · जयपुर') })));
    const employeeType = node('select', { 'aria-label': ui('Employee role') }, Object.keys(C.EMPLOYEE_TYPES).map(type => node('option', { value: type, text: ui('type_' + type) })));
    const actions = [city, employeeType, button(ui('+ नया कर्मचारी'), () => task(async () => { const payload = JSON.stringify(['create', city.value, employeeType.value]); if (!pendingRequest || pendingRequest.payload !== payload) pendingRequest = { payload, id: crypto.randomUUID() }; const r = await call('create', { city: city.value, employeeType: employeeType.value }, '', 0, pendingRequest.id); pendingRequest = null; guard = r.guard; activeTab = 'details'; renderRecord(); refreshRoster().catch(e => notify(e.message, true)); }), 'primary')];
    if (user.role === 'SUPER_ADMIN') actions.push(button(ui('Staff access'), () => task(manageUsers)));
    const search = node('input', { type: 'search', placeholder: ui('नाम, गार्ड ID या मोबाइल खोजें'), 'aria-label': ui('Search guards'), value: query, oninput: e => { query = e.target.value; offset = 0; clearTimeout(queryTimer); queryTimer = setTimeout(() => refreshRoster().catch(e => notify(e.message, true)), 350); } });
    const statuses = node('select', { 'aria-label': ui('Filter by status'), onchange: e => { filter = e.target.value; offset = 0; refreshRoster().catch(e => notify(e.message, true)); } }, [node('option', { value: '', text: ui('सभी गार्ड · All guards') }), ...C.STATES.map(s => node('option', { value: s, text: statusLabels[s] }))]); statuses.value = filter;
    app.replaceChildren(node('div', { class: 'workspace' }, [node('div', { class: 'pagehead' }, [node('div', {}, [node('p', { class: 'eyebrow', text: ui('PEOPLE & RECORDS') }), node('h1', { text: ui('Employee master register') })]), node('div', { class: 'actions' }, actions)]), node('div', { class: 'layout' }, [node('aside', { class: 'card roster' }, [node('div', { class: 'searchline' }, [search, statuses]), node('div', { id: 'rosterCount', class: 'count' }), node('div', { id: 'roster', class: 'rosteritems' }), node('div', { id: 'pages', class: 'actions' })]), node('section', { id: 'record', class: 'card', 'aria-label': ui('Employee record') }, [node('div', { class: 'empty', text: ui('Select an employee or click New employee.') })])]) ]));
    if (preview && !document.querySelector('.preview')) {
      const roles = node('select', { 'aria-label': ui('Preview role'), onchange: e => task(async () => { preview.switchRole(e.target.value); await login(); }) }, C.ROLES.map(r => node('option', { value: r, text: roleLabel(r) })));
      document.querySelector('.topbar').after(node('div', { class: 'preview' }, [node('span', { text: ui('LOCAL PREVIEW · काल्पनिक डेटा। असली दस्तावेज न डालें। Refresh clears all changes.') }), roles]));
    }
  }
  async function refreshRoster() {
    if (!user) return; const generation = ++searchGeneration;
    const result = await call('search', { query, status: filter, offset }); if (generation !== searchGeneration || !user) return;
    renderRoster(result);
  }
  function renderRoster(result) {
    I.bind(document.getElementById('rosterCount'), 'textContent', join(result.total, ' ', ui('records'), ' · ', offset + (result.total ? 1 : 0), '–', Math.min(offset + 30, result.total)));
    document.getElementById('roster').replaceChildren(...result.rows.map(g => {
      const b = button('', () => task(async () => { guard = (await call('get', {}, g.id)).guard; pendingRequest = null; uploadRetry = null; renderRecord(); if (innerWidth < 850) document.getElementById('record').scrollIntoView({ behavior: 'smooth' }); }));
      const type = Object.keys(C.EMPLOYEE_TYPES).find(k => C.EMPLOYEE_TYPES[k] === g.guardId.slice(4,6));
      b.className = 'rosteritem' + (guard?.id === g.id ? ' selected' : ''); b.append(node('strong', { text: g.name || ui('नाम बाकी · Name pending') }), node('small', { text: join(g.guardId, ' · ', ...(type ? [ui('type_' + type), ' · '] : []), g.score, '%') }), node('small', { text: statusLabels[g.status] })); return b;
    }), ...(result.rows.length ? [] : [node('div', { class: 'empty', text: ui('कोई गार्ड नहीं मिला।') })]));
    const pages = []; if (offset > 0) pages.push(button(ui('पिछला'), () => { offset = Math.max(0, offset - 30); refreshRoster().catch(e => notify(e.message, true)); })); if (result.nextOffset !== null) pages.push(button(ui('अगला'), () => { offset = result.nextOffset; refreshRoster().catch(e => notify(e.message, true)); })); document.getElementById('pages').replaceChildren(...pages);
  }
  function renderRecord() {
    const panel = document.getElementById('record'); if (!guard || !panel) return;
    const score = C.score(guard); const tabs = [['details',ui('1. जानकारी')],['documents',ui('2. दस्तावेज')],['uniform',ui('3. वर्दी')],['agreement',ui('4. समझौता')],['hr',ui('5. HR जाँच')],['exit',ui('6. अंतिम हिसाब')],['history',ui('इतिहास')]];
    panel.replaceChildren(node('div', { class: 'recordhead' }, [node('div', {}, [node('h2', { text: guard.personal.name || ui('नया गार्ड') }), node('p', { class: 'muted', text: join(guard.guardId, ' · ', ui('type_' + (guard.employeeType || 'SECURITY_GUARD')), ' · ', ui('Episode'), ' ', guard.episode) }), node('span', { class: 'pill', text: statusLabels[guard.status] })]), node('div', { class: 'scorebox' }, [node('strong', { text: score.total + '%' }), node('small', { text: ui('जानकारी की पूर्णता') }), node('progress', { value: score.total, max: '100', 'aria-label': ui('Completeness score') }), node('small', { text: ui('गार्ड की गुणवत्ता का स्कोर नहीं') })])]), node('nav', { class: 'tabs', 'aria-label': ui('Guard record sections') }, tabs.map(([id,label]) => button(label, () => { activeTab = id; renderRecord(); }, activeTab === id ? 'active' : ''))), node('div', { id: 'tabBody' }));
    const body = document.getElementById('tabBody'); ({ details: detailsView, documents: documentsView, uniform: uniformView, agreement: agreementView, hr: hrView, exit: exitView, history: historyView })[activeTab](body);
    if (['FNF_PENDING','CLOSED'].includes(guard.status)) body.prepend(node('div', { class: 'banner', text: ui('काम नहीं कर रहे हैं। रिकॉर्ड सुरक्षित रहेगा; अंतिम हिसाब पूरा होने से पहले हटाया नहीं जाएगा।') }));
    if (guard.reviewRequired && ['ACTIVE','EXIT_REQUESTED'].includes(guard.status)) body.prepend(node('div', { class: 'banner', text: ui('इस काम कर रहे गार्ड की जानकारी बदली है। HR दोबारा जाँच करें और जरूरत हो तो Razorpay / UBI रिकॉर्ड सुधारें।') }));
  }
  function detailsView(body) {
    body.append(node('h3', { text: ui('गार्ड की जानकारी') }), node('p', { class: 'muted', text: ui('थोड़ी जानकारी भरकर भी सुरक्षित कर सकते हैं। HR को भेजने से पहले सभी जानकारी पूरी करें।') }));
    if (['FNF_PENDING','CLOSED'].includes(guard.status) || (['ACTIVE','EXIT_REQUESTED'].includes(guard.status) && !canManager())) { C.PERSONAL.forEach(k => body.append(node('p', { text: labels[k] + ': ' + guard.personal[k] }))); return; }
    const details = C.PERSONAL.map(k => k === 'education'
      ? select(ui('Qualification'), k, [['',ui('Select qualification')], ...C.QUALIFICATIONS.map(v => [v,ui(v)])], guard.personal.education === 'No formal schooling' ? C.QUALIFICATIONS[0] : guard.personal.education, true)
      : field(labels[k], k, k === 'experience' && guard.personal[k] === 'Fresher' ? 0 : guard.personal[k], k === 'dob' ? 'date' : k === 'experience' ? 'number' : k.includes('Mobile') || k === 'mobile' ? 'tel' : k === 'address' ? 'textarea' : 'text', '', false, true));
    details.push(field(ui('जुड़ने की तारीख · Joining date'), 'joinedOn', guard.joinedOn, 'date', '', false, true));
    body.append(form(details, ui('जानकारी सुरक्षित करें'), values => { const personal = {}; C.PERSONAL.forEach(k => personal[k] = k === 'experience' && values[k] !== '' ? Number(values[k]) : values[k]); return change('saveDetails', { personal, joinedOn: values.joinedOn }); }));
  }
  async function upload(type, file) {
    C.requireThat(file && file.size > 0 && file.size <= 3145728 && ['image/jpeg','image/png','application/pdf'].includes(file.type), ui('JPG, PNG या PDF चुनें, अधिकतम 3 MB।'));
    if (type === 'selfie') C.requireThat(file.type.startsWith('image/'), ui('फोटो JPG या PNG में चुनें।'));
    let r;
    if (preview) r = await preview.upload(guard, type, file);
    else {
      const key = [guard.id, type, file.name, file.size, file.lastModified].join(':');
      if (!uploadRetry || uploadRetry.key !== key) uploadRetry = { key, requestId: crypto.randomUUID() };
      if (!uploadRetry.documentId) { const reserve = await api('/v1/uploads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type, mime: file.type, size: file.size, guardId: guard.id, version: guard.version, requestId: uploadRetry.requestId }) }); const prepared = (await reserve.json()).data; guard = prepared.guard; uploadRetry.documentId = prepared.upload.id; }
      const uploaded = await api(`/v1/uploads/${uploadRetry.documentId}?guard=${encodeURIComponent(guard.id)}`, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file }); r = (await uploaded.json()).data; uploadRetry = null;
    }
    guard = r.guard; renderRecord(); await refreshRoster(); notify(ui('दस्तावेज सुरक्षित हो गया। HR की जाँच बाकी है।'));
  }
  async function download(doc, episode) {
    let blob = preview ? await preview.download(doc.id) : await (await api(`/v1/documents/${doc.id}?guard=${encodeURIComponent(guard.id)}${episode ? '&episode=' + episode : ''}`, { method: 'GET' })).blob(); if (!blob) return notify(ui('यह preview दस्तावेज उपलब्ध नहीं है।'), true);
    const url = URL.createObjectURL(blob), a = node('a', { href: url, download: doc.type + (doc.mime === 'application/pdf' ? '.pdf' : doc.mime === 'image/png' ? '.png' : '.jpg') }); a.click(); setTimeout(() => URL.revokeObjectURL(url), 2000);
  }
  function docControl(type, required) {
    const d = C.currentDoc(guard, type), input = node('input', { type: 'file', accept: type === 'selfie' ? 'image/jpeg,image/png' : 'image/jpeg,image/png,application/pdf', 'aria-label': labels[type], onchange: e => { const f = e.target.files[0]; if (f) task(() => upload(type, f)); } });
    // Separate camera input keeps both gallery and camera available on phones.
    const cam = node('input', { type: 'file', accept: 'image/jpeg,image/png', capture: 'user', 'aria-label': ui('Camera selfie'), onchange: e => { const f = e.target.files[0]; if (f) task(() => upload(type, f)); } });
    const writable = guard.status !== 'CLOSED' && (guard.status !== 'FNF_PENDING' || ['exitLetter','settlementStatement','settlementReceipt'].includes(type));
    const actions = []; if (writable) actions.push(input); if (type === 'selfie' && writable) actions.push(node('label', { class: 'field' }, [ui('कैमरा से फोटो'), cam]));
    if (d && (canHR() || (d.uploader === user.sub && d.review !== 'VERIFIED'))) actions.push(button(ui('दस्तावेज खोलें'), () => task(() => download(d))));
    if (d && canHR() && guard.status !== 'CLOSED') actions.push(button(ui('सही है ✓'), () => task(() => change('reviewDocument', { documentId: d.id, review: 'VERIFIED', note: '' }))), button(ui('सुधार चाहिए'), () => rejectDocument(d)));
    return node('div', { class: 'docrow' }, [node('strong', { text: join(labels[type], required ? ' *' : '') }), node('span', { class: 'muted', text: !d ? ui('अपलोड बाकी') : d.review === 'VERIFIED' ? ui('HR ने सत्यापित किया ✓') : d.review === 'REJECTED' ? join(ui('सुधार: '), d.reviewNote) : ui('अपलोड हुआ · HR की जाँच बाकी') }), node('div', { class: 'actions' }, actions)]);
  }
  function rejectDocument(d) { const dialog = node('dialog', {}, [node('h3', { text: ui('दस्तावेज में क्या सुधार चाहिए?') })]); dialog.append(form([field(ui('कारण'), 'note', '', 'textarea')], ui('सुधार के लिए वापस करें'), async v => { await change('reviewDocument', { documentId: d.id, review: 'REJECTED', note: v.note }); dialog.close(); dialog.remove(); }), button(ui('रद्द करें'), () => { dialog.close(); dialog.remove(); })); showDialog(dialog); }
  function documentsView(body) {
    body.append(node('h3', { text: ui('दस्तावेज अपलोड करें') }), node('p', { class: 'muted', text: ui('JPG, PNG या PDF · अधिकतम 3 MB। आधार की masked copy इस्तेमाल करें। फोटो साफ हो और पूरा पेज दिखे। दस्तावेज Drive में private रहेंगे।') }), ...C.REQUIRED_DOCS.map(t => docControl(t, true)), ...['police','pf','esi','uan'].map(t => docControl(t, false)));
    if (!['FNF_PENDING','CLOSED'].includes(guard.status) && (!['ACTIVE','EXIT_REQUESTED'].includes(guard.status) || canManager())) body.append(section(ui('PF / ESI / UAN numbers'), [form(['pf','esi','uan'].map(k => field(join(k.toUpperCase(), ui(' नंबर')), k, guard.compliance?.[k] || '', 'text', '', false)), ui('नंबर सुरक्षित करें'), v => change('saveCompliance', v))]));
  }
  function uniformView(body) {
    body.append(node('h3', { text: ui('वर्दी / सामान दिया है?') }));
    const u = guard.uniform || {};
    const itemText = Array.isArray(u.items) ? u.items.map(v => `${I.render(ui('uniform_' + v.code))} × ${v.quantity} · ₹${(v.quantity * v.unitAmount / 100).toFixed(2)}`).join(' · ') : u.item || '';
    if (['FNF_PENDING','CLOSED'].includes(guard.status) || (['ACTIVE','EXIT_REQUESTED'].includes(guard.status) && !canHR())) {
      body.append(node('p', { text: u.taken === 'NO' ? ui('वर्दी नहीं दी गई।') : `${itemText || '—'} · ₹${((u.total ?? u.amount ?? 0)/100).toFixed(2)} · ${u.date || ''}` }));
      (u.replacements || []).forEach(r => body.append(node('p', { text: join(ui('Free replacement issued'), ' · ', r.date, ' · ', r.items.map(v => `${I.render(ui('uniform_' + v.code))} × ${v.quantity}`).join(', ')) })));
      return;
    }
    if (u.taken === 'YES' && !Array.isArray(u.items)) body.append(node('p', { class: 'banner', text: ui('Legacy uniform record: review the item list before saving changes.') }));
    const rows = C.UNIFORM_ITEMS.map(code => {
      const saved = u.items?.find(v => v.code === code), check = node('input', { type: 'checkbox', name: 'checked_' + code, checked: !!saved, 'aria-label': ui('uniform_' + code) });
      const quantity = node('input', { type: 'number', name: 'quantity_' + code, value: String(saved?.quantity || 1), min: '1', max: '100', step: '1', 'aria-label': join(ui('uniform_' + code), ' · ', ui('कितने?')) });
      const unitAmount = node('input', { type: 'number', name: 'amount_' + code, value: String((saved?.unitAmount || 0)/100), min: '0', max: '1000000', step: '0.01', 'aria-label': join(ui('uniform_' + code), ' · ', ui('Unit amount ₹')) });
      return node('div', { class: 'uniform-item' }, [node('label', {}, [check, ui('uniform_' + code)]), node('label', {}, [ui('कितने?'), quantity]), node('label', {}, [ui('Unit amount ₹'), unitAmount])]);
    });
    const total = node('strong', { class: 'uniform-total', text: '' });
    const f = form([select(ui('वर्दी दी?'), 'taken', [['NO',ui('नहीं')],['YES',ui('हाँ')]], u.taken === 'YES' ? 'YES' : 'NO'), field(ui('देने की तारीख'), 'date', u.date || '', 'date', '', false, true), node('div', { class: 'uniform-items' }, [node('h4', { text: ui('Uniform items') }), ...rows, total]), select(ui('Payment arrangement'), 'paymentMode', [['UPFRONT',ui('One-time payment')],['EMI',ui('Monthly salary instalments')],['GRANT',ui('Company grant')]], u.paymentMode || 'UPFRONT'), field(ui('Number of monthly instalments'), 'installments', u.installments || 1, 'number', '', false)], ui('वर्दी का रिकॉर्ड सुरक्षित करें'), v => {
      if (v.taken === 'NO') return change('saveUniform', { taken: 'NO' });
      const items = C.UNIFORM_ITEMS.filter(code => v['checked_' + code]).map(code => ({ code, quantity: Number(v['quantity_' + code]), unitAmount: amount(v['amount_' + code]) }));
      return change('saveUniform', { taken: 'YES', date: v.date, items, paymentMode: v.paymentMode, installments: v.paymentMode === 'EMI' ? Number(v.installments) : 0 });
    });
    const update = () => {
      const given = f.elements.taken.value === 'YES';
      f.querySelectorAll('[name]:not([name=taken])').forEach(i => { i.disabled = !given; });
      rows.forEach((row, index) => { const code = C.UNIFORM_ITEMS[index], chosen = given && f.elements['checked_' + code].checked; for (const input of row.querySelectorAll('input[type=number]')) { input.disabled = !chosen; input.required = chosen; } });
      f.elements.installments.disabled = !given || f.elements.paymentMode.value !== 'EMI'; f.elements.installments.required = given && f.elements.paymentMode.value === 'EMI';
      const value = C.UNIFORM_ITEMS.reduce((sum,code) => sum + (f.elements['checked_' + code].checked ? Number(f.elements['quantity_' + code].value || 0) * Number(f.elements['amount_' + code].value || 0) : 0), 0);
      I.bind(total, 'textContent', join(ui('Total value ₹'), ': ', value.toFixed(2)));
    };
    f.addEventListener('input', update); f.addEventListener('change', update); update(); body.append(f);
    (u.replacements || []).forEach(r => body.append(node('p', { text: join(ui('Free replacement issued'), ' · ', r.date, ' · ', r.items.map(v => `${I.render(ui('uniform_' + v.code))} × ${v.quantity}`).join(', ')) })));
    if (canHR() && ['ACTIVE','EXIT_REQUESTED'].includes(guard.status) && Array.isArray(u.items) && u.paymentMode !== 'GRANT' && !(u.replacements || []).length) {
      const anniversary = C.uniformAnniversary(u.date);
      if (anniversary > new Date(Date.now() + 19800000).toISOString().slice(0, 10)) { body.append(node('p', { class: 'muted', text: join(ui('Free replacement after one year'), ' · ', ui('Eligible from'), ' ', anniversary) })); return; }
      const replacementFields = [node('p', { class: 'muted', text: join(ui('Eligible from'), ' ', anniversary, '. ', ui('HR must verify full original payment before issue.')) }), field(ui('Replacement issue date'), 'date', '', 'date'), field(ui('Full payment evidence reference'), 'paymentReference')];
      u.items.forEach(item => replacementFields.push(node('div', { class: 'uniform-item' }, [field(ui('uniform_' + item.code), 'replace_' + item.code, false, 'checkbox'), field(ui('कितने?'), 'quantity_' + item.code, item.quantity, 'number', '', false)])));
      body.append(section(ui('Free replacement after one year'), [form(replacementFields, ui('Record free replacement'), v => change('recordUniformReplacement', { date: v.date, paymentReference: v.paymentReference, items: u.items.filter(item => v['replace_' + item.code]).map(item => ({ code: item.code, quantity: Number(v['quantity_' + item.code]) })) }))]));
    }
  }
  function agreementView(body) {
    body.append(node('h3', { text: ui('गार्ड के हस्ताक्षर किया हुआ समझौता') }), node('p', { class: 'muted', text: ui('कागज पर गार्ड के हस्ताक्षर लें। सभी पेज एक PDF में डालें। Supervisor या HR अपलोड कर सकते हैं; HR मंजूरी देगा।') }), docControl('agreement', true));
    if (!['FNF_PENDING','CLOSED'].includes(guard.status)) body.append(form([field(ui('हस्ताक्षर की तारीख'), 'signedOn', guard.agreement.signedOn || '', 'date'), field(ui('समझौते का संस्करण / नाम'), 'version', guard.agreement.version || ''), field(ui('सभी पेज और हस्ताक्षर मौजूद हैं'), 'allPages', guard.agreement.allPages, 'checkbox')], ui('समझौते की जानकारी सुरक्षित करें'), v => change('saveAgreement', v)));
    if (canHR() && !['FNF_PENDING','CLOSED'].includes(guard.status)) body.append(node('div', { class: 'formfoot' }, [button(guard.agreement.approved ? ui('HR मंजूरी मिली ✓') : ui('HR: समझौता मंजूर करें'), () => task(() => change('approveAgreement')), 'primary')]));
  }
  function hrView(body) {
    const missing = C.missing(guard, 'SUBMIT'); body.append(node('h3', { text: ui('HR की अंतिम जाँच') }), node('p', { class: 'muted', text: ui('स्कोर: जानकारी 25 · दस्तावेज 35 · वर्दी 10 · समझौता 15 · अंतिम जाँच 15। स्कोर 100 होने से अपने आप मंजूरी नहीं मिलती।') }), node('div', { class: 'banner', text: missing.length ? join(ui('बाकी: '), ...missing.flatMap((x,i) => [i ? ', ' : '', I.missing(x)])) : ui('जानकारी पूरी है। HR दस्तावेज जाँच सकते हैं।') }));
    if (['DRAFT','HR_REVIEW'].includes(guard.status)) body.append(button(ui('HR की जाँच के लिए भेजें'), () => task(() => change('submit')), 'primary'));
    if (canManager() && !['FNF_PENDING','CLOSED'].includes(guard.status)) body.append(section(ui('Manager / HR: Check sheet'), [node('p', { class: 'muted', text: ui('जानकारी, वर्दी, चार जरूरी दस्तावेज और HR द्वारा मंजूर समझौता जाँचें।') }), button(guard.checklist.confirmed ? ui('Checklist confirmed ✓') : ui('चेक शीट पूरी होने की पुष्टि'), () => task(() => change('confirmChecklist')))]));
    if (!canHR()) { body.append(node('p', { class: 'muted', text: ui('फीस, payroll और अंतिम मंजूरी केवल HR / Super Admin करेंगे।') })); return; }
    if (['FNF_PENDING','CLOSED'].includes(guard.status)) { body.append(node('p', { text: ui('पुरानी मंजूरी और payroll विवरण मास्टर रिकॉर्ड में सुरक्षित हैं।') })); return; }
    body.append(section(ui('HR: ₹200 Registration'), [docControl('feeReceipt', true), form([field(ui('प्राप्त होने की तारीख'), 'paidOn', guard.fee.paidOn || '', 'date'), select(ui('भुगतान का तरीका'), 'method', [['CASH',ui('नकद')],['UPI','UPI'],['BANK',ui('बैंक')]], guard.fee.method), field(ui('रसीद / Transaction reference'), 'reference', guard.fee.reference || '')], guard.fee.verified ? ui('₹200 प्राप्ति अपडेट करें') : ui('₹200 प्राप्त होने की पुष्टि करें'), v => change('recordFee', v))]));
    if (guard.status === 'HR_REVIEW') body.append(node('div', { class: 'formfoot' }, [button(ui('HR: Onboarding मंजूर करें'), () => task(() => change('approve')), 'primary')]));
    if (['APPROVED','ACTIVE','EXIT_REQUESTED'].includes(guard.status)) {
      body.append(section('HR: Razorpay → UBI', [node('p', { class: 'muted', text: ui('Razorpay में रिकॉर्ड बनाएँ, फिर UBI के मौजूदा integration से import करें। दोनों में बिल्कुल एक जैसा email रखें। Site और shift UBI में ही संभालें। यह स्क्रीन payroll या attendance में अपने आप बदलाव नहीं करती।') }), ...['razorpay','ubi'].map(system => form([field(system === 'razorpay' ? ui('Razorpay का exact email') : ui('UBI का वही email'), 'email', guard.integrations[system].email || '', 'email'), field(join(system.toUpperCase(), ui(' कर्मचारी ID')), 'externalId', guard.integrations[system].externalId || '')], join(system.toUpperCase(), ui(': रिकॉर्ड / import की पुष्टि')), v => change('confirmIntegration', { ...v, system })))]));
      if (guard.status === 'APPROVED') body.append(node('div', { class: 'formfoot' }, [button(ui('काम करने वाले गार्ड में जोड़ें'), () => task(() => change('activate')), 'primary')]));
      if (guard.reviewRequired) body.append(node('div', { class: 'formfoot' }, [button(ui('HR: दोबारा जाँच पूरी'), () => task(() => change('completeRecheck')), 'primary')]));
    }
  }
  function exitView(body) {
    body.append(node('h3', { text: ui('Offboarding और अंतिम हिसाब') }), node('p', { class: 'muted', text: ui('अंतिम ड्यूटी की पुष्टि के बाद गार्ड काम करने वालों में नहीं दिखेगा। भुगतान और जमा वापसी पूरी होने तक मास्टर में “भुगतान बाकी” रहेगा। रिकॉर्ड हमेशा सुरक्षित रहेगा।') }));
    if (guard.status === 'ACTIVE') body.append(form([field(ui('छोड़ने का कारण'), 'reason', '', 'textarea'), field(ui('प्रस्तावित अंतिम दिन'), 'proposedLastDay', '', 'date')], ui('छोड़ने का अनुरोध दर्ज करें'), v => change('requestExit', v)));
    if (guard.status === 'EXIT_REQUESTED') { body.append(node('p', { text: guard.exit.reason + ' · ' + guard.exit.proposedLastDay }), docControl('exitLetter', false)); if (canManager()) body.append(form([field(ui('वास्तविक अंतिम ड्यूटी'), 'lastDay', guard.exit.proposedLastDay, 'date'), field(ui('UBI में आगे की attendance / assignments बंद कर दिए हैं'), 'attendanceClosed', false, 'checkbox')], ui('काम बंद की पुष्टि करें'), v => change('confirmLastDuty', v))); }
    if (guard.status === 'FNF_PENDING' && canHR()) {
      const s = guard.settlement, hasPaidUniform = Array.isArray(guard.uniform.items) && guard.uniform.paymentMode !== 'GRANT';
      const fields = [field(ui('अंतिम हिसाब की देय राशि ₹'), 'due', (s.due || 0)/100, 'number'), field(ui('वास्तव में भुगतान हुआ ₹'), 'paid', (s.paid || 0)/100, 'number'), field(ui('Other refund due ₹'), 'refund', (s.refund || 0)/100, 'number'), field(ui('Other refund paid ₹'), 'refundPaid', (s.refundPaid || 0)/100, 'number')];
      if (hasPaidUniform) fields.push(node('div', { class: 'uniform-items' }, [node('h4', { text: ui('Uniform refund check') }), node('p', { class: 'muted', text: ui('Cash refund requires full original payment, return after one year, and no free replacement.') })]), field(ui('Uniform paid in full / paid so far ₹'), 'uniformPaid', (s.uniformPaid || 0)/100, 'number'), field(ui('Uniform return date'), 'uniformReturnedOn', s.uniformReturnedOn || '', 'date', '', false), field(ui('Uniform refund paid ₹'), 'uniformRefundPaid', (s.uniformRefundPaid || 0)/100, 'number'), field(ui('Full uniform refund completed'), 'uniformRefundConfirmed', s.uniformRefundConfirmed, 'checkbox'));
      const dueDisplay = node('strong', { class: 'uniform-items', text: '' }); if (hasPaidUniform) fields.push(dueDisplay);
      fields.push(field(ui('भुगतान की तारीख'), 'paidOn', s.paidOn || '', 'date', '', false), field(ui('Payment reference / receipt'), 'reference', s.reference || '', 'text', '', false), field(ui('वर्दी / सामान वापस या समायोजन पूरा'), 'inventoryCleared', s.inventoryCleared, 'checkbox'), field(ui('वापसी या सहमत समायोजन का विवरण'), 'inventoryNote', s.inventoryNote || '', 'textarea'), field(ui('हिसाब पर विवाद है'), 'disputed', s.disputed, 'checkbox'));
      const settlementForm = form(fields, ui('अंतिम हिसाब सुरक्षित करें'), v => change('saveSettlement', { ...v, due: amount(v.due), paid: amount(v.paid), refund: amount(v.refund), refundPaid: amount(v.refundPaid), uniformPaid: amount(v.uniformPaid || 0), uniformReturnedOn: v.uniformReturnedOn || '', uniformRefundPaid: amount(v.uniformRefundPaid || 0), uniformRefundConfirmed: v.uniformRefundConfirmed === true }));
      if (hasPaidUniform) { const updateDue = () => { const value = Number(settlementForm.elements.uniformPaid.value || 0), paid = Number.isFinite(value) && value >= 0 ? Math.round(value * 100) : 0, returnedOn = settlementForm.elements.uniformReturnedOn.value, due = C.uniformRefundDue(guard, returnedOn, paid); I.bind(dueDisplay, 'textContent', join(ui('Uniform refund due ₹'), ' ', (due/100).toFixed(2))); }; settlementForm.addEventListener('input', updateDue); settlementForm.addEventListener('change', updateDue); updateDue(); }
      body.append(docControl('exitLetter', false), docControl('settlementStatement', true), docControl('settlementReceipt', true), settlementForm, node('div', { class: 'formfoot' }, [button(ui('HR: भुगतान जाँचकर हिसाब बंद करें'), () => confirmClose(), 'primary')]));
    }
    if (guard.status === 'CLOSED') { body.append(node('p', { text: join(ui('हिसाब बंद हुआ: '), guard.settlement.closedAt?.slice(0,10)) })); if (canHR()) body.append(button(ui('इसी गार्ड ID पर दोबारा नियुक्ति शुरू करें'), () => task(() => change('rehire')))); }
    if (!['ACTIVE','EXIT_REQUESTED','FNF_PENDING','CLOSED'].includes(guard.status)) body.append(node('p', { class: 'muted', text: ui('Onboarding पूरा होने के बाद offboarding उपलब्ध होगा।') }));
    if (guard.history.length) body.append(section(ui('पिछली नियुक्तियाँ'), guard.history.map(h => node('p', { text: join(ui('Episode'), ' ', h.episode, ' · ', h.joinedOn, ' → ', h.exit.lastDay, ' · ₹', h.settlement.paid/100, ' ', ui('paid')) }))));
  }
  function confirmClose() { const d = node('dialog', {}, [node('h3', { text: ui('क्या वास्तविक भुगतान पूरा और सत्यापित है?') }), node('p', { text: ui('सिर्फ payment बनाया जाना पर्याप्त नहीं है। प्राप्त भुगतान, वर्दी और जमा वापसी जाँचकर पुष्टि करें।') }), node('div', { class: 'actions' }, [button(ui('हाँ, हिसाब पूरा है'), () => task(async () => { await change('close'); d.close(); d.remove(); }), 'primary'), button(ui('वापस'), () => { d.close(); d.remove(); })])]); showDialog(d); }
  function historyView(body) {
    body.append(node('h3', { text: ui('रिकॉर्ड का इतिहास') }), node('p', { class: 'muted', text: ui('किसने, कब और कौन सा काम किया। पिछली नियुक्तियों के दस्तावेज HR देख सकते हैं।') }));
    call('history', {}, guard.id).then(r => {
      if (!body.isConnected) return;
      body.append(...r.events.map(e => node('p', { class: 'subtle', text: join(() => new Date(e.at).toLocaleString(I.locale, { timeZone: 'Asia/Kolkata' }), ' · ', e.action, ' · ', e.actorEmail || e.actorRole || e.actor, ' · ', ui('Episode'), ' ', e.episode, ' · ', ui('Revision'), ' ', e.version) })));
      if (r.currentDocuments?.length) body.append(section(ui('इस नियुक्ति के दस्तावेज / पुराने संस्करण'), r.currentDocuments.map(d => button(join(labels[d.type] || d.type, d.state === 'SUPERSEDED' ? ui(' · पुराना') : ''), () => task(() => download(d))))));
      r.episodes.forEach(e => body.append(section(join(ui('Episode'), ' ', e.episode, ' ', ui('documents')), e.documents.map(d => button(join(labels[d.type] || d.type, d.state === 'SUPERSEDED' ? ui(' · पुराना') : ''), () => task(() => download(d, e.episode)))))));
      if (!r.events.length) body.append(node('p', { class: 'muted', text: ui('इस रिकॉर्ड का कोई पिछला कार्य उपलब्ध नहीं।') }));
    }).catch(e => notify(e.message, true));
  }
  async function manageUsers() {
    const r = await call('listUsers'); const d = node('dialog', {}, [node('h3', { text: ui('Staff access · Super Admin') }), node('p', { class: 'muted', text: ui('केवल approved Google email को प्रवेश मिलेगा। पहली login पर उसकी Google identity जुड़ जाएगी।') }), ...r.users.map(u => node('div', { class: 'userline' }, [node('span', { text: join(u.email, ' · ', roleLabel(u.role), u.enabled ? '' : ui(' · DISABLED')) }), button(u.enabled ? ui('Disable') : ui('Enable'), () => task(async () => { await call('saveUser', { email: u.email, role: u.role, cities: u.cities, enabled: !u.enabled }); d.close(); d.remove(); await manageUsers(); }))]))]);
    d.append(form([field(ui('Google email'), 'email', '', 'email'), select(ui('भूमिका'), 'role', C.ROLES.map(r => [r,roleLabel(r)]), 'SUPERVISOR'), select(ui('Issuing city'), 'city', [['AJMER',ui('Ajmer · अजमेर')],['JAIPUR',ui('Jaipur · जयपुर')],['BOTH',ui('Both')]], 'AJMER')], ui('प्रवेश जोड़ें / भूमिका अपडेट करें'), async v => { await call('saveUser', { email: v.email, role: v.role, cities: v.city === 'BOTH' ? ['AJMER','JAIPUR'] : [v.city], enabled: true }); d.close(); d.remove(); await manageUsers(); }), button(ui('बंद करें'), () => { d.close(); d.remove(); })); showDialog(d);
  }
  async function start() {
    if (new URLSearchParams(location.search).get('preview') === '1' && ['localhost','127.0.0.1','[::1]'].includes(location.hostname)) {
      const s = document.createElement('script'); s.src = 'preview.js'; s.onload = () => task(async () => { preview = window.A1StaffPreview(); await login(); }); document.head.append(s); return;
    }
    const loginNode = document.getElementById('login');
    if (!config.apiOrigin || !config.googleClientId) { loginNode.append(node('div', { class: 'banner', text: ui('Portal setup बाकी है। Google / Drive connection और पहला Super Admin जोड़ने के बाद प्रवेश खुलेगा।') })); return; }
    if (!/^https:\/\/[a-z0-9.-]+$/.test(config.apiOrigin)) { I.bind(loginNode, 'textContent', ui('Portal configuration needs review.')); return; }
    const s = document.createElement('script'); s.src = 'https://accounts.google.com/gsi/client'; s.onload = () => { google.accounts.id.initialize({ client_id: config.googleClientId, auto_select: false, callback: r => { token = r.credential; task(login); } }); google.accounts.id.renderButton(loginNode, { theme: 'outline', size: 'large', text: 'signin_with', width: 250 }); }; s.onerror = () => notify(ui('Google sign-in नहीं खुला। Connection जाँचें।'), true); document.head.append(s);
  }
  function setLanguage(value, remember) {
    I.setLanguage(value);
    document.querySelectorAll('[data-language]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.language === I.language)));
    if (remember) { try { localStorage.setItem('a1-staff-language', I.language); } catch { /* Storage may be disabled; the switch still works. */ } }
  }
  document.querySelectorAll('[data-ui]').forEach(n => I.bind(n, 'textContent', ui(n.dataset.ui)));
  document.querySelectorAll('[data-language]').forEach(b => b.addEventListener('click', () => setLanguage(b.dataset.language, true)));
  let preferredLanguage = 'hi';
  try { preferredLanguage = localStorage.getItem('a1-staff-language') || 'hi'; } catch { /* No account or guard data is stored here. */ }
  setLanguage(['hi','en'].includes(preferredLanguage) ? preferredLanguage : 'hi');
  ['pointerdown','keydown'].forEach(event => document.addEventListener(event, () => lastActivity = Date.now(), { passive: true }));
  setInterval(() => { if (user && !preview && Date.now() - lastActivity > 15 * 60 * 1000) signout(); }, 30000);
  start().catch(e => notify(e.message, true));
})();
