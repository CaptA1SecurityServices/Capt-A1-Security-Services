const fs = require('node:fs');
const crypto = require('node:crypto');
const sharp = require('sharp');

(async () => {
  const source = 'images/MyIMG/passport-Photo.webp';
  fs.mkdirSync('images/portraits', {recursive: true});
  const variants = [];
  for (const width of [540, 840, 1149]) {
    const bytes = await sharp(source).rotate()
      .resize({width, withoutEnlargement: true})
      .webp({quality: 94, effort: 6}).toBuffer();
    const hash = crypto.createHash('sha256').update(bytes).digest('hex').slice(0, 12);
    const file = `images/portraits/founder-${width}.${hash}.webp`;
    fs.writeFileSync(file, bytes);
    const metadata = await sharp(bytes).metadata();
    variants.push({file: '/' + file, width: metadata.width, height: metadata.height, bytes: bytes.length});
  }
  fs.writeFileSync('images/portraits/manifest.json', JSON.stringify({source, variants}, null, 2) + '\n');
  console.log('Prepared high-quality founder portraits without changing the original face or crop.');
})().catch(error => {console.error(error.message); process.exitCode = 1;});
