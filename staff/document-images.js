/* Combines selected photographs locally into one PDF for the existing private upload. */
window.A1DocumentImages = async function (files) {
  if (files.length < 2) return files[0];
  if (files.length > 10 || files.some(file => !['image/jpeg', 'image/png'].includes(file.type))) {
    throw new Error('Choose up to 10 JPG or PNG photos, or one PDF.');
  }
  if (files.some(file => file.size > 10485760) || files.reduce((sum, file) => sum + file.size, 0) > 52428800) {
    throw new Error('Choose photos under 10 MB each and 50 MB in total.');
  }
  const pages = [];
  for (const file of files) {
    const bitmap = await createImageBitmap(file);
    try {
      const scale = Math.min(1, 1800 / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const context = canvas.getContext('2d');
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      let jpeg;
      for (const quality of [0.88, 0.76, 0.64]) {
        jpeg = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', quality));
        if (jpeg && jpeg.size < 2800000 / files.length) break;
      }
      if (!jpeg) throw new Error('The selected photo could not be read.');
      pages.push({ width: canvas.width, height: canvas.height, bytes: new Uint8Array(await jpeg.arrayBuffer()) });
      canvas.width = canvas.height = 1;
    } finally {
      bitmap.close();
    }
  }

  const encoder = new TextEncoder();
  const chunks = [];
  const offsets = [0];
  let length = 0;
  function append(value) {
    const bytes = typeof value === 'string' ? encoder.encode(value) : value;
    chunks.push(bytes);
    length += bytes.length;
  }
  function object(id, content, stream) {
    offsets[id] = length;
    append(id + ' 0 obj\n' + content);
    if (stream) { append('\nstream\n'); append(stream); append('\nendstream'); }
    append('\nendobj\n');
  }
  append('%PDF-1.4\n');
  object(1, '<< /Type /Catalog /Pages 2 0 R >>');
  object(2, '<< /Type /Pages /Count ' + pages.length + ' /Kids [' + pages.map((_, i) => (3 + i * 3) + ' 0 R').join(' ') + '] >>');
  pages.forEach((page, index) => {
    const id = 3 + index * 3;
    const width = page.width > page.height ? 842 : 595;
    const height = page.width > page.height ? 595 : 842;
    const scale = Math.min((width - 32) / page.width, (height - 32) / page.height);
    const w = page.width * scale, h = page.height * scale;
    const content = encoder.encode('q ' + w.toFixed(2) + ' 0 0 ' + h.toFixed(2) + ' ' + ((width - w) / 2).toFixed(2) + ' ' + ((height - h) / 2).toFixed(2) + ' cm /Photo Do Q');
    object(id, '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + width + ' ' + height + '] /Resources << /XObject << /Photo ' + (id + 2) + ' 0 R >> >> /Contents ' + (id + 1) + ' 0 R >>');
    object(id + 1, '<< /Length ' + content.length + ' >>', content);
    object(id + 2, '<< /Type /XObject /Subtype /Image /Width ' + page.width + ' /Height ' + page.height + ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' + page.bytes.length + ' >>', page.bytes);
  });
  const xref = length;
  append('xref\n0 ' + offsets.length + '\n0000000000 65535 f \n');
  offsets.slice(1).forEach(offset => append(String(offset).padStart(10, '0') + ' 00000 n \n'));
  append('trailer\n<< /Size ' + offsets.length + ' /Root 1 0 R >>\nstartxref\n' + xref + '\n%%EOF\n');
  const result = new File(chunks, 'document-photos.pdf', { type: 'application/pdf' });
  if (result.size > 3145728) throw new Error('The combined document exceeds 3 MB. Choose smaller photos or fewer pages.');
  return result;
};
