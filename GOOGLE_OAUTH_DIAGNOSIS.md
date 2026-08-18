# Google OAuth Diagnosis

วันที่ตรวจสอบ: 2026-08-16 (Asia/Bangkok)
Branch: `feature/auth-settings-hardening`

## หลักฐานจาก preview

- หน้า `/auth` แสดงปุ่ม Google แต่การกดปุ่มไม่เปลี่ยน URL และไม่เกิด toast error
- `window.self === window.top` เป็น `true` ใน preview
- ปุ่มมี React `onClick` handler จริง และ handler คือ `() => void signInGoogle()`
- `@lovable.dev/cloud-auth-js` รุ่นที่ติดตั้งใช้ broker URL เริ่มต้นเป็น path แบบ relative: `/~oauth/initiate`
- เมื่อเรียก `GET https://<sandbox-preview-origin>/~oauth/initiate?...` ได้ HTTP 200 พร้อม HTML ของ Vite/Work Tracker ไม่ใช่ OAuth broker response

## ข้อสรุป

`auth.tsx` ใช้ Lovable OAuth wrapper สำหรับ Google แต่ wrapper ต้องการ Lovable-hosted OAuth broker ที่ path `/~oauth/initiate`; sandbox preview ไม่ได้ proxy path นี้ไปยัง Lovable broker จึงทำให้ Google Login ไม่เริ่ม flow ที่ถูกต้อง. วิธีแก้ที่สอดคล้องกับโค้ดปัจจุบันคือเปลี่ยน Google Login ให้ใช้ `supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/` } })` แบบเดียวกับ GitHub และ account linking.

## ขอบเขตการแก้ไข

แก้เฉพาะ `src/routes/auth.tsx` โดยลบ import ของ Lovable wrapper และปรับ `signInGoogle()`; ไม่เปลี่ยน calculation, API, database, responsive layout หรือ Supabase auth configuration. `src/integrations/lovable/index.ts` ยังเก็บไว้เพื่อไม่ทำลาย compatibility ของโค้ดอื่น หากมีการใช้งานภายหลัง.

## ผลหลังแก้ code

- Production build ผ่านเมื่อเพิ่มเวลา build และหยุด Vite process ที่ใช้ memory สูง; targeted ESLint ของไฟล์ที่แก้ผ่านด้วย exit 0.
- เมื่อทดสอบปุ่ม Google บน preview หลังแก้ code หน้า redirect ไปที่ `placeholder.supabase.co` และ browser แสดง `DNS_PROBE_FINISHED_NXDOMAIN`. นี่เป็นหลักฐานว่า code เริ่ม Supabase OAuth flow แล้ว แต่ preview ไม่มี `VITE_SUPABASE_URL` และ `VITE_SUPABASE_PUBLISHABLE_KEY` จึงใช้ fallback placeholder ตาม client.ts.
- ตัวแปรใน shell ของ sandbox: `SUPABASE_URL` มีค่า แต่ไม่มี `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_PUBLISHABLE_KEY` หรือ `SUPABASE_ANON_KEY`; ไม่มีไฟล์ `.env` มีเพียง `.env.example`.
- Production URL `https://google-sheet-organizer.lovable.app/auth` ขณะตรวจสอบแสดง “This page didn't load / Something went wrong on our end” ก่อนทดสอบ OAuth จึงต้องตรวจสอบ deployment/runtime configuration ของ production แยกต่างหาก.

## สถานะปัจจุบัน

โค้ด Google Login ถูกเปลี่ยนจาก Lovable broker เป็น Supabase OAuth แล้ว และ build ผ่าน; การทดสอบ end-to-end ยังติดที่ environment ของ preview และ production configuration ไม่ใช่ TypeScript compile error.

## End-to-end result with real Supabase env

เมื่อสร้าง `.env.local` แบบ ignored ด้วย `VITE_SUPABASE_URL` ของ project `idxioootfnninrejvspi` และ publishable key ที่ไม่ disabled แล้ว restart Vite บนพอร์ต 8081, การกด “เข้าสู่ระบบด้วย Google” redirect สำเร็จไปที่ Google Sign-In.

URL ที่ browser แสดงมี callback เป็น `https://idxioootfnninrejvspi.supabase.co/auth/v1/callback`, provider เป็น Google, `response_type=code`, scope เป็น `email profile`, และ redirect target กลับไปยัง preview origin. หน้า Google แสดงข้อความ “Sign in with Google to continue to idxioootfnninrejvspi.supabase.co”.

ข้อสรุปจากการทดสอบนี้คือ Google OAuth code path ทำงานแล้ว; preview ต้องมี Supabase URL และ publishable key ที่ถูกต้อง. การทดสอบยังไม่ได้กรอกอีเมลหรือยืนยัน login และไม่ได้เปลี่ยนข้อมูลผู้ใช้.
