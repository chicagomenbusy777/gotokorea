# GotoKorea

커뮤니티가 자체 운영하는 비공식 참여 플랫폼입니다. 회원가입 없이 익명 닉네임으로
자유게시판, 시사·정치 토론(CCP·공산당 코너 포함), 투표, 청원에 참여할 수 있습니다.

- **라이브 사이트**: https://chicagomenbusy777.github.io/gotokorea/
- **이용규칙 및 콘텐츠 정책**: [guidelines.html](guidelines.html) — 정치적 의사표현은
  보장하되 혐오 발언·괴롭힘·허위정보는 금지합니다.
- 청원 페이지는 대한민국 정부의 국민동의청원과 무관한 **비공식** 페이지이며 법적
  효력이 없습니다.

## ⚠️ 지금 사이트에 접속하면 "firebase-config.js가 없습니다"라고 뜨는 이유

자유게시판·투표·청원은 여러 사람이 같이 보는 데이터라서 브라우저 저장(localStorage)
만으로는 만들 수 없고, 공유 데이터베이스(Firestore)가 필요합니다. 코드는 이미 전부
완성되어 있고, **딱 하나** — Firebase 프로젝트를 연결하는 것만 남았습니다.

이 연결 과정은 본인 Google 계정으로 로그인해서 진행해야 하는 부분이라 자동화(=제3자가
대신 처리)가 불가능합니다. 약 10분 정도 걸리는 아래 단계를 따라주세요.

**👉 전체 안내: [SETUP.md](SETUP.md)**

요약하면:
1. [Firebase 콘솔](https://console.firebase.google.com)에서 프로젝트 생성
2. Firestore Database 활성화 (Production 모드)
3. Authentication → 익명(Anonymous) 로그인 활성화
4. 웹 앱 등록 → 설정값을 `firebase-config.js`에 붙여넣기 (`firebase-config.js.example` 참고)
5. `firestore.rules` 내용을 Firestore 콘솔의 Rules 탭에 붙여넣고 게시
6. (선택) 투표 첫 항목을 `polls` 컬렉션에 직접 등록

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
