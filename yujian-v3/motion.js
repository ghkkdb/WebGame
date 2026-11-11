/* 动画只消费位移与战斗事件，不修改碰撞、移速、伤害和冷却。 */
const motionAtlas=new Image(),motionCache=new Map(),motionMetrics=[];
motionAtlas.src=globalThis.YJ_ASSETS.motion;
const motionReady=motionAtlas.decode().then(()=>{for(let row=0;row<3;row++)prepareMotionRow(row);});
const ACTIONS={attack:{priority:1,duration:.38},art:{priority:2,duration:.52},ultimate:{priority:5,duration:.86},dash:{priority:4,duration:.25}};
function actorMotion(e){return e.motion||(e.motion={x:e.x,z:e.z,phase:0,clock:0,speed:0,weight:0,facing:1,turn:0,lean:0,action:null,hurt:0,landing:0,air:0,trail:[],trailTimer:0});}
function beginActorAction(e,kind,angle=e.angle||0){
 const m=actorMotion(e),def=ACTIONS[kind];if(!def)return;
 if(m.action&&ACTIONS[m.action.kind].priority>def.priority&&m.action.age<m.action.duration)return;
 const duration=kind==='attack'?(game.hero.id==='dagger'?.29:game.hero.id==='healer'?.46:.38):def.duration;
 m.action={kind,age:kind==='art'?.105:0,duration,angle};const side=Math.sin(angle);if(Math.abs(side)>.16)m.facing=side<0?-1:1;m.turn=.06;
}
function updateActorMotion(e,dt,hero=false){
 const m=actorMotion(e),dx=e.x-m.x,dz=e.z-m.z,distance=Math.hypot(dx,dz);m.x=e.x;m.z=e.z;m.clock+=dt;
 // 瞬移与击退不计入跑步步长；撞墙时没有实际位移便停止踏步。
 const d=distance<.8?distance:0,dashing=hero&&e.dashTime>0;
 m.speed=d/Math.max(dt,.001);const target=dashing?0:Math.min(1,m.speed/(hero?4:1.4));m.weight+=(target-m.weight)*(1-Math.exp(-dt*18));
 if(!dashing&&d>.001)m.phase+=d/(hero?2.65:1.6)*TAU;
 if(m.action){m.action.age+=dt;if(m.action.age>=m.action.duration)m.action=null;}
 if(!m.action){const side=hero?(Math.abs(e.vx)>.35?e.vx/Math.max(1,Math.hypot(e.vx,e.vz)):Math.sin(e.angle||0)):Math.sin(e.angle||0);m.turn=Math.max(0,m.turn-dt);if(Math.abs(side)>.22&&m.turn<=0){const facing=side<0?-1:1;if(facing!==m.facing){m.facing=facing;m.turn=.12;}}}
 const desired=hero?clamp((e.vx||0)/10,-.6,.6):clamp(dx/Math.max(dt,.001)/8,-.3,.3);m.lean+=(desired-m.lean)*(1-Math.exp(-dt*12));m.hurt=Math.max(0,m.hurt-dt);m.landing=Math.max(0,m.landing-dt);
 if(dashing){m.air=Math.min(1,m.air+dt*18);m.trailTimer-=dt;if(m.trailTimer<=0){m.trailTimer=.045;const pose=actorPose(e,selected,true);m.trail.push({x:e.x,z:e.z,facing:m.facing,pose,age:0});}}
 else if(m.air>0){m.air=Math.max(0,m.air-dt*13);if(m.air===0)m.landing=.12;}
 for(const t of m.trail)t.age+=dt;m.trail=m.trail.filter(t=>t.age<.18).slice(-4);
}
function motionFrame(row,action,frame){
 const index=(row*2+(action?1:0))*6+frame;if(motionCache.has(index))return motionCache.get(index);
 // 原图横斩剑尖、举伞跨过网格数像素：按实际轮廓扩展对应切片，并排除邻帧碎片。
 const crop=({8:[0,0,40,0],27:[0,0,0,-8],33:[0,-10,0,10]})[index]||[0,0,0,0];
 const size=motionAtlas.width/6,c=document.createElement('canvas');c.width=size+crop[2];c.height=size+crop[3];const g=c.getContext('2d');g.drawImage(motionAtlas,index%6*size+crop[0],Math.floor(index/6)*size+crop[1],c.width,c.height,0,0,c.width,c.height);
 const data=g.getImageData(0,0,c.width,c.height);if(index===8||index===9)retainMainSilhouette(data);
 let top=c.height,bottom=0,left=c.width,right=0;
 for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++){const i=(y*c.width+x)*4+3;data.data[i]=data.data[i]<180?0:255;if(data.data[i]){top=Math.min(top,y);bottom=Math.max(bottom,y);left=Math.min(left,x);right=Math.max(right,x);}}
 g.putImageData(data,0,0);const result={image:c,top,bottom,left,right,offsetX:crop[0],offsetY:crop[1]};motionCache.set(index,result);return result;
}
function retainMainSilhouette(data){
 // 只用于跨格剑尖的两张切片；相邻人物的碎片与本帧主体没有连通像素。
 const {width:w,height:h,data:a}=data,visited=new Uint8Array(w*h);let main=[];
 for(let n=0;n<w*h;n++){if(visited[n]||a[n*4+3]<180)continue;const component=[n];visited[n]=1;for(let k=0;k<component.length;k++){const p=component[k],x=p%w,y=Math.floor(p/w);for(let yy=Math.max(0,y-1);yy<=Math.min(h-1,y+1);yy++)for(let xx=Math.max(0,x-1);xx<=Math.min(w-1,x+1);xx++){const next=yy*w+xx;if(!visited[next]&&a[next*4+3]>=180){visited[next]=1;component.push(next);}}}if(component.length>main.length)main=component;}
 const keep=new Uint8Array(w*h);for(const n of main)keep[n]=1;for(let n=0;n<w*h;n++)if(!keep[n])a[n*4+3]=0;
}
function prepareMotionRow(row){
 const frames=Array.from({length:6},(_,i)=>motionFrame(row,false,i));
 const heights=frames.map(s=>s.bottom-s.top+1).sort((a,b)=>a-b),centres=frames.map(s=>(s.left+s.right)/2).sort((a,b)=>a-b);
 const feet=frames.map(s=>s.bottom).sort((a,b)=>a-b);
 motionMetrics[row]={unit:40/((heights[2]+heights[3])/2),anchorX:(centres[2]+centres[3])/2,baseline:(feet[2]+feet[3])/2};
 for(let i=0;i<6;i++)motionFrame(row,true,i);
}
function actorPose(e,row,hero){
 const m=actorMotion(e),run=m.weight>.16,walk=run?Math.floor(m.phase/TAU*(hero?6:4))%(hero?6:4):hero?2:1;
 let action=hero&&!run,frame=hero&&!run?5:walk,progress=0;
 if(hero&&m.action){const a=m.action;progress=clamp(a.age/a.duration,0,1);action=true;
  // 出手帧紧跟短前摇，回收占较多时间；轻功取低重心姿态。
  if(a.kind==='dash')frame=1;
  else if(a.kind==='attack')frame=progress<.10?0:progress<.19?1:progress<.35?2:progress<.54?3:progress<.78?4:5;
  else frame=progress<.10?0:progress<.20?1:progress<.50?2:progress<.70?3:progress<.85?4:5;
 }
 const bounce=run?Math.abs(Math.sin(m.phase))*m.weight*.7:Math.sin(m.clock*2.6)*.25;
 return{frame,walk,action,progress,run,bounce,lean:m.lean,air:m.air,landing:m.landing,hurt:m.hurt,weight:m.weight,kind:m.action?.kind};
}
function paintHeroPose(row,pose,alpha=1){
 const g=pixel.ctx,metric=motionMetrics[row],s=motionFrame(row,pose.action,pose.frame),unit=metric.unit,scale=pose.kind==='dash'?1.025:1;
 const draw=(sprite,torso=false)=>{const w=sprite.image.width*unit,h=sprite.image.height*unit;g.save();if(torso)g.transform(1,0,pose.lean*.055,1,0,0);const baseline=pose.action&&sprite===s?sprite.bottom:metric.baseline;g.drawImage(sprite.image,-(metric.anchorX-sprite.offsetX)*unit,-(baseline+1)*unit,w*scale,h);g.restore();};
 g.globalAlpha*=alpha;const lift=pose.air*3+pose.bounce,landing=pose.landing>0?Math.sin(pose.landing/.12*Math.PI)*.8:0;
 g.translate(pose.hurt>0?-Math.sin(pose.hurt/.18*Math.PI)*1.4:0,-Math.round((lift-landing)*2)/2);
 if(pose.action&&pose.run&&pose.kind!=='dash'){
  // 腰下仍按真实步长跑动，自动出招不会把双脚锁成站姿。
  g.save();g.beginPath();g.rect(-100,-13,200,30);g.clip();draw(motionFrame(row,false,pose.walk));g.restore();
  g.save();g.beginPath();g.rect(-100,-100,200,87);g.clip();draw(s,true);g.restore();
 }else{draw(s,true);}
}
function drawMotionActor(e,row,hero=false){
 const g=pixel.ctx,p=pixelPoint(e.x,e.z),m=actorMotion(e),pose=actorPose(e,row,hero),scale=hero?1:Math.min(1.5,e.scale||1),h=(hero?40:35)*scale;
 drawShadow(p.x,p.y,hero?15:13*scale,5);
 if(hero){g.save();g.globalAlpha=.6;drawPixelRing(e.x,e.z,.62,'#d8e7ac',.8,1);g.restore();
  for(const trail of m.trail){const q=pixelPoint(trail.x,trail.z);g.save();g.translate(q.x,q.y);g.scale(trail.facing,1);paintHeroPose(row,trail.pose,(1-trail.age/.18)*.22);g.restore();}
 }
 g.save();g.translate(p.x,p.y);g.scale(m.facing,1);g.globalAlpha=hero&&e.stealth>0?.62:1;
 if(hero)paintHeroPose(row,pose);
 else{const s=actorSprite(row,pose.frame),metric=enemyMotionMetric(row),w=s.width*metric*scale,hh=s.height*metric*scale;g.transform(1,0,m.lean*.04,1,0,-Math.round(pose.bounce*2)/2);g.drawImage(s,-w/2,-hh,w,hh);}
 g.restore();pixel.draws++;
 if(m.hurt>0||!hero&&e.flash>0){g.fillStyle='#fff0d1';const offset=hero?Math.sin(m.hurt*60)*2:2;g.fillRect(p.x-5+offset,p.y-h*.55,2,2);g.fillRect(p.x+4+offset,p.y-h*.45,2,2);}
 if(!hero&&e.hp<e.maxHp){g.fillStyle='#233c37';g.fillRect(p.x-9,p.y-h-5,18,3);g.fillStyle=e.type==='boss'?'#ce9962':'#bb7563';g.fillRect(p.x-8,p.y-h-4,Math.max(0,Math.round(16*e.hp/e.maxHp)),1);}
 if(e.marks)drawSchoolEnemyMarks(e,p,h);
 if(!hero)drawArtStatus(e,p,h);
 if(e.type==='boss'){drawPixelRing(e.x,e.z,1,'#7a4362',.7,1);pixelPoly(g,[[p.x-18,p.y-h+12],[p.x,p.y-h-4],[p.x+18,p.y-h+12]],'#332b44');pixelLine(g,[[p.x-18,p.y-h+12],[p.x,p.y-h+4],[p.x+18,p.y-h+12]],'#89718b');}
}
const enemyMotionMetrics=new Map();
function enemyMotionMetric(row){if(!enemyMotionMetrics.has(row)){const sizes=Array.from({length:4},(_,i)=>actorSprite(row,i).height).sort((a,b)=>a-b);enemyMotionMetrics.set(row,35/((sizes[1]+sizes[2])/2));}return enemyMotionMetrics.get(row);}
