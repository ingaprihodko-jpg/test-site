// Набор функций для конструктора писем GetCourse (editor?id=…).
// Загружается в localStorage('ov3_setup') и подключается: eval(localStorage.getItem('ov3_setup')).
// Нужны также localStorage 'ov3_emails' (раскладки + HTML, см. emails_built.json) и 'ov3_links' ({sampleId: {подпись: ссылка}}),
// window.__LINKS_SAMPLE — id образца, из которого брать ссылки кнопок.
// Работает и в скрытой вкладке (без реальных кликов).
window.__sleep=ms=>new Promise(res=>{const end=Date.now()+ms;const ch=new MessageChannel();ch.port1.onmessage=()=>{if(Date.now()>=end)res();else ch.port2.postMessage(0)};ch.port2.postMessage(0)});
window.confirm=()=>true;
window.__items=()=>[...document.querySelectorAll('.builder-item')];
window.__type=b=>[...b.classList].find(c=>c.startsWith('part-')).replace('part-mailing-','')[0];
// блоки контента — до первой картинки после начала (дальше подвал)
window.__content=()=>{const it=__items();let n=0;for(let i=0;i<it.length;i++){if(__type(it[i])==='i'&&i>0)break;n=i+1}return it.slice(0,n)};
// порядок блоков (картинка живёт в своём контейнере — её не трогаем)
window.__order=(target0)=>{const target=target0.filter(t=>t!=='i');const blocks=__content().filter(b=>__type(b)!=='i');const bld=jQuery(blocks[0]).closest('.ui-sortable')[0];const top=el=>{while(el.parentElement!==bld)el=el.parentElement;return el};const pool={};blocks.forEach(b=>{const t=__type(b);(pool[t]=pool[t]||[]).push(top(b))});const ordered=target.map(t=>pool[t].shift());ordered.forEach(n=>bld.appendChild(n));const s=jQuery(bld).sortable('instance');s.options.stop.call(bld,jQuery.Event('sortstop'),{item:jQuery(ordered[0])});return __content().map(__type).join('')};
// довести количество блоков каждого типа до нужного (удалить лишние / дублировать) и выстроить порядок
window.__restructure=async(target)=>{for(let g=0;g<40;g++){const C=__content().map(__type);const need={},have={};target.forEach(t=>need[t]=(need[t]||0)+1);C.forEach(t=>have[t]=(have[t]||0)+1);let acted=false;for(const t of ['i','t','b']){if((have[t]||0)>(need[t]||0)){__content()[C.lastIndexOf(t)].querySelector('.delete-item-link').click();acted=true;break}if((have[t]||0)<(need[t]||0)){const idx=C.lastIndexOf(t);if(idx<0)throw new Error('нет блока '+t);__content()[idx].querySelector('.copy-item-handler').click();acted=true;break}}await __sleep(700);if(!acted)break}return __order(target)};
window.__openPops=()=>[...document.querySelectorAll('.popover.setting-editor-popover')].filter(p=>p.classList.contains('in')&&getComputedStyle(p).display!=='none');
// подпись и ссылка кнопки через её панель настроек (ссылка в превью редактора не видна — проверять по странице рассылки)
window.__setBtn=async(i,label,href)=>{for(let w=0;w<40&&__openPops().length;w++){[...__openPops()].forEach(p=>{const c=[...p.querySelectorAll('button,a')].find(x=>x.innerText.trim()==='Закрыть');if(c)c.click()});await __sleep(300)}
const b=__items()[i];let pop=null;for(let w=0;w<90&&!pop;w++){if(w===0||w===40){['mouseover','mouseenter'].forEach(t=>b.dispatchEvent(new MouseEvent(t,{bubbles:true})));jQuery(b).trigger('mouseenter');b.querySelector('.setting-edit-link').click()}await __sleep(200);pop=__openPops().find(p=>/Надпись на кнопке/.test(p.textContent))||null}
if(!pop)throw new Error('нет панели '+i);const inputs=[pop.querySelector('input[name$="[inner][title]"]'),pop.querySelector('input[name$="[inner][link]"]')];if(!inputs[0]||!inputs[1])throw new Error('поля панели '+i);
const setv=(el,v)=>{el.focus();el.value=v;el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));el.dispatchEvent(new KeyboardEvent('keyup',{bubbles:true}))};
setv(inputs[0],label);setv(inputs[1],href||'');[...pop.querySelectorAll('button,a')].find(x=>x.innerText.trim()==='Сохранить и закрыть').click();
for(let w=0;w<40&&__openPops().length;w++)await __sleep(250);await __sleep(500);return label};
window.__E=JSON.parse(localStorage.getItem('ov3_emails'));
window.__L=(JSON.parse(localStorage.getItem('ov3_links')||'{}'))[String(window.__LINKS_SAMPLE||'23198108')]||{};
window.__em=k=>__E.find(e=>e.key===k);
window.__target=e=>(e.img?['i']:[]).concat(e.layout.map(b=>b[0]==='T'?'t':'b'));
window.__prep=async k=>{const e=__em(k);const r=await __restructure(__target(e));await __sleep(2000);const out=[r];const tg=__target(e);let li=0;for(let i=0;i<tg.length;i++){if(tg[i]==='i')continue;const blk=e.layout[li++];if(blk[0]==='B')out.push(await __setBtn(i,blk[1],__L[blk[1]]||''))}return out.join(' ')};
window.__texts=k=>{const e=__em(k);const tg=__target(e);const res=[];let li=0;for(let i=0;i<tg.length;i++){if(tg[i]==='i')continue;const blk=e.layout[li++];if(blk[0]==='T')res.push([i,blk[4]])}return res};
// текст: Redactor II в режиме click-to-edit; запуск через jQuery-событие, запись через code.set + callbacks.blur (он вызывает updateBlockParam)
window.__setText=async(i,html)=>{const b=__items()[i];const f=b.querySelector('.f-text');let R=jQuery(f).data('redactor');if(!(R&&R.$editor)){const s=getSelection();const r=document.createRange();r.setStart((f.querySelector('p')||f).firstChild||f,0);r.collapse(true);s.removeAllRanges();s.addRange(r);jQuery(f).trigger('click.redactor-click-to-edit');for(let k=0;k<20;k++){R=jQuery(f).data('redactor');if(R&&R.$editor)break;await __sleep(200)}}if(!(R&&R.$editor))throw new Error('редактор не запустился '+i);R.code.set(html);R.opts.callbacks.blur.call(R);await __sleep(300);return f.innerText.length};
window.__fillTexts=async k=>{const out=[];for(const [i,h] of __texts(k))out.push(await __setText(i,h));return out.join(',')};
window.__verify=async k=>{const exp=__texts(k).map(([i,h])=>{const d=document.createElement('div');d.innerHTML=h;return d.textContent.replace(/ /g,' ').replace(/\s+/g,'')});const got=__texts(k).map(([i])=>__items()[i].innerText.replace(/ /g,' ').replace(/\s+/g,''));return exp.map((x,n)=>x===got[n]?'ok':'DIFF').join(',')+' | '+__items().map(__type).join('').slice(0,14)+' | '+__content().filter(b=>__type(b)==='b').map(b=>b.querySelector('a[data-button]').innerText.slice(0,10)).join(',')};
window.__save=()=>{[...document.querySelectorAll('a,button')].find(x=>x.innerText.trim()==='Сохранить').click()};
'setup ok'
