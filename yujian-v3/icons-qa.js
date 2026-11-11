/* 验证注册表、三个角色的选择界面和购买后的图标复用。仅由开发入口调用。 */
function installIconPreviews(panel){const button=document.createElement('button');button.textContent='领悟预览';button.id='qa-upgrade';button.onclick=()=>{startGame(0);game.pendingUpgrades=1;game.choices=['weapon','orbit','thunder'];renderUpgrade();panel.classList.add('hidden');};panel.querySelector('[data-demo="0"]').parentElement.append(button);}
async function checkIconIntegration(check){
 const entries=Object.entries(ICON_DEFS),primary=entries.filter(([key])=>!key.startsWith('utility:'));
 check('45项正式图标完整注册',primary.length===45&&HEROS.every(h=>ICON_DEFS['weapon:'+h.id]&&ICON_DEFS['art:'+h.id]&&ICON_DEFS['ult:'+h.id])&&Object.keys(SKILLS).filter(id=>id!=='weapon').every(id=>ICON_DEFS['skill:'+id])&&EQUIPMENT.every(e=>ICON_DEFS['item:'+e.id])&&RECIPES.every(r=>ICON_DEFS['fusion:'+r.id]));
 check('图标名称与实际条目一致',EQUIPMENT.every(e=>ICON_DEFS['item:'+e.id].name===e.name)&&Object.entries(SKILLS).filter(([id])=>id!=='weapon').every(([id,d])=>ICON_DEFS['skill:'+id].name===d.name)&&RECIPES.every(r=>ICON_DEFS['fusion:'+r.id].name===r.name));
 const urls=entries.map(([key])=>iconURL(key));check('条目图标不重复套用',new Set(urls).size===entries.length);
 check('图标画布有效且背景透明',entries.every(([key])=>{const c=iconCanvas(key),data=c.getContext('2d').getImageData(0,0,32,32).data;let visible=0;for(let i=3;i<data.length;i+=4)if(data[i]>0)visible++;return c.width===32&&c.height===32&&data[3]===0&&visible>20;}));
 for(let i=0;i<3;i++){
  startGame(i);updateHUD();const hero=HEROS[i];
  check(hero.name+'技能栏独立兵器与E/Q图标',document.querySelector('#skillbar [data-icon-key]')?.dataset.iconKey==='weapon:'+hero.id&&$('art-button').querySelector('[data-icon-key]')?.dataset.iconKey==='art:'+hero.id&&$('ult-button').querySelector('[data-icon-key]')?.dataset.iconKey==='ult:'+hero.id);
  game.pendingUpgrades=1;game.choices=['weapon',hero.exclusive[0],'fire'];renderUpgrade();
  check(hero.name+'三选一图标对应武学',game.choices.every(id=>document.querySelector(`[data-upgrade="${id}"] [data-icon-key]`)?.dataset.iconKey===skillIconKey(id)));
  document.querySelector('[data-upgrade="weapon"]').click();check(hero.name+'图标卡片可正常领悟',levelOf('weapon')===2&&state==='playing');
 }
 startGame(0);game.coins=500;game.shopBetween=false;game.shopRerolls=0;const item=EQUIPMENT.find(e=>e.id==='bracer');
 game.offers=[{kind:'skill',id:'weapon',name:game.hero.weapon,desc:'强化本命兵器',price:10},{kind:'item',id:item.id,name:item.name,desc:item.desc,price:12,item},{kind:'item',id:'armor',name:'乌金软甲',desc:EQUIPMENT.find(e=>e.id==='armor').desc,price:12,item:EQUIPMENT.find(e=>e.id==='armor')},{kind:'skill',id:'fire',name:SKILLS.fire.name,desc:SKILLS.fire.desc,price:10}];renderShop();
 check('商店兵器秘籍与器物图标分别映射',Array.from(document.querySelectorAll('.shop-glyph [data-icon-key]')).map(e=>e.dataset.iconKey).join(',')==='weapon:sword,item:bracer,item:armor,skill:fire');
 document.querySelector('[data-buy="1"]').click();check('图标商品购买仍扣款并入行囊',game.coins===488&&game.inventory.bracer===1&&game.offers[1]===null);
 $('shop-leave').click();openBook();check('行囊复用购买时图标及数量',document.querySelector('.owned-chip [data-icon-key="item:bracer"] img')?.getAttribute('src')===iconURL('item:bracer')&&document.querySelector('.owned-chips')?.parentElement.textContent.includes('流云护腕 ×1'));
 check('融合绝学和配方材料图标正确',document.querySelectorAll('.recipe-heading [data-icon-key^="fusion:"]').length===2&&document.querySelectorAll('.requirements [data-icon-key="weapon:sword"]').length===2);
 openIconCatalog('item');check('器物图鉴仅展示12件装备',document.querySelectorAll('.catalog-entry').length===12&&Array.from(document.querySelectorAll('.catalog-entry [data-icon-key]')).every(e=>e.dataset.iconKey.startsWith('item:')));
 openIconCatalog('fusion');check('融合图鉴展示6门绝学',document.querySelectorAll('.catalog-entry').length===6);
 openIconCatalog();await Promise.all(Array.from(document.querySelectorAll('.icon-catalog img')).map(img=>img.decode()));check('45项图鉴图片全部解码显示',document.querySelectorAll('.catalog-entry').length===45&&Array.from(document.querySelectorAll('.icon-catalog img')).every(img=>img.complete&&img.naturalWidth===32));
 $('catalog-close').click();check('图鉴返回配方并维持暂停',state==='book'&&!!$('book-close'));closeModal();
 const chest={...events[0],kind:'chest',id:'icon-check-chest',name:'遗落行囊',used:false};openEvent(chest);const reward=document.querySelector('[data-event-choice="0"] [data-icon-key]')?.dataset.iconKey;
 check('奇遇实物奖励与铜钱有独立图标',reward?.startsWith('item:')&&document.querySelector('[data-event-choice="1"] [data-icon-key]')?.dataset.iconKey==='utility:coins');document.querySelector('[data-event-choice="0"]').click();check('奇遇图标选择可正常领取器物',game.inventory[reward.slice(5)]>=1&&state==='playing');
 game.fusion=RECIPES.find(r=>r.hero==='sword');updateHUD();check('融合后Q图标切换为对应绝学',$('ult-button').querySelector('[data-icon-key]')?.dataset.iconKey==='fusion:'+game.fusion.id);
}
