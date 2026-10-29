// Datos de muestra y respuesta interceptada: no invoca proveedores de IA.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const JSZip = require('jszip');
(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 950 } });
    const solicitudes = [];
    await page.route('**/api/ia/terminal', async route => {
      solicitudes.push(route.request().postDataJSON());
      const plan = JSON.parse(fs.readFileSync('src/demo/planMuestra.json', 'utf8'));
      plan.assessmentInstrument = {name:'Lista de cotejo',instructions:'Marcar una opción',columns:['Sí','No','No observado','Observaciones'],rows:[{criterion:'Usa evidencia',descriptors:['☐','☐','☐','Registrar evidencia']}],scoring:'Criterios observados'};
      plan.mccemsAlignment = { documentUrl: 'https://fuente-inventada.invalid/', validated: true };
      await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ plan, modelo: 'prueba-interceptada' }) });
    });
    await page.goto(process.env.EDUPLAN_TEST_URL || 'http://127.0.0.1:3012/');
    await page.getByText('Probar con datos de muestra', { exact: false }).first().click();
    await page.getByRole('button', { name: 'Generar Planeación', exact: false }).first().click();
    await page.getByRole('combobox', { name: 'Progresión oficial', exact: true }).selectOption({ index: 10 });
    const seleccionAnterior = await page.getByRole('combobox', { name: 'Progresión oficial', exact: true }).inputValue();
    await page.getByRole('combobox', { name: 'Modelo del grupo' }).selectOption('2025');
    assert.equal(await page.getByRole('combobox', { name: 'Progresión oficial', exact: true }).count(), 0);
    await page.getByText('Sin programa verificado para este modelo.', { exact: false }).waitFor();
    await page.getByPlaceholder('Escribe el tema para tu propuesta general').fill('Seguridad digital');
    await page.getByRole('combobox', { name: 'Modelo del grupo' }).scrollIntoViewIfNeeded();
    await page.screenshot({ path: '/tmp/eduplan-curriculo-general.png' });
    await page.getByRole('button', { name: 'Revisar información antes de generar' }).click();
    await page.getByRole('button', { name: 'Generar planeación', exact: true }).click();
    await page.getByRole('heading', { name: 'Revisa qué compartes' }).waitFor({ state: 'detached' });
    assert.ok(solicitudes[0].systemInstruction.includes('PROPUESTA GENERAL'));
    assert.ok(solicitudes[0].systemInstruction.includes('Modelo curricular: 2025'));
    assert.ok(!solicitudes[0].systemInstruction.includes(seleccionAnterior));
    await page.locator('article').getByText('Propuesta general', { exact: false }).waitFor();
    assert.ok((await page.locator('article').innerText()).includes('modelo 2025'));
    await page.getByRole('button', { name: 'Confirmo que revisé esta planeación' }).click();
    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: /Word/ }).first().click();
    const archivo = await download;
    const zip = await JSZip.loadAsync(fs.readFileSync(await archivo.path()));
    const xml = await zip.file('word/document.xml').async('string');
    assert.ok(xml.includes('Propuesta general'));
    assert.ok(xml.includes('modelo 2025'));
    await page.getByRole('button', { name: 'Ajustar otra planeación' }).click();
    await page.getByRole('combobox', { name: 'Modelo del grupo' }).selectOption('2024');
    assert.equal(await page.getByRole('combobox', { name: 'Progresión oficial', exact: true }).inputValue(), '');
    await page.getByRole('combobox', { name: 'Progresión oficial', exact: true }).selectOption({ index: 10 });
    await page.getByRole('combobox', { name: 'Modelo del grupo' }).scrollIntoViewIfNeeded();
    await page.screenshot({ path: '/tmp/eduplan-curriculo-oficial.png' });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole('combobox', { name: 'Modelo del grupo' }).scrollIntoViewIfNeeded();
    await page.screenshot({ path: '/tmp/eduplan-curriculo-mobile.png' });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
    // Comprobar también el servicio real y la normalización de salida, con el transporte simulado.
    const resultado = await page.evaluate(async () => {
      const { generateLessonPlan } = await import('/services/geminiService.ts');
      const { programasSEPService } = await import('/src/services/programasSEPService.ts');
      const { idPrograma } = await import('/src/features/planeacion/seleccionCurricular.ts');
      const p = programasSEPService.buscarPorMateria('Cultura Digital I').find(p => p.modelo === '2024');
      const school = JSON.parse(localStorage.getItem('schoolContext'));
      const subject = JSON.parse(localStorage.getItem('subjectContext'));
      const plan = await generateLessonPlan('Tema de muestra', school, subject, '', undefined, undefined, undefined, '', { programaId: idPrograma(p), modelo: '2024', progresionId: p.progresiones[9].id });
      return { fuente: plan.curricularSource, alineacion: plan.mccemsAlignment, texto: plan.progression, esperado: p.progresiones[9].descripcion, url: p.url_fuente };
    });
    assert.equal(resultado.texto, resultado.esperado);
    assert.equal(resultado.fuente.url, resultado.url);
    assert.equal(resultado.alineacion.validated, false);
    assert.ok(solicitudes.at(-1).systemInstruction.includes(resultado.esperado));
    console.log('OK currículo: cambio de modelo limpia progresión; propuesta general sin currículo anterior; etiqueta de salida; selección exacta y completa en petición, metadatos y resultado; móvil sin desbordamiento.');
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exit(1); });
