# LINE Login Setup สำหรับ Work Tracker

## สิ่งที่โค้ดรองรับ

ระบบรองรับสองทางเลือกในปุ่ม **เข้าสู่ระบบด้วย LINE LIFF** โดยจะเลือกอัตโนมัติตาม environment ของการ deploy หากมี `VITE_LINE_LIFF_ID` ระบบจะ initialize LIFF และใช้ `liff.login()` พร้อม `liff.getIDToken()` จากนั้นส่ง raw ID token ให้ Supabase Auth ผ่าน `signInWithIdToken({ provider: "custom:line" })` ซึ่งให้ Supabase Auth ตรวจสอบ token กับ Custom OIDC provider ก่อนสร้าง session หากไม่มี LIFF ID ระบบจะใช้ Supabase Custom OIDC browser flow ผ่าน `signInWithOAuth({ provider: "custom:line" })` แทน ทั้งสองทางกลับเข้าสู่ Supabase Auth session เดียวกันและไม่สร้าง local user แบบใหม่

ลำดับการทำงานของ LIFF path คือ `liff.init()` → `liff.login()` หากยังไม่ login → LINE redirect กลับมายัง `/auth?line_login=1` → `liff.init()` อีกครั้ง → `liff.getIDToken()` → `supabase.auth.signInWithIdToken()` → Supabase session เดิมของแอป การยืนยันตัวตนเกิดขึ้นที่ Supabase/LINE ไม่ใช่จากข้อมูล profile ที่ browser ถอดหรือส่งเอง

## ค่าที่ต้องตั้งใน Netlify

เพิ่มตัวแปร public ต่อไปนี้ใน Netlify ที่ **Site configuration → Environment variables** แล้ว trigger deploy ใหม่ โดยใช้ LIFF ID จริงจาก LINE Developers Console ช่องนี้ไม่ใช่ Channel Secret และสามารถถูกฝังใน browser build ได้ตามการออกแบบของ LIFF

| Variable            | ค่า                                      |
| ------------------- | ---------------------------------------- |
| `VITE_LINE_LIFF_ID` | LIFF ID จริงของ LIFF App ที่สร้างไว้แล้ว |

ห้ามเพิ่ม `LINE_CHANNEL_SECRET`, `SUPABASE_SERVICE_ROLE_KEY` หรือ secret ใด ๆ ที่ขึ้นต้นด้วย `VITE_` ลงใน frontend หรือ repository โดยเด็ดขาด

## ค่าที่ต้องตั้งใน LINE Developers Console

ใช้ Channel เดียวกับ LIFF App ที่มีอยู่แล้ว และตรวจว่า OpenID Connect เปิดใช้งานพร้อม scope `openid` และ `profile` หากต้องการ email ต้องขอสิทธิ์ email ตามขั้นตอนของ LINE ก่อน เพราะ scope email ไม่ได้พร้อมใช้โดยอัตโนมัติสำหรับทุก Channel

สำหรับการใช้ LIFF ให้ตั้ง **Endpoint URL เป็นโดเมนเดียวกับเว็บที่ผู้ใช้เปิดปุ่ม login** เช่น `https://<ชื่อ-site>.netlify.app/` หรือ custom domain จริงของ Netlify และห้ามสลับระหว่าง Render, Netlify preview URL และ production URL เพราะ LIFF กำหนดให้ `redirectUri` ต้องอยู่ที่ Endpoint URL หรือ path ที่อยู่ด้านล่างของ Endpoint URL [2] เส้นทางที่ระบบใช้รับผลกลับคือ `/auth?line_login=1` และโค้ดจะเรียก `liff.init()` ก่อนแก้ query/hash ของ LIFF เสมอ

## ค่าที่ต้องตั้งใน Supabase Custom OIDC Provider

ไปที่ **Authentication → Sign In/Providers → Custom Providers** แล้วสร้าง provider ชื่อ `line` ซึ่งจะถูกเรียกจากโค้ดเป็น `custom:line` ค่า discovery ที่ตรวจสอบจาก LINE public metadata คือ issuer `https://access.line.me`, authorization endpoint `https://access.line.me/oauth2/v2.1/authorize`, token endpoint `https://api.line.me/oauth2/v2.1/token`, JWKS `https://api.line.me/oauth2/v2.1/certs` และ userinfo `https://api.line.me/oauth2/v2.1/userinfo` ส่วน Client ID ให้ใช้ Channel ID จาก LINE Developers Console และ Client Secret ให้ใส่ใน Supabase Dashboard เท่านั้น

| Supabase/LINE setting  | ค่า                                                     |
| ---------------------- | ------------------------------------------------------- |
| Provider name          | `line`                                                  |
| Issuer                 | `https://access.line.me`                                |
| Authorization endpoint | `https://access.line.me/oauth2/v2.1/authorize`          |
| Token endpoint         | `https://api.line.me/oauth2/v2.1/token`                 |
| JWKS URL               | `https://api.line.me/oauth2/v2.1/certs`                 |
| Userinfo URL           | `https://api.line.me/oauth2/v2.1/userinfo`              |
| Client ID              | LINE Channel ID                                         |
| Client Secret          | LINE Channel Secret; ใส่ใน Supabase เท่านั้น            |
| Scopes                 | `openid profile` และเพิ่ม `email` เมื่อได้รับสิทธิ์แล้ว |

ตรวจชื่อฟิลด์ที่ Dashboard แสดงอีกครั้งก่อนกด Save เนื่องจาก Supabase อาจจัดกลุ่ม endpoint หรือใช้ discovery URL แทนการกรอก endpoint แยกกันในบางหน้าจอ

## Redirect URLs

สำหรับ Netlify ให้แทน `<NETLIFY_SITE_URL>` ด้วย URL production จริงของ site แล้วเพิ่มค่าเหล่านี้ใน **Supabase → Authentication → URL Configuration → Redirect URLs**

```text
<NETLIFY_SITE_URL>/auth/callback
<NETLIFY_SITE_URL>/auth
```

ตัวอย่างเช่น `https://my-work-tracking.netlify.app/auth/callback` และ `https://my-work-tracking.netlify.app/auth` ส่วน LIFF Endpoint URL ต้องเป็น origin เดียวกันกับ `<NETLIFY_SITE_URL>` และควรใช้ production URL ไม่ใช่ Deploy Preview URL หากไม่ได้เพิ่ม preview host นั้นไว้ใน LINE Developers Console สำหรับ local development ให้เพิ่ม origin local ที่ใช้งานจริงของ Vite พร้อม `/auth/callback` และ `/auth` เป็นรายการแยกต่างหาก อย่าใช้ wildcard กว้างเกินจำเป็น

ถ้าเห็น `400 Bad Request` จาก `access.line.me` ให้ตรวจตามลำดับนี้: เปิดเว็บจาก URL เดียวกับ Endpoint URL, ตรวจว่า `VITE_LINE_LIFF_ID` ใน Netlify เป็น LIFF ID ของ channel เดียวกับ Endpoint URL, ตรวจว่า Endpoint URL ครอบคลุม `/auth`, และ trigger deploy ใหม่หลังแก้ environment variable ค่า 400 ในช่วงก่อน consent มักเกิดจาก `redirect_uri` ไม่อยู่ใต้ Endpoint URL หรือใช้ LIFF ID/channel ผิดชุด

## ขั้นตอนทดสอบบนโทรศัพท์

เปิด `<NETLIFY_SITE_URL>/auth` จาก browser หรือเปิด LIFF URL ในแอป LINE แล้วกด **เข้าสู่ระบบด้วย LINE LIFF** ควรเห็นหน้าอนุญาตของ LINE หรือถูกเข้าสู่ระบบอัตโนมัติตาม session ของ LINE หลังอนุญาต ระบบต้องกลับมายัง Work Tracker, แสดงชื่อผู้ใช้จาก Supabase session และโหลดข้อมูลของ `auth.uid()` เดิมโดยไม่สร้างบัญชีซ้ำ

ทดสอบกรณีผู้ใช้กดยกเลิก, provider ยังไม่เปิด, LIFF ID ผิด, ไม่มี `openid` scope, เปิด `/auth?line_login=1` โดยไม่มี session LINE และกลับมาเปิดหน้าเว็บใหม่ด้วย หากเกิดข้อผิดพลาด ระบบต้องแสดงข้อความที่อ่านได้และไม่แสดง ID token, Channel Secret หรือ service-role key ในหน้าจอและ console

## วิธีตรวจสอบหลัง deploy

ตรวจให้ครบทั้ง browser ปกติและ LINE mobile app: เปิด `/auth`, กด **LINE LIFF**, อนุญาตการเข้าสู่ระบบ, ตรวจว่ากลับมายังหน้า `/` และ refresh แล้ว session ยังอยู่ จากนั้นทดสอบ logout และ login ซ้ำอีกครั้ง หาก `VITE_LINE_LIFF_ID` ไม่ได้ตั้งใจให้ว่าง ต้องไม่เห็น fallback OIDC โดยไม่ตั้งค่า provider ให้ครบ

## หมายเหตุด้านความปลอดภัย

LINE ระบุว่าข้อมูลผู้ใช้ที่ส่งไป server ควรใช้ raw ID token จาก `liff.getIDToken()` แล้วตรวจสอบ token ฝั่ง server/identity provider ไม่ควรส่งข้อมูล profile ที่ client ถอดเองไปเชื่อถือเป็นตัวตนหลัก ระบบนี้จึงใช้ Supabase Auth เป็น source of truth และใช้ `auth.uid()` เป็นตัวระบุข้อมูล ไม่ใช้ LINE display name หรือ email เป็น primary key

โค้ดจะไม่เก็บ ID token ใน localStorage, sessionStorage, URL หรือฐานข้อมูล และจะแปลง error ของ LIFF/Supabase เป็นข้อความปลอดภัยก่อนแสดงใน toast เพื่อไม่ให้ token หรือข้อมูลภายในหลุดไปยังผู้ใช้ ตรวจสอบด้วยว่าไม่มี channel secret หรือ service-role key ที่ขึ้นต้นด้วย `VITE_` และอย่าส่ง primary redirect URL ที่ยังมี credential query parameters ไปยัง analytics ก่อน `liff.init()` เสร็จ

## References

[1]: https://developers.line.biz/en/docs/line-login/integrate-line-login/ LINE Developers — Integrating LINE Login with your web app.

[2]: https://developers.line.biz/en/reference/liff/ LINE Developers — LIFF API reference.

[3]: https://developers.line.biz/en/docs/liff/using-user-profile/ LINE Developers — Using user data in LIFF apps and servers.

[4]: https://access.line.me/.well-known/openid-configuration LINE public OpenID Connect discovery metadata.

[5]: https://supabase.com/docs/reference/javascript/auth-signinwithidtoken Supabase JavaScript — `signInWithIdToken`.

[6]: https://supabase.com/docs/guides/auth/custom-oauth-providers Supabase — Custom OAuth/OIDC Providers.
