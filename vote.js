/* ==========================================================
   vote.js — curated polls on current Korean issues.
   Polls are documents in the `polls` collection, created by the site
   owner directly in the Firebase console (no live X/Instagram
   ingestion — see SETUP.md for why). Each poll:
     { title, description, options: { key: {label, votes} }, active, createdAt }
   One vote per user is enforced by using `${pollId}_${uid}` as the
   vote document ID (see firestore.rules).
   ========================================================== */
(function(){
  "use strict";

  const els = {
    list: document.getElementById("pollList")
  };
  if(!els.list) return;

  function renderPoll(pollId, poll, myVote){
    const wrap = document.createElement("div");
    wrap.className = "glass card";

    const optKeys = Object.keys(poll.options || {});
    const totalVotes = optKeys.reduce(function(sum,k){ return sum + (Number(poll.options[k].votes)||0); }, 0);

    let html = "<h3>" + escapeHtml(poll.title) + "</h3>";
    if(poll.description) html += "<p style=\"color:var(--text-1);font-size:13px;margin:-6px 0 12px;\">" + escapeHtml(poll.description) + "</p>";

    if(myVote){
      // Already voted: show results.
      optKeys.forEach(function(key){
        const opt = poll.options[key];
        const votes = Number(opt.votes) || 0;
        const pct = totalVotes ? Math.round(100*votes/totalVotes) : 0;
        const mine = myVote === key;
        html +=
          "<div class=\"poll-result-label\"><span>" + escapeHtml(opt.label) + (mine ? " ✓ 내 선택" : "") + "</span><span>" + pct + "% (" + votes + "표)</span></div>" +
          "<div class=\"poll-result-bar\"><div class=\"poll-result-fill\" style=\"width:" + pct + "%\"></div></div>";
      });
      html += "<div style=\"font-size:11.5px;color:var(--text-2);margin-top:10px;\">총 " + totalVotes + "표 참여</div>";
      wrap.innerHTML = html;
    } else {
      const formId = "poll-form-" + pollId;
      optKeys.forEach(function(key){
        const opt = poll.options[key];
        html += "<div class=\"poll-option\"><input type=\"radio\" name=\"" + formId + "\" id=\"" + formId + "-" + key + "\" value=\"" + key + "\"><label for=\"" + formId + "-" + key + "\">" + escapeHtml(opt.label) + "</label></div>";
      });
      html += "<button class=\"btn small\" data-poll=\"" + pollId + "\">투표하기</button>";
      wrap.innerHTML = html;
      wrap.querySelector("button[data-poll]").addEventListener("click", function(){
        const checked = wrap.querySelector("input[name=\"" + formId + "\"]:checked");
        if(!checked){ toast("항목을 선택해주세요"); return; }
        castVote(pollId, checked.value);
      });
    }

    els.list.appendChild(wrap);
  }

  function castVote(pollId, optionKey){
    authReady.then(function(user){
      const voteId = pollId + "_" + user.uid;
      return db.collection("votes").doc(voteId).set({
        pollId: pollId,
        uid: user.uid,
        optionKey: optionKey,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      }).then(function(){
        const inc = {};
        inc["options." + optionKey + ".votes"] = firebase.firestore.FieldValue.increment(1);
        return db.collection("polls").doc(pollId).update(inc);
      });
    }).then(function(){
      toast("투표가 반영되었습니다");
      loadPolls();
    }).catch(function(err){
      console.error(err);
      toast("투표에 실패했습니다: " + err.message);
    });
  }

  function toMillisSafe(ts){
    // Defensive: if createdAt is missing, or was typed as a string/number
    // instead of a real Firestore Timestamp in the console, .toMillis()
    // would throw and (before this guard) silently break the whole list.
    if(ts && typeof ts.toMillis === "function") return ts.toMillis();
    return 0;
  }

  function loadPolls(){
    els.list.innerHTML = "<div class=\"empty-state\">불러오는 중...</div>";
    authReady.then(function(user){
      // Fetch the whole collection (no where/orderBy at all) and filter +
      // sort client-side. This sidesteps two common console mistakes:
      // (1) where()+orderBy() on different fields needing a composite
      // index, and (2) `active` being saved as the string "true" instead
      // of the boolean true, which a strict where("active","==",true)
      // query would silently fail to match.
      return db.collection("polls").get()
        .then(function(snap){
          const polls = [];
          snap.forEach(function(doc){
            const data = doc.data();
            if(data.active === true || data.active === "true") polls.push({ id: doc.id, data: data });
          });
          if(!polls.length){
            els.list.innerHTML = "<div class=\"empty-state\">진행 중인 투표가 없습니다.</div>";
            return;
          }
          polls.sort(function(a,b){ return toMillisSafe(b.data.createdAt) - toMillisSafe(a.data.createdAt); });
          return Promise.all(polls.map(function(p){
            return db.collection("votes").doc(p.id + "_" + user.uid).get().then(function(voteDoc){
              return { poll: p, myVote: voteDoc.exists ? voteDoc.data().optionKey : null };
            });
          })).then(function(results){
            els.list.innerHTML = "";
            results.forEach(function(r){ renderPoll(r.poll.id, r.poll.data, r.myVote); });
          });
        });
    }).catch(function(err){
      console.error(err);
      els.list.innerHTML = "<div class=\"empty-state\">투표 목록을 불러오지 못했습니다. (콘솔에서 오류 확인: " + err.message + ")</div>";
    });
  }

  authReady.then(loadPolls);
})();
