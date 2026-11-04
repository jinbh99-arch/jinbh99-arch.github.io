/* 우리아이레벨테스트 v0.21 · 2026-11-04 (v0.19 기준: 과학 점검 자료 v1.1)
   첫 화면: 과목(수학·국어·영어·과학)과 학년을 고르면 '꼭 할 수 있어야 하는 것'을 하나씩 확인하고, 막힌 곳은 이전 학년 단원으로 안내한다.
   확인 결과는 이 브라우저에만 잠시 저장한다(서버 전송 없음). */
(function(){'use strict';
 var Q0=new URLSearchParams(location.search);
 var sbox=document.getElementById('subj-pick'),gbox=document.getElementById('grade-pick'),list=document.getElementById('check-list'),sum=document.getElementById('check-summary'),head=document.getElementById('check-head');
 var DD={},D=null,subj='math',cur=0,state={};var SN={math:'수학',korean:'국어',english:'영어',science:'과학'};var EN={math:'는',korean:'는',english:'는',science:'은'};
 var LV=[['good','잘해요','✅'],['unsure','헷갈려요','🤔'],['no','아직 몰라요','❗']];
 function el(t,c,x){var n=document.createElement(t);if(c)n.className=c;if(x!==undefined)n.textContent=String(x);return n}
 function key(g){return 'uriai-check-'+(subj==='math'?'':subj+'-')+g}
 function load(g){try{return JSON.parse(localStorage.getItem(key(g))||'{}')||{}}catch(e){return{}}}
 function save(g){try{localStorage.setItem(key(g),JSON.stringify(state))}catch(e){}}
 function J(u){return fetch(u,{cache:'no-cache'}).then(function(r){if(!r.ok)throw Error(u);return r.json()})}
 function items(g){return D.items.filter(function(x){return x.grade===g})}
 function card(it,n){
  var c=el('article','ck');c.id='ck-'+it.id;c.dataset.id=it.id;
  var top=el('div','ck-top');top.append(el('span','ck-n',n),el('span','ck-tag',it.tag||(it.semester+'학기 · '+it.unit)));c.append(top);
  c.append(el('h3','ck-can',it.can_do));
  var q=el('div','ck-q');q.append(el('b','','아이에게 물어보세요'),el('p','',it.question));
  var AL=D.labels.answer||'정답';var IL=window.URIAI_ILL||{};var BL=AL+(IL[it.id]?'·그림':'');var ab=el('button','ck-ans-btn',BL+' 보기');ab.type='button';ab.setAttribute('aria-expanded','false');
  var box=el('div','ck-more');box.hidden=true;box.id='more-'+it.id;ab.setAttribute('aria-controls',box.id);
  if(IL[it.id]){var fg=el('figure','ck-fig');fg.innerHTML=IL[it.id];fg.append(el('figcaption','','그림을 보여 주며 물어봐도 좋아요'));box.append(fg)}
  var ans=el('p','ck-ans',AL+': '+it.answer);box.append(ans);
  ab.addEventListener('click',function(){box.hidden=!box.hidden;ab.setAttribute('aria-expanded',String(!box.hidden));ab.textContent=BL+(box.hidden?' 보기':' 숨기기')});
  q.append(ab,box);c.append(q);
  var btns=el('div','ck-lv');btns.setAttribute('role','group');btns.setAttribute('aria-label','아이가 어땠나요?');
  LV.forEach(function(l){var b=el('button','lv lv-'+l[0]);b.type='button';b.dataset.lv=l[0];b.append(el('span','',l[2]+' '),document.createTextNode(l[1]));b.setAttribute('aria-pressed',String(state[it.id]===l[0]));
   b.addEventListener('click',function(){state[it.id]=state[it.id]===l[0]?undefined:l[0];if(!state[it.id])delete state[it.id];save(cur);paint(c,it);summary()});btns.append(b)});
  c.append(btns);
  var help=el('div','ck-help');help.hidden=true;
  var p=it.prereq;var hp=el('p','');hp.append(el('b','','막혔다면 · '),document.createTextNode(p.label?(p.grade+'학년 「'+p.label+'」부터 확인해요. '+p.tip):p.same_unit?('「'+p.unit+'」 단원 설명을 함께 보며 확인해요. '+p.tip):(p.grade+'학년 '+p.semester+'학기 「'+p.unit+'」부터 확인해요. '+p.tip)));help.append(hp);
  var hm=el('p','');hm.append(el('b','','집에서 5분 · '),document.createTextNode(it.home));help.append(hm);
  var lk=el('a','more',p.link_text||('「'+p.unit+'」 단원 설명 보기 →'));lk.href=p.href||('./curriculum.html?grade='+p.grade+'&subject='+subj);help.append(lk);
  if(subj==='math'||subj==='science'){var ck=el('a','more cg-link','🌳 이 단원 앞에 알아야 할 것 모두 보기 →');ck.href='./concept-'+subj+'.html?k='+encodeURIComponent(it.grade+'-'+it.semester+' '+it.unit);help.append(ck)}
  c.append(help);
  var std=el('details','ck-std');std.append(el('summary','','근거: 관련 성취기준 '+it.standards.length+'개'));var ul=el('ul');it.standards.forEach(function(s){var li=el('li');li.append(el('b','',s.code+' '),document.createTextNode(s.text));ul.append(li)});std.append(ul);c.append(std);
  var er=el('a','ck-err','이 문항 오류 알리기');er.href='mailto:uriailevel@gmail.com?subject='+encodeURIComponent('[오류 알림] '+it.id+' '+it.can_do)+'&body='+encodeURIComponent('문항: '+it.id+' ('+(it.tag||(it.grade+'학년 '+it.semester+'학기 · '+it.unit))+')\n질문: '+it.question+'\n\n어떤 점이 틀렸거나 어색한지 적어 주세요:\n');c.append(er);
  paint(c,it);return c}
 function paint(c,it){var v=state[it.id];[].forEach.call(c.querySelectorAll('.lv'),function(b){b.setAttribute('aria-pressed',String(b.dataset.lv===v))});c.dataset.lv=v||'';c.querySelector('.ck-help').hidden=!(v==='unsure'||v==='no')}
 function summary(){
  var L=items(cur),done=L.filter(function(x){return state[x.id]}),good=L.filter(function(x){return state[x.id]==='good'}),need=L.filter(function(x){return state[x.id]==='unsure'||state[x.id]==='no'});
  sum.replaceChildren();sum.hidden=false;
  var bar=el('div','sbar');var i=el('i');i.style.width=Math.round(done.length/L.length*100)+'%';bar.append(i);
  sum.append(el('h3','',cur+'학년 '+SN[subj]+' 확인 '+done.length+' / '+L.length),bar);
  if(!done.length){sum.append(el('p','','아래 항목마다 아이에게 질문해 보고 “잘해요 · 헷갈려요 · 아직 몰라요”를 눌러 주세요.'));return}
  var p=el('p','');p.textContent='잘해요 '+good.length+'개 · 다시 볼 것 '+need.length+'개';sum.append(p);
  if(need.length){var ul=el('ul','need');need.forEach(function(x){var li=el('li');var a=el('a','',x.can_do);a.href='#ck-'+x.id;li.append(a,el('small','',x.prereq.same_unit?' → 「'+x.prereq.unit+'」 단원 설명':' → '+x.prereq.grade+'학년 「'+(x.prereq.label||x.prereq.unit)+'」부터'));ul.append(li)});sum.append(el('b','','먼저 다시 볼 것'),ul)}
  else if(done.length===L.length){sum.append(el('p','ok','모두 잘하고 있어요! '+(cur<6?(cur+1)+'학년 항목도 미리 확인해 볼까요?':'초등 '+SN[subj]+' 핵심을 잘 마무리했어요.')));if(cur<6){var nb=el('button','obtn',(cur+1)+'학년 미리 보기');nb.type='button';nb.addEventListener('click',function(){pick(cur+1,true)});sum.append(nb)}}
  var rs=el('button','linkbtn','이 학년 확인 기록 지우기');rs.type='button';rs.addEventListener('click',function(){state={};save(cur);render()});sum.append(rs);
 }
 function render(){var L=items(cur);if(!L.length){head.replaceChildren(el('h2','',cur+'학년 '+SN[subj]),el('p','lead',SN[subj]+EN[subj]+' 학교에서 '+(D.grades?D.grades[0]:3)+'학년부터 배워요. 위에서 다른 학년이나 과목을 골라 주세요.'));list.replaceChildren();sum.hidden=true;return}
  head.replaceChildren(el('h2','',cur+'학년 '+SN[subj]+', 이것만은 할 수 있어야 해요'),el('p','lead','항목 '+L.length+'개 · 질문은 아이에게 말로 물어보면 돼요. 시험이 아니라 대화로 확인하는 거예요.'+(D.labels.answer_note?' '+D.labels.answer_note:'')));
  list.replaceChildren.apply(list,L.map(function(it,i){return card(it,i+1)}));
  var end=el('nav','ck-end');end.setAttribute('aria-label','다음에 볼 것');var gl=el('a','more guide-link','📘 '+cur+'학년 1년 학습 안내 글 읽기 →');gl.href='./guide-'+cur+'.html';end.append(gl);
  if(cur<6&&items(cur+1).length){var nb=el('button','linkbtn next-grade','➡️ '+(cur+1)+'학년 '+SN[subj]+' 미리 보기 →');nb.type='button';nb.addEventListener('click',function(){pick(cur+1,true)});end.append(nb)}
  var fd=el('a','more','🔎 교재에 나온 내용으로 학년 찾기 →');fd.href='./find.html';end.append(fd);list.append(end);summary()}
 function counts(){[].forEach.call(gbox.querySelectorAll('button'),function(b){var s=b.querySelector('small'),n=items(Number(b.dataset.grade)).length;if(s)s.textContent=n?n+'개 확인':(D.grades?D.grades[0]:3)+'학년부터';b.classList.toggle('none',!n)})}
 function setSubj(s,keep){if(!DD[s])return;subj=s;D=DD[s];[].forEach.call(sbox.querySelectorAll('button'),function(b){b.setAttribute('aria-pressed',String(b.dataset.subject===s))});counts();
  var t=document.getElementById('hero-subj');if(t)t.textContent=SN[s];
  if(cur&&keep)pick(cur,false);else{try{history.replaceState(null,'',s==='math'?location.pathname:'?subject='+s)}catch(e){}}}
 function pick(g,scroll){cur=g;state=load(g);[].forEach.call(gbox.querySelectorAll('button'),function(b){b.setAttribute('aria-pressed',String(Number(b.dataset.grade)===g))});
  try{history.replaceState(null,'',(subj==='math'?'?':'?subject='+subj+'&')+'grade='+g)}catch(e){}render();if(scroll){try{head.scrollIntoView({behavior:'smooth',block:'start'})}catch(e){head.scrollIntoView()}}}
 Promise.all([J('./data/math_checks_v1.1.json'),J('./data/korean_checks_v1.0.json'),J('./data/english_checks_v1.0.json'),J('./data/science_checks_v1.1.json')]).then(function(r){DD={math:r[0],korean:r[1],english:r[2],science:r[3]};
  [].forEach.call(gbox.querySelectorAll('button'),function(b){b.addEventListener('click',function(){pick(Number(b.dataset.grade),true)})});
  [].forEach.call(sbox.querySelectorAll('button'),function(b){b.addEventListener('click',function(){setSubj(b.dataset.subject,true)})});
  var qs=Q0.get('subject');setSubj(qs==='korean'||qs==='english'||qs==='science'?qs:'math',false);
  var g=Number(Q0.get('grade'));if(Number.isInteger(g)&&g>=1&&g<=6)pick(g,false);
  window.uriaiCheck={pick:pick,subject:setSubj};
 }).catch(function(){var p=el('p','err','점검 항목을 불러오지 못했습니다. 잠시 후 새로고침해 주세요.');p.setAttribute('role','alert');list.replaceChildren(p)});
})();
