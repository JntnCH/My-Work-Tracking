# LINE Login Setup สำหรับ Work Tracker

## สิ่งที่โค้ดรองรับ

ระบบรองรับสองทางเลือกในปุ่ม **เข้าสู่ระบบด้วย LINE** โดยจะเลือกอัตโนมัติตาม environment ของการ deploy หากมี `VITE_LINE_LIFF_ID` ระบบจะ initialize LIFF และใช้ `liff.login()` พร้อม `liff.getIDToken()` จากนั้นส่ง ID token ให้ Supabase Auth ผ่าน `signInWithIdToken({ provider: "custom:line" })` หากไม่มี LIFF ID ระบบจะใช้ Supabase Custom OIDC browser flow ผ่าน `signInWithOAuth({ provider: "custom:line" })` แทน ทั้งสองทางกลับเข้าสู่ Supabase Auth session เดียวกันและไม่สร้าง local user แบบใหม่

## ค่าที่ต้องตั้งใน Render

เพิ่มตัวแปร public ต่อไปนี้ใน Render Environment Variables โดยใช้ LIFF ID จริงจาก LINE Developers Console ช่องนี้ไม่ใช่ Channel Secret และสามารถถูกฝังใน browser build ได้ตามการออกแบบของ LIFF

| Variable | ค่า |
|---|---|
| `VITE_LINE_LIFF_ID` | LIFF ID จริงของ LIFF App ที่สร้างไว้แล้ว |

ห้ามเพิ่ม `LINE_CHANNEL_SECRET`, `SUPABASE_SERVICE_ROLE_KEY` หรือ secret ใด ๆ ที่ขึ้นต้นด้วย `VITE_` ลงใน frontend หรือ repository โดยเด็ดขาด

## ค่าที่ต้องตั้งใน LINE Developers Console

ใช้ Channel เดียวกับ LIFF App ที่มีอยู่แล้ว และตรวจว่า OpenID Connect เปิดใช้งานพร้อม scope `openid` และ `profile` หากต้องการ email ต้องขอสิทธิ์ email ตามขั้นตอนของ LINE ก่อน เพราะ scope email ไม่ได้พร้อมใช้โดยอัตโนมัติสำหรับทุก Channel

สำหรับการใช้ LIFF ให้ตรวจ Endpoint URL ให้ครอบคลุมเว็บไซต์จริงของระบบ และอนุญาตเส้นทาง `/auth` ที่ระบบใช้เริ่มต้น/รับผลกลับ หาก LIFF Console ต้องการ URL เฉพาะ ให้ใช้ URL ที่สอดคล้องกับ Endpoint URL ตามข้อกำหนดของ LIFF และอย่าแก้ query parameters ของ LIFF ก่อน `liff.init()` เสร็จ

## ค่าที่ต้องตั้งใน Supabase Custom OIDC Provider

ไปที่ **Authentication → Sign In/Providers → Custom Providers** แล้วสร้าง provider ชื่อ `line` ซึ่งจะถูกเรียกจากโค้ดเป็น `custom:line` ค่า discovery ที่ตรวจสอบจาก LINE public metadata คือ issuer `https://access.line.me`, authorization endpoint `https://access.line.me/oauth2/v2.1/authorize`, token endpoint `https://api.line.me/oauth2/v2.1/token`, JWKS `https://api.line.me/oauth2/v2.1/certs` และ userinfo `https://api.line.me/oauth2/v2.1/userinfo` ส่วน Client ID ให้ใช้ Channel ID จาก LINE Developers Console และ Client Secret ให้ใส่ใน Supabase Dashboard เท่านั้น

| Supabase/LINE setting | ค่า |
|---|---|
| Provider name | `line` |
| Issuer | `https://access.line.me` |
| Authorization endpoint | `https://access.line.me/oauth2/v2.1/authorize` |
| Token endpoint | `https://api.line.me/oauth2/v2.1/token` |
| JWKS URL | `https://api.line.me/oauth2/v2.1/certs` |
| Userinfo URL | `https://api.line.me/oauth2/v2.1/userinfo` |
| Client ID | LINE Channel ID |
| Client Secret | LINE Channel Secret; ใส่ใน Supabase เท่านั้น |
| Scopes | `openid profile` และเพิ่ม `email` เมื่อได้รับสิทธิ์แล้ว |

ตรวจชื่อฟิลด์ที่ Dashboard แสดงอีกครั้งก่อนกด Save เนื่องจาก Supabase อาจจัดกลุ่ม endpoint หรือใช้ discovery URL แทนการกรอก endpoint แยกกันในบางหน้าจอ

## Redirect URLs

สำหรับหน้าเว็บที่ deploy บน Render ให้เพิ่ม URL ต่อไปนี้ใน **Supabase → Authentication → URL Configuration → Redirect URLs**

```text
https://google-sheet-organizer.onrender.com/auth/callback
https://google-sheet-organizer.onrender.com/auth
```

ถ้าใช้ local development ให้เพิ่ม origin local ที่ใช้งานจริงของ Vite พร้อม `/auth/callback` และ `/auth` เป็นรายการแยกต่างหาก อย่าใช้ wildcard กว้างเกินจำเป็น

## ขั้นตอนทดสอบบนโทรศัพท์

เปิด `https://google-sheet-organizer.onrender.com/auth` จาก browser หรือเปิด LIFF URL ในแอป LINE แล้วกด **เข้าสู่ระบบด้วย LINE** ควรเห็นหน้าอนุญาตของ LINE หรือถูกเข้าสู่ระบบอัตโนมัติตาม session ของ LINE หลังอนุญาต ระบบต้องกลับมายัง Work Tracker, แสดงชื่อผู้ใช้จาก Supabase session และโหลดข้อมูลของ `auth.uid()` เดิมโดยไม่สร้างบัญชีซ้ำ

ทดสอบกรณีผู้ใช้กดยกเลิก, provider ยังไม่เปิด, LIFF ID ผิด, ไม่มี `openid` scope และกลับมาเปิดหน้าเว็บใหม่ด้วย หากเกิดข้อผิดพลาด ระบบต้องแสดงข้อความที่อ่านได้และไม่แสดง ID token, Channel Secret หรือ service-role key ในหน้าจอและ console

## หมายเหตุด้านความปลอดภัย

LINE ระบุว่าข้อมูลผู้ใช้ที่ส่งไป server ควรใช้ raw ID token จาก `liff.getIDToken()` แล้วตรวจสอบ token ฝั่ง server/identity provider ไม่ควรส่งข้อมูล profile ที่ client ถอดเองไปเชื่อถือเป็นตัวตนหลัก ระบบนี้จึงใช้ Supabase Auth เป็น source of truth และใช้ `auth.uid()` เป็นตัวระบุข้อมูล ไม่ใช้ LINE display name หรือ email เป็น primary key

## References

[1]: https://developers.line.biz/en/docs/line-login/integrate-line-login/ LINE Developers — Integrating LINE Login with your web app.

[2]: https://developers.line.biz/en/reference/liff/ LINE Developers — LIFF API reference.

[3]: https://developers.line.biz/en/docs/liff/using-user-profile/ LINE Developers — Using user data in LIFF apps and servers.

[4]: https://access.line.me/.well-known/openid-configuration LINE public OpenID Connect discovery metadata.

[5]: https://supabase.com/docs/reference/javascript/auth-signinwithidtoken Supabase JavaScript — `signInWithIdToken`.

[6]: https://supabase.com/docs/guides/auth/custom-oauth-providers Supabase — Custom OAuth/OIDC Providers.
