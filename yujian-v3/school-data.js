/* 三门派分别使用剑气、飞镖和蝴蝶，文字、投射物和绝学保持一致。 */
Object.assign(HEROS[0],{sect:'藏峰山',trait:'剑意 · 每式发出穿透剑气，第三式化为更宽的破阵剑气。',desc:'青霜出鞘，剑气破阵。以直线穿透剑气贯穿追兵，第三式蓄势强化。'});
Object.assign(HEROS[1],{trait:'隐踪 · 双匕引镖，轻功后隐匿，飞镖附加三叠香印。',desc:'双匕藏锋，银镖追魂。连续投出旋转飞镖，借隐匿与香印打出爆发。'});
Object.assign(HEROS[2],{color:'#bfe3a3',hex:0xbfe3a3,trait:'蝶息 · 撑伞唤蝶，蝴蝶追踪目标，溢出治疗转为护盾。',desc:'照水撑伞，唤蝶回春。蝶群循弧线追踪敌人，花庭回复并保护自身。'});
Object.assign(SKILLS.orbit,{desc:'连续放出三道宽幅剑气，穿透并击退追兵。'});
Object.assign(SKILLS.return,{desc:'放出回旋剑气，折返时再次追击敌人。'});
Object.assign(SKILLS.shadow,{desc:'残影从侧翼连续投镖，追击附近目标。'});
Object.assign(SKILLS.mark,{desc:'投出破印飞镖，消耗目标的香印，造成爆发。'});
Object.assign(SKILLS.mist,{desc:'展开蝶梦花庭，持续伤敌、回复，并唤出守护蝶群。'});
Object.assign(SKILLS.needle,{desc:'放出一簇追踪灵蝶，沿弧线追击附近敌人。'});
Object.assign(RECIPES.find(r=>r.id==='叶影'),{desc:'飞镖散出飞叶，轻功唤来残影；绝技发动千叶镖阵。'});
Object.assign(RECIPES.find(r=>r.id==='焚脉'),{desc:'飞镖附灼烧，破印引出火区；绝技以炎镖引爆香印。'});
Object.assign(RECIPES.find(r=>r.id==='雪针'),{name:'雪魄灵蝶',desc:'蝴蝶附寒，命中回复护盾；绝技释放追魂冰蝶。'});
