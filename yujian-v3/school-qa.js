/* 验证投射物真实类型、飞行命中、E/Q表现以及高清画布。 */
function checkSchoolCombat(check){
 check('画布覆盖屏幕原生像素',pixel.canvas.width===Math.round(innerWidth*Math.min(devicePixelRatio||1,2))&&pixel.canvas.height===Math.round(innerHeight*Math.min(devicePixelRatio||1,2)));
 check('绘制变换匹配屏幕像素比',Math.abs(pixel.ctx.getTransform().a-2*Math.min(devicePixelRatio||1,2))<.001&&pixel.ctx.imageSmoothingEnabled===false);
 check('角色保留原始图集细节',actorSprite(0,0).height>=128&&actorSprite(1,0).height>=128&&actorSprite(2,0).height>=128);
 check('场景保留原始图集细节',propSprite(0).height>=200&&propSprite(2).height>=200);
 const pixels=actorSprite(0,0).getContext('2d').getImageData(0,0,actorSprite(0,0).width,actorSprite(0,0).height).data;let hardAlpha=true;for(let i=3;i<pixels.length;i+=4)if(pixels[i]!==0&&pixels[i]!==255){hardAlpha=false;break;}check('人物边缘无半透明模糊晕边',hardAlpha);
 const kinds=['swordqi','dart','butterfly'];
 for(let i=0;i<3;i++){
  startGame(i);game.player.invuln=999;const target=spawnEnemy('shield',{x:6,z:5}),hp=target.hp;autoAttack();for(let n=0;n<3;n++)updateGame(.04);
  check(HEROS[i].sect+'普通攻击使用专属投射物',projectiles.length>0&&projectiles.every(b=>b.kind===kinds[i]));
  check(HEROS[i].sect+'伤害随投射物飞行判定',target.hp===hp);
  for(let n=0;n<35&&state==='playing';n++)updateGame(.04);
  check(HEROS[i].sect+'投射物能命中并造成伤害',target.hp<hp&&game.hitCount>0);
  if(i===0)check('剑气具备宽幅穿透判定',projectiles.some(b=>b.kind==='swordqi'&&b.pierce>1&&b.r>=.5)||game.hitCount>0);
  if(i===1)check('飞镖具备旋转年龄与短尾迹',projectiles.filter(b=>b.kind==='dart').every(b=>b.age>=0&&Array.isArray(b.trail)&&b.trail.length<=4));
  if(i===2)check('蝴蝶具备追踪与振翅相位',projectiles.some(b=>b.kind==='butterfly'&&b.homing&&Number.isFinite(b.wavePhase)));
  projectiles.forEach(clearProjectile);projectiles.length=0;signature();check(HEROS[i].sect+'身法仍发出对应攻击',game.player.artCD>0&&projectiles.some(b=>b.kind===kinds[i]));
  pClean();game.player.ult=0;ultimate();updateGame(.04);check(HEROS[i].sect+'绝技发出对应投射物',game.player.ult>0&&projectiles.some(b=>b.kind===kinds[i]));
  check(HEROS[i].sect+'存在独立门派特效',schoolFX.some(f=>f.kind===['swordSeal','dartSeal','umbrella'][i]));
 }
 startGame(1);const marked=spawnEnemy('shield',{x:6,z:5});marked.marks=3;marked.markTime=6;const before=marked.hp;signature();for(let n=0;n<25&&state==='playing';n++)updateGame(.04);check('飞镖破印可以命中并爆发',marked.hp<before);
 startGame(2);signature();check('百草花庭独立存在且可回复',areas.some(a=>a.type==='heal')&&schoolFX.some(f=>f.kind==='umbrella'));
 addSchoolFX('swordHit',0,0);cleanGame();check('重新开局回收门派特效',schoolFX.length===0&&projectiles.length===0);
 function pClean(){for(const b of projectiles)clearProjectile(b);projectiles.length=0;scheduled.length=0;}
}
