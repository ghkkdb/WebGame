/* 验证特效由实际招式/命中触发，且不会突破预算或污染后续绘制。 */
function checkSkillEffects(check){
 const skillFX=[['orbit',0,'swordMuzzle'],['return',0,'returnCast'],['shadow',1,'daggerGhost'],['mark',1,'dartMuzzle'],['mist',2,'flowerBloom'],['needle',2,'butterflyFan']];
 for(const [id,row,kind] of skillFX){startGame(row);game.player.invuln=999;game.player.attack=999;spawnEnemy('shield',{x:6,z:5});castSchoolSkill(id,2);updateGame(.04);check(SKILLS[id].name+'触发独立释放表现',schoolFX.some(f=>f.kind===kind));}
 for(const [id,kind] of [['thunder','thunderStrike'],['ice','frostWave'],['wind','windSweep']]){startGame(0);game.player.attack=999;spawnEnemy('shield',{x:6,z:5});castSkill(id,2);check(SKILLS[id].name+'具有独立元素特效',schoolFX.some(f=>f.kind===kind));}
 for(const id of ['fire','petal']){startGame(0);spawnEnemy('shield',{x:6,z:5});castSkill(id,2);check(SKILLS[id].name+'使用独立区域绘制',areas.some(a=>a.type===id&&a.damage>0));}
 startGame(1);game.player.attack=999;game.player.invuln=999;const marked=spawnEnemy('shield',{x:6,z:5});marked.marks=3;marked.markTime=6;castSchoolSkill('mark',2);check('破印爆发不在飞镖命中之前出现',!schoolFX.some(f=>f.kind==='markBreak'));for(let i=0;i<9;i++)updateGame(.04);check('飞镖实际命中后触发破印碎纹',schoolFX.some(f=>f.kind==='markBreak'&&f.marks===3)&&marked.marks===0);
 for(const recipe of RECIPES){startGame(HEROS.findIndex(h=>h.id===recipe.hero));game.fusion=recipe;game.player.invuln=999;const e=spawnEnemy('shield',{x:6,z:5});e.hp=e.maxHp=10000;ultimate();updateGame(.04);check(recipe.name+'保留独立融合视觉标记',projectiles.length>0&&projectiles.every(b=>b.variant===recipe.id)&&schoolFX.some(f=>f.variant===recipe.id));}
 const savedContext=pixel.ctx,savedProjectiles=projectiles.splice(0),scratch=document.createElement('canvas');scratch.width=Math.ceil(pixel.w);scratch.height=Math.ceil(pixel.h);const scratchContext=scratch.getContext('2d');scratchContext.imageSmoothingEnabled=false;
 try{pixel.ctx=scratchContext;for(const [kind,a,b,label] of [['swordqi','雷剑','冰剑','雷剑与冰剑'],['dart','叶影','焚脉','叶影与炎镖'],['butterfly','焚香','雪针','药蝶与冰蝶']]){const hashes=[];for(const variant of [a,b]){scratchContext.clearRect(0,0,scratch.width,scratch.height);projectiles.length=0;projectiles.push({x:pixel.camX,z:pixel.camZ,dx:1,dz:0,kind,color:0xbde3cf,age:.23,life:.8,wavePhase:1,variant,trail:[{x:pixel.camX-.8,z:pixel.camZ}],detonateMarks:kind==='dart'});drawSchoolProjectiles();const data=scratchContext.getImageData(0,0,scratch.width,scratch.height).data;let hash=2166136261;for(let i=0;i<data.length;i++)hash=Math.imul(hash^data[i],16777619);hashes.push(hash);}check(label+'在相同几何条件下确实绘制不同轮廓',hashes[0]!==hashes[1]);}}
 finally{pixel.ctx=savedContext;projectiles.length=0;projectiles.push(...savedProjectiles);}
 startGame(0);const seal=addSchoolFX('swordSeal',0,5,{life:2,r:8});for(let i=0;i<400;i++)addSchoolFX('swordHit',0,5);check('大量命中特效遵守128个上限',schoolFX.length===SCHOOL_FX_LIMIT);check('命中碎光不会挤掉绝技阵纹',schoolFX.includes(seal));
 schoolFX.length=0;const canopy=addSchoolFX('umbrella',0,5,{priority:3,r:1.4,life:1.2});addSchoolFX('umbrella',0,5,{priority:2,r:1,life:.65});check('普通舞伞不会降级绝技伞面',schoolFX.length===1&&canopy.priority===3&&canopy.r===1.4);
 for(const kind of Object.keys(FX_PRIORITY))addSchoolFX(kind,0,5,{r:3,endX:3,endZ:6,angle:1,life:.8});for(const f of schoolFX)f.t=.16;
 const ctx=pixel.ctx,alpha=ctx.globalAlpha;drawSchoolGroundEffects();drawSchoolEffects();drawSchoolProjectiles();check('多种特效绘制后恢复透明度和画布状态',ctx.globalAlpha===alpha&&ctx.globalCompositeOperation==='source-over'&&ctx.imageSmoothingEnabled===false);
 const time=schoolFX[0].t;pauseGame();drawPixel(performance.now(),.04);check('暂停期间阵纹与命中效果冻结',schoolFX[0].t===time);closeModal();updateSchoolEffects(3);check('特效寿命结束后全部回收',schoolFX.length===0);
 addSchoolFX('dartSeal',0,5);startGame(2);check('重新开局清除上局的特效',schoolFX.length===0);
}
function installEffectsPreview(panel){
 const line=document.createElement('div');line.style.cssText='display:flex;gap:4px;margin-top:6px';
 ['剑气演武','飞镖演武','灵蝶演武'].forEach((name,row)=>{const button=document.createElement('button');button.textContent=name;button.onclick=()=>{
  startGame(row);game.player.invuln=999;game.player.attack=.1;game.level=12;game.wave=4;game.time=200;game.waveTime=20;
  for(let i=0;i<3;i++)gainSkill('weapon');for(const id of game.hero.exclusive)for(let i=0;i<2;i++)gainSkill(id);
  for(let i=0;i<12;i++){const a=i/12*TAU,e=spawnEnemy('shield',{x:Math.sin(a)*7,z:5+Math.cos(a)*7});if(e){e.hp=e.maxHp=10000;e.speed=0;e.damage=0;}}
  ultimate();signature();warnCircle(game.player.x+3,game.player.z+2,1.8,12,2);updateHUD();panel.classList.add('hidden');
 };line.append(button);});panel.append(line);
}
