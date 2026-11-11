/* 门派特效使用独立轮廓：弧形剑气、旋转银镖、双翼蝴蝶。 */
const schoolFX=[];let lastSchoolSound=0;
function addSchoolFX(kind,x,z,options={}){if(kind==='umbrella'){const old=schoolFX.find(f=>f.kind===kind&&Math.hypot(f.x-x,f.z-z)<1);if(old){Object.assign(old,{t:0},options);return;}}if(schoolFX.length>=110)schoolFX.shift();schoolFX.push({kind,x,z,t:0,life:.32,...options});}
function updateSchoolEffects(dt){for(let i=schoolFX.length-1;i>=0;i--){schoolFX[i].t+=dt;if(schoolFX[i].t>=schoolFX[i].life)schoolFX.splice(i,1);}}
function schoolAttackSound(hero){if(!soundOn||!audio)return;const now=audio.ctx.currentTime;if(now-lastSchoolSound<.10)return;lastSchoolSound=now;if(hero==='healer'){sound('chime');return;}const ctx=audio.ctx,osc=ctx.createOscillator(),gain=ctx.createGain();osc.type=hero==='sword'?'triangle':'sine';osc.frequency.setValueAtTime(hero==='sword'?1180:2300,now);osc.frequency.exponentialRampToValueAtTime(hero==='sword'?370:1050,now+.075);gain.gain.setValueAtTime(.001,now);gain.gain.exponentialRampToValueAtTime(hero==='sword'?.09:.065,now+.006);gain.gain.exponentialRampToValueAtTime(.001,now+.09);osc.connect(gain);gain.connect(audio.master);osc.start(now);osc.stop(now+.10);}
function drawDartSprite(g,x,y,angle=0,size=6,color='#cfb6fa',empowered=false){
 g.save();g.translate(x,y);g.rotate(angle);const pts=[];for(let j=0;j<8;j++){const a=j/8*TAU,r=j%2?size*.29:size;pts.push([Math.cos(a)*r,Math.sin(a)*r]);}pixelPoly(g,pts,'#2a213b');pixelPoly(g,pts.map(([x,y])=>[x*.78,y*.78]),'#edf1ec');pixelPoly(g,[[0,0],[-size*.74,0],[0,-size*.74]],color);g.fillStyle=empowered?'#ffe1ae':'#8b71c4';g.fillRect(-1,-1,3,3);g.fillStyle='#fff6da';g.fillRect(0,0,1,1);g.restore();
}
function drawButterflySprite(g,x,y,phase=0,size=1,color='#bde8b2',angle=0){
 const flap=.52+.48*Math.abs(Math.sin(phase));g.save();g.translate(x,y);g.rotate(angle);g.scale(size,size);for(const side of [-1,1]){const points=[[side,0],[side*3*flap,-4],[side*7*flap,-5],[side*8*flap,-1],[side*5*flap,1],[side*6*flap,4],[side*3*flap,4],[side,2]];pixelPoly(g,points,'#365a4d');pixelPoly(g,points.map(([xx,yy])=>[xx*.82,yy*.8]),color);g.fillStyle='#fff1c5';g.fillRect(Math.round(side*4*flap),-2,1,2);}pixelLine(g,[[0,-3],[0,4]],'#e9d7a0',1);pixelLine(g,[[-2,-5],[0,-3],[2,-5]],'#ebdfb8');g.restore();
}
function drawSwordQi(g,b,p){
 const r=(b.width||1.15)*pixel.scale,a=Math.atan2(b.dz*pixel.sy,b.dx*pixel.scale),color=rgbHex(b.color),points=[];
 g.save();g.translate(p.x,p.y);g.rotate(a+Math.PI/2);
 for(let j=0;j<=16;j++){const u=-r+j/16*r*2,v=-(6+5*(1-(u/r)**2));points.push([u,v]);}
 for(let j=16;j>=0;j--){const u=-r+j/16*r*2,v=-(6+5*(1-(u/r)**2))+(1.5+3*Math.sin(j/16*Math.PI));points.push([u,v]);}
 pixelPoly(g,points,'#2e6d79');pixelPoly(g,points.map(([x,y])=>[x*.94,y+.5]),color);pixelLine(g,points.slice(0,17).map(([x,y])=>[x*.83,y+1]),'#edffff',1.2);
 g.globalAlpha=.55;pixelLine(g,[[-r*.6,-1],[-r*.25,-4],[r*.25,-4],[r*.6,-1]],'#6fcbdc',1);g.globalAlpha=.28;pixelLine(g,[[-r*.45,3],[0,0],[r*.45,3]],color);g.restore();
}
function drawSchoolProjectiles(){
 const g=pixel.ctx;
 for(const b of projectiles){const p=pixelPoint(b.x,b.z,.55),color=rgbHex(b.color),trail=b.trail||[];
  if(b.kind==='swordqi'||b.kind==='returnqi'){for(let i=0;i<trail.length;i++){const q=pixelPoint(trail[i].x,trail[i].z,.55);g.globalAlpha=(i+1)/(trail.length+1)*.23;pixelLine(g,[[q.x-b.dz*4,q.y+b.dx*3],[q.x+b.dz*4,q.y-b.dx*3]],color);}g.globalAlpha=1;drawSwordQi(g,b,p);}
  else if(b.kind==='dart'){for(let i=0;i<trail.length;i++){const q=pixelPoint(trail[i].x,trail[i].z,.55);g.globalAlpha=(i+1)/(trail.length+1)*.5;pixelLine(g,[[q.x-b.dx*2,q.y-b.dz*1.5],[q.x,q.y]],'#ac83e2',1);}g.globalAlpha=1;drawDartSprite(g,p.x,p.y,b.age*19+(b.wavePhase||0),b.empowered?7:5.5,color,b.empowered);}
  else if(b.kind==='butterfly'){for(let i=0;i<trail.length;i++){const q=pixelPoint(trail[i].x,trail[i].z,.55);g.globalAlpha=(i+1)/(trail.length+1)*.45;g.fillStyle=i%2?'#f3db9a':'#a7d6b3';g.fillRect(q.x,q.y,1,1);}g.globalAlpha=1;drawButterflySprite(g,p.x,p.y,b.age*19+(b.wavePhase||0),1,color,Math.atan2(b.dz*.75,b.dx)+Math.PI/2);}
  else if(b.kind==='leaf'){const a=Math.atan2(b.dz*.75,b.dx);g.save();g.translate(p.x,p.y);g.rotate(a);pixelPoly(g,[[-6,0],[-1,-3],[6,-1],[2,3],[-2,3]],'#426947');pixelPoly(g,[[-5,0],[0,-2],[5,-1],[1,2]],'#c6e4a1');g.restore();}
 }
 for(const b of enemyShots){const p=pixelPoint(b.x,b.z,.5),dx=b.dx*6,dz=b.dz*5;pixelLine(g,[[p.x-dx,p.y-dz],[p.x+dx,p.y+dz]],'#5b3133',3);pixelLine(g,[[p.x-dx*.4,p.y-dz*.4],[p.x+dx,p.y+dz]],'#f2b591',1.5);}
}
function drawFlowerField(a){
 const g=pixel.ctx,p=pixelPoint(a.x,a.z),color=rgbHex(a.color),life=Math.min(1,a.life);g.save();g.globalAlpha=.6*life;
 for(let i=0;i<10;i++){const t=i/10*TAU,x=p.x+Math.sin(t)*a.r*pixel.scale,y=p.y+Math.cos(t)*a.r*pixel.sy;pixelPoly(g,[[x,y-3],[x+3,y],[x,y+3],[x-3,y]],color);g.fillStyle='#f4e7b2';g.fillRect(x,y,1,1);}
 for(let i=0;i<5;i++){const t=i/5*TAU+homeTime*.12,points=[];for(let j=0;j<=12;j++){const u=j/12,r=Math.sin(u*Math.PI)*a.r*.62;points.push([p.x+Math.sin(t+(u-.5)*.7)*r*pixel.scale,p.y+Math.cos(t+(u-.5)*.7)*r*pixel.sy]);}pixelLine(g,points,color,1);}
 g.globalAlpha=.8*life;for(let i=0;i<3;i++){const t=homeTime*.8+i/3*TAU;drawButterflySprite(g,p.x+Math.sin(t)*a.r*pixel.scale*.7,p.y+Math.cos(t)*a.r*pixel.sy*.7-4,homeTime*13+i,.65,color);}
 g.restore();
}
function drawSchoolEffects(){
 const g=pixel.ctx;for(const f of schoolFX){const k=f.t/f.life,p=pixelPoint(f.x,f.z,.4);g.save();g.globalAlpha=Math.min(1,(1-k)*1.6);
  if(['swordHit','dartHit','butterflyHit'].includes(f.kind)){
   if(f.kind==='swordHit'){for(let i=0;i<4;i++){const a=(f.angle||0)+i*Math.PI/2,r=4+k*9;pixelLine(g,[[p.x+Math.cos(a)*r*.4,p.y+Math.sin(a)*r*.4],[p.x+Math.cos(a)*r,p.y+Math.sin(a)*r]],i%2?'#aff3ed':'#fff9ce',i%2?1:2);}}
   if(f.kind==='dartHit'){drawDartSprite(g,p.x,p.y,k*3,4+k*7,'#e4bdff',true);for(let i=0;i<3;i++){const x=p.x+(i-1)*(4+k*3),y=p.y-9-k*7;pixelPoly(g,[[x,y-2],[x+2,y],[x,y+2],[x-2,y]],'#dfb5f5');}}
   if(f.kind==='butterflyHit')for(let i=0;i<3;i++){const a=i/3*TAU;drawButterflySprite(g,p.x+Math.sin(a)*(3+k*9),p.y+Math.cos(a)*(2+k*5),k*12+i,.55,i%2?'#e9dda8':'#b5e9bd',a);}
  }
  if(f.kind==='swordMuzzle'){const a=f.angle||0;pixelLine(g,[[p.x-Math.sin(a)*2,p.y-Math.cos(a)*2],[p.x+Math.sin(a)*13,p.y+Math.cos(a)*10]],'#e9ffff',1.3);}
  if(f.kind==='dartMuzzle')for(let i=0;i<2;i++){const a=f.angle+(i?-.2:.2);pixelLine(g,[[p.x+Math.sin(a)*2,p.y+Math.cos(a)*2],[p.x+Math.sin(a)*8,p.y+Math.cos(a)*6]],'#d9baf6');}
  if(f.kind==='butterflyMuzzle')drawButterflySprite(g,p.x-7,p.y-13-k*3,k*12,.65,'#e4e5ad');
  if(f.kind==='swordDash'){const end=pixelPoint(f.endX,f.endZ,.4);pixelLine(g,[[p.x,p.y],[end.x,end.y]],'#9ae2eb',2);pixelLine(g,[[p.x+2,p.y-2],[end.x+2,end.y-2]],'#eaffee');}
  if(f.kind==='daggerGhost'){const s=actorSprite(1,1),h=40,w=s.width/s.height*h;g.globalAlpha=(1-k)*.32;g.drawImage(s,p.x-w/2,p.y-h,w,h);}
  if(f.kind==='swordSeal')for(let i=0;i<6;i++){const a=i/6*TAU+k*.6,q=pixelPoint(f.x+Math.sin(a)*2.2,f.z+Math.cos(a)*2.2,.7),dy=4+Math.sin(k*Math.PI)*4;pixelLine(g,[[q.x,q.y-dy-12],[q.x,q.y+3]],'#8bd3e6',2);pixelLine(g,[[q.x-3,q.y-dy-7],[q.x+3,q.y-dy-7]],'#e8e9bd');}
  if(f.kind==='dartSeal')for(let i=0;i<8;i++){const a=i/8*TAU+k*2,q=pixelPoint(f.x+Math.sin(a)*2.3,f.z+Math.cos(a)*2.3,.5);drawDartSprite(g,q.x,q.y,k*9+i,4,'#bfa0eb');}
  if(f.kind==='umbrella'){const r=19*(f.r||1)*(1+Math.sin(k*Math.PI)*.15),y=p.y-20,points=[[p.x-r,y],[p.x-r*.7,y-7],[p.x,y-13],[p.x+r*.7,y-7],[p.x+r,y],[p.x+r*.5,y+2],[p.x,y],[p.x-r*.5,y+2]];pixelPoly(g,points,'#e5d8ac');for(let i=0;i<7;i++){const x=p.x-r+i/6*r*2;pixelLine(g,[[p.x,y-12],[x,y]],'#9bad83');}pixelLine(g,[[p.x,y-12],[p.x,y+8]],'#f8efc6');}
  g.restore();
 }
}
