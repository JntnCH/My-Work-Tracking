# คู่มือการแก้ไขโปรเจ็กต์ Work Tracker บนมือถือด้วย Spck Editor และ GitHub

เอกสารฉบับนี้จัดทำขึ้นเพื่อให้ผู้ใช้งานสามารถโคลน แก้ไข และซิงก์โค้ดของโปรเจ็กต์ `google-sheet-organizer` ผ่าน **Spck Editor** บนมือถือร่วมกับ **GitHub** ได้อย่างสะดวก ปลอดภัย และไม่เปิดเผยรหัสลับ (Secrets) ออกสู่สาธารณะ

---

## 1. ข้อกำหนดและสถาปัตยกรรมสำหรับ Spck Editor

แอปพลิเคชัน Work Tracker ในโครงสร้าง `google-sheet-organizer` พัฒนาด้วย React, Vite, TanStack Router, Supabase และ Airtable โดยมีข้อจำกัดและการจัดการที่เหมาะสมสำหรับการแก้ไขบนมือถือดังนี้:

| ส่วนประกอบ | แนวทางบน Spck Editor |
|---|---|
| การแก้ไขโค้ด | ใช้ Spck Editor เปิดโฟลเดอร์โปรเจ็กต์หรือโคลนจาก GitHub Repository |
| การรับส่งโค้ด | ใช้ Git Clone, Commit และ Push ผ่าน GitHub Connector ใน Spck Editor |
| การจัดการ Secret | ห้ามใส่ Supabase URL, Supabase Key หรือ Airtable API Key ลงในโค้ดหรือไฟล์ `.env` ที่ commit ขึ้น GitHub ให้ใช้หน้าตั้งค่าในแอปหรือ Environment Variables ของระบบ Hosting |
| การรันและทดสอบ | Spck Editor สามารถแก้ไขไฟล์ จัดรูปแบบ และทดสอบตัวแปรได้บางส่วน แต่การรัน Production Build และ SSR ควรทำผ่าน Hosting เช่น Netlify หรือผ่านเครื่องเซิร์ฟเวอร์ |

---

## 2. ขั้นตอนการใช้งาน Spck Editor ร่วมกับ GitHub

### ขั้นที่ 1: การเปิดโปรเจ็กต์ใน Spck Editor
1. เปิดแอป **Spck Editor** บนมือถือ
2. เลือกเมนู **Clone Repository** หรือเชื่อมต่อบัญชี GitHub ของคุณ
3. คัดลอกลิงก์ Repository ของ `google-sheet-organizer` แล้ววางลงใน Spck Editor
4. กำหนดโฟลเดอร์ปลายทางในเครื่อง แล้วกด **Clone** เพื่อดาวน์โหลดโค้ดทั้งหมดลงมือถือ

### ขั้นที่ 2: การแก้ไขไฟล์หลักของ Work Tracker
เมื่อต้องการปรับแต่งหน้าจอหรือตรรกะคำนวณ ให้เน้นแก้ไขไฟล์ที่อยู่ในโฟลเดอร์ `src/` ดังนี้:
- **หน้าตั้งค่าทั่วไป:** แก้ไขที่ `src/components/work/SettingsPanel.tsx`
- **ตรรกะการทำงานและคำนวณเงิน:** แก้ไขที่ `src/lib/work-log.ts`
- **การเชื่อมต่อฐานข้อมูลหลัก:** แก้ไขที่ `src/lib/supabase-db.ts` และ `src/hooks/use-work-tracker.ts`
- **หน้าจอแดชบอร์ดและกราฟ:** แก้ไขที่ `src/components/work/DashboardPanel.tsx`

### ขั้นที่ 3: การบันทึกและส่งโค้ดกลับ GitHub (Git Push)
1. หลังจากแก้ไขไฟล์เสร็จเรียบร้อย ให้ไปที่เมนู **Git** ใน Spck Editor
2. ตรวจสอบรายการไฟล์ที่เปลี่ยนแปลง (Modified files)
3. พิมพ์ข้อความอธิบายการเปลี่ยนแปลง (Commit message) เช่น `update settings and fix dark mode charts`
4. กด **Commit** และ **Push** เพื่อส่งโค้ดขึ้น GitHub Repository ของคุณอย่างปลอดภัย

---

## 3. ความปลอดภัยของข้อมูลและการตั้งค่า (Secrets Management)

เพื่อป้องกันข้อมูลรั่วไหลและการถูกโจมตีทางไซเบอร์ โปรดปฏิบัติตามกฎความปลอดภัยอย่างเคร่งครัด:

1. **ห้ามฮาร์ดโคดรหัสลับ:** ห้ามใส่ค่า `SUPABASE_URL`, `SUPABASE_KEY`, `AIRTABLE_API_KEY` หรือรหัสผ่านใด ๆ ลงในไฟล์ซอร์สโค้ด (`.ts`, `.tsx`, `.js`)
2. **ใช้ Environment Variables:** หากต้องการทดสอบในสภาพแวดล้อมจริง ให้ตั้งค่าตัวแปรแวดล้อมผ่านระบบจัดการของ Hosting (เช่น Netlify Dashboard) หรือกรอกค่าผ่านหน้าการตั้งค่า (Settings) ในเบราว์เซอร์ของผู้ใช้เอง
3. **ตรวจสอบไฟล์ `.gitignore`:** ตรวจสอบให้แน่ใจว่าไฟล์ `.env`, `node_modules/`, และโฟลเดอร์ build ถูกเพิ่มไว้ใน `.gitignore` เพื่อไม่ให้ถูกส่งขึ้น GitHub

---

## 4. สรุปแนวทางการพัฒนาต่อ

โครงสร้างเดิมของ `google-sheet-organizer` ถูกรักษาไว้ครบถ้วนเพื่อให้ผู้ใช้สามารถแก้ไขข้อความ ปรับปรุงดีไซน์ หรือเพิ่มฟังก์ชันผ่าน Spck Editor ได้ทันทีโดยไม่ต้องเปลี่ยนไปใช้เทมเพลตอื่น หากพบปัญหาในการ build หรือต้องการเผยแพร่ระบบ สามารถใช้คำสั่งมาตรฐานของ repository ได้ตามปกติ
