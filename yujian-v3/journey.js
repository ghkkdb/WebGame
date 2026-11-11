/* 江湖行旅：开局构筑、机缘信物、悬赏和跨局见闻。 */
const JOURNEY_VOWS=[
 {id:'edge',name:'破阵客',icon:'item:scroll',tag:'以战养战',desc:'伤害 +12%，生命上限 -8。每破敌20人，立即回复6生命。',bonus:{damage:.12,hp:-8}},
 {id:'roam',name:'云游人',icon:'item:boots',tag:'游走寻机',desc:'移速 +8%，拾取距离 +1。每完成一处奇遇，额外获得12铜钱。',bonus:{speed:.08,pickup:1}},
 {id:'guard',name:'守心者',icon:'item:jade',tag:'稳中求胜',desc:'生命上限 +15。每波开始获得12护盾，护盾上限50。',bonus:{hp:15}}
];
const JOURNEY_RELICS=[
 {id:'echo',name:'踏风铃',icon:'item:bell',tag:'轻功 · 反击',desc:'空格轻功成功后，在起点释放回风掌一重，最多每3秒触发一次。'},
 {id:'flow',name:'追魂签',icon:'item:thread',tag:'破敌 · 回气',desc:'每击败8名敌人，E身法冷却缩短1秒、Q绝技冷却缩短2秒。'},
 {id:'frostfire',name:'两仪佩',icon:'item:jade',tag:'控制 · 联动',desc:'攻击被减速或灼烧的敌人，伤害提高25%。'},
 {id:'guard',name:'不动印',icon:'item:armor',tag:'轻功 · 护体',desc:'空格轻功成功后获得6护盾，最多每5秒触发一次。'},
 {id:'lotus',name:'回生莲',icon:'item:heart',tag:'受伤 · 回春',desc:'受到生命伤害后，3秒内回复9生命；最多每12秒触发一次。'},
 {id:'storm',name:'惊雷木',icon:'skill:thunder',tag:'绝技 · 引雷',desc:'Q绝技成功释放后，追加一次引雷诀二重。'},
 {id:'purse',name:'四方钱',icon:'utility:coins',tag:'探索 · 经济',desc:'立即获得35铜钱；每完成一处奇遇额外获得15铜钱。'},
 {id:'compass',name:'问道盘',icon:'utility:insight',tag:'融合 · 成型',desc:'目标融合的一项未满重武学提升一重，获得1次悟道机会和1次重阅。'},
 {id:'resolve',name:'孤锋石',icon:'item:whetstone',tag:'险境 · 爆发',desc:'生命低于一半时，伤害提高30%；立即增加10生命上限并回复10生命。'}
];
const JOURNEY_THREATS=[
 {id:'normal',name:'雨中追兵',desc:'刀客逐步合围，留意地上的经验。'},
 {id:'rush',name:'疾行围猎',desc:'普通近身追兵移速 +15%，保持游走。'},
 {id:'armor',name:'重甲压阵',desc:'普通追兵生命 +25%、移速 -12%，集中火力。'},
 {id:'ranged',name:'箭雨封路',desc:'每12秒出现一名额外弓手，留轻功穿过火线。'}
];
const CHRONICLE_KEY='yujian.journey.v1'+(new URLSearchParams(location.search).has('test')?'.qa':'');
function emptyChronicle(){return{runs:0,wins:0,bestWave:0,bounties:0,heroes:[],fusions:[],relics:[],events:[],seals:[],recent:[]};}
function readChronicle(){const fresh=emptyChronicle();try{const data=JSON.parse(localStorage.getItem(CHRONICLE_KEY)||'null');if(!data||typeof data!=='object')return fresh;for(const key of ['runs','wins','bestWave','bounties'])fresh[key]=Number.isFinite(data[key])?Math.max(0,Math.floor(data[key])):0;for(const key of ['heroes','fusions','relics','events','seals'])fresh[key]=Array.isArray(data[key])?[...new Set(data[key].filter(x=>typeof x==='string'&&x.length<40))]:[];fresh.recent=Array.isArray(data.recent)?data.recent.filter(x=>x&&typeof x==='object'&&HEROS.some(h=>h.id===x.hero)&&Number.isFinite(x.wave)&&Number.isFinite(x.kills)).slice(0,5):[];}catch{}return fresh;}
let chronicle=readChronicle(),chronicleWritable=true;
function saveChronicle(){try{localStorage.setItem(CHRONICLE_KEY,JSON.stringify(chronicle));chronicleWritable=true;}catch{chronicleWritable=false;}}
function rememberJourney(kind,id){if(!chronicle[kind].includes(id)){chronicle[kind].push(id);saveChronicle();}}
function journeyRecipe(){return RECIPES.find(r=>r.id===game?.journey?.route);}
function hasRelic(id){return !!game?.journey?.relics.includes(id);}
function journeyRouteText(){const r=journeyRecipe();if(!r)return'';return `${r.name} · 本命 ${levelOf('weapon')}/6 · ${skillName(r.skill)} ${levelOf(r.skill)}/3 · ${skillName(r.common)} ${levelOf(r.common)}/3 · 悟道 ${game.tokens}/1`;}
function initJourney(vowId,routeId){const vow=JOURNEY_VOWS.find(v=>v.id===vowId)||JOURNEY_VOWS[1],route=RECIPES.find(r=>r.id===routeId&&r.hero===game.hero.id)||RECIPES.find(r=>r.hero===game.hero.id);
 game.journey={vow:vow.id,route:route.id,relics:[],relicWaves:[],threat:JOURNEY_THREATS[0],bounty:null,bounties:0,streak:0,bestStreak:0,lastKill:-99,fever:0,feverUntil:0,killCount:0,damageTaken:0,eventsSeen:game.eventsDone,lastEventKind:null,echoAt:-99,guardAt:-99,lotusAt:-99,healLeft:0,nextArcher:12,seenFusion:null};
 for(const [key,value] of Object.entries(vow.bonus))game.stats[key]+=value;
 game.player.hp=maxHealth();if(vow.id==='guard')game.player.shield=12;
 gainSkill(route.common);startJourneyBounty();rememberJourney('heroes',game.hero.id);updateHUD();
}
function requestJourney(){let vow='roam',route=RECIPES.find(r=>r.hero===HEROS[selected].id).id;
 const render=()=>{const recipes=RECIPES.filter(r=>r.hero===HEROS[selected].id);showModal(`<section class="modal-panel journey-setup"><div class="modal-eyebrow">行前一念 · ${HEROS[selected].sect}</div><h2 class="modal-title">这一回，走自己的路</h2><p class="modal-sub">选择志向与想修成的绝学。开局带上对应通用武学一重，领悟时会为目标保留一个可选方向。</p><div class="journey-vows">${JOURNEY_VOWS.map(v=>`<button class="journey-card ${v.id===vow?'chosen':''}" data-vow="${v.id}" aria-pressed="${v.id===vow}">${iconHTML(v.icon)}<small>${v.tag}</small><b>${v.name}</b><p>${v.desc}</p></button>`).join('')}</div><div class="journey-section">此行想修成 <span>目标可在 B 秘籍中更换，不限制其他武学</span></div><div class="journey-routes">${recipes.map(r=>`<button class="journey-card ${r.id===route?'chosen':''}" data-route="${r.id}" aria-pressed="${r.id===route}">${iconHTML('fusion:'+r.id)}<b>${r.name}</b><p>${r.desc}</p><small>${skillNameForHero(r.skill)} + ${SKILLS[r.common].name}</small></button>`).join('')}</div><div class="modal-actions"><button class="secondary" id="journey-back">返回选角</button><button class="primary" id="journey-go">立志，启程 <span>十波江湖 →</span></button></div></section>`,'journey-setup');document.querySelectorAll('[data-vow]').forEach(b=>b.onclick=()=>{vow=b.dataset.vow;render();});document.querySelectorAll('[data-route]').forEach(b=>b.onclick=()=>{route=b.dataset.route;render();});$('journey-back').onclick=()=>{if(game)returnHome();else closeModal();};$('journey-go').onclick=()=>{startGame(selected);initJourney(vow,route);announce(JOURNEY_VOWS.find(v=>v.id===vow).name,'第一波 · 寻找悟剑石，修习门派武学');};};render();
}
function skillNameForHero(id){return SKILLS[id].name;}
function grantRelic(id){const j=game?.journey,def=JOURNEY_RELICS.find(r=>r.id===id);if(!j||!def||j.relics.includes(id))return false;j.relics.push(id);rememberJourney('relics',id);
 if(id==='purse')game.coins+=35;
 if(id==='resolve'){game.stats.hp+=10;heal(10);}
 if(id==='compass'){const r=journeyRecipe(),pool=upgradePool();const next=[r.skill,r.common,'weapon'].find(s=>pool.some(p=>p.id===s));if(next)gainSkill(next);else game.coins+=25;game.tokens++;game.rerolls++;}
 toast('机缘入囊 · '+def.name,3);return true;
}
function openJourneyRelics(){const j=game.journey;if(j.relicWaves.includes(game.wave))return;j.relicWaves.push(game.wave);let pool=JOURNEY_RELICS.filter(r=>!j.relics.includes(r.id)),choices=[];for(let n=0;n<3&&pool.length;n++)choices.push(pool.splice(Math.floor(Math.random()*pool.length),1)[0]);
 showModal(`<section class="modal-panel"><div class="modal-eyebrow">歇脚茶亭 · 第 ${game.wave} 波前</div><h2 class="modal-title">一件信物，另一种打法</h2><p class="modal-sub">三选一，此局生效。信物不占武学与装备槽，效果可以和门派招式、融合绝学搭配。</p><div class="journey-vows">${choices.map(r=>`<button class="journey-card" data-relic="${r.id}">${iconHTML(r.icon)}<small>${r.tag}</small><b>${r.name}</b><p>${r.desc}</p></button>`).join('')}</div><p class="journey-footnote">时间已暂停 · 已有：${j.relics.map(id=>JOURNEY_RELICS.find(r=>r.id===id).name).join('、')||'尚无信物'}</p></section>`,'journey-relic');document.querySelectorAll('[data-relic]').forEach(b=>b.onclick=()=>{if(state!=='journey-relic'||!choices.some(r=>r.id===b.dataset.relic))return;grantRelic(b.dataset.relic);closeModal();updateHUD();if(availableRecipes().length)openBook(true);});
}
function startJourneyBounty(){const j=game.journey,kind=['hunt','travel','steady'][(game.wave-1)%3];j.bounty={kind,target:kind==='hunt'?12+game.wave*3:kind==='travel'?95:18,progress:0,baseKills:game.kills,baseDistance:game.distance,until:game.time+45,done:false,failed:false};j.nextArcher=game.time+12;}
function bountyTitle(b){return b.kind==='hunt'?'清剿追兵':b.kind==='travel'?'踏遍古道':'从容应敌';}
function bountyDescription(b){return b.kind==='hunt'?`击败 ${b.target} 名敌人`:b.kind==='travel'?`行走 ${b.target} 丈`:`连续 ${b.target} 秒不损失生命`;}
function settleBounty(){const j=game.journey,b=j.bounty;if(!b||b.done||b.failed||game.time>b.until)return false;b.done=true;j.bounties++;game.coins+=18+game.wave*2;game.rerolls++;toast(`悬赏完成 · ${bountyTitle(b)}\n获得 ${18+game.wave*2} 铜钱与1次重阅`,3);sound('level');return true;}
function updateJourney(dt){const j=game?.journey;if(!j||game.finished)return;const b=j.bounty;
 if(b&&!b.done&&!b.failed){if(game.time>b.until)b.failed=true;else{if(b.kind==='hunt')b.progress=game.kills-b.baseKills;else if(b.kind==='travel')b.progress=game.distance-b.baseDistance;else b.progress+=dt;if(b.progress>=b.target)settleBounty();}}
 if(game.time-j.lastKill>3.5)j.streak=0;
 if(j.fever&&game.time>=j.feverUntil)j.fever=0;
 if(j.healLeft>0){const amount=Math.min(j.healLeft,dt*3);heal(amount);j.healLeft-=amount;}
 if(game.eventsDone>j.eventsSeen){const count=game.eventsDone-j.eventsSeen;j.eventsSeen=game.eventsDone;game.coins+=count*((j.vow==='roam'?12:0)+(hasRelic('purse')?15:0));if(j.lastEventKind)rememberJourney('events',j.lastEventKind);}
 if(game.fusion&&j.seenFusion!==game.fusion.id){j.seenFusion=game.fusion.id;rememberJourney('fusions',game.fusion.id);}
 if(j.threat.id==='ranged'&&game.time>=j.nextArcher){j.nextArcher=game.time+12;spawnEnemy('archer');}
}
function journeyKill(){const j=game?.journey;if(!j)return;j.killCount++;j.streak=game.time-j.lastKill<=3.5?j.streak+1:1;j.lastKill=game.time;j.bestStreak=Math.max(j.bestStreak,j.streak);
 if(j.streak%15===0){j.fever=1;j.feverUntil=game.time+5;toast('剑意昂扬 · 5秒内伤害 +20%',1.5);}
 if(j.vow==='edge'&&j.killCount%20===0)heal(6);
 if(hasRelic('flow')&&j.killCount%8===0){game.player.artCD=Math.max(0,game.player.artCD-1);game.player.ult=Math.max(0,game.player.ult-2);}
}
function journeyDamageFactor(e){if(!game?.journey)return 1;return 1+(game.journey.fever?.2:0)+(hasRelic('frostfire')&&(e.slow>0||e.burn>0)?.25:0)+(hasRelic('resolve')&&game.player.hp<maxHealth()*.5?.3:0);}
function journeyHurt(amount){const j=game?.journey;if(!j||amount<=0)return;j.damageTaken+=amount;if(j.bounty?.kind==='steady')j.bounty.progress=0;if(hasRelic('lotus')&&game.time-j.lotusAt>=12){j.lotusAt=game.time;j.healLeft=9;}}
function journeyDash(){const j=game?.journey;if(!j)return;const p=game.player;if(hasRelic('echo')&&game.time-j.echoAt>=3){j.echoAt=game.time;castSkill('wind',1);}if(hasRelic('guard')&&game.time-j.guardAt>=5){j.guardAt=game.time;p.shield=Math.min(50,p.shield+6);fx(p.x,p.z,0xd9c58f,1,.3);}}
function finishJourney(win){const j=game.journey;if(!j||j.saved)return;j.saved=true;chronicle.runs++;if(win)chronicle.wins++;chronicle.bestWave=Math.max(chronicle.bestWave,game.wave);chronicle.bounties+=j.bounties;if(game.fusion)rememberJourney('fusions',game.fusion.id);
 const newSeals=[];for(const [id,met] of [['初行',true],['破局',win],['寻幽',game.eventsDone>=3],['连锋',j.bestStreak>=30],['守约',j.bounties>=5],['归元',!!game.fusion]])if(met&&!chronicle.seals.includes(id)){chronicle.seals.push(id);newSeals.push(id);}j.newSeals=newSeals;
 chronicle.recent.unshift({hero:game.hero.id,wave:game.wave,kills:game.kills,win:!!win,fusion:game.fusion?.id||null,vow:j.vow});chronicle.recent=chronicle.recent.slice(0,5);saveChronicle();
}
function journeyResultHTML(){const j=game.journey;if(!j)return'';const r=journeyRecipe();let advice=game.fusion?'这一套已经成型，下一局可以换一条融合路线，尝试新的信物组合。':`目标 ${r.name} 尚差：${[levelOf('weapon')<6?'本命 '+(6-levelOf('weapon'))+' 重':'',levelOf(r.skill)<3?skillName(r.skill)+' '+(3-levelOf(r.skill))+' 重':'',levelOf(r.common)<3?skillName(r.common)+' '+(3-levelOf(r.common))+' 重':'',game.tokens<1?'1次悟道机会':''].filter(Boolean).join('、')||'条件已齐，下次记得按 B 参悟'}。`;
 return `<div class="journey-recap"><b>此行有所得</b><div class="journey-recap-stats"><span>最高连斩 <strong>${j.bestStreak}</strong></span><span>悬赏完成 <strong>${j.bounties}</strong></span><span>机缘信物 <strong>${j.relics.length}</strong></span></div><p>${JOURNEY_VOWS.find(v=>v.id===j.vow).name} · ${j.relics.map(id=>JOURNEY_RELICS.find(r=>r.id===id).name).join(' / ')||'尚未取得信物'}</p><p>${advice}</p><small>${j.newSeals?.length?'新见闻印记：'+j.newSeals.join(' · '):'此行战绩已收入江湖见闻'}${chronicleWritable?'':' · 浏览器未允许保存，记录仅在本次打开期间保留'}</small></div>`;
}
function openChronicle(){const fromHome=!game,backState=state;const sections=[['三侠足迹','heroes',HEROS.map(h=>({id:h.id,name:h.name}))],['融合绝学','fusions',RECIPES],['机缘信物','relics',JOURNEY_RELICS],['江湖奇遇','events',EVENT_TYPES],['见闻印记','seals',[{id:'初行',name:'初行 · 完成一局'},{id:'破局',name:'破局 · 击败黑伞客'},{id:'寻幽',name:'寻幽 · 单局3处奇遇'},{id:'连锋',name:'连锋 · 单局30连斩'},{id:'守约',name:'守约 · 单局5次悬赏'},{id:'归元',name:'归元 · 修成融合'}]]];
 showModal(`<section class="modal-panel chronicle-panel"><div class="modal-eyebrow">江湖见闻 · 留一页自己的故事</div><h2 class="modal-title">走过的路，都有回响</h2><p class="modal-sub">${chronicle.runs} 次行旅 · ${chronicle.wins} 次破局 · 最高第 ${chronicle.bestWave} 波 · ${chronicle.bounties} 次悬赏。见闻保存在当前浏览器，收藏不增加局外战斗属性。</p>${sections.map(([name,key,items])=>`<div class="journey-section">${name}<span>${items.filter(x=>chronicle[key].includes(x.id)).length} / ${items.length}</span></div><div class="chronicle-chips">${items.map(x=>`<span class="${chronicle[key].includes(x.id)?'found':''}">${chronicle[key].includes(x.id)?'◆':'◇'} ${x.name}</span>`).join('')}</div>`).join('')}<div class="journey-section">近五次行旅</div><div class="journey-history">${chronicle.recent.map(r=>`<p>${HEROS.find(h=>h.id===r.hero).name} · 第 ${r.wave} 波 · 破敌 ${r.kills} · ${r.win?'破局归来':'再赴江湖'}${RECIPES.some(f=>f.id===r.fusion)?' · '+RECIPES.find(f=>f.id===r.fusion).name:''}</p>`).join('')||'尚未落笔，从这一次启程开始。'}</div><div class="modal-actions"><span class="note">${chronicleWritable?'本地自动保存':'保存不可用，本次记录仍可查看'}</span><button class="secondary" id="chronicle-close">合卷</button></div></section>`,'chronicle');$('chronicle-close').onclick=()=>{if(fromHome)closeModal();else if(backState==='result')renderJourneyResultReturn();else openBook();};
}
function renderJourneyResultReturn(){if(game?.journey?.resultHTML){showModal(game.journey.resultHTML,'result');bindJourneyResult();}else returnHome();}
function bindJourneyResult(){$('retry').onclick=requestJourney;$('result-home').onclick=returnHome;const button=$('result-chronicle');if(button)button.onclick=openChronicle;}
function journeyHUD(){const j=game?.journey,el=$('journey-hud');if(!el)return;el.classList.toggle('hidden',!j);if(!j)return;const b=j.bounty,nearestEvent=events.filter(e=>!e.used).sort((a,b)=>Math.hypot(a.x-game.player.x,a.z-game.player.z)-Math.hypot(b.x-game.player.x,b.z-game.player.z))[0];const p=game.player;let direction='';if(nearestEvent){const angle=Math.atan2(nearestEvent.z-p.z,nearestEvent.x-p.x);direction=['→','↘','↓','↙','←','↖','↑','↗'][(Math.round(angle/(Math.PI/4))+8)%8];}
 const html=`<div class="journey-hud-title"><b>${j.threat.name}</b><span>${j.fever?'剑意昂扬 '+Math.ceil(j.feverUntil-game.time)+'秒':j.streak>1?j.streak+' 连斩':JOURNEY_VOWS.find(v=>v.id===j.vow).name}</span></div><p>${b.done?'◆ 悬赏完成':b.failed?'◇ 本波悬赏已结束':`${bountyTitle(b)} · ${Math.min(b.target,Math.floor(b.progress))}/${b.target} · 余${Math.ceil(b.until-game.time)}秒`}</p><small>${b.done?'铜钱与重阅已到账':b.failed?'下一波将有新的委托':bountyDescription(b)+' · 奖铜钱 / 重阅'}</small><button id="journey-route-hud" title="${journeyRouteText()}">${game.fusion?'◆ '+game.fusion.name+' 已成':journeyRouteText()}</button><span class="journey-compass">${nearestEvent?direction+' '+nearestEvent.name+' · '+Math.ceil(Math.hypot(nearestEvent.x-p.x,nearestEvent.z-p.z))+'丈':'沿古道前行，寻找新的奇遇'}</span>`;
 if(el.innerHTML!==html){el.innerHTML=html;$('journey-route-hud').onclick=()=>{if(['playing','paused'].includes(state))openBook();};}
}
/* 在既有系统边界接入，普通演武和旧回归测试保留独立场景。 */
const journeyBase={beginWave,updateGame,chooseUpgrades,renderUpgrade,renderShop,openBook,openEvent,doDash,ultimate,spawnEnemy,finish,renderHome,updateHUD};
beginWave=function(n){journeyBase.beginWave(n);if(!game.journey)return;const j=game.journey;j.threat=n===1||n===10?JOURNEY_THREATS[0]:JOURNEY_THREATS[1+Math.floor(hashWorld(n,world.seed%100,94)*3)];if(j.vow==='guard')game.player.shield=Math.min(50,game.player.shield+12);startJourneyBounty();announce('第 '+n+' 波 · '+j.threat.name,n===10?'黑伞客已现身 · 击败他，破局而出':j.threat.desc);if([3,6,9].includes(n))openJourneyRelics();updateHUD();};
updateGame=function(dt){journeyBase.updateGame(dt);if(state==='playing')updateJourney(dt);};
chooseUpgrades=function(){const result=journeyBase.chooseUpgrades(),r=journeyRecipe();if(!r||game.fusion)return result;const pool=upgradePool(),needed=['weapon',r.skill,r.common].filter(id=>pool.some(x=>x.id===id)).sort((a,b)=>levelOf(a)/SKILLS[a].max-levelOf(b)/SKILLS[b].max);if(needed.length&&!needed.some(id=>result.includes(id))){if(result.length)result[result.length-1]=needed[0];else result.push(needed[0]);}return result;};
renderUpgrade=function(){journeyBase.renderUpgrade();const r=journeyRecipe();if(!r)return;document.querySelectorAll('[data-upgrade]').forEach(b=>{if(['weapon',r.skill,r.common].includes(b.dataset.upgrade))b.insertAdjacentHTML('beforeend','<small class="journey-recommend">目标绝学 · 所需武学</small>');});};
renderShop=function(){journeyBase.renderShop();if(!game.journey)return;const r=journeyRecipe();document.querySelectorAll('[data-buy]').forEach(b=>{const o=game.offers[+b.dataset.buy];if(o.kind==='skill'&&['weapon',r.skill,r.common].includes(o.id))b.parentElement.insertAdjacentHTML('afterbegin','<small class="journey-recommend">目标绝学 · 所需武学</small>');});const n=game.wave+1,def=n===10?JOURNEY_THREATS[0]:JOURNEY_THREATS[1+Math.floor(hashWorld(n,world.seed%100,94)*3)];if(game.shopBetween)$('modal-content').querySelector('.shop-stats').insertAdjacentHTML('afterend',`<p class="journey-footnote">下一波：${n===10?'黑伞客 · 决战':def.name+' · '+def.desc}${[3,6,9].includes(n)?' · 即将遇见茶亭信物三选一':''}</p>`);};
openBook=function(ready=false){journeyBase.openBook(ready);if(state!=='book'||!game.journey)return;document.querySelectorAll('[data-fusion]').forEach(b=>{const r=RECIPES.find(r=>r.id===b.dataset.fusion);const button=document.createElement('button');button.className='secondary journey-track';button.textContent=game.journey.route===r.id?'正在追寻此绝学':'改为追寻此绝学';button.disabled=!!game.fusion||game.journey.route===r.id||(!levelOf(r.common)&&ownedType('common')>=3);button.onclick=()=>{game.journey.route=r.id;openBook();};b.after(button);});$('modal-content').querySelector('.owned-list').insertAdjacentHTML('beforeend',`<div class="journey-section">机缘信物</div><div class="chronicle-chips">${game.journey.relics.map(id=>{const r=JOURNEY_RELICS.find(x=>x.id===id);return `<span class="found" title="${r.desc}">${r.name} · ${r.desc}</span>`;}).join('')||'第3、6、9波前在茶亭择取信物'}</div>`);$('icon-catalog-open').insertAdjacentHTML('beforebegin','<button class="secondary" id="journey-journal">江湖见闻</button>');$('journey-journal').onclick=openChronicle;};
openEvent=function(e){if(game?.journey&&state==='playing'&&!e.used)game.journey.lastEventKind=e.kind;journeyBase.openEvent(e);};
doDash=function(){const before=game?.player.dash;journeyBase.doDash();if(game?.journey&&game.player.dash<before)journeyDash();};
ultimate=function(){const before=game?.player.ult;journeyBase.ultimate();if(game?.journey&&before<=0&&game.player.ult>0&&hasRelic('storm'))castSkill('thunder',2);};
spawnEnemy=function(type,at=null){const e=journeyBase.spawnEnemy(type,at),j=game?.journey;if(e&&j&&!['elite','boss'].includes(type)){if(j.threat.id==='rush'&&!['archer','bomber'].includes(type))e.speed*=1.15;if(j.threat.id==='armor'){e.hp*=1.25;e.maxHp=e.hp;e.speed*=.88;}}return e;};
finish=function(win,timeout=false){if(!game||game.finished)return;finishJourney(win);journeyBase.finish(win,timeout);if(game.journey){if(game.journey.retired)$('modal-content').querySelector('.modal-sub').textContent='此行暂歇，所得已记入见闻。下次可以沿此路继续钻研，也可以换一种志向，试一套新招。';$('modal-content').querySelector('.build-summary').insertAdjacentHTML('beforebegin',journeyResultHTML());$('result-home').insertAdjacentHTML('beforebegin','<button class="secondary" id="result-chronicle">查看江湖见闻</button>');game.journey.resultHTML=$('modal-content').innerHTML;}bindJourneyResult();};
renderHome=function(){journeyBase.renderHome();if(!$('journey-home')){$('guide-open').insertAdjacentHTML('afterend','<button class="text-btn" id="journey-home">江湖见闻 · 查看收藏 ↗</button>');}$('journey-home').onclick=openChronicle;$('start').onclick=requestJourney;document.querySelector('.home-hint').textContent='立志启程 · 机缘构筑 · 十波围攻 · 见闻留存';};
updateHUD=function(){journeyBase.updateHUD();journeyHUD();};
const journeyHUDNode=document.createElement('aside');journeyHUDNode.id='journey-hud';journeyHUDNode.className='hidden';journeyHUDNode.setAttribute('aria-label','此行目标与悬赏');$('hud').append(journeyHUDNode);$('start').onclick=requestJourney;
$('touch-dash').onclick=doDash;$('touch-ult').onclick=ultimate;
const journeyBasePause=pauseGame;
pauseGame=function(){journeyBasePause();if(state==='paused'&&game?.journey){$('quit').textContent='结束此局，查看复盘';$('quit').onclick=()=>{game.journey.retired=true;finish(false);};}};$('pause').onclick=pauseGame;
addEventListener('keydown',e=>{if(e.repeat)return;if(state==='journey-relic'&&/^Digit[123]$/.test(e.code))document.querySelectorAll('[data-relic]')[+e.code.slice(-1)-1]?.click();else if(e.code==='Escape'&&state==='chronicle')$('chronicle-close')?.click();else if(e.code==='Escape'&&state==='journey-setup')$('journey-back')?.click();});
const journeyBaseGuide=guide;
guide=function(){journeyBaseGuide();const grid=$('modal-content').querySelector('.guide-grid');if(grid)grid.insertAdjacentHTML('beforeend','<article><h3>立志与信物</h3><p>开局选择志向和融合目标。第3、6、9波前，在茶亭选择一件改变打法的信物；信物只在本局生效。</p></article><article><h3>悬赏与连斩</h3><p>每波前45秒有一份悬赏，奖励铜钱和重阅。3.5秒内续上击杀可连斩，每15连斩获得5秒伤害加成20%。</p></article><article><h3>循路与留名</h3><p>左侧显示奇遇方位与融合进度，B中可更换追寻目标。结束后查看复盘与见闻，收藏自动保存在当前浏览器。</p></article>');};$('guide-open').onclick=guide;
