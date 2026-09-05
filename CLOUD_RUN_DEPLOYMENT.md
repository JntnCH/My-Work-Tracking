# Cloud Run Auto Deploy

GitHub Actions ในโปรเจกต์นี้จะทำงานเมื่อ push เข้า `main` หรือสั่งด้วย `workflow_dispatch` จากแท็บ Actions โดยจะ authenticate Google Cloud ผ่าน Workload Identity Federation, build Docker image, push ไป Artifact Registry และ deploy revision ใหม่ไป Cloud Run

## GitHub Variables

ตั้งค่าใน repository settings: `GCP_PROJECT_ID`, `GCP_REGION` (เช่น `asia-southeast1`), `CLOUD_RUN_SERVICE`, `GAR_REPOSITORY` และค่า public `VITE_*` ที่แอปใช้ ได้แก่ Supabase, Firebase และ LINE LIFF

## GitHub Secrets

ตั้งค่า `GCP_WORKLOAD_IDENTITY_PROVIDER` และ `GCP_SERVICE_ACCOUNT` โดยแนะนำ Workload Identity Federation แทนการเก็บ service-account JSON key ใน GitHub

## Google Secret Manager

สร้าง secrets และให้ Cloud Run runtime service account อ่านได้: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_PUBLISHABLE_KEY`, `GOOGLE_SERVICE_ACCOUNT_JSON`, `AIRTABLE_API_KEY`, `AIRTABLE_BASE_ID`, `AIRTABLE_TABLE_NAME` หากไม่ได้ใช้ integration ใด ให้ลบรายการนั้นออกจาก `--set-secrets` ใน workflow

## สิทธิ์ Google Cloud

Deploy service account ต้องมี Artifact Registry Writer, Cloud Run Admin และ Service Account User ส่วน runtime service account ต้องมี Secret Manager Secret Accessor

ห้าม commit service-role key หรือ credential จริงลง repository ค่า `VITE_*` เป็น public browser configuration และถูกฝังใน bundle ตอน build
