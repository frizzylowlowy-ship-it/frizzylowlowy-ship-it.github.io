const { chromium } = require('playwright'); const path=require('path'); const {spawn}=require('child_process');
const FF=process.env.FF, FPS=30;
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080}});
p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file://'+path.resolve('video.html'),{waitUntil:'networkidle'});await p.evaluate(()=>document.fonts.ready);
const total=await p.evaluate(()=>TOTAL); const N=Math.round(total*FPS);
const ff=spawn(FF,['-y','-f','image2pipe','-framerate',String(FPS),'-c:v','mjpeg','-i','-','-c:v','libx264','-pix_fmt','yuv420p','-preset','medium','-crf','18','-movflags','+faststart',process.argv[2]],{stdio:['pipe','ignore','inherit']});
const t0=Date.now();
for(let i=0;i<N;i++){ await p.evaluate(t=>render(t),i/FPS); const buf=await p.screenshot({type:'jpeg',quality:92});
  if(!ff.stdin.write(buf)) await new Promise(r=>ff.stdin.once('drain',r));
  if(i%300===0) console.log('frame',i,'/',N, ((Date.now()-t0)/1000).toFixed(0)+'s'); }
ff.stdin.end(); await new Promise(r=>ff.on('close',r)); await b.close(); console.log('done',N);})();
