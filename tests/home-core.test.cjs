const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
test('Homepage retains the four original services, photos, descriptions and enquiry destinations',()=>{
  const html=fs.readFileSync('index.html','utf8');
  const expected=require('./fixtures/home-core-content.json');
  const section=html.match(/<section[^>]+id="services"[\s\S]*?<\/section>/)[0];
  const cards=[...section.matchAll(/<article class="service-card">([\s\S]*?)<\/article>/g)].map(m=>{const s=m[1];return {heading:s.match(/<h3>(.*?)<\/h3>/)[1],body:s.match(/<p>(.*?)<\/p>/)[1],link:s.match(/<a class="text-link" href="([^"]+)">(.*?) <span/).slice(1),image:s.match(/<img[^>]+src="([^"]+)"/)[1],alt:s.match(/<img[^>]+alt="([^"]+)"/)[1]}});
  assert.deepEqual(cards,expected.cards);
  const normalise=s=>s.replace(/\r\n?/g,'\n');
  assert.equal(normalise(section.match(/<div class="service-directory">([\s\S]*?)<\/div>/)[1].trim()),normalise(expected.directory));
  assert.ok(section.includes('Core services.'));
});
