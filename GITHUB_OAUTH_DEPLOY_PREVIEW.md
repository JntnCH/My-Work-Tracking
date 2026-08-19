# GitHub OAuth Deploy Preview

## สถานะงาน

โค้ดใน repository `JntnCH/My-Work-Tracking` ถูกเตรียมให้รองรับ GitHub Login ผ่าน Supabase Auth แบบ PKCE และพร้อมสำหรับการ deploy ใหม่บน Render โดยยัง **ไม่ได้ Commit หรือ Push** ตามข้อกำหนดของโปรเจ็กต์ที่ต้องแสดงตัวอย่างก่อนส่งขึ้น GitHub

เว็บจริงที่ตรวจสอบคือ [google-sheet-organizer.onrender.com](https://google-sheet-organizer.onrender.com/)

> สถานะปัจจุบันของเว็บจริง: หน้า Login และ Guest Mode ใช้งานได้ แต่ GitHub Provider ของ Supabase project ที่เว็บจริงใช้อยู่ตอบ `Unsupported provider: provider is not enabled` และเว็บจริงยังเป็น build ก่อนเพิ่ม callback ใหม่

## ตัวอย่างการทำงานหลัง Deploy

| ขั้นตอน | ผลลัพธ์ที่คาดหวัง |
|---|---|
| เปิด `/auth` บนโทรศัพท์ | เห็นปุ่ม `Continue with GitHub` และปุ่ม Guest Mode |
| กด `Continue with GitHub` | ไปยัง GitHub OAuth App ผ่าน Supabase Provider |
| อนุญาตแอป | GitHub ส่ง code กลับมายัง `/auth/callback` ของเว็บไซต์ |
| Callback สำเร็จ | `exchangeCodeForSession(code)` สร้าง session แล้ว redirect ไป `/` |
| Callback ล้มเหลวหรือยกเลิก | แสดงข้อความภาษาไทยและปุ่มกลับหน้า Login โดยไม่แสดง token |
| Refresh หรือเปิดอุปกรณ์ใหม่ | Supabase session เดิมถูกกู้คืน และข้อมูลยังผูกกับ `user.id` เดิม |
| Guest Mode | ยังคงใช้ข้อมูล local storage และไม่ถูกผสมกับข้อมูลบัญชีจริง |

## ไฟล์ที่จะเพิ่มหรือแก้ไข

| ไฟล์ | รายการเปลี่ยนแปลง |
|---|---|
| `src/routes/auth.callback.tsx` | เพิ่ม route `/auth/callback`, ตรวจ OAuth error, แลก authorization code ด้วย `exchangeCodeForSession`, ตรวจ `getUser`, redirect และ error UI |
| `src/routes/auth.tsx` | เปลี่ยน Google/GitHub ให้ redirect ไป `/auth/callback`, เปลี่ยนข้อความปุ่มเป็น `Continue with GitHub`, และปรับ help text/URL สำหรับ production |
| `src/integrations/supabase/client.ts` | เปิด `flowType: "pkce"` และคง session persistence/auto refresh |
| `src/components/work/AuthenticationSettings.tsx` | ให้การ link Google/GitHub ใช้ callback เดียวกัน |
| `src/routeTree.gen.ts` | generated route registration สำหรับ `/auth/callback` |
| `.env.example` | เพิ่มคำอธิบายว่า browser ต้องใช้ Supabase API URL และ publishable/anon key เท่านั้น |
| `GITHUB_OAUTH_SETUP.md` | เอกสารตั้งค่า GitHub Provider, Render environment และ Redirect URL |
| `render-deployment-notes.md` | บันทึกผล build/runtime และข้อกำหนด OAuth deployment |

## ค่าที่ต้องตั้งก่อน Deploy

ให้ใช้ Supabase project เดียวกันทั้งสี่รายการด้านล่าง โดยค่าที่ตรวจจากเว็บจริงในปัจจุบันคือ project ref `ppvxmzhgbgjkgfrvzahi`

| ตำแหน่ง | ค่าที่ต้องตั้ง |
|---|---|
| Render `VITE_SUPABASE_URL` | `https://ppvxmzhgbgjkgfrvzahi.supabase.co` หากใช้ Supabase project เดิมของเว็บจริง |
| Render `VITE_SUPABASE_PUBLISHABLE_KEY` | publishable key หรือ legacy anon key ของ project เดียวกัน ห้ามใช้ service secret |
| Render `SUPABASE_URL` | URL เดียวกับ `VITE_SUPABASE_URL` |
| Render `SUPABASE_PUBLISHABLE_KEY` | key เดียวกับ `VITE_SUPABASE_PUBLISHABLE_KEY` |
| Supabase Redirect URLs | `https://google-sheet-organizer.onrender.com/auth/callback` |
| GitHub OAuth App Authorization callback URL | `https://ppvxmzhgbgjkgfrvzahi.supabase.co/auth/v1/callback` หากใช้ project ref นี้ |

GitHub Client ID และ Client Secret ต้องใส่ที่ Supabase Dashboard → Authentication → Providers → GitHub เท่านั้น ห้ามใส่ใน Render environment ของ frontend, ห้ามใช้ตัวแปร `VITE_`, ห้ามเขียนลง `.env.example` และห้าม commit ลง repository

## ผลการตรวจสอบ

การติดตั้ง dependency ผ่าน `npm ci --include=dev` สำเร็จและ npm audit รายงานไม่พบช่องโหว่ การตรวจ ESLint แบบ targeted สำหรับไฟล์ auth ที่แก้ไขผ่าน การทดสอบผ่าน 5 test files รวม 18 tests และ `npm run build:render` ผ่านพร้อมตรวจ production artifacts แล้ว `git diff --check` ไม่พบ whitespace error และ repository ไม่ได้ track ไฟล์ `.env` จริง

การตรวจ Supabase schema พบว่า `work_logs` มี field งานเดิมครบแล้วและทุกตารางงานที่เกี่ยวข้องเปิด RLS อยู่ โดย policy เปรียบเทียบ `user_id` กับ `auth.uid()::text` จึงไม่ต้องเพิ่ม migration หรือ field ซ้ำ การตรวจ security advisor ของ Supabase ไม่พบรายการแจ้งเตือน

การตรวจเว็บไซต์จริงพบว่า `/auth` และ Guest Mode เปิดได้บน HTTPS แต่การกด GitHub ยังถูกปฏิเสธเพราะ Provider ยังไม่เปิดใช้งานใน project ที่ deploy อยู่ ดังนั้นขั้นตอนนี้ต้องทำใน Supabase Dashboard ก่อน แล้วจึง deploy build นี้ใหม่

## ขอบเขตการส่งมอบครั้งนี้

ไฟล์และโค้ดพร้อมสำหรับ review, Commit และ Push แต่ผมยังไม่ดำเนินการ Commit/Push เพราะโปรเจ็กต์กำหนดให้แสดงตัวอย่างก่อน และการเปิด GitHub Provider ต้องใช้ Client Secret ของเจ้าของบัญชีซึ่งไม่ควรส่งผ่านแชตหรือใส่ใน repository
