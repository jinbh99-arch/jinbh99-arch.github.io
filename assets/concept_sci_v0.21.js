/* 우리아이레벨테스트 과학 개념 연결 v0.21 · 2026-11-04 (v0.20 기준: 과학 개념 연결 v1.2 자료 — 성취기준 문구 별책 9, 영역은 경기도교육청 연결표) — 먼저 알아야 할 단원은 나무 모양, 같은 주제로 이어지는 단원은 따로 보여 준다. */
(function(){'use strict';
var D,N={},PRE={},NEXT={},TH={},THB={};var pick=document.getElementById('cg-pick'),tree=document.getElementById('cg-tree'),nx=document.getElementById('cg-next');
function el(t,c,x){var n=document.createElement(t);if(c)n.className=c;if(x!==undefined)n.textContent=String(x);return n}
function band(g){return g<=2?'b12':g<=4?'b34':'b56'}
function node(n,why,root,seen){var d=el('div','cg-node '+band(n.grade)+(root?' cg-root':''));d.append(el('span','cg-g',n.grade+'학년 '+n.semester+'학기 · '+n.domains[0]),el('b','',n.unit));if(root)d.append(el('span','cg-w',n.ai_what));if(why)d.append(el('span','cg-w','왜: '+why));if(seen)d.append(el('span','cg-seen','↑ 위에 이미 나왔어요'));return d}
function build(id,depth,max,seen,why,root){var li=el('li');var n=N[id];var dup=seen[id];li.append(node(n,why,root,dup&&!root));if(dup&&!root)return li;seen[id]=1;
 var ps=PRE[id]||[];if(ps.length){if(depth<max){var ul=el('ul');ps.forEach(function(e){ul.append(build(e.from,depth+1,max,seen,e.why,false))});li.append(ul)}else{var b=el('button','cg-more','먼저 알아야 할 것 '+ps.length+'개 더 보기 ▾');b.type='button';b.addEventListener('click',function(){var ul=el('ul');ps.forEach(function(e){ul.append(build(e.from,0,2,seen,e.why,false))});b.replaceWith(ul)});li.append(b)}}
 else if(!root){li.lastChild.append(el('span','cg-w','· 앞 단원 없이 시작할 수 있는 단원이에요'))}else{li.lastChild.append(el('span','cg-w','· 과학 안에서 먼저 알아야 할 단원은 따로 없어요. 1~2학년 슬기로운 생활과 생활 경험이 바탕이에요'))}return li}
function chips(h,L,f){if(!L.length)return;nx.append(el('h2','',h));var c=el('div','cg-chips');L.forEach(function(e){var t=N[f(e)];var b=el('button','',t.grade+'-'+t.semester+' '+t.unit);b.type='button';b.title=e.why;b.addEventListener('click',function(){pick.value=t.id;show(t.id);window.scrollTo(0,0)});c.append(b)});nx.append(c)}
function show(id){var ul=el('ul');ul.append(build(id,0,2,{},null,true));tree.replaceChildren(ul);
 nx.replaceChildren();chips('이 단원을 바탕으로 배우는 단원',NEXT[id]||[],function(e){return e.to});chips('같은 주제의 앞 단원',THB[id]||[],function(e){return e.from});chips('같은 주제로 이어지는 다음 단원',TH[id]||[],function(e){return e.to});
 try{history.replaceState(null,'','?u='+id)}catch(e){}}
fetch('./data/science_graph_v1.2.json').then(function(r){return r.json()}).then(function(d){D=d;d.nodes.forEach(function(n){N[n.id]=n;var o=el('option','',n.grade+'학년 '+n.semester+'학기 · '+n.unit);o.value=n.id;pick.append(o)});
 d.edges.forEach(function(e){if(e.type==='pre'){(PRE[e.to]=PRE[e.to]||[]).push(e);(NEXT[e.from]=NEXT[e.from]||[]).push(e)}else{(TH[e.from]=TH[e.from]||[]).push(e);(THB[e.to]=THB[e.to]||[]).push(e)}});
 document.querySelector('.cg-note').textContent=d.note;pick.addEventListener('change',function(){show(pick.value)});
 var qs=new URLSearchParams(location.search),q=qs.get('u'),k=qs.get('k');var byk=d.nodes.filter(function(n){return n.key===k})[0];if(byk)q=byk.id;var start=N[q]?q:d.nodes.filter(function(n){return n.grade===5&&n.semester===2&&n.unit==='날씨와 우리 생활'})[0].id;pick.value=start;show(start)})})();