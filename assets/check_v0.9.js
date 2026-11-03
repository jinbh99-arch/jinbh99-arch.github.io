/* 우리아이레벨테스트 v0.9 · 2026-11-04
   첫 화면: 학년을 고르면 수학 '꼭 할 수 있어야 하는 것'을 하나씩 확인하고, 막힌 곳은 이전 학년 개념으로 안내한다.
   확인 결과는 이 브라우저에만 잠시 저장한다(서버 전송 없음). */
(function(){'use strict';
 var Q0=new URLSearchParams(location.search);
 var gbox=document.getElementById('grade-pick'),list=document.getElementById('check-list'),sum=document.getElementById('check-summary'),head=document.getElementById('check-head');
 var D=null,cur=0,state={};
 var LV=[['good','잘해요','✅'],['unsure','헷갈려요','🤔'],['no','아직 몰라요','❗']];
 function el(t,c,x){var n=document.createElement(t);if(c)n.className=c;if(x!==undefined)n.textContent=String(x);return n}
 function load(g){try{return JSON.parse(localStorage.getItem('uriai-check-'+g)||'{}')||{}}catch(e){return{}}}
 function save(g){try{localStorage.setItem('uriai-check-'+g,JSON.stringify(state))}catch(e){}}
 function J(u){return fetch(u,{cache:'no-cache'}).then(function(r){if(!r.ok)throw Error(u);return r.json()})}
 function items(g){return D.items.filter(function(x){return x.grade===g})}
 function curLink(g,s){return './curriculum.html?grade='+g+'&subject=math'}
 function card(it,n){
  var c=el('article','ck');c.id='ck-'+it.id;c.dataset.id=it.id;
  var top=el('div','ck-top');top.append(el('span','ck-n',n),el('span','ck-tag',it.semester+'학기 · '+it.unit));c.append(top);
  c.append(el('h3','ck-can',it.can_do));
  var q=el('div','ck-q');q.append(el('b','','아이에게 물어보세요'),el('p','',it.question));
  var ab=el('button','ck-ans-btn','정답 보기');ab.type='button';ab.setAttribute('aria-expanded','false');var ans=el('p','ck-ans','정답: '+it.answer);ans.hidden=true;ans.id='ans-'+it.id;ab.setAttribute('aria-controls',ans.id);
  ab.addEventListener('click',function(){ans.hidden=!ans.hidden;ab.setAttribute('aria-expanded',String(!ans.hidden));ab.textContent=ans.hidden?'정답 보기':'정답 숨기기'});
  q.append(ab,ans);c.append(q);
  var btns=el('div','ck-lv');btns.setAttribute('role','group');btns.setAttribute('aria-label','아이가 어땠나요?');
  LV.forEach(function(l){var b=el('button','lv lv-'+l[0]);b.type='button';b.dataset.lv=l[0];b.append(el('span','',l[2]+' '),document.createTextNode(l[1]));b.setAttribute('aria-pressed',String(state[it.id]===l[0]));
   b.addEventListener('click',function(){state[it.id]=state[it.id]===l[0]?undefined:l[0];if(!state[it.id])delete state[it.id];save(cur);paint(c,it);summary()});btns.append(b)});
  c.append(btns);
  var help=el('div','ck-help');help.hidden=true;
  var p=it.prereq;var hp=el('p','');hp.append(el('b','','막혔다면 · '),document.createTextNode(p.grade+'학년 '+p.semester+'학기 「'+p.unit+'」부터 확인해요. '+p.tip));help.append(hp);
  var hm=el('p','');hm.append(el('b','','집에서 5분 · '),document.createTextNode(it.home));help.append(hm);
  var lk=el('a','more','「'+p.unit+'」 단원 설명 보기 →');lk.href='./curriculum.html?grade='+p.grade+'&subject=math';help.append(lk);
  c.append(help);
  var std=el('details','ck-std');std.append(el('summary','','근거: 관련 성취기준 '+it.standards.length+'개'));var ul=el('ul');it.standards.forEach(function(s){var li=el('li');li.append(el('b','',s.code+' '),document.createTextNode(s.text));ul.append(li)});std.append(ul);c.append(std);
  paint(c,it);return c}
 function paint(c,it){var v=state[it.id];[].forEach.call(c.querySelectorAll('.lv'),function(b){b.setAttribute('aria-pressed',String(b.dataset.lv===v))});c.dataset.lv=v||'';c.querySelector('.ck-help').hidden=!(v==='unsure'||v==='no')}
 function summary(){
  var L=items(cur),done=L.filter(function(x){return state[x.id]}),good=L.filter(function(x){return state[x.id]==='good'}),need=L.filter(function(x){return state[x.id]==='unsure'||state[x.id]==='no'});
  sum.replaceChildren();sum.hidden=false;
  var bar=el('div','sbar');var i=el('i');i.style.width=Math.round(done.length/L.length*100)+'%';bar.append(i);
  sum.append(el('h3','',cur+'학년 수학 확인 '+done.length+' / '+L.length),bar);
  if(!done.length){sum.append(el('p','','아래 항목마다 아이에게 질문해 보고 “잘해요 · 헷갈려요 · 아직 몰라요”를 눌러 주세요.'));return}
  var p=el('p','');p.textContent='잘해요 '+good.length+'개 · 다시 볼 것 '+need.length+'개';sum.append(p);
  if(need.length){var ul=el('ul','need');need.forEach(function(x){var li=el('li');var a=el('a','',x.can_do);a.href='#ck-'+x.id;li.append(a,el('small','',' → '+x.prereq.grade+'학년 「'+x.prereq.unit+'」부터'));ul.append(li)});sum.append(el('b','','먼저 다시 볼 것'),ul)}
  else if(done.length===L.length){sum.append(el('p','ok','모두 잘하고 있어요! '+(cur<6?(cur+1)+'학년 항목도 미리 확인해 볼까요?':'초등 수학 핵심을 잘 마무리했어요.')));if(cur<6){var nb=el('button','obtn',(cur+1)+'학년 미리 보기');nb.type='button';nb.addEventListener('click',function(){pick(cur+1,true)});sum.append(nb)}}
  var rs=el('button','linkbtn','이 학년 확인 기록 지우기');rs.type='button';rs.addEventListener('click',function(){state={};save(cur);render()});sum.append(rs);
 }
 function render(){var L=items(cur);head.replaceChildren(el('h2','',cur+'학년 수학, 이것만은 할 수 있어야 해요'),el('p','lead','항목 '+L.length+'개 · 질문은 아이에게 말로 물어보면 돼요. 시험이 아니라 대화로 확인하는 거예요.'));
  list.replaceChildren.apply(list,L.map(function(it,i){return card(it,i+1)}));summary()}
 function pick(g,scroll){cur=g;state=load(g);[].forEach.call(gbox.querySelectorAll('button'),function(b){b.setAttribute('aria-pressed',String(Number(b.dataset.grade)===g))});
  try{history.replaceState(null,'','?grade='+g)}catch(e){}render();if(scroll){try{head.scrollIntoView({behavior:'smooth',block:'start'})}catch(e){head.scrollIntoView()}}}
 // 교재 내용으로 학년 찾기
 var fi=document.getElementById('find-input'),fr=document.getElementById('find-result'),F=null;
 function norm(s){return String(s).toLowerCase().replace(/\s+/g,'')}
 function find(q){var n=norm(q);if(!n||!F){fr.replaceChildren();return}
  var R=F.entries.map(function(e){var sc=0;if(norm(e.u).indexOf(n)>=0)sc=3;else if(e.k.some(function(k){return norm(k).indexOf(n)>=0||n.indexOf(norm(k))>=0&&norm(k).length>=2}))sc=2;else if(norm(e.t).indexOf(n)>=0)sc=1;return [sc,e]}).filter(function(x){return x[0]>0}).sort(function(a,b){return b[0]-a[0]||(a[1].sid==='math'?-1:0)-(b[1].sid==='math'?-1:0)||a[1].g-b[1].g||a[1].m-b[1].m}).slice(0,8);
  fr.replaceChildren();var st=el('p','muted',R.length?('“'+q+'” 관련 단원 '+R.length+'개'+(R.length===8?' (상위 8개)':'')):('“'+q+'”와 맞는 단원을 찾지 못했어요. 다른 말로 찾아보세요.'));st.setAttribute('role','status');fr.append(st);
  R.forEach(function(x){var e=x[1];var a=el('a','fitem');a.href='./curriculum.html?grade='+e.g+'&subject='+e.sid;a.append(el('span','fg',e.g+'학년 '+e.m+'학기'),el('b','',e.s+' · '+e.u),el('span','ft',e.t));fr.append(a)})}
 if(fi){var tm;fi.addEventListener('input',function(){clearTimeout(tm);tm=setTimeout(function(){find(fi.value)},120)});
  [].forEach.call(document.querySelectorAll('.fchip'),function(b){b.addEventListener('click',function(){fi.value=b.textContent;find(fi.value);fi.focus()})})}
 Promise.all([J('./data/math_checks_v1.0.json'),J('./data/find_index_v1.0.json')]).then(function(r){D=r[0];F=r[1];
  [].forEach.call(gbox.querySelectorAll('button'),function(b){b.addEventListener('click',function(){pick(Number(b.dataset.grade),true)})});
  var g=Number(Q0.get('grade'));if(Number.isInteger(g)&&g>=1&&g<=6)pick(g,false);
  var fq=Q0.get('find');if(fq&&fi&&fq.length<30){fi.value=fq;find(fq)}
  window.uriaiCheck={pick:pick,find:find};
 }).catch(function(){var p=el('p','err','점검 항목을 불러오지 못했습니다. 잠시 후 새로고침해 주세요.');p.setAttribute('role','alert');list.replaceChildren(p)});
})();
