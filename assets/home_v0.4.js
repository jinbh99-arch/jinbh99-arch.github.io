/* 아이레벨테스트 메인 v0.4 · 2026-11-03
   첫 화면: 초등 6년 학습 지도(학년 카드) → 학년 선택 → 국어·수학·영어 크게, 그 밖의 과목 작게 */
(function(){'use strict';
 var mapBox=document.getElementById('map'),panel=document.getElementById('grade-panel');
 var BANDS=[['1-2','🌱','1~2학년 · 기초를 다져요'],['3-4','🌿','3~4학년 · 넓혀 가요'],['5-6','🌳','5~6학년 · 연결하고 활용해요']];
 var ICON={korean:'📖',math:'🔢',english:'🔤'};
 var guide,catalog,current=0;
 function el(tag,cls,txt){var n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=String(txt);return n}
 function tag(kind){return el('span','tag '+kind,kind==='ai'?'AI 예시':'교육청 자료')}
 function chips(list){var ul=el('ul','chips');list.forEach(function(t){ul.append(el('li','',t))});return ul}
 function getJSON(u){return fetch(u,{cache:'no-cache'}).then(function(r){if(!r.ok)throw Error(u);return r.json()})}
 function renderMap(){
  var root=el('div','root');root.append(el('span','','초등 6년 배움 지도'));
  var bands=el('div','bands');
  BANDS.forEach(function(b){
   var box=el('section','band');box.dataset.band=b[0];
   var h=el('h2');h.append(el('span','',b[1]),el('span','',b[2]));box.append(h);
   var pair=el('div','pair');
   guide.grades.filter(function(g){return g.band===b[0]}).forEach(function(g){
    var bt=el('button','gbtn');bt.type='button';bt.dataset.grade=g.grade;bt.setAttribute('aria-pressed','false');
    bt.setAttribute('aria-label',g.grade+'학년 배우는 것 보기: '+g.math_key.join(', '));
    bt.append(el('span','vis',g.visual),el('span','gname',g.grade+'학년'),el('span','keys',g.math_key.join(' · ')));
    bt.addEventListener('click',function(){select(g.grade,true)});
    pair.append(bt);
   });
   box.append(pair);bands.append(box);
  });
  mapBox.replaceChildren(root,bands);
 }
 function subjectCard(key,g){
  var card=el('article','subj');card.dataset.subject=key;
  var name={korean:'국어',math:'수학',english:'영어'}[key];
  var h=el('h3');h.append(el('span','',ICON[key]),el('span','',name));card.append(h);
  var vis,keys,q,link;
  if(key==='math'){vis=g.visual;keys=g.math_key;q=g.math_q;link='./math/index.html?grade='+g.grade}
  else if(key==='korean'){vis=g.kor_visual;keys=g.kor_key;q=g.kor_q;link='./korean/index.html?grade='+g.grade}
  else {var e=guide.english[g.band];vis=e.visual;keys=e.key;q=e.question;link='./english/index.html?grade='+g.grade}
  card.append(el('div','big',vis));
  var kl=el('p','','');kl.style.margin='0';kl.style.fontSize='13px';kl.style.fontWeight='700';kl.textContent='이번 학년 핵심 ';
  kl.append(key==='english'?tag('ai'):tag('goe'));card.append(kl,chips(keys));
  if(key==='math'){
   var d=el('details');d.append(el('summary','','학기별 단원 모두 보기'));
   ['1','2'].forEach(function(s){d.append(el('p','',s+'학기'));var ol=el('ol');g.math_units[s].forEach(function(u){ol.append(el('li','',u))});d.append(ol)});
   card.append(d);
  }
  var why=el('p','why');why.append(el('b','','왜 배우나요? '),document.createTextNode(guide.purpose[key]),tag('ai'));card.append(why);
  var ask=el('p','ask');ask.append(el('b','','아이에게 물어보세요 '),tag('ai'),el('br'),document.createTextNode(q));card.append(ask);
  var a=el('a','go',name+' 자세히 보기 →');a.href=link;card.append(a);
  return card;
 }
 function select(grade,scroll){
  var g=guide.grades.filter(function(x){return x.grade===grade})[0];if(!g)return;current=grade;
  [].forEach.call(mapBox.querySelectorAll('.gbtn'),function(b){b.setAttribute('aria-pressed',String(Number(b.dataset.grade)===grade))});
  try{history.replaceState(null,'','?grade='+grade)}catch(e){}
  var head=el('div','ghead');var h=el('h2','',grade+'학년에서 배우는 것');h.id='grade-title';h.tabIndex=-1;head.append(h);
  var sum=el('p','summary',g.summary);sum.append(tag('ai'));
  var subs=el('div','subjects');['korean','math'].concat(grade>=3?['english']:[]).forEach(function(k){subs.append(subjectCard(k,g))});
  var others=el('section','others');others.append(el('h3','','그 밖의 과목'));
  var obtns=el('div','obtns'),intro=el('p','ointro','과목을 누르면 짧은 소개가 나와요. 자세한 학습지도는 준비 중입니다.');intro.setAttribute('aria-live','polite');
  catalog.subjects.filter(function(s){return s.grades.indexOf(grade)>=0&&['korean','math','english'].indexOf(s.subject_id)<0}).sort(function(a,b){return a.sort_order-b.sort_order}).forEach(function(s){
   var b=el('button','obtn',s.display_name);b.type='button';b.dataset.subject=s.subject_id;b.setAttribute('aria-expanded','false');
   b.addEventListener('click',function(){var open=b.getAttribute('aria-expanded')!=='true';[].forEach.call(obtns.children,function(x){x.setAttribute('aria-expanded','false')});
    b.setAttribute('aria-expanded',String(open));intro.textContent=open?(s.display_name+' — '+s.short_intro+' (학습지도 준비 중)'):'과목을 누르면 짧은 소개가 나와요. 자세한 학습지도는 준비 중입니다.'});
   obtns.append(b);
  });
  others.append(obtns,intro);
  var cea=el('section','cea');cea.append(el('h3','','🎈 창의적 체험활동 (교과와 별도)'),el('p','',catalog.creative_experiential_activities.intro));
  var basis=el('details','basis');basis.append(el('summary','','이 내용의 근거 보기'));
  var ul=el('ul');var src=guide.sources;
  [[grade<=4?src.math_1_4:src.math_5_6,'수학 단원'],[src.korean,'국어 단원']].forEach(function(x){var li=el('li');li.append(document.createTextNode(x[1]+': '));var a=el('a','',x[0].title+' '+x[0].pages);a.href=x[0].url;a.target='_blank';a.rel='noopener noreferrer';li.append(a);ul.append(li)});
  if(grade>=3)ul.append(el('li','','영어: '+src.english.title));
  ul.append(el('li','',guide.notice));
  ul.append(el('li','','‘AI 예시’ 표시는 학부모 이해를 돕기 위해 AI가 쓴 설명·질문으로, 교육부 공식 기준이 아닙니다. 공식 성취기준 원문은 각 과목의 ‘자세히 보기’ 안에서 확인할 수 있어요.'));
  basis.append(ul);
  panel.replaceChildren(head,sum,subs,others,cea,basis);
  if(scroll){try{panel.scrollIntoView({behavior:'smooth',block:'start'})}catch(e){panel.scrollIntoView()}h.focus({preventScroll:true})}
 }
 Promise.all([getJSON('./data/grade_guide_v1.0.json'),getJSON('./data/subject_catalog_v1.9.json')]).then(function(r){
  guide=r[0];catalog=r[1];renderMap();
  var g=Number(new URLSearchParams(location.search).get('grade'));
  if(Number.isInteger(g)&&g>=1&&g<=6)select(g,false);
  window.aiLevelHome={select:select,getGrade:function(){return current}};
 }).catch(function(){var p=el('p','err','학습 지도를 불러오지 못했습니다. 잠시 후 새로고침해 주세요.');p.setAttribute('role','alert');mapBox.replaceChildren(p)});
})();
