/* ============================================================================
   Stelllar Vision — Lead Magnet funnel.
   Injects an attractive "free material" section + a multi-slide diagnostic quiz
   popup that ends by capturing email + WhatsApp and delivering a downloadable
   material. Submits to the Supabase Edge Function `claim-lead-magnet`, which
   securely upserts the customer (email-unique, deduped tags[]) and returns a
   (signed, when private) download URL. Black/white/silver, RTL, Cairo.
   ============================================================================ */
(function () {
  "use strict";

  var CFG = {
    fn: "https://olyohqzxclggjszjxqdr.supabase.co/functions/v1/claim-lead-magnet",
    key: "sb_publishable_iZBGEQVHl71XmW6fvg_95A_ILjHZvHu",
    material: "cro-checklist",
  };

  /* ---------- attribution (mirror of the booking widget) ---------- */
  function cookie(n) {
    var m = document.cookie.match("(?:^|; )" + n + "=([^;]*)");
    return m ? decodeURIComponent(m[1]) : "";
  }
  function attribution() {
    var a = {};
    try {
      a = JSON.parse(localStorage.getItem("sv_attribution_v1") || "{}") || {};
    } catch (e) {}
    return {
      source: "lead-magnet",
      utm_source: a.utm_source || "",
      utm_medium: a.utm_medium || "",
      utm_campaign: a.utm_campaign || "",
      utm_content: a.utm_content || "",
      utm_term: a.utm_term || "",
      fbc: cookie("_fbc") || a.fbc || "",
      fbp: cookie("_fbp") || a.fbp || "",
      landing_page: a.landing_page || location.href,
      referrer: a.referrer || document.referrer || "",
    };
  }

  /* ---------- quiz definition (diagnostic → growth-potential score) ---------- */
  var QUIZ = [
    {
      id: "stage",
      q: "ما مرحلة متجرك الإلكتروني الآن؟",
      a: [
        { t: "لم أُطلق متجري بعد", w: 3 },
        { t: "أطلقته حديثًا", w: 2 },
        { t: "أبيع بشكل منتظم", w: 1 },
        { t: "مبيعات كبيرة ومستقرة", w: 0 },
      ],
    },
    {
      id: "cvr",
      q: "كم متوسط معدل التحويل في متجرك؟",
      a: [
        { t: "لا أعرف / لا أقيسه", w: 3 },
        { t: "أقل من 1%", w: 3 },
        { t: "بين 1% و 2%", w: 2 },
        { t: "أكثر من 2%", w: 0 },
      ],
    },
    {
      id: "challenge",
      q: "ما أكبر تحدٍّ يواجهك حاليًا؟",
      a: [
        { t: "زيارات قليلة للمتجر", w: 2 },
        { t: "زيارات كثيرة بلا مبيعات", w: 3 },
        { t: "سلّة مشتريات متروكة", w: 2 },
        { t: "تكلفة إعلانات مرتفعة", w: 2 },
      ],
    },
    {
      id: "mobile",
      q: "هل متجرك محسّن بالكامل لتجربة الهاتف؟",
      a: [
        { t: "نعم، بالكامل", w: 0 },
        { t: "نوعًا ما", w: 2 },
        { t: "لا", w: 3 },
        { t: "لست متأكدًا", w: 3 },
      ],
    },
    {
      id: "analytics",
      q: "هل تحلّل سلوك زوّار متجرك وتتّخذ قرارات مبنية على البيانات؟",
      a: [
        { t: "نعم، بأدوات متقدمة", w: 0 },
        { t: "أساسيات فقط", w: 2 },
        { t: "لا", w: 3 },
      ],
    },
  ];
  var MAXW = QUIZ.reduce(function (s, q) {
    return (
      s +
      Math.max.apply(
        null,
        q.a.map(function (o) {
          return o.w;
        }),
      )
    );
  }, 0);

  function scoreFrom(answers) {
    var sum = 0;
    QUIZ.forEach(function (q) {
      var o = answers[q.id];
      if (o != null) sum += q.a[o].w;
    });
    return Math.round(55 + (sum / MAXW) * 37); // motivating 55–92% "growth potential"
  }

  /* ---------- styles ---------- */
  var css =
    '\
  .lm-sec{direction:rtl;font-family:Cairo,system-ui,sans-serif; padding:80px 20px;display:flex;justify-content:center}\
  .lm-wrap{position:relative;width:100%;max-width:1120px;display:grid;grid-template-columns:1.05fr .95fr;gap:50px;align-items:center;\
    background:radial-gradient(70% 90% at 88% 8%,rgba(192,192,192,.16),transparent 55%),linear-gradient(135deg,#18181b,#0b0b0d);\
    border:1px solid rgba(255,255,255,.12);border-radius:30px;padding:52px;box-sizing:border-box;\
    box-shadow:0 50px 110px -45px rgba(0,0,0,.95),inset 0 1px 0 rgba(255,255,255,.06)}\
  .lm-copy{position:relative;z-index:1}\
  @media(max-width:820px){.lm-wrap{grid-template-columns:1fr;gap:34px;padding:34px}}\
  .lm-badge{display:inline-flex;align-items:center;gap:8px;background:rgba(192,192,192,.12);border:1px solid rgba(192,192,192,.3);\
    color:#c0c0c0;font-size:.82rem;font-weight:600;padding:7px 15px;border-radius:999px;margin-bottom:20px}\
  .lm-h{font-family:"Space Grotesk",Cairo,sans-serif;font-weight:700;font-size:clamp(1.9rem,4vw,2.9rem);color:#fff;line-height:1.18;margin:0 0 16px;letter-spacing:-.01em}\
  .lm-h .g{color:#c0c0c0}\
  .lm-p{color:#a9a9b0;font-size:1.02rem;line-height:1.7;margin:0 0 24px}\
  .lm-feats{display:grid;gap:13px;margin:0 0 30px}\
  .lm-feat{display:flex;align-items:center;gap:14px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:15px;padding:14px 16px;transition:border-color .22s,background .22s,transform .22s}\
  .lm-feat:hover{border-color:rgba(192,192,192,.45);background:rgba(255,255,255,.055);transform:translateX(-4px)}\
  .lm-feat-ic{flex:none;width:44px;height:44px;border-radius:12px;background:linear-gradient(145deg,#e4e4e6,#9a9a9f);color:#0c0c0e;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 18px -7px rgba(192,192,192,.55)}\
  .lm-feat-tx{display:flex;flex-direction:column;gap:2px}\
  .lm-feat-tx b{color:#fff;font-size:1.02rem;font-weight:700;line-height:1.2}\
  .lm-feat-tx span{color:#9a9a9f;font-size:.86rem;line-height:1.4}\
  .lm-cta{display:inline-flex;align-items:center;justify-content:center;gap:10px;background:#fff;color:#000;border:none;\
    font-family:Cairo;font-weight:700;font-size:1.05rem;padding:16px 30px;border-radius:14px;cursor:pointer;transition:transform .2s,box-shadow .2s;box-shadow:0 0 0 rgba(192,192,192,0)}\
  .lm-cta:hover{transform:translateY(-2px);box-shadow:0 14px 34px -10px rgba(255,255,255,.35)}\
  .lm-cta .st{color:#c0c0c0}\
  .lm-sub{color:#7d7d85;font-size:.82rem;margin-top:12px}\
  .lm-doc{position:relative;z-index:1;background:#f5f5f6;border-radius:20px;padding:26px 24px;color:#0c0c0e;display:flex;flex-direction:column;gap:15px;\
    box-shadow:0 34px 70px -26px rgba(0,0,0,.85);transform:rotate(-1.6deg);transition:transform .45s ease}\
  .lm-doc:hover{transform:rotate(0deg) translateY(-4px)}\
  .lm-doc-top{display:flex;justify-content:space-between;align-items:center}\
  .lm-doc-brand{font-family:"Space Grotesk",Cairo;font-size:.72rem;font-weight:600;letter-spacing:1.6px;color:#7a7a80}\
  .lm-doc-tag{background:#0c0c0e;color:#fff;font-size:.7rem;font-weight:700;padding:5px 12px;border-radius:999px}\
  .lm-doc-title{font-family:"Space Grotesk",Cairo;font-weight:700;font-size:1.4rem;line-height:1.35;color:#0c0c0e;margin:0}\
  .lm-doc-list{list-style:none;padding:0;margin:0;display:grid;gap:12px}\
  .lm-doc-list li{display:flex;align-items:center;gap:11px;font-size:.94rem;color:#2a2a30;line-height:1.4}\
  .lm-doc-list li i{flex:none;width:21px;height:21px;border-radius:50%;background:#0c0c0e;color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-style:normal}\
  .lm-doc-more{display:flex;align-items:center;gap:8px;font-size:.86rem;font-weight:700;color:#0c0c0e;\
    background:linear-gradient(90deg,rgba(192,192,192,.4),rgba(192,192,192,.06));padding:10px 14px;border-radius:11px;margin-top:2px}\
  /* modal */\
  #lm-ov{position:fixed;inset:0;background:rgba(0,0,0,.82);backdrop-filter:blur(6px);z-index:100000;display:none;align-items:center;justify-content:center;padding:18px;direction:rtl;font-family:Cairo,sans-serif}\
  #lm-ov.open{display:flex}\
  .lm-modal{width:100%;max-width:560px;background:#0d0d0f;border:1px solid rgba(255,255,255,.12);border-radius:22px;padding:30px 30px 34px;position:relative;max-height:92vh;overflow:auto;box-shadow:0 40px 100px -30px #000}\
  .lm-x{position:absolute;top:16px;left:16px;width:34px;height:34px;border-radius:50%;background:rgba(255,255,255,.06);border:none;color:#cfcfd3;font-size:16px;cursor:pointer}\
  .lm-x:hover{background:rgba(255,255,255,.14);color:#fff}\
  .lm-prog{position:relative;height:5px;background:rgba(255,255,255,.08);border-radius:999px;overflow:hidden;margin:6px 0 26px}\
  .lm-prog i{position:absolute;top:0;right:0;height:100%;background:linear-gradient(to left,#c0c0c0,#fff);width:0;transition:width .4s ease}\
  .lm-step{animation:lmfade .35s ease}\
  @keyframes lmfade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}\
  .lm-kicker{color:#c0c0c0;font-size:.82rem;font-weight:600;margin-bottom:8px}\
  .lm-q{color:#fff;font-family:"Space Grotesk",Cairo;font-weight:700;font-size:1.4rem;line-height:1.35;margin:0 0 22px}\
  .lm-opts{display:grid;gap:11px}\
  .lm-opt{text-align:right;background:#151517;border:1px solid rgba(255,255,255,.12);color:#e6e6e9;font-family:Cairo;font-size:1rem;padding:15px 18px;border-radius:13px;cursor:pointer;transition:all .18s;display:flex;align-items:center;gap:12px}\
  .lm-opt:hover{border-color:#c0c0c0;background:#1b1b1e}\
  .lm-opt .dot{flex:none;width:20px;height:20px;border-radius:50%;border:2px solid rgba(255,255,255,.25)}\
  .lm-opt.sel{border-color:#c0c0c0;background:rgba(192,192,192,.1)}\
  .lm-opt.sel .dot{border-color:#c0c0c0;background:#c0c0c0;box-shadow:inset 0 0 0 3px #151517}\
  .lm-field{display:flex;flex-direction:column;gap:7px;margin-bottom:16px;text-align:right}\
  .lm-field label{color:#cfcfd3;font-size:.92rem;font-weight:500}\
  .lm-field label .rq{color:#c0c0c0}\
  .lm-field input{width:100%;box-sizing:border-box;background:#151517;border:1px solid rgba(255,255,255,.14);border-radius:12px;padding:14px 15px;color:#fff;font-family:Cairo;font-size:1rem;outline:none;text-align:right}\
  .lm-field input:focus{border-color:#c0c0c0}\
  .lm-hp{position:absolute;left:-9999px;width:1px;height:1px;opacity:0}\
  .lm-err{color:#ff9a9a;font-size:.88rem;margin:2px 0 14px;min-height:1px}\
  .lm-next{width:100%;background:#fff;color:#000;border:none;font-family:Cairo;font-weight:700;font-size:1.05rem;padding:15px;border-radius:13px;cursor:pointer;margin-top:6px}\
  .lm-next:hover{background:#e9e9ec}\
  .lm-next:disabled{opacity:.55;cursor:default}\
  .lm-back{background:transparent;border:none;color:#8b8b92;font-family:Cairo;font-size:.9rem;cursor:pointer;margin-top:14px}\
  .lm-back:hover{color:#fff}\
  .lm-score{text-align:center;padding:6px 0 4px}\
  .lm-ring{width:150px;height:150px;margin:0 auto 8px;border-radius:50%;display:flex;align-items:center;justify-content:center;\
    background:conic-gradient(#c0c0c0 var(--p),rgba(255,255,255,.08) 0)}\
  .lm-ring .in{width:120px;height:120px;border-radius:50%;background:#0d0d0f;display:flex;flex-direction:column;align-items:center;justify-content:center}\
  .lm-ring .in b{font-family:"Space Grotesk",Cairo;font-size:2.2rem;color:#fff;line-height:1}\
  .lm-ring .in span{color:#9a9a9f;font-size:.72rem;margin-top:3px}\
  .lm-dl{display:flex;align-items:center;justify-content:center;gap:10px;background:#c0c0c0;color:#000;text-decoration:none;font-family:Cairo;font-weight:700;font-size:1.05rem;padding:16px;border-radius:13px;margin-top:22px}\
  .lm-dl:hover{background:#d6d6da}\
  .lm-spin{display:inline-block;width:16px;height:16px;border:2px solid rgba(0,0,0,.3);border-top-color:#000;border-radius:50%;animation:lmspin .7s linear infinite;vertical-align:middle}\
  @keyframes lmspin{to{transform:rotate(360deg)}}\
  ';

  /* ---------- section markup ---------- */
  function sectionHTML() {
    return (
      '<div class="lm-wrap">' +
      '<div class="lm-copy">' +
      '<span class="lm-badge">✦ دليل مجاني</span>' +
      '<h2 class="lm-h">خطوات بسيطة <span class="g">تزيد مبيعات</span> متجرك الإلكتروني</h2>' +
      '<p class="lm-p">دليل عملي مجاني بخطوات واضحة جرّبناها مع عشرات المتاجر لجعل الزائر يُكمل الشراء بدل أن يخرج. طبّقها بنفسك خطوة بخطوة — بدون أي خبرة تقنية.</p>' +
      '<div class="lm-feats">' +
      '<div class="lm-feat"><span class="lm-feat-ic"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></svg></span>' +
      '<div class="lm-feat-tx"><b>جاهز للتطبيق فورًا</b><span>خطوات عملية تنفّذها بنفسك اليوم — بلا خبرة تقنية</span></div></div>' +
      '<div class="lm-feat"><span class="lm-feat-ic"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/></svg></span>' +
      '<div class="lm-feat-tx"><b>تجنّب أخطاء تُقلّل مبيعاتك</b><span>أخطاء شائعة في المتاجر — وكيف تتجنّبها بسهولة</span></div></div>' +
      '<div class="lm-feat"><span class="lm-feat-ic"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8M16.5 8a2.5 2.5 0 0 0 0-5C13 3 12 8 12 8"/></svg></span>' +
      '<div class="lm-feat-tx"><b>تعرّف على فرص نمو متجرك</b><span>نتيجة سريعة توضّح نقاط قوّتك وأين يمكنك التحسين، تصلك مع الدليل</span></div></div>' +
      "</div>" +
      '<button class="lm-cta" id="lm-open"><span class="st">✦</span> احصل على الدليل مجانًا</button>' +
      '<div class="lm-sub">بريدك الإلكتروني ورقم واتساب فقط — بدون رسائل مزعجة.</div>' +
      "</div>" +
      '<div class="lm-doc">' +
      '<div class="lm-doc-top"><span class="lm-doc-brand">STELLLAR VISION</span><span class="lm-doc-tag">دليل مجاني</span></div>' +
      '<h4 class="lm-doc-title">خطوات بسيطة لزيادة مبيعات متجرك</h4>' +
      '<ul class="lm-doc-list">' +
      "<li><i>✓</i> صور منتجات احترافية عالية الجودة</li>" +
      "<li><i>✓</i> عرض واضح للسعر والخصومات</li>" +
      "<li><i>✓</i> عرض تقييمات وآراء العملاء</li>" +
      "<li><i>✓</i> تبسيط خطوات الدفع والشراء</li>" +
      "<li><i>✓</i> سياسة شحن وإرجاع واضحة</li>" +
      "</ul>" +
      '<div class="lm-doc-more">✦ والمزيد من الخطوات داخل الدليل</div>' +
      "</div>" +
      "</div>"
    );
  }

  /* ---------- modal / quiz state ---------- */
  var ov,
    modal,
    state = { step: 0, answers: {} };
  var TOTAL = QUIZ.length + 2; // 5 questions + capture + result === full progress

  function mount() {
    var s = document.createElement("style");
    s.textContent = css;
    document.head.appendChild(s);
    ov = document.createElement("div");
    ov.id = "lm-ov";
    modal = document.createElement("div");
    modal.className = "lm-modal";
    ov.appendChild(modal);
    ov.addEventListener("click", function (e) {
      if (e.target === ov) close();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && ov.classList.contains("open")) close();
    });
    document.body.appendChild(ov);
  }
  function open() {
    state = { step: 0, answers: {} };
    ov.classList.add("open");
    document.body.style.overflow = "hidden";
    render();
  }
  function close() {
    ov.classList.remove("open");
    document.body.style.overflow = "";
  }

  function progressBar(frac) {
    return (
      '<div class="lm-prog"><i style="width:' +
      Math.round(frac * 100) +
      '%"></i></div>'
    );
  }

  function render() {
    var x = '<button class="lm-x" id="lm-close">✕</button>';
    if (state.step < QUIZ.length) {
      var q = QUIZ[state.step];
      var opts = q.a
        .map(function (o, i) {
          var sel = state.answers[q.id] === i ? " sel" : "";
          return (
            '<button class="lm-opt' +
            sel +
            '" data-i="' +
            i +
            '"><span class="dot"></span><span>' +
            o.t +
            "</span></button>"
          );
        })
        .join("");
      modal.innerHTML =
        x +
        progressBar((state.step + 1) / TOTAL) +
        '<div class="lm-step">' +
        '<div class="lm-kicker">السؤال ' +
        (state.step + 1) +
        " من " +
        QUIZ.length +
        "</div>" +
        '<h3 class="lm-q">' +
        q.q +
        "</h3>" +
        '<div class="lm-opts">' +
        opts +
        "</div>" +
        (state.step > 0
          ? '<button class="lm-back" id="lm-back">‹ السابق</button>'
          : "") +
        "</div>";
      [].slice.call(modal.querySelectorAll(".lm-opt")).forEach(function (b) {
        b.addEventListener("click", function () {
          state.answers[q.id] = +b.getAttribute("data-i");
          state.step++;
          render();
        });
      });
    } else {
      // capture step
      modal.innerHTML =
        x +
        progressBar((QUIZ.length + 1) / TOTAL) +
        '<div class="lm-step">' +
        '<div class="lm-kicker">الخطوة الأخيرة ✦</div>' +
        '<h3 class="lm-q">نتيجتك جاهزة — أرسِل الدليل إلى بريدك وواتساب</h3>' +
        '<div class="lm-field"><label>الاسم</label><input id="lm-name" autocomplete="name" placeholder="اسمك (اختياري)"></div>' +
        '<div class="lm-field"><label>البريد الإلكتروني <span class="rq">*</span></label><input id="lm-email" type="email" autocomplete="email" placeholder="you@email.com"></div>' +
        '<div class="lm-field"><label>رقم واتساب <span class="rq">*</span></label><input id="lm-phone" inputmode="tel" placeholder="+20 1X XXX XXXX"></div>' +
        '<input class="lm-hp" tabindex="-1" autocomplete="off" id="lm-company" placeholder="Company website">' +
        '<div class="lm-err" id="lm-err"></div>' +
        '<button class="lm-next" id="lm-submit">أرسِل لي الدليل المجاني</button>' +
        '<button class="lm-back" id="lm-back">‹ السابق</button>' +
        "</div>";
      modal.querySelector("#lm-submit").addEventListener("click", submit);
    }
    var c = modal.querySelector("#lm-close");
    if (c) c.addEventListener("click", close);
    var bk = modal.querySelector("#lm-back");
    if (bk)
      bk.addEventListener("click", function () {
        state.step--;
        render();
      });
  }

  function submit() {
    var name = (modal.querySelector("#lm-name") || {}).value || "";
    var email = ((modal.querySelector("#lm-email") || {}).value || "").trim();
    var phone = ((modal.querySelector("#lm-phone") || {}).value || "").trim();
    var company = (
      (modal.querySelector("#lm-company") || {}).value || ""
    ).trim();
    var err = modal.querySelector("#lm-err");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      err.textContent = "يرجى إدخال بريد إلكتروني صحيح.";
      return;
    }
    if (phone.replace(/\D/g, "").length < 8) {
      err.textContent = "يرجى إدخال رقم واتساب صحيح.";
      return;
    }
    err.textContent = "";
    var btn = modal.querySelector("#lm-submit");
    btn.disabled = true;
    btn.innerHTML = '<span class="lm-spin"></span> جارٍ التجهيز…';
    var score = scoreFrom(state.answers);
    var payload = {
      email: email,
      phone: phone,
      name: name,
      material: CFG.material,
      score: score,
      quiz: state.answers,
      company_website: company,
      attribution: attribution(),
    };
    fetch(CFG.fn, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: CFG.key,
        Authorization: "Bearer " + CFG.key,
      },
      body: JSON.stringify(payload),
    })
      .then(function (r) {
        return r.json().catch(function () {
          return { ok: false };
        });
      })
      .then(function (res) {
        if (!res || res.ok !== true) {
          btn.disabled = false;
          btn.textContent = "أرسِل لي الدليل المجاني";
          err.textContent =
            res && res.error === "rate_limited"
              ? "محاولات كثيرة، حاول بعد قليل."
              : "حدث خطأ، حاول مرة أخرى.";
          return;
        }
        try {
          if (window.fbq)
            fbq("track", "Lead", {
              content_name: "lead-magnet-" + CFG.material,
            });
        } catch (e) {}
        showResult(score, res.download_url);
      })
      .catch(function () {
        btn.disabled = false;
        btn.textContent = "أرسِل لي الدليل المجاني";
        err.textContent = "تعذّر الاتصال، تحقّق من الإنترنت.";
      });
  }

  function showResult(score, url) {
    var dl = url ? (url.charAt(0) === "/" ? location.origin + url : url) : "#";
    modal.innerHTML =
      '<button class="lm-x" id="lm-close">✕</button>' +
      progressBar(1) +
      '<div class="lm-step lm-score">' +
      '<div class="lm-ring" style="--p:' +
      score * 3.6 +
      'deg"><div class="in"><b>' +
      score +
      "%</b><span>إمكانية النمو</span></div></div>" +
      '<h3 class="lm-q" style="margin:14px 0 6px">متجرك يملك إمكانية نمو كبيرة 🚀</h3>' +
      '<p style="color:#a9a9b0;font-size:.98rem;line-height:1.7;margin:0 18px">بناءً على إجاباتك، هناك فرص واضحة لزيادة مبيعاتك. الدليل التالي يدلّك على أهمّها خطوة بخطوة.</p>' +
      '<a class="lm-dl" href="' +
      dl +
      '" target="_blank" rel="noopener" download>⬇ حمّل الدليل الآن</a>' +
      '<div class="lm-sub" style="text-align:center">أرسلنا نسخة أيضًا إلى بريدك. جاهز لخطوة أكبر؟ <b style="color:#c0c0c0;cursor:pointer" id="lm-book">احجز استشارة مجانية</b></div>' +
      "</div>";
    modal.querySelector("#lm-close").addEventListener("click", close);
    var bk = modal.querySelector("#lm-book");
    if (bk)
      bk.addEventListener("click", function () {
        close();
        var f = document.querySelector('#cf-opener,[id^="cf-"]');
        if (window.__go) window.__go("cta");
      });
  }

  /* ---------- inject the section ---------- */
  function injectSection() {
    if (document.getElementById("lead-magnet")) return true;
    // place just before the contact form section ("...بقدر ما تعمل...")
    var anchor = [].slice
      .call(document.querySelectorAll("h1,h2,h3,h4"))
      .filter(function (e) {
        return (
          (e.textContent || "").indexOf("بقدر ما تعمل") >= 0 &&
          e.getClientRects().length
        );
      })[0];
    var target = null;
    if (anchor) {
      target = anchor;
      for (var i = 0; i < 10 && target.parentElement; i++) {
        target = target.parentElement;
        if (target.offsetHeight >= 460 && target.offsetHeight < 2200) break;
      }
    }
    if (!target || target === document.body || target.offsetHeight >= 2600) {
      var work = document.getElementById("work");
      if (!work) return false;
      target = work.nextElementSibling || work;
    }
    var sec = document.createElement("section");
    sec.id = "lead-magnet";
    sec.className = "lm-sec";
    sec.innerHTML = sectionHTML();
    target.parentNode.insertBefore(sec, target);
    sec.querySelector("#lm-open").addEventListener("click", open);
    return true;
  }

  function init() {
    mount();
    var tries = 0;
    var iv = setInterval(function () {
      if (injectSection() || ++tries >= 20) clearInterval(iv);
    }, 700);
  }
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", init);
  else init();
})();
