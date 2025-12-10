# 🚀 Cloudflare Production Deployment Guide

## 📋 Prerequisites

- [ ] Cloudflare account
- [ ] Wrangler CLI installed
- [ ] Logged in to Cloudflare (`npx wrangler login`)
- [ ] Twilio account with credentials

---

## 🗄️ Step 1: Create Production Database

### Create D1 Database

```bash
cd backend
npx wrangler d1 create voip-db-prod
```

**Output will show:**
```
✅ Successfully created DB 'voip-db-prod'
Created your database using D1's new storage backend.
The new storage backend is not yet recommended for production
workloads, but backs up your data via point-in-time restore.

[[d1_databases]]
binding = "DB"
database_name = "voip-db-prod"
database_id = "<YOUR-DATABASE-ID>"
```

**Copy the `database_id` - you'll need it!**

---

## ⚙️ Step 2: Update wrangler.toml

Edit `backend/wrangler.toml`:

```toml
name = "voip-backend"
main = "src/index.js"
compatibility_date = "2024-01-01"

# Production D1 Database
[[d1_databases]]
binding = "DB"
database_name = "voip-db-prod"
database_id = "YOUR-DATABASE-ID-HERE"  # ← Paste your database_id here

# Environment Variables (set in Cloudflare Dashboard)
# JWT_SECRET
# TWILIO_ACCOUNT_SID
# TWILIO_AUTH_TOKEN
# TWILIO_API_KEY
# TWILIO_API_SECRET
# TWILIO_TWIML_APP_SID
# API_BASE_URL
```

---

## 🗃️ Step 3: Run Migrations on Production

```bash
# Run each migration file
npx wrangler d1 execute voip-db-prod --remote --file=./migrations/0001_initial_schema.sql

npx wrangler d1 execute voip-db-prod --remote --file=./migrations/0002_multi_tier_organizations.sql

npx wrangler d1 execute voip-db-prod --remote --file=./migrations/add_call_recording.sql
```

**Expected output for each:**
```
🌀 Executing on remote database voip-db-prod (YOUR-DATABASE-ID):
🌀 To execute on your local development database, remove the --remote flag from your wrangler command.
🚣 Executed 15 commands in 0.5s
```

---

## 🌱 Step 4: Load Seed Data (Production)

```bash
npx wrangler d1 execute voip-db-prod --remote --file=./seed_data.sql
```

**This will create:**
- 6 organizations
- 9 users
- 9 phone numbers
- 15 calls
- 7 messages
- 16 transactions

---

## 🔐 Step 5: Set Environment Variables

### Via Cloudflare Dashboard:

1. Go to https://dash.cloudflare.com
2. Navigate to **Workers & Pages**
3. Find your worker (will be created after first deploy)
4. Go to **Settings** → **Variables**
5. Add these secrets:

```
JWT_SECRET=your-secret-key-here
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_API_KEY=SKxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_API_SECRET=your-api-secret
TWILIO_TWIML_APP_SID=APxxxxxxxxxxxxxxxxxxxxxxxxxx
API_BASE_URL=https://your-worker.workers.dev
```

### Or via CLI:

```bash
npx wrangler secret put JWT_SECRET
npx wrangler secret put TWILIO_ACCOUNT_SID
npx wrangler secret put TWILIO_AUTH_TOKEN
npx wrangler secret put TWILIO_API_KEY
npx wrangler secret put TWILIO_API_SECRET
npx wrangler secret put TWILIO_TWIML_APP_SID
```

---

## 🚀 Step 6: Deploy Backend

```bash
cd backend
npx wrangler deploy
```

**Expected output:**
```
⛅️ wrangler 4.53.0
-------------------
Total Upload: XX.XX KiB / gzip: XX.XX KiB
Uploaded voip-backend (X.XX sec)
Published voip-backend (X.XX sec)
  https://voip-backend.YOUR-SUBDOMAIN.workers.dev
Current Deployment ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

**Copy your Worker URL!**

---

## 🌐 Step 7: Deploy Frontend

### Option A: Cloudflare Pages (Recommended)

#### 1. Build Frontend

```bash
cd frontend

# Update API URL in .env.production
echo "VITE_API_URL=https://voip-backend.YOUR-SUBDOMAIN.workers.dev/api" > .env.production

# Build
npm run build
```

#### 2. Deploy to Pages

```bash
npx wrangler pages deploy dist --project-name=voip-frontend
```

**Expected output:**
```
✨ Success! Uploaded X files (X.XX sec)

✨ Deployment complete! Take a peek over at
   https://xxxxxxxx.voip-frontend.pages.dev
```

### Option B: Connect GitHub (Automatic Deployments)

1. Go to https://dash.cloudflare.com
2. **Workers & Pages** → **Create Application** → **Pages**
3. **Connect to Git** → Select your repository
4. **Build settings:**
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root directory: `frontend`
5. **Environment variables:**
   - `VITE_API_URL`: `https://voip-backend.YOUR-SUBDOMAIN.workers.dev/api`
6. Click **Save and Deploy**

---

## ✅ Step 8: Verify Deployment

### Test Backend

```bash
curl https://voip-backend.YOUR-SUBDOMAIN.workers.dev/health
```

**Expected response:**
```json
{
  "status": "OK",
  "timestamp": "2025-12-08T18:22:00.000Z",
  "message": "VOIP SaaS API - Modular Architecture",
  "version": "5.0.0",
  "database": "Cloudflare D1 (SQLite)",
  "features": [...]
}
```

### Test Frontend

Open: `https://xxxxxxxx.voip-frontend.pages.dev`

**Should see:**
- Login page
- Clean UI
- No console errors

### Test Login

Login with:
- Email: `admin@voipplatform.com`
- Password: `admin123`

**Should see:**
- Super Admin dashboard
- 2 agencies
- Global analytics

---

## 🔧 Step 9: Configure Twilio

### Update TwiML App

1. Go to https://console.twilio.com
2. Navigate to **Phone Numbers** → **Manage** → **TwiML Apps**
3. Select your TwiML App
4. Update **Voice Configuration:**
   - Request URL: `https://voip-backend.YOUR-SUBDOMAIN.workers.dev/api/voice/twiml`
   - Method: `POST`
5. Update **Messaging Configuration:**
   - Request URL: `https://voip-backend.YOUR-SUBDOMAIN.workers.dev/api/webhooks/sms`
   - Method: `POST`
6. **Save**

### Update Phone Numbers

For each phone number:
1. Go to **Phone Numbers** → **Manage** → **Active Numbers**
2. Click on a number
3. **Voice & Fax:**
   - Configure with: `TwiML App`
   - TwiML App: Select your app
4. **Messaging:**
   - Configure with: `Webhooks, TwiML Bins, Functions, Studio, or Proxy`
   - Webhook URL: `https://voip-backend.YOUR-SUBDOMAIN.workers.dev/api/webhooks/sms`
   - Method: `POST`
5. **Save**

---

## 🎯 Step 10: Test Production

### Test Calling

1. Login to production frontend
2. Go to Dialer
3. Select a phone number
4. Make a test call
5. Verify call logs

### Test SMS

1. Go to SMS page
2. Send a test message
3. Verify message logs

### Test Billing

1. Check credits balance
2. Make a call
3. Verify credits deducted
4. Check transaction log

---

## 📊 Monitoring & Logs

### View Worker Logs

```bash
npx wrangler tail
```

Or in Dashboard:
1. Go to **Workers & Pages**
2. Click your worker
3. **Logs** tab

### View D1 Database

```bash
# Query production database
npx wrangler d1 execute voip-db-prod --remote --command="SELECT COUNT(*) FROM users"
```

### View Analytics

Dashboard → **Workers & Pages** → Your worker → **Analytics**

---

## 🔒 Security Checklist

- [ ] All secrets set in Cloudflare Dashboard
- [ ] JWT_SECRET is strong and unique
- [ ] Twilio credentials are correct
- [ ] CORS configured properly
- [ ] Rate limiting enabled (future)
- [ ] SSL/TLS enabled (automatic with Cloudflare)

---

## 🐛 Troubleshooting

### Issue: "Database not found"

**Solution:**
```bash
npx wrangler d1 list
# Verify database_id in wrangler.toml matches
```

### Issue: "Environment variables not set"

**Solution:**
```bash
# Check secrets
npx wrangler secret list

# Re-add if missing
npx wrangler secret put JWT_SECRET
```

### Issue: "Twilio webhooks not working"

**Solution:**
1. Check Twilio console configuration
2. Verify webhook URLs are correct
3. Check worker logs for errors

### Issue: "Frontend can't connect to backend"

**Solution:**
1. Check `VITE_API_URL` in frontend
2. Verify CORS settings in backend
3. Check browser console for errors

---

## 📝 Post-Deployment Checklist

- [ ] Backend deployed successfully
- [ ] Frontend deployed successfully
- [ ] Database migrations completed
- [ ] Seed data loaded
- [ ] Environment variables set
- [ ] Twilio webhooks configured
- [ ] Test login works
- [ ] Test calling works
- [ ] Test SMS works
- [ ] Test billing works
- [ ] Monitor logs for errors

---

## 🎉 You're Live!

**Your URLs:**
- **Backend API:** `https://voip-backend.YOUR-SUBDOMAIN.workers.dev`
- **Frontend:** `https://xxxxxxxx.voip-frontend.pages.dev`
- **Health Check:** `https://voip-backend.YOUR-SUBDOMAIN.workers.dev/health`

**Next Steps:**
1. Test all features in production
2. Fix any bugs found
3. Set up custom domain (optional)
4. Start building MVP features
5. Invite beta users

---

## 🔗 Useful Links

- [Cloudflare Dashboard](https://dash.cloudflare.com)
- [Wrangler Docs](https://developers.cloudflare.com/workers/wrangler/)
- [D1 Docs](https://developers.cloudflare.com/d1/)
- [Pages Docs](https://developers.cloudflare.com/pages/)
- [Twilio Console](https://console.twilio.com)

---

**Deployment complete! 🚀**
