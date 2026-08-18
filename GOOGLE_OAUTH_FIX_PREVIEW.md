# Google OAuth Fix — Preview Report

## สรุปผล

แก้ปัญหา Google Login บน branch `feature/auth-settings-hardening` โดยเปลี่ยน Google Login จาก Lovable OAuth broker มาใช้ Supabase OAuth โดยตรง ให้สอดคล้องกับ GitHub Login และ Account Linking ที่ใช้อยู่ในระบบแล้ว การแก้ไขนี้ไม่เปลี่ยน logic การคำนวณค่าแรง, API, database, responsive layout หรือเส้นทาง authentication อื่นที่ไม่เกี่ยวข้อง

> สถานะสำคัญ: **แก้ไขและทดสอบบน preview แล้ว แต่ยังไม่ได้ commit และยังไม่ได้ Push** ตามข้อกำหนดของโปรเจ็กต์

## ตัวอย่างโค้ดที่แก้

ตำแหน่ง: `src/routes/auth.tsx` ฟังก์ชัน `signInGoogle()`

```tsx
async function signInGoogle() {
  setBusy(true);
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/` },
    });
    if (error) throw error;
  } catch (err) {
    toast.error("เข้าสู่ระบบ Google ไม่สำเร็จ", {
      description: err instanceof Error ? err.message : String(err),
    });
  } finally {
    setBusy(false);
  }
}
```

จุดสำคัญคือ Google และ GitHub เรียก `supabase.auth.signInWithOAuth()` โดยตรงเหมือนกัน และใช้ `window.location.origin` เป็นฐานของ redirect ทำให้ไม่ผูกกับ Lovable preview broker ที่ไม่รู้จัก sandbox origin

## ผลการตรวจสอบ

| รายการ | ผลลัพธ์ |
|---|---|
| Branch | `feature/auth-settings-hardening` |
| Targeted ESLint เฉพาะไฟล์ที่แก้ | ผ่าน, exit 0 |
| `git diff --check` | ผ่าน ไม่มี whitespace error |
| Production build | ผ่านหลังเพิ่มเวลา build; Nitro output สร้างสำเร็จ |
| Preview ที่ไม่มี env | พบ redirect ไป `placeholder.supabase.co` ซึ่งยืนยันว่า fallback ถูกใช้เมื่อ env ขาด |
| Preview ที่มี Supabase env จริง | ผ่าน: redirect ไป Google Sign-In สำเร็จ |
| Google provider | ระบบพาไปหน้า Google และแสดง `Sign in with Google to continue to idxioootfnninrejvspi.supabase.co` |
| การกรอกข้อมูลผู้ใช้ | ไม่ได้กรอกหรือยืนยันบัญชี |
| Push ไป GitHub | ยังไม่ทำ |

URL callback ที่พบระหว่างการทดสอบคือ `https://idxioootfnninrejvspi.supabase.co/auth/v1/callback` และ redirect target กลับมายัง preview origin ซึ่งเป็นผลลัพธ์ที่ต้องการของ Supabase OAuth flow

## สาเหตุที่พบ

สาเหตุมีสองส่วนที่ต้องแยกกัน ประการแรก Google Login เดิมใช้ `@lovable.dev/cloud-auth-js` ขณะที่ Account Linking และ GitHub ใช้ Supabase Auth โดยตรง ทำให้มี architecture mismatch เมื่อใช้งานบน sandbox preview ประการที่สอง preview ที่ไม่มี `.env.local` ไม่มี `VITE_SUPABASE_URL` และ `VITE_SUPABASE_PUBLISHABLE_KEY` จึงใช้ค่า fallback `placeholder.supabase.co` และไม่สามารถเริ่ม OAuth ได้

เมื่อใส่ Supabase URL และ publishable key ที่ถูกต้องในไฟล์ `.env.local` ซึ่งถูก ignore โดย Git แล้ว restart preview การ redirect ไป Google ทำงานสำเร็จ จึงยืนยันว่า code path ใหม่ทำงานได้

## สิ่งที่ต้องตั้งค่าภายนอกก่อน Deploy

ต้องกำหนด environment variables ต่อไปนี้ในระบบ deploy เช่น Render หรือ hosting ที่ใช้งานจริง โดยใช้ค่าจาก Supabase project `Work-Tracking`:

```text
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<publishable-key-or-legacy-anon-key>
```

ใน Supabase Authentication ต้องเปิด Google provider และตรวจสอบให้มี redirect URLs สำหรับทั้ง production origin และ preview origin ที่จะใช้จริง เช่น production URL ของเว็บไซต์ และ URL รูปแบบ sandbox preview หากต้องการทดสอบจาก preview โดยตรง การตั้งค่า redirect URL ต้องตรงกับ origin ที่ส่งจาก `window.location.origin`

ไม่ควรนำ `SUPABASE_KEY` ที่เป็น secret key ไปใส่ในตัวแปร `VITE_*` หรือ commit ลง repository เพราะตัวแปร `VITE_*` จะถูกส่งไปฝั่ง browser; ให้ใช้เฉพาะ publishable key หรือ legacy anon key สำหรับ client

## ไฟล์ที่เกี่ยวข้อง

ไฟล์ที่แก้บน branch นี้คือ `src/routes/auth.tsx`, `src/components/work/SettingsPanel.tsx` และ `src/routes/_authenticated/index.tsx` รวมทั้งไฟล์ใหม่ `src/components/work/AuthenticationSettings.tsx` จากงาน Authentication & Settings ก่อนหน้า ไฟล์วิเคราะห์หลักฐานคือ `GOOGLE_OAUTH_DIAGNOSIS.md`

ไฟล์ `.env.local` ที่สร้างเพื่อการทดสอบเป็นไฟล์ ignored และไม่ได้อยู่ในสถานะ Git ที่จะ Push

## ขั้นตอนถัดไป

ตัวอย่างการแก้ไขพร้อมผลทดสอบพร้อมให้ตรวจสอบแล้ว หากผู้ใช้ยืนยันด้วยคำสั่ง **Push** จึงค่อย commit และ push ไปยัง `feature/auth-settings-hardening` เท่านั้น โดยจะไม่ Push เข้า `main`

## References

[1]: https://supabase.com/docs/guides/auth/social-login/auth-google — Supabase Google OAuth documentation
[2]: https://supabase.com/docs/reference/javascript/auth-signinwithoauth — Supabase JavaScript `signInWithOAuth` reference
