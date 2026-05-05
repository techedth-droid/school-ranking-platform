# School Ranking Platform

Full-stack school ranking app: Next.js 14 (JavaScript), Express, PostgreSQL 16, Prisma, JWT, Docker.

**ขอบเขต (1.6):** ทุกจังหวัดทั่วราชอาณาจักรไทย · กลุ่มเป้าหมาย โรงเรียนประถมศึกษาและมัธยมศึกษา ทั้งภาครัฐและเอกชน

## Quick start

1. Copy environment file:

   ```bash
   cp .env.example .env
   ```

2. Start all services:

   ```bash
   docker-compose up --build
   ```

3. Open:

   - Public ranking: [http://localhost:3007](http://localhost:3007)
   - Admin login: [http://localhost:3007/admin/login](http://localhost:3007/admin/login)  
     Default: `admin@school.com` / `admin1234`
   - API docs (Swagger): [http://localhost:3005/api/docs](http://localhost:3005/api/docs)

## Ports

| Service    | Host port |
| ---------- | --------- |
| Frontend   | 3007      |
| Backend    | 3005      |
| PostgreSQL | 5435      |

Stack uses JavaScript only (no TypeScript). Types are documented with JSDoc in `frontend/src/types/index.js`.

## Deploy: Vercel + Supabase + API

**แนวทาง:** Frontend บน **Vercel** · ฐานข้อมูลเป็น **PostgreSQL บน Supabase** (แทน Postgres บน PaaS อื่นได้) · **Backend (Express)** ต้องมีที่โฮสต์แยก เช่น Railway, Render, Fly.io หรือ VPS — เพราะ Supabase ไม่ได้รันโฟลเดอร์ `backend` ให้

### Supabase (ฐานข้อมูล)

1. สร้างโปรเจกต์ใน [Supabase](https://supabase.com) → **Project Settings → Database**
2. คัดลอก **Connection string** แบบ URI มาใส่เป็น `DATABASE_URL` ใน environment ของ service ที่รัน API (ไม่ใส่ใน repo)
3. รัน migration ชี้ DB นี้ (จากเครื่องหรือ CI):  
   `cd backend && npx prisma migrate deploy`
4. **Direct vs Pooling:** Express รันยาวบน container/VPS มักใช้ **Direct** ได้ตามปกติ ถ้าใช้ serverless หลาย instance ให้อ่าน [Prisma + Supabase](https://www.prisma.io/docs/guides/database/supabase) เรื่อง pooler (PgBouncer) และพารามิเตอร์ที่แนะนำ

### Backend (API)

1. Deploy จาก GitHub โดยตั้ง **Root Directory** เป็น `backend` (เช่น บน Railway/Render/Fly — ใช้ `backend/Dockerfile` ที่รัน `migrate deploy` + `seed` + `node` ได้ถ้าแพลตฟอร์มรองรับ Docker)
2. ตั้ง `DATABASE_URL` ให้ชี้ Supabase (ตามด้านบน)
3. เปิด **Public URL** ของ API (เช่น `https://xxx.up.railway.app` หรือโดเมนของผู้ให้บริการอื่น)
4. ตัวแปรสำคัญบน API:
   - `FRONTEND_URL` — URL ของ Vercel (หลาย origin คั่นด้วยคอมมาได้ เช่น production + preview)  
     ตัวอย่าง: `https://your-app.vercel.app,https://your-app-git-dev.vercel.app`
   - `JWT_SECRET`, `JWT_REFRESH_SECRET` — สุ่มยาว ๆ ใน production
   - `NODE_ENV=production`
   - `ADMIN_EMAIL` / `ADMIN_PASSWORD` — บัญชีแรก (seed ใช้ `upsert` ต่อรอบ deploy)
5. **ไฟล์อัปโหลด:** ดิสก์บน PaaS มักไม่ถาวร — แนะนำตั้ง `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` เพื่อเก็บไฟล์บน Cloudinary; ถ้าไม่ตั้ง ระบบจะ fallback ไปเก็บ local ที่ `UPLOAD_PATH` (ใน Docker ค่าเริ่มต้นคือ `/app/uploads`)

### Vercel (Next.js)

1. Import repo → ตั้ง **Root Directory** เป็น `frontend`
2. **Environment Variables** (ต้องมีตอน build และ runtime):
   - `NEXT_PUBLIC_API_URL` — URL สาธารณะของ API **ไม่มี slash ท้าย**  
     ใช้ทั้งฝั่งเบราว์เซอร์เรียก API และใน `next.config.js` rewrites / รูปจาก `/uploads`
3. Build มาตรฐาน `npm run build` / output standalone ตามที่ repo ตั้งไว้

### เช็กลิสต์หลัง deploy

- เปิดเว็บ Vercel แล้วลองล็อกอินแอดมิน / โหลดอันดับ
- ถ้า CORS error: ตรวจ `FRONTEND_URL` ให้ตรงกับ origin จริงของแท็บเบราว์เซอร์ (รวม `https://`)
- ถ้ารูปโลโก้/แบนเนอร์ไม่ขึ้น: ตรวจว่า `NEXT_PUBLIC_API_URL` ตั้งก่อน build และโดเมนนั้นตรงกับที่ใส่ใน `next.config.js` `remotePatterns`
