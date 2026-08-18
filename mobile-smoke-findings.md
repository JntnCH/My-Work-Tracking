# Production mobile smoke findings

วันที่ตรวจสอบ: 2026-08-18 (เวลาในระบบทดสอบแสดง 04:47 น.)

- `GET /` ตอบกลับ HTTP 200 จาก production server ที่เปิดด้วย `npm run start:render`
- HTML response เป็นหน้าแอป Work Tracker จริง มี title ภาษาไทย, assets, และหน้า auth/Guest Mode โดยไม่พบข้อความ SSR exception
- เปิด Guest Mode สำเร็จและเปลี่ยนไปที่หน้า Work Tracker หลัก
- หน้า mobile-oriented แสดงเมนู Check-in / Out, Dashboard, ประวัติการทำงาน, ตั้งค่าระบบ และจัดการประเภทงาน
- ฟอร์มมีประเภทงาน, สถานที่/ลิงก์ Google Maps, ค้นหาตำแหน่งปัจจุบัน, ค่าแรงปกติ, dropdown OT, หักพัก 1 ชั่วโมง, ค่าเดินทาง, ค่าอาหาร/เบี้ยเลี้ยง, รายรับอื่น, รายการหัก และแนบหลักฐาน
- dropdown OT มี 4 ตัวเลือก: ไม่มี OT, OT 1.5 เท่า, OT 2.0 เท่า และ OT 3.0 เท่า
- ปุ่ม Check-in และ Check-out แสดงผลใน viewport มือถือและสามารถเข้าถึงได้
- ยังไม่ได้ทำรายการ Check-in/Check-out จริง เพราะอาจเขียนข้อมูล/ขอสิทธิ์ตำแหน่งหรือสร้างผลกระทบต่อข้อมูลผู้ใช้
