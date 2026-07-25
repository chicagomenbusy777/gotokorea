# GotoKorea — Firebase setup

This site needs a Firebase project to store posts, votes, and petitions
(a shared bulletin board can't live in localStorage — that's per-browser
only). Everything code-side is already built; these are the manual steps
only you can do, since they require your own Google account.

## 1. Create the Firebase project

1. Go to https://console.firebase.google.com and create a new project
   (any name, e.g. "gotokorea").
2. You can decline Google Analytics — not needed.

## 2. Enable Firestore

1. In the left sidebar: **Build → Firestore Database → Create database**.
2. Choose **Production mode** (not test mode — the rules file below is
   the real security layer).
3. Pick a region close to your users (e.g. `asia-northeast3` — Seoul).

## 3. Enable Anonymous Authentication

1. **Build → Authentication → Get started**.
2. Under **Sign-in method**, enable **Anonymous**.
   This is what lets visitors post/vote/sign without creating an account —
   each browser gets a stable anonymous ID.

## 4. Register a web app and get your config

1. Project settings (gear icon) → **General** → scroll to **Your apps** →
   click the `</>` (web) icon → register an app (any nickname).
2. You'll see a `firebaseConfig` object. Copy it.
3. In this repo, copy `firebase-config.js.example` to `firebase-config.js`
   and paste your values in:

   ```js
   window.FIREBASE_CONFIG = {
     apiKey: "...",
     authDomain: "...",
     projectId: "...",
     storageBucket: "...",
     messagingSenderId: "...",
     appId: "..."
   };
   ```

4. `firebase-config.js` is in `.gitignore` — it will **not** be committed.
   Since GitHub Pages only serves committed files, you have two options
   for the live site:
   - **Simplest:** the Firebase web API key is not a secret in the same
     way a server key is (it's scoped by Firestore security rules, and
     Google's own docs say it's safe to expose client-side) — you *can*
     commit `firebase-config.js` if you're comfortable with that, since
     the rules file is what actually protects your data.
   - **More cautious:** keep it gitignored locally for testing, and add it
     as a build step / GitHub Actions secret that writes the file during
     deploy. This is more setup — only worth it if you want extra
     separation between the repo and the live config.
   Given this is a small community project, committing `firebase-config.js`
   (option 1) is the pragmatic choice — just don't put anything in it
   beyond the standard Firebase web config.

## 5. Publish the security rules

1. **Build → Firestore Database → Rules** tab.
2. Replace the contents with everything in `firestore.rules` from this repo.
3. Click **Publish**.

Without this step, Firestore's default rules will block all reads/writes
(safe default) or, if you picked "test mode" by mistake, allow anyone to
write anything (unsafe) — publishing `firestore.rules` is what makes the
site both usable and moderately abuse-resistant.

## 6. Create the admin account (needed to create polls in-app)

Polls are now created from `vote.html` itself (no more console data-entry)
— but only one account is allowed to do that, checked by email in
`firestore.rules`.

1. **Build → Authentication → Sign-in method** → enable **Email/Password**.
2. **Authentication → Users → Add user** → pick any email + password you'll
   remember (this doesn't need to be a real inbox — it's just a login, not
   used for email delivery).
3. Open `firestore.rules` in this repo and replace
   `"ADMIN_EMAIL_PLACEHOLDER"` (inside the `isAdmin()` function near the
   top) with that exact email, in quotes. Example:
   ```
   return isSignedIn() && request.auth.token.email == "you@example.com";
   ```
4. Re-publish the rules: **Firestore Database → Rules** tab → paste the
   updated file → **Publish** (same as step 5, just with your email filled in).
5. On `vote.html`, log in with that email/password in the "관리자" card at
   the top — a "새 투표 만들기" form appears. Everyone else only ever sees
   the regular anonymous voting UI; there's no admin login link exposed
   anywhere else, but the card is visible on the page since there's no
   good way to hide it before auth resolves — that's fine, it's useless to
   anyone without your password, and the real gate is the security rule.

## 7. How the moderation/limit features work (nothing to set up — just context)

- **Voting requires 10+ posts** (the admin account is exempt). A
  `userStats/{uid}` doc tracks each user's post count, and
  `firestore.rules` blocks vote-casting below 10 server-side.
- **5+ reports blocks posting/commenting.** The report button tallies a
  `reportCount` on the *reported post's author*; `firestore.rules` rejects
  new posts/comments once that hits 5.
- **Comments: 1 per post per 30 minutes**, per user. Enforced via a
  `commentCooldowns/{uid}/posts/{postId}` timestamp checked server-side.
- **Adult/gambling/scam links or keywords are blocked at submission** (in
  `spam-filter.js` client-side, and mirrored server-side in
  `firestore.rules`' `hasBannedContent()` so it can't be bypassed) and the
  poster is immediately flagged `suspended` on their `userStats` doc,
  blocking further posts/comments. **This is a keyword/domain blocklist,
  not a real threat-intel service** — expect some false negatives (new
  spam domains it doesn't recognize) and occasional false positives (e.g.
  a legitimate post discussing gambling-addiction policy). There's no
  in-app appeal yet for any of these — a wrongly-flagged user needs you to
  edit their `userStats/{uid}` doc in the console (set `suspended` to
  `false` and/or lower `reportCount`).
- None of these are retroactive — only activity after this update counts.

## 8. (Optional) Ad monetization — Google AdSense

Not required to launch. Ad slot containers already exist in the pages
(hidden by default) and `ads.js` is wired up to activate them once
configured:

1. Sign up at https://www.google.com/adsense and add this site. **New,
   low-traffic sites are often not approved immediately** — AdSense
   generally wants original content and some real traffic history first,
   so don't expect instant approval.
2. Once approved, copy `ads-config.js.example` to `ads-config.js` and put
   your real publisher ID (`ca-pub-...`) in it — this is from your own
   AdSense dashboard, never something to guess or reuse from elsewhere.
3. `ads-config.js` is gitignored; commit it anyway if you want the live
   site to pick it up (same reasoning as `firebase-config.js` — it's a
   client-side identifier, not a secret).
4. Political content specifically: general political discussion is fine
   under AdSense's policies, but review Google's policies on "dangerous or
   derogatory content" — the CCP corner's no-ethnic-hate-speech rule
   (already in `guidelines.html`) is also what keeps that section
   ad-policy-safe, so keep enforcing it.

## 9. Deploy

Same as mindcareapp: push to `main`, enable GitHub Pages (Settings → Pages
→ Deploy from branch → `main` / root) if not already on.

## 10. Optional hardening (v2 ideas, not required to launch)

- **Firebase App Check** — reduces abuse from scripted/bot traffic hitting
  your Firestore directly. Free, a bit more setup (reCAPTCHA v3 site key).
- **Cloud Functions** for real rate limiting and tamper-proof counters
  (right now a technically sophisticated user could call the same
  increment writes the app uses without actually posting/reporting) —
  needs the Blaze (pay-as-you-go) plan, though usage at small scale is
  normally still within the free tier's usage-based allowance.
