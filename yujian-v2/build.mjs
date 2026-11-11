import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root=path.dirname(fileURLToPath(import.meta.url));
const code=fs.readFileSync(path.join(root,'game.js'),'utf8');
new vm.Script(code,{filename:'game.js'});
let html=fs.readFileSync(path.join(root,'index.html'),'utf8');
html=html.replace('<!doctype html>',()=>`<!doctype html>\n<!--\n${fs.readFileSync(path.join(root,'THIRD_PARTY_LICENSES.txt'),'utf8')}\n-->`);
html=html.replace('/* STYLE */',()=>fs.readFileSync(path.join(root,'style.css'),'utf8'));
html=html.replace('/* ART */',()=>`url("data:image/jpeg;base64,${fs.readFileSync(path.join(root,'侠客立绘.jpg')).toString('base64')}")`);
html=html.replace('/* THREE */',()=>fs.readFileSync(path.join(root,'three.local.js'),'utf8'));
html=html.replace('/* GAME */',()=>code);
const target=path.join(root,'..','御剑十分钟_V2.html');
fs.writeFileSync(target,html,'utf8');
console.log(`构建完成：${target}（${(Buffer.byteLength(html)/1024).toFixed(0)} KB）`);
