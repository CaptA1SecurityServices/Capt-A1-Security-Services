const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const {test} = require('node:test');
const build = require('../static/build-manifest.json');
const pages = Object.keys(build.styles);
const root = path.resolve('.');

function localFile(href, page) {
  const location = new URL(href, 'https://captaina1.com/'+page);
  if (location.origin !== 'https://captaina1.com') return;
  let file = decodeURIComponent(location.pathname);
  if (file.endsWith('/')) file += 'index.html';
  const absolute = path.resolve(root,'.'+file);
  assert.ok(absolute.startsWith(root+path.sep), 'Local target stays in the website');
  return {file:absolute, fragment:decodeURIComponent(location.hash.slice(1))};
}

test('public pages retain working local assets, links and structured data', () => {
  for (const page of pages) {
    const html = fs.readFileSync(page,'utf8');
    for (const match of html.matchAll(/(?:href|src|data-src)="([^"]*)"/g)) {
      const href = match[1].replaceAll('&amp;','&');
      if (!href || !/^([/.#]|[^:]+$)/.test(href) || /^https?:/.test(href)) continue;
      const target = localFile(href,page);
      assert.ok(fs.existsSync(target.file), `Missing local target in ${page}: ${href}`);
      if (target.fragment && target.file.endsWith('.html')) {
        const targetHtml = fs.readFileSync(target.file,'utf8');
        assert.ok(targetHtml.includes(`id="${target.fragment}"`), `Missing fragment in ${page}: ${href}`);
      }
    }
    for (const match of html.matchAll(/(?:srcset|data-srcset)="([^"]*)"/g)) {
      for (const item of match[1].split(',')) assert.ok(fs.existsSync(localFile(item.trim().split(/\s+/)[0],page).file), `Missing responsive image in ${page}`);
    }
    for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) JSON.parse(match[1]);
    assert.ok(html.includes('href="/privacy-policy/"'), `Privacy footer link missing in ${page}`);
    assert.ok(!html.includes('gtag/js?id=AW-18297382444'), `Duplicate Google Ads loader in ${page}`);
    assert.ok(!html.includes("'unsafe-inline'") && !html.includes("'unsafe-eval'"), `Broad CSP exemption in ${page}`);
  }
});

test('fingerprinted assets match their content and bundled font URLs exist', () => {
  for (const file of [...Object.values(build.styles).map(s=>s.stylesheet),...Object.values(build.scripts)]) {
    const bytes = fs.readFileSync('.'+file);
    const hash = crypto.createHash('sha256').update(bytes).digest('hex').slice(0,12);
    assert.ok(file.includes('.'+hash+'.'), `Incorrect asset fingerprint: ${file}`);
    if (file.endsWith('.css')) for (const match of bytes.toString().matchAll(/url\(["']?(\/fonts\/[^)"']+)/g)) assert.ok(fs.existsSync('.'+match[1]), `Missing bundled font: ${match[1]}`);
  }
  const images=require('../images/responsive/manifest.json');
  for(const image of Object.values(images))for(const variant of image.variants){
    const bytes=fs.readFileSync('.'+variant.file);
    assert.ok(variant.file.includes('.'+crypto.createHash('sha256').update(bytes).digest('hex').slice(0,12)+'.'), 'Image fingerprint matches');
  }
});

test('map embeds wait for interaction and the sitemap excludes unavailable services', () => {
  const contact=fs.readFileSync('contact.html','utf8');
  assert.equal((contact.match(/data-map-load/g)||[]).length,3);
  assert.ok(!/<iframe[^>]+src="https:\/\/www\.google\.com\/maps/.test(contact));
  const sitemap=fs.readFileSync('sitemap.xml','utf8');
  for(const slug of ['security-services-jaipur','commercial-housekeeping'])assert.ok(sitemap.includes(`/services/${slug}/`));
  for(const slug of ['workforce-management','security-equipment-site-readiness']){
    assert.ok(!sitemap.includes(`/services/${slug}/`));
    assert.match(fs.readFileSync(`services/${slug}/index.html`,'utf8'),/<meta name="robots" content="noindex/);
  }
});
