const { chromium } = require('playwright'); const path=require('path'); const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080}});
await p.goto('file://'+path.resolve('video2.html'));
const d=await p.evaluate(()=>({total:TOTAL,cues:CUES,starts:[...document.querySelectorAll('.scene')].length}));
fs.writeFileSync('cues.json',JSON.stringify(d,null,1)); console.log(d.total,d.cues.length); await b.close();})();
