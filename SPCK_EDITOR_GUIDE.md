# คู่มือเปิดและแก้ไข Work Tracker ด้วย Spck บนมือถือ

เอกสารนี้ใช้สำหรับเปิด แก้ไข ตรวจสอบ diff และซิงก์โค้ดของ repository `JntnCH/My-Work-Tracking` ผ่านแอป **Spck Editor** บนมือถือ โดยใช้การ Clone จาก GitHub เป็นวิธีหลัก

> URL ของ repository: `https://github.com/JntnCH/My-Work-Tracking.git`

## 1. สิ่งที่ต้องเตรียม

ติดตั้ง Spck Editor บนโทรศัพท์ และเตรียมบัญชี GitHub ที่มีสิทธิ์เข้าถึง repository นี้ หาก repository เป็น private แอปอาจขอ GitHub credentials หรือ access token ภายในหน้าตั้งค่าของ Spck ให้กรอกข้อมูลเฉพาะในแอปเท่านั้น ห้ามใส่ token ใน URL ของ repository และห้ามส่ง token หรือ Channel Secret ในแชต

โปรเจ็กต์นี้เป็น TanStack Start + React + Vite และมีไฟล์จำนวนมากกว่าหน้า HTML แบบธรรมดา ดังนั้น Spck เหมาะสำหรับการเปิดอ่านและแก้ไข source code บนมือถือ ส่วนการติดตั้ง dependency, production build และการ deploy ควรทำผ่าน Render หรือเครื่องที่มี Node.js ครบ

## 2. Clone repository จาก GitHub ใน Spck

ขั้นตอนอาจมีชื่อเมนูต่างกันเล็กน้อยตามรุ่นของแอป แต่ลำดับหลักคือ Projects → GIT → Clone Repo

1. เปิดแอป **Spck Editor** บนมือถือ
2. เปิดแท็บ **Projects**
3. เปิดเมนู **GIT** แล้วเลือก **Clone Repo**
4. วาง URL นี้ลงในช่อง Repository URL:

   ```text
   https://github.com/JntnCH/My-Work-Tracking.git
   ```

5. เลือกโฟลเดอร์ปลายทางในเครื่อง แล้วกด **Clone**
6. หาก Spck ขอสิทธิ์ GitHub ให้เข้าสู่ระบบหรือใส่ credentials ในหน้าตั้งค่าของ Spck โดยตรง
7. เปิดโปรเจ็กต์ที่ Clone เสร็จแล้วจากแท็บ **Projects**

เอกสาร Spck ระบุว่าการ Clone repository ทำจากเมนู Projects/GIT/Clone Repo และ Git integration รองรับการทำงานกับ remote repository ตามการตั้งค่าของแอป [1] [2]

## 3. เลือก branch ที่ต้องการแก้

หากต้องการเปิดโค้ดหลักของระบบ ให้เลือก branch `main` หากต้องการเปิดโค้ดชุดล่าสุดที่มีการแก้ LINE LIFF root callback ให้เลือก branch:

```text
feature/line-login-settings-audit
```

แนะนำให้แก้ไขบน feature branch ไม่ใช่ `main` โดยตรง เมื่อเลือก branch แล้วให้ตรวจชื่อ branch ในเมนู GIT ของ Spck ก่อนเริ่มแก้ไฟล์

## 4. ไฟล์สำคัญที่เปิดแก้ไขได้

| งาน                                      | ตำแหน่งไฟล์                                               |
| ---------------------------------------- | --------------------------------------------------------- |
| หน้า Login และ callback LINE             | `src/routes/auth.tsx`                                     |
| Root LIFF callback                       | `src/routes/__root.tsx`                                   |
| LINE LIFF helper                         | `src/lib/line-auth.ts`                                    |
| ตั้งค่าหน้าระบบ                          | `src/components/work/SettingsPanel.tsx`                   |
| การคำนวณชั่วโมง ค่าแรง และ OT            | `src/lib/work-log.ts`                                     |
| การเชื่อมต่อ Supabase และข้อมูล Work Log | `src/lib/supabase-db.ts`, `src/hooks/use-work-tracker.ts` |
| Dashboard และกราฟ                        | `src/components/work/DashboardPanel.tsx`                  |
| คำสั่ง build                             | `package.json`                                            |

ก่อนเพิ่ม field ใหม่ ให้ค้นหาชื่อ field เดิมใน `src/`, schema และ mapping ที่เกี่ยวข้องก่อนเสมอ เพื่อไม่ให้ข้อมูลซ้ำกับระบบบันทึกงานเดิม

## 5. แก้ไฟล์และตรวจ diff บนมือถือ

หลังแก้ไฟล์ ให้บันทึกไฟล์และเปิดเมนู **GIT** เพื่อตรวจรายการ Modified files. ตรวจว่าไฟล์ที่เปลี่ยนตรงกับงานที่ตั้งใจทำ และไม่มี `.env`, token, Channel Secret, service-role key หรือไฟล์ลับติดไปด้วย

หากแก้เฉพาะ source code ให้ตรวจอย่างน้อย:

```text
src/routes/__root.tsx
src/lib/line-auth.ts
```

อย่าแก้ค่า `VITE_LINE_LIFF_ID` โดยนำ Channel Secret มาใส่แทน และอย่าใส่ Channel Secret ลงใน source code, `.env` ที่ commit หรือ repository

## 6. Commit และ Push จาก Spck

เมื่อทดสอบและตรวจ diff แล้ว ให้ใช้เมนู GIT ตามลำดับต่อไปนี้:

1. ตรวจรายการไฟล์ที่เปลี่ยน
2. เขียน Commit message ที่อธิบายการเปลี่ยนแปลง เช่น `fix(auth): handle LIFF primary redirect callback`
3. กด **Commit**
4. ตรวจ branch ปลายทางว่าไม่ใช่ `main` หากยังไม่ได้รับอนุมัติให้ merge
5. กด **Push**

สำหรับการแก้ไขระบบ Work Tracker ควรแสดงตัวอย่าง diff และผลทดสอบก่อน Push ตามกติกาของโปรเจ็กต์

## 7. การทดสอบบนมือถือ

Spck สามารถใช้เปิดและแก้ไข source code ได้ แต่การรันคำสั่ง `npm run build:render` ของโปรเจ็กต์นี้อาจทำไม่ได้ภายในแอป หากไม่มี Node.js และ dependency ครบ. หลังแก้จากมือถือ ให้ Push ไปยัง feature branch แล้วตรวจ build/deploy ผ่านสภาพแวดล้อมที่ใช้ Render

หากต้องตรวจหน้าเว็บอย่างรวดเร็ว ให้เปิด production URL ใน browser แยกจาก Spck:

```text
https://google-sheet-organizer.onrender.com
```

การตรวจ LINE Login จริงต้องใช้ LIFF ID ที่ตั้งผ่าน Render Environment Variable และ Custom OIDC provider ใน Supabase ตามคู่มือ `LINE_LOGIN_SETUP.md`; ห้ามนำ Channel Secret มาไว้ในมือถือหรือ repository

## 8. ปัญหาที่พบบ่อย

| อาการ                        | แนวทางแก้                                                                                  |
| ---------------------------- | ------------------------------------------------------------------------------------------ |
| Clone ไม่สำเร็จ              | ตรวจ URL และสิทธิ์ repository; หากเป็น private ให้ตั้งค่า GitHub credentials ใน Spck       |
| ไม่เห็น branch ที่ต้องการ    | Pull หรือ Refresh remote branches ในเมนู GIT แล้วเลือก `feature/line-login-settings-audit` |
| Push ไม่ได้                  | ตรวจว่าอยู่บน branch ที่มีสิทธิ์เขียน และตรวจรายการ Modified/Staged files ก่อน             |
| เปิดไฟล์ได้แต่รันระบบไม่ได้  | เป็นข้อจำกัดของ runtime บนมือถือ ให้ใช้ Render หรือเครื่องที่ติดตั้ง Node.js               |
| พบไฟล์ลับในรายการเปลี่ยนแปลง | ยกเลิก commit ทันที ลบไฟล์ลับออกจาก staging และแจ้งผู้ดูแลก่อน Push                        |

## References

[1]: https://spckio.github.io/spck-documentation/getting-started.html Spck Editor Documentation — Getting Started.

[2]: https://spckio.github.io/spck-documentation/git-guide.html Spck Editor Documentation — GIT Guide.

[3]: https://spckio.github.io/spck-documentation/importing-exporting.html Spck Editor Documentation — Importing & Exporting.

[4]: https://github.com/JntnCH/My-Work-Tracking GitHub — JntnCH/My-Work-Tracking.
