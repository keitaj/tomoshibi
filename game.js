(()=>{
'use strict';
// ---------- 定数・ユーティリティ ----------
const W=51,H=33,CW=17,CH=11,VX=15,VY=11,MAXF=10,INV_MAX=20;
const FONT='"DotGothic16","Hiragino Kaku Gothic ProN","Yu Gothic",sans-serif';
const EMOJI='"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
const BEST_KEY='tomoshibi.best';
const rnd=n=>Math.floor(Math.random()*n);
const rint=(a,b)=>a+rnd(b-a+1);
const pick=a=>a[rnd(a.length)];
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]]}return a};
const cheb=(a,b)=>Math.max(Math.abs(a.x-b.x),Math.abs(a.y-b.y));
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const hash=(x,y)=>{let h=(Math.imul(x,374761393)+Math.imul(y,668265263))|0;h=Math.imul(h^(h>>>13),1274126177);return (h^(h>>>16))>>>0};
const DIRS=[[0,-1],[1,0],[0,1],[-1,0],[-1,-1],[1,-1],[1,1],[-1,1]];

// ---------- データ ----------
const GRASS=[{id:'heal',name:'回復草'},{id:'str',name:'ちから草'},{id:'fire',name:'火炎草'},{id:'sleep',name:'ねむり草'},{id:'luck',name:'しあわせ草'},{id:'poison',name:'どく草'}];
const GRASS_LOOKS=['赤い草','青い草','黄色い草','白い草','黒い草','まだらの草'];
const SCROLL=[{id:'ident',name:'しきべつの巻物'},{id:'light',name:'あかりの巻物'},{id:'blast',name:'ばくはつの巻物'},{id:'bind',name:'かなしばりの巻物'},{id:'wup',name:'つよさの巻物'},{id:'sup',name:'まもりの巻物'}];
const WEAPONS=[{id:'bronze',name:'青銅の剣',pow:3,min:1},{id:'axe',name:'鉄の斧',pow:5,min:3},{id:'katana',name:'はがねの刀',pow:7,min:5},{id:'flame',name:'炎の剣',pow:10,min:8}];
const SHIELDS=[{id:'wood',name:'木の盾',pow:2,min:1},{id:'bronzeS',name:'青銅の盾',pow:4,min:3},{id:'ironS',name:'鉄の盾',pow:6,min:5},{id:'steelS',name:'はがねの盾',pow:8,min:8}];
const STAFFS=[{id:'bolt',name:'いかずちの杖'},{id:'blow',name:'ふきとばしの杖'},{id:'nap',name:'ねむりの杖'}];
const FOODS=[{id:'rice',name:'おにぎり',full:50},{id:'big',name:'大きなおにぎり',full:100}];
const ICON={grass:'🌿',scroll:'📜',food:'🍙',weapon:'🗡️',shield:'🛡️',staff:'🪄',gold:'💰'};
const DESC={
  'grass:heal':'HPを30回復する。HPが満タンなら最大HPが2ふえる。',
  'grass:str':'ちからが1あがる。',
  'grass:fire':'前方に炎をはき、当たった敵に20ダメージ。',
  'grass:sleep':'しばらくねむってしまう。',
  'grass:luck':'レベルが1あがる。',
  'grass:poison':'ちからが1さがり、HPも減る。',
  'scroll:ident':'持ちものをひとつ識別する。',
  'scroll:light':'フロア全体の地形がわかる。',
  'scroll:blast':'見えている敵に25ダメージ。自分も少しダメージを受ける。',
  'scroll:bind':'見えている敵をしばらく動けなくする。',
  'scroll:wup':'装備中の武器が+1される。',
  'scroll:sup':'装備中の盾が+1される。',
  'food:rice':'満腹度が50回復する。','food:big':'満腹度が100回復する。',
  'staff:bolt':'前方の敵にいかずちを放つ。','staff:blow':'前方の敵を遠くへふきとばす。','staff:nap':'前方の敵をねむらせる。'
};
const MON={
  frog:  {name:'ぬまガエル',    e:'🐸',hp:7, atk:3, def:0,exp:3},
  bat:   {name:'ヨルコウモリ',  e:'🦇',hp:9, atk:3, def:1,exp:5, erratic:true},
  shroom:{name:'どくキノコ',    e:'🍄',hp:12,atk:4, def:2,exp:7, drain:true},
  rat:   {name:'ぬすっとネズミ',e:'🐀',hp:14,atk:3, def:2,exp:9, thief:true},
  turtle:{name:'イワガメ',      e:'🐢',hp:18,atk:6, def:6,exp:14},
  wolf:  {name:'はやてオオカミ',e:'🐺',hp:22,atk:8, def:4,exp:22,fast:true},
  skel:  {name:'ほねのきし',    e:'💀',hp:40,atk:13,def:9,exp:45},
  lizard:{name:'ほのおトカゲ',  e:'🦎',hp:35,atk:11,def:7,exp:50,breath:true}
};
const SPAWN=[null,
  ['frog','frog','bat'],['frog','bat','shroom'],['bat','shroom','rat','turtle'],
  ['shroom','rat','turtle','wolf'],['shroom','rat','turtle','wolf'],
  ['turtle','wolf','rat','skel'],['turtle','wolf','rat','skel'],
  ['wolf','skel','lizard','rat'],['wolf','skel','lizard','rat'],['wolf','skel','lizard','skel']];
const NEXT=[0,10,30,60,100,160,240,340,470,630,830,1080,1400,1800,2300,2900,3600,4400,5300,6300,7500];
const TRAPS={pit:'落とし穴',gas:'ねむりガスのワナ',hunger:'はらへりのワナ'};
const C={void:'#0d0b14',floorA:'#4a4460',floorB:'#4e4866',grout:'#3f3954',pebble:'#5c5577',
  wall:'#221e30',wallTop:'#2b263c',wallFace:'#3a3350',wallLine:'#2a2439',
  stairBg:'#2a2438',stair:'#e9dfc4',trap:'#ec7663'};
const byId=(arr,id)=>arr.find(o=>o.id===id);
const plusStr=n=>n>0?'+'+n:n<0?String(n):'';

// ---------- 状態 ----------
let G=null, modal=null;
const $=id=>document.getElementById(id);
const cv=$('cv'), ctx=cv.getContext('2d');
let tile=40, cw=600, chh=440, dpr=1;

const inb=(x,y)=>x>=0&&y>=0&&x<W&&y<H;
const walk=(x,y)=>inb(x,y)&&G.f.tiles[y*W+x]===1;
const monAt=(x,y)=>G.f.monsters.find(m=>!m.dead&&m.x===x&&m.y===y);
const itemAt=(x,y)=>G.f.items.find(i=>i.x===x&&i.y===y);
const trapAt=(x,y)=>G.f.traps.find(t=>t.x===x&&t.y===y);
const diagOK=(x,y,dx,dy)=>!(dx&&dy)||(walk(x+dx,y)&&walk(x,y+dy));
const roomOf=(x,y)=>G.f.roomAt[y*W+x];
const onStairs=()=>G&&G.f&&G.f.stairs.x===G.p.x&&G.f.stairs.y===G.p.y;

// ---------- アイテム ----------
function makeItem(kind,type){const it={kind,type,plus:0};if(kind==='staff')it.charges=rint(3,6);return it}
function randomItem(fl){
  const r=Math.random()*100;
  if(r<30)return makeItem('grass',pick(GRASS).id);
  if(r<54)return makeItem('scroll',pick(SCROLL).id);
  if(r<70)return makeItem('food',Math.random()<0.75?'rice':'big');
  if(r<80){const it=makeItem('weapon',pick(WEAPONS.filter(w=>w.min<=fl)).id);if(Math.random()<0.25)it.plus=rint(1,2);return it}
  if(r<90){const it=makeItem('shield',pick(SHIELDS.filter(w=>w.min<=fl)).id);if(Math.random()<0.25)it.plus=rint(1,2);return it}
  return makeItem('staff',pick(STAFFS).id);
}
function itemName(it){
  switch(it.kind){
    case 'grass':{const i=GRASS.findIndex(g=>g.id===it.type);return G.known.grass[it.type]?GRASS[i].name:G.looks.grass[i]}
    case 'scroll':{const i=SCROLL.findIndex(g=>g.id===it.type);return G.known.scroll[it.type]?SCROLL[i].name:G.looks.scroll[i]}
    case 'food':return byId(FOODS,it.type).name;
    case 'weapon':return byId(WEAPONS,it.type).name+plusStr(it.plus);
    case 'shield':return byId(SHIELDS,it.type).name+plusStr(it.plus);
    case 'staff':return byId(STAFFS,it.type).name+'['+it.charges+']';
    case 'gold':return it.amount+'ゴールド';
  }
}
function itemDesc(it){
  if((it.kind==='grass'||it.kind==='scroll')&&!G.known[it.kind][it.type])return '正体がわからない。使うか、しきべつの巻物で判明する。';
  if(it.kind==='weapon')return '攻撃力+'+(byId(WEAPONS,it.type).pow+it.plus)+'。';
  if(it.kind==='shield')return '防御力+'+(byId(SHIELDS,it.type).pow+it.plus)+'。';
  return DESC[it.kind+':'+it.type]||'';
}
const pAtk=()=>{const p=G.p;return Math.max(1,3+p.lv+(p.str-8)+(p.weapon?byId(WEAPONS,p.weapon.type).pow+p.weapon.plus:0))};
const pDef=()=>{const p=G.p;return Math.floor(p.lv/2)+(p.shield?byId(SHIELDS,p.shield.type).pow+p.shield.plus:0)};

// ---------- マップ生成（3×3区画に部屋を置き、通路でつなぐ） ----------
function genMap(){
  const tiles=new Uint8Array(W*H), roomAt=new Int8Array(W*H).fill(-1);
  const cells=[], rooms=[]; let dummies=0;
  for(let cy=0;cy<3;cy++)for(let cx=0;cx<3;cx++){
    const x0=cx*CW,y0=cy*CH; let r;
    if(dummies<2&&Math.random()<0.2){dummies++;r={x:x0+rint(3,CW-4),y:y0+rint(3,CH-4),w:1,h:1,dummy:true}}
    else{const w=rint(4,CW-5),h=rint(3,CH-5);r={x:x0+2+rnd(CW-3-w),y:y0+2+rnd(CH-3-h),w,h}}
    r.cx=cx;r.cy=cy;cells.push(r);
    if(!r.dummy){r.id=rooms.length;rooms.push(r)}
    for(let y=r.y;y<r.y+r.h;y++)for(let x=r.x;x<r.x+r.w;x++){tiles[y*W+x]=1;if(!r.dummy)roomAt[y*W+x]=r.id}
  }
  const nb=a=>{const ax=a%3,ay=(a/3)|0,o=[];if(ax>0)o.push(a-1);if(ax<2)o.push(a+1);if(ay>0)o.push(a-3);if(ay<2)o.push(a+3);return o};
  const edges=new Set(), vis=new Set([rnd(9)]);
  while(vis.size<9){const a=pick([...vis]);const c=nb(a).filter(b=>!vis.has(b));if(!c.length)continue;const b=pick(c);vis.add(b);edges.add(Math.min(a,b)*10+Math.max(a,b))}
  for(let k=rint(1,3);k>0;k--){const a=rnd(9),b=pick(nb(a));edges.add(Math.min(a,b)*10+Math.max(a,b))}
  const carve=(x,y)=>{tiles[y*W+x]=1};
  for(const e of edges){
    const a=(e/10)|0,b=e%10,A=cells[a],B=cells[b];
    if(b===a+1){
      const sy=A.y+rnd(A.h),ey=B.y+rnd(B.h),sx=A.x+A.w-1,ex=B.x,mx=(A.cx+1)*CW;
      for(let x=sx;x<=mx;x++)carve(x,sy);
      for(let y=Math.min(sy,ey);y<=Math.max(sy,ey);y++)carve(mx,y);
      for(let x=mx;x<=ex;x++)carve(x,ey);
    }else{
      const sx=A.x+rnd(A.w),ex=B.x+rnd(B.w),sy=A.y+A.h-1,ey=B.y,my=(A.cy+1)*CH;
      for(let y=sy;y<=my;y++)carve(sx,y);
      for(let x=Math.min(sx,ex);x<=Math.max(sx,ex);x++)carve(x,my);
      for(let y=my;y<=ey;y++)carve(ex,y);
    }
  }
  return {tiles,roomAt,rooms};
}
function freeSpot(ex=-1,hidden=false){
  const f=G.f;
  for(let t=0;t<300;t++){
    const r=pick(f.rooms);if(r.id===ex)continue;
    const x=r.x+rnd(r.w),y=r.y+rnd(r.h);
    if(x===G.p.x&&y===G.p.y)continue;
    if(f.stairs&&f.stairs.x===x&&f.stairs.y===y)continue;
    if(itemAt(x,y)||monAt(x,y)||trapAt(x,y))continue;
    if(hidden&&f.visible[y*W+x])continue;
    return {x,y};
  }
  return null;
}
function spawnMonster(x,y,init){
  const t=pick(SPAWN[Math.min(G.floor,SPAWN.length-1)]),d=MON[t];
  G.f.monsters.push({type:t,x,y,hp:d.hp,maxhp:d.hp,asleep:init&&Math.random()<0.35,sleep:0,tx:null,ty:null,stolen:null,flash:0,bump:0,bdx:0,bdy:0});
}

// ---------- ゲーム開始・フロア ----------
function newGame(){
  const syl='アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロ';
  const sl=[];
  while(sl.length<SCROLL.length){let s='';const n=rint(3,4);for(let i=0;i<n;i++)s+=syl[rnd(syl.length)];s+='の巻物';if(!sl.includes(s))sl.push(s)}
  G={floor:0,turn:0,over:false,busy:false,msgs:[],seq:0,mark:0,known:{grass:{},scroll:{}},
     looks:{grass:shuffle(GRASS_LOOKS),scroll:sl},showMap:true,turnMode:false,invSel:0,titleT:0,
     p:{x:0,y:0,dir:[0,1],hp:15,maxhp:15,lv:1,exp:0,str:8,maxstr:8,full:100,maxfull:100,gold:0,
        weapon:null,shield:null,inv:[],sleep:0,regen:0,kills:0,flash:0,bump:0}};
  G.p.inv.push(makeItem('food','rice'));
  nextFloor();
  msg('地下10階の出口をめざそう');
  $('bMap').setAttribute('aria-pressed','true');
  updateHUD();
}
function nextFloor(){
  G.floor++;
  const m=genMap();
  G.f={...m,items:[],monsters:[],traps:[],explored:new Uint8Array(W*H),visible:new Uint8Array(W*H),lit:false,stairs:null};
  const f=G.f, start=pick(f.rooms);
  G.p.x=start.x+rnd(start.w);G.p.y=start.y+rnd(start.h);
  const others=f.rooms.filter(r=>r!==start),sr=pick(others);
  f.stairs={x:sr.x+rnd(sr.w),y:sr.y+rnd(sr.h)};
  for(let i=rint(4,7);i>0;i--){const s=freeSpot();if(s){const it=randomItem(G.floor);it.x=s.x;it.y=s.y;f.items.push(it)}}
  for(let i=rint(1,2);i>0;i--){const s=freeSpot();if(s)f.items.push({kind:'gold',amount:rint(10,30)*G.floor,x:s.x,y:s.y})}
  for(let i=rint(1,2)+Math.floor(G.floor/3);i>0;i--){
    const s=freeSpot();if(!s)continue;
    const types=G.floor<MAXF?['pit','gas','hunger']:['gas','hunger'];
    f.traps.push({x:s.x,y:s.y,type:pick(types),seen:false});
  }
  for(let i=rint(4,6);i>0;i--){const s=freeSpot(start.id);if(s)spawnMonster(s.x,s.y,true)}
  G.titleT=performance.now();
  computeFOV();
  msg('地下'+G.floor+'階にやってきた');
}
function computeFOV(){
  const f=G.f,p=G.p;f.visible.fill(0);
  const set=(x,y)=>{if(inb(x,y)){f.visible[y*W+x]=1;f.explored[y*W+x]=1}};
  const r=roomOf(p.x,p.y);
  if(r>=0){const R=f.rooms[r];for(let y=R.y-1;y<=R.y+R.h;y++)for(let x=R.x-1;x<=R.x+R.w;x++)set(x,y)}
  for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)set(p.x+dx,p.y+dy);
  for(const it of f.items)if(f.lit||f.visible[it.y*W+it.x])it.seen=true;
}

// ---------- メッセージ・HUD ----------
function msg(t,cls){G.msgs.push({t,cls,s:++G.seq});if(G.msgs.length>60)G.msgs.shift();renderLog()}
function renderLog(){
  const last=G.msgs.slice(-4);
  $('log').innerHTML=last.map(m=>`<li class="${m.cls||''}${m.s>G.mark?' new':''}">${esc(m.t)}</li>`).join('');
}
function updateHUD(){
  if(!G)return;const p=G.p;
  $('hFloor').textContent='B'+G.floor+'F';
  $('hLv').textContent=p.lv;
  $('hHp').textContent=p.hp+'/'+p.maxhp;
  const bar=$('hHpBar');bar.style.width=Math.max(0,p.hp/p.maxhp*100)+'%';bar.classList.toggle('low',p.hp<=p.maxhp*0.25);
  const fu=$('hFull');fu.textContent=p.full+'%';fu.classList.toggle('warn',p.full<=20);
  $('hStr').textContent=p.str+'/'+p.maxstr;
  $('hGold').textContent=p.gold;
  $('bStairs').disabled=!onStairs()||G.over;
  $('bFace').setAttribute('aria-pressed',G.turnMode?'true':'false');
}

// ---------- ターン処理 ----------
async function act(fn){
  if(!G||G.busy||G.over||modal)return;
  if(performance.now()-G.titleT<450)return;
  G.busy=true;G.mark=G.seq;
  try{
    const used=await fn();
    if(used&&!G.over)await endTurn();
    if(!G.over){
      if(G.fall){G.fall=false;damagePlayer(3,'落とし穴');if(!G.over){msg('3のダメージ','bad');goDown(true)}}
      else if(G.stepStairs){G.stepStairs=false;if(onStairs())openStairs()}
    }
  }finally{G.busy=false;renderLog();updateHUD()}
}
async function endTurn(){
  await worldTurn();
  while(G.p.sleep>0&&!G.over){
    updateHUD();await wait(170);
    G.p.sleep--;
    if(G.p.sleep===0){msg('目がさめた');break}
    await worldTurn();
  }
}
async function worldTurn(){
  const p=G.p,f=G.f;G.turn++;
  f.monsters=f.monsters.filter(m=>!m.dead);
  if(G.turn%10===0&&p.full>0){
    p.full--;
    if(p.full===20)msg('おなかがへってきた','bad');
    if(p.full===10)msg('おなかがへって目がまわってきた','bad');
    if(p.full===0)msg('はらぺこだ！ はやく何か食べないと…','bad');
  }
  if(p.full<=0){damagePlayer(1,'はらぺこ')}
  else if(p.hp<p.maxhp){p.regen+=p.maxhp/120;while(p.regen>=1&&p.hp<p.maxhp){p.regen--;p.hp++}}
  else p.regen=0;
  if(G.over)return;
  computeFOV();
  await monstersAct();
  if(G.over)return;
  if(G.turn%40===0&&f.monsters.filter(m=>!m.dead).length<10){const s=freeSpot(-1,true);if(s)spawnMonster(s.x,s.y,false)}
  computeFOV();updateHUD();
}
async function monstersAct(){
  const f=G.f;
  for(const m of f.monsters.slice()){
    const d=MON[m.type],n=d.fast?2:1;
    for(let i=0;i<n;i++){if(m.dead||G.over)break;await monsterStep(m,d)}
  }
  f.monsters=f.monsters.filter(m=>!m.dead);
}
function lineClear(a,b){
  const dx=b.x-a.x,dy=b.y-a.y;
  if(!(dx===0||dy===0||Math.abs(dx)===Math.abs(dy)))return false;
  const sx=Math.sign(dx),sy=Math.sign(dy);let x=a.x,y=a.y;
  for(let i=0;i<20;i++){
    if(!diagOK(x,y,sx,sy))return false;
    x+=sx;y+=sy;
    if(x===b.x&&y===b.y)return true;
    if(!walk(x,y)||monAt(x,y))return false;
  }
  return false;
}
function bfsNext(sx,sy,tx,ty){
  if(sx===tx&&sy===ty)return null;
  const start=sy*W+sx,goal=ty*W+tx,prev=new Int32Array(W*H).fill(-1);
  prev[start]=start;const q=[start];let h=0;
  while(h<q.length){
    const c=q[h++];if(c===goal)break;
    const cx=c%W,cy=(c/W)|0;
    for(const [dx,dy] of DIRS){
      const nx=cx+dx,ny=cy+dy;
      if(!walk(nx,ny)||!diagOK(cx,cy,dx,dy))continue;
      const n=ny*W+nx;if(prev[n]!==-1)continue;prev[n]=c;q.push(n);
    }
  }
  if(prev[goal]===-1)return null;
  let c=goal;while(prev[c]!==start)c=prev[c];
  return {x:c%W,y:(c/W)|0};
}
function canEnter(x,y){return walk(x,y)&&!monAt(x,y)&&!(x===G.p.x&&y===G.p.y)}
function stepToward(m){
  const n=bfsNext(m.x,m.y,m.tx,m.ty);
  if(n&&canEnter(n.x,n.y)){m.x=n.x;m.y=n.y;return}
  let best=null,bd=Math.max(Math.abs(m.tx-m.x),Math.abs(m.ty-m.y));
  for(const [dx,dy] of shuffle(DIRS)){
    const nx=m.x+dx,ny=m.y+dy;
    if(!canEnter(nx,ny)||!diagOK(m.x,m.y,dx,dy))continue;
    const dd=Math.max(Math.abs(m.tx-nx),Math.abs(m.ty-ny));
    if(dd<bd){bd=dd;best=[nx,ny]}
  }
  if(best){m.x=best[0];m.y=best[1]}else if(!n)m.tx=null;
}
function randomStep(m){
  for(const [dx,dy] of shuffle(DIRS)){
    const nx=m.x+dx,ny=m.y+dy;
    if(canEnter(nx,ny)&&diagOK(m.x,m.y,dx,dy)){m.x=nx;m.y=ny;return}
  }
}
async function monsterStep(m,d){
  const p=G.p,f=G.f;
  if(m.sleep>0){m.sleep--;return}
  if(m.asleep){
    if(cheb(m,p)<=1||(f.visible[m.y*W+m.x]&&Math.random()<0.08))m.asleep=false;else return;
  }
  const dx=Math.sign(p.x-m.x),dy=Math.sign(p.y-m.y),adj=cheb(m,p)===1,sees=f.visible[m.y*W+m.x]===1;
  if(d.breath&&sees&&!adj&&cheb(m,p)<=7&&lineClear(m,p)&&Math.random()<0.35){await breath(m,d,dx,dy);return}
  if(adj&&diagOK(m.x,m.y,dx,dy)&&!(d.erratic&&Math.random()<0.35)){await monAttack(m,d);return}
  if(d.erratic&&Math.random()<0.5){randomStep(m);return}
  if(sees){m.tx=p.x;m.ty=p.y}
  else if(m.tx==null||(m.x===m.tx&&m.y===m.ty)||Math.random()<0.02){const r=pick(f.rooms);m.tx=r.x+rnd(r.w);m.ty=r.y+rnd(r.h)}
  stepToward(m);
}
async function monAttack(m,d){
  const p=G.p;
  m.bump=performance.now();m.bdx=Math.sign(p.x-m.x);m.bdy=Math.sign(p.y-m.y);
  if(d.thief&&!m.stolen&&Math.random()<0.6){
    const c=p.inv.filter(i=>i!==p.weapon&&i!==p.shield);
    if(c.length){
      const it=pick(c);removeInv(it);m.stolen=it;
      msg(d.name+'は'+itemName(it)+'をぬすんだ！','bad');
      const s=freeSpot(-1,true);if(s){m.x=s.x;m.y=s.y;m.tx=null}
      await wait(80);return;
    }
  }
  if(Math.random()<0.12){msg(d.name+'の攻撃をかわした');await wait(60);return}
  const dmg=Math.max(1,Math.round(d.atk*(0.85+Math.random()*0.3)-pDef()*0.6));
  msg(d.name+'の攻撃！ '+dmg+'のダメージ','bad');
  damagePlayer(dmg,d.name);
  if(d.drain&&!G.over&&Math.random()<0.3&&p.str>1){p.str--;msg('どくでちからが1さがった','bad')}
  await wait(80);
}
async function breath(m,d,dx,dy){
  msg(d.name+'は炎をはいた！','bad');
  const path=[];let x=m.x,y=m.y;
  for(let i=0;i<10;i++){x+=dx;y+=dy;path.push([x,y]);if(x===G.p.x&&y===G.p.y)break}
  await fly('🔥',path);
  const dmg=rint(12,18);msg(dmg+'のダメージ','bad');damagePlayer(dmg,d.name);
}
function damagePlayer(n,cause){
  const p=G.p;p.hp-=n;p.flash=performance.now();
  if(p.hp<=0){p.hp=0;gameOver(cause)}
}
async function fly(e,path){
  for(const [x,y] of path){G.proj={x,y,e};await wait(28)}
  G.proj=null;
}

// ---------- プレイヤーの行動 ----------
function attackMon(m){
  const d=MON[m.type];G.p.bump=performance.now();
  m.asleep=false;m.sleep=0;
  if(Math.random()<0.05){msg(d.name+'にかわされた');return}
  const dmg=Math.max(1,Math.round(pAtk()*(0.85+Math.random()*0.3)-d.def*0.5));
  hurtMon(m,dmg);
}
function hurtMon(m,dmg){
  const d=MON[m.type];m.hp-=dmg;m.flash=performance.now();m.asleep=false;
  msg(d.name+'に'+dmg+'のダメージ');
  if(m.hp<=0)killMon(m);
}
function killMon(m){
  const d=MON[m.type];m.dead=true;G.p.kills++;
  msg(d.name+'をたおした','good');
  if(m.stolen)dropItem(m.stolen,m.x,m.y);
  else if(Math.random()<0.18)dropItem(randomItem(G.floor),m.x,m.y);
  gainExp(d.exp);
}
function gainExp(n){
  const p=G.p;p.exp+=n;
  while(p.lv<NEXT.length&&p.exp>=NEXT[p.lv]){
    p.lv++;const g=rint(4,6);p.maxhp+=g;p.hp+=g;
    msg('レベル'+p.lv+'にあがった！','good');
  }
}
function tryMove(dx,dy){
  const p=G.p;p.dir=[dx,dy];
  if(G.turnMode){G.turnMode=false;updateHUD();return false}
  const nx=p.x+dx,ny=p.y+dy,m=monAt(nx,ny);
  if(m){if(!diagOK(p.x,p.y,dx,dy))return false;attackMon(m);return true}
  if(!walk(nx,ny)||!diagOK(p.x,p.y,dx,dy))return false;
  p.x=nx;p.y=ny;onStep();return true;
}
function onStep(){
  const p=G.p,f=G.f,it=itemAt(p.x,p.y);
  if(it){
    if(it.kind==='gold'){p.gold+=it.amount;removeFloorItem(it);msg(it.amount+'ゴールドをひろった','good')}
    else if(p.inv.length<INV_MAX){removeFloorItem(it);p.inv.push(it);msg(itemName(it)+'をひろった')}
    else msg(itemName(it)+'にのった。持ちものがいっぱいだ');
  }
  const t=trapAt(p.x,p.y);if(t)triggerTrap(t);
  if(f.stairs.x===p.x&&f.stairs.y===p.y&&!G.fall)G.stepStairs=true;
}
function triggerTrap(t){
  const p=G.p;t.seen=true;
  if(t.type==='pit'){msg('落とし穴だ！','bad');G.fall=true}
  else if(t.type==='gas'){msg('ねむりガスのワナだ！ ねむってしまった','bad');p.sleep=4}
  else{p.full=Math.max(0,p.full-10);msg('はらへりのワナだ！ おなかがへった','bad')}
}
function attackFront(){
  const p=G.p,[dx,dy]=p.dir,m=monAt(p.x+dx,p.y+dy);
  if(m&&diagOK(p.x,p.y,dx,dy)){attackMon(m);return true}
  p.bump=performance.now();
  for(const t of G.f.traps)if(!t.seen&&cheb(t,p)<=1){t.seen=true;msg(TRAPS[t.type]+'を見つけた')}
  return true;
}
function removeInv(it){
  const p=G.p,i=p.inv.indexOf(it);if(i>=0)p.inv.splice(i,1);
  if(p.weapon===it)p.weapon=null;if(p.shield===it)p.shield=null;
}
function removeFloorItem(it){const a=G.f.items,i=a.indexOf(it);if(i>=0)a.splice(i,1)}
function dropItem(it,x,y){
  const f=G.f;
  for(let r=0;r<=2;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){
    if(Math.max(Math.abs(dx),Math.abs(dy))!==r)continue;
    const nx=x+dx,ny=y+dy;
    if(!walk(nx,ny)||itemAt(nx,ny)||trapAt(nx,ny)||(f.stairs.x===nx&&f.stairs.y===ny))continue;
    it.x=nx;it.y=ny;it.seen=!!f.visible[ny*W+nx];f.items.push(it);return true;
  }
  msg(itemName(it)+'は消えてしまった');return false;
}
async function bolt(e){
  const p=G.p,[dx,dy]=p.dir;let x=p.x,y=p.y,hit=null;const path=[];
  for(let i=0;i<10;i++){
    const nx=x+dx,ny=y+dy;
    if(!walk(nx,ny)||!diagOK(x,y,dx,dy))break;
    x=nx;y=ny;path.push([x,y]);
    const m=monAt(x,y);if(m){hit=m;break}
  }
  await fly(e,path);
  return {hit,x,y};
}
function identifyMsg(it,verb){
  const before=itemName(it);G.known[it.kind][it.type]=true;const after=itemName(it);
  msg(before===after?after+'を'+verb:before+'を'+verb+'。'+after+'だった！');
}
async function useItem(it){
  const p=G.p;
  switch(it.kind){
    case 'grass':removeInv(it);identifyMsg(it,'飲んだ');await grassEffect(it.type);return true;
    case 'scroll':removeInv(it);identifyMsg(it,'読んだ');await scrollEffect(it.type);return true;
    case 'food':{removeInv(it);const fd=byId(FOODS,it.type);p.full=Math.min(p.maxfull,p.full+fd.full);msg(fd.name+'を食べた。おなかがふくれた','good');return true}
    case 'weapon':
      if(p.weapon===it){p.weapon=null;msg(itemName(it)+'をはずした')}else{p.weapon=it;msg(itemName(it)+'を装備した')}return true;
    case 'shield':
      if(p.shield===it){p.shield=null;msg(itemName(it)+'をはずした')}else{p.shield=it;msg(itemName(it)+'を装備した')}return true;
    case 'staff':return await zap(it);
  }
  return false;
}
async function grassEffect(t){
  const p=G.p;
  switch(t){
    case 'heal':
      if(p.hp>=p.maxhp){p.maxhp+=2;p.hp+=2;msg('最大HPが2ふえた','good')}
      else{const h=Math.min(30,p.maxhp-p.hp);p.hp+=h;msg('HPが'+h+'回復した','good')}break;
    case 'str':p.str++;p.maxstr=Math.max(p.maxstr,p.str);msg('ちからが1あがった','good');break;
    case 'fire':{const r=await bolt('🔥');if(r.hit)hurtMon(r.hit,20);else msg('炎は何にも当たらなかった');break}
    case 'sleep':p.sleep=5;msg('ねむってしまった','bad');break;
    case 'luck':p.exp=Math.max(p.exp,NEXT[Math.min(p.lv,NEXT.length-1)]);gainExp(0);break;
    case 'poison':p.str=Math.max(1,p.str-1);p.hp=Math.max(1,p.hp-5);msg('どくだ！ ちからが1さがった','bad');break;
  }
}
async function scrollEffect(t){
  const p=G.p,f=G.f;
  const seen=()=>f.monsters.filter(m=>!m.dead&&f.visible[m.y*W+m.x]);
  switch(t){
    case 'ident':{
      const c=p.inv.filter(i=>(i.kind==='grass'||i.kind==='scroll')&&!G.known[i.kind][i.type]);
      if(!c.length){msg('しかし、識別するものがなかった');break}
      const it=pick(c),before=itemName(it);G.known[it.kind][it.type]=true;
      msg(before+'は'+itemName(it)+'だった','good');break;
    }
    case 'light':
      f.lit=true;
      for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(f.tiles[y*W+x])for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(inb(x+dx,y+dy))f.explored[(y+dy)*W+x+dx]=1;
      computeFOV();msg('フロアのようすがわかった','good');break;
    case 'blast':{
      G.blastT=performance.now();const vs=seen();
      msg('大きな爆発が起きた！','bad');
      for(const m of vs)hurtMon(m,25);
      p.hp=Math.max(1,p.hp-5);p.flash=performance.now();msg('爆発にまきこまれて5のダメージ','bad');break;
    }
    case 'bind':{const vs=seen();vs.forEach(m=>{m.sleep=10;m.asleep=false});msg(vs.length?'まわりの敵が動けなくなった':'しかし何も起こらなかった');break}
    case 'wup':if(p.weapon){p.weapon.plus++;msg(itemName(p.weapon)+'になった','good')}else msg('武器を装備していなかった');break;
    case 'sup':if(p.shield){p.shield.plus++;msg(itemName(p.shield)+'になった','good')}else msg('盾を装備していなかった');break;
  }
}
async function zap(it){
  const name=byId(STAFFS,it.type).name;
  if(it.charges<=0){msg(name+'をふったが、何も起こらなかった');return true}
  it.charges--;msg(name+'をふった');
  const r=await bolt('✨');
  if(!r.hit){msg('魔法弾は何にも当たらなかった');return true}
  const m=r.hit,d=MON[m.type];
  if(it.type==='bolt')hurtMon(m,rint(16,22));
  else if(it.type==='blow'){
    const [dx,dy]=G.p.dir;
    for(let i=0;i<10;i++){const nx=m.x+dx,ny=m.y+dy;if(!canEnter(nx,ny))break;m.x=nx;m.y=ny}
    msg(d.name+'はふきとばされた');hurtMon(m,5);
  }else{m.sleep=12;m.asleep=false;msg(d.name+'はねむってしまった')}
  return true;
}
async function throwItem(it){
  removeInv(it);msg(itemName(it)+'を投げた');
  const r=await bolt(ICON[it.kind]);
  if(r.hit&&Math.random()<0.9){
    const m=r.hit,d=MON[m.type];
    if(it.kind==='grass'){
      if(it.type==='heal'){m.hp=Math.min(m.maxhp,m.hp+30);G.known.grass.heal=true;msg(d.name+'のHPが回復してしまった')}
      else if(it.type==='fire'){G.known.grass.fire=true;hurtMon(m,20)}
      else if(it.type==='sleep'){G.known.grass.sleep=true;m.sleep=10;msg(d.name+'はねむってしまった')}
      else if(it.type==='poison'){hurtMon(m,8)}
      else msg(d.name+'には効果がなかった');
      return true;
    }
    if(it.kind==='weapon'){hurtMon(m,byId(WEAPONS,it.type).pow+it.plus+2)}
    else hurtMon(m,2);
    if(it.kind==='weapon'||it.kind==='shield'||it.kind==='staff')dropItem(it,m.x,m.y);
    return true;
  }
  if(r.hit)msg(MON[r.hit.type].name+'にかわされた');
  dropItem(it,r.x,r.y);return true;
}
function placeItem(it){
  const p=G.p,f=G.f;
  if(itemAt(p.x,p.y)||(f.stairs.x===p.x&&f.stairs.y===p.y)){msg('ここには置けない');return false}
  removeInv(it);it.x=p.x;it.y=p.y;it.seen=true;f.items.push(it);
  msg(itemName(it)+'を足もとに置いた');return true;
}
function goDown(fell){
  if(G.floor>=MAXF){win();return}
  if(!fell)msg('階段を降りた');
  nextFloor();updateHUD();
}

// ---------- モーダル ----------
const ov=$('ov'),sheet=$('sheet');
function showModal(html,onKey){
  sheet.innerHTML=html;ov.hidden=false;modal={onKey};
  const f=sheet.querySelector('[data-focus]')||sheet.querySelector('.pri')||sheet.querySelector('button');
  if(f)f.focus({preventScroll:true});
}
function closeModal(){ov.hidden=true;sheet.innerHTML='';modal=null;updateHUD()}

function readBest(){try{return JSON.parse(localStorage.getItem(BEST_KEY)||'null')}catch(e){return null}}
function saveBest(won){
  try{
    const b=readBest()||{floor:0,clears:0};
    if(won)b.clears++;b.floor=Math.max(b.floor,won?MAXF:G.floor);
    localStorage.setItem(BEST_KEY,JSON.stringify(b));
  }catch(e){}
}
function recordBody(b){
  if(!b||!b.floor)return '<p>まだ記録がない。洞くつをおりると、いちばん深く到達した階が残る。</p>';
  return `<dl class="stats">
      <dt>最深到達</dt><dd>地下${b.floor}階${b.floor>=MAXF?'（出口）':''}</dd>
      <dt>脱出成功</dt><dd>${b.clears||0}回</dd>
    </dl>`;
}
function openRecord(){
  if(!G||G.busy||G.over||modal)return;
  renderRecord();
}
function renderRecord(){
  const b=readBest(),now=G.floor;
  const chase=!b||!b.floor?'':b.floor>=now?`記録更新まであと${b.floor-now+1}階。`:'記録を更新中。';
  showModal(`<h2>最高記録</h2>
    ${recordBody(b)}
    ${now?`<p class="best">いまは地下${now}階。${chase}</p>`:''}
    <div class="btnrow">
      <button class="pri" id="rClose" data-focus>とじる</button>
      ${b&&b.floor?'<button id="rClear">記録を消す</button>':''}
    </div>`,
    e=>{const k=e.key.length===1?e.key.toLowerCase():e.key;
      if(k==='Escape'||k==='v'){closeModal();return true}
      return false});
  $('rClose').onclick=closeModal;
  if($('rClear'))$('rClear').onclick=confirmClearRecord;
}
function confirmClearRecord(){
  showModal(`<h2>記録を消す</h2>
    <p>最深到達も脱出成功の回数も消える。元にはもどせない。いま潜っている洞くつはそのまま続く。</p>
    <div class="btnrow"><button class="pri" id="rKeep" data-focus>やめる</button><button id="rGo">消す</button></div>`,
    e=>{if(e.key==='Escape'){renderRecord();return true}return false});
  $('rKeep').onclick=renderRecord;
  $('rGo').onclick=()=>{
    try{localStorage.removeItem(BEST_KEY)}catch(e){}
    G.mark=G.seq;msg('記録を消した');
    renderRecord();
  };
}
function titleScreen(){
  const b=readBest();
  showModal(`<div class="title">
    <div class="lamp" aria-hidden="true">🏮</div>
    <h1>ともしび洞くつ</h1>
    <p class="sub">入るたびに形が変わる洞くつ。地下10階の出口をめざそう。</p>
    <dl class="howto">
      <dt>移動</dt><dd>矢印キー、WASD。斜めは Q E Z C（画面のボタンでもOK）</dd>
      <dt>攻撃</dt><dd>敵に向かって移動するか Space</dd>
      <dt>道具</dt><dd>I キー。草や巻物は使うまで正体がわからない</dd>
      <dt>満腹度</dt><dd>0になるとHPが減っていく。おにぎりで回復</dd>
      <dt>やられると</dt><dd>最初からやり直し。レベルも持ちものもなくなる</dd>
    </dl>
    ${b?`<p class="best">これまでの最高記録: 地下${b.floor}階${b.clears?`（脱出${b.clears}回）`:''}</p>`:''}
    <button class="pri" id="start">はじめる</button>
  </div>`,e=>{if(e.key==='Enter'||e.key===' '){start();return true}return false});
  $('start').onclick=start;
  function start(){closeModal();G.titleT=performance.now()}
}
function openStairs(){
  const last=G.floor>=MAXF;
  showModal(`<h2>${last?'出口の階段だ':'階段がある'}</h2>
    <p>${last?'外の光が見える。洞くつから脱出しますか？':'地下'+(G.floor+1)+'階へ降りますか？'}</p>
    <div class="btnrow"><button class="pri" id="sGo">${last?'脱出する':'降りる'}</button><button id="sNo">そのまま</button></div>`,
    e=>{if(e.key==='Enter'||e.key===' '){go();return true}if(e.key==='Escape'||e.key==='n'||e.key==='N'){closeModal();return true}return false});
  $('sGo').onclick=go;$('sNo').onclick=closeModal;
  function go(){closeModal();goDown(false)}
}
function mainLabel(it){
  const p=G.p;
  return {grass:'飲む',scroll:'読む',food:'食べる',staff:'ふる'}[it.kind]||((it===p.weapon||it===p.shield)?'はずす':'装備する');
}
function openInv(){
  if(!G||G.busy||G.over||modal)return;
  if(!G.p.inv.length){G.mark=G.seq;msg('持ちものは何もない');return}
  G.invSel=Math.min(G.invSel,G.p.inv.length-1);
  renderInv();
}
function renderInv(){
  const p=G.p,it=p.inv[G.invSel];
  const rows=p.inv.map((x,i)=>`<li><button class="row${i===G.invSel?' sel':''}" data-i="${i}"${i===G.invSel?' data-focus':''}><span class="ic">${ICON[x.kind]}</span><span>${esc(itemName(x))}</span>${x===p.weapon||x===p.shield?'<span class="eq">装備中</span>':''}</button></li>`).join('');
  showModal(`<div class="invhead"><h2>持ちもの</h2><span>${p.inv.length} / ${INV_MAX}</span></div>
    <ul class="inv">${rows}</ul>
    <p class="desc">${esc(itemDesc(it))}</p>
    <div class="btnrow">
      <button class="pri" data-a="use">${mainLabel(it)}</button>
      <button data-a="throw">投げる</button>
      <button data-a="drop">置く</button>
      <button data-a="close">とじる</button>
    </div>`,invKey);
  sheet.querySelectorAll('.row').forEach(b=>b.onclick=()=>{
    const i=+b.dataset.i;
    if(i===G.invSel&&matchMedia('(pointer:fine)').matches){doInv('use');return}
    G.invSel=i;renderInv();
  });
  sheet.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>doInv(b.dataset.a));
  const sel=sheet.querySelector('.row.sel');if(sel)sel.scrollIntoView({block:'nearest'});
}
function invKey(e){
  const k=e.key.length===1?e.key.toLowerCase():e.key,n=G.p.inv.length;
  if(k==='ArrowUp'||k==='w'||k==='k'){G.invSel=(G.invSel-1+n)%n;renderInv();return true}
  if(k==='ArrowDown'||k==='s'||k==='j'){G.invSel=(G.invSel+1)%n;renderInv();return true}
  if(k==='Enter'||k===' '){doInv('use');return true}
  if(k==='t'){doInv('throw');return true}
  if(k==='x'){doInv('drop');return true}
  if(k==='Escape'||k==='i'||k==='Tab'){closeModal();return true}
  return false;
}
function doInv(a){
  const it=G.p.inv[G.invSel];closeModal();
  if(a==='close'||!it)return;
  act(async()=>{
    if(a==='use')return await useItem(it);
    if(a==='throw')return await throwItem(it);
    if(a==='drop')return placeItem(it);
    return false;
  });
}
function gameOver(cause){
  if(G.over)return;
  G.over=true;msg('力つきた…','bad');saveBest(false);
  const how=cause==='はらぺこ'?'空腹で力つきた':cause==='落とし穴'?'落とし穴で力つきた':cause+'にたおされた';
  setTimeout(()=>endScreen(false,how),700);updateHUD();
}
function win(){G.over=true;saveBest(true);endScreen(true)}
function endScreen(won,how){
  const p=G.p,b=readBest();
  showModal(`<h2>${won?'脱出成功！':'ゲームオーバー'}</h2>
    <p>${won?'地下10階の出口から、ぶじに外へ出た。':'地下'+G.floor+'階で'+esc(how)+'。'}</p>
    <dl class="stats">
      <dt>レベル</dt><dd>${p.lv}</dd>
      <dt>ターン数</dt><dd>${G.turn}</dd>
      <dt>たおした敵</dt><dd>${p.kills}</dd>
      <dt>ゴールド</dt><dd>${p.gold}</dd>
      ${b?`<dt>最高記録</dt><dd>地下${b.floor}階${b.clears?`（脱出${b.clears}回）`:''}</dd>`:''}
    </dl>
    <button class="pri" id="again">もう一度あそぶ</button>`,
    e=>{if(e.key==='Enter'||e.key===' '){again();return true}return false});
  $('again').onclick=again;
  function again(){closeModal();newGame()}
}

// ---------- 入力 ----------
const KEYDIR={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0],
  w:[0,-1],s:[0,1],a:[-1,0],d:[1,0],q:[-1,-1],e:[1,-1],z:[-1,1],c:[1,1],
  k:[0,-1],j:[0,1],h:[-1,0],l:[1,0],y:[-1,-1],u:[1,-1],b:[-1,1],n:[1,1]};
const NUMPAD={Numpad1:[-1,1],Numpad2:[0,1],Numpad3:[1,1],Numpad4:[-1,0],Numpad6:[1,0],Numpad7:[-1,-1],Numpad8:[0,-1],Numpad9:[1,-1]};
let lastMove=0;
function face(d){if(!G||G.busy||G.over||modal)return;G.p.dir=d;G.turnMode=false;updateHUD()}
function move(d){act(()=>tryMove(d[0],d[1]))}
addEventListener('keydown',e=>{
  if(modal){if(modal.onKey&&modal.onKey(e))e.preventDefault();return}
  if(!G||G.over||e.metaKey||e.ctrlKey||e.altKey)return;
  const k=e.key.length===1?e.key.toLowerCase():e.key;
  const d=NUMPAD[e.code]||KEYDIR[k];
  if(d){
    e.preventDefault();
    const now=performance.now();if(now-lastMove<85)return;lastMove=now;
    if(e.shiftKey)face(d);else move(d);return;
  }
  if(e.code==='Numpad5'||k==='r'||k==='.'){e.preventDefault();act(()=>true);return}
  if(k===' '||k==='Enter'||k==='f'){e.preventDefault();act(attackFront);return}
  if(k==='i'||k==='Tab'){e.preventDefault();openInv();return}
  if(k==='m'){toggleMap();return}
  if(k==='v'){e.preventDefault();openRecord();return}
  if(k==='g'||k==='>'){e.preventDefault();stairsButton();return}
});
function toggleMap(){if(!G)return;G.showMap=!G.showMap;$('bMap').setAttribute('aria-pressed',G.showMap?'true':'false')}
function stairsButton(){if(!G||G.busy||G.over||modal||!onStairs())return;goDown(false)}
$('bAtk').onclick=()=>act(attackFront);
$('bInv').onclick=openInv;
$('bFace').onclick=()=>{if(!G||G.over)return;G.turnMode=!G.turnMode;updateHUD()};
$('bMap').onclick=toggleMap;
$('bRec').onclick=openRecord;
$('bStairs').onclick=stairsButton;
document.querySelectorAll('#pad button').forEach(btn=>{
  let t1=null,t2=null;
  const fire=()=>{if(btn.dataset.w)act(()=>true);else move(btn.dataset.d.split(',').map(Number))};
  const stop=()=>{clearTimeout(t1);clearInterval(t2);t1=t2=null;btn.classList.remove('down')};
  btn.addEventListener('pointerdown',e=>{
    e.preventDefault();btn.classList.add('down');fire();
    if(!btn.dataset.w&&!G?.turnMode)t1=setTimeout(()=>{t2=setInterval(fire,120)},320);
  });
  ['pointerup','pointerleave','pointercancel'].forEach(ev=>btn.addEventListener(ev,stop));
  btn.addEventListener('click',e=>{if(e.detail===0)fire()});
});

// ---------- 描画 ----------
function resize(){
  dpr=Math.min(2,window.devicePixelRatio||1);
  const avail=$('stage').clientWidth;
  const fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
  const maxH=window.innerHeight*(fine?0.64:0.5);
  tile=Math.max(18,Math.floor(Math.min(avail/VX,maxH/VY,54)));
  cw=tile*VX;chh=tile*VY;
  cv.style.width=cw+'px';cv.style.height=chh+'px';
  cv.width=Math.round(cw*dpr);cv.height=Math.round(chh*dpr);
}
addEventListener('resize',resize);
function glyph(e,x,y,size){
  ctx.font=size+'px '+EMOJI;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#fff';
  ctx.fillText(e,x,y+size*0.06);
}
function draw(now){
  const T=tile;
  ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.fillStyle=C.void;ctx.fillRect(0,0,cw,chh);
  if(!G||!G.f)return;
  const f=G.f,p=G.p,ox=p.x-(VX>>1),oy=p.y-(VY>>1);

  for(let vy=0;vy<VY;vy++)for(let vx=0;vx<VX;vx++){
    const x=ox+vx,y=oy+vy;if(!inb(x,y))continue;
    const i=y*W+x;if(!f.explored[i])continue;
    const px=vx*T,py=vy*T;
    if(f.tiles[i]){
      ctx.fillStyle=((x+y)&1)?C.floorA:C.floorB;ctx.fillRect(px,py,T,T);
      ctx.fillStyle=C.grout;ctx.fillRect(px,py+T-1,T,1);ctx.fillRect(px+T-1,py,1,T);
      const h=hash(x,y);
      if(h%5===0){ctx.fillStyle=C.pebble;ctx.fillRect(px+3+((h>>4)%(T-8)),py+3+((h>>11)%(T-8)),2,2)}
      if(f.stairs.x===x&&f.stairs.y===y){
        ctx.fillStyle=C.stairBg;ctx.fillRect(px+T*.12,py+T*.12,T*.76,T*.76);
        ctx.fillStyle=C.stair;
        for(let s=0;s<4;s++)ctx.fillRect(px+T*.12,py+T*.2+s*T*.16,T*.76*(1-s*0.22),Math.max(2,T*.08));
      }
      const tr=trapAt(x,y);
      if(tr&&tr.seen){
        ctx.strokeStyle=C.trap;ctx.lineWidth=2;ctx.beginPath();
        ctx.moveTo(px+T/2,py+T*.25);ctx.lineTo(px+T*.75,py+T/2);ctx.lineTo(px+T/2,py+T*.75);ctx.lineTo(px+T*.25,py+T/2);ctx.closePath();ctx.stroke();
      }
    }else{
      ctx.fillStyle=C.wall;ctx.fillRect(px,py,T,T);
      if(walk(x,y+1)){
        const fy=py+T*0.4,fh=T*0.6;
        ctx.fillStyle=C.wallFace;ctx.fillRect(px,fy,T,fh);
        ctx.fillStyle=C.wallLine;
        ctx.fillRect(px,fy,T,1);ctx.fillRect(px,fy+fh/2,T,1);
        const off=(x&1)?T*0.5:0;
        ctx.fillRect(px+((T*0.3+off)%T),fy,1,fh/2);ctx.fillRect(px+((T*0.8+off)%T),fy+fh/2,1,fh/2);
      }else{ctx.fillStyle=C.wallTop;ctx.fillRect(px+1,py+1,T-2,T-2)}
    }
    if(!f.visible[i]){ctx.fillStyle='rgba(8,6,16,0.55)';ctx.fillRect(px,py,T,T)}
  }

  for(const it of f.items){
    if(!it.seen)continue;
    const vx=it.x-ox,vy=it.y-oy;if(vx<0||vy<0||vx>=VX||vy>=VY)continue;
    ctx.globalAlpha=f.visible[it.y*W+it.x]?1:0.5;
    glyph(ICON[it.kind],vx*T+T/2,vy*T+T/2,T*0.6);
    ctx.globalAlpha=1;
  }

  for(const m of f.monsters){
    if(m.dead||!f.visible[m.y*W+m.x])continue;
    const vx=m.x-ox,vy=m.y-oy;if(vx<0||vy<0||vx>=VX||vy>=VY)continue;
    let cx=vx*T+T/2,cy=vy*T+T/2;
    const bt=now-m.bump;if(bt<150){const k=Math.sin(bt/150*Math.PI)*T*0.25;cx+=m.bdx*k;cy+=m.bdy*k}
    const fl=now-m.flash<280;
    if(fl){ctx.fillStyle='rgba(236,118,99,0.35)';ctx.fillRect(vx*T+2,vy*T+2,T-4,T-4)}
    if(!(fl&&((now/60)|0)%2))glyph(MON[m.type].e,cx,cy,T*0.76);
    if(m.hp<m.maxhp){
      ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillRect(vx*T+T*.15,vy*T+T*.9,T*.7,3);
      ctx.fillStyle='#ec7663';ctx.fillRect(vx*T+T*.15,vy*T+T*.9,T*.7*Math.max(0,m.hp/m.maxhp),3);
    }
    if(m.asleep||m.sleep>0){
      ctx.fillStyle='#cfe3ff';ctx.font=Math.round(T*0.34)+'px '+FONT;ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillText('z',vx*T+T*0.84,vy*T+T*0.2+Math.sin(now/300)*2);
    }
  }

  // プレイヤー
  const pvx=(VX>>1)*T,pvy=(VY>>1)*T;
  let pcx=pvx+T/2,pcy=pvy+T/2;
  const pbt=now-p.bump;if(pbt<150){const k=Math.sin(pbt/150*Math.PI)*T*0.25;pcx+=p.dir[0]*k;pcy+=p.dir[1]*k}
  if(!(now-p.flash<280&&((now/60)|0)%2))glyph('🧙',pcx,pcy,T*0.78);
  {
    const [dx,dy]=p.dir,len=Math.hypot(dx,dy),ux=dx/len,uy=dy/len;
    const tx=pvx+T/2+ux*T*0.47,ty=pvy+T/2+uy*T*0.47,s=T*0.1;
    ctx.fillStyle='#f0c05a';ctx.beginPath();
    ctx.moveTo(tx+ux*s,ty+uy*s);ctx.lineTo(tx-uy*s-ux*s,ty+ux*s-uy*s);ctx.lineTo(tx+uy*s-ux*s,ty-ux*s-uy*s);ctx.closePath();ctx.fill();
  }
  if(p.sleep>0){ctx.fillStyle='#cfe3ff';ctx.font=Math.round(T*0.34)+'px '+FONT;ctx.textAlign='center';ctx.fillText('z',pvx+T*0.84,pvy+T*0.2)}

  if(G.proj){
    const vx=G.proj.x-ox,vy=G.proj.y-oy;
    if(vx>=0&&vy>=0&&vx<VX&&vy<VY)glyph(G.proj.e,vx*T+T/2,vy*T+T/2,T*0.62);
  }

  // ランタンの明かり（ゆらぎ）
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const flick=reduce?1:1+0.035*Math.sin(now/170)+0.02*Math.sin(now/53);
  const lx=pvx+T/2,ly=pvy+T/2,inRoom=roomOf(p.x,p.y)>=0;
  const g=ctx.createRadialGradient(lx,ly,(inRoom?T*2.6:T*0.9)*flick,lx,ly,(inRoom?T*9:T*2.5)*flick);
  g.addColorStop(0,'rgba(9,7,16,0)');g.addColorStop(1,inRoom?'rgba(9,7,16,0.5)':'rgba(9,7,16,0.9)');
  ctx.fillStyle=g;ctx.fillRect(0,0,cw,chh);
  const w=ctx.createRadialGradient(lx,ly,0,lx,ly,T*3.2*flick);
  w.addColorStop(0,'rgba(255,186,100,0.17)');w.addColorStop(1,'rgba(255,186,100,0)');
  ctx.fillStyle=w;ctx.fillRect(0,0,cw,chh);

  if(now-p.flash<260){ctx.fillStyle=`rgba(200,40,30,${0.28*(1-(now-p.flash)/260)})`;ctx.fillRect(0,0,cw,chh)}
  if(G.blastT&&now-G.blastT<320){ctx.fillStyle=`rgba(255,230,190,${0.6*(1-(now-G.blastT)/320)})`;ctx.fillRect(0,0,cw,chh)}

  // ミニマップ
  if(G.showMap){
    const s=Math.max(2,Math.floor(cw*0.4/W)),mx0=8,my0=8;
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){
      const i=y*W+x;if(!f.explored[i]||!f.tiles[i])continue;
      ctx.fillStyle='rgba(215,210,240,0.32)';ctx.fillRect(mx0+x*s,my0+y*s,s,s);
    }
    ctx.strokeStyle='#f0c05a';ctx.lineWidth=1;
    if(f.explored[f.stairs.y*W+f.stairs.x])ctx.strokeRect(mx0+f.stairs.x*s+0.5,my0+f.stairs.y*s+0.5,s,s);
    for(const it of f.items)if(it.seen){ctx.fillStyle='#6fd3e0';ctx.fillRect(mx0+it.x*s,my0+it.y*s,s,s)}
    for(const t of f.traps)if(t.seen){ctx.fillStyle='#ec7663';ctx.fillRect(mx0+t.x*s,my0+t.y*s,s,s)}
    for(const m of f.monsters)if(!m.dead&&f.visible[m.y*W+m.x]){ctx.fillStyle='#ff5a47';ctx.fillRect(mx0+m.x*s,my0+m.y*s,s,s)}
    if(reduce||((now/400)|0)%2===0){ctx.fillStyle='#ffe08a';ctx.fillRect(mx0+p.x*s-1,my0+p.y*s-1,s+2,s+2)}
  }

  // フロア名の表示
  const el=now-G.titleT;
  if(el<1400&&!modal){
    const a=el<600?1:1-(el-600)/800;
    ctx.fillStyle=`rgba(9,7,16,${a})`;ctx.fillRect(0,0,cw,chh);
    ctx.fillStyle=`rgba(236,230,214,${a})`;ctx.font=Math.round(T*0.9)+'px '+FONT;ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText('地下'+G.floor+'階',cw/2,chh/2);
  }
}
function frame(t){draw(t);requestAnimationFrame(frame)}

// ---------- 起動 ----------
resize();
newGame();
titleScreen();
requestAnimationFrame(frame);
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{});
})();
