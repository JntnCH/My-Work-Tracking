# Project TODO

- [ ] Keep the original google-sheet-organizer structure and continue development there
- [ ] Persist Work Types in Supabase without losing them after refresh or browser changes
- [ ] Add the "ไม่มี OT" option and preserve the existing OT workflow
- [ ] Fix Dark Mode chart colors and maintain readable dashboard visuals
- [ ] Add or restore global and branch-level settings without replacing the original app shell
- [ ] Validate Airtable sync errors and configuration handling in the original app
- [ ] Run build, tests, and responsive browser verification on google-sheet-organizer

- [ ] Restore project structure from the last stable commit if any original files were lost
- [ ] Add automated tests for Work Types persistence, OT options, theme colors, and settings behavior
- [ ] Add loading, error, and empty states to the original settings and work-tracker flows
- [ ] Verify real Supabase schema and permissions before final delivery
- [ ] Make Airtable sync idempotent and surface failures to the user
- [ ] Verify mobile and desktop layouts in the original app
- [ ] Run final build and browser verification before checkpoint

## Existing history

- [ ] Previous work in tts-prompter is intentionally not used as the base for this restoration

## Approved implementation tasks

- [ ] Align generated Supabase types and authenticated-user persistence with the live Work-Tracking schema
- [ ] Preserve Guest LocalStorage while using Supabase as source of truth for authenticated users
- [ ] Add safe work-type hydration, one-time default seeding, merge, retry, and no-loss states
- [ ] Connect global and branch settings to the original SettingsPanel and Supabase
- [ ] Verify no-OT calculations, CSV/Sheets output, summaries, and Asia/Bangkok date-time behavior
- [ ] Make all dashboard charts readable in light and dark themes with explicit colors
- [ ] Make Airtable sync secure, idempotent, and retryable without blocking primary saves
- [ ] Add unit tests for payroll, OT, work-type persistence, theme application, and settings mapping
- [ ] Verify build, type-check, browser flows, responsive layouts, and deployment readiness

## Spck Editor & GitHub Readiness

- [x] ตรวจสอบโครงสร้างเดิมของ `google-sheet-organizer`
- [x] จัดโครงสร้างไฟล์ให้อ่านและแก้ไขง่ายบน Spck Editor
- [x] สร้างคู่มือการโคลนและแก้ไขโค้ดผ่าน GitHub และ Spck
- [x] แยกคอนฟิกและตรวจสอบความปลอดภัยของ secret (Supabase/Airtable)
- [x] เตรียมคำสั่ง build, test และ GitHub workflow ที่รองรับ Node/SSR
- [x] ตรวจสอบความถูกต้องและส่งมอบคู่มือการใช้งานบนมือถือ

## Publication Readiness

- [x] Verify the original app's production build output matches netlify.toml
- [x] Verify required deployment environment variables without committing secrets
- [x] Run production build and test commands before handoff
- [x] Prepare final publish instructions for the selected hosting provider

## Render.com Publication

- [x] Add a production start command compatible with Render Web Service and Nitro SSR
- [x] Add Render deployment documentation without exposing Supabase or Airtable secrets
- [x] Verify Render environment-variable names and health-check expectations
- [x] Run production build and start smoke test locally
- [x] Prepare GitHub-to-Render deployment steps for the user

- [x] Remove VITE-prefixed Airtable secrets from render.yaml so Airtable credentials never enter the browser bundle

## GitHub Push

- [x] ตรวจสอบไฟล์ที่ยังไม่ได้ commit และยืนยันว่าไม่มี secret จริงก่อน push
- [x] สร้าง commit สำหรับชุดงาน Render และ Work Tracker ที่พร้อมส่งขึ้น GitHub
- [x] Push commit ไปยัง branch main ของ repository JntnCH/google-sheet-organizer
- [x] ตรวจสอบ commit และไฟล์บน GitHub หลัง push

## Fix Render Missing Entrypoint Error

- [x] ตรวจสอบ build output จริงของโปรเจ็กต์ google-sheet-organizer ว่าสร้างไฟล์ server ที่ใด
- [x] ปรับคำสั่ง start ใน package.json และ render.yaml ให้ชี้ไปยังตำแหน่งไฟล์ server ที่ถูกต้อง
- [x] รัน build และทดสอบ start ในเครื่องด้วย PORT จำลอง
- [x] Commit และ Push การแก้ไขขึ้น GitHub เพื่อให้ Render Redeploy สำเร็จ

## Fix Render ENOENT Missing Entrypoint Error

- [x] ตรวจสอบว่า Render ตั้งค่า Root Directory ชี้ไปที่โฟลเดอร์ถูกต้องหรือไม่
- [x] อัปเดต render.yaml ให้ระบุ rootDir และ root build/start path ให้ตรงกัน
- [x] ทดสอบจำลองโครงสร้างโฟลเดอร์แบบ Render และยืนยันว่า start script หาไฟล์เจอ
- [x] Commit และ Push การตั้งค่าขึ้น GitHub

## Fix Google Sheets Connection & Non-functional Buttons

- [x] ค้นหาไฟล์ที่จัดการ Google Sheets integration และปุ่มในหน้า settings/work-tracker
- [x] ตรวจสอบว่าปุ่มใดบ้างเป็น dummy handler หรือขาด error/loading state
- [x] ปรับโค้ดให้การเชื่อมต่อ Google Sheets (Apps Script / API / Webhook / Supabase sync) ทำงานจริงพร้อมแจ้งเตือนสถานะ
- [x] เพิ่ม unit tests และรัน build ยืนยันความถูกต้อง
- [x] Commit และ Push โค้ดล่าสุดขึ้น GitHub พร้อมคู่มือตั้งค่า Google Sheets

## Google Sheets Connection Test Suite

- [x] เพิ่มการทดสอบ Google Account / gateway credential และ Service Account / connection credential โดยไม่แสดง secret
- [x] เพิ่มการทดสอบ Spreadsheet ID และสิทธิ์เข้าถึง spreadsheet
- [x] เพิ่ม Read, Write, Update และ Delete/Cleanup test ที่ไม่ทิ้งข้อมูลทดสอบค้างใน WorkLogs
- [x] แสดงผลสถานะ ✅ / ❌ และรายละเอียดข้อผิดพลาดใน Settings โดยรองรับมือถือ
- [x] เพิ่มหรือปรับ tests สำหรับ Connection Test และตรวจ build/type-check ก่อน Push

## Direct Google Sheets API Integration (Service Account / JWT)

- [x] แทนที่ gateway/connector เดิมด้วย googleapis / google-auth-library ใน server
- [x] ออกแบบ Environment Variables สำหรับ Render (`GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, หรือ `GOOGLE_CREDENTIALS_JSON`)
- [x] ปรับฟังก์ชัน sheets.functions.ts ให้เชื่อมต่อ Google Sheets API v4 โดยตรง (Read, Write, Update, Delete, Create)
- [x] คง Connection Test 8 ขั้นตอนและทดสอบด้วย Unit Tests
- [x] อัปเดตเอกสาร Render และ Commit/Push ขึ้น GitHub

## Working Animation

- [x] ค้นหาจุดที่แสดง Loading/Working animation ในแอป
- [x] เปลี่ยน animation ให้เป็นเครื่องยนต์กำลังทำงานและรักษาความชัดเจนบนมือถือ
- [x] รองรับ prefers-reduced-motion และตรวจ tests/build ก่อน Push
