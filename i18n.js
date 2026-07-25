/* ==========================================================
   i18n.js — homepage (index.html) translation: EN / KO / ZH.
   Pattern mirrors mindcareapp's i18n system: data-i18n attributes +
   a flat key->string dictionary per language, applied on load and on
   language switch. Scoped to the homepage for now.
   ========================================================== */
(function(){
  "use strict";

  const LANG_KEY = "gk_lang";

  const I18N = {
    ko: {
      "nav.home":"홈", "nav.board":"자유게시판", "nav.issues":"시사·정치", "nav.vote":"투표",
      "nav.petition":"청원", "nav.guidelines":"이용규칙",
      "hero.title":"자유롭게 이야기하고, 투표하고, 목소리를 모으세요",
      "hero.subtitle":"GotoKorea는 회원가입 없이(익명 닉네임만으로) 참여할 수 있는 커뮤니티 자율 운영 플랫폼입니다. 정부·기업과 무관한 비공식 서비스입니다.",
      "share.title":"이 사이트 공유하기",
      "share.threads":"Threads에 공유",
      "share.native":"공유하기",
      "share.copy":"링크 복사",
      "share.copied":"링크가 복사되었습니다",
      "accounts.title":"주요 정치 계정 (X)",
      "accounts.desc":"X(트위터)의 공식 임베드 위젯입니다 — GotoKorea가 대신 작성하거나 편집하지 않은 원문 그대로이며, 게시 시각도 X가 실시간으로 표시합니다.",
      "accounts.groupUS":"미국",
      "accounts.groupCCP":"중국 (CCP·국영매체)",
      "accounts.groupKR":"한국",
      "accounts.groupBRICS":"BRICS (2026 의장국)",
      "accounts.bricsNote":"BRICS는 단일 공식 계정이 없어 2026년 의장국인 인도 외교부(MEA India) 계정으로 대체했습니다. 의장국은 매년 바뀝니다.",
      "card.board.title":"자유게시판", "card.board.desc":"주제 제한 없이 자유롭게 글을 남기는 공간입니다.",
      "card.issues.title":"시사·정치 토론", "card.issues.desc":"한국 사회의 현안과 정치 이슈, CCP·공산당 관련 주제를 다루는 별도 코너를 포함합니다.",
      "card.vote.title":"투표", "card.vote.desc":"운영진이 큐레이션한 현안 투표에 참여하고 실시간 결과를 확인하세요.",
      "card.petition.title":"청원", "card.petition.desc":"커뮤니티 청원을 만들고 서명을 모을 수 있습니다. (비공식·법적 효력 없음)",
      "banner.title":"안내",
      "banner.body":"이 사이트는 브라우저 방문자를 위한 익명 참여 커뮤니티입니다. 게시된 모든 의견은 작성자 개인의 견해이며 GotoKorea 운영진의 입장이 아닙니다. 이용 전 다음을 꼭 확인해주세요:",
      "recent.title":"최근 게시글", "recent.desc":"자유게시판·시사토론을 합쳐서 최신 글을 보여줍니다.",
      "footer.text":"GotoKorea는 커뮤니티가 자체 운영하는 비공식 플랫폼이며 대한민국 정부·공공기관과 무관합니다.",
      "footer.link":"이용규칙 및 콘텐츠 정책"
    },
    en: {
      "nav.home":"Home", "nav.board":"Free Board", "nav.issues":"Current Affairs", "nav.vote":"Vote",
      "nav.petition":"Petitions", "nav.guidelines":"Guidelines",
      "hero.title":"Speak freely, vote, and gather your voice",
      "hero.subtitle":"GotoKorea is a community-run participation platform — join with just an anonymous nickname, no sign-up required. Unofficial, unaffiliated with any government or company.",
      "share.title":"Share this site",
      "share.threads":"Share to Threads",
      "share.native":"Share",
      "share.copy":"Copy link",
      "share.copied":"Link copied",
      "accounts.title":"Featured Political Accounts (X)",
      "accounts.desc":"Official X (Twitter) embed widgets — unedited, straight from the source, with real-time post timestamps shown by X itself.",
      "accounts.groupUS":"United States",
      "accounts.groupCCP":"China (CCP / state media)",
      "accounts.groupKR":"Korea",
      "accounts.groupBRICS":"BRICS (2026 chair)",
      "accounts.bricsNote":"BRICS has no single official account, so this shows India's Ministry of External Affairs (MEA India), the 2026 BRICS chair. The chair rotates yearly.",
      "card.board.title":"Free Board", "card.board.desc":"An open space to post about anything, no topic restrictions.",
      "card.issues.title":"Current Affairs & Politics", "card.issues.desc":"Discussion of Korean current affairs and politics, including a dedicated CCP/Communist Party corner.",
      "card.vote.title":"Vote", "card.vote.desc":"Participate in curated polls on current issues and see live results.",
      "card.petition.title":"Petitions", "card.petition.desc":"Create community petitions and gather signatures. (Unofficial, no legal effect)",
      "banner.title":"Notice",
      "banner.body":"This site is an anonymous participation community for browser visitors. All posted opinions belong to their individual authors and do not represent GotoKorea's position. Please review this before participating:",
      "recent.title":"Recent Posts", "recent.desc":"Latest posts combined from the Free Board and Current Affairs board.",
      "footer.text":"GotoKorea is an unofficial, community-run platform unaffiliated with the Korean government or any public institution.",
      "footer.link":"Guidelines & content policy"
    },
    zh: {
      "nav.home":"首页", "nav.board":"自由留言板", "nav.issues":"时事·政治", "nav.vote":"投票",
      "nav.petition":"请愿", "nav.guidelines":"使用规则",
      "hero.title":"自由发声、投票，凝聚你的声音",
      "hero.subtitle":"GotoKorea 是社区自主运营的参与平台 — 无需注册，仅凭匿名昵称即可参与。与任何政府或企业无关的非官方服务。",
      "share.title":"分享本站",
      "share.threads":"分享到 Threads",
      "share.native":"分享",
      "share.copy":"复制链接",
      "share.copied":"链接已复制",
      "accounts.title":"重要政治账号 (X)",
      "accounts.desc":"X（推特）官方嵌入组件 — 原文未经 GotoKorea 编辑，发布时间由 X 实时显示。",
      "accounts.groupUS":"美国",
      "accounts.groupCCP":"中国（中共·官方媒体）",
      "accounts.groupKR":"韩国",
      "accounts.groupBRICS":"金砖国家（2026年主席国）",
      "accounts.bricsNote":"金砖国家没有单一官方账号，此处显示 2026 年轮值主席国印度外交部（MEA India）账号。主席国每年轮换。",
      "card.board.title":"自由留言板", "card.board.desc":"不限主题，自由发帖的空间。",
      "card.issues.title":"时事·政治讨论", "card.issues.desc":"讨论韩国社会时事与政治议题，含中共/共产党专区。",
      "card.vote.title":"投票", "card.vote.desc":"参与运营方策划的时事投票，查看实时结果。",
      "card.petition.title":"请愿", "card.petition.desc":"发起社区请愿并收集签名。（非官方，无法律效力）",
      "banner.title":"提示",
      "banner.body":"本站是面向浏览器访问者的匿名参与社区。所有发布的意见均为作者个人观点，不代表 GotoKorea 运营方立场。使用前请务必查看：",
      "recent.title":"最新帖子", "recent.desc":"汇总自由留言板与时事讨论的最新帖子。",
      "footer.text":"GotoKorea 是社区自主运营的非官方平台，与大韩民国政府及公共机构无关。",
      "footer.link":"使用规则与内容政策"
    }
  };

  let currentLang = localStorage.getItem(LANG_KEY) || "ko";
  if(!I18N[currentLang]) currentLang = "ko";

  function T(key){
    return (I18N[currentLang] && I18N[currentLang][key]) || I18N.ko[key] || key;
  }

  function apply(){
    document.documentElement.lang = currentLang;
    document.querySelectorAll("[data-i18n]").forEach(function(el){
      el.textContent = T(el.dataset.i18n);
    });
    document.querySelectorAll(".lang-switch button").forEach(function(b){
      b.classList.toggle("active", b.dataset.lang === currentLang);
    });
  }

  document.addEventListener("DOMContentLoaded", function(){
    apply();
    document.querySelectorAll(".lang-switch button").forEach(function(btn){
      btn.addEventListener("click", function(){
        currentLang = btn.dataset.lang;
        localStorage.setItem(LANG_KEY, currentLang);
        apply();
      });
    });
  });
})();
