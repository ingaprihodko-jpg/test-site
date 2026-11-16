/* Оформление уроков «Библиотеки встреч»: раскладывает блоки урока по шаблону, тема и «Ещё по теме» — из Google-таблицы. */
(function(){
  var CSV='https://docs.google.com/spreadsheets/d/e/2PACX-1vSKHV4QNiaqNHdDezYAl5F4RyY35pg4XNRaWx8UeCcug7s9pudH26A_zXuDGdAnfoebEmuT_VrjjfH6/pub?gid=1178025904&single=true&output=csv';
  var LIBRARY_ID='934741030';                       /* корневой тренинг библиотеки */
  var CATALOG='/teach/control/stream/view/id/934741030'; /* страница с каталогом */
  var THEMES=['Травмы и кризисы','Подходы и методы','Зависимости и окружение','Специфика терапевтической работы','Личность клиента','Предприниматели и бизнес','Сложные эмоции','Отношения в паре','Клиническая психология','СДВГ и аутизм у взрослых','Психодрама и монодрама','Групповая работа','Профессиональный путь психолога','Тревога, панические атаки и фобии','Суицидальность и самоповреждение','Сексуальность','Психосоматика','Краткосрочная терапия'];
  var MONTHS=['январь','февраль','март','апрель','май','июнь','июль','август','сентябрь','октябрь','ноябрь','декабрь'];

  if(window.__lsxDone)return;window.__lsxDone=true;
  if(/[?&]editMode=1/.test(location.search)){document.documentElement.classList.add('lsx-ready');return}
  var m=location.href.match(/lesson\/view(?:\/id\/|\?id=)(\d+)/);if(!m)return;
  var lessonId=m[1];

  /* HTML-сущности собираем из частей: редактор темы GC раскодирует их при сохранении */
  var AMP=String.fromCharCode(38),NB=AMP+'nbsp;';
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return AMP+({'&':'amp','<':'lt','>':'gt','"':'quot'}[c])+';'})}
  function nb(s){return esc(s).replace(/(^|\s)([а-яёА-ЯЁ]{1,2})\s/g,'$1$2'+NB)}
  function monthLabel(v){var p=(v||'').split('-');if(p.length<2)return v||'';var s=MONTHS[+p[1]-1]||'';return s?s[0].toUpperCase()+s.slice(1)+' '+p[0]:v}
  function parseCSV(t){var rows=[],row=[],f='',q=false;for(var i=0;i<t.length;i++){var c=t[i];
    if(q){if(c==='"'){if(t[i+1]==='"'){f+='"';i++}else q=false}else f+=c}
    else if(c==='"')q=true;else if(c===','){row.push(f);f=''}else if(c==='\n'){row.push(f);rows.push(row);row=[];f=''}else if(c!=='\r')f+=c}
    if(f||row.length){row.push(f);rows.push(row)}return rows}
  function idOf(link){var x=(link||'').match(/(?:id=|\/id\/)(\d+)/);return x?x[1]:''}

  /* таблица: сразу берём из кэша браузера, свежую подгружаем в фоне */
  function cachedRows(){try{var c=JSON.parse(localStorage.getItem('lsx-csv')||'null');return c&&c.rows||null}catch(e){return null}}
  function fetchRows(){
    return fetch(CSV).then(function(r){return r.text()}).then(function(t){
      var rows=parseCSV(t).slice(1).filter(function(r){return r[0]}).map(function(r){return{id:idOf(r[0]),url:r[0],title:r[1]||'',month:r[2]||'',theme:r[3]||'',speaker:r[4]||'',course:r[5]||'',type:r[6]||'',show:(r[7]||'').trim().toLowerCase()!=='нет'}});
      try{localStorage.setItem('lsx-csv',JSON.stringify({t:Date.now(),rows:rows}))}catch(e){}
      return rows});
  }


  function kind(b){var x=String(b.className).match(/lt-view (\S+)/);return x?x[1]:''}
  function hasText(b){return (b.innerText||'').replace(/\s+/g,'').length>0}

  var hero=null,promo=[],content=[];
  function layout(){
    var page0=document.querySelector('.lite-page.block-set');
    if(page0){[].forEach.call(page0.querySelectorAll('[id^=ltBlock] p, [id^=ltBlock] h1, [id^=ltBlock] h2, [id^=ltBlock] h3'),function(p){
      if(p.closest('.part-header, .part-subheader'))return;
      var t=(p.textContent||'').replace(/[\s\u00a0]+/g,'');
      if(!t&&!p.querySelector('img, iframe, audio, video')){p.classList.add('lsx-empty');return}
      var fs=0;[p].concat([].slice.call(p.querySelectorAll('*'))).forEach(function(e){var f=parseFloat(getComputedStyle(e).fontSize);if(e.textContent.trim()&&f>fs)fs=f});
      if(/^H\d$/.test(p.tagName)||fs>=19)p.dataset.lsxH=t.length>110?'lead':'1';
    })}
    var page=page0;if(!page)return;
    document.documentElement.classList.add('lsx-on');

    var i,all=[].slice.call(page.querySelectorAll('[id^=ltBlock]')).filter(function(b){return b.parentElement.closest('[id^=ltBlock]')===null});
    content=all.filter(function(b){var k=kind(b);return !/^(lmb|lesson-|raw-)/.test(k)});
    var heroIdx=-1;
    for(i=0;i<content.length;i++)if(/^tcb/.test(kind(content[i]))){hero=content[i];heroIdx=i;break}
    function isMedia(b){return /^(vid|aud)/.test(kind(b))||!!b.querySelector('audio, .vhi-root')}
    /* первая группа видео/аудио подряд (пустые блоки между ними не считаем) */
    var mediaEnd=-1;
    for(var j0=0;j0<content.length;j0++)if(isMedia(content[j0])){mediaEnd=j0;
      for(var j1=j0+1;j1<content.length;j1++){if(isMedia(content[j1]))mediaEnd=j1;else if(hasText(content[j1]))break}break}

    content.forEach(function(b,j){
      var k=kind(b);b.classList.add('lsx-block');
      if(j<heroIdx&&b.querySelector('img')&&!hasText(b)){b.classList.add('lsx-hide');return}
      if(b===hero){b.classList.add('lsx-hero');return}
      if(mediaEnd>=0&&j>mediaEnd){b.classList.add('lsx-promo');if(isMedia(b))b.classList.add('lsx-media');return}
      if(isMedia(b)){b.classList.add('lsx-media');return}
      b.classList.add('lsx-text');
    });
    /* текст, стоящий над блоком спикера, переносим сразу под него */
    if(hero){var pre=content.slice(0,heroIdx).filter(function(b){return b.classList.contains('lsx-text')});
      for(var q=pre.length-1;q>=0;q--)hero.parentNode.insertBefore(pre[q],hero.nextSibling)}
    promo=content.filter(function(b){return b.classList.contains('lsx-promo')&&!b.classList.contains('lsx-hide')});
    if(promo.length){promo[0].classList.add('lsx-promo-first');promo[promo.length-1].classList.add('lsx-promo-last')}

    /* крупные строки текста считаем подзаголовками */
    [].forEach.call(page.querySelectorAll('.lsx-text [data-lsx-h], .lsx-promo [data-lsx-h]'),function(p){p.classList.add(p.dataset.lsxH==='lead'?'lsx-lead':'lsx-h')});
  }

  var enriched=false;
  function enrich(rows){
    if(enriched||!rows||!content.length)return;
    var me=null;
    for(var i=0;i<rows.length;i++)if(rows[i].id===lessonId){me=rows[i];break}
    if(!me)return;
    enriched=true;

    /* чипсы в шапке: тема и тип встречи */
    if(hero&&me&&(me.theme||me.type)){
      var col=hero.querySelector('.builder.flex-column')||hero.querySelector('.lt-block-wrapper');
      var ti=THEMES.indexOf(me.theme),h='';
      if(me.theme)h+=ti>=0?'<a class="lsx-chip lsx-chip--theme" href="'+CATALOG+'#th='+(ti+1)+'">'+nb(me.theme)+'</a>':'<span class="lsx-chip lsx-chip--theme">'+nb(me.theme)+'</span>';
      if(me.type)h+='<span class="lsx-chip">'+esc(me.type)+'</span>';
      var d=document.createElement('div');d.className='lsx-chips';d.innerHTML=h;
      var anchor=col.querySelector('.part-subheader')||col.firstElementChild;
      col.insertBefore(d,anchor);
    }

    /* ещё по теме */
    if(me&&me.theme){
      var same=rows.filter(function(r){return r.show&&r.id!==lessonId&&r.theme===me.theme});
      same.sort(function(a,b){return (b.month||'').localeCompare(a.month||'')});
      if(same.length){
        var ti2=THEMES.indexOf(me.theme);
        var sec=document.createElement('section');sec.className='lsx-more';
        sec.innerHTML='<h2>Ещё по'+NB+'теме «'+nb(me.theme)+'»</h2><div class="lsx-more-grid">'+same.slice(0,3).map(function(r){
          return '<a class="lsx-mcard" href="'+esc(r.url)+'"><b>'+nb(r.title)+'</b><span>'+esc([r.speaker,monthLabel(r.month)].filter(Boolean).join(' · '))+'</span></a>'}).join('')+'</div>'+
          (same.length>3?'<a class="lsx-all" href="'+CATALOG+(ti2>=0?'#th='+(ti2+1):'')+'">Все записи по'+NB+'теме ('+(same.length+1)+') →</a>':'<a class="lsx-all" href="'+CATALOG+'">Вся библиотека →</a>');
        var after=promo.length?promo[promo.length-1]:content[content.length-1];
        after.parentNode.insertBefore(sec,after.nextSibling);
      }
    }
  }

  function show(){document.documentElement.classList.add('lsx-ready')}
  function start(){
    try{layout()}catch(e){}
    show();
    var c=cachedRows();if(c)enrich(c);
    fetchRows().then(enrich,function(){});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
