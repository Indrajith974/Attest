# Attest - Railway Deployment Guide

Deploy Attest **FREE** on Railway.app (Frontend + Backend together)!

---

## Railway Free Tier
- **$5 credit/month** (enough for small apps)
- **No sleep** like Heroku
- **Auto-deploy** from GitHub
- **Persistent disk** for SQLite

---

## Step 1: Sign Up

1. Go to https://railway.app
2. Click **"Start a New Project"**
3. Sign up with **GitHub**

---

## Step 2: Deploy from GitHub

1. Click **"Deploy from GitHub repo"**
2. Select **"Attest"** repository
3. Railway auto-detects Node.js

---

## Step 3: Configure

Railway will create a service. Click on it and:

### General Settings:
| Setting | Value |
|---------|-------|
| Root Directory | `/` (leave empty) |
| Watch Paths | `backend/**` |

### Build Settings:
| Setting | Value |
|---------|-------|
| Build Command | `cd frontend && npm install && npm run build && cd ../backend && npm install` |
| Start Command | `cd backend && node src/index.js` |

---

## Step 4: Add Environment Variables

Go to **Variables** tab and add:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `PORT` | `${{RAILWAY_PORT}}` |
| `SESSION_SECRET` | (click "Generate" for random value) |
| `RESEND_API_KEY` | `re_Go2vniLr_BDbReh7x6qMVa4ojPc83Krar` |
| `RESEND_FROM` | `Attest <onboarding@resend.dev>` |
| `FRONTEND_URL` | `https://${{RAILWAY_PUBLIC_DOMAIN}}` |
| `DATABASE_PATH` | `./data/attest.db` |

---

## Step 5: Deploy!

Click **"Deploy"** and wait 2-3 minutes.

Your app will be live at: `https://attest-production-xxxx.up.railway.app` 🚀

---

## That's It!

Railway handles everything:
- ✅ Builds frontend
- ✅ Runs backend
- ✅ Serves static files
- ✅ Automatic HTTPS
- ✅ Auto-redeploy on git push
