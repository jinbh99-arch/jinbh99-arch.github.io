/* 아들레벨테스트 통합홈 v0.2 · 2026-11-03
   메인 대문: RC5 학년별 교과목 메뉴(subject-menu_v2.3.js, 무수정)를 마운트하고
   site_config에 등록·확인된 학습지도 경로만 활성화한다. */
(function(){'use strict';
 var root=document.getElementById('subject-menu-main');
 var statusBox=document.getElementById('subject-status');
 var params=new URLSearchParams(location.search);
 var g=Number(params.get('grade'));
 var initialGrade=(Number.isInteger(g)&&g>=1&&g<=6)?g:undefined;
 function showError(){
  var p=document.createElement('p');p.className='site-error';p.setAttribute('role','alert');
  p.textContent='교과목 정보를 불러오지 못했습니다. 잠시 후 새로고침해 주세요.';
  root.replaceChildren(p);
 }
 function el(tag,cls,txt){var n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=String(txt);return n}
 function renderStatus(config){
  if(!statusBox)return;var ul=el('ul','site-status-list');
  config.subject_pages.forEach(function(s){
   var li=el('li');var h=el('h3','',s.name);
   h.append(el('span','site-pill '+s.status,s.status==='linked'?'학습지도 열람 가능':'학습지도 준비 중'));li.append(h);
   var dl=el('dl');[['자료 버전',s.source],['대상',s.grades],['공식 원문',s.official],['AI 작성',s.ai]].forEach(function(r){dl.append(el('dt','',r[0]),el('dd','',r[1]))});
   li.append(dl);ul.append(li);
  });statusBox.replaceChildren(ul);
 }
 function getJSON(url){return fetch(url,{cache:'no-cache'}).then(function(r){if(!r.ok)throw Error('HTTP '+r.status+' '+url);return r.json()})}
 Promise.all([getJSON('./data/subject_catalog_v1.9.json'),getJSON('./data/site_config_v0.2.json')]).then(function(res){
  var catalog=res[0],config=res[1];
  var api=window.mountSubjectMenu(root,{
   catalog:catalog,initialGrade:initialGrade,routes:config.routes,verifiedRouteKeys:config.verified_route_keys,
   onNavigate:function(info){var base=config.routes[info.routeKey];if(!base)throw Error('route');location.assign(base+'?grade='+info.grade)}
  });
  window.adeulHome=api;
  root.addEventListener('click',function(e){
   var t=e.target;if(!t||!t.closest||!t.closest('.subject-menu-grade'))return;
   var gr=api.getGrade();try{history.replaceState(null,'',gr?('?grade='+gr):location.pathname)}catch(err){}
  });
  renderStatus(config);
 }).catch(showError);
})();
