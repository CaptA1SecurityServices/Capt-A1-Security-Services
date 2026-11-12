const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname, '..', 'interview-request.js'), 'utf8');

function fixture(phoneValue, valid = true, language = 'en') {
  const fields = Object.fromEntries(Object.entries({
    SingleLine: ' Test Candidate ', SingleLine1: phoneValue, SingleLine2: ' Ajmer ',
    request_id: '', form_language: language, preferred_date: '2026-10-01', preferred_time: '2:00 PM - 4:00 PM',
    role: 'Security Guard', permanent_address: ' Permanent address, Rajasthan ',
    willing_to_relocate: 'Yes', consent: 'on'
  }).map(([key, value]) => [key, {value, error: '', addEventListener() {}, setCustomValidity(message) {this.error = message;}}]));
  const button = {disabled: true};
  const status = {textContent: ''};
  let submit;
  const form = {
    dataset: {formLanguage: language},
    elements: {namedItem: (name) => fields[name]},
    querySelector: (selector) => selector.includes('button') ? button : status,
    addEventListener: (name, callback) => { if (name === 'submit') submit = callback; },
    reportValidity: () => valid && !fields.SingleLine1.error && !!fields.SingleLine.value && !!fields.SingleLine2.value
  };
  vm.runInNewContext(source, {
    document: {querySelectorAll: () => [form]},
    window: {addEventListener() {}, setTimeout() {}}, Date, Intl,
    crypto: require('node:crypto').webcrypto, URLSearchParams,
    FormData: class {
      *[Symbol.iterator]() {for (const [name, field] of Object.entries(fields)) yield [name, field.value];}
    }
  });
  return {fields, button, status, submit() {
    const event = {prevented: false, preventDefault() {this.prevented = true;}};
    submit(event);
    return event;
  }};
}

test('common phone formats normalize to one matching value', () => {
  for (const input of ['0000092701', '+91 00000 92701', '910000092701', '00910000092701', '(00000) 92701']) {
    const f = fixture(input);
    assert.equal(f.submit().prevented, false);
    assert.equal(f.fields.SingleLine1.value, '+910000092701');
    assert.equal(f.fields.SingleLine.value, 'Test Candidate');
    assert.equal(f.fields.SingleLine2.value, 'Ajmer');
    assert.equal(f.fields.permanent_address.value, 'Permanent address, Rajasthan');
    assert.match(f.fields.request_id.value, /^[a-f0-9-]{36}$/);
    assert.equal(f.button.disabled, true);
    assert.equal(f.submit().prevented, true, 'prevent repeat submission while navigating');
  }
});
test('both forms submit the requested roles and relocation as separate fields', () => {
  for (const role of ['Supervisor', 'Security Guard', 'Housekeeping', 'Office Boy', 'Bouncer', 'PSO', 'HR']) {
    for (const relocate of ['Yes', 'No']) {
      const f = fixture('0000092701');
      f.fields.role.value = role;
      f.fields.willing_to_relocate.value = relocate;
      f.fields.permanent_address.value = 'P'.repeat(200);
      f.fields.SingleLine2.value = 'C'.repeat(200);
      assert.equal(f.submit().prevented, false);
      assert.equal(f.fields.role.value, role);
      assert.equal(f.fields.willing_to_relocate.value, relocate);
    }
  }
  const forms = fs.readFileSync('schedule-interview.html', 'utf8');
  assert.equal((forms.match(/action="https:\/\/script\.google\.com\/macros\/s\/[^"]+\/exec"/g) || []).length, 2);
  assert.doesNotMatch(forms, /forms\.zohopublic\.in|multipart\/form-data|name="MultiLine"/);
});
test('old hiring links redirect directly and retain campaign parameters', () => {
  let target;
  vm.runInNewContext(fs.readFileSync('hiring-redirect.js', 'utf8'), {
    URL,
    window: {location: {origin: 'https://captaina1.com', search: '?utm_source=meta&gclid=example', replace(url) {target=url;}}}
  });
  assert.equal(target, 'https://captaina1.com/schedule-interview.html?utm_source=meta&gclid=example');
  const html = fs.readFileSync('guard-hiring-ajmer.html', 'utf8');
  assert.match(html, /http-equiv="refresh" content="0;url=\/schedule-interview.html"/);
  for (const page of ['guard-hiring-ajmer.html','schedule-interview.html']) {
    assert.doesNotMatch(fs.readFileSync(page,'utf8'), /tel:|wa\.me|8003091425|duty_area|पसंदीदा ड्यूटी क्षेत्र/);
  }
});
test('bad phone values and invalid native fields cannot submit', () => {
  for (const input of ['123', 'abcdefghij', '+1 2345678901', '0000092701123']) {
    const f = fixture(input);
    assert.equal(f.submit().prevented, true);
    assert.equal(f.fields.request_id.value, '');
  }
  assert.equal(fixture('0000092701', false).submit().prevented, true);
});
test('Hindi payload and empty trimmed name validation', () => {
  const f = fixture('0000092701', true, 'hi');
  f.submit();
  assert.equal(f.fields.form_language.value, 'hi');
  const blank = fixture('0000092701');
  blank.fields.SingleLine.value = '   ';
  assert.equal(blank.submit().prevented, true);
});
