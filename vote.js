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
    const totalVotes = optKeys.reduce(function(sum,k){ return sum + (poll.options[k].votes||0); }, 0);

    let html = "<h3>" + escapeHtml(poll.title) + "</h3>";
    if(poll.description) html += "<p style=\"color:var(--text-1);font-size:13px;margin:-6px 0 12px;\">" + escapeHtml(poll.description) + "</p>";

    if(myVote){
      // Already voted: show results.
      optKeys.forEach(function(key){
        const opt = poll.options[key];
        const pct = totalVotes ? Math.round(100*(opt.votes||0)/totalVotes) : 0;
        const mine = myVote === key;
        html +=
          "<div class=\"poll-result-label\"><span>" + escapeHtml(opt.label) + (mine ? " ✓ 내 선택" : "") + "</span><span>" + pct + "% (" + (opt.votes||0) + "표)</span></div>" +
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

  function loadPolls(){
    els.list.innerHTML = "<div class=\"empty-state\">불러오는 중...</div>";
    authReady.then(function(user){
      // NOTE: no server-side orderBy() — where()+orderBy() on different
      // fields needs a Firestore composite index (see board.js for the
      // same note); sorting client-side avoids that setup step.
      return db.collection("polls").where("active","==",true).get()
        .then(function(snap){
          if(snap.empty){
            els.list.innerHTML = "<div class=\"empty-state\">진행 중인 투표가 없습니다.</div>";
            return;
          }
          const polls = [];
          snap.forEach(function(doc){ polls.push({ id: doc.id, data: doc.data() }); });
          polls.sort(function(a,b){
            const ta = a.data.createdAt ? a.data.createdAt.toMillis() : 0;
            const tb = b.data.createdAt ? b.data.createdAt.toMillis() : 0;
            return tb - ta;
          });
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
      els.list.innerHTML = "<div class=\"empty-state\">투표 목록을 불러오지 못했습니다.</div>";
    });
  }

  authReady.then(loadPolls);
})();
