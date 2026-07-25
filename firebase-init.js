/* ==========================================================
   firebase-init.js
   Loads the Firebase SDK config from firebase-config.js (gitignored,
   see SETUP.md) and exposes `db`, `auth`, and `authReady` for the
   page-specific scripts (board.js / vote.js / petition.js) to use.
   ========================================================== */
(function(){
  "use strict";

  if(typeof window.FIREBASE_CONFIG === "undefined"){
    document.addEventListener("DOMContentLoaded", function(){
      const el = document.createElement("div");
      el.style.cssText = "position:fixed;inset:0;background:#0A0D14;color:#F2F3F6;display:flex;align-items:center;justify-content:center;padding:24px;text-align:center;font-family:sans-serif;z-index:9999;";
      el.innerHTML = "<div>firebase-config.js가 없습니다.<br>SETUP.md의 안내에 따라 Firebase 프로젝트를 연결해주세요.</div>";
      document.body.appendChild(el);
    });
    throw new Error("Missing firebase-config.js — see SETUP.md");
  }

  firebase.initializeApp(window.FIREBASE_CONFIG);
  window.db = firebase.firestore();
  window.auth = firebase.auth();

  window.authReady = new Promise(function(resolve){
    firebase.auth().onAuthStateChanged(function(user){
      if(user){
        resolve(user);
      } else {
        firebase.auth().signInAnonymously().catch(function(e){
          console.error("Anonymous sign-in failed:", e);
        });
      }
    });
  });

  // Simple stable per-visitor nickname, editable via localStorage.
  window.getNickname = function(){
    let n = localStorage.getItem("gk_nickname");
    if(!n){
      n = "익명" + Math.floor(1000 + Math.random()*9000);
      localStorage.setItem("gk_nickname", n);
    }
    return n;
  };
  window.setNickname = function(n){
    localStorage.setItem("gk_nickname", n.trim().slice(0, 30) || window.getNickname());
  };
})();
