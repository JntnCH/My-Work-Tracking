# Google Sheets API direct integration research

วันที่ตรวจสอบ: 2026-08-15

## ข้อค้นพบหลัก

Google แนะนำให้ใช้ client libraries สำหรับ Google Workspace APIs และระบุว่า production ควรเลือก credential ให้เหมาะกับรูปแบบแอป [1]. สำหรับ backend ที่ทำงานแทนแอปโดยตรง Google API Node.js client รองรับ service account credentials และ JWT/service-account authentication [3].

Google Sheets API `spreadsheets.values.append` ต้องระบุ `spreadsheetId`, A1 range และ `valueInputOption`; endpoint จะเพิ่มแถวต่อจากท้ายตาราง และต้องใช้ OAuth scope อย่างใดอย่างหนึ่ง เช่น `https://www.googleapis.com/auth/spreadsheets` [2].

## สถาปัตยกรรมที่เลือก

ใช้ Service Account บน server ของ Render เพราะ Work Tracker เป็นแอป backend ที่บันทึกไปยัง spreadsheet กลาง ไม่ควรนำ private key ไป browser. ผู้ใช้ต้องแชร์ Google Sheet ให้กับอีเมลของ Service Account ด้วยสิทธิ์ Editor. Environment Variables ควรเก็บเป็น server-only secrets; แนะนำให้ใช้ `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY` และ `GOOGLE_SHEETS_SCOPES` หรือ `GOOGLE_CREDENTIALS_JSON` หากต้องการเก็บ JSON เป็นค่าเดียว.

## แหล่งข้อมูล

[1] Google Sheets Node.js quickstart: https://developers.google.com/workspace/sheets/api/quickstart/nodejs
[2] Google Sheets API values.append reference: https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets.values/append
[3] Google API Node.js client authentication and service account overview: https://github.com/googleapis/google-api-nodejs-client
