// =================================================================
//  google-apps-script.gs
//  구글 스프레드시트 Apps Script  –  웹앱 수신 스크립트
// -----------------------------------------------------------------
//  [배포 방법]
//  1. 구글 스프레드시트 열기 → 확장 프로그램 → Apps Script
//  2. 이 코드를 전체 붙여넣기
//  3. 상단 메뉴 → 배포 → 새 배포
//  4. 유형: 웹 앱
//     실행 계정: 나 (본인)
//     액세스 권한: 모든 사용자 (익명 포함)
//  5. 배포 후 URL 을 복사 → config.js 의 SHEET_URL 에 붙여넣기
// =================================================================

const SHEET_NAME = '응모데이터';   // 데이터를 기록할 시트 이름

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  try {
    const params = e.parameter || {};

    const name      = params.name      || '';
    const email     = params.email     || '';
    const phone     = params.phone     || '';
    const prize     = params.prize     || '';
    const answer    = params.answer    || '';
    const timestamp = params.timestamp || new Date().toISOString();

    const ss    = SpreadsheetApp.getActiveSpreadsheet();
    let   sheet = ss.getSheetByName(SHEET_NAME);

    // 시트가 없으면 자동 생성 + 헤더 추가
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow(['타임스탬프', '이름', '이메일', '전화번호', '선택상품', '정답']);
      // 헤더 스타일
      const header = sheet.getRange(1, 1, 1, 6);
      header.setFontWeight('bold');
      header.setBackground('#7c4dff');
      header.setFontColor('#ffffff');
    }

    // 데이터 행 추가
    sheet.appendRow([timestamp, name, email, phone, prize, answer]);

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
