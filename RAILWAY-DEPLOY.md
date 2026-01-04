# 🚂 Railway Deployment Guide for Goal Quest

Complete step-by-step guide to deploy Goal Quest on Railway.

## 📋 Prerequisites

- GitHub account with your Goal Quest repository
- Railway account (sign up at [railway.app](https://railway.app))
- OpenAI API key
- Anthropic API key (for AI Coach)

## 🚀 Quick Deploy (5 minutes)

### Method 1: One-Click Deploy from GitHub

1. **Push to GitHub** (if not already done)
```bash
cd goal-quest-github
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/goal-quest.git
git push -u origin main
```

2. **Deploy to Railway**
   - Go to [railway.app](https://railway.app)
   - Click **"Start a New Project"**
   - Select **"Deploy from GitHub repo"**
   - Authorize Railway to access your GitHub
   - Select your `goal-quest` repository
   - Railway will automatically detect Node.js and deploy

3. **Add PostgreSQL Database**
   - In your Railway project dashboard
   - Click **"+ New"** → **"Database"** → **"PostgreSQL"**
   - Railway automatically connects it to your app
   - The `DATABASE_URL` is automatically set

4. **Set Environment Variables**
   - Click on your service
   - Go to **"Variables"** tab
   - Add the following:

   ```env
   OPENAI_API_KEY=sk-your-openai-key-here
   ANTHROPIC_API_KEY=sk-ant-your-anthropic-key-here
   SESSION_SECRET=generate-a-random-secure-string-here
   NODE_ENV=production
   ```

5. **Deploy!**
   - Railway automatically deploys on every push to `main`
   - Wait for build to complete (~2-3 minutes)
   - Click **"View Logs"** to monitor deployment

6. **Get Your URL**
   - Go to **"Settings"** tab
   - Under **"Domains"** → Click **"Generate Domain"**
   - Your app will be live at `your-app.up.railway.app`

---

## 🛠️ Method 2: CLI Deploy (Advanced)

### Install Railway CLI

```bash
# macOS/Linux
brew install railway

# Windows
npm install -g @railway/cli

# Or use npx
npx @railway/cli
```

### Login to Railway

```bash
railway login
```

### Initialize Project

```bash
cd goal-quest-github

# Create new Railway project
railway init

# Follow prompts:
# - Name your project: "goal-quest" or similar
# - Choose "Empty Project"
```

### Add PostgreSQL

```bash
# Add PostgreSQL database
railway add --database postgres

# This automatically sets DATABASE_URL
```

### Set Environment Variables

```bash
# Set variables one by one
railway variables set OPENAI_API_KEY=sk-your-key-here
railway variables set ANTHROPIC_API_KEY=sk-ant-your-key-here
railway variables set SESSION_SECRET=$(openssl rand -base64 32)
railway variables set NODE_ENV=production

# Or set multiple at once from .env file
railway variables set --from-env .env.railway
```

### Deploy

```bash
# Deploy current directory
railway up

# Watch logs
railway logs

# Open in browser
railway open
```

### Link to GitHub (Auto-deploy on push)

```bash
# In Railway dashboard:
# 1. Go to Settings → Connect to GitHub
# 2. Select your repository
# 3. Choose branch (main)
# 4. Enable "Automatic Deployments"
```

---

## 🗄️ Database Setup

### Automatic Migration

Railway automatically runs database migrations on deployment thanks to our `postinstall` script:

```json
{
  "scripts": {
    "postinstall": "npm run build"
  }
}
```

### Manual Migration

If needed, run migrations manually:

```bash
# Using Railway CLI
railway run npm run db:push

# Or connect to database directly
railway run npm run db:studio
```

### Access Database Directly

```bash
# Get database URL
railway variables get DATABASE_URL

# Connect with psql
railway run psql $DATABASE_URL

# Or use Railway's DB client
railway connect postgres
```

---

## ⚙️ Configuration Files

### 1. `railway.json` (Build Config)

Already included in your repo:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm run build"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### 2. `nixpacks.toml` (Nix Configuration)

Already included:

```toml
[phases.setup]
nixPkgs = ["nodejs-18_x", "postgresql"]

[phases.install]
cmds = ["npm ci"]

[phases.build]
cmds = ["npm run build"]

[start]
cmd = "npm start"
```

### 3. Environment Variables

Railway automatically provides:

- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - Port to listen on (auto-assigned)
- `RAILWAY_ENVIRONMENT` - Environment name
- `RAILWAY_PROJECT_ID` - Project identifier
- `RAILWAY_PUBLIC_DOMAIN` - Your app's domain

---

## 🔒 Environment Variables Checklist

**Required Variables:**
- ✅ `DATABASE_URL` - Auto-set by Railway Postgres
- ✅ `PORT` - Auto-set by Railway
- ⚠️ `OPENAI_API_KEY` - YOU MUST SET
- ⚠️ `ANTHROPIC_API_KEY` - YOU MUST SET
- ⚠️ `SESSION_SECRET` - YOU MUST SET

**Optional Variables:**
- `NODE_ENV` - Set to `production`
- `ENABLE_AI_COACH` - Default: `true`
- `ENABLE_SHOP_SYSTEM` - Default: `true`
- `MAX_FILE_SIZE` - Default: `10485760` (10MB)

### Generate Secure Session Secret

```bash
# macOS/Linux
openssl rand -base64 32

# Or Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Or online
# https://generate-secret.vercel.app/32
```

---

## 🌐 Custom Domain Setup

### Add Custom Domain

1. **In Railway Dashboard:**
   - Go to your service
   - Click **"Settings"** → **"Domains"**
   - Click **"Custom Domain"**
   - Enter your domain: `goalquest.com`

2. **Configure DNS:**

   Add these DNS records at your domain provider:

   **For Apex Domain (goalquest.com):**
   ```
   Type: CNAME
   Name: @
   Value: your-app.up.railway.app
   TTL: 3600
   ```

   **For Subdomain (www.goalquest.com):**
   ```
   Type: CNAME
   Name: www
   Value: your-app.up.railway.app
   TTL: 3600
   ```

3. **SSL Certificate:**
   - Railway automatically provisions SSL/TLS
   - Wait 5-10 minutes for DNS propagation
   - Certificate auto-renews

---

## 📊 Monitoring & Logs

### View Logs

```bash
# CLI - Follow logs in real-time
railway logs --follow

# Filter by service
railway logs --service goal-quest

# In Dashboard
# Click on your service → "Observability" tab
```

### Metrics

Railway provides:
- CPU usage
- Memory usage
- Network traffic
- Request count
- Error rate

Access in: **Service → "Metrics"** tab

### Alerts

Set up alerts for:
- High error rate
- Memory usage > 80%
- Deployment failures

In: **Settings → "Notifications"**

---

## 🔄 Deployment Workflow

### Automatic Deployments

Every push to `main` branch triggers:

1. **Build Phase**
   ```
   npm ci
   npm run build
   ```

2. **Database Migration** (if needed)
   ```
   npm run db:push
   ```

3. **Deploy**
   ```
   npm start
   ```

4. **Health Check**
   - Railway pings your app
   - Verifies it's responding

### Manual Deployment

```bash
# Deploy current code
railway up

# Deploy specific branch
railway up --branch staging

# Rollback to previous deployment
railway rollback
```

---

## 🐛 Troubleshooting

### Build Fails

**Problem:** `npm install` fails
```bash
# Solution: Clear build cache
railway run --rm npm cache clean --force
railway deploy
```

**Problem:** TypeScript errors
```bash
# Solution: Check locally first
npm run type-check
npm run lint
```

### Database Connection Issues

**Problem:** `DATABASE_URL` not found
```bash
# Solution: Verify PostgreSQL is connected
railway variables get DATABASE_URL

# If empty, reconnect database
railway add --database postgres
```

**Problem:** Migration fails
```bash
# Solution: Run migration manually
railway run npm run db:push

# Or reset database (⚠️ DELETES ALL DATA)
railway run npx drizzle-kit drop
railway run npm run db:push
```

### App Not Starting

**Problem:** Port binding error
```bash
# Solution: Ensure using Railway's PORT variable
# Already configured in server/index.ts:
# const port = parseInt(process.env.PORT || "5000", 10);
```

**Problem:** Missing environment variables
```bash
# Solution: List all variables
railway variables

# Check for missing required vars
railway variables set OPENAI_API_KEY=your-key
```

### 502 Bad Gateway

**Problem:** App crashed on startup
```bash
# Solution: Check logs
railway logs --tail 100

# Common causes:
# 1. Missing env variables
# 2. Database connection failed
# 3. Syntax error in code
```

---

## 💰 Pricing & Resource Limits

### Free Trial

Railway provides **$5 free credit** monthly:
- ~500 hours of hobby tier
- PostgreSQL included
- 1GB RAM per service
- Perfect for development

### Usage Calculator

Your Goal Quest app will use approximately:

```
Service (Backend):     $5-10/month
PostgreSQL:           $5-10/month
Total:                $10-20/month (estimated)
```

### Monitor Usage

```bash
# Check credit usage
railway billing

# In Dashboard: Account → Billing
```

---

## 📈 Scaling

### Vertical Scaling (More Power)

1. Go to **Settings → Resources**
2. Adjust:
   - Memory: 512MB → 8GB
   - CPU: Shared → Dedicated
   - Replicas: 1 → Multiple

### Horizontal Scaling (More Instances)

```bash
# Scale to 3 replicas
railway scale --replicas 3
```

### Database Scaling

PostgreSQL automatically scales storage.

For high traffic:
- Upgrade to Railway Pro plan
- Enable connection pooling
- Add read replicas

---

## 🔐 Security Best Practices

### Environment Variables

```bash
# Never commit these to Git!
✅ Set in Railway dashboard
✅ Use Railway CLI: railway variables set
❌ Never hardcode in source code
❌ Don't commit .env files
```

### SSL/TLS

- ✅ Auto-enabled for all Railway domains
- ✅ Free certificate renewal
- ✅ HTTPS enforced

### API Keys

```bash
# Rotate keys periodically
railway variables set OPENAI_API_KEY=new-key
railway variables set ANTHROPIC_API_KEY=new-key
```

---

## 🎯 Post-Deployment Checklist

After deploying, verify:

- [ ] App is accessible at Railway URL
- [ ] Database connection works
- [ ] Can create account/login
- [ ] Can create habits
- [ ] Can complete habits and earn XP
- [ ] Achievement system works
- [ ] Shop system loads
- [ ] AI Coach responds
- [ ] File uploads work
- [ ] Custom domain (if set up)
- [ ] SSL certificate active
- [ ] Logs show no errors

### Test Endpoints

```bash
# Health check
curl https://your-app.up.railway.app/api/health

# Create test habit (requires auth)
curl -X POST https://your-app.up.railway.app/api/habits \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Habit", "frequency": "daily"}'
```

---

## 📞 Support Resources

- **Railway Docs**: https://docs.railway.app
- **Railway Discord**: https://discord.gg/railway
- **Goal Quest Issues**: https://github.com/YOUR_USERNAME/goal-quest/issues
- **Railway CLI Docs**: https://docs.railway.app/develop/cli

---

## 🚀 Advanced: Railway Templates

Create a one-click deploy template:

1. Add `railway.json` to repo (already included)
2. Create a Railway template:
   - Go to your Railway project
   - Click **"Settings"** → **"Create Template"**
   - Configure required variables
   - Get shareable link

Share this link for one-click deploys! 🎉

---

**Need help? Join our Discord or open a GitHub issue!**

Railway deployment should take **less than 5 minutes** from GitHub to production. 🚂✨
