/* 通过真实战斗推进验证步态、动作优先级、前摇释放和暂停。 */
function checkMotion(check){
 check('三侠36帧动作素材解码',motionAtlas.complete&&motionCache.size===36&&motionAtlas.width===motionAtlas.height);
 const hash=s=>{const a=s.image.getContext('2d').getImageData(0,0,s.image.width,s.image.height).data;let h=2166136261;for(let i=0;i<a.length;i++)h=Math.imul(h^a[i],16777619);return h;};
 for(let row=0;row<3;row++){
  const run=Array.from({length:6},(_,i)=>motionFrame(row,false,i)),attack=Array.from({length:6},(_,i)=>motionFrame(row,true,i));
  check(HEROS[row].sect+'跑步与出招均有独立六帧',new Set(run.map(hash)).size===6&&new Set(attack.map(hash)).size===6);
  check(HEROS[row].sect+'动作透明边缘与完整留白',run.concat(attack).every(s=>s.left>0&&s.right<s.image.width-1&&s.top>0&&s.bottom<s.image.height-1));
 }
 const slow={x:0,z:0},fast={x:0,z:0};actorMotion(slow);actorMotion(fast);for(let i=0;i<10;i++){slow.x+=.1;updateActorMotion(slow,.04);}for(let i=0;i<5;i++){fast.x+=.2;updateActorMotion(fast,.04);}check('相同路程步态一致且不依赖全局时钟',Math.abs(slow.motion.phase-fast.motion.phase)<1e-8);
 const stoppedPhase=slow.motion.phase;for(let i=0;i<20;i++)updateActorMotion(slow,.04);check('角色或弓手停步后不再原地踏步',slow.motion.phase===stoppedPhase&&slow.motion.weight<.01);
 const phaseBefore=fast.motion.phase;fast.x+=5;updateActorMotion(fast,.04);check('大距离身法不造成步频暴跳',fast.motion.phase===phaseBefore);
 for(let row=0;row<3;row++){
  startGame(row);const p=game.player;p.invuln=999;p.attack=999;spawnEnemy('shield',{x:6,z:5});autoAttack();
  check(HEROS[row].sect+'普攻先摆动作再发射',projectiles.length===0&&p.motion.action?.kind==='attack');
  updateGame(.02);check(HEROS[row].sect+'短前摇期间没有提前飞出的攻击',projectiles.length===0);
  for(let i=0;i<3;i++)updateGame(.03);check(HEROS[row].sect+'出手帧与专属投射物同步',projectiles.length>0&&actorPose(p,row,true).frame>=2);
 }
 startGame(0);const p=game.player;p.attack=999;p.invuln=999;spawnEnemy('shield',{x:6,z:5});keys.add('KeyD');for(let i=0;i<7;i++)updatePlayer(.03);autoAttack();updatePlayer(.04);const moving=actorPose(p,0,true);check('移动出招仍保留腿部跑步',moving.run&&moving.action&&moving.walk>=0);keys.clear();
 ultimate();autoAttack();check('普攻不会覆盖绝技身体动作',p.motion.action?.kind==='ultimate');
 const age=p.motion.action.age,phase=p.motion.phase;pauseGame();drawPixel(performance.now(),.04);check('暂停绘制不会推进角色动作',p.motion.action.age===age&&p.motion.phase===phase);closeModal();
 p.motion.action=null;doDash();for(let i=0;i<3;i++)updatePlayer(.04);check('轻功残影记录当时的实际姿态',p.motion.trail.length>0&&p.motion.trail.every(t=>t.pose.kind==='dash'&&Number.isFinite(t.facing)));
 for(let i=0;i<14;i++)updatePlayer(.04);check('轻功结束后残影正确回收',p.motion.trail.length===0&&p.motion.air===0);
 const oldMotion=p.motion;startGame(1);check('重新开局不沿用上局动作与残影',game.player.motion!==oldMotion&&!(game.player.motion?.trail.length));
}
function installMotionPreview(panel){
 const button=document.createElement('button');button.textContent='动作预览';button.style.marginTop='6px';panel.append(button);
 button.onclick=()=>{
  if(state==='playing')pauseGame();const overlay=document.createElement('div');overlay.style.cssText='position:fixed;inset:0;z-index:150;background:#172d2af5;display:grid;place-content:center;padding:24px;color:#eee3bd;text-align:center';
  overlay.innerHTML='<h2 style="font-size:22px;margin:0 0 12px">三侠 · 动作预览</h2><p style="margin:0 0 16px;font-size:13px">跑步 / 出招 / 移动出招 / 轻功　　六帧动作 · 距离驱动步态</p><canvas width="1000" height="520" style="max-width:90vw;max-height:65vh;image-rendering:pixelated"></canvas><button style="margin:16px auto 0;width:120px">关闭预览</button>';
  document.body.append(overlay);overlay.querySelector('button').onclick=()=>overlay.remove();const canvas=overlay.querySelector('canvas'),g=canvas.getContext('2d');g.imageSmoothingEnabled=false;
  const start=performance.now();function preview(now){if(!overlay.isConnected)return;const t=(now-start)/1000;g.fillStyle='#203a35';g.fillRect(0,0,1000,520);g.fillStyle='#e8d9ae';g.font='15px Microsoft YaHei';g.textAlign='center';['跑步','挥剑 / 掷镖 / 舞伞','边走边出招','轻功与落地'].forEach((name,i)=>g.fillText(name,200+i*220,30));
   const old=pixel.ctx;pixel.ctx=g;
   for(let row=0;row<3;row++){g.fillStyle=HEROS[row].color;g.font='16px Microsoft YaHei';g.fillText(HEROS[row].sect,58,110+row*160);for(let col=0;col<4;col++){const clock=t%(col===3?.9:.85),progress=clock/(col===3?.9:.85),e={x:0,z:0,angle:1,vx:col===0||col===2?6:0,dashTime:0};const m=actorMotion(e);m.clock=t;m.weight=col===0||col===2?1:0;m.phase=t*TAU*1.8;m.lean=.3;if(col!==0)m.action={kind:col===3?'dash':'attack',age:progress*.38,duration:.38};m.air=col===3?Math.sin(progress*Math.PI)*.9:0;const pose=actorPose(e,row,true);g.save();g.translate(200+col*220,150+row*160);g.fillStyle='#afc2a444';g.fillRect(-55,0,110,1);g.scale(2.7,2.7);paintHeroPose(row,pose);g.restore();}}
   pixel.ctx=old;requestAnimationFrame(preview);
  }requestAnimationFrame(preview);
 };
}
