/* 用真实计时器、命中和融合事件验证通用/融合特效，不额外施加伤害。 */
let qaArtFrozen=false,qaArtStill=false;
function checkArtsEffects(check){
 for(const id of COMMON_ARTS){startGame(0);const p=game.player;p.invuln=999;p.attack=999;for(let i=0;i<3;i++)gainSkill(id);const e=spawnEnemy('shield',{x:6,z:5});e.x=3;e.speed=0;e.hp=e.maxHp=10000;game.skillTimers[id]=.15;const hp=e.hp;updateGame(.02);updateGame(.02);
  check(SKILLS[id].name+'按真实冷却仅蓄势一次且不提前伤害',schoolFX.filter(f=>f.kind==='commonCharge'&&f.sourceSkill===id).length===1&&e.hp===hp);
  let sawRelease=false;for(let i=0;i<12;i++){updateGame(.04);sawRelease ||= schoolFX.some(f=>f.sourceSkill===id&&f.kind!=='commonCharge')||areas.some(a=>a.type===id);}
  check(SKILLS[id].name+'释放与命中仍由实际战斗推进',e.hp<hp&&game.skillTimers[id]>0);
  check(SKILLS[id].name+'释放过程中带有独立技能来源',sawRelease);
 }
 startGame(0);const inside=spawnEnemy('shield',{x:6,z:5}),outside=spawnEnemy('shield',{x:7,z:5});inside.x=3;inside.z=5;outside.x=3;outside.z=7;damageArea(3,5,1.25,10,{hitKind:'fire'});check('命中来源接入不改变圆形伤害范围',inside.hp<inside.maxHp&&outside.hp===outside.maxHp);
 const rasterHashes=[];const savedContext=pixel.ctx,c=document.createElement('canvas');c.width=Math.ceil(pixel.w);c.height=Math.ceil(pixel.h);const g=c.getContext('2d');g.imageSmoothingEnabled=false;
 try{for(const recipe of RECIPES){startGame(HEROS.findIndex(h=>h.id===recipe.hero));game.fusion=recipe;game.player.attack=999;game.player.invuln=999;const e=spawnEnemy('shield',{x:6,z:5});e.hp=e.maxHp=10000;ultimate();
   const effect=schoolFX.find(f=>f.kind===FUSION_FX[recipe.id]);check(recipe.name+'使用独立绝学演出且受预算保护',effect&&effect.priority===4);
   pixel.ctx=g;g.clearRect(0,0,c.width,c.height);effect.t=.35;drawFusionGroundFX(effect,.35/effect.life,pixelPoint(0,5),1);drawFusionAirFX(effect,.35/effect.life,pixelPoint(0,5,.65),1);const bytes=g.getImageData(0,0,c.width,c.height).data;let hash=2166136261;for(let i=0;i<bytes.length;i++)hash=Math.imul(hash^bytes[i],16777619);rasterHashes.push(hash);pixel.ctx=savedContext;
  }}finally{pixel.ctx=savedContext;}
 check('六种融合绝学的实际图像互不相同',new Set(rasterHashes).size===6);
 startGame(0);game.fusion=RECIPES.find(r=>r.id==='雷剑');const a=spawnEnemy('shield',{x:6,z:5}),b=spawnEnemy('shield',{x:7,z:6});hitEnemy(a,10);check('雷剑连锁电弧对应实际受伤的相邻目标',b.hp<b.maxHp&&schoolFX.some(f=>f.kind==='thunderLink'&&f.endX===b.x&&f.endZ===b.z));
 startGame(0);game.fusion=RECIPES.find(r=>r.id==='冰剑');game.player.invuln=999;const frozen=spawnEnemy('shield',{x:6,z:5});frozen.hp=frozen.maxHp=10000;ultimate();updateGame(.16);check('霜河剑雨有真实寒剑落点与减速',frozen.slow>0&&effects.some(f=>f.kind==='fall'&&f.variant==='冰剑'));
 startGame(1);game.fusion=RECIPES.find(r=>r.id==='焚脉');const burned=spawnEnemy('shield',{x:6,z:5});hitEnemy(burned,10);check('焚脉符印对应实际灼烧状态',burned.burn>0&&schoolFX.some(f=>f.kind==='fusionProc'&&f.variant==='焚脉'));
 startGame(2);game.fusion=RECIPES.find(r=>r.id==='焚香');game.player.hp-=10;heal(5);check('焚香归流只在实际回复发生后出现',schoolFX.some(f=>f.kind==='incenseReturn'));schoolFX.length=0;game.player.hp=maxHealth();game.player.shield=50;game.time+=1;heal(0);check('没有回复收益时不伪造焚香归流',!schoolFX.some(f=>f.kind==='incenseReturn'));
 startGame(2);game.fusion=RECIPES.find(r=>r.id==='雪针');const snow=spawnEnemy('shield',{x:6,z:5});hitEnemy(snow,10);check('冰蝶护体对应真实护盾增加',game.player.shield>0&&schoolFX.some(f=>f.kind==='fusionProc'&&f.variant==='雪针'));
 const age=schoolFX[0].t;pauseGame();drawPixel(performance.now(),.04);check('通用与融合效果暂停时不推进',schoolFX[0].t===age);closeModal();qaArtFrozen=true;startGame(0);check('普通开局重置演武定格状态',qaArtFrozen===false);check('新局不遗留通用蓄势状态和融合特效',!game.artWindups&&schoolFX.length===0);
}
function installArtsPreviews(panel){
 const still=document.createElement('button');still.textContent='定格预览：关';still.onclick=()=>{qaArtStill=!qaArtStill;still.textContent='定格预览：'+(qaArtStill?'开':'关');qaArtFrozen=false;};panel.append(still);
 for(const [label,entries] of [['通用演武',COMMON_ARTS.map(id=>({id,name:SKILLS[id].name}))],['融合演武',RECIPES]]){
  const line=document.createElement('div');line.style.cssText='display:flex;gap:4px;flex-wrap:wrap;margin-top:6px';const title=document.createElement('span');title.textContent=label+'：';line.append(title);
  for(const entry of entries){const button=document.createElement('button');button.textContent=entry.name+'演武';button.onclick=()=>{
   const fusion=label==='融合演武',row=fusion?HEROS.findIndex(h=>h.id===entry.hero):0;startGame(row);game.player.invuln=999;game.player.attack=fusion ? .1 : 999;game.level=12;game.wave=4;game.time=200;game.waveTime=20;
   for(let i=0;i<12;i++){const angle=i/12*TAU,r=i%2?5.5:3,e=spawnEnemy('shield',{x:Math.sin(angle)*r,z:5+Math.cos(angle)*r});if(e){e.hp=e.maxHp=20000;e.speed=0;e.damage=0;if(fusion&&row===1){e.marks=3;e.markTime=6;}}}
   if(fusion){for(let i=0;i<5;i++)gainSkill('weapon');for(let i=0;i<3;i++){gainSkill(entry.skill);gainSkill(entry.common);}game.fusion=entry;for(const id of Object.keys(game.skills))game.skillTimers[id]=999;schedule(.18,ultimate);}
   else{for(let i=0;i<3;i++)gainSkill(entry.id);game.skillTimers[entry.id]=.18;announce(entry.name,'通用武学 · 独立释放与命中');}
   warnCircle(game.player.x+3,game.player.z+2,1.5,0,2);
   if(qaArtStill){const steps=fusion?24:entry.id==='thunder'?16:22;for(let i=0;i<steps;i++){updateGame(.02);updateEffects(.02);}qaArtFrozen=true;}
   updateHUD();panel.classList.add('hidden');
  };line.append(button);}panel.append(line);
 }
}
