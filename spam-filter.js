/* ==========================================================
   spam-filter.js — client-side content check for obvious adult,
   gambling, and scam links/keywords in post/comment text.

   This is a blocklist, not a real threat-intel feed (no API/service is
   wired up), so it WILL have false negatives (new domains it doesn't
   know about) and some false positives (a legitimate post that happens
   to use one of these words, e.g. discussing gambling-addiction policy).
   The matching set of high-confidence terms is also enforced server-side
   in firestore.rules (hasBannedContent) so it can't be bypassed by
   skipping this file — this file exists to (a) give the poster an
   immediate, friendly error instead of a raw permission-denied, and
   (b) trigger the account-suspend side effect.
   ========================================================== */
(function(){
  "use strict";

  const BANNED_PATTERNS = [
    // adult content
    /porn/i, /xxx\./i, /adult[-.]?(site|video|toy)/i, /야동/, /성인광고/, /섹스광고/,
    // gambling
    /casino/i, /bet365/i, /카지노/, /도박/, /토토\b/, /먹튀/, /배팅/, /베팅/, /사설\s*토토/,
    // common Korean scam-post phrasing
    /고수익\s*보장/, /원금\s*보장/, /무료\s*머니\s*지급/, /즉시\s*입금/, /환전\s*가능/
  ];

  window.containsBannedContent = function(text){
    if(!text) return false;
    return BANNED_PATTERNS.some(function(re){ return re.test(text); });
  };

  // Marks the current user as suspended (best-effort; the real, unbypassable
  // block is the server-side content filter in firestore.rules, which
  // rejects the post/comment regardless of whether this write succeeds).
  window.flagSelfSuspended = function(uid){
    return db.collection("userStats").doc(uid).set({
      suspended: true
    }, { merge: true }).catch(function(err){ console.error("flagSelfSuspended failed", err); });
  };
})();
