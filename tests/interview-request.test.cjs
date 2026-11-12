const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname, '..', 'interview-request.js'), 'utf8');

function fixture(phoneValue, valid = true, language = 'en') {
  const fields = Object.fromEntries(Object.entries({
    SingleLine: ' Test Candidate ', SingleLine1: phoneValue, SingleLine2: ' Ajmer ',
    MultiLine: '', preferred_date: '2026-10-01', preferred_time: '2:00 PM - 4:00 PM',
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
    FormData: class {get(name) {return fields[name]?.value;}}
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
    assert.match(f.fields.MultiLine.value, /Permanent address: Permanent address, Rajasthan/);
    assert.match(f.fields.MultiLine.value, /Current address: Ajmer/);
    assert.match(f.fields.MultiLine.value, /Willing to relocate: Yes/);
    assert.doesNotMatch(f.fields.MultiLine.value, /Preferred duty area|undefined|null/);
    assert.match(f.fields.MultiLine.value, /Preferred date: 2026-10-01/);
    assert.match(f.fields.MultiLine.value, /awaiting recruiter confirmation/);
    assert.equal(f.button.disabled, true);
    assert.equal(f.submit().prevented, true, 'prevent repeat submission while navigating');
  }
});
test('all requested roles and relocation choices reach the existing Zoho notes field', () => {
  for (const role of ['Supervisor', 'Security Guard', 'Housekeeping', 'Office Boy', 'Bouncer', 'PSO', 'HR']) {
    for (const relocate of ['Yes', 'No']) {
      const f = fixture('0000092701');
      f.fields.role.value = role;
      f.fields.willing_to_relocate.value = relocate;
      f.fields.permanent_address.value = 'P'.repeat(200);
      f.fields.SingleLine2.value = 'C'.repeat(200);
      assert.equal(f.submit().prevented, false);
      assert.ok(f.fields.MultiLine.value.includes(`Role: ${role}\n`));
      assert.ok(f.fields.MultiLine.value.includes(`Willing to relocate: ${relocate}\n`));
      assert.ok(f.fields.MultiLine.value.length <= 2000, 'Fit the existing Zoho notes field');
    }
  }
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
    assert.equal(f.fields.MultiLine.value, '');
  }
  assert.equal(fixture('0000092701', false).submit().prevented, true);
});
test('Hindi payload and empty trimmed name validation', () => {
  const f = fixture('0000092701', true, 'hi');
  f.submit();
  assert.match(f.fields.MultiLine.value, /Form language: Hindi/);
  assert.ok(f.fields.MultiLine.value.length <= 2000);
  const blank = fixture('0000092701');
  blank.fields.SingleLine.value = '   ';
  assert.equal(blank.submit().prevented, true);
});
