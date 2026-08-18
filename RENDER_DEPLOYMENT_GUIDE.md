# Render Deployment Guide — google-sheet-organizer

เอกสารนี้ใช้สำหรับเผยแพร่ระบบบันทึกการทำงาน `google-sheet-organizer` บน [Render](https://render.com/) โดยคงโครงสร้าง TanStack Start + Nitro SSR เดิมของโปรเจ็กต์ไว้

> **ข้อควรระวัง:** ห้ามใส่ค่า Supabase key หรือ Airtable key ลงใน GitHub, Spck Editor, `render.yaml` หรือไฟล์ที่ขึ้นต้นด้วย `VITE_` หากเป็นข้อมูลลับ ค่าทั้งหมดต้องเพิ่มใน Render Dashboard > Environment หรือ Secret Files เท่านั้น

## รูปแบบบริการที่ต้องเลือก

ให้สร้างบริการแบบ **Web Service** ไม่ใช่ Static Site เพราะแอปใช้ TanStack Start + Nitro SSR และต้องมี Node.js server ทำงานตลอดเวลาที่ instance ทำงาน

| รายการ            | ค่า                                            |
| ----------------- | ---------------------------------------------- |
| Repository        | GitHub repository ของ `google-sheet-organizer` |
| Runtime           | Node                                           |
| Build Command     | `npm ci && npm run build:render`               |
| Start Command     | `npm run start:render`                         |
| Health Check Path | `/`                                            |
| Node Version      | `22.13.0` ตาม `render.yaml`                    |
| Plan              | Free ใช้ทดสอบได้ แต่อาจมี cold start           |

ไฟล์ `render.yaml` ใน root ของ repository มีค่าพื้นฐานสำหรับ Render Blueprint อยู่แล้ว แต่ยังต้องกรอก secret ใน Render ก่อน deploy

## Environment Variables

ต้องเพิ่มค่าต่อไปนี้ใน Render Dashboard โดยใช้ค่าจริงของโปรเจ็กต์คุณ ห้าม commit ค่าเหล่านี้ลง GitHub

| ตัวแปร                          |                    จำเป็น | ใช้ที่ใด               | หมายเหตุ                                                                      |
| ------------------------------- | ------------------------: | ---------------------- | ----------------------------------------------------------------------------- |
| `VITE_SUPABASE_URL`             |                       ใช่ | ตอน build ฝั่ง browser | URL ของ Supabase project                                                      |
| `VITE_SUPABASE_PUBLISHABLE_KEY` |                       ใช่ | ตอน build ฝั่ง browser | Publishable/anon key เท่านั้น ห้ามใช้ secret key                              |
| `SUPABASE_URL`                  |                     แนะนำ | SSR/runtime            | ใช้เป็น fallback ฝั่ง server                                                  |
| `SUPABASE_PUBLISHABLE_KEY`      |                     แนะนำ | SSR/runtime            | ใช้เป็น fallback ฝั่ง server                                                  |
| `GOOGLE_SERVICE_ACCOUNT_JSON`   |                     แนะนำ | server function        | JSON ของ Service Account; ใช้แทน email/private key pair และห้ามใส่ใน frontend |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL`  | หรือใช้คู่กับ private key | server function        | อีเมล Service Account เช่น `work-tracker@project.iam.gserviceaccount.com`     |
| `GOOGLE_PRIVATE_KEY`            |       หรือใช้คู่กับ email | server function        | private key ของ Service Account; เก็บเป็น secret และห้ามใส่ใน frontend        |
| `AIRTABLE_API_KEY`              |         เมื่อใช้ Airtable | server function        | ห้ามใช้ `VITE_` นำหน้า เพราะต้องไม่ส่งไป browser                              |

| `AIRTABLE_BASE_ID` | เมื่อใช้ Airtable | server function | Base ID ของ Airtable |
| `AIRTABLE_TABLE_NAME` | เมื่อใช้ Airtable | server function | ถ้าไม่กำหนด ระบบใช้ `WorkLogs` |

> **Google Sheets สำคัญ:** ให้ตั้งค่า `GOOGLE_SERVICE_ACCOUNT_JSON` เพียงตัวเดียว หรือใช้คู่ `GOOGLE_SERVICE_ACCOUNT_EMAIL` + `GOOGLE_PRIVATE_KEY` จากนั้นเปิดใช้ Google Sheets API ใน Google Cloud และแชร์ spreadsheet ให้กับอีเมล Service Account ด้วยสิทธิ์ **Editor** หากขาด credential หรือสิทธิ์ ปุ่ม “เชื่อมต่อ”, “สร้างชีตใหม่” และ “Connection Test” จะแจ้งสาเหตุจาก Google API โดยตรง

หากยังไม่ตั้งค่า Airtable ระบบหลักยังสามารถเปิดใช้งานได้ แต่การซิงก์ Airtable จะตอบสถานะว่ายังไม่ได้ตั้งค่าแทนการทำให้แอปล่ม

## ขั้นตอนเผยแพร่จาก GitHub

1. ตรวจสอบว่าไฟล์ล่าสุดถูก push ไปยัง branch ที่ต้องการเผยแพร่แล้ว
2. เข้า Render และเลือก **New > Web Service**
3. เชื่อมต่อ GitHub แล้วเลือก repository `google-sheet-organizer`
4. เลือก branch ที่ต้องการ เช่น `main`
5. ตั้งค่า Build Command เป็น `npm ci && npm run build:render`
6. ตั้งค่า Start Command เป็น `npm run start:render`
7. เปิดใช้ Google Sheets API ใน Google Cloud Console และแชร์ spreadsheet ให้ Service Account email ด้วยสิทธิ์ Editor
8. เพิ่ม Environment Variables ตามตารางด้านบน
9. กด **Create Web Service** หรือ **Manual Deploy > Deploy latest commit**
10. หลัง deploy สำเร็จ ให้เปิด URL ของ Render และตรวจสอบหน้าแรก, โหมด Guest, การเข้าสู่ระบบ, การบันทึกประเภทงาน และการซิงก์ Airtable

## ตรวจสอบหลัง deploy

ควรตรวจสอบตามลำดับต่อไปนี้:

- เปิด `/` แล้วต้องไม่พบหน้า HTTP 500
- เข้า Settings > Integrations แล้วกด “ทดสอบการเชื่อมต่อ (Connection Test)” ต้องเห็นผล 8 ขั้นตอน
- หากผลทดสอบไม่ผ่าน ให้ตรวจชื่อ Service Account email, private key/JSON, การเปิด Google Sheets API, การแชร์ spreadsheet และ Spreadsheet ID
- เปิดโหมด Guest และตรวจสอบว่าประเภทงานยังอยู่หลัง refresh
- หากใช้ Supabase ให้ตรวจสอบการเข้าสู่ระบบและการโหลดประเภทงานจากบัญชีเดิม
- ทดลองเลือก `ไม่มี OT` แล้วตรวจสอบว่าค่า OT เป็นศูนย์
- ตรวจสอบ Dark Mode ว่าแท่งกราฟและข้อความยังมองเห็นได้
- ทดลองบันทึก work log หนึ่งรายการ แล้วตรวจสอบ Supabase/Airtable ตามที่ตั้งค่าไว้
- ตรวจสอบ Render Logs หากเกิดปัญหา โดยเฉพาะตัวแปร environment ที่สะกดไม่ตรง

## คำสั่งตรวจสอบในเครื่องก่อน Deploy

```bash
npm ci
npm test
npm run build:render
NODE_ENV=production PORT=10001 npm run start:render
```

จากนั้นเปิด `http://localhost:10001/` ในเบราว์เซอร์ หากพอร์ตถูกใช้งานอยู่ ให้เปลี่ยนเลขพอร์ตได้โดยไม่ต้องแก้โค้ด

## การแก้ไขด้วย Spck Editor

ให้แก้เฉพาะไฟล์ source และเอกสาร เช่น `src/`, `package.json`, `render.yaml`, `RENDER_DEPLOYMENT_GUIDE.md` และ `SPCK_EDITOR_GUIDE.md` ไม่ต้องแก้ `.output/`, `node_modules/` หรือไฟล์ cache

หลังแก้ไขให้ commit และ push ผ่าน GitHub จากนั้น Render จะ deploy ตาม branch ที่เชื่อมไว้ หรือสั่ง Manual Deploy จาก Render Dashboard ได้

```bash
git status
git add src package.json render.yaml RENDER_DEPLOYMENT_GUIDE.md
git commit -m "Prepare Work Tracker for Render"
git push origin main
```

หาก branch หลักของคุณไม่ใช่ `main` ให้ใช้ชื่อ branch จริงของ repository แทน

## หมายเหตุด้าน Hosting

Render เป็นบริการ hosting ภายนอกที่ผู้ใช้เลือกใช้ได้ แต่คอนฟิกอาจแตกต่างจาก hosting ในตัวของ Manus หากภายหลังย้ายกลับไปใช้ Manus หรือผู้ให้บริการอื่น ต้องตรวจสอบคำสั่ง start, environment variables, health check และการรองรับ SSR ใหม่ทุกครั้ง
