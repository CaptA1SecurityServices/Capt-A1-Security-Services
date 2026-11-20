const fs = require('node:fs');
const crypto = require('node:crypto');
const sharp = require('sharp');

const slugs = [
  'duty-desk',
  'night-record-review',
  'team-appreciation-warehouse',
  'team-appreciation-security-post',
  'team-appreciation-site-entrance'
];

(async () => {
  const manifest = {};
  fs.mkdirSync('images/team/responsive', {recursive: true});
  for (const slug of slugs) {
    const variants = [];
    for (const width of [480, 768, 1200]) {
      const bytes = await sharp('images/team/' + slug + '.webp')
        .resize({width, withoutEnlargement: true})
        .webp({quality: 78, effort: 6})
        .toBuffer();
      const hash = crypto.createHash('sha256').update(bytes).digest('hex').slice(0, 12);
      const file = 'images/team/responsive/' + slug + '-' + width + '.' + hash + '.webp';
      fs.writeFileSync(file, bytes);
      variants.push({file: '/' + file, width, height: width * 4 / 3, bytes: bytes.length});
    }
    manifest[slug] = {full: '/images/team/' + slug + '.webp', variants};
  }
  fs.writeFileSync('images/team/manifest.json', JSON.stringify(manifest, null, 2) + '\n');
  console.log('Prepared responsive versions of five team photographs.');
})().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
