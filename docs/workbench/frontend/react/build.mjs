import {build} from 'esbuild';
import {mkdir,copyFile} from 'node:fs/promises';
await mkdir('output',{recursive:true});
await build({entryPoints:['demo/app.tsx'],bundle:true,format:'esm',jsx:'automatic',outfile:'output/app.js',define:{'process.env.NODE_ENV':JSON.stringify(process.env.REFERENCE_MODE === 'production' ? 'production' : 'development')}});
await copyFile('demo/index.html','output/index.html');
