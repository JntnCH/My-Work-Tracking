# Phone OTP Implementation Preview

## สรุป

เพิ่มการเข้าสู่ระบบด้วยเบอร์โทรศัพท์ผ่าน Supabase Phone OTP ในหน้า `/auth` โดยคง Google, GitHub, Email/Password, Forgot Password และ Guest Mode เดิมไว้ทั้งหมด. การเปลี่ยนแปลงยังไม่ได้ commit หรือ Push.

## Flow ที่เพิ่ม

1. ผู้ใช้เลือกแท็บ `โทรศัพท์`.
2. กรอกเบอร์ไทย เช่น `0812345678` หรือรูปแบบสากล เช่น `+66812345678`.
3. ระบบแปลงเบอร์ไทยเป็น E.164 (`+66812345678`) แล้วเรียก:

```ts
await supabase.auth.signInWithOtp({
  phone: normalizedPhone,
});
```

4. ผู้ใช้กรอกรหัส OTP 6 หลักจาก SMS.
5. ระบบเรียก:

```ts
await supabase.auth.verifyOtp({
  phone: normalizedPhone,
  token: phoneOtp,
  type: "sms",
});
```

6. เมื่อยืนยันสำเร็จ ระบบใช้ session เดิมผ่าน `useSession()` และนำทางกลับ `/`.

## UX ที่เพิ่ม

หน้า Auth มี input แบบ `tel`, `inputMode="tel"`, `autocomplete="tel"` สำหรับมือถือ และ input OTP แบบ `one-time-code` เพื่อรองรับการกรอกรหัสจาก SMS ได้สะดวก. มีปุ่ม `ส่ง OTP อีกครั้ง`, `เปลี่ยนเบอร์โทร` และตรวจสอบ OTP ให้เป็นตัวเลข 6 หลักก่อนส่ง.

แท็บวิธีเข้าสู่ระบบแสดงเป็น 2 คอลัมน์บนหน้าจอขนาดเล็ก และ 4 คอลัมน์บนหน้าจอขนาดใหญ่ เพื่อไม่ให้ข้อความแน่นเกินไปบนมือถือ.

## ไฟล์ที่แก้

- `src/routes/auth.tsx` — เพิ่ม Phone OTP state, normalization, send/verify handlers และ UI.
- `PHONE_OTP_RESEARCH.md` — บันทึกเอกสารอ้างอิงและข้อกำหนด Supabase Phone Login.

## ผลตรวจสอบ

| รายการ | ผล |
|---|---|
| ESLint เฉพาะ `src/routes/auth.tsx` | ผ่าน |
| Production build | ผ่าน หลังหยุด Vite process ที่ค้าง |
| หน้า `/auth` บน preview | โหลดสำเร็จ |
| แท็บโทรศัพท์และ input เบอร์ | แสดงผลสำเร็จ |
| การส่ง SMS จริง | ยังไม่ได้ส่ง เพื่อหลีกเลี่ยงการใช้ OTP quota และค่า SMS โดยไม่จำเป็น |
| Commit/Push | ยังไม่ได้ดำเนินการ |

## การตั้งค่าที่ต้องทำใน Supabase

ต้องเปิด Phone provider ใน Supabase Authentication และกำหนด SMS provider ที่รองรับก่อนใช้จริง. ควรตรวจสอบ rate limit, OTP expiration และข้อกำหนดของประเทศ/ผู้ให้บริการ SMS ด้วย. Render ไม่ต้องเพิ่ม environment variable ใหม่สำหรับ flow นี้ เพราะใช้ Supabase URL และ publishable key เดิม:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

## References

[1]: https://supabase.com/docs/guides/auth/phone-login "Supabase Phone Login"
[2]: https://supabase.com/docs/reference/javascript/auth-signinwithotp "Supabase JavaScript signInWithOtp"
[3]: https://supabase.com/docs/reference/javascript/auth-verifyotp "Supabase JavaScript verifyOtp"
[4]: https://supabase.com/docs/guides/auth/rate-limits "Supabase Auth Rate Limits"
