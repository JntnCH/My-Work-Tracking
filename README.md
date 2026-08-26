# MyWorkTracking

MyWorkTracking คือระบบบันทึกเวลาเข้า–ออกงานและการทำงานรายวัน รองรับการตรวจพิกัด GPS การคำนวณค่าแรง/OT/เบี้ยเลี้ยง การจัดการหมวดหมู่งาน และการซิงก์ข้อมูลไปยัง Google Sheets ของผู้ใช้

## Development

โปรเจ็คใช้ **TanStack Start, React, Vite, Nitro, Tailwind CSS และ Supabase** ต้องมี Node.js และ npm ติดตั้งในเครื่องก่อนเริ่มใช้งาน

```sh
git clone https://github.com/JntnCH/My-Work-Tracking.git
cd My-Work-Tracking
npm install
cp .env.example .env.local
npm run dev
```

หลังจากเริ่ม development server แล้ว ให้เปิด URL ที่ Vite แสดงใน terminal โดยค่าเริ่มต้น server จะใช้ port `8080`

## Environment variables

ฝั่ง browser ต้องกำหนด `VITE_SUPABASE_URL` และ `VITE_SUPABASE_PUBLISHABLE_KEY` ส่วน server ต้องกำหนด `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` และ `SUPABASE_SERVICE_ROLE_KEY` ตามการใช้งานของ route ที่ต้องตรวจสอบสิทธิ์หรือทำงานแบบ admin

สำหรับ Google Sheets ให้ใช้ `GOOGLE_SERVICE_ACCOUNT_JSON` เป็นตัวเลือกหลัก หรือกำหนด credential แบบแยกด้วย `GOOGLE_SERVICE_ACCOUNT_EMAIL` และ `GOOGLE_PRIVATE_KEY` โดยห้าม commit ค่าจริงลง repository

## Scripts

```sh
npm run dev          # เริ่ม development server
npm run build        # สร้าง production build
npm run preview      # preview build ฝั่ง client
npm run lint         # ตรวจ ESLint
npm run test         # รัน unit tests
npm run build:render # สร้างและตรวจ build สำหรับ Node/Render
```

## Deployment

Production deployment บน Netlify ใช้คำสั่ง `npm run build`, publish directory `dist` และกำหนด `NITRO_PRESET=netlify` ใน `netlify.toml` ส่วน Render ใช้ `npm run build:render` และ Nitro preset `node-server` ตาม `render.yaml`

Production site: [my-work-tracking.netlify.app](https://my-work-tracking.netlify.app)
