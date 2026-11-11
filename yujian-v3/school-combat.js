/* 身法 */
function signature(){
 if(state!=='playing')return;const p=game.player,h=game.hero.id,chain=h==='sword'&&p.artWindow>0&&p.artChain>0;if(p.artCD>0&&!chain)return;
 const target=aimTarget()||{x:p.x+Math.sin(p.angle)*8,z:p.z+Math.cos(p.angle)*8},a=Math.atan2(target.x-p.x,target.z-p.z);p.angle=a;p.targetAngle=a;p.anim='art';p.animTime=.5;p.invuln=.45;game.shake=.08;
 if(h==='sword'){
  if(!chain){p.artChain=3;p.artCD=7;}p.artChain--;p.artWindow=p.artChain>0?1.7:0;const ox=p.x,oz=p.z;moveEntity(p,Math.sin(a)*3.4,Math.cos(a)*3.4,.28);game.distance+=Math.hypot(p.x-ox,p.z-oz);p.dashTime=.1;p.dashX=p.dashZ=0;
  addSchoolFX('swordDash',ox,oz,{endX:p.x,endZ:p.z,angle:a,life:.4});
  fireFan(target,1+Math.floor(levelOf('weapon')/3),62+levelOf('weapon')*12,{kind:'swordqi',color:0x9eeef0,speed:24,life:.82,pierce:9,r:.75,width:1.7});
  p.empower=2;announce('追风三叠',p.artChain?'踏风出剑 · 再按 E 续招':'剑气破阵');schoolAttackSound('sword');
 }
 if(h==='dagger'){
  p.artCD=6.2;p.stealth=2.4;const e=nearest(p.x,p.z,17,true)||target,ox=p.x,oz=p.z;
  moveEntity(p,-Math.sin(a)*2.1,-Math.cos(a)*2.1,.28);game.distance+=Math.hypot(p.x-ox,p.z-oz);addSchoolFX('daggerGhost',ox,oz,{life:.5});
  fireFan(e,3+Math.floor(levelOf('weapon')/3),48+game.level*2,{kind:'dart',color:0xc4a1ff,speed:32,life:.7,pierce:3,r:.34,spread:.105,detonateMarks:true,empowered:true});
  announce('月下藏锋','退步隐匿 · 飞镖破印');schoolAttackSound('dagger');
 }
 if(h==='healer'){
  p.artCD=7.5;const d=Math.min(4.4,Math.hypot(target.x-p.x,target.z-p.z)),x=p.x+Math.sin(a)*d,z=p.z+Math.cos(a)*d;
  addArea(x,z,3.4*rangeScale(),25+game.level*2,5,0x8cd6a3,'heal');heal(10);addSchoolFX('umbrella',p.x,p.z,{life:.65});
  for(let i=0;i<8;i++){const angle=i/8*TAU;addProjectile(x,z,Math.sin(angle),Math.cos(angle),23,{kind:'butterfly',orb:true,color:0xabe9bd,speed:12,homing:true,life:1.6,pierce:2,wavePhase:i});}
  announce('花汀蝶梦','撑伞唤蝶 · 花庭回春');schoolAttackSound('healer');
 }
}
/* 绝技 */
function ultimate(){
 if(state!=='playing'||game.player.ult>0)return;const p=game.player,f=game.fusion?.id,color=game.fusion?.color||game.hero.hex;p.ult=24*Math.max(.55,1-levelOf('energy')*.1);p.invuln=1;p.anim='ultimate';p.animTime=1.2;game.shake=.16;game.hitstop=.035;announce(game.fusion?.name||game.hero.ult,'绝技 · '+{sword:'万剑归流',dagger:'银镖成阵',healer:'伞开蝶起'}[game.hero.id]);sound('ult');
 if(game.hero.id==='sword'){
  const center={x:p.x,z:p.z},r=8*rangeScale();addSchoolFX('swordSeal',p.x,p.z,{life:1.2,r});
  for(let wave=0;wave<5;wave++)schedule(.12+wave*.22,()=>{const targets=game.enemies.filter(e=>!e.dead&&Math.hypot(e.x-center.x,e.z-center.z)<r).slice(0,16);
   for(const e of targets){swordFall(e.x,e.z,f==='冰剑'?0xabeefa:0xbceff0);addSchoolFX('swordHit',e.x,e.z,{life:.35,angle:wave*.4});hitEnemy(e,game.fusion?85:58,true,'swordqi');if(f==='冰剑')e.slow=3;if(f==='雷剑'&&wave%2===0)lightning(e.x,e.z,color);}
  });
  for(let wave=0;wave<3;wave++)schedule(wave*.20,()=>{const target=aimTarget()||{x:p.x+Math.sin(p.angle)*10,z:p.z+Math.cos(p.angle)*10};fireFan(target,3,38,{kind:'swordqi',color:0xc9f8f0,speed:23,life:.7,pierce:8,r:.65,width:1.4,spread:.26});});
 }
 if(game.hero.id==='dagger'){
  addSchoolFX('dartSeal',p.x,p.z,{life:1.1});
  for(let wave=0;wave<4;wave++)schedule(wave*.14,()=>{const chosen=game.enemies.filter(e=>!e.dead&&Math.hypot(e.x-p.x,e.z-p.z)<17).sort((a,b)=>(b.marks||0)-(a.marks||0)).slice(0,12);
   for(let i=0;i<chosen.length;i++){const e=chosen[i],angle=Math.atan2(e.x-p.x,e.z-p.z);addProjectile(p.x,p.z,Math.sin(angle),Math.cos(angle),game.fusion?75:52,{kind:'dart',color:f==='焚脉'?0xf7ad8c:0xd5b7ff,speed:30+wave,life:.75,pierce:3,r:.35,detonateMarks:true,empowered:true});}
   if(f==='叶影')for(let i=0;i<8;i++){const a=i/8*TAU;addProjectile(p.x,p.z,Math.sin(a),Math.cos(a),38,{kind:'dart',color:0xc6e7a1,speed:26,pierce:5,life:.7});}
  });
 }
 if(game.hero.id==='healer'){
  heal(40);p.shield=Math.min(50,p.shield+18);addSchoolFX('umbrella',p.x,p.z,{life:1.2,r:1.4});addArea(p.x,p.z,7*rangeScale(),game.fusion?90:52,6,f==='雪针'?0xa1e5ea:0xb6e0a8,f==='雪针'?'iceGarden':'incense');
  for(let wave=0;wave<3;wave++)schedule(wave*.32,()=>{for(let i=0;i<14;i++){const a=i/14*TAU+wave*.15;addProjectile(p.x,p.z,Math.sin(a),Math.cos(a),45,{kind:'butterfly',orb:true,color:f==='雪针'?0xa6eafa:0xe0e8ac,pierce:3,homing:true,speed:12,life:1.7,wavePhase:i+wave});}});
 }
}
/* 普通攻击 */
function autoAttack(){
 const p=game.player,target=aimTarget();if(!target)return;const a=Math.atan2(target.x-p.x,target.z-p.z),lv=levelOf('weapon'),damage=game.hero.attack*(1+(lv-1)*.3)*(1+levelOf('energy')*.08),h=game.hero.id;
 p.targetAngle=a;p.combo=(p.combo+1)%3;p.anim='attack';p.animTime=h==='dagger'?.23:.32;p.swing=p.animTime;p.attackAngle=a;game.shots++;
 if(h==='sword'){
  const third=p.combo===2,boost=third||p.empower>0;fireFan(target,1+Math.floor(lv/3),damage*(third?1.55:1.1),{kind:'swordqi',color:game.fusion?.color||0xb0eef0,speed:24,life:.8,pierce:third?8:5,r:boost?.70:.50,width:boost?1.6:1.15});
  addSchoolFX('swordMuzzle',p.x,p.z,{angle:a,life:.18});if(p.empower>0)p.empower--;schoolAttackSound('sword');
 }
 if(h==='dagger'){
  fireFan(target,1+Math.floor(lv/3),damage*1.25,{kind:'dart',color:game.fusion?.color||0xcdb4ff,speed:30,life:.7,pierce:3,r:.32,spread:.095});addSchoolFX('dartMuzzle',p.x,p.z,{angle:a,life:.16});schoolAttackSound('dagger');
 }
 if(h==='healer'){
  fireFan(target,2+Math.floor(lv/3),damage,{kind:'butterfly',orb:true,color:game.fusion?.color||0xbfe3a3,pierce:3,speed:11.5,life:1.65,homing:true,spread:.28});addSchoolFX('butterflyMuzzle',p.x,p.z,{angle:a,life:.4});schoolAttackSound('healer');
 }
}
/* 专属武学 */
function castSchoolSkill(id,lv){
 if(!['orbit','return','shadow','mark','mist','needle'].includes(id))return false;
 const p=game.player,target=nearest(p.x,p.z,18,true),f=game.fusion?.id,damageScale=1+game.level*.02;
 if(id==='orbit'&&target)for(let i=0;i<3;i++)schedule(i*.12,()=>{fireFan(target,1,20+lv*15,{kind:'swordqi',color:game.fusion?.color||0xa8e7ee,speed:20,life:.95,pierce:8,r:.85,width:1.8});if(f==='雷剑'&&!target.dead){lightning(target.x,target.z);hitEnemy(target,20*lv,true,'swordqi');}});
 if(id==='return'&&target)fireFan(target,lv,29*lv*damageScale,{kind:'returnqi',color:game.fusion?.color||0xb7f1df,pierce:10,life:1.4,speed:16,boomerang:true,r:.55,width:1.1,spread:.16});
 if(id==='shadow'&&target)for(let i=0;i<lv+1;i++)schedule(i*.12,()=>{const x=p.x+(i%2?1:-1)*1.1,z=p.z-.6,a=Math.atan2(target.x-x,target.z-z);addSchoolFX('daggerGhost',x,z,{life:.35});addProjectile(x,z,Math.sin(a),Math.cos(a),34*lv*damageScale,{kind:'dart',color:0xd7b3fb,speed:29,life:.75,pierce:3,r:.34});});
 if(id==='mark'&&target){const a=Math.atan2(target.x-p.x,target.z-p.z);addProjectile(p.x,p.z,Math.sin(a),Math.cos(a),46*lv*damageScale,{kind:'dart',color:f==='焚脉'?0xf3af89:0xefc1ff,speed:26,life:.85,pierce:4,r:.4,detonateMarks:true,empowered:true});}
 if(id==='mist'){addArea(p.x,p.z,(2.6+lv*.4)*rangeScale(),15*lv*damageScale,5,f==='焚香'?0xe4c688:0xaed7a2,f==='焚香'?'incense':'heal');addSchoolFX('umbrella',p.x,p.z,{life:.65});for(let i=0;i<lv+2;i++){const a=i/(lv+2)*TAU;addProjectile(p.x,p.z,Math.sin(a),Math.cos(a),16*lv,{kind:'butterfly',orb:true,color:0xb5e5ba,pierce:2,speed:10,homing:true,life:1.4});}}
 if(id==='needle'&&target)fireFan(target,3+lv,20*lv*damageScale,{kind:'butterfly',orb:true,color:f==='雪针'?0xa8e8f2:0xe3e7ab,pierce:3,speed:13,life:1.5,homing:true,spread:.25});
 return true;
}
