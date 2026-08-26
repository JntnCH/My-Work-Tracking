# รายงานการแก้ไขปัญหา Render Entrypoint และแนวทางการ Redeploy

## บทสรุปผู้บริหาร

ในการพัฒนาและปรับปรุงระบบบันทึกการทำงาน **Work Tracker (google-sheet-organizer)** เพื่อให้รองรับการใช้งานบนมือถือ การบันทึกข้อมูลผ่าน Supabase และการซิงก์ข้อมูลไปยัง Airtable พร้อมทั้งสนับสนุนการแก้ไขโค้ดผ่าน **Spck Editor** และการเผยแพร่บน **Render.com** นั้น ผู้ใช้งานได้พบข้อผิดพลาดขณะเริ่มระบบบน Render ในลักษณะดังนี้:

> `Error: Cannot find module '/opt/render/project/src/.output/server/index.mjs'`

ข้อผิดพลาดดังกล่าวเกิดขึ้นเนื่องจากความไม่สอดคล้องระหว่างตำแหน่งการทำงาน (Working Directory) ของ Render กับเส้นทางที่คำสั่ง `start` ค้นหาไฟล์เซิร์ฟเวอร์ผลิต (Production Entry Point) ที่สร้างโดย Nitro SSR รวมถึงความจำเป็นในการรับประกันว่ากระบวนการสร้างโค้ด (Build) จะต้องตรวจสอบความถูกต้องของไฟล์ผลลัพธ์ทุกครั้งก่อนที่เซิร์ฟเวอร์จะเริ่มทำงาน

ทีมงานได้ดำเนินการวิเคราะห์ แก้ไข และทดสอบระบบในสภาพแวดล้อมจำลองเรียบร้อยแล้ว พร้อมทั้งทำการ Push โค้ดชุดล่าสุดขึ้นสู่ GitHub (repository `JntnCH/google-sheet-organizer`) เป็นที่เรียบร้อย [1]

---

## สาเหตุหลักของปัญหา (Root Cause Analysis)

1. **Working Directory Mismatch:** ค่าเริ่มต้นในการรันคำสั่ง `start` ของ Render อาจมองหาไฟล์ภายใต้ไดเรกทอรีต้นทาง (`/opt/render/project/src/.output/...`) ในขณะที่กระบวนการ Build ของ Nitro สร้างไฟล์ผลลัพธ์ไว้ที่รูทของโปรเจ็กต์ (`.output/server/index.mjs`)
2. **Robustness of Build and Start Scripts:** คำสั่งเริ่มต้นเดิมใช้การอ้างอิงไฟล์โดยตรงผ่าน `node .output/server/index.mjs` ซึ่งหากคำสั่งถูกรันจากไดเรกทอรีอื่น จะทำให้ Node.js ไม่พบโมดูลและแสดงข้อผิดพลาดทันที

---

## แนวทางการแก้ไขที่ได้ดำเนินการ

1. **สร้าง Build Verification Script (`scripts/verify-render-build.mjs`):**
   - ตรวจสอบว่า `.output/server/index.mjs`, `.output/nitro.json` และ `.output/public` ถูกสร้างขึ้นอย่างสมบูรณ์หลังกระบวนการ Build สิ้นสุดลง
   - ช่วยป้องกันไม่ให้ระบบนำโค้ดที่ยัง Build ไม่เสร็จหรือไฟล์เสียหายไปรันบนเซิร์ฟเวอร์จริง

2. **สร้าง Robust Start Script (`scripts/start-render.mjs`):**
   - คำนวณเส้นทางสัมบูรณ์ (Absolute Path) ของโปรเจ็กต์โดยอิงจากตำแหน่งของไฟล์สคริปต์ แทนที่จะขึ้นอยู่กับไดเรกทอรีปัจจุบันที่ใช้รันคำสั่ง
   - กำหนดค่าพอร์ตและโหมดการทำงาน (`PORT`, `NODE_ENV=production`) ให้สอดคล้องกับข้อกำหนดของ Render Web Service อย่างสมบูรณ์

3. **ปรับปรุง `package.json`:**
   - อัปเดตสคริปต์ `build:render` และ `start:render` ให้เรียกใช้งานสคริปต์ตรวจสอบและสคริปต์เริ่มต้นที่ปลอดภัย:
     ```json
     "build:render": "NODE_ENV=production NITRO_PRESET=node-server vite build --mode production && node scripts/verify-render-build.mjs",
     "start:render": "node scripts/start-render.mjs"
     ```

4. **การทดสอบความถูกต้อง (Smoke Test):**
   - ทดจำลองการรัน Production Build และทดสอบ Start Server ด้วยพอร์ต `10000` (`PORT=10000 NODE_ENV=production npm run start:render`)
   - ผลการทดสอบยืนยันว่าเซิร์ฟเวอร์สามารถเริ่มทำงานและตอบสนองด้วยสถานะ HTTP `200 OK` ได้อย่างถูกต้อง [1]

---

## ขั้นตอนสำหรับผู้ใช้ในการ Redeploy บน Render

ท่านสามารถดำเนินการ Redeploy บน Render.com เพื่อให้ระบบนำโค้ดรุ่นล่าสุดไปใช้งานได้ทันทีโดยมีขั้นตอนดังนี้:

1. เข้าสู่ระบบ [Render Dashboard](https://dashboard.render.com/)
2. เลือกเว็บเซอร์วิส **google-sheet-organizer** ของท่าน
3. คลิกที่แท็บ **Manual Deploy** ที่มุมขวาบนของหน้าจอ
4. เลือกตัวเลือก **Clear build cache & deploy** เพื่อให้ระบบดึงโค้ดล่าสุดจาก GitHub (`JntnCH/google-sheet-organizer`) และล้างแคชเก่าออกทั้งหมด
5. ติดตามผลลัพธ์ผ่านหน้าจอ Build Logs หากกระบวนการเสร็จสิ้น ระบบจะแสดงสถานะ **Live** และสามารถเข้าใช้งานเว็บแอปพลิเคชันได้ตามปกติ

---

## ข้อมูลอ้างอิง

[1] GitHub Repository: [JntnCH/google-sheet-organizer](https://github.com/JntnCH/google-sheet-organizer)

## Google Sheets credentials

หากหน้าเว็บเปิดได้แต่ปุ่ม “เชื่อมต่อ”, “สร้างชีตใหม่” หรือ “Connection Test” ใช้งานไม่ได้ ให้เพิ่ม environment variables ต่อไปนี้ใน Render Dashboard > Environment:

- `GOOGLE_SERVICE_ACCOUNT_JSON` — service-account JSON ฝั่ง server (ตัวเลือกที่แนะนำ)
- หรือ `GOOGLE_SERVICE_ACCOUNT_EMAIL` และ `GOOGLE_PRIVATE_KEY` — credential แบบแยกค่า ฝั่ง server

ห้ามใส่ค่าจริงลงใน GitHub, `render.yaml` หรือไฟล์ frontend หลังเพิ่มค่าแล้ว ให้เลือก **Manual Deploy > Clear build cache & deploy** จาก commit ล่าสุด แล้วเปิด Settings > Integrations เพื่อกด Connection Test ระบบจะแสดงผล 8 ขั้นตอนและชื่อ credential ที่ขาดหากตั้งค่าไม่ครบ
