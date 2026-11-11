/* 实时像素特效：地面阵纹先画，人物之后绘制锋面、蝶翼与命中碎光。 */
const schoolFX=[],SCHOOL_FX_LIMIT=128;let schoolFXSerial=0,lastSchoolSound=0;
const FX_PRIORITY={swordHit:0,dartHit:0,butterflyHit:0,leafHit:0,swordMuzzle:1,dartMuzzle:1,butterflyMuzzle:1,returnCast:1,butterflyFan:1,daggerGhost:1,windSweep:1,flowerBloom:2,swordDash:2,markBreak:2,frostWave:2,thunderStrike:2,swordSeal:3,dartSeal:3,umbrella:2};
function addSchoolFX(kind,x,z,options={}){
 const priority=options.priority??FX_PRIORITY[kind]??1;
 if(kind==='umbrella'){const old=schoolFX.find(f=>f.kind===kind&&Math.hypot(f.x-x,f.z-z)<1);if(old){if(old.priority>priority)return old;Object.assign(old,{t:0,priority},options);return old;}}
 if(schoolFX.length>=SCHOOL_FX_LIMIT){const lowest=schoolFX.reduce((a,f,i)=>f.priority<schoolFX[a].priority?i:a,0);if(schoolFX[lowest].priority>priority)return null;schoolFX.splice(lowest,1);}
 const f={kind,x,z,t:0,life:.32,serial:++schoolFXSerial,variant:game?.fusion?.id||null,priority,...options};
 if(kind==='daggerGhost'&&game){f.pose={...actorPose(game.player,selected,true)};f.facing=actorMotion(game.player).facing;}
 schoolFX.push(f);return f;
}
function updateSchoolEffects(dt){for(let i=schoolFX.length-1;i>=0;i--){schoolFX[i].t+=dt;if(schoolFX[i].t>=schoolFX[i].life)schoolFX.splice(i,1);}}
function schoolAttackSound(hero){if(!soundOn||!audio)return;const now=audio.ctx.currentTime;if(now-lastSchoolSound<.10)return;lastSchoolSound=now;if(hero==='healer'){sound('chime');return;}const ctx=audio.ctx,osc=ctx.createOscillator(),gain=ctx.createGain();osc.type=hero==='sword'?'triangle':'sine';osc.frequency.setValueAtTime(hero==='sword'?1180:2300,now);osc.frequency.exponentialRampToValueAtTime(hero==='sword'?370:1050,now+.075);gain.gain.setValueAtTime(.001,now);gain.gain.exponentialRampToValueAtTime(hero==='sword'?.09:.065,now+.006);gain.gain.exponentialRampToValueAtTime(.001,now+.09);osc.connect(gain);gain.connect(audio.master);osc.start(now);osc.stop(now+.10);}
function fxClock(){return game?.time??homeTime;}
function fxDiamond(g,x,y,r,color){pixelPoly(g,[[x,y-r],[x+r*.65,y],[x,y+r],[x-r*.65,y]],color);}
function fxStar(g,x,y,r,color){pixelLine(g,[[x-r,y],[x+r,y]],color);pixelLine(g,[[x,y-r],[x,y+r]],color);g.fillStyle='#fff8d6';g.fillRect(Math.round(x),Math.round(y),1,1);}
function fxRibbon(g,points,width,color){const sides=[[],[]];for(let i=0;i<points.length;i++){const prev=points[Math.max(0,i-1)],next=points[Math.min(points.length-1,i+1)],dx=next[0]-prev[0],dy=next[1]-prev[1],l=Math.hypot(dx,dy)||1,r=width*Math.sin((i+.2)/(points.length-.6)*Math.PI)*.5;for(let j=0;j<2;j++){const s=j?1:-1;sides[j].push([points[i][0]-dy/l*r*s,points[i][1]+dx/l*r*s]);}}pixelPoly(g,sides[0].concat(sides[1].reverse()),color);}
function fxArc(g,x,y,rx,ry,start,span,color,width=1){const points=[];for(let i=0;i<=20;i++){const a=start+span*i/20;points.push([x+Math.cos(a)*rx,y+Math.sin(a)*ry]);}pixelLine(g,points,color,width);}
function fxSword(g,x,y,length,color='#cff8ee',tilt=0){g.save();g.translate(x,y);g.rotate(tilt);pixelPoly(g,[[-1,-length],[1,-length],[1,-3],[0,1],[-1,-3]],'#315763');pixelLine(g,[[0,-length+1],[0,-3]],color,1);pixelLine(g,[[-3,-length+4],[3,-length+4]],'#d9cc96');pixelLine(g,[[0,-length-4],[0,-length]],'#6d9393',2);g.restore();}
function drawDartSprite(g,x,y,angle=0,size=6,color='#cfb6fa',empowered=false){
 g.save();g.translate(x,y);g.rotate(angle);const pts=[];for(let j=0;j<8;j++){const a=j/8*TAU,r=j%2?size*.22:size;pts.push([Math.cos(a)*r,Math.sin(a)*r]);}pixelPoly(g,pts,'#29283c');pixelPoly(g,pts.map(([xx,yy])=>[xx*.81,yy*.81]),'#e9e8f4');pixelPoly(g,[[0,0],[-size*.77,0],[0,-size*.77]],color);pixelLine(g,[[size*.3,0],[size*.8,0]],'#ffffff');fxDiamond(g,0,0,1.7,empowered?'#ffe1a1':'#a48bd1');g.restore();
}
function drawButterflySprite(g,x,y,phase=0,size=1,color='#bde8b2',angle=0,ice=false){
 const flap=.22+.78*Math.abs(Math.sin(phase));g.save();g.translate(x,y);g.rotate(angle);g.scale(size,size);for(const s of [-1,1]){const points=[[s,0],[s*3*flap,-5],[s*7*flap,-6],[s*9*flap,-2],[s*6*flap,1],[s*7*flap,4],[s*3*flap,5],[s,2]];pixelPoly(g,points,ice?'#376a7a':'#3b6158');pixelPoly(g,points.map(([xx,yy])=>[xx*.81,yy*.77]),color);pixelLine(g,[[s,0],[s*5*flap,-3]],ice?'#f0ffff':'#f3eac1');g.fillStyle=ice?'#efffff':'#f7f4d4';g.fillRect(Math.round(s*5*flap),-3,1,1);g.fillStyle=ice?'#84bfd4':'#79ac83';g.fillRect(Math.round(s*4*flap),2,1,1);}pixelLine(g,[[0,-3],[0,4]],'#f5eacb',1);pixelLine(g,[[-2,-5],[0,-3],[2,-5]],'#d4dba5');g.restore();
}
function drawSwordQi(g,b,p){
 const r=(b.width||1.15)*pixel.scale,a=Math.atan2(b.dz*pixel.sy,b.dx*pixel.scale),color=rgbHex(b.color),returning=b.kind==='returnqi',strong=b.vfx==='third'||b.vfx==='art',ice=b.variant==='冰剑';
 g.save();g.translate(p.x,p.y);g.rotate(a+Math.PI/2);const front=[],back=[];
 for(let j=0;j<=20;j++){const u=-1+j/10,curve=-(1-u*u)*(returning?10:8);front.push([u*r,curve-2]);back.push([u*r*.91,curve+1.8*Math.sin(j/20*Math.PI)]);}
 pixelPoly(g,front.concat(back.reverse()),'#285664');pixelPoly(g,front.map(([x,y])=>[x*.96,y+.8]).concat(front.slice().reverse().map(([x,y],i)=>[x*.88,y+2.8*Math.sin(i/20*Math.PI)+1])),color);pixelLine(g,front.slice(2,-2).map(([x,y])=>[x,y+1]),'#efffff',1.3);
 g.globalAlpha*=.58;fxRibbon(g,front.map(([x,y])=>[x*.74,y+6]),2,ice?'#b6e9fb':'#7ecbd2');
 if(returning){fxArc(g,0,4,r*.64,6,b.age*9,Math.PI*1.65,'#d7f7d8',1);fxDiamond(g,0,1,2,'#d9eeb6');}
 if(strong||b.vfx==='orbit'){g.globalAlpha=.8;pixelLine(g,[[-r*.64,-1],[0,-5],[r*.64,-1]],'#c6fff2');for(const s of [-1,1])fxStar(g,s*r*.76,-3,2,'#d3fff4');}
 if(b.variant==='雷剑'){g.globalAlpha=.9;pixelLine(g,[[-r*.6,-3],[-r*.22,-7],[-r*.1,-3],[r*.2,-8],[r*.55,-4]],'#f7e4ab');}
 if(ice){g.globalAlpha=.85;for(const s of [-1,1])fxDiamond(g,s*r*.56,-3,3,'#e1fbff');}
 g.restore();
}
function drawSchoolProjectiles(){
 const g=pixel.ctx;for(const b of projectiles){const p=pixelPoint(b.x,b.z,.65),color=rgbHex(b.color),trail=b.trail||[];if(p.x<-70||p.x>pixel.w+70||p.y<-80||p.y>pixel.h+80)continue;
  g.save();
  if(['swordqi','returnqi'].includes(b.kind)){const points=trail.map(t=>{const q=pixelPoint(t.x,t.z,.65);return[q.x,q.y];}).concat([[p.x,p.y]]);g.globalAlpha=.35;fxRibbon(g,points,b.kind==='returnqi'?3:2,'#9cddd8');g.globalAlpha=1;drawSwordQi(g,b,p);}
  else if(b.kind==='dart'){const hot=b.variant==='焚脉',path=trail.map(t=>{const q=pixelPoint(t.x,t.z,.65);return[q.x,q.y];}).concat([[p.x,p.y]]);g.globalAlpha=.65;fxRibbon(g,path,b.detonateMarks?3.4:1.8,hot?'#e6a06c':'#a18ad2');if(b.detonateMarks){g.globalAlpha=.8;for(let i=0;i<trail.length;i+=2){const q=pixelPoint(trail[i].x,trail[i].z,.65);fxDiamond(g,q.x,q.y,1.6,hot?'#ffdaa0':'#e6c5ff');}}g.globalAlpha=1;drawDartSprite(g,p.x,p.y,b.age*24+(b.wavePhase||0),b.empowered?6.5:5.5,color,b.empowered);if(b.variant==='叶影'){g.globalAlpha=.8;pixelPoly(g,[[p.x-8,p.y+2],[p.x-4,p.y-1],[p.x-2,p.y+2],[p.x-6,p.y+4]],'#c8dd9e');}}
  else if(b.kind==='butterfly'){const ice=b.variant==='雪针';for(let i=0;i<trail.length;i++){const q=pixelPoint(trail[i].x,trail[i].z,.65);g.globalAlpha=(i+1)/(trail.length+1)*.6;fxDiamond(g,q.x,q.y,ice?1.8:1.1,ice?'#d2f8ff':i%2?'#f6df9b':'#b1dcad');}g.globalAlpha=1;drawButterflySprite(g,p.x,p.y,b.age*17+(b.wavePhase||0),b.vfx==='ultimate'?1.08:.9,color,Math.atan2(b.dz*.75,b.dx)+Math.PI/2,ice);}
  else if(b.kind==='leaf'){g.translate(p.x,p.y);g.rotate(Math.atan2(b.dz*.75,b.dx));pixelPoly(g,[[-7,0],[-1,-3],[7,-1],[2,3],[-3,3]],'#365e43');pixelPoly(g,[[-6,0],[0,-2],[6,-1],[1,2]],'#c6e4a1');pixelLine(g,[[-5,0],[5,-1]],'#eff0c6');}
  drawAdvancedProjectile(b,p);g.restore();
 }
 for(const b of enemyShots){const p=pixelPoint(b.x,b.z,.5),dx=b.dx*6,dz=b.dz*5;pixelLine(g,[[p.x-dx,p.y-dz],[p.x+dx,p.y+dz]],'#5b3133',3);pixelLine(g,[[p.x-dx*.4,p.y-dz*.4],[p.x+dx,p.y+dz]],'#f2b591',1.5);}
}
function drawFlowerField(a){
 const g=pixel.ctx,p=pixelPoint(a.x,a.z),age=a.total-a.life,open=clamp(age/.38,0,1),fade=Math.min(1,a.life/.6),ice=a.type==='iceGarden',incense=a.variant==='焚香',color=ice?'#b4e6f2':incense?'#e6cba2':'#a8d6ac',r=a.r*pixel.scale,ry=a.r*pixel.sy;g.save();g.globalAlpha=.55*fade;
 for(let i=0;i<8;i++)fxArc(g,p.x,p.y,r*open,ry*open,i/8*TAU+.06,TAU/8-.16,color,1);
 for(let i=0;i<6;i++){const angle=i/6*TAU,points=[];for(let j=0;j<=16;j++){const u=j/16,rr=Math.sin(u*Math.PI)*.78;points.push([p.x+Math.sin(angle+(u-.5)*.75)*r*rr*open,p.y+Math.cos(angle+(u-.5)*.75)*ry*rr*open]);}pixelLine(g,points,color,1);const x=p.x+Math.sin(angle)*r*.85*open,y=p.y+Math.cos(angle)*ry*.85*open;if(ice){fxDiamond(g,x,y-3,5,'#d3f9ff');pixelLine(g,[[x,y+2],[x,y-7]],'#79acbd');}else{for(let j=0;j<4;j++)fxDiamond(g,x+Math.sin(j/4*TAU)*3,y+Math.cos(j/4*TAU)*2,2,incense?'#edb98b':'#d8dca4');g.fillStyle='#f7e6b1';g.fillRect(x,y,1,1);}}
 // 花瓣与冰晶只沿外缘分布，阵心保持透明，便于辨认脚下危险。
 g.globalAlpha=.8*fade;for(let i=0;i<4;i++){const angle=age*.45+i/4*TAU,x=p.x+Math.sin(angle)*r*.65,y=p.y+Math.cos(angle)*ry*.65-3-Math.sin(age*2+i)*2;drawButterflySprite(g,x,y,age*13+i,.55,ice?'#d8f6ff':incense?'#e9cb9c':'#d3e8ab',angle,ice);if(incense){g.globalAlpha=.35*fade;pixelLine(g,[[x,y-2],[x+Math.sin(age*2+i)*3,y-9],[x-2,y-16]],'#e5cc9d');g.globalAlpha=.8*fade;}}g.restore();drawFusionFieldGround(a);
}
function drawFallingSwordFX(f){
 if(f.variant==='冰剑'){drawFrostFallingSword(f);return;}
 const g=pixel.ctx,m=f.mesh.position,p=pixelPoint(m.x,m.z),drop=clamp(f.t/.09,0,1),height=5*(1-drop)**2*pixel.scale,fade=Math.min(1,(f.d-f.t)/.12);g.save();g.globalAlpha=fade*.85;
 if(drop<1){pixelLine(g,[[p.x,p.y-height-36],[p.x,p.y-height-16]],'#87c9d4',2);fxSword(g,p.x,p.y-height,22,'#efffff');}
 else{fxSword(g,p.x,p.y,15*(1-(f.t-.09)/.35),'#d1f9f6');for(let i=0;i<4;i++){const a=i/4*TAU+1,r=3+(f.t-.09)*40;fxDiamond(g,p.x+Math.sin(a)*r,p.y+Math.cos(a)*r*.6,1.5,'#b7e6d8');}}
 g.globalAlpha=fade*.5;fxDiamond(g,p.x,p.y,4,'#bbebe1');g.restore();
}
function drawElementField(a){
 if(drawAdvancedElementField(a))return;
 const g=pixel.ctx,p=pixelPoint(a.x,a.z),age=a.total-a.life,r=a.r*pixel.scale,ry=a.r*pixel.sy,fade=Math.min(1,a.life/.5),fire=a.type==='fire';g.save();g.globalAlpha=.65*fade;
 for(let i=0;i<8;i++){const angle=i/8*TAU,x=p.x+Math.sin(angle)*r*(.65+.15*Math.sin(age*2+i)),y=p.y+Math.cos(angle)*ry*.78;if(fire){const h=4+Math.sin(age*10+i*2)*2;pixelPoly(g,[[x-3,y],[x-2,y-h],[x,y-h-4],[x+1,y-h*.6],[x+3,y]],'#c47b61');pixelPoly(g,[[x-1,y],[x,y-h],[x+2,y]],'#f7d89d');}else{g.save();g.translate(x,y-Math.sin(age*3+i)*2);g.rotate(angle+age*.6);pixelPoly(g,[[-3,0],[0,-2],[4,-1],[2,2],[-1,2]],'#e5b9c4');g.restore();}}
 for(let i=0;i<4;i++)fxArc(g,p.x,p.y,r,ry,i/4*TAU+age*.2,.8,fire?'#eab18a':'#ecc2d0');g.restore();
}
function drawSchoolEnemyMarks(e,p,h){
 const g=pixel.ctx,full=e.marks===3;g.save();g.globalAlpha=.9;for(let i=0;i<e.marks;i++){const x=p.x+(i-(e.marks-1)/2)*5,y=p.y-h-7;fxDiamond(g,x,y,2.5,'#47334f');fxDiamond(g,x,y,1.6,full?'#f0d2a1':'#d9b1ec');}if(full)pixelLine(g,[[p.x-8,p.y-h-10],[p.x,p.y-h-12],[p.x+8,p.y-h-10]],'#efd1ab');g.restore();
}
function addCommonSkillFX(id,lv,target){
 emitCommonCastFX(id,lv,target);
}
function drawSchoolGroundEffects(){
 const g=pixel.ctx;for(const f of schoolFX){const k=f.t/f.life,p=pixelPoint(f.x,f.z),fade=Math.min(1,(1-k)*2);if(f.variant&&['swordSeal','dartSeal','flowerBloom'].includes(f.kind))continue;if(p.x<-180||p.x>pixel.w+180||p.y<-160||p.y>pixel.h+160)continue;g.save();g.globalAlpha=.65*fade;
  if(f.sourceSkill){drawCommonGroundFX(f,k,p,fade);g.restore();continue;}
  if(f.kind==='swordSeal'||f.kind==='dartSeal'){const sword=f.kind==='swordSeal',r=(f.r||3)*pixel.scale,ry=(f.r||3)*pixel.sy,open=clamp(k/.15,0,1),color=f.variant==='焚脉'?'#e9b18b':sword?'#a5dfe1':'#c8addf';for(let i=0;i<8;i++){const a=i/8*TAU;fxArc(g,p.x,p.y,r*open,ry*open,a+.04,TAU/8-.18,color);const x=p.x+Math.sin(a)*r*.88*open,y=p.y+Math.cos(a)*ry*.88*open;fxDiamond(g,x,y,sword?3:2.5,sword?'#e9ebbb':'#e7d2a9');}for(let i=0;i<3;i++)fxArc(g,p.x,p.y,r*.45,ry*.45,k*.6+i/3*TAU,1.2,color);}
  if(f.kind==='flowerBloom'){const r=(f.r||3)*pixel.scale,ry=(f.r||3)*pixel.sy,open=1-(1-k)**3;for(let i=0;i<6;i++){const a=i/6*TAU;fxArc(g,p.x+Math.sin(a)*r*.35*open,p.y+Math.cos(a)*ry*.35*open,r*.35*open,ry*.35*open,a,Math.PI,'#d5e5b0');}}
  if(f.kind==='swordDash'){const end=pixelPoint(f.endX,f.endZ);fxRibbon(g,[[p.x,p.y],[p.x+(end.x-p.x)*.4,p.y+(end.y-p.y)*.4],[end.x,end.y]],8*(1-k),'#97dadc');pixelLine(g,[[p.x,p.y],[end.x,end.y]],'#e8ffe9',1);}
  if(f.kind==='returnCast'){const r=(1.1+k*.6)*pixel.scale;for(const s of [-1,1])fxArc(g,p.x,p.y,r,r*.65,k*5+s,Math.PI*.65,'#b5e7d1');}
  if(f.kind==='frostWave'){const r=f.r*pixel.scale*Math.min(1,k*2),ry=f.r*pixel.sy*Math.min(1,k*2);for(let i=0;i<10;i++){const a=i/10*TAU,x=p.x+Math.sin(a)*r,y=p.y+Math.cos(a)*ry;fxDiamond(g,x,y-3,5*(1-k*.5),'#d8f5ff');pixelLine(g,[[x,y+2],[x,y-8]],'#8abacb');}for(let i=0;i<4;i++)fxArc(g,p.x,p.y,r,ry,i/4*TAU,.8,'#b6e2ed');}
  if(f.kind==='windSweep'){const r=f.r*pixel.scale*(.55+k*.45),ry=f.r*pixel.sy*(.55+k*.45);for(let i=0;i<3;i++)fxArc(g,p.x,p.y,r,ry,k*4+i/3*TAU,1.25,'#d7ead2',i?1:2);}
  if(f.kind==='thunderStrike'){const r=4+k*11;for(let i=0;i<5;i++){const a=i/5*TAU+f.serial;pixelLine(g,[[p.x+Math.sin(a)*r*.4,p.y+Math.cos(a)*r*.3],[p.x+Math.sin(a)*r,p.y+Math.cos(a)*r*.65]],'#b7d9fa');}}
  drawFusionGroundFX(f,k,p,fade);g.restore();
 }
}
function drawSchoolEffects(){
 const g=pixel.ctx;for(const f of schoolFX){const k=f.t/f.life,p=pixelPoint(f.x,f.z,.65),fade=Math.min(1,(1-k)*1.7);if(f.variant&&['swordSeal','dartSeal'].includes(f.kind))continue;if(p.x<-120||p.x>pixel.w+120||p.y<-150||p.y>pixel.h+120)continue;g.save();g.globalAlpha=fade;
  if(f.sourceSkill){drawCommonAirFX(f,k,p,fade);g.restore();continue;}
  if(f.kind==='swordHit'){const a=f.angle||0,dir=Math.atan2(Math.cos(a)*.75,Math.sin(a)),r=4+Math.min(1,k*3)*12;for(const s of [-1,1]){const x=Math.cos(dir+s*.5),y=Math.sin(dir+s*.5);fxRibbon(g,[[p.x-x*r*.3,p.y-y*r*.3],[p.x+x*r*.2,p.y+y*r*.2],[p.x+x*r,p.y+y*r]],3*(1-k),'#e7fff0');}for(let i=0;i<3;i++){const t=i*2.4+f.serial;fxDiamond(g,p.x+Math.cos(t)*k*12,p.y+Math.sin(t)*k*7,1.5,'#8ed9dd');}}
  if(f.kind==='dartHit'){const r=2+k*12;for(let i=0;i<4;i++){const a=i/4*TAU+f.serial;pixelLine(g,[[p.x+Math.sin(a)*r*.4,p.y+Math.cos(a)*r*.4],[p.x+Math.sin(a)*r,p.y+Math.cos(a)*r*.8]],'#d8c3f6');}fxStar(g,p.x,p.y,3*(1-k),'#fff5d5');}
  if(f.kind==='butterflyHit'){const ice=f.variant==='雪针';for(let i=0;i<4;i++){const a=i/4*TAU+f.serial;fxDiamond(g,p.x+Math.sin(a)*k*12,p.y+Math.cos(a)*k*7-k*4,2*(1-k)+.5,ice?'#d5f7ff':i%2?'#e5d6a0':'#b8dfb0');}drawButterflySprite(g,p.x,p.y-k*7,k*9,.5*(1-k)+.2,ice?'#dcfaff':'#d4efbc',0,ice);}
  if(f.kind==='leafHit')for(let i=0;i<3;i++){const a=i/3*TAU+f.serial,x=p.x+Math.sin(a)*k*13,y=p.y+Math.cos(a)*k*7;g.save();g.translate(x,y);g.rotate(a+k*2);pixelPoly(g,[[-3,0],[0,-2],[4,0],[0,2]],'#c3dfa8');g.restore();}
  if(f.kind==='markBreak'){const hot=f.variant==='焚脉',count=clamp(f.marks||3,1,3),r=5+k*(12+count*3);for(let i=0;i<count;i++){const a=i/count*TAU-1.6,x=p.x+Math.cos(a)*r,y=p.y+Math.sin(a)*r*.75;g.save();g.translate(x,y);g.rotate(a+k);pixelPoly(g,[[-3,0],[0,-5],[2,-1],[0,0],[3,2],[0,5]],hot?'#f5bd8d':'#e7bff7');g.restore();}for(let i=0;i<count;i++)fxArc(g,p.x,p.y,r*.8,r*.6,i/count*TAU+k,.9,hot?'#e6a26e':'#a48dc8',1);fxStar(g,p.x,p.y,4*(1-k),'#fff1c6');}
  if(f.kind==='swordMuzzle'){const a=Math.atan2(Math.cos(f.angle)*.75,Math.sin(f.angle)),r=13;g.translate(p.x,p.y-5);g.rotate(a);fxRibbon(g,[[-4,6],[1,0],[11,-5],[20,-2]],4*(1-k),'#c6fcf0');if(f.third){pixelLine(g,[[0,3],[r,0],[r+5,2]],'#f3e2ac');}}
  if(f.kind==='dartMuzzle'){const a=f.angle;for(const s of [-1,1])pixelLine(g,[[p.x+Math.sin(a)*3-s*2,p.y+Math.cos(a)*2],[p.x+Math.sin(a)*11,p.y+Math.cos(a)*8]],f.variant==='焚脉'?'#f6bc8c':'#d6c3f5');}
  if(f.kind==='butterflyMuzzle'||f.kind==='butterflyFan'){const a=f.angle||0,n=f.kind==='butterflyFan'?4:2;for(let i=0;i<n;i++){const theta=a+(i-(n-1)/2)*.5,q=pixelPoint(f.x+Math.sin(theta)*(.25+k*.8),f.z+Math.cos(theta)*(.25+k*.8),1.1);drawButterflySprite(g,q.x,q.y-f.t*8,k*14+i,.48,'#e4e9b1',theta);}}
  if(f.kind==='swordDash'){const end=pixelPoint(f.endX,f.endZ,.9),stage=f.stage||1;for(let i=0;i<stage;i++){const u=(i+1)/(stage+1),x=p.x+(end.x-p.x)*u,y=p.y+(end.y-p.y)*u;fxArc(g,x,y,12+k*8,6+k*4,-2.2+(f.angle||0),2.2,'#cefff0',2);}}
  if(f.kind==='daggerGhost'&&f.pose){g.save();g.translate(p.x,p.y+pixel.scale*.65);g.scale(f.facing,1);paintHeroPose(1,f.pose,(1-k)*.3);g.restore();}
  if(f.kind==='swordSeal'){const r=2.3*pixel.scale;for(let i=0;i<6;i++){const a=i/6*TAU+k*.4,x=p.x+Math.sin(a)*r,y=p.y+Math.cos(a)*r*.65;g.globalAlpha=fade*.65;fxSword(g,x,y-7,15,'#d6fcf2',Math.sin(a)*.25);}}
  if(f.kind==='dartSeal'){const count=f.variant==='叶影'?10:8;for(let i=0;i<count;i++){const a=i/count*TAU+k*.85,r=(1.5+Math.sin(k*Math.PI)*.4)*pixel.scale;drawDartSprite(g,p.x+Math.sin(a)*r,p.y+Math.cos(a)*r*.65-12,k*9+i,3.7,f.variant==='焚脉'?'#f5bd8b':f.variant==='叶影'?'#c7dda2':'#d4b7f0',true);}}
  if(f.kind==='umbrella'){const q=pixelPoint(f.x,f.z,2.9),open=Math.min(1,f.t/.12)*Math.min(1,(f.life-f.t)/.2),r=22*(f.r||1)*open,color=f.variant==='雪针'?'#b5e8f1':f.variant==='焚香'?'#e6c697':'#dbd9b2';g.globalAlpha=fade*.24;pixelPoly(g,[[q.x-r,q.y],[q.x-r*.7,q.y-8],[q.x,q.y-13],[q.x+r*.7,q.y-8],[q.x+r,q.y],[q.x+r*.4,q.y+3],[q.x,q.y+1],[q.x-r*.4,q.y+3]],color);g.globalAlpha=fade*.8;for(let i=0;i<9;i++){const x=q.x-r+i/8*r*2,y=q.y+Math.sin(i/8*Math.PI)*2;pixelLine(g,[[q.x,q.y-12],[x,y]],color);if(i%2===0)fxDiamond(g,x,y+3+k*4,1.3,'#e9e7c1');}pixelLine(g,[[q.x,q.y-11],[q.x,q.y+15]],'#e7debd');}
  if(f.kind==='thunderStrike'){const pulse=f.t<.075||f.t>.14&&f.t<.20;if(pulse){const points=[[p.x-4,p.y-65],[p.x+3,p.y-44],[p.x-4,p.y-29],[p.x+3,p.y-15],[p.x,p.y]];pixelLine(g,points,'#46637f',4);pixelLine(g,points,'#d5efff',2);pixelLine(g,[[p.x+3,p.y-44],[p.x+12,p.y-33],[p.x+8,p.y-22]],'#b8d5f7');}}
  drawFusionAirFX(f,k,p,fade);g.restore();
 }
}
