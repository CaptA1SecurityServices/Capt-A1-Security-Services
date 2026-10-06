/* Shared business rules: browser, private API and automated checks. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.A1StaffCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const ROLES = ['SUPERVISOR', 'MANAGER', 'HR', 'SUPER_ADMIN'];
  const PREFIXES = { AJMER: 'RJAJSG', JAIPUR: 'RJJPSG' };
  const TYPES = ['aadhaar', 'pan', 'passbook', 'selfie', 'police', 'pf', 'esi', 'uan', 'agreement', 'feeReceipt', 'exitLetter', 'settlementStatement', 'settlementReceipt'];
  const REQUIRED_DOCS = ['aadhaar', 'pan', 'passbook', 'selfie'];
  const PERSONAL = ['name', 'fatherName', 'dob', 'mobile', 'emergencyMobile', 'education', 'experience', 'address'];
  const WEIGHTS = { name: 4, fatherName: 2, dob: 4, mobile: 4, emergencyMobile: 4, education: 2, experience: 2, address: 3 };
  const STATES = ['DRAFT', 'HR_REVIEW', 'APPROVED', 'ACTIVE', 'EXIT_REQUESTED', 'FNF_PENDING', 'CLOSED'];
  function fail(message, code) { const e = new Error(message); e.code = code || 'VALIDATION'; throw e; }
  function requireThat(test, message, code) { if (!test) fail(message, code); }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function normalize(value) { return String(value || '').normalize('NFKC').trim().toLocaleLowerCase().replace(/\s+/g, ' '); }
  function role(user, roles) { requireThat(user && user.enabled && roles.includes(user.role), 'This action is not allowed for your account.', 'FORBIDDEN'); }
  function scope(user, guard) {
    role(user, ROLES);
    requireThat(user.role === 'SUPER_ADMIN' || (user.cities || []).includes(guard.city), 'This record is outside your access.', 'FORBIDDEN');
    requireThat(user.role !== 'SUPERVISOR' || guard.owner === user.sub, 'This record is assigned to another supervisor.', 'FORBIDDEN');
  }
  function text(value, max, required) {
    requireThat(typeof value === 'string', 'Please enter text.');
    const s = value.trim();
    requireThat(s.length <= max && !/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(s), 'Text is too long or contains unsupported characters.');
    requireThat(!required || s.length > 0, 'Please fill the required field.'); return s;
  }
  function date(value, required) {
    const s = text(value || '', 10, required);
    if (!s) return '';
    const timestamp = Date.parse(s + 'T00:00:00Z');
    requireThat(/^\d{4}-\d{2}-\d{2}$/.test(s) && Number.isFinite(timestamp) && new Date(timestamp).toISOString().slice(0, 10) === s, 'Enter a valid date.'); return s;
  }
  function todayIndia(now) { return new Date(Date.parse(now || new Date().toISOString()) + 19800000).toISOString().slice(0, 10); }
  function money(value) { requireThat(Number.isSafeInteger(value) && value >= 0 && value <= 100000000, 'Enter a valid amount in paise.'); return value; }
  function only(object, keys) { requireThat(object && !Array.isArray(object) && typeof object === 'object', 'Invalid form.'); Object.keys(object).forEach(k => requireThat(keys.includes(k), 'Unsupported field: ' + k)); }
  function personal(value) {
    only(value, PERSONAL);
    const out = {};
    PERSONAL.forEach(k => out[k] = text(value[k] || '', k === 'address' ? 700 : 160, false));
    out.dob = date(out.dob, false);
    requireThat(!out.dob || out.dob <= todayIndia(), 'Date of birth cannot be in the future.');
    ['mobile', 'emergencyMobile'].forEach(k => { out[k] = out[k].replace(/[\s()-]/g, '').replace(/^\+91/, ''); requireThat(!out[k] || /^[6-9]\d{9}$/.test(out[k]), 'Enter a 10 digit Indian mobile number.'); });
    return out;
  }
  function currentDoc(g, type) { return (g.documents || []).find(d => d.type === type && d.state === 'UPLOADED'); }
  function verified(g, type) { const d = currentDoc(g, type); return !!(d && d.review === 'VERIFIED'); }
  function inventoryComplete(g) {
    const i = g.uniform || {};
    return i.taken === 'NO' || (i.taken === 'YES' && i.item && i.date && i.quantity > 0 && Number.isSafeInteger(i.amount) && Number.isSafeInteger(i.collected) && i.chargeType);
  }
  function score(g) {
    let total = 0; const sections = { details: 0, documents: 0, uniform: 0, agreement: 0, final: 0 };
    PERSONAL.forEach(k => { if (g.personal[k]) sections.details += WEIGHTS[k]; });
    [['aadhaar', 10], ['pan', 8], ['passbook', 12], ['selfie', 5]].forEach(([t, w]) => { const d = currentDoc(g, t); if (d && d.review !== 'REJECTED') sections.documents += w; });
    if (['YES', 'NO'].includes(g.uniform.taken)) sections.uniform += 4;
    if (inventoryComplete(g)) sections.uniform += 6;
    const agreementDoc = currentDoc(g, 'agreement');
    if (agreementDoc && agreementDoc.review !== 'REJECTED' && g.agreement.signedOn && g.agreement.version && g.agreement.allPages) sections.agreement += 10;
    if (g.agreement.approved) sections.agreement += 5;
    if (g.checklist.confirmed) sections.final += 3;
    if (g.fee.verified && g.fee.amount === 20000 && verified(g, 'feeReceipt')) sections.final += 6;
    if (g.integrations.razorpay.confirmed) sections.final += 4;
    if (g.integrations.ubi.confirmed) sections.final += 2;
    Object.values(sections).forEach(v => total += v);
    return { total, sections, meaning: 'Completeness only; approvals and document verification are separate.' };
  }
  function missing(g, stage) {
    const list = PERSONAL.filter(k => !g.personal[k]);
    REQUIRED_DOCS.forEach(t => { const d = currentDoc(g, t); if (!d || d.review === 'REJECTED') list.push(t); });
    if (!inventoryComplete(g)) list.push('uniform');
    const agreementDoc = currentDoc(g, 'agreement');
    if (!agreementDoc || agreementDoc.review === 'REJECTED' || !g.agreement.signedOn || !g.agreement.version || !g.agreement.allPages) list.push('signed agreement');
    if (stage === 'APPROVE' || stage === 'ACTIVATE') {
      REQUIRED_DOCS.concat('agreement').forEach(t => { if (!verified(g, t)) list.push(t + ' verification'); });
      if (!g.agreement.approved) list.push('HR agreement approval');
      if (!g.checklist.confirmed) list.push('final checklist');
      if (!(g.fee.verified && g.fee.amount === 20000 && verified(g, 'feeReceipt'))) list.push('₹200 registration receipt');
    }
    if (stage === 'ACTIVATE') {
      if (!g.integrations.razorpay.confirmed) list.push('Razorpay confirmation');
      if (!g.integrations.ubi.confirmed) list.push('UBI import confirmation');
      if (!g.joinedOn) list.push('joining date');
    }
    return [...new Set(list)];
  }
  function fresh(id, city, number, actor, now) {
    requireThat(PREFIXES[city] && Number.isInteger(number) && number > 0 && number < 10000, 'Invalid guard number.');
    return { id, guardId: PREFIXES[city] + String(number).padStart(4, '0'), city, owner: actor.sub, status: 'DRAFT', version: 1, createdAt: now, updatedAt: now,
      personal: Object.fromEntries(PERSONAL.map(k => [k, ''])), compliance: { pf: '', esi: '', uan: '' }, uniform: { taken: 'UNKNOWN' }, agreement: {}, checklist: {}, fee: {},
      integrations: { razorpay: {}, ubi: {} }, joinedOn: '', documents: [], exit: {}, settlement: {}, history: [], episode: 1 };
  }
  function invalidate(g) { g.checklist = {}; g.agreement.approved = false; if (['ACTIVE', 'EXIT_REQUESTED'].includes(g.status)) g.reviewRequired = true; if (['APPROVED', 'HR_REVIEW'].includes(g.status)) g.status = 'DRAFT'; }
  function hr(user) { role(user, ['HR', 'SUPER_ADMIN']); }
  function editable(g) { requireThat(!['FNF_PENDING', 'CLOSED'].includes(g.status), 'This employment episode is closed for onboarding changes.'); }
  function mutate(old, action, data, user, now, eventId) {
    scope(user, old); const g = clone(old); data = data || {};
    if (g.status === 'CLOSED') requireThat(action === 'rehire', 'Closed employment records cannot be edited.');
    if (g.status === 'FNF_PENDING') requireThat(['reviewDocument', 'saveSettlement', 'close'].includes(action), 'Only settlement changes are allowed after last duty.');
    if (['ACTIVE', 'EXIT_REQUESTED'].includes(g.status) && ['saveDetails', 'saveUniform', 'saveAgreement', 'saveCompliance'].includes(action)) role(user, ['MANAGER', 'HR', 'SUPER_ADMIN']);
    if (action === 'saveDetails') {
      editable(g); only(data, ['personal', 'joinedOn']);
      const p = personal(data.personal); g.personal = p; g.joinedOn = date(data.joinedOn || '', false); invalidate(g);
    } else if (action === 'saveCompliance') {
      editable(g); only(data, ['pf', 'esi', 'uan']); g.compliance = {};
      ['pf', 'esi', 'uan'].forEach(k => { const v = text(data[k] || '', 40, false); requireThat(!v || /^[A-Za-z0-9/ -]+$/.test(v), 'Enter a valid ' + k.toUpperCase() + ' number.'); if (k === 'uan') requireThat(!v || /^\d{12}$/.test(v), 'UAN must be 12 digits.'); g.compliance[k] = v; });
    } else if (action === 'saveUniform') {
      editable(g); only(data, ['taken', 'item', 'quantity', 'date', 'chargeType', 'amount', 'collected']);
      requireThat(['YES', 'NO'].includes(data.taken), 'Choose whether a uniform was provided.');
      g.uniform = data.taken === 'NO' ? { taken: 'NO' } : { taken: 'YES', item: text(data.item, 120, true), quantity: data.quantity, date: date(data.date, true), chargeType: data.chargeType, amount: money(data.amount), collected: money(data.collected) };
      if (data.taken === 'YES') { requireThat(Number.isInteger(data.quantity) && data.quantity > 0 && data.quantity <= 100, 'Enter a valid quantity.'); requireThat(['FREE', 'CHARGE', 'DEPOSIT'].includes(data.chargeType), 'Choose charge or deposit.'); requireThat(data.chargeType !== 'FREE' || (data.amount === 0 && data.collected === 0), 'A free uniform must have zero amount.'); requireThat(data.collected <= data.amount, 'Collection cannot exceed the stated amount.'); }
      invalidate(g);
    } else if (action === 'saveAgreement') {
      editable(g); only(data, ['signedOn', 'version', 'allPages']);
      g.agreement = { signedOn: date(data.signedOn, true), version: text(data.version, 80, true), allPages: data.allPages === true, approved: false }; invalidate(g);
    } else if (action === 'submit') {
      requireThat(['DRAFT', 'HR_REVIEW'].includes(g.status), 'This record cannot be submitted now.');
      requireThat(missing(g, 'SUBMIT').length === 0, 'Complete: ' + missing(g, 'SUBMIT').join(', ')); g.status = 'HR_REVIEW';
    } else if (action === 'reviewDocument') {
      hr(user); only(data, ['documentId', 'review', 'note']);
      const d = g.documents.find(d => d.id === data.documentId && d.state === 'UPLOADED'); requireThat(d, 'Document not found.');
      requireThat(['VERIFIED', 'REJECTED'].includes(data.review), 'Choose verified or rejected.'); d.review = data.review; d.reviewNote = text(data.note || '', 300, data.review === 'REJECTED'); d.reviewedBy = user.sub; d.reviewedAt = now;
      if (data.review === 'REJECTED') invalidate(g);
    } else if (action === 'approveAgreement') {
      hr(user); requireThat(verified(g, 'agreement') && g.agreement.allPages && g.agreement.signedOn && g.agreement.version, 'Verify the complete signed agreement first.'); g.agreement.approved = true;
    } else if (action === 'confirmChecklist') {
      role(user, ['MANAGER', 'HR', 'SUPER_ADMIN']);
      requireThat(missing(g, 'SUBMIT').length === 0, 'Complete the information and documents first.');
      requireThat(REQUIRED_DOCS.every(t => verified(g, t)) && g.agreement.approved, 'HR must verify the documents and approve the agreement first.');
      g.checklist = { confirmed: true, by: user.sub, at: now };
    } else if (action === 'recordFee') {
      hr(user); only(data, ['paidOn', 'method', 'reference']);
      requireThat(g.checklist.confirmed && verified(g, 'feeReceipt'), 'Confirm the checklist and verify the fee receipt first.');
      requireThat(['CASH', 'UPI', 'BANK'].includes(data.method), 'Choose payment method.');
      g.fee = { amount: 20000, verified: true, paidOn: date(data.paidOn, true), method: data.method, reference: text(data.reference, 100, true), by: user.sub, at: now };
    } else if (action === 'approve') {
      hr(user); requireThat(g.status === 'HR_REVIEW', 'Submit this draft to HR first.');
      requireThat(missing(g, 'APPROVE').length === 0, 'Complete: ' + missing(g, 'APPROVE').join(', ')); g.status = 'APPROVED';
    } else if (action === 'completeRecheck') {
      hr(user); requireThat(['ACTIVE', 'EXIT_REQUESTED'].includes(g.status) && g.reviewRequired, 'This record does not need an active-record recheck.');
      requireThat(missing(g, 'ACTIVATE').length === 0, 'Complete: ' + missing(g, 'ACTIVATE').join(', ')); g.reviewRequired = false;
    } else if (action === 'confirmIntegration') {
      hr(user); only(data, ['system', 'email', 'externalId']); requireThat(['APPROVED', 'ACTIVE', 'EXIT_REQUESTED'].includes(g.status), 'HR approval is required first.');
      requireThat(['razorpay', 'ubi'].includes(data.system), 'Choose Razorpay or UBI.');
      const email = text(data.email, 254, true).toLowerCase(); requireThat(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), 'Enter the exact payroll email.');
      if (data.system === 'ubi') requireThat(g.integrations.razorpay.confirmed && email === g.integrations.razorpay.email, 'UBI must use the same email as Razorpay.');
      if (data.system === 'razorpay' && g.integrations.ubi.email && email !== g.integrations.ubi.email) g.integrations.ubi = {};
      g.integrations[data.system] = { confirmed: true, email, externalId: text(data.externalId, 100, true), by: user.sub, at: now };
    } else if (action === 'activate') {
      hr(user); requireThat(g.status === 'APPROVED', 'HR approval is required.'); requireThat(missing(g, 'ACTIVATE').length === 0, 'Complete: ' + missing(g, 'ACTIVATE').join(', ')); g.status = 'ACTIVE';
    } else if (action === 'requestExit') {
      requireThat(g.status === 'ACTIVE', 'Only an active guard can have an exit request.'); only(data, ['reason', 'proposedLastDay']);
      g.exit = { reason: text(data.reason, 700, true), proposedLastDay: date(data.proposedLastDay, true), by: user.sub, at: now }; g.status = 'EXIT_REQUESTED';
    } else if (action === 'confirmLastDuty') {
      role(user, ['MANAGER', 'HR', 'SUPER_ADMIN']); requireThat(g.status === 'EXIT_REQUESTED', 'Request the exit first.'); only(data, ['lastDay', 'attendanceClosed']);
      const lastDay = date(data.lastDay, true); requireThat(lastDay >= g.joinedOn && lastDay <= todayIndia(now), 'Last duty must be after joining and cannot be in the future.');
      requireThat(data.attendanceClosed === true, 'Confirm future attendance assignments have been stopped in UBI.'); g.exit.lastDay = lastDay; g.exit.attendanceClosed = true; g.status = 'FNF_PENDING';
    } else if (action === 'saveSettlement') {
      hr(user); requireThat(g.status === 'FNF_PENDING', 'Last duty must be confirmed first.');
      only(data, ['due', 'paid', 'reference', 'paidOn', 'inventoryCleared', 'inventoryNote', 'refund', 'refundPaid', 'disputed']);
      requireThat(data.inventoryCleared === true && text(data.inventoryNote, 500, true), 'Confirm inventory return or an agreed adjustment.');
      const due = money(data.due), paid = money(data.paid), refund = money(data.refund), refundPaid = money(data.refundPaid);
      requireThat(paid <= due && refundPaid <= refund, 'Payments cannot exceed the stated amount.');
      g.settlement = { due, paid, refund, refundPaid, reference: text(data.reference || '', 120, paid + refundPaid > 0), paidOn: date(data.paidOn || '', paid + refundPaid > 0), inventoryCleared: true, inventoryNote: data.inventoryNote.trim(), disputed: data.disputed === true, by: user.sub, at: now };
    } else if (action === 'close') {
      hr(user); const s = g.settlement;
      requireThat(g.status === 'FNF_PENDING' && s.inventoryCleared && !s.disputed && Number.isSafeInteger(s.due) && s.paid === s.due && s.refundPaid === s.refund, 'Settlement or refund is pending or disputed.');
      requireThat(verified(g, 'settlementStatement') && (s.due + s.refund === 0 || verified(g, 'settlementReceipt')), 'Verify the final statement and actual payment evidence first.');
      g.status = 'CLOSED'; g.settlement.closedAt = now; g.settlement.closedBy = user.sub;
    } else if (action === 'rehire') {
      hr(user); requireThat(g.status === 'CLOSED', 'Complete the previous settlement first.');
      g.history.push({ episode: g.episode, joinedOn: g.joinedOn, exit: g.exit, settlement: g.settlement, uniform: g.uniform, fee: g.fee, agreement: g.agreement, integrations: g.integrations, documentIds: g.documents.map(d => d.id) });
      requireThat(g.history.length <= 20, 'Archive review required before adding another employment episode.');
      g.episode += 1; g.status = 'DRAFT'; g.joinedOn = ''; g.uniform = { taken: 'UNKNOWN' }; g.agreement = {}; g.checklist = {}; g.fee = {}; g.integrations = { razorpay: {}, ubi: {} }; g.documents = []; g.exit = {}; g.settlement = {};
    } else fail('Unknown action.');
    g.version += 1; g.updatedAt = now;
    return { guard: g, event: { id: eventId, at: now, actor: user.sub, guardId: g.guardId, episode: g.episode, action, from: old.status, to: g.status, version: g.version } };
  }
  function summary(g) { return { id: g.id, guardId: g.guardId, city: g.city, owner: g.owner, name: g.personal.name, status: g.status, score: score(g).total, version: g.version, updatedAt: g.updatedAt, working: ['ACTIVE', 'EXIT_REQUESTED'].includes(g.status) }; }
  return { ROLES, PREFIXES, TYPES, REQUIRED_DOCS, PERSONAL, STATES, role, scope, text, date, money, only, fail, requireThat, clone, normalize, personal, currentDoc, verified, inventoryComplete, score, missing, fresh, mutate, summary, invalidate };
});
