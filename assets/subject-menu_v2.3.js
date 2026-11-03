(function(){'use strict';
const node=document.getElementById('subject-menu-data');
let defaultCatalog=null;
let embeddedDataError=null;
if(node){try{defaultCatalog=JSON.parse(node.textContent)}catch(e){embeddedDataError=Error('내장 교과목 데이터 JSON 형식 오류')}}
const copy=(x)=>JSON.parse(JSON.stringify(x));
let seq=0;
function validateCatalog(cat){
 if(!cat||!Array.isArray(cat.subjects)||!cat.subjects.length||!cat.creative_experiential_activities||typeof cat.creative_experiential_activities.intro!=='string'||cat.creative_experiential_activities.type!=='non_subject')throw Error('교과목 데이터 필수 항목 누락');
 const seen=new Set();const validBands=new Set(['1-2','3-4','5-6']);for(const s of cat.subjects){
  if(!s||typeof s.subject_id!=='string'||!s.subject_id||seen.has(s.subject_id)||typeof s.display_name!=='string'||!s.display_name.trim()||typeof s.short_intro!=='string'||!s.short_intro.trim()||typeof s.parent_question!=='string'||!s.parent_question.trim()||s.parent_question_source!=='ai_authored_example_unverified'||!Array.isArray(s.grade_bands)||!s.grade_bands.length||s.grade_bands.some(b=>!validBands.has(b))||new Set(s.grade_bands).size!==s.grade_bands.length||!Array.isArray(s.grades)||!s.grades.length||!s.grades.every(g=>Number.isInteger(g)&&g>=1&&g<=6)||new Set(s.grades).size!==s.grades.length||s.grades.some(g=>!s.grade_bands.includes(g<=2?'1-2':g<=4?'3-4':'5-6'))||s.grade_bands.some(b=>!s.grades.some(g=>(g<=2?'1-2':g<=4?'3-4':'5-6')===b))||!['unverified','partial','verified'].includes(s.verification_status)||typeof s.curriculum_source_id!=='string'||!s.curriculum_source_id.trim()||typeof s.detail_status!=='string'||!['intro_only','pending_integration'].includes(s.detail_status)||(s.route_key!==null&&typeof s.route_key!=='string'))throw Error('교과목 데이터 형식 오류');
  seen.add(s.subject_id);
 }return true;
}
function isValidRoute(route){
 if(typeof route!=='string'||!route||/\s|\\|[<>"'`]/.test(route)||route.startsWith('//')||/%(?:2e|2f|5c)/i.test(route))return false;
 if(/^https?:\/\//i.test(route)){try{const u=new URL(route);return /^https?:$/.test(u.protocol)&&!!u.hostname&&!(u.username||u.password)}catch{return false}}
 return /^(?:\.{1,2}\/|\/)?[a-zA-Z0-9_\-./%?#=&]+$/.test(route)&&!route.startsWith('/\\');
}
function mountSubjectMenu(container, options={}){
 if(!(container instanceof Element))throw Error('container required');
 if(options.onNavigate!==undefined&&typeof options.onNavigate!=='function')throw Error('onNavigate 함수 형식 오류');
 if(embeddedDataError&&!options.catalog)throw embeddedDataError;
 if(container.__subjectMenuInstance)throw Error('이미 마운트된 컨테이너');
 if(!options.catalog&&!defaultCatalog)throw Error('catalog 데이터 필요');
 let catalog=copy(options.catalog||defaultCatalog);validateCatalog(catalog);
 if(options.routes!==undefined&&(!options.routes||typeof options.routes!=='object'||Array.isArray(options.routes)))throw Error('routes 형식 오류');
 let routes=Object.assign(Object.create(null),options.routes||{}),onNavigate=options.onNavigate;
 // 통합 담당자가 별도로 승인한 route_key만 활성화한다. 문자열 형식 검사만으로는 실제 주소 검증이 아니다.
 if(options.verifiedRouteKeys!==undefined&&(!Array.isArray(options.verifiedRouteKeys)||!options.verifiedRouteKeys.every(x=>typeof x==='string')))throw Error('verifiedRouteKeys 형식 오류');
 let verifiedRouteKeys=new Set(options.verifiedRouteKeys||[]);
 let grade=Number.isInteger(options.initialGrade)&&options.initialGrade>=1&&options.initialGrade<=6?options.initialGrade:0;
 let filter='';let destroyed=false;const assertAlive=()=>{if(destroyed)throw Error('해제된 메뉴 인스턴스')};const id='subject-menu-'+(++seq)+'-';
 const el=(tag,cls,txt)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=String(txt);return n};
 function render(opts={}){
  if(destroyed)return;
  container.replaceChildren();
  const skip=el('a','subject-menu-skip','교과목 목록으로 건너뛰기');skip.href='#'+id+'results';container.append(skip);
  const head=el('header','subject-menu-head');head.append(el('div','','아들레벨테스트'),el('h1','','학년별 교과목'),el('p','','우리 아이 학년에서 어떤 과목을 배우는지 살펴보세요.'));container.append(head);
  container.append(el('p','subject-menu-note','2026학년도 교과 안내입니다. 2022-33호 시행일과 2026-1호의 2028년 초등 1~2학년 개편 시행일을 확인했습니다. 교과 편제는 별책1 공공기관 재게시 자료의 웹 추출 내용과 교육청 자료를 교차 대조했으며, 원본 동일성·후속 개정 전수 확인은 미완료입니다.'));
  const evidence=el('section','subject-menu-evidence');evidence.setAttribute('aria-label','교과목 정보 검증 수준');evidence.append(el('h2','','정보 확인 범위'),el('p','','2022-33호 학년별 시행 일정 확인 · 별책1 재게시 추출 내용·2026학년도 교육청 자료 대조 · 2026-1호 초등 1~2학년 개편의 2028년 시행 확인 · 별책 원문 및 후속 개정 전수 확인 필요'));const evidenceLink=el('a','','교육부 고시 게시글 확인');evidenceLink.href='https://www.moe.go.kr/boardCnts/viewRenew.do?boardID=141&boardSeq=93458&lev=0&statusYN=W';evidenceLink.target='_blank';evidenceLink.rel='noopener noreferrer';evidence.append(evidenceLink);const futureLink=el('a','','2026-1호 개정 고시 확인');futureLink.href='https://www.law.go.kr/admRulInfoP.do?admRulSeq=2100000273516&chrClsCd=010202&urlMode=admRulRvsInfoR';futureLink.target='_blank';futureLink.rel='noopener noreferrer';futureLink.style.marginLeft='12px';evidence.append(futureLink);const annexLink=el('a','','총론 편제 재게시 자료');annexLink.href='https://caesec.cncae.go.kr/files/tmp/916655001740560418.pdf';annexLink.target='_blank';annexLink.rel='noopener noreferrer';annexLink.style.marginLeft='12px';evidence.append(annexLink);container.append(evidence);
  const grades=el('div','subject-menu-grades');grades.setAttribute('role','group');grades.setAttribute('aria-label','학년 선택');
  for(let g=1;g<=6;g++){const b=el('button','subject-menu-grade',g+'학년');b.type='button';b.dataset.grade=String(g);b.setAttribute('aria-pressed',String(g===grade));b.setAttribute('aria-label',g+'학년 교과목 보기');b.addEventListener('click',()=>{grade=g;filter='';render({focusGrade:g})});grades.append(b)}container.append(grades);
  const section=el('section','');section.id=id+'results';section.setAttribute('aria-label','교과목 안내');section.setAttribute('tabindex','-1');container.append(section);
  if(!grade){section.append(el('h2','subject-menu-subtitle','학년을 선택해 주세요'));const overview=el('div','subject-menu-grid');for(const [a,b] of [['1~2학년','기초 학습과 통합교과'],['3~4학년','교과별 배움 확장'],['5~6학년','생활과 연결된 배움']]){const c=el('div','subject-menu-card');c.append(el('h3','',a),el('p','',b));overview.append(c)}section.append(overview)}
  else{
   const full=catalog.subjects.filter(s=>s.grades.includes(grade)).sort((a,b)=>(a.sort_order||0)-(b.sort_order||0)||a.display_name.localeCompare(b.display_name,'ko'));
   const band=grade<=2?'1-2':grade<=4?'3-4':'5-6';const schedule=catalog.application_schedule_2022_33;section.append(el('h2','subject-menu-subtitle',grade+'학년 교과목 · 초안 '+full.length+'개'));if(schedule&&schedule[band]){const t=el('p','subject-menu-schedule','2022-33호 고시상 '+(band==='1-2'?'1~2':band==='3-4'?'3~4':'5~6')+'학년 적용 시작: '+schedule[band]+' · 후속 개정 확인 필요');section.append(t)}if(band==='1-2'){section.append(el('p','subject-menu-future','2028년부터 1~2학년에는 ‘건강한 생활’ 교과가 신설될 예정입니다(2026-1호). 2026학년도 목록에는 포함하지 않았습니다.'))}section.append(el('p','subject-menu-band-note','2026학년도 안내는 1~2·3~4·5~6학년군 편제 기준입니다. 학년군의 교과를 각 학년에 안내용으로 함께 표시했으며 학년·학기별 시간표가 아닙니다.'));const glossary=el('details','subject-menu-glossary');const glossaryHeading=el('summary','','학년군이란?');glossary.append(glossaryHeading,el('p','','서로 이어지는 두 학년을 묶어 교육과정 내용을 제시하는 방식입니다. 이 화면의 과목 목록은 학년군 기준 안내이며, 각 학년·학기 교과서 차례나 주당 수업 시수를 뜻하지 않습니다.'));section.append(glossary);
   const label=el('label','subject-menu-filter-label','교과목 이름·소개·집에서 나눌 질문 검색');const input=el('input','subject-menu-filter');input.type='search';input.placeholder='예: 수학, 자연, 친구';input.setAttribute('autocomplete','off');input.setAttribute('aria-controls',id+'grid');input.setAttribute('aria-describedby',id+'filter-hint');input.value=filter;input.id=id+'filter';label.htmlFor=input.id;const filterRow=el('div','subject-menu-filter-row');const clear=el('button','subject-menu-clear','검색 지우기');clear.type='button';clear.disabled=!filter;clear.addEventListener('click',()=>{input.value='';update();input.focus()});input.addEventListener('keydown',event=>{if(event.key==='Escape'&&input.value){event.preventDefault();input.value='';update();}});filterRow.append(input,clear);const hint=el('p','subject-menu-filter-hint','질문 문구도 검색할 수 있어요. 입력 중 Esc 키를 누르면 검색어가 지워집니다.');hint.id=id+'filter-hint';section.append(label,filterRow,hint);
   const navError=el('p','subject-menu-navigation-error');navError.setAttribute('role','alert');navError.hidden=true;section.append(navError);
   const count=el('p','subject-menu-count');count.setAttribute('role','status');count.setAttribute('aria-live','polite');count.setAttribute('aria-atomic','true');section.append(count);
   const grid=el('div','subject-menu-grid');grid.id=id+'grid';section.append(grid);
   const update=()=>{
    filter=input.value;clear.disabled=!filter;const normalized=filter.trim().toLocaleLowerCase('ko');const matched=full.filter(s=>(s.display_name+' '+s.short_intro+' '+s.parent_question).toLocaleLowerCase('ko').includes(normalized));count.textContent=filter.trim()?matched.length+'개 검색됨 · 전체 '+full.length+'개':full.length+'개 교과목 표시 중';grid.replaceChildren();
    if(!matched.length)grid.append(el('p','subject-menu-empty','검색 결과가 없습니다. 과목명을 바꾸거나 검색 지우기를 눌러주세요.'));
    for(const s of matched){
     const card=el('article','subject-menu-card');const heading=el('h3','',s.display_name);card.append(heading,el('p','',s.short_intro),el('span','subject-menu-tag',s.verification_status==='verified'?'검증 표시 재확인 필요 · 현행 확정 아님':s.verification_status==='partial'?'2026 편제 부분 대조 · 최종 전수검증 미완료':'공식 편제 미검증'));
     const rawRoute=s.route_key&&Object.prototype.hasOwnProperty.call(routes,s.route_key)?routes[s.route_key]:null;
     const available=!!(s.route_key&&s.detail_status==='pending_integration'&&verifiedRouteKeys.has(s.route_key)&&isValidRoute(rawRoute)&&typeof onNavigate==='function');
     card.append(el('p','subject-menu-muted',available?'통합 담당자가 확인한 학습지도 경로':s.route_key?'학습지도 연결 준비 중':'학습지도 준비 중'));
     const actions=el('div','subject-menu-actions');const detail=el('div','subject-menu-detail');detail.hidden=true;detail.id=id+'detail-'+grade+'-'+s.subject_id;
     detail.append(el('p','',s.short_intro),el('p','subject-menu-parent-label','집에서 함께 이야기해 보세요'),el('p','',s.parent_question),el('p','subject-menu-muted','위 소개와 질문은 AI가 작성한 학부모용 예시이며, 공식 성취기준 또는 학년별 평가기준이 아닙니다.')); 
     const show=el('button','subject-menu-action','과목 소개 자세히 보기');show.type='button';show.setAttribute('aria-controls',detail.id);show.setAttribute('aria-label',s.display_name+' 과목 소개 자세히 보기');show.setAttribute('aria-expanded','false');show.addEventListener('click',()=>{detail.hidden=!detail.hidden;show.setAttribute('aria-expanded',String(!detail.hidden));show.textContent=detail.hidden?'과목 소개 자세히 보기':'과목 소개 닫기';show.setAttribute('aria-label',s.display_name+(detail.hidden?' 과목 소개 자세히 보기':' 과목 소개 닫기'))});actions.append(show);
     const go=el('button','subject-menu-action',available?'학습지도 열기':'학습지도 준비 중');go.type='button';go.disabled=!available;go.setAttribute('aria-label',s.display_name+(available?' 학습지도 열기':' 학습지도 준비 중'));
     if(available)go.addEventListener('click',()=>{
       navError.hidden=true;navError.textContent='';
       // 외부 호스트 콜백의 예외와 비동기 실패를 UI에서 안전하게 처리한다.
       try{const result=onNavigate({subjectId:s.subject_id,grade,routeKey:s.route_key});
         if(result&&typeof result.then==='function')Promise.resolve(result).catch(()=>{if(!destroyed&&container.isConnected){navError.textContent='학습지도를 열지 못했습니다. 잠시 후 다시 시도해 주세요.';navError.hidden=false;}});
       }catch(e){navError.textContent='학습지도를 열지 못했습니다. 잠시 후 다시 시도해 주세요.';navError.hidden=false;}
      });actions.append(go);card.append(actions,detail);grid.append(card);
    }
   };input.addEventListener('input',update);update();
  }
  const extra=el('section','subject-menu-extra');extra.append(el('h2','','창의적 체험활동'),el('p','',catalog.creative_experiential_activities.intro||'교과와 구분되는 활동입니다.'),el('span','subject-menu-tag','2026 편제 부분 대조 · 최종 전수검증 미완료'));container.append(extra);
  if(opts.focusGrade){const b=grades.querySelector('[data-grade="'+opts.focusGrade+'"]');if(b)b.focus()}
  if(opts.focusSearch){const search=section.querySelector('.subject-menu-filter');if(search)search.focus()}
 }
 const api={
 setGrade(g){assertAlive();if(Number.isInteger(g)&&g>=1&&g<=6){grade=g;filter='';render();return true}return false},
 getGrade(){assertAlive();return grade},
 setRoutes(newRoutes){assertAlive();if(!newRoutes||typeof newRoutes!=='object'||Array.isArray(newRoutes))throw Error('routes 형식 오류');const refocus=container.contains(document.activeElement)&&document.activeElement.classList.contains('subject-menu-filter');routes=Object.assign(Object.create(null),newRoutes);render({focusSearch:refocus});return true},
 setVerifiedRouteKeys(keys){assertAlive();if(!Array.isArray(keys)||!keys.every(k=>typeof k==='string'))throw Error('verifiedRouteKeys 형식 오류');const refocus=container.contains(document.activeElement)&&document.activeElement.classList.contains('subject-menu-filter');verifiedRouteKeys=new Set(keys);render({focusSearch:refocus});return true},
 setCatalog(newCatalog){assertAlive();validateCatalog(newCatalog);catalog=copy(newCatalog);filter='';render();return true},
 getStatus(){assertAlive();return {grade,subjectCount:catalog.subjects.length,verificationStatus:catalog.status,routeKeys:Object.keys(routes).filter(k=>verifiedRouteKeys.has(k)&&isValidRoute(routes[k]))}},
 destroy(){if(destroyed)return false;destroyed=true;container.replaceChildren();delete container.__subjectMenuInstance;return true}
 };
 container.__subjectMenuInstance=api;render();return api;
}
window.mountSubjectMenu=mountSubjectMenu;
window.subjectMenuValidateCatalog=validateCatalog;
const standalone=document.getElementById('subject-menu-app');
if(standalone){try{mountSubjectMenu(standalone)}catch(e){const message=document.createElement('p');message.className='subject-menu-error';message.setAttribute('role','alert');message.textContent='교과목 정보를 불러오지 못했습니다. 데이터 파일을 확인해 주세요.';standalone.replaceChildren(message);}}
})();