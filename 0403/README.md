# 매일 밤 10시 이벤트 페이지

## 파일 구성

| 파일 | 역할 |
|------|------|
| `index.html` | 페이지 구조 (HTML) |
| `style.css` | 디자인 및 레이아웃 (CSS) |
| `app.js` | 카운트다운·상품카드·모달·전송 로직 (JavaScript) |
| `config.js` | **구글 시트 URL 설정** (이 파일만 수정하면 됨) |
| `google-apps-script.gs` | 구글 스프레드시트 Apps Script 코드 |

---

## 🚀 사용 방법

### 1단계 – 구글 Apps Script 배포

1. [Google 스프레드시트](https://sheets.google.com) 에서 새 시트를 만듭니다.
2. 상단 메뉴 → **확장 프로그램** → **Apps Script** 클릭.
3. `google-apps-script.gs` 전체 내용을 붙여넣고 저장(Ctrl+S).
4. 상단 **배포** 버튼 → **새 배포** 클릭.
5. 설정:
   - 유형: `웹 앱`
   - 실행 계정: `나 (본인 계정)`
   - 액세스 권한: `모든 사용자 (익명 포함)`
6. **배포** 클릭 → 표시된 **웹앱 URL**을 복사합니다.

### 2단계 – config.js 수정

```js
// config.js
window.SHEET_URL = '여기에_복사한_URL_붙여넣기';
```

예시:
```js
window.SHEET_URL = 'https://script.google.com/macros/s/AKfy...xyz/exec';
```

### 3단계 – index.html 에 config.js 태그 추가

`index.html` 의 `</body>` 바로 위에 아래 줄이 있는지 확인하세요.
없으면 `<script src="app.js"></script>` **앞에** 추가합니다.

```html
<script src="config.js"></script>
<script src="app.js"></script>
```

> `index.html` 에는 이미 포함되어 있습니다.

### 4단계 – 로컬 실행

브라우저에서 `index.html` 을 직접 열거나, VS Code Live Server 등으로 실행하세요.

---

## 📊 구글 시트 컬럼 구조

스크립트가 자동으로 **응모데이터** 시트를 생성하며, 아래 컬럼에 데이터가 쌓입니다.

| 타임스탬프 | 이름 | 이메일 | 전화번호 | 선택상품 | 정답 |
|-----------|------|--------|---------|---------|------|

---

## ⏰ 카운트다운 동작

- 매일 **오후 10시(22:00)** 를 기준으로 카운트다운합니다.
- 이미 22시가 지난 경우 **다음날 22시** 까지 카운트됩니다.
- 1초마다 자동 업데이트되며, 숫자 변경 시 플립 애니메이션이 적용됩니다.

---

## 🛠 상품·문제 수정

`app.js` 상단의 `PRIZES` 배열을 수정하면 상품 정보를 바꿀 수 있습니다.

```js
const PRIZES = [
  { id: 1, name: '소니 미러리스 A5100', count: 3, emoji: '📷' },
  // ...
];
```

퀴즈 문제는 `index.html` 의 `.quiz-question` 내용을 직접 수정하세요.
