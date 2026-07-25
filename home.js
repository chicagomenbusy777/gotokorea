/* ==========================================================
   home.js — homepage widgets: recent posts across all boards.
   Read-only, links out to board.html / issues.html for the full thread.
   No where()+orderBy() combo here (plain orderBy on the whole
   collection), so this one doesn't need a composite index.
   ========================================================== */
(function(){
  "use strict";

  const els = { recent: document.getElementById("recentPosts") };
  if(!els.recent) return;

  const CATEGORY_LABEL = { free: "자유", issues: "시사·정치", ccp: "CCP·공산당" };
  const CATEGORY_PAGE = { free: "board.html", issues: "issues.html", ccp: "issues.html" };

  db.collection("posts").orderBy("createdAt", "desc").limit(8).onSnapshot(function(snap){
    if(snap.empty){
      els.recent.innerHTML = "<li class=\"empty-state\">아직 게시글이 없습니다. 첫 글을 남겨보세요.</li>";
      return;
    }
    els.recent.innerHTML = "";
    snap.forEach(function(doc){
      const p = doc.data();
      const li = document.createElement("li");
      li.className = "post-item";
      const page = CATEGORY_PAGE[p.category] || "board.html";
      li.innerHTML =
        "<div class=\"title\">" + escapeHtml(p.title) + "</div>" +
        "<div class=\"excerpt\">" + escapeHtml((p.body||"").slice(0,80)) + "</div>" +
        "<div class=\"meta\"><span class=\"category-badge\">" + escapeHtml(CATEGORY_LABEL[p.category] || p.category) + "</span><span>" + escapeHtml(p.authorNickname||"익명") + " · " + timeAgo(p.createdAt) + "</span></div>";
      li.addEventListener("click", function(){ location.href = page + "#post-" + doc.id; });
      els.recent.appendChild(li);
    });
  }, function(err){
    console.error(err);
    els.recent.innerHTML = "<li class=\"empty-state\">게시글을 불러오지 못했습니다.</li>";
  });
})();
