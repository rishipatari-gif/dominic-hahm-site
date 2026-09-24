// Full-page capture with scroll-reveal animations already settled.
import puppeteer from 'puppeteer';
import { readFileSync, readdirSync } from 'node:fs';
const base = process.env.HOME + '/.cache/puppeteer/chrome';
let exe = process.env.PUPPETEER_EXECUTABLE_PATH || null;
if (!exe) for (const x of readdirSync(base).sort().reverse()){
  for (const a of ['chrome-mac-arm64','chrome-mac-x64']){
    const p=`${base}/${x}/${a}/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`;
    try{ readFileSync(p); exe=p; break; }catch{}
  }
  if(exe) break;
}
const [url, out, w='1440', h='900', mobile=''] = process.argv.slice(2);
const b=await puppeteer.launch({executablePath:exe, headless:'new'});
const p=await b.newPage();
await p.setViewport({width:+w, height:+h, deviceScaleFactor:2, isMobile: mobile==='mobile', hasTouch: mobile==='mobile'});
await p.goto(url,{waitUntil:'networkidle0'});
await p.evaluate(async ()=>{
  document.querySelectorAll('.reveal').forEach(e=>{ e.style.transition='none'; e.classList.add('in'); });
  // force lazy images to load: fullPage capture never scrolls past them otherwise
  const imgs=[...document.images];
  imgs.forEach(i=>{ i.loading='eager'; });
  await Promise.all(imgs.map(i=> i.complete ? null : new Promise(r=>{ i.onload=i.onerror=r; })));
  await Promise.all(imgs.map(i=> i.decode ? i.decode().catch(()=>{}) : null));
});
await new Promise(r=>setTimeout(r,800));
await p.screenshot({path:out, fullPage:true});
console.log('saved', out);
await b.close();
