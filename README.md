# Attest

**Immutable Human-Verified Proof System**

Create tamper-proof claims verified by real witnesses. Build a permanent record of your life events that can never be altered.

---

## ✨ Features

- 🔒 **Immutable by Design** - Claims and responses cannot be edited or deleted
- 👥 **Human Verification** - Real people verify your claims, not bots
- 📊 **Transparent Scoring** - See exactly how confidence scores are calculated
- 📄 **Shareable Proof** - Download PDFs, share QR codes, send public links
- 🔍 **Full Audit Trail** - Every action logged with timestamps

---

## 🚀 Quick Start (Development)

### Prerequisites
- Node.js 18+ 
- npm

### Run Locally

```bash
# Clone the repository
git clone https://github.com/Indrajith974/Attest.git
cd Attest

# Install dependencies
cd backend && npm install
cd ../frontend && npm install
cd ..

# Copy environment file
cp backend/.env.example backend/.env

# Start development servers
bash dev.sh
```

Open http://localhost:5173

---

## 📁 Project Structure

```
attest/
├── backend/           # Node.js + Express API
│   ├── src/
│   │   ├── db/        # SQLite database
│   │   ├── middleware/# Auth & security
│   │   ├── routes/    # API routes
│   │   └── services/  # Business logic
├── frontend/          # React + Vite
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
└── dev.sh             # Development runner
```

---

## 📧 Email Configuration

For OTP emails, configure in `backend/.env`:

```env
# Option 1: Resend API (recommended)
RESEND_API_KEY=your_api_key
RESEND_FROM=Attest <noreply@yourdomain.com>

# Option 2: SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=app-password

# Option 3: Console (dev mode - no config needed)
```

---

## 🔐 Security

- Rate limiting on all endpoints
- Session-based authentication
- Input validation & sanitization
- Helmet security headers
- CORS protection

---

**Built with ❤️ for trust and transparency**
