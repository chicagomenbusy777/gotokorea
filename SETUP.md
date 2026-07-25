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

## 6. Add your first poll (curated, no live API needed)

Polls are added directly in the console since there's no X/Instagram API
wired up:

1. **Build → Firestore Database → Data → Start collection** → `polls`.
2. Add a document (auto-ID) with fields:
   - `title` (string): e.g. "이번 주 가장 관심있는 이슈는?"
   - `description` (string, optional)
   - `active` (boolean): `true`
   - `createdAt` (timestamp): now
   - `options` (map): e.g.
     ```
     optA: { label: "옵션 A", votes: 0 }
     optB: { label: "옵션 B", votes: 0 }
     ```
3. It'll appear on `vote.html` immediately.

## 7. Deploy

Same as mindcareapp: push to `main`, enable GitHub Pages (Settings → Pages
→ Deploy from branch → `main` / root) if not already on.

## 8. Optional hardening (v2 ideas, not required to launch)

- **Firebase App Check** — reduces abuse from scripted/bot traffic hitting
  your Firestore directly. Free, a bit more setup (reCAPTCHA v3 site key).
- **Cloud Functions** for real rate limiting and an in-app admin/moderation
  panel instead of moderating via the console — needs the Blaze
  (pay-as-you-go) plan, though usage at small scale is normally still
  within the free tier's usage-based allowance.
