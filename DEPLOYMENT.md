# Attest - Vercel Deployment Guide

Deploy Attest **100% FREE** on Vercel!

---

## Quick Deploy (2 Minutes)

### Step 1: Go to Vercel
1. Visit https://vercel.com
2. Click **"Start Deploying"**
3. Sign up with **GitHub**

### Step 2: Import Project
1. Click **"Add New..."** → **"Project"**
2. Find and select **"Attest"** repository
3. Click **"Import"**

### Step 3: Configure Project
| Setting | Value |
|---------|-------|
| Framework Preset | `Other` |
| Root Directory | `./` (leave default) |

### Step 4: Add Environment Variables
Click **"Environment Variables"** and add:

| Name | Value |
|------|-------|
| `NODE_ENV` | `production` |
| `SESSION_SECRET` | (generate: `openssl rand -base64 48`) |
| `RESEND_API_KEY` | `re_Go2vniLr_BDbReh7x6qMVa4ojPc83Krar` |
| `RESEND_FROM` | `Attest <onboarding@resend.dev>` |

### Step 5: Deploy!
Click **"Deploy"** and wait ~2 minutes.

Your app will be live at: `https://attest-xxx.vercel.app` 🚀

---

## After Deployment

### Update FRONTEND_URL
1. Copy your Vercel URL (e.g., `https://attest-xxx.vercel.app`)
2. Go to Project Settings → Environment Variables
3. Add:
   - `FRONTEND_URL` = `https://attest-xxx.vercel.app`
   - `COOKIE_DOMAIN` = `vercel.app`
4. Redeploy

---

## Troubleshooting

### Build fails?
Check the build logs in Vercel dashboard.

### API not working?
Make sure all environment variables are set.

### Push updates?
```bash
git add .
git commit -m "Update"
git push
```
Vercel auto-deploys on push! 🔄
