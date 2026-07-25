/* ==========================================================
   petition.js — community petitions.
   IMPORTANT: these are unofficial, community-run petitions with no
   legal effect and no connection to Korea's official 국민동의청원
   system. The disclaimer banner in petition.html must stay visible
   on every view this script renders.

   Data model:
     petitions/{id}            { title, description, goal, authorNickname, authorUid, createdAt }
     petitions/{id}/signatures/{uid}  { createdAt, comment }   -- doc ID = uid enforces one signature/user
     petitions/{id}/comments/{commentId}                       -- discussion, same shape as board comments
   Signature count is computed live from the signatures subcollection
   size rather than a denormalized counter field, to avoid needing
   Cloud Functions to keep a counter in sync.
   ========================================================== */
(function(){
  "use strict";

  const els = {
    list: document.getElementById("petitionList"),
    newForm: document.getElementById("newPetitionForm"),
    title: document.getElementById("petitionTitle"),
    goal: document.getElementById("petitionGoal"),
    desc: document.getElementById("petitionDesc"),
    submitBtn: document.getElementById("submitPetitionBtn"),
    listView: document.getElementById("petitionListView"),
    detail: document.getElementById("petitionDetail"),
    detailBack: document.getElementById("petitionDetailBack"),
    detailTitle: document.getElementById("petitionDetailTitle"),
    detailMeta: document.getElementById("petitionDetailMeta"),
    detailBody: document.getElementById("petitionDetailBody"),
    detailCount: document.getElementById("petitionDetailCount"),
    detailProgress: document.getElementById("petitionDetailProgress"),
    signBtn: document.getElementById("signBtn"),
    commentList: document.getElementById("petitionCommentList"),
    commentInput: document.getElementById("petitionCommentInput"),
    commentBtn: document.getElementById("petitionCommentBtn")
  };
  if(!els.list) return;

  function loadList(){
    els.list.innerHTML = "<li class=\"empty-state\">불러오는 중...</li>";
    db.collection("petitions").orderBy("createdAt","desc").limit(50).onSnapshot(function(snap){
      if(snap.empty){ els.list.innerHTML = "<li class=\"empty-state\">아직 등록된 청원이 없습니다.</li>"; return; }
      els.list.innerHTML = "";
      snap.forEach(function(doc){
        const p = doc.data();
        const li = document.createElement("li");
        li.className = "post-item";
        li.innerHTML =
          "<div class=\"title\">" + escapeHtml(p.title) + "</div>" +
          "<div class=\"excerpt\">" + escapeHtml((p.description||"").slice(0,80)) + "</div>" +
          "<div class=\"meta\"><span>" + escapeHtml(p.authorNickname||"익명") + "</span><span>" + timeAgo(p.createdAt) + "</span></div>";
        li.addEventListener("click", function(){ location.hash = "petition-" + doc.id; });
        els.list.appendChild(li);
      });
    });
  }

  if(els.newForm){
    els.submitBtn.addEventListener("click", function(){
      const title = els.title.value.trim();
      const description = els.desc.value.trim();
      const goal = Math.max(1, Number(els.goal.value) || 100);
      if(!title || !description){ toast("제목과 내용을 입력해주세요"); return; }
      if(title.length > 120){ toast("제목은 120자 이내로 입력해주세요"); return; }
      if(description.length > 3000){ toast("내용은 3000자 이내로 입력해주세요"); return; }
      if(containsBannedContent(title) || containsBannedContent(description)){
        toast("음란·도박·사기성 링크나 키워드가 감지되어 등록이 차단되었습니다. 계정이 제한됩니다.");
        authReady.then(function(user){ flagSelfSuspended(user.uid); });
        return;
      }
      els.submitBtn.disabled = true;
      authReady.then(function(user){
        return db.collection("petitions").add({
          title: title,
          description: description,
          goal: goal,
          authorNickname: getNickname(),
          authorUid: user.uid,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      }).then(function(){
        els.title.value = ""; els.desc.value = ""; els.goal.value = "";
        toast("청원이 등록되었습니다");
      }).catch(function(err){
        console.error(err);
        toast("등록에 실패했습니다: " + err.message);
      }).finally(function(){
        els.submitBtn.disabled = false;
      });
    });
  }

  let currentId = null;

  function refreshCount(petitionId, goal){
    return db.collection("petitions").doc(petitionId).collection("signatures").get().then(function(snap){
      const count = snap.size;
      els.detailCount.innerHTML = count + " <span>명 서명 (목표 " + goal + "명)</span>";
      const pct = Math.min(100, Math.round(100*count/goal));
      els.detailProgress.style.width = pct + "%";
      return count;
    });
  }

  function showDetail(petitionId){
    currentId = petitionId;
    els.listView.style.display = "none";
    els.detail.style.display = "flex";
    els.detailTitle.textContent = "불러오는 중...";
    els.commentList.innerHTML = "";

    let petitionData = null;
    db.collection("petitions").doc(petitionId).get().then(function(doc){
      if(!doc.exists){ els.detailTitle.textContent = "삭제되었거나 존재하지 않는 청원입니다."; return; }
      petitionData = doc.data();
      els.detailTitle.textContent = petitionData.title;
      els.detailMeta.textContent = (petitionData.authorNickname||"익명") + " · " + timeAgo(petitionData.createdAt);
      els.detailBody.textContent = petitionData.description;
      return refreshCount(petitionId, petitionData.goal);
    });

    authReady.then(function(user){
      return db.collection("petitions").doc(petitionId).collection("signatures").doc(user.uid).get();
    }).then(function(sigDoc){
      if(sigDoc.exists){
        els.signBtn.textContent = "✓ 서명 완료";
        els.signBtn.disabled = true;
      } else {
        els.signBtn.textContent = "서명하기";
        els.signBtn.disabled = false;
      }
    });

    db.collection("petitions").doc(petitionId).collection("comments").orderBy("createdAt","asc").limit(200)
      .onSnapshot(function(snap){
        if(snap.empty){ els.commentList.innerHTML = "<li class=\"empty-state\">아직 댓글이 없습니다.</li>"; return; }
        els.commentList.innerHTML = "";
        snap.forEach(function(doc){
          const c = doc.data();
          const li = document.createElement("li");
          li.className = "comment-item";
          li.innerHTML =
            "<div class=\"meta\">" + escapeHtml(c.authorNickname||"익명") + " · " + timeAgo(c.createdAt) + "</div>" +
            "<div>" + escapeHtml(c.body) + "</div>";
          els.commentList.appendChild(li);
        });
      });
  }

  function hideDetail(){
    els.listView.style.display = "flex";
    els.detail.style.display = "none";
    currentId = null;
    location.hash = "";
  }

  if(els.detailBack) els.detailBack.addEventListener("click", hideDetail);

  if(els.signBtn){
    els.signBtn.addEventListener("click", function(){
      if(!currentId) return;
      els.signBtn.disabled = true;
      authReady.then(function(user){
        return db.collection("petitions").doc(currentId).collection("signatures").doc(user.uid).set({
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      }).then(function(){
        els.signBtn.textContent = "✓ 서명 완료";
        toast("서명해주셔서 감사합니다");
        return db.collection("petitions").doc(currentId).get();
      }).then(function(doc){
        return refreshCount(currentId, doc.data().goal);
      }).catch(function(err){
        console.error(err);
        toast("서명에 실패했습니다: " + err.message);
        els.signBtn.disabled = false;
      });
    });
  }

  if(els.commentBtn){
    els.commentBtn.addEventListener("click", function(){
      const body = els.commentInput.value.trim();
      if(!body){ toast("댓글 내용을 입력해주세요"); return; }
      if(body.length > 1000){ toast("댓글은 1000자 이내로 입력해주세요"); return; }
      if(!currentId) return;
      if(containsBannedContent(body)){
        toast("음란·도박·사기성 링크나 키워드가 감지되어 등록이 차단되었습니다. 계정이 제한됩니다.");
        authReady.then(function(user){ flagSelfSuspended(user.uid); });
        return;
      }
      els.commentBtn.disabled = true;
      const petitionId = currentId;
      authReady.then(function(user){
        const cooldownRef = db.collection("commentCooldowns").doc(user.uid).collection("posts").doc(petitionId);
        return cooldownRef.get().then(function(cdDoc){
          if(cdDoc.exists){
            const last = cdDoc.data().lastCommentAt;
            const elapsedMs = last && last.toMillis ? (Date.now() - last.toMillis()) : Infinity;
            if(elapsedMs < 30*60*1000){
              const waitMin = Math.ceil((30*60*1000 - elapsedMs) / 60000);
              toast("이 청원에는 " + waitMin + "분 후에 다시 댓글을 달 수 있습니다");
              return Promise.reject(new Error("cooldown"));
            }
          }
          const commentRef = db.collection("petitions").doc(petitionId).collection("comments").doc();
          const batch = db.batch();
          batch.set(commentRef, {
            body: body,
            authorNickname: getNickname(),
            authorUid: user.uid,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
          });
          batch.set(cooldownRef, { lastCommentAt: firebase.firestore.FieldValue.serverTimestamp() });
          return batch.commit();
        });
      }).then(function(){
        els.commentInput.value = "";
      }).catch(function(err){
        if(err && err.message === "cooldown") return;
        console.error(err);
        toast("댓글 등록에 실패했습니다: " + err.message);
      }).finally(function(){
        els.commentBtn.disabled = false;
      });
    });
  }

  window.addEventListener("hashchange", function(){
    const m = location.hash.match(/^#petition-(.+)$/);
    if(m) showDetail(m[1]); else hideDetail();
  });

  authReady.then(function(){
    loadList();
    const m = location.hash.match(/^#petition-(.+)$/);
    if(m) showDetail(m[1]);
  });
})();
