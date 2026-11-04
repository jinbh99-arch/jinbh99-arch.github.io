/* 우리아이레벨테스트 수학 개념 연결 v0.14 · 2026-11-04 (수학 개념 연결 v1.0 자료 사용) — 단원을 고르면 먼저 알아야 할 단원을 나무 모양으로 보여 준다. */
(function(){'use strict';
var D,N={},PRE={},NEXT={};var pick=document.getElementById('cg-pick'),tree=document.getElementById('cg-tree'),nx=document.getElementById('cg-next');
function el(t,c,x){var n=document.createElement(t);if(c)n.className=c;if(x!==undefined)n.textContent=String(x);return n}
function band(g){return g<=2?'b12':g<=4?'b34':'b56'}
function node(n,why,root,seen){var d=el('div','cg-node '+band(n.grade)+(root?' cg-root':''));d.append(el('span','cg-g',n.grade+'학년 '+n.semester+'학기'),el('b','',n.unit));if(why)d.append(el('span','cg-w','왜: '+why));if(seen)d.append(el('span','cg-seen','↑ 위에 이미 나왔어요'));return d}
function build(id,depth,max,seen,why,root){var li=el('li');var n=N[id];var dup=seen[id];li.append(node(n,why,root,dup&&!root));if(dup&&!root)return li;seen[id]=1;
 var ps=PRE[id]||[];if(ps.length){if(depth<max){var ul=el('ul');ps.forEach(function(e){ul.append(build(e.from,depth+1,max,seen,e.why,false))});li.append(ul)}else{var b=el('button','cg-more','먼저 알아야 할 것 '+ps.length+'개 더 보기 ▾');b.type='button';b.addEventListener('click',function(){var ul=el('ul');ps.forEach(function(e){ul.append(build(e.from,0,2,seen,e.why,false))});b.replaceWith(ul)});li.append(b)}}
 else if(!root){li.lastChild.append(el('span','cg-w','· 초등 수학의 출발 단원이에요'))}return li}
function show(id){var ul=el('ul');ul.append(build(id,0,2,{},null,true));tree.replaceChildren(ul);
 nx.replaceChildren();var ns=NEXT[id]||[];if(ns.length){nx.append(el('h2','','이 단원 다음에 이어지는 단원'));var c=el('div','cg-chips');ns.forEach(function(e){var b=el('button','',N[e.to].grade+'-'+N[e.to].semester+' '+N[e.to].unit);b.type='button';b.addEventListener('click',function(){pick.value=e.to;show(e.to);window.scrollTo(0,0)});c.append(b)});nx.append(c)}
 try{history.replaceState(null,'','?u='+id)}catch(e){}}
fetch('./data/math_graph_v1.0.json').then(function(r){return r.json()}).then(function(d){D=d;d.nodes.forEach(function(n){N[n.id]=n;var o=el('option','',n.grade+'학년 '+n.semester+'학기 · '+n.unit);o.value=n.id;pick.append(o)});
 d.edges.forEach(function(e){(PRE[e.to]=PRE[e.to]||[]).push(e);(NEXT[e.from]=NEXT[e.from]||[]).push(e)});
 document.querySelector('.cg-note').textContent=d.note;pick.addEventListener('change',function(){show(pick.value)});
 var qs=new URLSearchParams(location.search),q=qs.get('u'),k=qs.get('k');var byk=d.nodes.filter(function(n){return n.key===k})[0];if(byk)q=byk.id;var start=N[q]?q:d.nodes.filter(function(n){return n.grade===5&&n.semester===1&&n.unit==='분수의 덧셈과 뺄셈'})[0].id;pick.value=start;show(start)})})();