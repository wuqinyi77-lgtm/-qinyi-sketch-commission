const SHEET_NAME = '網站委託回覆';

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents || '{}');
    validatePayload_(payload);

    const spreadsheet = getOrCreateSpreadsheet_();
    const sheet = getOrCreateSheet_(spreadsheet);
    ensureHeaders_(sheet);

    const submittedAt = new Date();
    const row = [
      submittedAt,
      payload.name || '',
      payload.email || '',
      payload.contact || '',
      payload.type || '',
      payload.relation || '',
      payload.story || '',
      payload.feeling || '',
      Number(payload.people || 1),
      payload.size || '',
      payload.depth || '',
      Number(payload.budget || 0),
      payload.date || '',
      payload.plan || '',
      Number(payload.price || 0),
      payload.extra || '',
      '新詢問'
    ];

    sheet.appendRow(row);
    createGmailDraft_(payload);

    return jsonResponse_({ ok: true, message: '已收到委託需求' });
  } catch (error) {
    console.error(error);
    return jsonResponse_({ ok: false, message: error.message || '送出失敗' });
  }
}

function doGet() {
  return jsonResponse_({ ok: true, service: 'Qinyi Sketch Commission Form' });
}

function validatePayload_(payload) {
  const required = ['name', 'email', 'type', 'relation', 'story'];
  const missing = required.filter(key => !String(payload[key] || '').trim());
  if (missing.length) {
    throw new Error('缺少必要欄位：' + missing.join(', '));
  }
  if (!/^\S+@\S+\.\S+$/.test(payload.email)) {
    throw new Error('Email 格式不正確');
  }
}

function getOrCreateSpreadsheet_() {
  const props = PropertiesService.getScriptProperties();
  const existingId = props.getProperty('SPREADSHEET_ID');
  if (existingId) return SpreadsheetApp.openById(existingId);

  const spreadsheet = SpreadsheetApp.create('沁頤藝術委託 CRM｜網站回覆');
  props.setProperty('SPREADSHEET_ID', spreadsheet.getId());
  return spreadsheet;
}

function getOrCreateSheet_(spreadsheet) {
  return spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);
}

function ensureHeaders_(sheet) {
  if (sheet.getLastRow() > 0) return;
  const headers = [[
    '提交時間','姓名','Email','Instagram／Line','委託類型','人物關係','故事','希望感受',
    '人物數量','作品尺寸','創作方式','預算','活動或收件日期','初步方案','初步估價','其他補充','CRM 狀態'
  ]];
  sheet.getRange(1, 1, 1, headers[0].length).setValues(headers);
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, headers[0].length)
    .setFontWeight('bold')
    .setBackground('#6B4B3E')
    .setFontColor('#FFFFFF');
  sheet.autoResizeColumns(1, headers[0].length);
}

function createGmailDraft_(payload) {
  const subject = `【新的委託詢問】${payload.type || '藝術委託'}｜${payload.name}`;
  const priceText = Number(payload.price || 0).toLocaleString('zh-TW');
  const body = [
    `${payload.name} 您好～`,
    '',
    '謝謝您的欣賞，也謝謝您願意把這段故事分享給我 😊',
    '',
    `我先整理一下這次的需求：`,
    `・委託方向：${payload.type || '尚未填寫'}`,
    `・人物關係：${payload.relation || '尚未填寫'}`,
    `・人物數量：${payload.people || 1} 位`,
    `・作品尺寸：${payload.size || '尚未填寫'}`,
    `・創作方式：${payload.depth || '尚未填寫'}`,
    `・希望感受：${payload.feeling || '尚未填寫'}`,
    `・初步方案：${payload.plan || '待確認'}`,
    `・初步估價：NT$${priceText} 起`,
    '',
    '故事：',
    payload.story || '',
    '',
    payload.extra ? `其他補充：${payload.extra}` : '',
    '',
    '以上是網站依照目前資訊整理的初步方向，正式內容與報價仍會由我親自確認後回覆您。',
    '',
    '謝謝您～',
    '沁頤'
  ].filter(Boolean).join('\n');

  GmailApp.createDraft(payload.email, subject, body);
}

function jsonResponse_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
