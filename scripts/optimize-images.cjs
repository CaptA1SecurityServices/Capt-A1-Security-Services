const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const sharp = require('sharp');

// Originals remain available for full-view galleries. Only website derivatives are generated.
const sources = {
  'residential-guards': 'images/FieldWork/samriddhi-dynasty-guards.webp',
  'residential-entrance': 'images/FieldWork/saarth-pratham-main-gate.webp',
  'residential-site': 'images/FieldWork/saarth-pratham-wide.webp',
  'executive-protection': 'images/Our Services/ExecutiveProtection2.png',
  'security-briefing': 'images/Our Services/Security Guards.png',
  'security-leadership': 'images/Our Services/Gunman.png',
  'event-security-team': 'images/Our Services/BOUNCERS.png',
  'security-personnel': 'images/FieldWork/ReliablePeople.png',
  'founder': 'images/MyIMG/passport-Photo.webp',
  'grounds-care': 'images/housekeeping/grounds-original.webp',
  'hospitality-support': 'images/housekeeping/hospitality-original.webp',
  'housekeeping-team': 'images/housekeeping/team-original.webp',
  'housekeeping-wide': 'images/FieldWork/housekeeping-team-wide-ai.webp',
  'sweeping': 'images/housekeeping/sweeping-original.webp',
  'planting': 'images/housekeeping/planting-original.webp',
  'guard-duty': 'images/security-1.jpg',
  'recruitment-hero': 'images/FieldWork/security-guards-hero-v2.webp',
  'logo': 'images/LOGO/captain-a1-logo.png',
  'client-sarodha': 'images/clients/sarodha.png',
  'client-lpm': 'images/clients/lpm-engineering.jpg',
  'client-keshav': 'images/clients/keshav-kripa.png',
  'client-surge': 'images/clients/surge-alloys.png'
};

async function variants(source, slug, crop) {
  const original = fs.readFileSync(source);
  const metadata = await sharp(original).metadata();
  const width = crop?.width || metadata.width;
  const widths = slug === 'logo' ? [448] : slug.startsWith('client-') ? [240] : [...new Set([360, 540, 768, 960, Math.min(width, 1280)].filter(w => w <= width))].sort((a,b) => a-b);
  const result = [];
  for (const size of widths) {
    let image = sharp(original).rotate();
    if (crop) image = image.extract(crop);
    const bytes = await image.resize({width: size, withoutEnlargement: true}).webp({quality: slug === 'logo' ? 90 : 74, effort: 6}).toBuffer();
    const hash = crypto.createHash('sha256').update(bytes).digest('hex').slice(0, 12);
    const file = `images/responsive/${slug}-${size}.${hash}.webp`;
    fs.writeFileSync(file, bytes);
    const output = await sharp(bytes).metadata();
    result.push({file: '/'+file, width: output.width, height: output.height, bytes: bytes.length});
  }
  return {source, originalBytes: original.length, variants: result};
}

(async () => {
  fs.mkdirSync('images/responsive', {recursive:true});
  const manifest = {};
  for (const [slug, source] of Object.entries(sources)) manifest[slug] = await variants(source, slug);
  // Deliberate crops keep the guards in the mobile hero instead of downloading empty ceiling.
  manifest['home-hero'] = await variants(sources['residential-guards'], 'home-hero', {left:0, top:650, width:1350, height:760});
  manifest['home-hero-mobile'] = await variants(sources['residential-guards'], 'home-hero-mobile', {left:0, top:620, width:1350, height:900});
  fs.writeFileSync('images/responsive/manifest.json', JSON.stringify(manifest, null, 2)+'\n');
  console.log(`Generated responsive derivatives for ${Object.keys(manifest).length} images.`);
})().catch(error => { console.error(error.message); process.exitCode = 1; });
