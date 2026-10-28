import http from 'node:http';
import fs from 'node:fs/promises';
import pg from 'pg';
const password=(await fs.readFile('/run/secrets/app_password','utf8')).trim();
if(!password)throw Error('Missing fixture secret');
const pool=new pg.Pool({host:'db',port:5432,database:'notes',user:'notes_app',password,max:2,
 connectionTimeoutMillis:500,options:'-c statement_timeout=500',application_name:'container-study'});
pool.on('error',()=>console.error('database idle connection failed'));
let stopping=false,probe;
async function query(text){
 const client=await pool.connect();let released=false,timer;
 const release=bad=>{if(!released){released=true;client.release(bad);}};
 try{
  const deadline=new Promise((_,reject)=>{timer=setTimeout(()=>{release(true);reject(Error('Query deadline'));},750);});
  return await Promise.race([client.query(text),deadline]);
 }catch(e){release(true);throw e;}finally{clearTimeout(timer);release(false);}
}
function ready(){
 if(stopping)return Promise.resolve(false);
 if(probe)return probe;
 const current=query('SELECT 1').then(()=>!stopping,()=>false);
 probe=current;
 void current.finally(()=>{if(probe===current)probe=undefined;});
 return current;
}
const server=http.createServer(async(req,res)=>{
 const send=(status,value)=>{res.writeHead(status,{'content-type':'application/json','cache-control':'no-store'});res.end(JSON.stringify(value));};
 if(req.method==='GET'&&req.url==='/healthz')return send(stopping?503:200,{status:stopping?'stopping':'alive'});
 if(req.method==='GET'&&req.url==='/readyz'){const ok=await ready();return send(ok?200:503,{status:ok?'ready':'not_ready'});}
 if(stopping)return send(503,{error:'STOPPING'});
 try{
  if(req.url==='/counter'&&req.method==='GET'){const r=await query('SELECT value FROM counter WHERE id=1');return send(200,{value:r.rows[0].value});}
  if(req.url==='/counter'&&req.method==='POST'){const r=await query('UPDATE counter SET value=value+1 WHERE id=1 RETURNING value');return send(200,{value:r.rows[0].value});}
  send(404,{error:'NOT_FOUND'});
 }catch{send(503,{error:'DATABASE_UNAVAILABLE'});}
});
server.headersTimeout=2000;server.requestTimeout=3000;server.keepAliveTimeout=1000;
server.listen(3000,'0.0.0.0',()=>console.log('fixture listening'));
async function stop(){
 if(stopping)return;stopping=true;
 const hard=setTimeout(()=>{server.closeAllConnections();process.exit(1)},3000);hard.unref();
 try{await new Promise((resolve,reject)=>server.close(e=>e?reject(e):resolve()));await pool.end();clearTimeout(hard);console.log('fixture stopped cleanly');}
 catch{process.exitCode=1;}
}
process.once('SIGTERM',()=>{void stop()});process.once('SIGINT',()=>{void stop()});
