# Attest

**Immutable Human-Verified Proof System**

Create tamper-proof claims verified by real witnesses. Build a permanent record of your life events that can never be altered.

![Attest](https://img.shields.io/badge/version-1.0.0-blue) ![License](https://img.shields.io/badge/license-MIT-green) ![Security](https://img.shields.io/badge/security-hardened-brightgreen)

---

## ✨ Features

- 🔒 **Immutable by Design** - Claims and responses cannot be edited or deleted
- 👥 **Human Verification** - Real people verify your claims, not bots
- 📊 **Transparent Scoring** - See exactly how confidence scores are calculated
- 📄 **Shareable Proof** - Download PDFs, share QR codes, send public links
- 🔍 **Full Audit Trail** - Every action logged with timestamps
- 🌐 **Works Globally** - No borders, no restrictions

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Development

```bash
# Clone the repository
git clone https://github.com/yourusername/attest.git
cd attest

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

### Email Configuration

Choose one of these options for OTP emails:

#### Option 1: Resend (Recommended)
```env
RESEND_API_KEY=re_YOUR_API_KEY
RESEND_FROM=Attest <noreply@yourdomain.com>
```
Get your API key at [resend.com](https://resend.com)

#### Option 2: SMTP
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

#### Option 3: Console (Dev Only)
No configuration needed - OTPs print to console.

---

## 📁 Project Structure

```
attest/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── db/             # SQLite database & migrations
│   │   ├── middleware/     # Auth & security middleware
│   │   ├── routes/         # API routes
│   │   └── services/       # Business logic
│   └── uploads/            # Evidence files
├── frontend/               # React + Vite
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── context/        # React context (Auth, Theme)
│   │   ├── pages/          # Page components
│   │   └── services/       # API client
│   └── public/             # Static assets
├── Dockerfile              # Production build
├── fly.toml                # Fly.io configuration
└── dev.sh                  # Development runner
```

---

## 🔐 Security

Attest is built with security as a core principle:

| Protection | Implementation |
|------------|----------------|
| Authentication | OTP via email, session-based |
| Rate Limiting | OTP (5/15min), Auth (15/15min), API (100/15min) |
| Input Validation | Email sanitization, UUID validation, XSS prevention |
| Headers | Helmet (CSP, HSTS, X-Frame-Options, etc.) |
| Sessions | Secure cookies, regeneration on login |
| Database | Parameterized queries, immutability triggers |

---

## 🚀 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed Fly.io deployment instructions.

### Quick Deploy

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Login & initialize
fly auth login
fly launch --no-deploy

# Create volumes
fly volumes create attest_data --size 1
fly volumes create attest_uploads --size 2

# Set secrets
fly secrets set SESSION_SECRET="your-64-char-secret"
fly secrets set RESEND_API_KEY="re_YOUR_API_KEY"
fly secrets set RESEND_FROM="Attest <noreply@yourdomain.com>"

# Deploy
fly deploy
```

---

## 📖 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/request-otp` | Request login OTP |
| POST | `/api/auth/verify-otp` | Verify OTP & login |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/claims` | List user's claims |
| POST | `/api/claims` | Create new claim |
| GET | `/api/claims/:id` | Get claim details |
| POST | `/api/claims/:id/evidence` | Upload evidence |
| POST | `/api/claims/:id/invite` | Create witness invite |
| GET | `/api/witness/:token` | Get claim for witness |
| POST | `/api/witness/:token` | Submit witness response |
| GET | `/api/proof/:claimId` | Public proof page data |
| GET | `/api/analytics` | Analytics dashboard |

---

## 📜 License

MIT License - see [LICENSE](./LICENSE)

---

## 🤝 Contributing

Contributions welcome! Please read our contributing guidelines first.

---

**Built with ❤️ for trust and transparency**
