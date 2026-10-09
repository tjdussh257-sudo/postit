/**
 * 개굴개굴 Post-it Todo List - Google Sheets CRUD Google Apps Script (GAS)
 * 
 * 구글 스프레드시트 헤더:
 * [A] timestamp | [B] datetime | [C] category | [D] content | [E] color | [F] state | [G] order
 */

const SPREADSHEET_ID = "1lseGUMjttjBRc1FXGzJY4Iqi3SZ73U5UL9xsLJudGjg";
const SHEET_NAME = "Sheet1"; // 시트 이름이 다를 경우 첫 번째 시트를 자동으로 가져오도록 처리됨

/**
 * 활성 시트 가져오기 헬퍼 함수
 */
function getTargetSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  return ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
}

/**
 * GET 요청 처리: 전체 포스트잇 메모 목록 조회 (Read)
 */
function doGet(e) {
  try {
    const sheet = getTargetSheet();
    const data = sheet.getDataRange().getValues();

    if (data.length <= 1) {
      return responseJSON({ success: true, data: [] });
    }

    const headers = data[0]; // ['timestamp', 'datetime', 'category', 'content', 'color', 'state', 'order']
    const rows = data.slice(1);

    const notes = rows.map((row) => {
      const item = {};
      headers.forEach((header, index) => {
        item[String(header).trim()] = row[index];
      });
      return item;
    });

    // order 기준 오름차순 정렬 (필요시)
    notes.sort((a, b) => Number(a.order || 0) - Number(b.order || 0));

    return responseJSON({ success: true, data: notes });
  } catch (error) {
    return responseJSON({ success: false, error: error.toString() });
  }
}

/**
 * POST 요청 처리: CRUD 액션 분기 (Create, Update, Delete, Reorder)
 */
function doPost(e) {
  try {
    const sheet = getTargetSheet();
    let body = {};

    if (e && e.postData && e.postData.contents) {
      body = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      body = e.parameter;
    }

    const action = body.action; // 'create' | 'update' | 'delete' | 'reorder'

    // 1. 메모 생성 (Create)
    if (action === "create") {
      const timestamp = body.timestamp || new Date().getTime().toString();
      const datetime = body.datetime || Utilities.formatDate(new Date(), "Asia/Seoul", "yyyy.MM.dd HH:mm");
      const category = body.category || "todo";
      const content = body.content || "";
      const color = body.color || "yellow";
      const state = body.state !== undefined ? body.state : "false"; // 완료 여부: 'false' | 'true'
      const lastRow = sheet.getLastRow();
      const order = body.order !== undefined ? body.order : (lastRow);

      sheet.appendRow([timestamp, datetime, category, content, color, state, order]);

      return responseJSON({
        success: true,
        message: "생성 성공",
        data: { timestamp, datetime, category, content, color, state, order }
      });
    }

    // 2. 메모 수정 (Update) - timestamp 기준 검색 후 업데이트
    if (action === "update") {
      const timestamp = String(body.timestamp);
      if (!timestamp) {
        return responseJSON({ success: false, error: "timestamp가 필요합니다." });
      }

      const data = sheet.getDataRange().getValues();
      const headers = data[0].map(h => String(h).trim());
      const tsColIdx = headers.indexOf("timestamp");

      let targetRowIndex = -1;
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][tsColIdx]) === timestamp) {
          targetRowIndex = i + 1; // 1-indexed sheet row
          break;
        }
      }

      if (targetRowIndex === -1) {
        return responseJSON({ success: false, error: "해당 timestamp의 메모를 찾을 수 없습니다." });
      }

      // 각 열별로 전달된 필드만 업데이트
      if (body.datetime !== undefined) sheet.getRange(targetRowIndex, headers.indexOf("datetime") + 1).setValue(body.datetime);
      if (body.category !== undefined) sheet.getRange(targetRowIndex, headers.indexOf("category") + 1).setValue(body.category);
      if (body.content !== undefined) sheet.getRange(targetRowIndex, headers.indexOf("content") + 1).setValue(body.content);
      if (body.color !== undefined) sheet.getRange(targetRowIndex, headers.indexOf("color") + 1).setValue(body.color);
      if (body.state !== undefined) sheet.getRange(targetRowIndex, headers.indexOf("state") + 1).setValue(body.state);
      if (body.order !== undefined) sheet.getRange(targetRowIndex, headers.indexOf("order") + 1).setValue(body.order);

      return responseJSON({ success: true, message: "수정 완료" });
    }

    // 3. 메모 삭제 (Delete) - timestamp 기준 행 삭제
    if (action === "delete") {
      const timestamp = String(body.timestamp);
      if (!timestamp) {
        return responseJSON({ success: false, error: "timestamp가 필요합니다." });
      }

      const data = sheet.getDataRange().getValues();
      const tsColIdx = data[0].map(h => String(h).trim()).indexOf("timestamp");

      for (let i = 1; i < data.length; i++) {
        if (String(data[i][tsColIdx]) === timestamp) {
          sheet.deleteRow(i + 1);
          return responseJSON({ success: true, message: "삭제 완료" });
        }
      }

      return responseJSON({ success: false, error: "해당 메모를 찾을 수 없습니다." });
    }

    // 4. 순서 일괄 업데이트 (Reorder) - 드래그 앤 드롭 정렬 반영
    if (action === "reorder") {
      // items: [{ timestamp: "...", order: 0 }, { timestamp: "...", order: 1 }]
      const items = body.items || [];
      const data = sheet.getDataRange().getValues();
      const headers = data[0].map(h => String(h).trim());
      const tsColIdx = headers.indexOf("timestamp");
      const orderColIdx = headers.indexOf("order") + 1;

      const orderMap = {};
      items.forEach(item => {
        orderMap[String(item.timestamp)] = item.order;
      });

      for (let i = 1; i < data.length; i++) {
        const rowTs = String(data[i][tsColIdx]);
        if (orderMap[rowTs] !== undefined) {
          sheet.getRange(i + 1, orderColIdx).setValue(orderMap[rowTs]);
        }
      }

      return responseJSON({ success: true, message: "순서 변경 완료" });
    }

    return responseJSON({ success: false, error: "유효하지 않은 action입니다. (create/update/delete/reorder)" });
  } catch (error) {
    return responseJSON({ success: false, error: error.toString() });
  }
}

/**
 * CORS 및 JSON 응답 반환 헬퍼 함수
 */
function responseJSON(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
