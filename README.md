# GotoKorea

커뮤니티가 자체 운영하는 비공식 참여 플랫폼입니다. 회원가입 없이 익명 닉네임으로
자유게시판, 시사·정치 토론(CCP·공산당 코너 포함), 투표, 청원에 참여할 수 있습니다.

- **라이브 사이트**: https://chicagomenbusy777.github.io/gotokorea/
- **이용규칙 및 콘텐츠 정책**: [guidelines.html](guidelines.html) — 정치적 의사표현은
  보장하되 혐오 발언·괴롭힘·허위정보는 금지합니다.
- 청원 페이지는 대한민국 정부의 국민동의청원과 무관한 **비공식** 페이지이며 법적
  효력이 없습니다.

## Firebase 연결 상태

Firebase 프로젝트 연결(`firebase-config.js`)과 보안 규칙 게시는 완료되었습니다.
**아직 남은 것 — 관리자 계정 설정** (투표를 앱 안에서 직접 만들려면 필요):

1. Firebase 콘솔 → Authentication → Sign-in method → **이메일/비밀번호** 활성화
2. Authentication → Users → **사용자 추가** (원하는 이메일 + 비밀번호)
3. `firestore.rules`의 `"ADMIN_EMAIL_PLACEHOLDER"`를 그 이메일로 교체하고 다시 게시
4. `vote.html` 상단 "관리자" 카드에서 그 이메일/비밀번호로 로그인

자세한 안내: **[SETUP.md](SETUP.md)** (6번 항목)

완료 후 `git push`하면 그대로 라이브 사이트에 반영됩니다.

## 구조

| 파일 | 역할 |
|---|---|
| `index.html` | 홈 |
| `board.html` | 자유게시판 |
| `issues.html` | 시사·정치 토론 (+ CCP·공산당 코너) |
| `vote.html` | 큐레이션 투표 |
| `petition.html` | 커뮤니티 청원 (비공식) |
| `guidelines.html` | 이용규칙 |
| `board.js` / `vote.js` / `petition.js` | 각 기능의 로직 (바닐라 JS, 빌드 도구 없음) |
| `firestore.rules` | Firestore 보안 규칙 |
| `SETUP.md` | Firebase 연결 안내 |
