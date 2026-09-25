const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.goto('file://' + path.resolve(process.argv[2]), { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  await p.pdf({
    path: process.argv[3], format: 'A4', printBackground: true, preferCSSPageSize: true,
    displayHeaderFooter: true, headerTemplate: '<span></span>',
    footerTemplate: `<div style="width:100%;font-family:Arial,sans-serif;font-size:7.5pt;color:#8B84A8;padding:0 15mm;display:flex;justify-content:space-between">
      <span>ДРОП.НЕТ · КАРТА ПРОБЛЕМЫ · МБОУ СОШ № 4 г. Большой Камень</span>
      <span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>`,
  });
  await b.close();
})();
