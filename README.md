# Sunnyside Vision

Community engagement platform for the Sunnyside Public Realm Vision Plan.

## Setup Instructions

### 1. Run the SQL in Supabase
Go to Supabase → SQL Editor and run the contents of `seed.sql`

### 2. Add Environment Variables in Vercel
Go to Vercel → Your Project → Settings → Environment Variables and add:
- `VITE_SUPABASE_URL` — your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — your Supabase anon/public key  
- `VITE_ADMIN_PASSWORD` — choose a password for your admin panel

### 3. Deploy
Push to GitHub → Vercel auto-deploys

### 4. Upload Your Photos
Go to `/admin` on your live site → Locations → Click a location → Upload Photo

### 5. Add Survey Questions
Go to `/admin` → Locations → Click a location → Add Question
