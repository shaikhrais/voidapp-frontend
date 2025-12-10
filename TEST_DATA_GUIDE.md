# 🧪 Test Data Reference Guide

## Quick Login Credentials

All passwords are: `admin123`

### 🔑 Login Accounts

| Role | Email | Password | Organization | Access Level |
|------|-------|----------|--------------|--------------|
| **Super Admin** | admin@voipplatform.com | admin123 | Platform Admin | Full platform access |
| **Agency Admin** | john@techcom.com | admin123 | TechCom Solutions | Manage agency & customers |
| **Agency Admin** | emily@cloudcom.com | admin123 | CloudCom Partners | Manage agency & customers |
| **Business Admin** | sarah@acmecorp.com | admin123 | Acme Corporation | Manage business & team |
| **Business Admin** | robert@globaltech.com | admin123 | Global Tech Inc | Manage business & team |
| **Sales User** | mike@acmecorp.com | admin123 | Acme Corporation | Make calls, send SMS |
| **Sales User** | lisa@acmecorp.com | admin123 | Acme Corporation | Make calls, send SMS |
| **Sales User** | david@acmecorp.com | admin123 | Acme Corporation | Make calls, send SMS |

---

## 🏢 Organization Hierarchy

```
Platform Admin (Super Admin)
├── TechCom Solutions (Agency)
│   ├── Acme Corporation (Business)
│   │   ├── Sarah Johnson (Admin)
│   │   ├── Mike Chen (Sales)
│   │   ├── Lisa Anderson (Sales)
│   │   └── David Williams (Sales)
│   └── Global Tech Inc (Business)
│       └── Robert Taylor (Admin)
└── CloudCom Partners (Agency)
    └── Emily Davis (Admin)
```

---

## 📞 Phone Numbers

### TechCom Solutions (Agency)
- `+1 (415) 555-1001` - TechCom Main
- `+1 (415) 555-1002` - TechCom Support

### Acme Corporation (Business)
- `+1 (415) 555-2001` - Acme Sales
- `+1 (415) 555-2002` - Acme Support
- `+1 (415) 555-2003` - Acme Main

### Global Tech Inc (Business)
- `+1 (415) 555-3001` - GlobalTech Main
- `+1 (415) 555-3002` - GlobalTech Sales

### CloudCom Partners (Agency)
- `+1 (415) 555-4001` - CloudCom Main

---

## 📊 Sample Data Included

### Call Logs
- **15 calls** across organizations
- Mix of:
  - ✅ Completed calls (with duration)
  - 📞 In-progress calls
  - ❌ Failed/No-answer calls
  - 📥 Inbound calls
  - 📤 Outbound calls

### SMS Messages
- **7 messages** with realistic conversations
- Customer inquiries
- Order confirmations
- Appointment reminders
- Welcome messages

### Transactions
- **16 transactions** showing:
  - 💰 Credit additions
  - 💸 Call charges
  - 💸 SMS charges
  - 📈 Monthly top-ups

### Credits Balance
- **Platform Admin:** $100,000.00
- **TechCom Solutions:** $99,829.30
- **Acme Corporation:** $10,427.15
- **Global Tech Inc:** $14,953.20
- **CloudCom Partners:** $30,000.00

---

## 🎯 Testing Scenarios

### 1. Super Admin Dashboard
**Login:** admin@voipplatform.com

**What to test:**
- View all agencies
- View global analytics
- Create new agency
- Monitor platform usage
- View revenue reports

---

### 2. Agency Management
**Login:** john@techcom.com

**What to test:**
- View customer businesses (Acme Corp, Global Tech)
- Create new business customer
- View agency revenue
- Manage agency settings
- View usage across all customers

---

### 3. Business Operations
**Login:** sarah@acmecorp.com

**What to test:**
- View team members (Mike, Lisa, David)
- View call logs (12 calls)
- View SMS messages (5 messages)
- Check credit balance ($10,427.15)
- View usage statistics
- Manage phone numbers (3 numbers)

---

### 4. Sales User Experience
**Login:** mike@acmecorp.com

**What to test:**
- Make outbound calls
- Send SMS messages
- View personal call history
- Check recent calls widget
- Use dialer with caller ID selection

---

## 🧪 Test Workflows

### Workflow 1: Make a Call
1. Login as `mike@acmecorp.com`
2. Go to Dialer page
3. Select caller ID: `+1 (415) 555-2001`
4. Enter number: `+1 (408) 555-1234`
5. Click "Call"
6. Test mute/unmute
7. End call
8. Check call log

### Workflow 2: Send SMS
1. Login as `sarah@acmecorp.com`
2. Go to SMS page
3. Select from number: `+1 (415) 555-2001`
4. Enter to number: `+1 (408) 555-5678`
5. Type message
6. Send
7. Check SMS logs

### Workflow 3: View Analytics
1. Login as `john@techcom.com` (Agency Admin)
2. Go to Dashboard
3. View:
   - Total customers: 2
   - Total calls across customers
   - Revenue breakdown
   - Top performing businesses

### Workflow 4: Manage Team
1. Login as `sarah@acmecorp.com`
2. Go to Team Management
3. View team members (3 sales users)
4. Check permissions
5. View individual user stats

### Workflow 5: Monitor Usage
1. Login as `admin@voipplatform.com`
2. Go to Admin Dashboard
3. View:
   - Total agencies: 2
   - Total businesses: 3
   - Total users: 9
   - Platform revenue
   - Usage trends

---

## 📈 Expected Dashboard Stats

### Super Admin Dashboard
- **Agencies:** 2 (TechCom, CloudCom)
- **Businesses:** 3 (Acme, Global Tech, + any under CloudCom)
- **Users:** 9
- **Phone Numbers:** 9
- **Total Calls:** 15
- **Total Messages:** 7
- **Platform Revenue:** ~$300

### Agency Dashboard (TechCom)
- **Customers:** 2 (Acme, Global Tech)
- **Total Users:** 5
- **Total Numbers:** 5
- **Total Calls:** 15
- **Revenue:** ~$170

### Business Dashboard (Acme Corp)
- **Team Members:** 4 (1 admin + 3 sales)
- **Phone Numbers:** 3
- **Calls:** 12
- **Messages:** 5
- **Credits:** $10,427.15
- **This Month Usage:** ~$73

---

## 🔍 Data Verification Queries

### Check Organizations
```sql
SELECT id, name, type, credits FROM organizations_v2;
```

### Check Users
```sql
SELECT id, email, role, organization_id FROM users;
```

### Check Calls
```sql
SELECT id, from_number, to_number, status, duration, created_at 
FROM calls 
ORDER BY created_at DESC;
```

### Check Messages
```sql
SELECT id, from_number, to_number, body, status 
FROM messages 
ORDER BY created_at DESC;
```

### Check Transactions
```sql
SELECT id, organization_id, type, amount, description 
FROM transactions 
ORDER BY created_at DESC;
```

---

## 🎨 UI Features to Test

### Dialer Page
- ✅ Number input
- ✅ Dialpad buttons
- ✅ Caller ID selection dropdown
- ✅ Call/End call buttons
- ✅ Mute toggle
- ✅ Call duration timer
- ✅ Recent calls widget

### Dashboard
- ✅ Statistics cards
- ✅ Recent activity
- ✅ Quick actions
- ✅ Usage charts

### Call Logs
- ✅ Call history table
- ✅ Filter by date
- ✅ Filter by status
- ✅ Search functionality
- ✅ Export options

### SMS Logs
- ✅ Message threads
- ✅ Send new message
- ✅ Message status
- ✅ Timestamps

### Admin Dashboard
- ✅ Agency list
- ✅ Global analytics
- ✅ Revenue charts
- ✅ Create agency

---

## 🚀 Quick Start

### 1. Load Seed Data
```bash
cd backend
npx wrangler d1 execute voip-db --local --file=./seed_data.sql
```

### 2. Start Backend
```bash
cd backend
npx wrangler dev
```

### 3. Start Frontend
```bash
cd frontend
npm run dev
```

### 4. Login
Open http://localhost:5173 and login with any account above.

---

## 📝 Notes

- All phone numbers are in E.164 format (+1XXXXXXXXXX)
- Timestamps are Unix timestamps (seconds since epoch)
- Credits are in USD
- Call durations are in seconds
- All passwords are hashed with SHA-256

---

## 🎯 Testing Checklist

- [ ] Super Admin can view all agencies
- [ ] Agency Admin can view customers
- [ ] Business Admin can view team
- [ ] Sales user can make calls
- [ ] Call logs display correctly
- [ ] SMS messages send/receive
- [ ] Credits deduct on usage
- [ ] Transactions log properly
- [ ] Analytics show correct data
- [ ] Phone numbers work
- [ ] Dialer functions properly
- [ ] Recent calls update
- [ ] User permissions work
- [ ] Organization hierarchy correct

---

**Happy Testing! 🎉**
