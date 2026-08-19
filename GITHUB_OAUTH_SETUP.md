# GitHub OAuth Setup for Work-Tracking

เอกสารนี้ใช้กับระบบ Login ของ `My-Work-Tracking` ที่เชื่อม GitHub ผ่าน Supabase Auth โดยระบบใช้ `auth.users.id` หรือ `user.id` เป็นตัวระบุผู้ใช้หลัก และไม่ใช้ GitHub username เป็น `user_id`

## ภาพรวม URL ที่ต้องแยกให้ถูกต้อง

ระบบมี URL สองชนิดที่ทำหน้าที่ต่างกัน ซึ่งห้ามสลับกัน

| จุดที่ตั้งค่า | ค่าที่ต้องใช้ | หมายเหตุ |
|---|---|---|
| GitHub OAuth App → Authorization callback URL | `https://<project-ref>.supabase.co/auth/v1/callback` | ใช้ URL Callback ที่หน้า Supabase Authentication → Providers → GitHub แสดงจริง |
| Supabase Authentication → URL Configuration → Redirect URLs | `https://<render-domain>/auth/callback` | เป็น route ของเว็บไซต์ที่รับ authorization code แล้วแลกเป็น session |
| Production Redirect URL | `https://google-sheet-organizer.onrender.com/auth/callback` | ต้องเพิ่มใน Supabase URL Configuration → Redirect URLs |
| Local Redirect URL | `http://localhost:<port>/auth/callback` | ใช้เฉพาะ port ที่กำลังรันในเครื่อง และต้องเพิ่มใน Supabase allow list ก่อนทดสอบ |

การตรวจเว็บไซต์ Render จริงพบว่า build ปัจจุบันกำลังเรียก Supabase project ref `ppvxmzhgbgjkgfrvzahi` และยังตอบ `Unsupported provider: provider is not enabled` ดังนั้นหากจะ redeploy โดยใช้ Supabase project เดิมของเว็บไซต์ ให้ใช้ API URL `https://ppvxmzhgbgjkgfrvzahi.supabase.co` และ GitHub OAuth App callback URL `https://ppvxmzhgbgjkgfrvzahi.supabase.co/auth/v1/callback` หลังจากเปิด GitHub Provider แล้ว หากเปลี่ยนไปใช้ Supabase project อื่น ให้เปลี่ยนทั้ง `VITE_SUPABASE_URL`, `SUPABASE_URL`, publishable/anon key และ Callback URL ให้เป็น project เดียวกันทั้งหมด

## ตั้งค่า GitHub Provider ใน Supabase

ไปที่ Supabase Dashboard → Authentication → Providers → GitHub แล้วเปิดใช้งาน Provider จากนั้นนำ GitHub Client ID และ GitHub Client Secret ไปใส่ในช่องของ Supabase เท่านั้น ห้ามใส่ Client Secret ใน frontend, `.env` ที่ commit, `render.yaml`, ไฟล์ที่ขึ้นต้นด้วย `VITE_` หรือ GitHub repository

ใน GitHub Developer Settings ให้สร้าง OAuth App โดยใส่ Homepage URL เป็น URL เว็บไซต์จริง และใส่ Authorization callback URL เป็น Supabase Callback URL ที่ได้จากหน้า Provider ไม่ใช่ `/auth/callback` ของเว็บไซต์

## Environment Variables บน Render

เพิ่มค่าใน Render Dashboard → Environment โดยใช้ค่าจริงของโปรเจ็กต์ และห้าม commit ค่าเหล่านี้ลง GitHub

| ตัวแปร | จำเป็น | ตำแหน่งใช้งาน |
|---|---:|---|
| `VITE_SUPABASE_URL` | ใช่ | Browser build |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | ใช่ | Browser build; ใช้ publishable/anon key เท่านั้น |
| `SUPABASE_URL` | แนะนำ | Runtime/SSR fallback |
| `SUPABASE_PUBLISHABLE_KEY` | แนะนำ | Runtime/SSR fallback |
| `VITE_SUPABASE_URL` / `SUPABASE_URL` | ต้องเป็น | `https://ppvxmzhgbgjkgfrvzahi.supabase.co` หากใช้ Supabase project เดิมของเว็บไซต์ |

การเพิ่ม GitHub OAuth ไม่ต้องเพิ่ม Client ID หรือ Client Secret เป็น environment variable ของเว็บไซต์ เพราะค่าลับของ Provider ต้องอยู่ใน Supabase Authentication Provider Configuration ตามหลักการของ Supabase

## เส้นทางการทำงานในโค้ด

หน้า Login เรียก `supabase.auth.signInWithOAuth()` สำหรับ Google หรือ GitHub และกำหนด `redirectTo` เป็น `${window.location.origin}/auth/callback` ระบบใช้ PKCE และเก็บ session ตามการตั้งค่าของ Supabase client

ไฟล์ `src/routes/auth.callback.tsx` ตรวจ `error`/`error_description`, แลก `code` ด้วย `supabase.auth.exchangeCodeForSession(code)`, ตรวจผู้ใช้ด้วย `supabase.auth.getUser()` แล้ว redirect ไป `/` เมื่อสำเร็จ หากล้มเหลวจะแสดงข้อความภาษาไทยโดยไม่แสดง token หรือ secret

การเชื่อม Provider เพิ่มเติมจาก Settings ใช้ callback เดียวกันผ่าน `supabase.auth.linkIdentity()` เพื่อไม่ให้ Google Login หรือ GitHub identity linking ใช้เส้นทางคนละแบบ

## วิธีทดสอบหลังตั้งค่า

1. เปิดเว็บไซต์และกด Logout หากมี session ค้างอยู่
2. เปิดหน้า Login แล้วกด `Continue with GitHub`
3. ยืนยันตัวตนที่ GitHub และอนุญาตแอป
4. ตรวจว่ากลับมาที่ `/auth/callback` ชั่วคราว แล้วเข้าสู่ `/`
5. ตรวจว่าหน้า Dashboard แสดงบัญชี GitHub และข้อมูลมี `user_id` ตรงกับ `auth.users.id`
6. สร้าง work log หนึ่งรายการ แล้ว Refresh หน้าเว็บ
7. Logout แล้ว Login ด้วย GitHub บัญชีเดิมใหม่ ข้อมูลเดิมต้องกลับมา
8. ทำซ้ำด้วยบัญชีที่สองและตรวจว่าบัญชีที่สองไม่เห็นข้อมูลของบัญชีแรก
9. ทดสอบกดยกเลิกที่ GitHub หรือเปิด callback ด้วย `error=access_denied` ต้องเห็นข้อความยกเลิกและปุ่มกลับหน้า Login

การทดสอบที่ต้องใช้บัญชี GitHub จริงจะทำได้ต่อเมื่อ Provider ถูกเปิดและตั้งค่า Client ID/Client Secret ใน Supabase แล้วเท่านั้น ระบบจะไม่สร้างค่าปลอมขึ้นมา
