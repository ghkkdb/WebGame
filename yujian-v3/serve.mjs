import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
http.createServer((req,res)=>{const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname),target=name==='/'?path.join(root,'御剑十分钟_V3_像素江湖.html'):path.resolve(root,'.'+name);if(!target.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}fs.readFile(target,(error,data)=>{if(error){res.writeHead(404);res.end('未找到文件');return;}res.writeHead(200,{'Content-Type':target.endsWith('.html')?'text/html; charset=utf-8':target.endsWith('.png')?'image/png':'text/plain; charset=utf-8','Cache-Control':'no-store'});res.end(data);});}).listen(4173,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:4173/'));
