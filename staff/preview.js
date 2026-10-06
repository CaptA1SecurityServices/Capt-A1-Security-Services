/* Synthetic, memory-only preview. Loaded solely on localhost with ?preview=1. */
window.A1StaffPreview = function () {
  const C = window.A1StaffCore, records = new Map(), receipts = new Map(), files = new Map(), events = [];
  const users = C.ROLES.map(role => ({ sub: 'preview-' + role, email: role.toLowerCase() + '@example.invalid', role, cities: ['AJMER', 'JAIPUR'], enabled: true }));
  let user = users[0], counters = { AJMER: 8000, JAIPUR: 8000 };
  const now = () => new Date().toISOString();
  const fixture = C.fresh('preview-guard-0001', 'AJMER', 8000, user, now());
  fixture.personal = { name: 'Demo Guard · काल्पनिक', fatherName: 'Demo Father', dob: '1990-01-01', mobile: '9000000000', emergencyMobile: '9000000001', education: 'Class 10', experience: 'Fresher', address: 'Synthetic preview address' };
  records.set(fixture.id, fixture);
  function response(g) { return { guard: C.clone(g), score: C.score(g), missing: C.missing(g, 'SUBMIT') }; }
  return {
    switchRole(role) { user = users.find(u => u.role === role); },
    async call(action, data = {}, id, version, requestId) {
      if (receipts.has(requestId)) return C.clone(receipts.get(requestId));
      let out;
      if (action === 'bootstrap') return { user: C.clone(user), cities: C.PREFIXES };
      if (action === 'search') { const query = C.normalize(data.query); const all = [...records.values()].filter(g => { try { C.scope(user, g); return (!data.status || g.status === data.status) && (!query || C.normalize(g.personal.name).includes(query) || g.guardId.toLowerCase().startsWith(query) || g.personal.mobile.startsWith(query)); } catch { return false; } }); const offset = data.offset || 0; return { total: all.length, rows: all.slice(offset, offset + 30).map(C.summary), nextOffset: offset + 30 < all.length ? offset + 30 : null }; }
      if (action === 'create') { const g = C.fresh(crypto.randomUUID(), data.city, ++counters[data.city], user, now()); records.set(g.id, g); out = response(g); }
      else if (action === 'listUsers') { C.role(user, ['SUPER_ADMIN']); return { users }; }
      else if (action === 'saveUser') { C.role(user, ['SUPER_ADMIN']); out = { user: data }; }
      else { const g = records.get(id); C.requireThat(g, 'Guard not found.'); C.scope(user, g);
        if (action === 'get') return response(g);
        if (action === 'history') return { events: events.filter(e => e.guardId === g.guardId).slice(-40).reverse(), episodes: [], currentDocuments: ['HR','SUPER_ADMIN'].includes(user.role) ? g.documents.filter(d => ['UPLOADED','SUPERSEDED'].includes(d.state)) : [] };
        C.requireThat(version === g.version, 'Record changed. Reload it.', 'CONFLICT');
        const changed = C.mutate(g, action, data, user, now(), requestId); events.push(changed.event); records.set(id, changed.guard); out = response(changed.guard);
      }
      receipts.set(requestId, C.clone(out)); return out;
    },
    async upload(g, type, file) {
      const record = records.get(g.id); C.scope(user, record); C.requireThat(record.version === g.version, 'Record changed. Reload it.');
      if (['feeReceipt', 'settlementStatement', 'settlementReceipt'].includes(type)) C.role(user, ['HR', 'SUPER_ADMIN']);
      record.documents.forEach(d => { if (d.type === type && d.state === 'UPLOADED') d.state = 'SUPERSEDED'; });
      const id = crypto.randomUUID(); record.documents.push({ id, type, mime: file.type, size: file.size, state: 'UPLOADED', review: 'PENDING', uploader: user.sub }); files.set(id, file);
      if (['aadhaar', 'pan', 'passbook', 'selfie', 'agreement'].includes(type)) C.invalidate(record);
      if (type === 'agreement') record.agreement = {};
      if (type === 'feeReceipt') record.fee = {}; record.version++; record.updatedAt = now(); return response(record);
    },
    async download(id) { return files.get(id); }
  };
};
