# LINE Login + Settings/Theme Preview — Pre-Commit Review

## สถานะการทำงาน

การแก้ไขทั้งหมดอยู่บน branch `feature/line-login-settings-audit` และ **ยังไม่ได้ Commit หรือ Push** ตามข้อกำหนดของโปรเจ็กต์ เอกสารนี้เป็นตัวอย่างก่อนส่งขึ้น GitHub พร้อมหลักฐานจาก production build ในเครื่อง, unit tests, static interaction audit และ browser smoke test ใน Guest Mode

## ผลลัพธ์ที่พัฒนา

| ประเด็น | ผลลัพธ์ |
|---|---|
| LINE Login | เพิ่มปุ่ม `เข้าสู่ระบบด้วย LINE` บนหน้า Login และเพิ่ม identity linking ใน Authentication Settings |
| LIFF | หากมี `VITE_LINE_LIFF_ID` ระบบ initialize LIFF, เรียก `liff.login()` และส่ง raw ID token ผ่าน Supabase `signInWithIdToken({ provider: "custom:line" })` |
| Custom OIDC fallback | หากไม่มี LIFF ID ระบบใช้ Supabase Custom OIDC browser flow ด้วย provider `custom:line` |
| Dark/Light toggle | ปุ่ม header ใช้ runtime theme preview แทนการเรียก `requestTabChange("settings")`; กดแล้วไม่เปลี่ยน URL หรือ tab |
| Live preview | เปลี่ยน palette, mode, color token, radius หรือ density แล้ว app shell และ preview card เปลี่ยนทันทีโดยยังไม่เขียนถาวร |
| Settings isolation | ปุ่ม `Save หมวดนี้` บันทึกเฉพาะ category ปัจจุบัน; Theme, General, Layout และ Integrations ไม่ใช้ global coordinator ร่วมกันอีก |
| Cancel | `ยกเลิกการแสดงตัวอย่าง` คืนค่า runtime และ draft กลับไปยัง saved baseline ล่าสุด |
| Interaction audit | ตรวจ buttons, form boundaries, submit controls, navigation calls, tabs และ external links; ไม่พบจุดที่เกิด accidental navigation แบบเดียวกับ theme toggle เพิ่มเติม |

## ไฟล์สำคัญที่เปลี่ยน

| ไฟล์ | หน้าที่ |
|---|---|
| `src/lib/line-auth.ts` | LIFF initialization, ID-token sign-in และ Custom OIDC fallback |
| `src/routes/auth.tsx` | ปุ่ม LINE, LIFF callback completion และข้อความช่วยตั้งค่า |
| `src/components/work/AuthenticationSettings.tsx` | เพิ่ม LINE ใน provider linking โดยรองรับทั้ง `custom:line` และ provider identity เดิมที่ชื่อ `line` |
| `src/hooks/use-work-tracker.ts` | แยก `savedThemeSettings` จาก runtime theme และเพิ่ม `previewThemeSettings()` |
| `src/routes/_authenticated/index.tsx` | ต่อ header toggle และ Settings ให้ใช้ runtime preview callback |
| `src/components/work/SettingsPanel.tsx` | แยก Save/Cancel และ category-scoped coordinator; ย้าย Spreadsheet ID ไปอยู่ Integrations เป็นเจ้าของเดียว |
| `.env.example` | เพิ่ม placeholder เฉพาะ `VITE_LINE_LIFF_ID` โดยไม่เพิ่ม secret |
| `package.json`, `package-lock.json` | เพิ่ม `@line/liff@2.30.0` |
| `LINE_LOGIN_SETUP.md` | คู่มือ Supabase Custom OIDC, LINE Developers, LIFF, Redirect URL และ Render environment |
| `interaction-audit.md` | baseline และ post-change interaction audit |
| `browser-smoke-findings.md` | หลักฐาน browser smoke test และ visual verification |

## หลักฐานการตรวจสอบ

### Automated validation

`npm test` ผ่านทั้งหมด **18 tests จาก 5 test files** และ `npm run build:render` ผ่านพร้อมตรวจ production artifacts สำเร็จ นอกจากนี้ targeted ESLint ของไฟล์ที่แก้ไขผ่าน และ `git diff --check` ไม่พบ whitespace error

Full-repository ESLint ยังคืนค่าไม่ผ่านเพราะมี Prettier errors/warnings เดิมใน `src/hooks/use-session.ts`, `src/lib/supabase-db.ts`, `src/lib/theme.ts` และ UI primitives หลายไฟล์ ซึ่งไม่ได้เกิดจาก patch นี้ โดยไฟล์ที่แก้ไขในงานนี้ผ่าน targeted ESLint แล้ว ส่วน TypeScript ทั้ง repository ยังมี baseline errors เดิมใน `DashboardCustomizationCanvas`, `FaceLock`, `use-work-tracker`, `airtable.functions`, `supabase-db` และ `work-log`; ไม่มี error ใหม่ในไฟล์ LINE/auth/Settings/theme ที่แก้ไข

### Browser smoke test

ใน latest local production build หน้า Login แสดง Google, GitHub, LINE และ Guest ครบถ้วน Guest Mode เปิด app shell ได้โดยไม่ต้อง OAuth และแสดงวันที่/เวลาตาม Asia/Bangkok

การกด header dark/light toggle เปลี่ยน theme จาก Light เป็น Dark โดย URL ยังคงเป็น `/` และ tab ยังคงเป็น `Check-in / Out` การเปิด Settings และกด Theme tab แสดง preset, mode, color picker, live preview และปุ่ม Save/Cancel ครบถ้วน เมื่อเลือก Google Red ระบบเปลี่ยน app shell เป็น red/dark palette ทันทีโดยไม่กด Save และเมื่อกด Cancel ระบบคืนค่า Google Blue/light baseline พร้อมสถานะ `Locked / Saved`

Dashboard และ History สลับ tab ได้ตามปกติและแสดง empty states ที่ถูกต้อง ส่วน General category แสดง rate-only Save และย้าย Spreadsheet ID ไปหมวด `Supabase & Airtable` เพื่อไม่ให้ข้อมูลคนละ domain ถูกบันทึกพร้อมกัน

## สิ่งที่ผู้ใช้ต้องตั้งค่าก่อน LINE Login ใช้งานจริง

ต้องเพิ่ม `VITE_LINE_LIFF_ID` ใน Render จาก LIFF ID จริงของ LINE Channel ที่มีอยู่แล้ว และต้องเปิด Supabase Custom OIDC provider ชื่อ `line` โดยใส่ Channel ID/Channel Secret ใน Supabase Dashboard เท่านั้น ไม่ใส่ Channel Secret ใน frontend หรือ repository

ค่า public OIDC discovery ที่ตรวจสอบจาก LINE คือ issuer `https://access.line.me`, authorization endpoint `https://access.line.me/oauth2/v2.1/authorize`, token endpoint `https://api.line.me/oauth2/v2.1/token`, JWKS `https://api.line.me/oauth2/v2.1/certs` และ userinfo `https://api.line.me/oauth2/v2.1/userinfo` [1]

สำหรับเว็บไซต์ Render ให้เพิ่ม `https://google-sheet-organizer.onrender.com/auth/callback` และ `https://google-sheet-organizer.onrender.com/auth` ใน Supabase Redirect URLs และตรวจว่า LIFF Endpoint URL/Channel ใช้ช่องทางเดียวกับ LIFF ID ที่ใส่ใน Render รายละเอียดทั้งหมดอยู่ใน `LINE_LOGIN_SETUP.md`

## ข้อจำกัดที่ยังต้องทำบน Dashboard

ยังไม่มี LIFF ID จริงใน sandbox environment จึงยังไม่สามารถทดสอบ authorization จริงกับบัญชี LINE ของผู้ใช้ได้ การตรวจ end-to-end ต้องทำหลังใส่ `VITE_LINE_LIFF_ID`, เปิด provider และตั้ง Channel Secret ใน Supabase แล้ว จากนั้นเปิดเว็บไซต์บนโทรศัพท์และทดสอบอนุญาต, ยกเลิก, token ไม่มี, scope ไม่ครบ และ session restoration

## ไฟล์ภาพตัวอย่าง

ภาพตัวอย่าง Login ที่มีปุ่ม LINE และภาพ Google Red live preview ถูกแนบมาพร้อมรายงานนี้เพื่อใช้ตรวจ visual ก่อน Commit/Push

## References

[1]: https://access.line.me/.well-known/openid-configuration LINE public OpenID Connect discovery metadata.

[2]: https://developers.line.biz/en/docs/line-login/integrate-line-login/ LINE Login integration guide.

[3]: https://developers.line.biz/en/reference/liff/ LIFF API reference.

[4]: https://supabase.com/docs/reference/javascript/auth-signinwithidtoken Supabase `signInWithIdToken` reference.

[5]: https://supabase.com/docs/guides/auth/custom-oauth-providers Supabase Custom OAuth/OIDC Providers.
