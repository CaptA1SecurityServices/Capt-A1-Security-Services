const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {PurgeCSS} = require('purgecss');
const postcss = require('postcss');
const cssnano = require('cssnano');

const pageStyles = {
  'index.html': ['home-services.css'],
  'about.html': [],
  'contact.html': [],
  'guard-hiring-ajmer.html': [],
  'schedule-interview.html': [],
  'privacy-policy/index.html': ['privacy-policy/privacy.css'],
  'services/index.html': ['services/services.css','services/editorial.css'],
  'services/security-services/index.html': ['services/services.css'],
  'services/security-services-jaipur/index.html': ['services/services.css'],
  'services/commercial-housekeeping/index.html': ['services/services.css'],
  'services/facility-manpower-services/index.html': ['services/services.css','services/editorial.css'],
  'services/workforce-management/index.html': ['services/services.css'],
  'services/security-equipment-site-readiness/index.html': ['services/services.css']
};
const scripts = ['script.js','home-services.js','gtm-bootstrap.js','google-ads-tag.js','interview-request.js','services/services.js'];
const hash = text => crypto.createHash('sha256').update(text).digest('hex').slice(0,12);
const check = process.argv.includes('--check');
const normalizeLines = text => text.replace(/\r\n?/g,'\n');

function write(file, content) {
  if (check) {
    if (!fs.existsSync(file)) throw new Error(`Build is missing: ${file}. Run npm run build.`);
    const exactBytes = /^static\/(css|js)\//.test(file);
    const actual = fs.readFileSync(file,'utf8');
    if ((exactBytes ? actual : normalizeLines(actual)) !== (exactBytes ? content : normalizeLines(content))) throw new Error(`Build is stale: ${file}. Run npm run build.`);
  } else fs.writeFileSync(file,content);
}

function cssSource(file) {
  const images = require('../images/responsive/manifest.json');
  return fs.readFileSync(file,'utf8').replace(/url\((["']?)([^)'"\s]+)\1\)/g, (match, quote, url) => {
    if (url.replace(/^\//,'') === images['recruitment-hero'].source) return `url("${images['recruitment-hero'].variants.at(-1).file}")`;
    if (/^(data:|https?:|\/|#)/.test(url)) return match;
    return `url("/${path.posix.normalize(path.posix.join(path.posix.dirname(file),url))}")`;
  });
}

(async () => {
  fs.mkdirSync('static/css',{recursive:true});
  fs.mkdirSync('static/js',{recursive:true});
  const scriptMap = Object.fromEntries(scripts.map(file => {
    const content = normalizeLines(fs.readFileSync(file,'utf8'));
    const output = `static/js/${path.basename(file,'.js')}.${hash(content)}.js`;
    write(output, content);
    return [file,'/'+output];
  }));
  const stats = {};
  for (const [page, extra] of Object.entries(pageStyles)) {
    const html = normalizeLines(fs.readFileSync(page,'utf8'));
    const sourceFiles = ['fonts/fonts.css','styles.css',...extra];
    let source = sourceFiles.map(cssSource).join('\n');
    if (page === 'guard-hiring-ajmer.html') {
      const variants = require('../images/responsive/manifest.json')['recruitment-hero'].variants;
      const mobile = variants.find(v=>v.width===768) || variants.at(-1);
      source += `\n@media(max-width:640px){.hiring-hero{background-image:url("${mobile.file}")}}`;
    }
    const purged = await new PurgeCSS().purge({
      content: [{raw:html,extension:'html'},...scripts.filter(file => file !== 'home-services.js' || page === 'index.html')],
      css:[{raw:source}],
      safelist: {standard: [/^is-/,/^mobile-sticky-/,/^photo-dialog/,/^form-status/,/^form-error/,/^has-/]},
      keyframes:false,
      fontFace:false,
      variables:false
    });
    const result = await postcss([cssnano({preset:['default',{discardUnused:false,reduceIdents:false,mergeRules:false}]})]).process(purged[0].css,{from:undefined});
    const css = result.css+'\n';
    const label = page === 'index.html' ? 'home' : page.replace(/\/index\.html$|\.html$/g,'').replaceAll('/','-');
    const output = `static/css/${label}.${hash(css)}.css`;
    write(output,css);
    let linked = false;
    let updated = html.replace(/<link\b[^>]*rel="stylesheet"[^>]*>\s*/g, tag => {
      if (!/(fonts\/fonts\.css|styles\.css|services\/(services|editorial)\.css|privacy-policy\/privacy\.css|static\/css\/)/.test(tag)) return tag;
      if (linked) return '';
      linked = true;
      return `<link rel="stylesheet" href="/${output}" />\n  `;
    });
    if (!linked) throw new Error(`No stylesheet found in ${page}`);
    updated = updated.replace(/<script\b[^>]*src="([^"]+)"[^>]*>/g, (tag, src) => {
      const sourcePath = src.replace(/^\//,'').split('?')[0];
      const input = scripts.find(file => file === sourcePath || new RegExp(`^static/js/${path.basename(file,'.js')}\\.[a-f0-9]+\\.js$`).test(sourcePath));
      return input ? tag.replace(`src="${src}"`,`src="${scriptMap[input]}"`) : tag;
    });
    write(page,updated);
    stats[page] = {sourceBytes:Buffer.byteLength(source),cssBytes:Buffer.byteLength(css),stylesheet:'/'+output};
  }
  write('static/build-manifest.json',JSON.stringify({styles:stats,scripts:scriptMap},null,2)+'\n');
  console.log(check ? 'Static bundles are current.' : JSON.stringify(stats,null,2));
})().catch(error => {console.error(error.message);process.exitCode=1;});
