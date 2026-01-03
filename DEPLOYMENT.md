# Attest - Koyeb Deployment Guide

Deploy Attest **FREE FOREVER** on Koyeb!

---

## Koyeb Free Tier
- ✅ **2 apps free** forever
- ✅ **No sleep** - always on
- ✅ **Auto-deploy** from GitHub
- ✅ **Free SSL/HTTPS**
- ✅ **Global CDN**

---

## Step 1: Sign Up

1. Go to https://www.koyeb.com
2. Click **"Get Started Free"**
3. Sign up with **GitHub**

---

## Step 2: Create New Service

1. Click **"Create Web Service"**
2. Select **"GitHub"**
3. Choose **"Indrajith974/Attest"** repository
4. Branch: **master**

---

## Step 3: Configure Build

| Setting | Value |
|---------|-------|
| Builder | **Dockerfile** |
| Dockerfile location | `Dockerfile` |
| Instance type | **Free** (nano) |
| Region | Frankfurt (or closest) |

---

## Step 4: Add Environment Variables

Click **"Add variable"** for each:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `PORT` | `8000` |
| `SESSION_SECRET` | (generate random 64 chars) |
| `RESEND_API_KEY` | `re_Go2vniLr_BDbReh7x6qMVa4ojPc83Krar` |
| `RESEND_FROM` | `Attest <onboarding@resend.dev>` |
| `FRONTEND_URL` | `https://attest-YOUR_ID.koyeb.app` |
| `DATABASE_PATH` | `./data/attest.db` |

---

## Step 5: Deploy!

1. Set **App name**: `attest`
2. Click **"Deploy"**
3. Wait 3-5 minutes for build

---

## Your App URL

After deployment, your app will be at:
```
https://attest-YOUR_ID.koyeb.app
```

---

## ⚠️ Important: Update FRONTEND_URL

After first deploy:
1. Copy your actual URL from Koyeb dashboard
2. Go to **Settings** → **Environment Variables**
3. Update `FRONTEND_URL` with your actual URL
4. Redeploy

---

## That's it! 🚀

Your full-stack app is now live with:
- ✅ Frontend (React)
- ✅ Backend (Node.js)
- ✅ SQLite Database
- ✅ File uploads
- ✅ Email OTP
