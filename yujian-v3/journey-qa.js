/* 通过开发面板触发的行旅回归与可复现实机预览。 */
function checkJourney(check){
 const saved=JSON.stringify(chronicle);const setup=(vow='roam',hero=0)=>{startGame(hero);initJourney(vow,RECIPES.find(r=>r.hero===HEROS[hero].id).id);};
 try{
 for(const [i,vow] of JOURNEY_VOWS.entries()){setup(vow.id,i);check(vow.name+'开局志向与通用武学生效',game.journey.vow===vow.id&&levelOf(journeyRecipe().common)===1&&game.player.hp===maxHealth());}
 setup();check('开局不继承上一局信物与连斩',game.journey.relics.length===0&&game.journey.streak===0);check('行旅目标有完整融合条件',journeyRouteText().includes('/6')&&journeyRouteText().includes('悟道'));
 for(let i=0;i<30;i++){const choices=chooseUpgrades(),r=journeyRecipe();if(choices.length!==new Set(choices).size||!choices.some(id=>['weapon',r.skill,r.common].includes(id)))throw Error('目标推荐缺失或选项重复');}check('30轮领悟均有目标武学且不重复',true);
 for(const relic of JOURNEY_RELICS){setup();const coins=game.coins;check(relic.name+'能够获取',grantRelic(relic.id)&&hasRelic(relic.id));check(relic.name+'不能重复领取',!grantRelic(relic.id));if(relic.id==='purse')check('四方钱立即奖励正确',game.coins===coins+35);if(relic.id==='compass')check('问道盘真实提升武学与悟道',levelOf(journeyRecipe().skill)===1&&game.tokens===1&&game.rerolls===4);}
 setup('edge');game.player.hp-=20;for(let n=0;n<20;n++)journeyKill();check('破阵志向每20破敌回血',game.player.hp===maxHealth()-14);check('连斩触发有时限的剑意',game.journey.fever===1&&game.journey.bestStreak===20&&journeyDamageFactor({})===1.2);game.time=6;updateJourney(.01);check('连斩与剑意到时归零',game.journey.streak===0&&game.journey.fever===0);
 setup();grantRelic('flow');game.player.ult=20;game.player.artCD=6;for(let n=0;n<8;n++)journeyKill();check('追魂签真实缩短E与Q冷却',game.player.ult===18&&game.player.artCD===5);
 setup();grantRelic('echo');doDash();check('踏风铃轻功释放回风掌',schoolFX.some(f=>f.kind.toLowerCase().includes('wind'))&&game.journey.echoAt===0);const fxCount=schoolFX.length;doDash();check('踏风铃遵守内部冷却',schoolFX.length===fxCount);game.player.dash=0;const cd=game.journey.echoAt;doDash();check('轻功储备不足不触发信物',game.journey.echoAt===cd);
 setup();grantRelic('guard');$('touch-dash').click();check('不动印触屏轻功获得真实护盾',game.player.shield===6);doDash();check('护盾信物不因连按重复触发',game.player.shield===6);
 setup();grantRelic('frostfire');check('两仪佩只加强带元素状态目标',journeyDamageFactor({slow:1})===1.25&&journeyDamageFactor({burn:1})===1.25&&journeyDamageFactor({})===1);
 setup();grantRelic('resolve');game.player.hp=maxHealth()*.4;check('孤锋石在半血以下生效',journeyDamageFactor({})===1.3);game.player.hp=maxHealth();check('孤锋石满血不触发',journeyDamageFactor({})===1);
 setup();grantRelic('lotus');game.player.hp-=30;journeyHurt(5);updateJourney(1);check('回生莲分次回复而非瞬间满血',game.player.hp===maxHealth()-27&&game.journey.healLeft===6);journeyHurt(5);check('回生莲内部冷却不被连续受伤重置',game.journey.healLeft===6);
 setup();grantRelic('storm');$('touch-ult').click();check('惊雷木在触屏绝技释放时触发引雷',schoolFX.some(f=>f.kind.toLowerCase().includes('thunder')));const count=schoolFX.length;ultimate();check('Q冷却中不重复触发惊雷木',schoolFX.length===count);
 setup('roam');grantRelic('purse');const money=game.coins;game.eventsDone++;game.journey.lastEventKind='scholar';updateJourney(.1);check('探索志向和钱币信物叠加且只发一次',game.coins===money+27);updateJourney(.1);check('奇遇奖励不会逐帧重复',game.coins===money+27);
 for(const kind of ['hunt','travel','steady']){setup();const b=game.journey.bounty;b.kind=kind;b.target=1;if(kind==='hunt')game.kills++;if(kind==='travel')game.distance++;const coins=game.coins;updateJourney(1);check(kind+'悬赏完成有真实奖励',b.done&&game.coins===coins+20&&game.rerolls===4);settleBounty();check(kind+'悬赏不重复发奖',game.coins===coins+20);}
 setup();game.time=46;updateJourney(.1);check('限时悬赏过期无奖励',game.journey.bounty.failed&&game.coins===20);setup();game.journey.bounty.kind='steady';game.journey.bounty.progress=8;journeyHurt(1);check('损失生命会重置从容应敌进度',game.journey.bounty.progress===0);
 setup('guard');beginWave(2);check('每波刷新悬赏和守心护盾',game.journey.bounty.kind==='travel'&&game.player.shield===24);beginWave(3);check('第3波前机缘暂停战斗',state==='journey-relic'&&document.querySelectorAll('[data-relic]').length===3);const selectedRelic=document.querySelector('[data-relic]');selectedRelic.click();check('机缘三选一返回战斗',state==='playing'&&game.journey.relics.length===1);openJourneyRelics();check('同一波机缘不会重复打开',state==='playing');
 setup();game.journey.threat=JOURNEY_THREATS[2];const e=spawnEnemy('blade',{x:6,z:5});check('重甲敌情改变普通敌人血量与速度',e.maxHp===ENEMY.blade.hp*1.25&&Math.abs(e.speed-ENEMY.blade.speed*.88)<.001);const elite=spawnEnemy('elite',{x:7,z:6});check('敌情不额外强化精英首领',elite.maxHp===ENEMY.elite.hp*.85);
 setup();game.journey.threat=JOURNEY_THREATS[3];game.time=12;updateJourney(.1);check('箭雨敌情确实追加弓手',game.enemies.some(e=>e.type==='archer'));
 setup();const target=spawnEnemy('blade',{x:6,z:5});hitEnemy(target,100000);check('真实击杀进入连斩与志向计数',game.journey.killCount===1&&game.journey.streak===1);
 const b=game.journey.bounty,progress=b.progress;pauseGame();drawPixel(performance.now(),.016);check('菜单绘制不推进悬赏时间',b.progress===progress);closeModal();openBook();check('秘籍可更换目标并查看信物',document.querySelectorAll('.journey-track').length===2&&!!$('journey-journal'));document.querySelector('.journey-track:not(:disabled)').click();check('更换目标更新融合路线',journeyRecipe().id==='冰剑');closeModal();
 setup();pauseGame();$('quit').click();check('主动结束进入复盘并保留记录',state==='result'&&game.finished);check('结算有战后复盘与见闻入口',!!document.querySelector('.journey-recap')&&!!$('result-chronicle'));const runs=chronicle.runs;finish(false);check('结算只记一次战绩',chronicle.runs===runs);$('result-chronicle').click();check('结算进入见闻收藏',state==='chronicle'&&$('modal-content').textContent.includes('见闻印记'));$('chronicle-close').click();check('见闻返回原结算',state==='result'&&!!$('retry'));$('retry').click();check('再来一局重新选择志向',state==='journey-setup'&&!!$('journey-go'));
 saveChronicle();check('见闻可从本地存储重新读回',readChronicle().runs===chronicle.runs&&readChronicle().relics.length===chronicle.relics.length);
 startGame(0);check('新局清除行旅临时效果',!game.journey&&journeyDamageFactor({slow:1})===1);updateHUD();check('旧演武入口隐藏行旅HUD',$('journey-hud').classList.contains('hidden'));
 }finally{chronicle=JSON.parse(saved);saveChronicle();}
}
async function checkJourneyFullRun(check){
 const saved=JSON.stringify(chronicle);let steps=0,relicSelections=0,shops=0,upgrades=0;
 try{startGame(0);initJourney('roam','雷剑');game.player.invuln=999;
 while(!game.finished&&steps++<16000){
  if(state==='upgrade'){const r=journeyRecipe(),ids=['weapon',r.skill,r.common];const choice=game.choices.filter(id=>ids.includes(id)).sort((a,b)=>levelOf(a)/SKILLS[a].max-levelOf(b)/SKILLS[b].max)[0]||game.choices[0];selectUpgrade(choice);upgrades++;continue;}
  if(state==='shop'){if(game.shopBetween)shops++;const wanted=['weapon',journeyRecipe().skill,journeyRecipe().common];for(let i=0;i<game.offers.length;i++){const o=game.offers[i];if(o&&game.coins>=o.price&&(o.kind==='item'||wanted.includes(o.id)))document.querySelector(`[data-buy="${i}"]`)?.click();}$('shop-leave').click();continue;}
  if(state==='journey-relic'){document.querySelector('[data-relic]').click();relicSelections++;continue;}
  if(state==='book'){const available=availableRecipes().find(r=>r.id===game.journey.route);if(available)document.querySelector(`[data-fusion="${available.id}"]`).click();else closeModal();continue;}
  if(state==='event'){document.querySelector('[data-event-choice]')?.click();continue;}
  if(state!=='playing')break;
  game.player.invuln=999;
  if(availableRecipes().some(r=>r.id===game.journey.route)){openBook(true);continue;}
  const gem=pickups.filter(p=>!p.heal).sort((a,b)=>Math.hypot(a.x-game.player.x,a.z-game.player.z)-Math.hypot(b.x-game.player.x,b.z-game.player.z))[0];
  const event=events.find(e=>!e.used&&e.kind==='scholar');const goal=event||gem;keys.clear();
  if(goal){if(goal.x>game.player.x+.25)keys.add('KeyD');if(goal.x<game.player.x-.25)keys.add('KeyA');if(goal.z>game.player.z+.25)keys.add('KeyS');if(goal.z<game.player.z-.25)keys.add('KeyW');}
  if(game.nearEvent)openEvent(game.nearEvent);if(state!=='playing')continue;
  if(game.player.ult<=0)ultimate();if(game.player.artCD<=0)signature();updateGame(.04);updateEffects(.04);
  if(steps%500===0)await new Promise(resolve=>setTimeout(resolve,0));
 }
 check('完整行旅经过九次波间补给',shops===9,`补给${shops}次，领悟${upgrades}次，战斗${game.time.toFixed(1)}秒`);
 check('第3、6、9波信物流程全部贯通',relicSelections===3&&game.journey.relics.length===3);
 check('完整行旅悬赏与成长持续生效',game.journey.bounties>=3&&game.level>=10,`悬赏${game.journey.bounties}，境界${game.level}，破敌${game.kills}`);
 check('正常成长数值可修成目标融合',game.fusion?.id==='雷剑',journeyRouteText());
 check('完整行旅抵达首领并正确结算',game.wave===10&&game.finished&&state==='result',game.boss?.dead?'首领已击败':'首领未败，超时结算');
 }finally{keys.clear();chronicle=JSON.parse(saved);saveChronicle();}
}
if(new URLSearchParams(location.search).get('test')==='1'){
 const panel=$('qa-panel');
 const btn=document.createElement('button');btn.textContent='行旅实战预览';btn.onclick=()=>{startGame(0);initJourney('roam','雷剑');game.player.invuln=999;game.wave=5;game.time=245;game.waveTime=5;game.coins=132;grantRelic('echo');grantRelic('frostfire');game.journey.threat=JOURNEY_THREATS[2];startJourneyBounty();game.journey.bounty.progress=34;for(let n=0;n<3;n++)gainSkill('weapon');for(let n=0;n<2;n++)gainSkill('orbit');gainSkill('thunder');for(let n=0;n<16;n++){const a=n/16*TAU;spawnEnemy('blade',{x:Math.sin(a)*9,z:5+Math.cos(a)*9});}announce('重甲压阵','集中火力 · 轻功反击 · 探索奇遇');updateHUD();panel.classList.add('hidden');};panel.append(btn);
 const camp=document.createElement('button');camp.textContent='茶亭机缘预览';camp.onclick=()=>{startGame(0);initJourney('edge','雷剑');beginWave(3);panel.classList.add('hidden');};panel.append(camp);
 btn.disabled=camp.disabled=true;Promise.all([pixelAssetsReady,motionReady]).then(()=>{btn.disabled=camp.disabled=false;});
}
