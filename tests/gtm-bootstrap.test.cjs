const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const source = fs.readFileSync('gtm-bootstrap.js', 'utf8');

function setup(complete = false, idleAvailable = true) {
  const inserted = [], frames = [], work = [];
  let load;
  const existing = { event: 'contact_intent', channel: 'whatsapp' };
  const window = {
    dataLayer: [existing],
    addEventListener: (event, callback, options) => { assert.equal(event, 'load'); assert.equal(options.once, true); load = callback; },
    requestAnimationFrame: callback => frames.push(callback),
    setTimeout: callback => work.push(callback)
  };
  if (idleAvailable) window.requestIdleCallback = (callback, options) => { assert.equal(options.timeout, 1500); work.push(callback); };
  const document = { readyState: complete ? 'complete' : 'loading', createElement: () => ({}), getElementsByTagName: () => [{ parentNode: { insertBefore: script => inserted.push(script) } }] };
  vm.runInNewContext(source, { window, document });
  return { window, existing, inserted, frames, work, load: () => load() };
}

test('tracking waits for page load and a rendering opportunity, preserving early intent events', () => {
  const state = setup();
  assert.equal(state.inserted.length, 0);
  assert.equal(state.frames.length, 0);
  state.load();
  assert.equal(state.inserted.length, 0);
  state.frames.shift()();
  assert.equal(state.inserted.length, 0);
  state.work.shift()();
  assert.equal(state.window.dataLayer[0], state.existing);
  assert.equal(state.inserted.length, 1);
  assert.equal(state.inserted[0].src, 'https://www.googletagmanager.com/gtm.js?id=GTM-W59N8ZMC');
  assert.equal(state.inserted[0].async, true);
  assert.equal(state.window.dataLayer.filter(event => event.event === 'gtm.js').length, 1);
  state.load(); state.frames.shift()(); state.work.shift()();
  assert.equal(state.inserted.length, 1);
});

test('already loaded pages and browsers without idle callbacks still start tracking', () => {
  const state = setup(true, false);
  state.frames.shift()(); state.work.shift()();
  assert.equal(state.inserted.length, 1);
  assert.equal(state.window.dataLayer[0], state.existing);
});
