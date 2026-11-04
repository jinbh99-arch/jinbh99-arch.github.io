/* 우리아이레벨테스트 교재 찾기 v0.19 · 2026-11-04 (v0.14 기준: 과학 결과에도 그 학년 점검 연결) — 결과마다 단원 설명과 그 학년 점검으로 연결 */
(function(){'use strict';
 var Q0=new URLSearchParams(location.search);
 function el(t,c,x){var n=document.createElement(t);if(c)n.className=c;if(x!==undefined)n.textContent=String(x);return n}
 var CHK={math:[1,2,3,4,5,6],korean:[1,2,3,4,5,6],english:[3,4,5,6],science:[3,4,5,6]};
 var fi=document.getElementById('find-input'),fr=document.getElementById('find-result'),F=null;
 function norm(s){return String(s).toLowerCase().replace(/\s+/g,'')}
 function find(q){var n=norm(q);if(!n||!F){fr.replaceChildren();return}
  var R=F.entries.map(function(e){var sc=0;if(norm(e.u).indexOf(n)>=0)sc=3;else if(e.k.some(function(k){return norm(k).indexOf(n)>=0||n.indexOf(norm(k))>=0&&norm(k).length>=2}))sc=2;else if(norm(e.t).indexOf(n)>=0)sc=1;return [sc,e]}).filter(function(x){return x[0]>0}).sort(function(a,b){return b[0]-a[0]||(a[1].sid==='math'?-1:0)-(b[1].sid==='math'?-1:0)||a[1].g-b[1].g||a[1].m-b[1].m}).slice(0,8);
  fr.replaceChildren();var st=el('p','muted',R.length?('“'+q+'” 관련 단원 '+R.length+'개'+(R.length===8?' (상위 8개)':'')):('“'+q+'”와 맞는 단원을 찾지 못했어요. 다른 말로 찾아보세요.'));st.setAttribute('role','status');fr.append(st);
  R.forEach(function(x){var e=x[1];var w=el('div','fres');var a=el('a','fitem');a.href='./curriculum.html?grade='+e.g+'&subject='+e.sid;a.append(el('span','fg',e.g+'학년 '+e.m+'학기'),el('b','',e.s+' · '+e.u),el('span','ft',e.t),el('span','fgo','단원 설명 보기 →'));w.append(a);
   if(CHK[e.sid]&&CHK[e.sid].indexOf(e.g)>=0){var c=el('a','fcheck',e.g+'학년 '+e.s+' 점검하기 →');c.href='./index.html?'+(e.sid==='math'?'':'subject='+e.sid+'&')+'grade='+e.g;w.append(c)}fr.append(w)});
  try{history.replaceState(null,'','?q='+encodeURIComponent(q))}catch(e){}}
 if(fi){var tm;fi.addEventListener('input',function(){clearTimeout(tm);tm=setTimeout(function(){find(fi.value)},120)});
  [].forEach.call(document.querySelectorAll('.fchip'),function(b){b.addEventListener('click',function(){fi.value=b.textContent;find(fi.value);fi.focus()})})}

 fetch('./data/find_index_v1.1.json',{cache:'no-cache'}).then(function(r){if(!r.ok)throw Error();return r.json()}).then(function(d){F=d;var q=Q0.get('q');if(q&&fi&&q.length<30){fi.value=q;find(q)}})
  .catch(function(){var p=el('p','err','찾기 자료를 불러오지 못했습니다. 잠시 후 새로고침해 주세요.');p.setAttribute('role','alert');fr.replaceChildren(p)});
 window.uriaiFind={find:function(q){find(q)}};
})();
