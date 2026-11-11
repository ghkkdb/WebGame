/* 统一图标注册表：以条目 ID 映射，画布绘制32像素原图，各界面复用缓存。 */
const ICON_DEFS=Object.freeze({
 'weapon:sword':{name:'青霜剑',type:'本命兵器',shape:'sword',color:'#b5e5da'},
 'weapon:dagger':{name:'照夜双匕',type:'本命兵器',shape:'daggers',color:'#cdb3e6'},
 'weapon:healer':{name:'照水药伞',type:'本命兵器',shape:'umbrella',color:'#d8d6a1'},
 'skill:orbit':{name:'千山剑风',type:'门派武学',shape:'swordwind',color:'#b5e5da'},
 'skill:return':{name:'流影回锋',type:'门派武学',shape:'return',color:'#b5e5da'},
 'skill:shadow':{name:'疏影追魂',type:'门派武学',shape:'shadow',color:'#cdb3e6'},
 'skill:mark':{name:'三叠香印',type:'门派武学',shape:'marks',color:'#d7acdb'},
 'skill:mist':{name:'蝶梦花庭',type:'门派武学',shape:'garden',color:'#b9dbaf'},
 'skill:needle':{name:'流萤引梦',type:'门派武学',shape:'butterflytrail',color:'#d6dfaa'},
 'skill:thunder':{name:'引雷诀',type:'江湖武学',shape:'lightning',color:'#b7ddec'},
 'skill:fire':{name:'流火诀',type:'江湖武学',shape:'fire',color:'#eda47c'},
 'skill:ice':{name:'寒潭劲',type:'江湖武学',shape:'ice',color:'#9adddf'},
 'skill:leaf':{name:'飞叶术',type:'江湖武学',shape:'leaf',color:'#b1d58d'},
 'skill:wind':{name:'回风掌',type:'江湖武学',shape:'palm',color:'#d1ddb1'},
 'skill:petal':{name:'落英阵',type:'江湖武学',shape:'petal',color:'#e6b0c3'},
 'skill:breath':{name:'吐纳经',type:'内功心法',shape:'breath',color:'#aecd9b'},
 'skill:focus':{name:'凝神篇',type:'内功心法',shape:'eye',color:'#dfc183'},
 'skill:aura':{name:'御气诀',type:'内功心法',shape:'aura',color:'#acd9ca'},
 'skill:speed':{name:'疾行诀',type:'内功心法',shape:'swift',color:'#c6d39a'},
 'skill:energy':{name:'归元心经',type:'内功心法',shape:'taiji',color:'#e3cd96'},
 'skill:insight':{name:'百川诀',type:'内功心法',shape:'river',color:'#acc8df'},
 'art:sword':{name:'追风三叠',type:'门派身法',shape:'triple',color:'#b5e5da'},
 'art:dagger':{name:'月下藏锋',type:'门派身法',shape:'mooncloak',color:'#cdb3e6'},
 'art:healer':{name:'花汀蝶梦',type:'门派身法',shape:'butterfly',color:'#bfdfae'},
 'ult:sword':{name:'霜天剑雨',type:'主动绝技',shape:'swordrain',color:'#c8ede1'},
 'ult:dagger':{name:'月下千刃',type:'主动绝技',shape:'dartstorm',color:'#d9bbef'},
 'ult:healer':{name:'梦泽千蝶',type:'主动绝技',shape:'butterflyfield',color:'#dce0ac'},
 'fusion:雷剑':{name:'九霄雷剑',type:'融合绝学',shape:'sword',element:'lightning',color:'#a7dfff'},
 'fusion:冰剑':{name:'霜河剑域',type:'融合绝学',shape:'return',element:'ice',color:'#9fe4df'},
 'fusion:叶影':{name:'千叶无踪',type:'融合绝学',shape:'dart',element:'leaf',color:'#c1e69f'},
 'fusion:焚脉':{name:'焚心断脉',type:'融合绝学',shape:'marks',element:'fire',color:'#efac83'},
 'fusion:焚香':{name:'百草焚香',type:'融合绝学',shape:'incense',element:'fire',color:'#e9c28a'},
 'fusion:雪针':{name:'雪魄灵蝶',type:'融合绝学',shape:'butterflytrail',element:'ice',color:'#b1e6dd'},
 'item:whetstone':{name:'青玉砥石',type:'江湖器物',shape:'whetstone',color:'#afd1b5'},
 'item:bracer':{name:'流云护腕',type:'江湖器物',shape:'bracer',color:'#c1bdde'},
 'item:mirror':{name:'照胆铜镜',type:'江湖器物',shape:'mirror',color:'#dabb7d'},
 'item:boots':{name:'踏雪履',type:'江湖器物',shape:'boots',color:'#bbd2d3'},
 'item:jade':{name:'回春玉',type:'江湖器物',shape:'jade',color:'#95d4ad'},
 'item:armor':{name:'乌金软甲',type:'江湖器物',shape:'armor',color:'#b2bdba'},
 'item:bell':{name:'引灵铃',type:'江湖器物',shape:'bell',color:'#e0c388'},
 'item:blood':{name:'赤髓坠',type:'江湖器物',shape:'blood',color:'#d78e87'},
 'item:thread':{name:'金蚕丝',type:'江湖器物',shape:'thread',color:'#e6cf92'},
 'item:scroll':{name:'破阵残章',type:'江湖器物',shape:'scroll',color:'#d2bd93'},
 'item:incense':{name:'静心香',type:'江湖器物',shape:'incense',color:'#c0cda0'},
 'item:heart':{name:'长生锁',type:'江湖器物',shape:'lock',color:'#dfc681'},
 'utility:coins':{name:'铜钱',type:'奇遇所得',shape:'coins',color:'#e2c079'},
 'utility:heal':{name:'疗伤调息',type:'奇遇所得',shape:'medicine',color:'#b6d7a6'},
 'utility:insight':{name:'融会贯通',type:'奇遇所得',shape:'scrollstar',color:'#e2ce95'},
 'utility:damage':{name:'以身养锋',type:'奇遇所得',shape:'sword',element:'fire',color:'#ddaa8c'},
 'utility:guard':{name:'守拙归元',type:'奇遇所得',shape:'shield',color:'#abcbb2'},
 'utility:duel':{name:'试剑之约',type:'奇遇所得',shape:'crossed',color:'#d6bea0'}
});
const iconCache=new Map();
function skillIconKey(id,hero=game?.hero?.id||HEROS[selected].id){return id==='weapon'?'weapon:'+hero:'skill:'+id;}
function iconCanvas(key){if(iconCache.has(key))return iconCache.get(key).canvas;const def=ICON_DEFS[key];if(!def)throw Error('图标未注册：'+key);const canvas=document.createElement('canvas');canvas.width=canvas.height=32;const g=canvas.getContext('2d'),c=def.color,ink='#102e2b',shade='#42695c',light='#f2e9bf',gold='#bc9759';
 const rect=(x,y,w,h,col=c)=>{g.fillStyle=col;g.fillRect(x,y,w,h);};
 const line=(points,col=c,w=1)=>pixelLine(g,points,col,w);
 const poly=(points,col=c)=>pixelPoly(g,points,col);
 const disc=(x,y,r,col)=>{for(let yy=-r;yy<=r;yy++){const width=Math.floor(Math.sqrt(r*r-yy*yy));rect(x-width,y+yy,width*2+1,1,col);}};
 const ring=(x,y,r,col,w=1)=>{disc(x,y,r,ink);disc(x,y,r-1,col);disc(x,y,Math.max(0,r-1-w),ink);};
 const blade=(x,y,tilt=0,len=16)=>{const dx=tilt?len*.66:len*.56,dy=-len*.78;line([[x-2,y+3],[x+dx,y+dy]],ink,5);line([[x-1,y+2],[x+dx,y+dy]],c,3);line([[x+1,y-1],[x+dx,y+dy]],light);line([[x-3,y-3],[x+3,y+2]],gold,3);line([[x-4,y+5],[x-1,y+1]],'#8d6f4c',3);};
 const leaf=(x,y,size=9,col=c)=>{poly([[x-size/2,y+size/2],[x-size/2,y],[x,y-size/2],[x+size/2,y-size/2],[x+size/2,y],[x,y+size/2]],ink);poly([[x-size/2+1,y+size/2-1],[x-size/2+1,y],[x,y-size/2+1],[x+size/2-1,y-size/2+1],[x+size/2-1,y],[x,y+size/2-1]],col);line([[x-size/2+1,y+size/2-1],[x+size/2-2,y-size/2+2]],light);};
 const flower=(x,y,r=7,col=c)=>{for(let i=0;i<5;i++){const a=i/5*TAU;disc(Math.round(x+Math.sin(a)*r*.65),Math.round(y+Math.cos(a)*r*.65),Math.max(2,Math.round(r*.4)),ink);disc(Math.round(x+Math.sin(a)*r*.65),Math.round(y+Math.cos(a)*r*.65),Math.max(1,Math.round(r*.4)-1),col);}rect(x-1,y-1,3,3,light);};
 const butterfly=(x,y,s=1)=>{poly([[x,y],[x-5*s,y-5*s],[x-6*s,y-1*s],[x-3*s,y+1*s],[x-4*s,y+4*s],[x-1*s,y+3*s],[x,y]],c);poly([[x,y],[x+5*s,y-5*s],[x+6*s,y-1*s],[x+3*s,y+1*s],[x+4*s,y+4*s],[x+1*s,y+3*s],[x,y]],c);line([[x,y-3*s],[x,y+4*s]],light);};
 const swirl=(cx,cy,r=10,col=c)=>{const pts=[];for(let i=0;i<=38;i++){const a=i/38*TAU*1.5,rr=r-i*r/45;pts.push([cx+Math.sin(a)*rr,cy+Math.cos(a)*rr*.7]);}line(pts,ink,4);line(pts,col,2);};
 const scroll=()=>{poly([[8,5],[26,5],[24,25],[6,25]],ink);poly([[9,6],[25,6],[23,24],[7,24]],'#c4b085');rect(7,4,19,3,'#8c7550');rect(7,4,19,1,'#e9d4a3');rect(5,24,19,3,'#8c7550');rect(5,24,19,1,'#e9d4a3');for(let i=0;i<3;i++)rect(11,10+i*4,8-i,1,'#5c6b52');};
 /* 图形保持可辨的轮廓，主体与光点分层，避免只依赖颜色识别。 */
 switch(def.shape){
 case'sword':blade(11,23,0,24);break;
 case'daggers':blade(7,22,1,16);g.save();g.translate(30,0);g.scale(-1,1);blade(7,22,1,16);g.restore();break;
 case'umbrella':line([[16,12],[16,27],[20,27],[22,25]],ink,3);line([[16,12],[16,26],[20,26],[21,24]],gold);poly([[2,15],[5,10],[11,6],[16,4],[21,6],[27,10],[30,15],[24,16],[20,14],[16,16],[12,14],[8,16]],ink);poly([[3,14],[6,10],[12,7],[16,5],[21,7],[26,10],[29,14],[24,15],[20,13],[16,15],[12,13],[8,15]],'#dac99e');for(const x of [5,10,22,27])line([[16,6],[x,14]],'#9f966a');rect(15,4,3,2,light);break;
 case'swordwind':for(let i=0;i<3;i++){g.save();g.translate(i*5-5,3-i*3);blade(9,22,0,17);g.restore();}line([[3,22],[8,25],[19,26],[28,20]],c,2);break;
 case'return':swirl(16,17,11);blade(9,22,0,17);poly([[26,12],[29,18],[24,18]],light);break;
 case'shadow':for(let i=0;i<3;i++){const x=7+i*8;rect(x,7+i,4,4,i===2?c:shade);poly([[x-2,14+i],[x+4,12+i],[x+7,22+i],[x,22+i],[x-4,25+i]],i===2?c:shade);}line([[3,18],[8,18]],light);line([[2,22],[6,22]],c);break;
 case'marks':for(let i=0;i<3;i++){const x=8+i*8,y=10+(i===1?5:0);poly([[x,y-5],[x+4,y],[x,y+6],[x-4,y]],ink);poly([[x,y-4],[x+3,y],[x,y+4],[x-3,y]],c);rect(x,y-1,1,3,light);}line([[5,24],[16,27],[27,24]],'#9a7d9e');break;
 case'garden':line([[4,24],[10,27],[23,27],[29,24]],shade,2);flower(16,19,7);butterfly(7,8,.6);butterfly(25,10,.6);line([[7,25],[10,20]],c);break;
 case'needles':for(let i=0;i<3;i++){const x=7+i*6;line([[x,26],[x+8,7-i*2]],ink,3);line([[x,25],[x+8,7-i*2]],c);rect(x+5,9-i*2,2,2,light);}rect(4,9,2,2,c);rect(25,18,2,2,c);break;
 case'lightning':poly([[17,2],[6,17],[13,17],[10,30],[27,11],[19,11],[24,2]],ink);poly([[17,4],[8,16],[15,16],[12,27],[25,12],[18,12],[22,4]],c);line([[16,7],[12,14],[17,14]],light);break;
 case'fire':poly([[17,2],[20,12],[25,7],[29,20],[25,28],[8,28],[3,21],[10,9],[10,17],[14,13]],ink);poly([[17,4],[19,15],[24,11],[27,20],[23,26],[9,26],[5,21],[9,13],[10,21],[15,16]],c);poly([[17,15],[22,22],[19,26],[13,26],[11,23]],'#f4d28e');break;
 case'ice':for(let i=0;i<6;i++){const a=i/6*TAU,dx=Math.sin(a),dy=Math.cos(a);line([[16,16],[16+dx*12,16+dy*12]],ink,4);line([[16,16],[16+dx*11,16+dy*11]],c,2);line([[16+dx*7-dy*3,16+dy*7+dx*3],[16+dx*7,16+dy*7],[16+dx*7+dy*3,16+dy*7-dx*3]],c);}disc(16,16,3,light);break;
 case'leaf':leaf(12,18,17);leaf(24,9,10,'#91b879');line([[3,27],[17,25],[27,19]],shade);break;
 case'palm':swirl(16,18,12,shade);poly([[11,22],[8,17],[9,13],[12,17],[12,7],[14,6],[15,15],[16,5],[18,5],[18,15],[20,7],[22,8],[21,17],[24,12],[26,13],[23,23],[19,27],[13,26]],ink);poly([[12,21],[10,16],[11,15],[13,19],[13,8],[14,8],[15,18],[17,7],[17,18],[21,10],[20,20],[25,14],[22,23],[18,25],[14,25]],c);break;
 case'petal':flower(16,15,10);for(const [x,y] of [[5,5],[27,6],[5,26],[26,26]])rect(x,y,2,2,light);line([[7,27],[16,29],[25,27]],shade);break;
 case'breath':scroll();disc(17,16,5,shade);line([[13,18],[16,12],[20,18]],c,2);rect(16,10,2,2,light);break;
 case'eye':poly([[2,16],[10,9],[22,9],[30,16],[22,23],[10,23]],ink);poly([[4,16],[11,11],[21,11],[28,16],[21,21],[11,21]],c);disc(16,16,5,ink);disc(16,16,3,gold);rect(15,13,2,3,light);line([[11,5],[16,3],[21,5]],gold);break;
 case'aura':poly([[16,2],[28,7],[27,20],[22,27],[16,30],[10,27],[5,20],[4,7]],ink);poly([[16,4],[26,9],[25,20],[20,25],[16,28],[12,25],[7,20],[6,9]],c);poly([[16,7],[23,11],[22,20],[16,25],[10,20],[9,11]],shade);swirl(16,16,5,light);break;
 case'swift':line([[2,12],[10,12]],c,2);line([[3,17],[8,17]],shade,2);poly([[16,5],[25,5],[22,19],[28,21],[28,26],[12,26],[8,23],[11,19]],ink);poly([[17,6],[24,6],[21,20],[27,22],[26,24],[12,24],[10,22],[14,17]],c);line([[16,10],[22,10]],light);rect(12,25,15,2,gold);break;
 case'taiji':ring(16,16,12,gold,2);disc(16,16,9,c);disc(16,12,5,ink);disc(16,20,5,c);rect(16,9,2,2,light);rect(15,21,2,2,ink);break;
 case'river':scroll();for(let i=0;i<3;i++)line([[11+i*4,7],[9+i*4,13],[12+i*4,19],[10+i*4,23]],c,2);break;
 case'triple':for(let i=0;i<3;i++)line([[4+i*6,24],[11+i*6,20],[16+i*6,12],[16+i*6,6]],i===2?light:c,2);rect(3,27,8,1,shade);break;
 case'mooncloak':disc(22,9,7,c);disc(25,6,7,'#173b33');poly([[16,9],[9,15],[7,27],[16,23],[25,27],[23,15]],ink);poly([[16,11],[11,16],[9,25],[16,21],[23,25],[21,16]],'#8d76a4');blade(8,24,0,12);break;
 case'butterfly':butterfly(16,15,1.5);flower(9,25,4,'#d8c493');rect(25,23,2,2,light);break;
 case'swordrain':for(let i=0;i<3;i++){g.save();g.translate(3+i*9,-i%2*3);line([[2,3],[2,23]],ink,4);line([[2,4],[2,23]],c,2);line([[0,8],[5,8]],gold,2);poly([[0,23],[4,23],[2,27]],light);g.restore();}line([[5,28],[14,30],[26,28]],shade);break;
 case'bladestorm':ring(16,16,10,'#85729e',1);for(let i=0;i<6;i++){g.save();g.translate(16,16);g.rotate(i/6*TAU);line([[0,-4],[0,-13]],c,2);rect(-2,-7,5,1,gold);g.restore();}disc(16,16,2,light);break;
 case'butterflyfield':ring(16,18,10,shade,1);butterfly(16,12,1.15);butterfly(6,23,.65);butterfly(26,23,.65);flower(16,25,4,'#e3cca0');break;
 case'whetstone':poly([[4,12],[21,7],[28,12],[26,23],[10,27],[3,22]],ink);poly([[5,13],[21,9],[26,13],[24,21],[10,25],[5,21]],shade);poly([[5,13],[21,9],[26,13],[10,19]],c);line([[7,14],[21,11]],light);line([[11,20],[23,16]],'#82ad98');break;
 case'bracer':poly([[10,3],[24,8],[22,27],[7,23]],ink);poly([[11,5],[22,9],[20,25],[9,22]],'#7f789c');poly([[11,5],[22,9],[22,13],[10,10]],gold);poly([[9,19],[21,22],[20,26],[8,23]],gold);line([[12,13],[18,15],[13,18],[19,19]],c);rect(12,6,3,2,light);break;
 case'mirror':line([[16,23],[16,29]],ink,5);line([[16,23],[16,28]],gold,3);ring(16,13,11,gold,2);disc(16,13,7,'#829e92');line([[12,9],[20,9],[12,17]],light,2);rect(22,5,2,2,c);break;
 case'boots':for(let i=0;i<2;i++){g.save();g.translate(i*11,i*3);poly([[7,4],[16,4],[14,19],[19,22],[18,26],[4,26],[3,22],[6,19]],ink);poly([[8,5],[15,5],[13,20],[17,22],[17,24],[5,24],[5,22],[8,18]],'#6d8793');rect(7,6,8,3,c);line([[8,12],[13,12]],gold);rect(4,25,14,2,'#d7c49b');g.restore();}break;
 case'jade':line([[11,4],[16,2],[21,4],[23,9]],gold);poly([[16,6],[24,13],[24,23],[16,29],[8,23],[8,13]],ink);poly([[16,8],[22,14],[22,22],[16,27],[10,22],[10,14]],c);disc(16,16,3,shade);rect(12,11,2,6,light);rect(15,27,2,4,gold);break;
 case'armor':poly([[9,4],[13,3],[19,3],[23,4],[30,12],[25,17],[22,14],[23,28],[9,28],[10,14],[7,17],[2,12]],ink);poly([[10,5],[13,5],[16,10],[19,5],[22,5],[28,12],[25,14],[21,11],[21,26],[11,26],[11,11],[7,14],[4,12]],'#6d7d7c');for(let y=13;y<25;y+=4)for(let x=12;x<22;x+=4)rect(x,y,3,2,c);line([[11,25],[21,25]],gold,2);break;
 case'bell':line([[16,3],[16,9]],gold,2);ring(16,5,3,gold);poly([[11,9],[21,9],[25,22],[28,25],[5,25],[8,22]],ink);poly([[12,10],[20,10],[23,22],[26,23],[7,23],[10,22]],gold);line([[13,12],[12,19]],light,2);line([[8,21],[24,21]],c);disc(16,27,2,c);break;
 case'blood':line([[7,3],[16,7],[25,3]],gold,2);poly([[16,7],[25,18],[21,27],[16,30],[11,27],[7,18]],ink);poly([[16,9],[23,18],[20,25],[16,28],[12,25],[9,18]],'#a9585e');poly([[16,11],[20,18],[16,25],[12,18]],c);rect(13,14,2,5,light);break;
 case'thread':poly([[8,5],[23,5],[23,9],[20,9],[20,23],[24,23],[24,27],[7,27],[7,23],[10,23],[10,9],[8,9]],ink);rect(9,6,13,3,'#a68b5d');rect(8,24,15,2,'#a68b5d');rect(11,9,9,15,c);for(let i=0;i<5;i++)line([[11,10+i*3],[19,12+i*3]],gold);line([[20,21],[28,24],[25,29],[20,27]],c);rect(12,9,2,13,light);break;
 case'scroll':scroll();poly([[20,9],[23,12],[20,16],[23,19],[20,23]],'#6e6a53');line([[11,19],[17,12]],'#974f4a',2);break;
 case'incense':poly([[6,21],[26,21],[23,28],[9,28]],ink);poly([[8,22],[24,22],[22,26],[10,26]],gold);for(let i=0;i<3;i++){line([[11+i*5,21],[11+i*5,11-i*2]],'#d7ae79');rect(11+i*5,10-i*2,1,2,'#eea17a');}line([[16,6],[13,4],[15,2]],c);line([[22,8],[24,5],[22,3]],shade);break;
 case'lock':line([[8,6],[16,11],[24,6]],gold);poly([[10,11],[11,6],[21,6],[23,12],[28,13],[28,24],[23,28],[8,28],[4,24],[4,13]],ink);line([[12,12],[13,8],[20,8],[21,12]],gold,2);poly([[7,14],[25,14],[26,23],[21,26],[10,26],[6,23]],gold);line([[9,16],[23,16]],light);rect(15,18,3,5,shade);rect(16,19,1,3,ink);break;
 case'coins':for(let i=0;i<3;i++){const x=10+i*6,y=21-i*5;disc(x,y,7,ink);disc(x,y,6,gold);disc(x,y,4,'#e0c180');rect(x-1,y-1,3,3,ink);rect(x-3,y-4,4,1,light);}break;
 case'medicine':poly([[10,4],[22,4],[21,10],[25,15],[24,27],[8,27],[7,15],[11,10]],ink);rect(11,5,10,4,gold);poly([[12,10],[20,10],[23,15],[22,25],[10,25],[9,15]],c);rect(12,15,8,7,'#e0d3a7');rect(15,16,2,5,shade);rect(13,18,6,1,shade);break;
 case'scrollstar':scroll();for(const [x,y] of [[7,5],[25,16]]){line([[x-3,y],[x+3,y]],light);line([[x,y-3],[x,y+3]],light);}break;
 case'shield':poly([[16,3],[27,8],[26,20],[21,27],[16,30],[10,27],[5,20],[4,8]],ink);poly([[16,5],[25,9],[24,19],[20,25],[16,28],[12,25],[7,19],[6,9]],c);line([[16,8],[16,24]],gold,2);line([[9,14],[23,14]],gold,2);break;
 case'crossed':blade(6,24,0,24);g.save();g.translate(32,0);g.scale(-1,1);blade(6,24,0,24);g.restore();break;
 case'dart':{const pts=[];for(let i=0;i<8;i++){const a=i/8*TAU,r=i%2?4:13;pts.push([16+Math.sin(a)*r,16+Math.cos(a)*r]);}poly(pts,ink);poly(pts.map(([x,y])=>[16+(x-16)*.85,16+(y-16)*.85]),'#e8e8db');poly([[16,16],[5,16],[16,5]],c);disc(16,16,3,gold);break;}
 case'dartstorm':ring(16,16,8,'#85729e',1);for(let i=0;i<6;i++){const a=i/6*TAU,x=Math.round(16+Math.sin(a)*11),y=Math.round(16+Math.cos(a)*11);poly([[x,y-4],[x+1,y-1],[x+4,y],[x+1,y+1],[x,y+4],[x-1,y+1],[x-4,y],[x-1,y-1]],c);}disc(16,16,2,light);break;
 case'butterflytrail':butterfly(19,11,1.2);butterfly(9,23,.72);rect(4,14,2,2,light);rect(12,15,1,1,c);line([[4,25],[6,28],[15,28],[21,23]],shade);break;
 default:throw Error('图形未实现：'+def.shape);
 }
 if(def.element){g.save();g.translate(20,20);g.fillStyle=ink;g.fillRect(-1,-1,12,12);if(def.element==='lightning')poly([[5,0],[0,6],[4,6],[2,11],[10,3],[6,3],[8,0]],'#c1e9ef');if(def.element==='ice'){line([[5,0],[5,10]],'#c2f3e9');line([[1,2],[9,8]],'#c2f3e9');line([[1,8],[9,2]],'#c2f3e9');}if(def.element==='leaf')leaf(5,5,9,'#c8e29a');if(def.element==='fire')poly([[5,0],[7,5],[10,3],[10,8],[7,11],[2,10],[0,6],[3,3],[3,7]],'#f2b47e');g.restore();}
 iconCache.set(key,{canvas,url:canvas.toDataURL('image/png')});return canvas;}
function iconURL(key){iconCanvas(key);return iconCache.get(key).url;}
function iconHTML(key,classes=''){const def=ICON_DEFS[key];if(!def)throw Error('图标未注册：'+key);return `<span class="game-icon ${classes}" data-icon-key="${key}" aria-hidden="true"><img src="${iconURL(key)}" alt="" draggable="false"></span>`;}
function decorateSkillIcons(){for(const el of document.querySelectorAll('[data-icon-key]:not(:has(img))')){const key=el.dataset.iconKey;if(ICON_DEFS[key])el.innerHTML=`<img src="${iconURL(key)}" alt="" draggable="false">`;}}
function openIconCatalog(filter='all'){if(!game)return;const entries=Object.entries(ICON_DEFS).filter(([key,d])=>!key.startsWith('utility:')&&(filter==='all'||filter==='item'&&key.startsWith('item:')||filter==='skill'&&!key.startsWith('item:')&&!key.startsWith('fusion:')||filter==='fusion'&&key.startsWith('fusion:')));showModal(`<section class="modal-panel icon-catalog"><div class="modal-eyebrow">归元录 · 武学与器物图鉴</div><h2 class="modal-title">见其形，识其用</h2><p class="modal-sub">同一武学或器物在领悟、补给、秘籍与战斗栏中使用同一图标。</p><div class="catalog-tabs">${[['all','全部'],['skill','兵器与武学'],['item','江湖器物'],['fusion','融合绝学']].map(([key,name])=>`<button class="secondary ${key===filter?'active':''}" data-icon-filter="${key}" aria-pressed="${key===filter}">${name}</button>`).join('')}<span>${entries.length} 项</span></div><div class="icon-catalog-grid">${entries.map(([key,d])=>`<article class="catalog-entry">${iconHTML(key,'catalog-icon')}<div><small>${d.type}</small><b>${d.name}</b></div></article>`).join('')}</div><div class="modal-actions"><span class="note">图鉴仅供查阅 · 不占战斗时间</span><button class="secondary" id="catalog-close">返回武学与行囊</button></div></section>`,'book');document.querySelectorAll('[data-icon-filter]').forEach(b=>b.onclick=()=>openIconCatalog(b.dataset.iconFilter));$('catalog-close').onclick=()=>openBook();}
