/* ==========================================================
   board.js — generic bulletin-board module.
   Powers board.html (자유게시판) and issues.html (시사/정치 + CCP corner).
   Configured per-page via a `window.BOARD_CONFIG` object:
     {
       categories: [{ key:"free", label:"자유" }, ...],
       defaultCategory: "free",
       ccpGuidelineCategory: "ccp"   // optional: shows the pinned banner when this category is active
     }
   ========================================================== */
(function(){
  "use strict";

  const CFG = window.BOARD_CONFIG;
  if(!CFG) return;

  let currentCategory = CFG.defaultCategory;
  let unsubscribeList = null;

  const els = {
    pills: document.getElementById("categoryFilters"),
    list: document.getElementById("postList"),
    ccpBanner: document.getElementById("ccpBanner"),
    newForm: document.getElementById("newPostForm"),
    newFormCard: document.getElementById("newPostFormCard"),
    banNotice: document.getElementById("banNotice"),
    title: document.getElementById("postTitle"),
    body: document.getElementById("postBody"),
    submitBtn: document.getElementById("submitPostBtn"),
    detail: document.getElementById("postDetail"),
    detailBack: document.getElementById("detailBack"),
    detailTitle: document.getElementById("detailTitle"),
    detailMeta: document.getElementById("detailMeta"),
    detailBody: document.getElementById("detailBody"),
    detailReport: document.getElementById("detailReport"),
    commentList: document.getElementById("commentList"),
    commentInput: document.getElementById("commentInput"),
    commentBtn: document.getElementById("commentBtn"),
    boardView: document.getElementById("boardView")
  };

  let isBanned = false;

  function applyBanState(){
    if(!els.banNotice) return;
    els.banNotice.style.display = isBanned ? "block" : "none";
    if(els.newFormCard) els.newFormCard.style.display = isBanned ? "none" : "block";
    if(els.commentBtn) els.commentBtn.disabled = isBanned;
    if(els.commentInput) els.commentInput.disabled = isBanned;
  }

  function checkBanStatus(uid){
    return db.collection("userStats").doc(uid).get().then(function(doc){
      isBanned = doc.exists && Number(doc.data().reportCount || 0) >= 5;
      applyBanState();
    }).catch(function(err){ console.error(err); });
  }

  function renderPills(){
    if(!els.pills) return;
    if(CFG.categories.length <= 1){ els.pills.style.display = "none"; return; }
    els.pills.innerHTML = "";
    CFG.categories.forEach(function(cat){
      const btn = document.createElement("button");
      btn.textContent = cat.label;
      btn.className = cat.key === currentCategory ? "active" : "";
      btn.addEventListener("click", function(){
        currentCategory = cat.key;
        renderPills();
        renderCcpBanner();
        loadPosts();
      });
      els.pills.appendChild(btn);
    });
  }

  function renderCcpBanner(){
    if(!els.ccpBanner) return;
    const show = CFG.ccpGuidelineCategory && currentCategory === CFG.ccpGuidelineCategory;
    els.ccpBanner.style.display = show ? "block" : "none";
  }

  function loadPosts(){
    if(unsubscribeList) unsubscribeList();
    els.list.innerHTML = "<li class=\"empty-state\">불러오는 중...</li>";
    // NOTE: intentionally no server-side orderBy() here. Combining an
    // equality where() with orderBy() on a different field requires a
    // Firestore composite index (created once, manually, in the console) —
    // without it Firestore throws "the query requires an index" and every
    // post silently fails to load. Sorting client-side avoids that
    // dependency entirely; fine at this site's scale.
    unsubscribeList = db.collection("posts")
      .where("category", "==", currentCategory)
      .onSnapshot(function(snap){
        if(snap.empty){
          els.list.innerHTML = "<li class=\"empty-state\">아직 게시글이 없습니다. 첫 글을 남겨보세요.</li>";
          return;
        }
        const docs = [];
        snap.forEach(function(doc){ docs.push(doc); });
        docs.sort(function(a,b){
          const ta = a.data().createdAt ? a.data().createdAt.toMillis() : 0;
          const tb = b.data().createdAt ? b.data().createdAt.toMillis() : 0;
          return tb - ta;
        });
        els.list.innerHTML = "";
        docs.slice(0, 50).forEach(function(doc){
          const p = doc.data();
          const li = document.createElement("li");
          li.className = "post-item";
          li.innerHTML =
            "<div class=\"title\">" + escapeHtml(p.title) + "</div>" +
            "<div class=\"excerpt\">" + escapeHtml((p.body||"").slice(0,80)) + "</div>" +
            "<div class=\"meta\"><span>" + escapeHtml(p.authorNickname||"익명") + "</span><span>" + fmtDate(p.createdAt) + "</span></div>";
          li.addEventListener("click", function(){ location.hash = "post-" + doc.id; });
          els.list.appendChild(li);
        });
      }, function(err){
        console.error(err);
        els.list.innerHTML = "<li class=\"empty-state\">게시글을 불러오지 못했습니다. (콘솔에서 오류 확인)</li>";
      });
  }

  if(els.newForm){
    els.submitBtn.addEventListener("click", function(){
      const title = els.title.value.trim();
      const body = els.body.value.trim();
      if(!title || !body){ toast("제목과 내용을 입력해주세요"); return; }
      if(title.length > 120){ toast("제목은 120자 이내로 입력해주세요"); return; }
      if(body.length > 5000){ toast("내용은 5000자 이내로 입력해주세요"); return; }
      els.submitBtn.disabled = true;
      authReady.then(function(user){
        return db.collection("posts").add({
          category: currentCategory,
          title: title,
          body: body,
          authorNickname: getNickname(),
          authorUid: user.uid,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        }).then(function(){
          // Bumps this user's post count (see vote.js: voting requires 10+ posts).
          return db.collection("userStats").doc(user.uid).set({
            postCount: firebase.firestore.FieldValue.increment(1),
            reportCount: firebase.firestore.FieldValue.increment(0)
          }, { merge: true });
        });
      }).then(function(){
        els.title.value = "";
        els.body.value = "";
        toast("게시글이 등록되었습니다");
      }).catch(function(err){
        console.error(err);
        toast("등록에 실패했습니다: " + err.message);
      }).finally(function(){
        els.submitBtn.disabled = false;
      });
    });
  }

  let currentPostId = null;
  let currentPostAuthorUid = null;

  function showDetail(postId){
    currentPostId = postId;
    currentPostAuthorUid = null;
    els.boardView.style.display = "none";
    els.detail.style.display = "flex";
    els.detailTitle.textContent = "불러오는 중...";
    els.detailBody.textContent = "";
    els.commentList.innerHTML = "";

    db.collection("posts").doc(postId).get().then(function(doc){
      if(!doc.exists){ els.detailTitle.textContent = "삭제되었거나 존재하지 않는 게시글입니다."; return; }
      const p = doc.data();
      currentPostAuthorUid = p.authorUid;
      els.detailTitle.textContent = p.title;
      els.detailMeta.textContent = (p.authorNickname||"익명") + " · " + fmtDate(p.createdAt);
      els.detailBody.textContent = p.body;
    });

    db.collection("posts").doc(postId).collection("comments").orderBy("createdAt", "asc").limit(200)
      .onSnapshot(function(snap){
        if(snap.empty){ els.commentList.innerHTML = "<li class=\"empty-state\">아직 댓글이 없습니다.</li>"; return; }
        els.commentList.innerHTML = "";
        snap.forEach(function(doc){
          const c = doc.data();
          const li = document.createElement("li");
          li.className = "comment-item";
          li.innerHTML =
            "<div class=\"meta\">" + escapeHtml(c.authorNickname||"익명") + " · " + fmtDate(c.createdAt) + "</div>" +
            "<div>" + escapeHtml(c.body) + "</div>";
          els.commentList.appendChild(li);
        });
      });
  }

  function hideDetail(){
    els.boardView.style.display = "flex";
    els.detail.style.display = "none";
    currentPostId = null;
    location.hash = "";
  }

  if(els.detailBack) els.detailBack.addEventListener("click", hideDetail);

  if(els.commentBtn){
    els.commentBtn.addEventListener("click", function(){
      const body = els.commentInput.value.trim();
      if(!body){ toast("댓글 내용을 입력해주세요"); return; }
      if(body.length > 1000){ toast("댓글은 1000자 이내로 입력해주세요"); return; }
      if(!currentPostId) return;
      els.commentBtn.disabled = true;
      authReady.then(function(user){
        return db.collection("posts").doc(currentPostId).collection("comments").add({
          body: body,
          authorNickname: getNickname(),
          authorUid: user.uid,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      }).then(function(){
        els.commentInput.value = "";
      }).catch(function(err){
        console.error(err);
        toast("댓글 등록에 실패했습니다: " + err.message);
      }).finally(function(){
        els.commentBtn.disabled = false;
      });
    });
  }

  if(els.detailReport){
    els.detailReport.addEventListener("click", function(){
      if(!currentPostId || !currentPostAuthorUid) return;
      const reason = prompt("신고 사유를 간단히 적어주세요 (운영자가 검토합니다)");
      if(!reason || !reason.trim()) return;
      const targetAuthorUid = currentPostAuthorUid;
      authReady.then(function(user){
        return db.collection("reports").add({
          targetType: "post",
          targetId: currentPostId,
          targetAuthorUid: targetAuthorUid,
          reason: reason.trim().slice(0,500),
          reporterUid: user.uid,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        }).then(function(){
          // 5+ accumulated reports blocks that author from posting further
          // (enforced server-side in firestore.rules; this just tallies it).
          return db.collection("userStats").doc(targetAuthorUid).set({
            reportCount: firebase.firestore.FieldValue.increment(1),
            postCount: firebase.firestore.FieldValue.increment(0)
          }, { merge: true });
        });
      }).then(function(){
        toast("신고가 접수되었습니다");
      }).catch(function(err){
        console.error(err);
        toast("신고 접수에 실패했습니다");
      });
    });
  }

  window.addEventListener("hashchange", function(){
    const m = location.hash.match(/^#post-(.+)$/);
    if(m) showDetail(m[1]); else hideDetail();
  });

  authReady.then(function(user){
    renderPills();
    renderCcpBanner();
    loadPosts();
    checkBanStatus(user.uid);
    const m = location.hash.match(/^#post-(.+)$/);
    if(m) showDetail(m[1]);
  });
})();
