# Supabase Phone OTP Research

วันที่ตรวจสอบ: 2026-08-16

## ข้อค้นพบจากเอกสารทางการ

Supabase Phone Login ใช้ OTP แบบ SMS โดยเรียก `supabase.auth.signInWithOtp({ phone })` เพื่อส่งรหัส และให้ผู้ใช้กรอกรหัส 6 หลักก่อนเรียก `supabase.auth.verifyOtp({ phone, token, type: "sms" })` เพื่อยืนยันและสร้าง session.

รูปแบบหมายเลขโทรศัพท์ควรส่งเป็น international format เช่น `+66812345678` สำหรับประเทศไทย โดยต้องคงเครื่องหมาย `+` ในขั้นตอนส่ง OTP และใช้หมายเลขเดียวกันในขั้นตอน verify.

Phone Login ต้องเปิด Phone provider ใน Supabase Auth และต้องกำหนด SMS provider/บริการส่งข้อความตามการตั้งค่าของ Supabase ก่อนใช้งานจริง. การส่ง SMS มี rate limit และอาจมีค่าใช้จ่ายหรือข้อกำหนดเฉพาะประเทศ จึงไม่ควรทดสอบซ้ำจำนวนมาก.

`verifyOtp` ใช้ `type: "sms"` สำหรับ OTP ที่ส่งไปยังเบอร์โทรศัพท์; `phone_change` เป็นอีกกรณีหนึ่งสำหรับการยืนยันการเปลี่ยนเบอร์ ไม่ใช่ flow login.

## URLs อ้างอิง

- https://supabase.com/docs/guides/auth/phone-login
- https://supabase.com/docs/reference/javascript/auth-verifyotp
- https://supabase.com/docs/reference/javascript/auth-signinwithotp
- https://supabase.com/docs/guides/auth/rate-limits

## Preview UI Verification

บน preview `https://8082-ieqvbwr2ffctyfhmznwuz-bbc10a1e.sg1.manus.computer/auth` หน้า Auth โหลดสำเร็จหลัง build และแสดงแท็บ `โทรศัพท์`. เมื่อเลือกแท็บ ระบบแสดงช่อง `เบอร์โทรศัพท์` แบบ `type="tel"`, `inputMode="tel"`, placeholder รองรับทั้ง `081-234-5678` และ `+66812345678`, พร้อมปุ่ม `ส่งรหัส OTP` และข้อความอธิบายการแปลงเบอร์ไทยเป็นรูปแบบสากล. การทดสอบนี้ยังไม่ได้ส่ง SMS จริง.
