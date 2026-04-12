# Strengths Discovery Quiz

A self-hosted strengths assessment tool that identifies natural strengths across 34 themes. Built for teams — staff take the quiz, and admins see results in a dashboard for building management trainings.

## Quick Start

### 1. Set up Supabase (free)

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project (pick any name and a strong database password)
3. Once the project is ready, go to **SQL Editor** and paste the contents of `supabase-setup.sql`, then click **Run**
4. Go to **Authentication > Users** and click **Add User** to create your admin account (use your email + a password)
5. Go to **Settings > API** and copy your **Project URL** and **anon/public** key

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and paste your Supabase values:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Install and run locally

```bash
npm install
npm run dev
```

- Quiz: http://localhost:5173
- Admin: http://localhost:5173/#/admin

### 4. Deploy to Netlify (free)

1. Push this repo to GitHub
2. Go to [netlify.com](https://netlify.com) and sign in with GitHub
3. Click **Add new site > Import an existing project** and select your repo
4. Set build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Under **Site settings > Environment variables**, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Trigger a redeploy

Your quiz will be live at `https://your-site-name.netlify.app`

## How It Works

**For quiz takers:**
- Enter name and email, take the quiz (15-20 min)
- See animated results reveal + detailed strengths breakdown
- Progress saves locally so they can resume if interrupted

**For you (admin):**
- Go to `yoursite.com/#/admin` and log in
- See all responses with full 34 rankings, domain breakdown
- Filter by domain, sort by name/date
- Export everything to CSV for training planning

**Privacy:** Quiz takers see a notice that their name, email, and full 34 ranking are visible to the quiz creator. Individual question answers are never stored — only the final calculated rankings.

## Tech Stack

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Supabase (Postgres + Auth + API)
- **Hosting:** Netlify (or any static host)
- **Cost:** $0
