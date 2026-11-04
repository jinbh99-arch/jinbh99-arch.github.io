/* 우리아이레벨테스트 v0.19 · 2026-11-04 (v0.18 기준: 과학 점검·과학 개념 연결 추가. 사회·과학 자료 v1.2 사용. 칸 설명에서 점검·학년 안내·수학 개념 연결로 이어짐)
   첫 화면 학년×과목 표: 칸을 누르면 그 과목·학년의 단원, 쉬운 설명, 관련 성취기준을 펼쳐 보여 준다. */
(function(){'use strict';
 var grid=document.getElementById('sgrid'),panel=document.getElementById('cell-panel');if(!grid||!panel)return;
 var Q0=new URLSearchParams(location.search),D={},NAME={korean:'국어',math:'수학',english:'영어',right_living:'바른 생활',ethics:'도덕',wise_living:'슬기로운 생활',social_studies:'사회',science:'과학',joyful_living:'즐거운 생활',physical_education:'체육',music:'음악',art:'미술',practical_arts:'실과',cea:'창의적 체험활동'};
 function el(t,c,x){var n=document.createElement(t);if(c)n.className=c;if(x!==undefined)n.textContent=String(x);return n}
 function tag(k){return el('span','tag '+k,k==='ai'?'AI 예시':'교육청 자료')}
 function J(u){return fetch(u,{cache:'no-cache'}).then(function(r){if(!r.ok)throw Error(u);return r.json()})}
 function stdList(list,label){var d=el('details','stds');d.append(el('summary','','관련 성취기준 '+list.length+'개 보기'));var ul=el('ul');
  list.forEach(function(s){var li=el('li');li.append(el('b','',s.code+' '),document.createTextNode(s.text||''));ul.append(li)});d.append(ul,el('p','muted',label));return d}
 function unitBlock(u,opts){
  var d=el('details','unit');var sm=el('summary');sm.append(el('span','uname',u.unit));d.append(sm);
  var w=el('p','');w.append(el('b','','무엇을 배우나요 '),tag('ai'),el('br'),document.createTextNode(u.ai_what));d.append(w);
  if(u.ai_activity){var a=el('p','');a.append(el('b','','수업 활동 예시 '),tag('ai'),el('br'),document.createTextNode(u.ai_activity));d.append(a)}
  if(u.ai_question){var q=el('p','ask');q.append(el('b','','아이에게 물어보세요 '),tag('ai'),el('br'),document.createTextNode(u.ai_question));d.append(q)}
  if(u.standards&&u.standards.length)d.append(stdList(u.standards,opts.stdLabel));
  if(opts.link){var l=el('a','more',opts.link[0]);l.href=opts.link[1](u);d.append(l)}
  if(opts.link2){var l2=el('a','more',opts.link2[0]);l2.href=opts.link2[1](u);d.append(l2)}
  return d}
 function semesters(list,grade,opts){
  var box=el('div','sems');[1,2].forEach(function(s){var us=list.filter(function(u){return u.grade===grade&&u.semester===s});if(!us.length)return;
   var col=el('section','sem');col.append(el('h4','',s+'학기 · 단원 '+us.length+'개'));us.forEach(function(u){col.append(unitBlock(u,opts))});box.append(col)});return box}
 function render(subject,grade){
  var name=NAME[subject];var head=el('div','cphead');var h=el('h2','',grade+'학년 '+name);h.id='cell-title';h.tabIndex=-1;head.append(h);
  var close=el('button','obtn','닫기');close.type='button';close.addEventListener('click',function(){panel.hidden=true;mark(0,'');try{history.replaceState(null,'','?grade='+grade)}catch(e){}});head.append(close);
  var body=[head],cat=(D.catalog.subjects.filter(function(s){return s.subject_id===subject})[0]);
  var act=el('div','cp-act');var CH={math:1,korean:1,english:3,science:3};if(CH[subject]&&grade>=CH[subject]){var ca=el('a','cp-btn','✅ '+grade+'학년 '+name+' 점검하기');ca.href='./index.html?'+(subject==='math'?'':'subject='+subject+'&')+'grade='+grade;act.append(ca)}
  var ga=el('a','cp-btn ghost','📘 '+grade+'학년 1년 안내 글');ga.href='./guide-'+grade+'.html';act.append(ga);body.push(act);
  if(subject==='math'){
   body.push(el('p','lead','단원을 누르면 쉬운 설명과 아이에게 물어볼 질문, 관련 성취기준이 나와요.'),tag('goe'));
   body.push(semesters(D.math.units,grade,{stdLabel:D.math.labels.standards,link:['관련 개념 카드와 그림 보기 →',function(u){return './math/index.html?grade='+u.grade+'&q='+encodeURIComponent(u.codes[0])}],link2:['🌳 이 단원 앞에 알아야 할 것 보기 →',function(u){return './concept-math.html?k='+encodeURIComponent(u.grade+'-'+u.semester+' '+u.unit)}]}));
   var f=el('a','more','🗺️ 수학 개념이 학년마다 어떻게 이어지는지 보기 →');f.href='./flow-math.html?grade='+grade;body.push(f);
  }else if(subject==='korean'){
   body.push(el('p','lead','단원을 누르면 쉬운 설명과 수업 활동, 아이에게 물어볼 질문이 나와요.'),tag('goe'));
   body.push(semesters(D.korean.units,grade,{stdLabel:D.korean.labels.standards,link:['국어 학습지도에서 이 학기 보기 →',function(u){return './korean/index.html?grade='+u.grade+'&semester='+u.semester}]}));
  }else if(subject==='social_studies'||subject==='science'){
   var L=subject==='science'?D.ss.science:D.ss.social;
   body.push(el('p','lead','단원을 누르면 쉬운 설명과 관련 성취기준이 나와요. 자세한 학습지도는 준비 중입니다.'),tag('goe'));
   body.push(semesters(L,grade,subject==='science'?{stdLabel:D.ss.labels.standards,link2:['🌳 이 단원 앞에 알아야 할 것 보기 →',function(u){return './concept-science.html?k='+encodeURIComponent(u.grade+'-'+u.semester+' '+u.unit)}]}:{stdLabel:D.ss.labels.standards}));
  }else if(subject==='english'){
   var e=D.guide.english[grade<=4?'3-4':'5-6'];
   var p=el('p','');p.append(el('b','','이 학년군 핵심 '),tag('ai'));body.push(p);var ul=el('ul','chips');e.key.forEach(function(k){ul.append(el('li','',k))});body.push(ul);
   var q=el('p','ask');q.append(el('b','','아이에게 물어보세요 '),tag('ai'),el('br'),document.createTextNode(e.question));body.push(q);
   body.push(el('p','muted','영어는 학년군(3~4, 5~6학년) 단위로 안내합니다. 성취기준 40건은 부분 검증 상태입니다.'));
   var a=el('a','more','영어 학습지도 자세히 보기 →');a.href='./english/index.html?grade='+grade;body.push(a);
  }else if(subject==='cea'){
   body.push(el('p','',D.catalog.creative_experiential_activities.intro));
  }else if(cat){
   body.push(el('p','',cat.short_intro));var q2=el('p','ask');q2.append(el('b','','집에서 이야기해 보세요 '),tag('ai'),el('br'),document.createTextNode(cat.parent_question));body.push(q2);
   if(subject==='practical_arts')body.push(el('p','muted',D.flow.prac_intro));
   body.push(el('p','muted','단원별 학습지도는 준비 중입니다.'));
  }
  panel.replaceChildren.apply(panel,body);panel.hidden=false;
 }
 function mark(grade,subject){[].forEach.call(grid.querySelectorAll('[data-g]'),function(c){var gs=c.dataset.g.split(',').map(Number);c.classList.toggle('col',gs.indexOf(grade)>=0);c.classList.toggle('sel',!!subject&&c.dataset.s===subject&&gs.indexOf(grade)>=0);if(c.tagName==='BUTTON')c.setAttribute('aria-pressed',String(c.classList.contains('sel')))})}
 function open(subject,grade,scroll){mark(grade,subject);render(subject,grade);try{history.replaceState(null,'','?grade='+grade+'&subject='+subject)}catch(e){}
  if(scroll){try{panel.scrollIntoView({behavior:'smooth',block:'start'})}catch(e){panel.scrollIntoView()}var t=document.getElementById('cell-title');if(t)t.focus({preventScroll:true})}}
 Promise.all([J('./data/math_units_v1.1.json'),J('./data/korean_units_v1.0.json'),J('./data/social_science_units_v1.2.json'),J('./data/subject_catalog_v1.9.json'),J('./data/grade_guide_v1.2.json'),J('./data/subject_flow_v1.0.json')]).then(function(r){
  D={math:r[0],korean:r[1],ss:r[2],catalog:r[3],guide:r[4],flow:r[5]};
  grid.addEventListener('click',function(ev){var b=ev.target.closest('button.cell');if(!b)return;var gs=b.dataset.g.split(',').map(Number);var g=gs.length>1&&window.__selGrade&&gs.indexOf(window.__selGrade)>=0?window.__selGrade:gs[0];open(b.dataset.s,g,true)});
  grid.addEventListener('click',function(ev){var h=ev.target.closest('button.ghead');if(!h)return;var g=Number(h.dataset.grade);window.__selGrade=g;mark(g,'');if(window.uriaiHome)window.uriaiHome.select(g,true)});
  var g=Number(Q0.get('grade')),s=Q0.get('subject');
  if(Number.isInteger(g)&&g>=1&&g<=6){window.__selGrade=g;mark(g,'');if(s&&NAME[s]){var ok=[].some.call(grid.querySelectorAll('button.cell'),function(c){return c.dataset.s===s&&c.dataset.g.split(',').map(Number).indexOf(g)>=0});if(ok)open(s,g,false)}}
  window.uriaiGrid={open:open};
 }).catch(function(){var p=el('p','err','과목 정보를 불러오지 못했습니다. 잠시 후 새로고침해 주세요.');p.setAttribute('role','alert');panel.replaceChildren(p);panel.hidden=false});
})();
