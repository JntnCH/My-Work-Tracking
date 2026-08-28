# Authentication Setup สำหรับ Work Tracker

## สถาปัตยกรรมปัจจุบัน

ระบบใช้ **Firebase Authentication เป็น source of truth สำหรับตัวตนและ session** โดยรองรับ Google, GitHub, Email/Password, Phone OTP และ LINE ผ่าน OIDC provider `oidc.line` ส่วน Supabase ยังคงใช้สำหรับฐานข้อมูลและ Storage โดย Supabase client จะส่ง Firebase ID token ผ่าน `accessToken` เพื่อให้ RLS ของ Supabase ตรวจสอบตัวตนจาก Firebase ได้

> ห้ามใช้ Supabase Auth และ Firebase Auth เป็น session หลักพร้อมกัน เพราะจะทำให้ผู้ใช้มี identity และ lifecycle คนละชุด

## Environment variables ใน Netlify

เพิ่มค่าต่อไปนี้ใน **Netlify → Site configuration → Environment variables** โดยตั้ง scope เป็น production/all deploy contexts แล้ว trigger **Clear cache and deploy site** หลังแก้ค่า

| Variable                                                      | ใช้สำหรับ                                                         |
| ------------------------------------------------------------- | ----------------------------------------------------------------- |
| `VITE_FIREBASE_API_KEY`                                       | Firebase Web app config                                           |
| `VITE_FIREBASE_AUTH_DOMAIN`                                   | Firebase Auth redirect domain เช่น `<project-id>.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID`                                    | Firebase project เดียวกับ Authentication                          |
| `VITE_FIREBASE_STORAGE_BUCKET`                                | Firebase Web app config                                           |
| `VITE_FIREBASE_MESSAGING_SENDER_ID`                           | Firebase Web app config                                           |
| `VITE_FIREBASE_APP_ID`                                        | Firebase Web app config                                           |
| `VITE_FIREBASE_MEASUREMENT_ID`                                | ไม่บังคับ ใช้เมื่อเปิด Analytics                                  |
| `VITE_SUPABASE_URL`                                           | Supabase Database/Storage URL                                     |
| `VITE_SUPABASE_PUBLISHABLE_KEY` หรือ `VITE_SUPABASE_ANON_KEY` | Supabase public key สำหรับ Database/Storage                       |

ค่า Firebase Web config เป็น public configuration และถูกฝังใน browser bundle ได้ แต่ **ห้าม** ใส่ Firebase service-account JSON, private key, Supabase service-role key หรือ secret อื่นใดในตัวแปรที่ขึ้นต้นด้วย `VITE_`

## Firebase Authentication providers

ไปที่ **Firebase Console → Authentication → Sign-in method** แล้วเปิด provider ที่ต้องการ ได้แก่ Google, GitHub, Email/Password และ Phone หากใช้ LINE ให้เพิ่ม **OpenID Connect** provider ด้วย provider ID `oidc.line` และตั้งค่า issuer/client credentials ตามค่าที่ Firebase Console กำหนดสำหรับ LINE Login channel ของคุณ

สำหรับ Google ให้เพิ่มโดเมน Netlify จริงใน **Authentication → Settings → Authorized domains** เช่น `my-work-tracking.netlify.app` ห้ามใส่ protocol หรือ path ในช่อง domain หากเห็น `auth/unauthorized-domain` ให้ตรวจจุดนี้ก่อน

สำหรับ GitHub ต้องสร้าง OAuth App และตั้ง callback URL ตาม Firebase Console ที่แสดงให้ provider นั้นโดยเฉพาะ จากนั้นใส่ Client ID และ Client Secret ใน Firebase Dashboard เท่านั้น

สำหรับ Phone ให้เปิด Phone provider และตั้งค่า reCAPTCHA/โควตา SMS ตามขั้นตอนของ Firebase โดยหน้าเว็บจะสร้าง invisible reCAPTCHA ใน element `recaptcha-container` ก่อนส่ง OTP

## Supabase third-party auth integration

ใน Supabase Dashboard ให้เพิ่ม Firebase เป็น **Third-party Auth integration** โดยใช้ Firebase Project ID เดียวกับ `VITE_FIREBASE_PROJECT_ID` จากนั้นตรวจว่า RLS policies ของตารางใช้ `auth.uid()` และกำหนด custom claim `role: authenticated` ให้ Firebase users ตามแนวทางของ Supabase Third-party Auth หากไม่ทำขั้นตอนนี้ ผู้ใช้จะ login Firebase สำเร็จแต่ query ฐานข้อมูลอาจได้ `401` หรือถูก RLS ปฏิเสธ

ระบบไม่เรียก `supabase.auth.signInWithOAuth`, `signInWithPassword`, `verifyOtp` หรือ `exchangeCodeForSession` อีกต่อไป ตัวตนและการออกจากระบบใช้ Firebase SDK ทั้งหมด ส่วน Supabase client มีหน้าที่เรียก Data API/Storage โดยแนบ Firebase ID token อัตโนมัติ

## การทดสอบบน Netlify

เปิด production URL แล้วไปที่ `/auth` ตรวจว่า status banner แสดง **ระบบ Firebase พร้อมเชื่อมต่อบัญชี** จากนั้นทดสอบ Google บนอุปกรณ์มือถือและ desktop, Email/Password, Phone OTP, GitHub และ LINE OIDC ทีละ provider หลัง login สำเร็จให้ refresh หน้า, เปิดข้อมูลเดิม, ทดสอบ logout และ login ซ้ำ

หาก status banner ยังเป็นสีเหลือง ให้ตรวจชื่อและ scope ของ Firebase `VITE_*` variables แล้ว deploy ใหม่ เพราะค่าถูกฝังใน build-time หาก Google แสดง `auth/unauthorized-domain` ให้เพิ่ม Netlify hostname ใน Firebase Authorized domains หาก LINE แสดง provider error ให้ตรวจ provider ID `oidc.line`, issuer และ callback URL ใน Firebase Console

## Security checklist

ระบบไม่เก็บ Firebase ID token ใน localStorage หรือ URL, ไม่ใช้ email/display name เป็น primary key และไม่ยืนยันตัวตนจาก profile ที่ browser ถอดเอง ผู้ใช้ที่เป็น Guest จะยังเป็น local-only user และจะไม่ถูกส่งไป Firebase จนกว่าจะเลือก provider จริง

### References

[1]: https://firebase.google.com/docs/auth/web/google-signin Firebase — Authenticate Using Google with JavaScript
[2]: https://firebase.google.com/docs/auth/web/start Firebase — Get Started with Firebase Authentication on Websites
[3]: https://supabase.com/docs/guides/auth/third-party/firebase-auth Supabase — Use Firebase Auth with your Supabase project
[4]: https://firebase.google.com/docs/auth/admin/verify-id-tokens Firebase — Verify ID tokens using the Admin SDK
