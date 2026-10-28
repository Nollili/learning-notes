import https from'node:https';import fs from'node:fs/promises';
const html='<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Study counter</title><h1>Study counter</h1><p id="result" role="status">Loading…</p><button id="refresh" type="button">Refresh</button><script src="/app.js" defer></script></html>';
const script=`const result=document.getElementById('result'),button=document.getElementById('refresh');async function refresh(){button.disabled=true;try{const r=await fetch('/api/counter',{signal:AbortSignal.timeout(2000)});if(!r.ok)throw Error();const data=await r.json();if(!Number.isSafeInteger(data.value))throw Error();result.textContent='Current value: '+data.value;}catch{result.textContent='Unavailable. Retry.';}finally{button.disabled=false;}}button.addEventListener('click',refresh);refresh();`;
const server=https.createServer({key:await fs.readFile('/run/secrets/tls_key'),cert:await fs.readFile('/run/secrets/tls_cert')},async(req,res)=>{
 res.setHeader('Content-Security-Policy',"default-src 'none'; script-src 'self'; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'");res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Cache-Control','no-store');
 if(req.method!=='GET'){res.writeHead(405,{'allow':'GET'}).end();return;}
 if(req.url==='/'){res.writeHead(200,{'content-type':'text/html; charset=utf-8'}).end(html);return;}
 if(req.url==='/app.js'){res.writeHead(200,{'content-type':'text/javascript; charset=utf-8'}).end(script);return;}
 if(['/api/counter','/api/readyz','/api/healthz'].includes(req.url)){
  try{const response=await fetch('http://api:3000'+req.url.slice(4),{signal:AbortSignal.timeout(1500)});const body=await response.text();if(body.length>1024)throw Error();res.writeHead(response.status,{'content-type':'application/json'}).end(body);}
  catch{res.writeHead(503,{'content-type':'application/json'}).end('{"error":"UPSTREAM_UNAVAILABLE"}');}return;
 }
 res.writeHead(404).end();
});server.requestTimeout=3000;server.headersTimeout=3000;server.listen(8443,'0.0.0.0');
process.once('SIGTERM',()=>{const timer=setTimeout(()=>{server.closeAllConnections();process.exit(1);},3000);timer.unref();server.close(()=>{clearTimeout(timer);});});
