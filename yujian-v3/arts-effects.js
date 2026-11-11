/* 通用武学与融合绝学的独立演出。所有事件来自既有释放、命中和回血，不增加伤害判定。 */
const COMMON_ARTS=['thunder','fire','ice','leaf','wind','petal'];
const ART_COLORS={thunder:'#b9e3ff',fire:'#f3b182',ice:'#b6edf0',leaf:'#c9e4a4',wind:'#e1e9c9',petal:'#efbfda'};
const FUSION_FX={雷剑:'fusionThunder',冰剑:'fusionFrost',叶影:'fusionLeaves',焚脉:'fusionBrand',焚香:'fusionIncense',雪针:'fusionSnow'};
Object.assign(FX_PRIORITY,{commonCharge:1,fireBurst:2,leafFan:1,petalBloom:2,commonImpact:0,thunderLink:2,fusionThunder:4,fusionFrost:4,fusionLeaves:4,fusionBrand:4,fusionIncense:4,fusionSnow:4,fusionProc:1,incenseReturn:1});
function primeCommonVisual(id,lv,remaining){
 if(!COMMON_ARTS.includes(id))return;const flags=game.artWindups||(game.artWindups={});
 if(remaining>.18||remaining<=0){flags[id]=false;return;}if(flags[id])return;flags[id]=true;
 addSchoolFX('commonCharge',game.player.x,game.player.z,{life:remaining,sourceSkill:id,level:lv,follow:true});
}
function artReleaseSound(id){
 if(!soundOn||!audio)return;const ctx=audio.ctx,t=ctx.currentTime,osc=ctx.createOscillator(),gain=ctx.createGain(),notes={thunder:[165,65],fire:[310,95],ice:[1550,730],leaf:[760,410],wind:[220,90],petal:[960,1320]};
 const pair=notes[id];if(!pair)return;osc.type=id==='thunder'||id==='fire'?'triangle':'sine';osc.frequency.setValueAtTime(pair[0],t);osc.frequency.exponentialRampToValueAtTime(pair[1],t+.13);gain.gain.setValueAtTime(.001,t);gain.gain.exponentialRampToValueAtTime(.045,t+.012);gain.gain.exponentialRampToValueAtTime(.001,t+.17);osc.connect(gain);gain.connect(audio.master);osc.start(t);osc.stop(t+.18);
}
function emitCommonCastFX(id,lv,target){
 if(!COMMON_ARTS.includes(id))return;const p=game.player,scale=rangeScale(),options={sourceSkill:id,level:lv};
 if(['thunder','fire','leaf','petal'].includes(id)&&!target)return;artReleaseSound(id);
 if(id==='thunder'){const chosen=game.enemies.filter(e=>!e.dead&&Math.hypot(e.x-target.x,e.z-target.z)<4).slice(0,lv+1);for(const e of chosen)addSchoolFX('thunderStrike',e.x,e.z,{...options,life:.48,r:1.25});for(let i=1;i<chosen.length;i++)addSchoolFX('thunderLink',chosen[i-1].x,chosen[i-1].z,{life:.22,endX:chosen[i].x,endZ:chosen[i].z});}
 if(id==='fire')addSchoolFX('fireBurst',target.x,target.z,{...options,life:.62,r:(1.8+lv*.3)*scale});
 if(id==='ice')addSchoolFX('frostWave',p.x,p.z,{...options,life:.75,r:(3+lv*.6)*scale});
 if(id==='leaf')addSchoolFX('leafFan',p.x,p.z,{...options,life:.36,angle:Math.atan2(target.x-p.x,target.z-p.z)});
 if(id==='wind')addSchoolFX('windSweep',p.x,p.z,{...options,life:.66,r:(2.7+lv*.45)*scale});
 if(id==='petal')addSchoolFX('petalBloom',target.x,target.z,{...options,life:.8,r:(2+lv*.4)*scale});
}
function emitCombatHitFX(e,kind,critical,secondary){
 if(secondary&&!critical)return;
 if(COMMON_ARTS.includes(kind)){addSchoolFX('commonImpact',e.x,e.z,{life:critical?.4:.28,sourceSkill:kind,critical});return;}
 const hero=game.hero.id,key=kind==='dart'||!kind&&hero==='dagger'?'dartHit':kind==='butterfly'||!kind&&hero==='healer'?'butterflyHit':'swordHit';
 addSchoolFX(key,e.x,e.z,{life:critical?.36:.23,angle:game.player.angle,critical,priority:critical?1:0});
}
function emitFusionUltimate(id,p){
 if(!FUSION_FX[id])return;
 addSchoolFX(FUSION_FX[id],p.x,p.z,{life:id==='焚香'||id==='雪针'?1.65:1.35,r:(id==='雷剑'||id==='冰剑'?8:id==='焚香'||id==='雪针'?7:4.4)*rangeScale(),variant:id});
}
function onFusionProcVisual(id,e){addSchoolFX('fusionProc',e.x,e.z,{life:.4,variant:id,heroX:game.player.x,heroZ:game.player.z});}
function onFusionHealVisual(beforeHP,beforeShield){
 if(game.fusion?.id!=='焚香'||game.player.hp<=beforeHP&&game.player.shield<=beforeShield)return;
 if(game.time-(game.lastIncenseVisual??-99)<.5)return;game.lastIncenseVisual=game.time;
 addSchoolFX('incenseReturn',game.player.x,game.player.z,{life:.65,variant:'焚香'});
}
function artLeaf(g,x,y,size,angle,color='#d0e6b2'){
 g.save();g.translate(x,y);g.rotate(angle);pixelPoly(g,[[-size,0],[-size*.15,-size*.45],[size,0],[size*.15,size*.45]],'#41664d');pixelPoly(g,[[-size*.8,0],[0,-size*.3],[size*.85,0],[0,size*.3]],color);pixelLine(g,[[-size*.75,0],[size*.7,0]],'#f0efc4');g.restore();
}
function artCrystal(g,x,y,size,angle=0){
 g.save();g.translate(x,y);g.rotate(angle);pixelPoly(g,[[0,-size],[-size*.32,-size*.25],[-size*.25,size*.25],[0,size*.45],[size*.32,size*.1],[size*.38,-size*.25]],'#50899a');pixelPoly(g,[[0,-size],[-size*.2,-size*.2],[0,size*.3],[size*.24,-size*.2]],'#c7f1f8');pixelLine(g,[[0,-size],[0,size*.3]],'#f3ffff');g.restore();
}
function artPetal(g,x,y,size,angle,color='#efc3d8'){
 g.save();g.translate(x,y);g.rotate(angle);pixelPoly(g,[[0,-size],[size*.6,-size*.55],[size*.45,size*.25],[0,size*.55],[-size*.45,size*.1],[-size*.55,-size*.55]],color);pixelLine(g,[[0,-size*.5],[0,size*.2]],'#fff0dc');g.restore();
}
function artFlame(g,x,y,size,phase,color='#ecac7c'){
 const sway=Math.sin(phase)*size*.15;pixelPoly(g,[[x-size*.45,y],[x-size*.38,y-size*.5],[x+sway,y-size],[x+size*.1,y-size*.45],[x+size*.38,y-size*.7],[x+size*.5,y-size*.1],[x+size*.2,y+1]],'#925c52');pixelPoly(g,[[x-size*.25,y],[x+sway,y-size*.85],[x+size*.13,y-size*.3],[x+size*.3,y]],color);pixelPoly(g,[[x-size*.1,y],[x+size*.03,y-size*.36],[x+size*.17,y]],'#f7e2ad');
}
function artRune(g,x,y,size,color='#dfb38c'){
 pixelPoly(g,[[x-size*.5,y-size],[x+size*.5,y-size],[x+size*.5,y+size],[x,y+size*.7],[x-size*.5,y+size]],'#5c3b45');pixelLine(g,[[x-size*.3,y-size*.75],[x+size*.3,y-size*.75],[x+size*.3,y+size*.4]],color);pixelLine(g,[[x,y-size*.4],[x,y+size*.5],[x-size*.3,y],[x+size*.25,y]],color);
}
function artFork(g,a,b,seed,color,width=1){
 const dx=b.x-a.x,dy=b.y-a.y,l=Math.hypot(dx,dy)||1,points=[];for(let i=0;i<=7;i++){const u=i/7,j=i===0||i===7?0:Math.sin(i*2.6+seed)*3.2;points.push([a.x+dx*u-dy/l*j,a.y+dy*u+dx/l*j]);}pixelLine(g,points,'#37566c',width+2);pixelLine(g,points,color,width);
}
function drawCommonGroundFX(f,k,point,fade){
 const g=pixel.ctx,p=f.follow?pixelPoint(game.player.x,game.player.z):point,id=f.sourceSkill,color=ART_COLORS[id],r=(f.r||1.2)*pixel.scale,ry=(f.r||1.2)*pixel.sy;g.globalAlpha=fade*.6;
 if(f.kind==='commonCharge'){const rr=(1-k*.55)*10;for(let i=0;i<3;i++)fxArc(g,p.x,p.y,rr,rr*.65,i/3*TAU+k,1.2,color);return;}
 if(f.kind==='commonImpact'){if(id==='ice')for(const s of [-1,1])artCrystal(g,p.x+s*(3+k*4),p.y+4,5*(1-k*.5),s*.6);else if(id==='thunder')for(let i=0;i<3;i++){const a=i/3*TAU;pixelLine(g,[[p.x,p.y],[p.x+Math.sin(a)*(5+k*10),p.y+Math.cos(a)*(3+k*6)]],color);}return;}
 if(id==='thunder'){for(let i=0;i<4;i++){const a=i/4*TAU;fxArc(g,p.x,p.y,r*(.5+k),ry*(.5+k),a,.9,color);pixelLine(g,[[p.x,p.y],[p.x+Math.sin(a)*r*.5,p.y+Math.cos(a)*ry*.5]],'#e5ddb7');}}
 if(id==='fire'){for(let i=0;i<6;i++){const a=i/6*TAU,rr=r*Math.min(1,k*3);pixelLine(g,[[p.x+Math.sin(a)*rr*.25,p.y+Math.cos(a)*rr*.2],[p.x+Math.sin(a+.08)*rr*.6,p.y+Math.cos(a+.08)*rr*.5],[p.x+Math.sin(a)*rr,p.y+Math.cos(a)*rr*.8]],'#dcaa7a',1);}}
 if(id==='ice'){const expand=1-(1-k)**3;for(let i=0;i<8;i++){const a=i/8*TAU,xx=Math.sin(a)*r*expand,yy=Math.cos(a)*ry*expand;pixelLine(g,[[p.x,p.y],[p.x+xx*.7,p.y+yy*.7],[p.x+xx,p.y+yy]],'#9bced6');for(const s of [-1,1])pixelLine(g,[[p.x+xx*.7,p.y+yy*.7],[p.x+xx*.7+Math.sin(a+s*.6)*r*.18,p.y+yy*.7+Math.cos(a+s*.6)*ry*.18]],'#c9f2f3');artCrystal(g,p.x+xx,p.y+yy,5+Math.sin(k*Math.PI)*3,a*.1);}}
 if(id==='wind'){for(let i=0;i<4;i++){const rr=r*(.3+k*.7)-i*3;if(rr>0)for(let j=0;j<3;j++)fxArc(g,p.x,p.y,rr,rr*.75,j/3*TAU+k*4+i*.2,.95,color,i?1:2);}}
 if(id==='petal'){const open=Math.sin(Math.min(1,k*2)*Math.PI/2);for(let i=0;i<5;i++){const a=i/5*TAU;fxArc(g,p.x+Math.sin(a)*r*.32*open,p.y+Math.cos(a)*ry*.32*open,r*.36*open,ry*.36*open,a,Math.PI,color);}}
}
function drawCommonAirFX(f,k,point,fade){
 const g=pixel.ctx,p=f.follow?pixelPoint(game.player.x,game.player.z,.65):point,id=f.sourceSkill,color=ART_COLORS[id],r=(f.r||1.2)*pixel.scale;g.globalAlpha=fade*.85;
 if(f.kind==='commonCharge'){for(let i=0;i<3;i++){const a=i/3*TAU+k*3,x=p.x+Math.sin(a)*(12-k*6),y=p.y-7+Math.cos(a)*5;if(id==='leaf')artLeaf(g,x,y,3,a);else if(id==='petal')artPetal(g,x,y,2.5,a);else fxDiamond(g,x,y,1.6,color);}return;}
 if(f.kind==='commonImpact'){const rr=k*12;if(id==='leaf')for(let i=0;i<3;i++)artLeaf(g,p.x+(i-1)*rr,p.y-rr*.4,3, i+k*3);else if(id==='petal')for(let i=0;i<4;i++)artPetal(g,p.x+Math.sin(i*1.7)*rr,p.y+Math.cos(i*1.7)*rr*.6,2.5,i+k*2);else if(id==='fire')artFlame(g,p.x,p.y+4,10*(1-k*.5),k*7);else if(id==='wind')for(let i=0;i<2;i++)fxArc(g,p.x,p.y-i*4,5+k*6,3,i+k*4,2.2,color);else fxStar(g,p.x,p.y,4*(1-k),color);return;}
 if(id==='thunder'){const pulse=f.t<.075||f.t>.13&&f.t<.20;if(pulse){artFork(g,{x:p.x-5,y:p.y-75},{x:p.x,y:p.y},f.serial,color,2);artFork(g,{x:p.x-2,y:p.y-41},{x:p.x+12,y:p.y-19},f.serial+1,'#def3ff',1);}for(let i=0;i<3;i++)fxDiamond(g,p.x+(i-1)*(4+k*8),p.y-k*12,1.3,color);}
 if(id==='fire'){for(let i=0;i<6;i++){const a=i/6*TAU,rr=r*k*.9;artFlame(g,p.x+Math.sin(a)*rr,p.y+Math.cos(a)*rr*.65,7+Math.sin(k*Math.PI)*9,k*8+i);}for(let i=0;i<4;i++)fxDiamond(g,p.x+Math.sin(i*2.4)*k*r*.6,p.y-k*24-i,1.2,'#f2c68a');}
 if(id==='leaf'){const a=f.angle||0;for(let i=0;i<4;i++){const theta=a+(i-1.5)*.35,x=p.x+Math.sin(theta)*(8+k*16),y=p.y+Math.cos(theta)*(6+k*10)-8;artLeaf(g,x,y,4*(1-k*.4),Math.atan2(Math.cos(theta)*.75,Math.sin(theta)));}}
 if(id==='wind'){for(let i=0;i<3;i++){const y=p.y-i*7,rr=(r*.35+i*4)*(1-k*.4);fxArc(g,p.x,y,rr,rr*.35,k*6+i,3.8,color,i===1?2:1);}for(let i=0;i<3;i++){const a=k*5+i*2;artLeaf(g,p.x+Math.sin(a)*r*.55,p.y+Math.cos(a)*r*.3-8,2,a,'#dce6b7');}}
 if(id==='petal'){for(let i=0;i<10;i++){const a=i/10*TAU,rr=r*(.15+k*.8);artPetal(g,p.x+Math.sin(a)*rr,p.y+Math.cos(a)*rr*.65-Math.sin(k*Math.PI)*12,2.5+(i%3),a+k*2);}}
}
function drawAdvancedElementField(a){
 if(!['fire','petal'].includes(a.type))return false;const g=pixel.ctx,p=pixelPoint(a.x,a.z),age=a.total-a.life,r=a.r*pixel.scale,ry=a.r*pixel.sy,fade=Math.min(1,a.life/.6),pulse=Math.exp(-(age%.55)*7);g.save();g.globalAlpha=fade*.55;
 if(a.type==='fire'){for(let i=0;i<6;i++){const t=i/6*TAU,x=p.x+Math.sin(t)*r*.78,y=p.y+Math.cos(t)*ry*.78;pixelLine(g,[[p.x+Math.sin(t)*r*.45,p.y+Math.cos(t)*ry*.45],[x,y]],'#a97558');artFlame(g,x,y,6+Math.sin(age*9+i)*2+pulse*3,age*8+i);}for(let i=0;i<5;i++){const t=i*2.4+age*.15,x=p.x+Math.sin(t)*r*.5,y=p.y+Math.cos(t)*ry*.5;g.globalAlpha=fade*.6;fxDiamond(g,x,y-(age*13+i*7)%20,1.1,'#f0c78f');}}
 else{for(let i=0;i<5;i++){const t=i/5*TAU,x=p.x+Math.sin(t)*r*.76,y=p.y+Math.cos(t)*ry*.76;for(let j=0;j<4;j++)artPetal(g,x+Math.sin(j/4*TAU)*3,y+Math.cos(j/4*TAU)*2,2+j%2,j/4*TAU,'#dca9c6');fxDiamond(g,x,y,1.2,'#f2dbad');fxArc(g,p.x,p.y,r,ry,t+.1,.75,'#e7b8d0');}for(let i=0;i<7;i++){const t=age*.7+i*TAU/7;artPetal(g,p.x+Math.sin(t)*r*.6,p.y+Math.cos(t)*ry*.6-((age*8+i*3)%12),2,i+age*.4);}}
 g.restore();return true;
}
function drawAdvancedProjectile(b,p){
 const g=pixel.ctx;if(b.kind==='leaf'){g.globalAlpha=.5;pixelLine(g,[[p.x-b.dx*11,p.y-b.dz*8],[p.x-b.dx*5,p.y-b.dz*4]],'#b7d8a0');g.globalAlpha=1;}
 if(b.variant==='叶影'&&b.kind==='dart'){for(let i=0;i<2;i++){const a=b.age*8+i*Math.PI;artLeaf(g,p.x+Math.cos(a)*6,p.y+Math.sin(a)*3,3,a,'#c8e1a7');}}
 if(b.variant==='焚脉'&&b.kind==='dart'&&b.empowered){g.globalAlpha=.7;artRune(g,p.x-b.dx*7,p.y-b.dz*5,3,'#f1b484');g.globalAlpha=1;}
 if(b.variant==='雪针'&&b.kind==='butterfly'){const flap=Math.abs(Math.sin(b.age*17+(b.wavePhase||0)));for(const s of [-1,1])artCrystal(g,p.x+s*(3+flap*4),p.y,3,s*.7);}
}
function drawFusionFieldGround(a){
 if(!['焚香','雪针'].includes(a.variant))return;const g=pixel.ctx,p=pixelPoint(a.x,a.z),age=a.total-a.life,fade=Math.min(1,a.life/.7),r=a.r*pixel.scale,ry=a.r*pixel.sy;g.save();g.globalAlpha=fade*.65;
 for(let i=0;i<6;i++){const t=i/6*TAU,x=p.x+Math.sin(t)*r*.93,y=p.y+Math.cos(t)*ry*.93;if(a.variant==='雪针'){artCrystal(g,x,y,7,Math.sin(t)*.35);for(const s of [-1,1])pixelLine(g,[[p.x+Math.sin(t)*r*.55,p.y+Math.cos(t)*ry*.55],[p.x+Math.sin(t+s*.13)*r*.77,p.y+Math.cos(t+s*.13)*ry*.77]],'#b6e5ee');}else{pixelPoly(g,[[x-4,y-1],[x+4,y-1],[x+3,y+3],[x-3,y+3]],'#79634e');pixelLine(g,[[x-2,y],[x-2,y-7],[x-1,y-8]],'#efd69c');pixelLine(g,[[x+2,y],[x+2,y-5]],'#b7976d');pixelLine(g,[[x-2,y-8],[x+Math.sin(age*2+i)*3,y-15],[x-1,y-23]],'#e2cc9c');}}
 g.restore();
}
function drawFusionGroundFX(f,k,p,fade){
 const g=pixel.ctx,r=(f.r||2)*pixel.scale,ry=(f.r||2)*pixel.sy,open=Math.min(1,f.t/.18);g.globalAlpha=fade*.6;
 if(f.kind==='fusionThunder'){for(let i=0;i<6;i++){const a=i/6*TAU,x=p.x+Math.sin(a)*r*open,y=p.y+Math.cos(a)*ry*open;pixelLine(g,[[p.x+Math.sin(a)*r*.4,p.y+Math.cos(a)*ry*.4],[x,y]],'#8bbfdc');fxDiamond(g,x,y,4,'#e9d8a0');}for(let i=0;i<3;i++)fxArc(g,p.x,p.y,r*.85,ry*.85,i/3*TAU,1.6,'#a9dff5',2);}
 if(f.kind==='fusionFrost'){for(let i=0;i<6;i++){const a=i/6*TAU,x=p.x+Math.sin(a)*r*.85*open,y=p.y+Math.cos(a)*ry*.85*open;pixelLine(g,[[p.x,p.y],[x,y]],'#b5e5ee');for(const s of [-1,1])pixelLine(g,[[p.x+Math.sin(a)*r*.5,p.y+Math.cos(a)*ry*.5],[p.x+Math.sin(a+s*.2)*r*.7,p.y+Math.cos(a+s*.2)*ry*.7]],'#8fbfce');artCrystal(g,x,y,10*open,Math.sin(a)*.3);}}
 if(f.kind==='fusionLeaves'){for(let i=0;i<9;i++){const a=i/9*TAU+k*.7;artLeaf(g,p.x+Math.sin(a)*r*.8,p.y+Math.cos(a)*ry*.8,6,a,'#bad49a');}for(let i=0;i<3;i++)fxArc(g,p.x,p.y,r*.6,ry*.6,i/3*TAU+k,.8,'#dce2ad');}
 if(f.kind==='fusionBrand'){for(let i=0;i<3;i++){const a=i/3*TAU-1.6,x=p.x+Math.sin(a)*r*.65,y=p.y+Math.cos(a)*ry*.65;artRune(g,x,y,9,'#f2b28b');fxArc(g,p.x,p.y,r*.82,ry*.82,a+.1,1.1,'#b87360',2);}fxDiamond(g,p.x,p.y,8,'#805052');}
 if(f.kind==='fusionIncense'){for(let i=0;i<8;i++){const a=i/8*TAU;fxArc(g,p.x+Math.sin(a)*r*.35*open,p.y+Math.cos(a)*ry*.35*open,r*.38*open,ry*.38*open,a,Math.PI,'#e7c58d');}}
 if(f.kind==='fusionSnow'){for(let i=0;i<6;i++){const a=i/6*TAU,x=p.x+Math.sin(a)*r*.86*open,y=p.y+Math.cos(a)*ry*.86*open;pixelLine(g,[[p.x+Math.sin(a)*r*.3,p.y+Math.cos(a)*ry*.3],[x,y]],'#d7f6f7',1.5);for(const s of [-1,1])pixelLine(g,[[p.x+Math.sin(a)*r*.6,p.y+Math.cos(a)*ry*.6],[p.x+Math.sin(a+s*.16)*r*.78,p.y+Math.cos(a+s*.16)*ry*.78]],'#b3dce9');artCrystal(g,x,y,7,a*.1);}}
 if(f.kind==='fusionProc'&&['冰剑','雪针'].includes(f.variant)){for(let i=0;i<3;i++){const a=i/3*TAU;artCrystal(g,p.x+Math.sin(a)*(4+k*7),p.y+Math.cos(a)*(3+k*4),5*(1-k*.5),a);}}
}
function drawFusionAirFX(f,k,p,fade){
 const g=pixel.ctx,r=(f.r||2)*pixel.scale;g.globalAlpha=fade*.8;
 if(f.kind==='thunderLink'){const end=pixelPoint(f.endX,f.endZ,.65);artFork(g,p,end,f.serial,'#d6edff',1);}
 if(f.kind==='fusionThunder'){for(let i=0;i<6;i++){const a=i/6*TAU+k*.3,x=p.x+Math.sin(a)*r*.48,y=p.y+Math.cos(a)*r*.35-16;fxSword(g,x,y,20,'#cfeaff',Math.sin(a)*.25);if(f.t>.15&&f.t<.24)artFork(g,{x,y:y-10},{x,y:y+14},i,'#f2dfad',1);}}
 if(f.kind==='fusionFrost'){for(let i=0;i<4;i++){const a=i/4*TAU,rr=r*.6*Math.min(1,k*3);artCrystal(g,p.x+Math.sin(a)*rr,p.y+Math.cos(a)*rr*.7-4,14*Math.sin(Math.min(1,k*2)*Math.PI/2),Math.sin(a)*.3);}}
 if(f.kind==='fusionLeaves'){for(const s of [-1,1]){g.save();g.translate(p.x+s*(18+k*10),p.y+5);g.scale(s,1);const pose={...actorPose(game.player,1,true),frame:2,action:true,run:false,air:0,bounce:0};paintHeroPose(1,pose,.23*(1-k));g.restore();}for(let i=0;i<7;i++){const a=i/7*TAU+k*4;artLeaf(g,p.x+Math.sin(a)*r*.6,p.y+Math.cos(a)*r*.4-10,4.5,a);}}
 if(f.kind==='fusionBrand'){for(let i=0;i<3;i++){const a=i/3*TAU-k,x=p.x+Math.sin(a)*r*.5,y=p.y+Math.cos(a)*r*.3-10;artRune(g,x,y,7,'#f6c297');artFlame(g,x,y+8,8,k*7+i,'#df9870');}}
 if(f.kind==='fusionIncense'){for(let i=0;i<4;i++){const a=i/4*TAU+k*.4,x=p.x+Math.sin(a)*r*.5,y=p.y+Math.cos(a)*r*.3;g.globalAlpha=fade*.4;const points=[];for(let j=0;j<=12;j++){const u=j/12;points.push([x+Math.sin(u*5+k*3+i)*6,y-u*30]);}pixelLine(g,points,'#e7c893',1.4);g.globalAlpha=fade*.8;drawButterflySprite(g,x,y-12-Math.sin(k*4+i)*5,k*14+i,.7,'#efcf97',a);}}
 if(f.kind==='fusionSnow'){for(let i=0;i<6;i++){const a=i/6*TAU+k*.65,x=p.x+Math.sin(a)*r*.5,y=p.y+Math.cos(a)*r*.3-10;drawButterflySprite(g,x,y,k*15+i,.7,'#d2f8ff',a,true);for(const s of [-1,1])artCrystal(g,x+s*5,y,3,s*.8);}}
 if(f.kind==='fusionProc'){const v=f.variant;if(v==='雷剑')fxStar(g,p.x,p.y,5*(1-k),'#efe0af');if(v==='叶影')for(let i=0;i<4;i++){const a=i/4*TAU+k*2;artLeaf(g,p.x+Math.sin(a)*k*16,p.y+Math.cos(a)*k*9,3.5,a);}if(v==='焚脉'){artRune(g,p.x,p.y-3-k*5,6,'#f3bf91');artFlame(g,p.x,p.y+6,10*(1-k*.4),k*8);}if(v==='焚香')for(let i=0;i<3;i++)artPetal(g,p.x+(i-1)*k*10,p.y-k*9,3,i,'#e3c18c');if(v==='雪针'){const q=pixelPoint(f.heroX,f.heroZ,.8);for(const s of [-1,1])fxArc(g,q.x,q.y-5,11,16,s<0?2:5,1.1,'#cceefa',1.4);}}
 if(f.kind==='incenseReturn'){for(let i=0;i<3;i++){const a=i/3*TAU+k*2,rr=15*(1-k);fxDiamond(g,p.x+Math.sin(a)*rr,p.y+Math.cos(a)*rr*.6-8-k*5,1.7,'#f2d4a1');}}
}
function drawArtStatus(e,p,h){
 const g=pixel.ctx,t=fxClock();g.save();if(e.slow>0){g.globalAlpha=.6;for(const s of [-1,1])artCrystal(g,p.x+s*5,p.y+1,4,s*.5);}if(e.burn>0){g.globalAlpha=.75;for(let i=0;i<2;i++)fxDiamond(g,p.x+Math.sin(t*3+i)*5,p.y-(t*14+i*6)%15,1.2,'#f0b47c');}g.restore();
}
function drawFrostFallingSword(f){
 const g=pixel.ctx,p=pixelPoint(f.mesh.position.x,f.mesh.position.z),drop=clamp(f.t/.09,0,1),height=5*(1-drop)**2*pixel.scale;g.save();g.globalAlpha=Math.min(.85,(f.d-f.t)/.12);artCrystal(g,p.x,p.y-height-7,14,Math.PI);if(drop>=1)for(const s of [-1,1])artCrystal(g,p.x+s*7,p.y+1,4.5,s*.6);g.restore();
}
