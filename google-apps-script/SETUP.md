# Google 試算表＋Gmail 自動串接

這套流程會讓網站表單只填一次：

網站送出 → Google 試算表新增一列 → Gmail 自動建立回覆草稿

## 一次性設定

1. 打開 https://script.google.com
2. 建立「新專案」
3. 把 `Code.gs` 的全部內容貼進去並儲存
4. 點右上角「部署」→「新增部署作業」
5. 類型選「網頁應用程式」
6. 執行身分選「我」
7. 誰可以存取選「所有人」
8. 點「部署」，完成 Google 授權
9. 複製部署後的 Web App URL
10. 把 Web App URL 貼回 ChatGPT，網站程式就能完成最後串接

## 完成後會自動建立

- Google 試算表：`沁頤藝術委託 CRM｜網站回覆`
- 工作表：`網站委託回覆`
- 每一筆網站送出資料會新增一列
- Gmail 會建立一封回覆草稿，但不會自動寄出

## 安全提醒

不要把 Google 帳號密碼或任何 API Key 放進 GitHub。Apps Script 的權限只放在 Google 帳號內。