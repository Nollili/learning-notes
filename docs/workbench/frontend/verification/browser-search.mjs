if (!process.env.FRONTEND_APP_DIR) throw new Error('Set FRONTEND_APP_DIR to the isolated installed application copy.');
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const server=spawn(process.execPath,['server.mjs'],{cwd:process.env.FRONTEND_APP_DIR,stdio:'pipe'});
let browser;let stderr='';server.stderr.on('data',d=>stderr+=d);
try{
 for(let i=0;i<40;i++){try{if((await fetch('http://127.0.0.1:4173/')).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_EXECUTABLE});
 const version=browser.version(),errors=[];
 for(const js of [false,true]){
 const ctx=await browser.newContext({javaScriptEnabled:js,viewport:{width:320,height:640}});const page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/');
 await page.keyboard.press('Tab');assert.equal(await page.locator(':focus').textContent(),'Skip to main content');
 await page.keyboard.press('Tab');assert.equal(await page.locator(':focus').getAttribute('id'),'q');
 await page.keyboard.type('layers');await page.keyboard.press('Enter');
 await page.getByRole('link',{name:'CSS layers'}).waitFor();
 if(!js)assert.match(page.url(),/search\?q=layers/);
 else assert.equal(await page.getByRole('status').textContent(),'1 result');
 const widths=await page.evaluate(()=>[document.documentElement.scrollWidth,innerWidth]);assert.ok(widths[0]<=widths[1]);
 await page.screenshot({path:`/tmp/frontend-search-${js?'enhanced':'no-js'}-320.png`,fullPage:true});
 console.log('PASS',js?'enhanced':'no-JS','Tab → search, Enter, real result link, 320px no overflow');await ctx.close();
 }
 const page=await browser.newPage({viewport:{width:1280,height:800}});page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/api/search?*',r=>r.abort());await page.goto('http://127.0.0.1:4173/');await page.getByRole('textbox',{name:'Search notes'}).fill('layers');await page.keyboard.press('Enter');
 const fallback=page.getByRole('link',{name:'Open regular results'});await fallback.waitFor();assert.equal(await page.locator('#q').inputValue(),'layers');await fallback.focus();await page.keyboard.press('Enter');await page.getByRole('link',{name:'CSS layers'}).waitFor();assert.match(page.url(),/search\?q=layers/);console.log('PASS network failure preserves input; keyboard fallback opens native HTML result');
 await page.unroute('**/api/search?*');await page.route('**/search-ui.mjs',r=>r.abort());await page.goto('http://127.0.0.1:4173/');await page.locator('#q').fill('layers');await page.locator('#q').press('Enter');await page.getByRole('link',{name:'CSS layers'}).waitFor();assert.match(page.url(),/search\?q=layers/);console.log('PASS blocked module keeps native form usable');
 for(const url of ['/search?q=','/search?q=a&q=b'])assert.equal((await fetch('http://127.0.0.1:4173'+url)).status,400);
 const escaped=await (await fetch('http://127.0.0.1:4173/search?q=%3Cscript%3E')).text();assert.ok(escaped.includes('&lt;script&gt;'));assert.ok(!escaped.includes('value="<script>'));
 assert.deepEqual(errors,[]);console.log(JSON.stringify({browser:version,platform:process.platform,checks:'passed',stderr}));
}finally{await browser?.close();server.kill('SIGTERM');}
