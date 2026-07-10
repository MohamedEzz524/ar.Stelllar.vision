/* ============================================================================
   Stelllar Vision — booking form + calendar, matched to the reference site
   (stelllar.vision). The on-page form is REPLACED with the reference's
   qualifying questions (+ conditional logic) and an opener that launches the
   calendar to pick day+slot. Submit posts to the SAME booking API, so CRM lead
   capture + Google Calendar event creation keep working unchanged.
     GET /availability/year   GET /availability/day   POST /bookings/create
   ============================================================================ */
(function () {
  'use strict';
  var API = 'https://stellar-vision-booking-api-production.up.railway.app/api';
  var TZ = 'Africa/Cairo';
  var ATTR_KEY = 'sv_attribution_v1';
  var SUBMIT_KEY = 'calendar_booking_submitted';

  var AR_MONTHS = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
  var EN_MON_ABBR = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var AR_DOW = ['أحد','إثنين','ثلاثاء','أربعاء','خميس','جمعة','سبت'];

  /* ---------- attribution ---------- */
  function readCookie(n){ if(!document.cookie) return null; var m=document.cookie.match(new RegExp('(?:^|;\\s*)'+n.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'=([^;]*)')); return m?decodeURIComponent(m[1]):null; }
  function captureAttribution(){ try{ if(localStorage.getItem(ATTR_KEY)) return; var p=new URLSearchParams(location.search),d={},k,keys=['utm_source','utm_medium','utm_campaign','utm_content','utm_term']; var fb=p.get('fbclid'); if(fb)d.fbclid=fb; for(k=0;k<keys.length;k++){var v=p.get(keys[k]); if(v)d[keys[k]]=v;} var ref=document.referrer,ext=ref&&ref.indexOf(location.origin)!==0; if(!d.fbclid&&!d.utm_source&&!d.utm_campaign&&!ext) return; d.landing_page=location.href; if(ref)d.referrer=ref; d.initial_timestamp=new Date().toISOString(); localStorage.setItem(ATTR_KEY,JSON.stringify(d)); }catch(e){} }
  function attributionPayload(){ var out={}; try{ var raw=localStorage.getItem(ATTR_KEY); if(raw){var s=JSON.parse(raw); for(var k in s){ if(typeof s[k]==='string'&&s[k]) out[k]=s[k]; }} }catch(e){} var fbp=readCookie('_fbp'); if(fbp)out.fbp=fbp; var fbc=readCookie('_fbc'); if(fbc)out.fbc=fbc; return out; }

  /* ---------- data ---------- */
  function fetchYear(y){ return fetch(API+'/availability/year?year='+y+'&timezone='+encodeURIComponent(TZ),{headers:{Accept:'application/json'},mode:'cors'}).then(function(r){return r.status===404?[]:r.ok?r.json():[];}).catch(function(){return [];}); }
  function fetchDay(d){ return fetch(API+'/availability/day?date='+d+'&timezone='+encodeURIComponent(TZ),{headers:{Accept:'application/json'},mode:'cors'}).then(function(r){return r.ok?r.json():null;}).catch(function(){return null;}); }
  function bookableSlots(data){ if(!data||!data.slots) return []; var now=Date.now(); return data.slots.filter(function(s){return s.status==='available'&&new Date(s.start_time).getTime()>now;}); }

  /* ---------- helpers ---------- */
  function inWindow(m,y){ var n=new Date(),d=(y-n.getFullYear())*12+(m-n.getMonth()); return d>=0&&d<=2; }
  function pad(n){ return (n<10?'0':'')+n; }
  function slotLabel(iso){ return new Intl.DateTimeFormat('ar-EG',{timeZone:TZ,hour:'numeric',minute:'2-digit',hour12:true}).format(new Date(iso)); }
  function el(tag, cls, html){ var e=document.createElement(tag); if(cls)e.className=cls; if(html!=null)e.innerHTML=html; return e; }

  /* ---------- state ---------- */
  var now0=new Date();
  var st={ month:now0.getMonth(), year:now0.getFullYear(), yearData:{}, selDate:null };
  var selectedSlot=null, onPickCb=null;

  /* ---------- styles ---------- */
  var css='\
  #sv-cal-ov{position:fixed;inset:0;z-index:2147483000;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.72);backdrop-filter:blur(6px);direction:rtl;font-family:Cairo,system-ui,sans-serif}\
  #sv-cal-ov.open{display:flex}\
  .sv-cal{width:min(680px,94vw);max-height:92vh;overflow:auto;background:#0c0c0d;border:1px solid rgba(255,255,255,.12);border-radius:20px;padding:26px 26px 30px;color:#fff;position:relative}\
  .sv-x{position:absolute;top:16px;left:16px;width:34px;height:34px;border-radius:50%;border:1px solid rgba(255,255,255,.15);background:transparent;color:#fff;font-size:18px;cursor:pointer}\
  .sv-x:hover{border-color:#c0c0c0;color:#c0c0c0}\
  .sv-h{font-weight:700;font-size:1.35rem;text-align:center;margin:2px 0 4px;color:#fff}\
  .sv-sub{color:#9a9a9f;text-align:center;font-size:.9rem;margin-bottom:18px}\
  .sv-nav{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}\
  .sv-nav b{font-size:1.05rem;font-weight:600}\
  .sv-nav button{width:36px;height:36px;border-radius:10px;border:1px solid rgba(255,255,255,.14);background:transparent;color:#fff;cursor:pointer;font-size:16px}\
  .sv-nav button:disabled{opacity:.3}.sv-nav button:not(:disabled):hover{border-color:#c0c0c0}\
  .sv-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:6px}\
  .sv-dow{color:#7a7a7f;font-size:.72rem;text-align:center;padding:6px 0}\
  .sv-day{aspect-ratio:1;border:1px solid transparent;border-radius:10px;background:rgba(255,255,255,.03);color:#e5e5e8;font-family:Cairo;font-size:.95rem;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s}\
  .sv-day:hover:not(:disabled){background:#c0c0c0;color:#000;transform:translateY(-1px)}\
  .sv-day:disabled{opacity:.22;cursor:default;background:transparent}\
  .sv-slots{display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:8px;margin-top:6px}\
  .sv-slot{padding:10px 6px;border-radius:10px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.03);color:#fff;font-family:Cairo;font-size:.9rem;cursor:pointer}\
  .sv-slot:hover{border-color:#c0c0c0}\
  .sv-back{background:transparent;border:none;color:#9a9a9f;cursor:pointer;font-family:Cairo;font-size:.9rem;margin-bottom:10px}.sv-back:hover{color:#fff}\
  .sv-empty{color:#9a9a9f;text-align:center;padding:24px}\
  /* contact form (rebuilt to match reference) */\
  .sv-cf{direction:rtl;text-align:right;font-family:Cairo,sans-serif;display:grid;grid-template-columns:1fr 1fr;gap:18px 22px;padding:6px 2px;max-width:940px;margin-inline:auto;width:100%;box-sizing:border-box}\
  .sv-cf>.sv-cf-row,.sv-cf>.sv-opener,.sv-cf>.sv-formerr,.sv-cf>.sv-cf-submit{grid-column:1/-1}\
  @media(max-width:640px){.sv-cf{grid-template-columns:1fr}}\
  .sv-cf-row{display:grid;grid-template-columns:1fr 1fr;gap:16px}\
  @media(max-width:760px){.sv-cf-row{grid-template-columns:1fr}}\
  .sv-cf-field{display:flex;flex-direction:column;gap:7px;text-align:right}\
  .sv-cf-field label{font-size:.9rem;color:#cfcfd3;font-weight:500}\
  .sv-cf-field .rq{color:#c0c0c0}\
  .sv-cf-field input,.sv-cf-field select,.sv-cf-field textarea{width:100%;background:#141416;border:1px solid rgba(255,255,255,.14);border-radius:11px;padding:13px 15px;color:#fff;font-family:Cairo;font-size:.95rem;outline:none;text-align:right}\
  .sv-cf-field input:focus,.sv-cf-field select:focus,.sv-cf-field textarea:focus{border-color:#c0c0c0}\
  .sv-cf-field select{appearance:none;background-image:linear-gradient(45deg,transparent 50%,#9a9a9f 50%),linear-gradient(135deg,#9a9a9f 50%,transparent 50%);background-position:calc(0% + 16px) calc(1.2em),calc(0% + 21px) calc(1.2em);background-size:5px 5px,5px 5px;background-repeat:no-repeat}\
  .sv-cf-cond{display:none;grid-column:1/-1}.sv-cf-cond.show{display:block}\
  .sv-opener{width:100%;display:flex;align-items:center;justify-content:center;gap:10px;background:#141416;border:1px dashed rgba(255,255,255,.25);border-radius:12px;padding:15px;color:#fff;font-family:Cairo;font-size:.95rem;font-weight:600;cursor:pointer;transition:all .2s}\
  .sv-opener:hover{border-color:#c0c0c0;color:#c0c0c0}.sv-opener.picked{border-style:solid;border-color:#c0c0c0;background:rgba(192,192,192,.08)}\
  .sv-opener .svo-star{color:#c0c0c0;font-size:1.1rem}.sv-opener .svo-edit{margin-inline-start:auto;color:#9a9a9f;font-size:.8rem;font-weight:400}\
  .sv-formerr{color:#ff9a9a;font-size:.88rem;text-align:center}\
  .sv-cf-submit{background:#c0c0c0;color:#000;border:none;border-radius:11px;padding:15px;font-family:Cairo;font-weight:700;font-size:1rem;cursor:pointer}\
  .sv-cf-submit:hover{background:#d4d4d8}\
  .sv-okbanner{background:rgba(192,192,192,.1);border:1px solid #c0c0c0;border-radius:14px;padding:22px;color:#fff;font-family:Cairo;text-align:center;font-size:1.05rem}\
  @media(max-width:520px){.sv-h{font-size:1.2rem}.sv-cal{padding:20px 16px 24px}}';

  /* ---------- modal picker ---------- */
  var ov, body;
  function mount(){
    var s=document.createElement('style'); s.textContent=css; document.head.appendChild(s);
    ov=el('div'); ov.id='sv-cal-ov';
    var box=el('div','sv-cal'); var x=el('button','sv-x','✕'); x.onclick=close;
    body=el('div'); box.appendChild(x); box.appendChild(body); ov.appendChild(box);
    ov.addEventListener('click',function(e){ if(e.target===ov) close(); });
    document.addEventListener('keydown',function(e){ if(e.key==='Escape'&&ov.classList.contains('open')) close(); });
    document.body.appendChild(ov);
  }
  function open(){ ov.classList.add('open'); document.body.style.overflow='hidden'; renderMonth(); ensureYear(st.year); }
  function close(){ ov.classList.remove('open'); document.body.style.overflow=''; }
  function ensureYear(y){ if(st.yearData[y]){ renderMonth(); return; } fetchYear(y).then(function(rows){ st.yearData[y]=rows; renderMonth(); }); }
  function availDaysFor(m,y){ var rows=st.yearData[y]||[]; var ab=EN_MON_ABBR[m]; for(var i=0;i<rows.length;i++){ if(rows[i].year===y&&rows[i].month===ab) return rows[i].availableDays; } return []; }
  function renderMonth(){
    body.innerHTML='';
    body.appendChild(el('div','sv-h','اختر موعد المكالمة'));
    body.appendChild(el('div','sv-sub','مكالمة استكشافية 30 دقيقة'));
    var loaded=!!st.yearData[st.year];
    var nav=el('div','sv-nav'); var prev=el('button',null,'›'), next=el('button',null,'‹');
    var atStart=(st.year<now0.getFullYear())||(st.year===now0.getFullYear()&&st.month<=now0.getMonth());
    var atEnd=!inWindow((st.month+1)%12, st.month===11?st.year+1:st.year);
    prev.disabled=atStart; next.disabled=atEnd;
    prev.onclick=function(){ if(atStart)return; if(st.month===0){st.month=11;st.year--;}else st.month--; ensureYear(st.year); };
    next.onclick=function(){ if(atEnd)return; if(st.month===11){st.month=0;st.year++;}else st.month++; ensureYear(st.year); };
    nav.appendChild(next); nav.appendChild(el('b',null,AR_MONTHS[st.month]+' '+st.year)); nav.appendChild(prev);
    body.appendChild(nav);
    var grid=el('div','sv-grid'); for(var d=0;d<7;d++) grid.appendChild(el('div','sv-dow',AR_DOW[d]));
    var first=new Date(st.year,st.month,1).getDay(), dim=new Date(st.year,st.month+1,0).getDate();
    for(var i=0;i<first;i++) grid.appendChild(el('div'));
    var avail=availDaysFor(st.month,st.year), todayMid=new Date(now0.getFullYear(),now0.getMonth(),now0.getDate()).getTime();
    for(var day=1;day<=dim;day++){ (function(day){ var b=el('button','sv-day',String(day));
      if(new Date(st.year,st.month,day).getTime()<todayMid||avail.indexOf(day)<0||!loaded) b.disabled=true; else b.onclick=function(){ pickDay(day); };
      grid.appendChild(b); })(day); }
    body.appendChild(grid);
    if(!loaded) body.appendChild(el('div','sv-empty','جارٍ تحميل المواعيد…'));
  }
  function pickDay(day){
    st.selDate={year:st.year,month:st.month,day:day}; body.innerHTML='';
    var back=el('button','sv-back','› رجوع للتقويم'); back.onclick=renderMonth; body.appendChild(back);
    body.appendChild(el('div','sv-h','اختر الوقت'));
    body.appendChild(el('div','sv-sub',day+' '+AR_MONTHS[st.month]+' '+st.year));
    var loading=el('div','sv-empty','جارٍ تحميل الأوقات…'); body.appendChild(loading);
    fetchDay(st.year+'-'+pad(st.month+1)+'-'+pad(day)).then(function(data){
      var slots=bookableSlots(data); loading.remove();
      if(!slots.length){ body.appendChild(el('div','sv-empty','لا توجد أوقات متاحة في هذا اليوم.')); return; }
      var wrap=el('div','sv-slots'); slots.forEach(function(s){ var b=el('button','sv-slot',slotLabel(s.start_time)); b.onclick=function(){ choose(s); }; wrap.appendChild(b); });
      body.appendChild(wrap);
    });
  }
  function choose(slot){ selectedSlot=slot; if(onPickCb) onPickCb(slot); close(); }
  function openPicker(cb){ onPickCb=cb; open(); }

  /* ---------- booking POST ---------- */
  function book(fields){
    if(!selectedSlot) return Promise.reject(new Error('no-slot'));
    var payload=Object.assign({ name:fields.name, email:fields.email, slot_start_time:new Date(selectedSlot.start_time).toISOString(),
      description:fields.description, timezone:TZ, event_source_url:location.href }, attributionPayload());
    return fetch(API+'/bookings/create',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},mode:'cors',body:JSON.stringify(payload)})
      .then(function(r){ if(!r.ok) throw new Error('HTTP '+r.status); return r.json().catch(function(){return {};}); })
      .then(function(res){ try{ localStorage.setItem(SUBMIT_KEY,JSON.stringify({submittedAt:Date.now()})); }catch(e){} return res; });
  }

  /* ---------- rebuilt contact form (reference qualifying questions) ---------- */
  function req(){ return '<span class="rq"> *</span>'; }
  var FORM_HTML =
    '<div class="sv-cf">'+
    '<div class="sv-cf-row">'+
      '<div class="sv-cf-field"><label>الاسم'+req()+'</label><input id="cf-name" autocomplete="name"></div>'+
      '<div class="sv-cf-field"><label>البريد الإلكتروني'+req()+'</label><input id="cf-email" type="email" autocomplete="email"></div>'+
    '</div>'+
    '<div class="sv-cf-field"><label>الهاتف / واتساب'+req()+'</label><input id="cf-phone" inputmode="tel" placeholder="+20 1X XXX XXXX"></div>'+
    '<div class="sv-cf-field"><label>ما مرحلة نشاطك التجاري؟'+req()+'</label><select id="cf-stage"><option value="">اختر…</option><option value="just_starting_out">في البداية</option><option value="already_active">نشط بالفعل</option></select></div>'+
    '<div class="sv-cf-cond" data-when="cf-stage=just_starting_out"><div class="sv-cf-field"><label>هل ميزانية إعلاناتك أكثر من 600$ شهريًا؟'+req()+'</label><select id="cf-ads"><option value="">اختر…</option><option value="نعم">نعم</option><option value="لا">لا</option></select></div></div>'+
    '<div class="sv-cf-cond" data-when="cf-stage=already_active"><div class="sv-cf-row"><div class="sv-cf-field"><label>إجمالي مبيعات الشهر الماضي (مع العملة)'+req()+'</label><input id="cf-sales" placeholder="مثال: 200000 ج.م"></div><div class="sv-cf-field"><label>معدل التحويل الشهر الماضي'+req()+'</label><input id="cf-cvr" placeholder="مثال: %2.5"></div></div></div>'+
    '<div class="sv-cf-field"><label>كيف يمكننا مساعدتك؟'+req()+'</label><select id="cf-help"><option value="">اختر…</option><option value="boost_performance">تحسين أداء موقعي</option><option value="specific_edit">أريد تعديلًا محددًا على موقعي</option><option value="need_new_website">لا أملك موقعًا وأحتاج واحدًا جديدًا</option></select></div>'+
    '<div class="sv-cf-cond" data-when="cf-help=boost_performance,specific_edit"><div class="sv-cf-row"><div class="sv-cf-field"><label>رابط موقعك الحالي'+req()+'</label><input id="cf-site" placeholder="https://"></div><div class="sv-cf-field"><label>إنستغرام العلامة التجارية</label><input id="cf-insta" placeholder="@username"></div></div></div>'+
    '<div class="sv-cf-cond" data-when="cf-help=need_new_website"><div class="sv-cf-field"><label>مواقع مرجعية / مصادر إلهام (أو اكتب: لا)'+req()+'</label><input id="cf-ref" placeholder="روابط أو: لا"></div></div>'+
    '<div class="sv-cf-field"><label>هل أنت صاحب النشاط؟'+req()+'</label><select id="cf-owner"><option value="">اختر…</option><option value="yes">نعم</option><option value="marketing_team">لا، من فريق التسويق</option><option value="other">أخرى</option></select></div>'+
    '<div class="sv-cf-cond" data-when="cf-owner=yes"><div class="sv-cf-field"><label>هل لديك شركاء في العمل؟'+req()+'</label><select id="cf-partners"><option value="">اختر…</option><option value="نعم">نعم</option><option value="لا">لا</option></select></div></div>'+
    '<button type="button" class="sv-opener" id="cf-opener"></button>'+
    '<div class="sv-formerr" id="cf-err" style="display:none"></div>'+
    '<button type="button" class="sv-cf-submit" id="cf-submit">احجز المكالمة الآن</button>'+
    '</div>';

  function gv(id){ var e=document.getElementById(id); return e?(e.value||'').trim():''; }
  function setOpenerLabel(op){
    if(selectedSlot){ var iso=selectedSlot.start_time, d=new Date(iso);
      var dd=new Intl.DateTimeFormat('ar-EG',{timeZone:TZ,day:'numeric',month:'long'}).format(d);
      op.className='sv-opener picked'; op.innerHTML='<span class="svo-star">✦</span><span>'+dd+' — '+slotLabel(iso)+'</span><span class="svo-edit">تغيير</span>';
    } else { op.className='sv-opener'; op.innerHTML='<span class="svo-star">✦</span><span>اختر يوم وموعد المكالمة</span>'; }
  }
  function toggleConds(c){
    [].slice.call(c.querySelectorAll('.sv-cf-cond')).forEach(function(g){
      var w=(g.getAttribute('data-when')||'').split('='); var id=w[0], vals=(w[1]||'').split(',');
      var cur=gv(id); g.classList.toggle('show', vals.indexOf(cur)>=0);
    });
  }
  function findFormContainer(){
    var mountEl=document.getElementById('booking-mount'); if(mountEl) return mountEl; // clean build mount
    var labels=[].slice.call(document.querySelectorAll('p,span,div,button,a')).filter(function(e){ return e.getClientRects().length && ['إرسال','Submit'].indexOf((e.textContent||'').replace(/\s+/g,' ').trim())>=0 && e.children.length<=1; });
    for(var i=0;i<labels.length;i++){ var p=labels[i]; for(var k=0;k<16&&p.parentElement;k++){ p=p.parentElement; if(p.querySelector('[name="Name"]')&&p.querySelector('[name="Email"]')) return p; } }
    return null;
  }
  function unhide(node){ // self-heal: some devices leave the contact section under a
    var a=node;          // Framer appear-animation (opacity:0) whose element lacks the
    for(var i=0;i<16&&a&&a!==document.body;i++){ // data-framer-appear-id our CSS targets.
      var cs=getComputedStyle(a);
      if(parseFloat(cs.opacity)<1) a.style.setProperty('opacity','1','important');
      if(cs.visibility==='hidden') a.style.setProperty('visibility','visible','important');
      if(cs.display==='none') a.style.setProperty('display','block','important');
      if(a.hasAttribute&&a.hasAttribute('data-framer-appear-id')) a.style.setProperty('transform','none','important');
      a=a.parentElement;
    }
  }
  function renderForm(){
    var c=findFormContainer(); if(!c) return; if(c.__svForm) return; c.__svForm=true;
    c.innerHTML=FORM_HTML; c.style.direction='rtl'; unhide(c);
    var opener=c.querySelector('#cf-opener'); setOpenerLabel(opener);
    opener.addEventListener('click',function(e){ e.preventDefault(); openPicker(function(){ setOpenerLabel(opener); }); });
    ['cf-stage','cf-help','cf-owner'].forEach(function(id){ var s=document.getElementById(id); if(s) s.addEventListener('change',function(){ toggleConds(c); }); });
    toggleConds(c);
    c.querySelector('#cf-submit').addEventListener('click',function(e){ e.preventDefault(); submitForm(c); });
  }

  function txt(map,v){ return map[v]||v||'—'; }
  function buildDescription(){
    var STAGE={just_starting_out:'Just starting out',already_active:'Already active'};
    var HELP={boost_performance:'Boost website performance',specific_edit:'I want a specific edit to my website',need_new_website:"I don't have a website so I need a new one"};
    var OWNER={yes:'Yes',marketing_team:"No, I'm from the marketing team",other:'Other'};
    var stage=gv('cf-stage'), help=gv('cf-help'), owner=gv('cf-owner');
    var L=['Additional Information:','────────────────────','Business Stage: '+txt(STAGE,stage)];
    if(stage==='just_starting_out') L.push('Is your ads budget higher than 600$ per month? '+gv('cf-ads'));
    if(stage==='already_active'){ L.push('Last month total sales (include currency): '+gv('cf-sales')); L.push('Last month conversion rate: '+gv('cf-cvr')); }
    L.push('How can we help you? '+txt(HELP,help));
    if(help==='boost_performance'||help==='specific_edit') L.push('Current website link: '+gv('cf-site'));
    L.push('Brand Instagram link: '+(gv('cf-insta')||'—'));
    if(help==='need_new_website') L.push('Reference websites / inspiration: '+gv('cf-ref'));
    L.push('Are you the owner? '+txt(OWNER,owner));
    if(owner==='yes') L.push('Do you have partners in the business? '+gv('cf-partners'));
    L.push('Phone Number: '+gv('cf-phone'));
    return '\n'+L.join('\n')+'\n';
  }
  function submitForm(c){
    var err=c.querySelector('#cf-err');
    function fail(m){ err.style.display='block'; err.textContent=m; err.scrollIntoView({behavior:'smooth',block:'center'}); }
    var name=gv('cf-name'), email=gv('cf-email'), phone=gv('cf-phone');
    var stage=gv('cf-stage'), help=gv('cf-help'), owner=gv('cf-owner');
    if(!name||!email||!phone) return fail('يرجى تعبئة الاسم والبريد الإلكتروني والهاتف.');
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail('يرجى إدخال بريد إلكتروني صحيح.');
    if(!stage) return fail('يرجى تحديد مرحلة نشاطك.');
    if(stage==='just_starting_out'&&!gv('cf-ads')) return fail('يرجى الإجابة عن سؤال الميزانية.');
    if(stage==='already_active'&&(!gv('cf-sales')||!gv('cf-cvr'))) return fail('يرجى إدخال مبيعات ومعدل تحويل الشهر الماضي.');
    if(!help) return fail('يرجى تحديد كيف يمكننا مساعدتك.');
    if((help==='boost_performance'||help==='specific_edit')&&!gv('cf-site')) return fail('يرجى إدخال رابط موقعك الحالي.');
    if(help==='need_new_website'&&!gv('cf-ref')) return fail('يرجى إدخال مواقع مرجعية أو كتابة: لا.');
    if(!owner) return fail('يرجى تحديد صفتك.');
    if(owner==='yes'&&!gv('cf-partners')) return fail('يرجى الإجابة عن سؤال الشركاء.');
    if(!selectedSlot) return fail('يرجى اختيار يوم وموعد للمكالمة أولًا.');
    err.style.display='none';
    var btn=c.querySelector('#cf-submit'), old=btn.textContent; btn.textContent='جارٍ الإرسال…'; btn.style.opacity='.6'; btn.style.pointerEvents='none';
    book({ name:name, email:email, description:buildDescription() })
      .then(function(){ c.innerHTML='<div class="sv-okbanner">✦ تم تأكيد حجزك بنجاح!<br>أرسلنا دعوة تقويم إلى '+email+'. نراك قريبًا في '+st.selDate.day+' '+AR_MONTHS[st.selDate.month]+' الساعة '+slotLabel(selectedSlot.start_time)+'.</div>'; })
      .catch(function(){ btn.textContent=old; btn.style.opacity=''; btn.style.pointerEvents=''; fail('تعذّر إتمام الحجز. حاول مرة أخرى أو تواصل معنا مباشرة عبر grow@stelllar.vision'); });
  }

  /* ---------- CTA buttons -> scroll to form ---------- */
  function scrollToForm(){ var c=findFormContainer(); if(c) c.scrollIntoView({behavior:'smooth',block:'start'}); }
  function isBookingCTA(a){ var t=(a.textContent||'').replace(/\s+/g,' ').trim(); var h=a.getAttribute('href')||'';
    if(t==='لنعمل معًا'||t==='تواصل معنا'||t==='Get in touch'||t==='احجز مكالمة'||t==='اعرف المزيد') return true;
    if(h.indexOf('./services')===0||h==='./about'||h==='./contact'||h.indexOf('#form')>=0||h==='#contact'||h==='#cta') return true; return false; }
  function wireClicks(){
    document.addEventListener('click',function(e){
      var a=e.target.closest?e.target.closest('a,button,[role="button"]'):null; if(!a) return;
      if(isBookingCTA(a)){ e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation(); scrollToForm(); }
    },true);
  }

  function init(){ captureAttribution(); mount(); wireClicks();
    var tries=0; var iv=setInterval(function(){ renderForm(); if(++tries>=12) clearInterval(iv); }, 700);
    window.StellarCalendar={ openPicker:openPicker, close:close, getSlot:function(){return selectedSlot;} };
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
