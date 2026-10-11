// Sólo extrae texto; no interpreta vínculos ni ejecuta contenido del documento.
export async function extraerArchivo(file: File): Promise<string> {
  if (file.size > 10 * 1024 * 1024) throw new Error('El archivo supera 10 MB. Divídelo en secciones.');
  const ext = file.name.split('.').pop()?.toLowerCase();
  let text = '';
  if (ext === 'pdf') {
    const pdf = await import('pdfjs-dist');
    const worker = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
    pdf.GlobalWorkerOptions.workerSrc = worker.default;
    const task = pdf.getDocument({ data: new Uint8Array(await file.arrayBuffer()), isEvalSupported: false });
    const d = await task.promise;
    try {
      if (d.numPages > 150) throw new Error('Máximo 150 páginas por fuente.');
      for (let p = 1; p <= d.numPages; p++) {
        const page = await d.getPage(p); const content = await page.getTextContent();
        text += `\n[Página ${p}]\n` + content.items.map(i => 'str' in i ? i.str : '').join(' ');
        if (text.length > 80000) throw new Error('El texto supera 80,000 caracteres. Divide el documento.');
      }
    } finally { await d.destroy(); }
    if (text.replace(/\[Página \d+\]/g, '').trim().length < 30) throw new Error('Este PDF no contiene texto legible. Realiza OCR y pega el texto revisado.');
  } else if (ext === 'docx') {
    const { default: JSZip } = await import('jszip');
    const zip = await JSZip.loadAsync(await file.arrayBuffer());
    const entry = zip.file('word/document.xml');
    if (!entry) throw new Error('No se encontró texto en el DOCX.');
    const xml = await entry.async('string');
    if (xml.length > 4000000) throw new Error('El documento descomprimido es demasiado extenso.');
    const d = new DOMParser().parseFromString(xml, 'application/xml');
    if (d.querySelector('parsererror')) throw new Error('El DOCX no pudo leerse.');
    text = Array.from(d.getElementsByTagName('w:p')).map(p => Array.from(p.getElementsByTagName('w:t')).map(t => t.textContent || '').join('')).join('\n');
  } else if (['txt', 'md'].includes(ext || '')) text = await file.text();
  else throw new Error('Usa PDF con texto, DOCX, TXT o Markdown.');
  if (!text.trim() || text.length > 80000) throw new Error('Se requiere texto entre 1 y 80,000 caracteres.');
  return text.trim();
}
