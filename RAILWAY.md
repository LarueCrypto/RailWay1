# 🚂 Deploy to Railway

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/goal-quest)

## One-Click Deployment

Click the button above to deploy Goal Quest to Railway instantly!

This will:
1. ✅ Clone the repository
2. ✅ Create a new Railway project
3. ✅ Set up PostgreSQL database automatically
4. ✅ Deploy the application
5. ✅ Provide a public URL

### After Deployment

You'll need to set these environment variables in Railway:

1. Go to your Railway project
2. Click on **"Variables"**
3. Add:
   - `OPENAI_API_KEY` - Your OpenAI API key
   - `ANTHROPIC_API_KEY` - Your Anthropic Claude API key
   - `SESSION_SECRET` - Generate with: `openssl rand -base64 32`

### Get API Keys

**OpenAI:**
- Sign up at https://platform.openai.com
- Go to API Keys → Create new key
- Copy and paste into Railway

**Anthropic:**
- Sign up at https://console.anthropic.com
- Go to API Keys → Create new key
- Copy and paste into Railway

---

## Manual Deployment

### Option 1: From GitHub

```bash
# 1. Push your code to GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/goal-quest.git
git push -u origin main

# 2. Go to railway.app
# 3. Click "New Project" → "Deploy from GitHub"
# 4. Select your repository
# 5. Add PostgreSQL database
# 6. Set environment variables
```

### Option 2: Using Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Add PostgreSQL
railway add --database postgres

# Set environment variables
railway variables set OPENAI_API_KEY=your-key
railway variables set ANTHROPIC_API_KEY=your-key
railway variables set SESSION_SECRET=$(openssl rand -base64 32)

# Deploy
railway up
```

---

## Database Setup

Railway automatically creates and connects PostgreSQL. The database migrations run automatically on deployment.

### Manual Migration

```bash
railway run npm run db:push
```

### Access Database

```bash
railway run npm run db:studio
```

---

## Environment Variables

### Required

| Variable | Description | How to Get |
|----------|-------------|------------|
| `DATABASE_URL` | PostgreSQL connection | Auto-set by Railway |
| `PORT` | Server port | Auto-set by Railway |
| `OPENAI_API_KEY` | OpenAI API access | https://platform.openai.com |
| `ANTHROPIC_API_KEY` | Claude AI access | https://console.anthropic.com |
| `SESSION_SECRET` | Secure session key | `openssl rand -base64 32` |

### Optional

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | production | Environment mode |
| `ENABLE_AI_COACH` | true | Enable AI coaching |
| `ENABLE_SHOP_SYSTEM` | true | Enable shop features |
| `MAX_FILE_SIZE` | 10485760 | Max upload size (10MB) |

---

## Monitoring

### View Logs

```bash
# Real-time logs
railway logs --follow

# Last 100 lines
railway logs --tail 100
```

### Metrics

Railway dashboard provides:
- CPU & Memory usage
- Network traffic
- Request metrics
- Error tracking

---

## Custom Domain

1. In Railway dashboard → Settings → Domains
2. Click "Custom Domain"
3. Enter your domain
4. Add CNAME record at your DNS provider:
   ```
   Type: CNAME
   Name: @ (or www)
   Value: your-app.up.railway.app
   ```

SSL certificate is automatic! 🔒

---

## Troubleshooting

### Build Fails

```bash
# Clear cache and rebuild
railway run npm cache clean --force
railway up
```

### Database Connection Error

```bash
# Verify database is connected
railway variables get DATABASE_URL

# Reconnect if needed
railway add --database postgres
```

### App Won't Start

```bash
# Check logs
railway logs --tail 50

# Verify all environment variables are set
railway variables
```

---

## Cost Estimation

Railway offers **$5 free credit monthly**:

**Typical Usage:**
- Backend service: ~$5-10/month
- PostgreSQL: ~$5-10/month
- **Total: ~$10-20/month**

Monitor usage: `railway billing`

---

## Support

- 📚 [Full Deployment Guide](./docs/RAILWAY-DEPLOY.md)
- 💬 [Railway Discord](https://discord.gg/railway)
- 🐛 [Report Issues](https://github.com/YOUR_USERNAME/goal-quest/issues)
- 📖 [Railway Docs](https://docs.railway.app)

---

**Deploy in under 5 minutes! 🚂✨**
