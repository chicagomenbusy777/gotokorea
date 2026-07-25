/* ==========================================================
   common.js — shared UI helpers: toast, mobile nav toggle,
   nickname prompt, HTML escaping. Loaded on every page.
   ========================================================== */
(function(){
  "use strict";

  let toastTimer = null;
  window.toast = function(msg){
    const el = document.getElementById("toast");
    if(!el) return;
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function(){ el.classList.remove("show"); }, 2400);
  };

  window.escapeHtml = function(str){
    return String(str).replace(/[&<>"']/g, function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
    });
  };

  window.fmtDate = function(date){
    if(!date) return "";
    const d = date.toDate ? date.toDate() : new Date(date);
    if(isNaN(d)) return "";
    return d.toLocaleString("ko-KR", { year:"numeric", month:"2-digit", day:"2-digit", hour:"2-digit", minute:"2-digit" });
  };

  document.addEventListener("DOMContentLoaded", function(){
    const menuBtn = document.getElementById("menuBtn");
    const nav = document.getElementById("topNav");
    if(menuBtn && nav){
      menuBtn.addEventListener("click", function(){ nav.classList.toggle("open"); });
    }

    const nickBtn = document.getElementById("nicknameBtn");
    if(nickBtn){
      const refresh = function(){ nickBtn.textContent = "닉네임: " + window.getNickname(); };
      refresh();
      nickBtn.addEventListener("click", function(){
        const next = prompt("닉네임을 입력하세요 (다른 사람에게 표시됩니다)", window.getNickname());
        if(next && next.trim()){
          window.setNickname(next);
          refresh();
        }
      });
    }
  });
})();
