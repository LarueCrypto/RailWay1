# ✅ Railway Deployment Checklist

Use this checklist to ensure successful deployment of Goal Quest to Railway.

## 📦 Pre-Deployment

### Repository Setup
- [ ] Code pushed to GitHub
- [ ] All Railway config files present:
  - [ ] `railway.json`
  - [ ] `nixpacks.toml`
  - [ ] `railway.template.json`
  - [ ] `.env.railway` (template only, don't commit secrets)
  - [ ] `scripts/railway-setup.sh`

### API Keys Ready
- [ ] OpenAI API key obtained from https://platform.openai.com
- [ ] Anthropic API key obtained from https://console.anthropic.com
- [ ] Keys tested and valid

## 🚂 Railway Setup

### Choose Your Method

**Option A: One-Click Deploy** ⭐ Easiest
- [ ] Click deploy button in README or RAILWAY.md
- [ ] Wait for Railway to clone and set up
- [ ] Skip to "Configure Environment" section

**Option B: From GitHub**
- [ ] Login to railway.app
- [ ] Click "New Project"
- [ ] Select "Deploy from GitHub repo"
- [ ] Authorize Railway GitHub access
- [ ] Select your repository
- [ ] Wait for initial deployment

**Option C: CLI Deploy**
- [ ] Install Railway CLI: `npm install -g @railway/cli`
- [ ] Run setup script: `./scripts/railway-setup.sh`
- [ ] Or manual: `railway init` → `railway add --database postgres` → `railway up`

## ⚙️ Configure Environment

### Required Variables
- [ ] `OPENAI_API_KEY` - Set in Variables tab
- [ ] `ANTHROPIC_API_KEY` - Set in Variables tab
- [ ] `SESSION_SECRET` - Generate with `openssl rand -base64 32`

### Auto-Set Variables (Verify Present)
- [ ] `DATABASE_URL` - From PostgreSQL service
- [ ] `PORT` - From Railway
- [ ] `NODE_ENV` - Should be "production"

### Optional Variables (Recommended)
- [ ] `ENABLE_AI_COACH=true`
- [ ] `ENABLE_SHOP_SYSTEM=true`
- [ ] `ENABLE_ACHIEVEMENTS=true`
- [ ] `LOG_LEVEL=info`

## 🗄️ Database

### PostgreSQL Setup
- [ ] PostgreSQL service added (auto or manual)
- [ ] `DATABASE_URL` variable populated
- [ ] Migrations ran successfully (check logs)

### Verify Database
```bash
railway run npm run db:studio
# Or check logs for successful migration messages
```

## 🚀 Deployment

### Build & Deploy
- [ ] Deployment triggered (auto or `railway up`)
- [ ] Build completed without errors
- [ ] App started successfully
- [ ] Health check passing

### Monitor Deployment
```bash
# Watch logs in real-time
railway logs --follow

# Check for errors
railway logs --tail 100 | grep -i error
```

## 🌐 Access & Test

### Get Your URL
- [ ] Railway domain generated
- [ ] Can access: `https://your-app.up.railway.app`
- [ ] SSL certificate active (HTTPS works)

### Functional Testing
- [ ] Homepage loads
- [ ] Can register new account
- [ ] Can login
- [ ] Dashboard displays
- [ ] Can create a habit
- [ ] Can complete habit
- [ ] XP increases
- [ ] Character displays
- [ ] Achievements page loads
- [ ] Shop page loads
- [ ] AI Coach responds
- [ ] No console errors

### API Testing
```bash
# Health check
curl https://your-app.up.railway.app/api/health

# Should return: {"status":"ok",...}
```

## 🔧 Post-Deployment

### Monitoring Setup
- [ ] Check metrics in Railway dashboard
- [ ] Set up alerts (Settings → Notifications)
- [ ] Monitor resource usage
- [ ] Review logs for errors

### Optional Enhancements
- [ ] Add custom domain
- [ ] Set up staging environment
- [ ] Configure auto-deployments from GitHub
- [ ] Add deployment protection
- [ ] Set up external monitoring (Sentry, etc.)

### Documentation
- [ ] Update README with your Railway URL
- [ ] Document any custom configuration
- [ ] Share deploy URL with team/users

## 💰 Cost Management

### Review Usage
- [ ] Check billing dashboard
- [ ] Verify within free $5 credit or budget
- [ ] Set up usage alerts if needed

### Optimize If Needed
- [ ] Right-size resources
- [ ] Review database queries
- [ ] Check for memory leaks
- [ ] Optimize API calls

## 🔐 Security Review

### Environment
- [ ] No secrets in code/repository
- [ ] All sensitive data in Railway variables
- [ ] `.env` files gitignored
- [ ] Session secret is random and secure

### Access
- [ ] HTTPS working
- [ ] Database accessible only from Railway
- [ ] API keys valid and not exposed
- [ ] CORS configured if needed

## 📱 Share & Celebrate

### Go Live
- [ ] Announce deployment
- [ ] Share URL with users
- [ ] Update project status
- [ ] Monitor initial usage

---

## 🆘 Troubleshooting

If anything fails, check:

1. **Build Errors**
   ```bash
   railway logs | grep -i "error\|fail"
   ```

2. **Database Issues**
   ```bash
   railway variables get DATABASE_URL
   railway run npm run db:push
   ```

3. **Missing Variables**
   ```bash
   railway variables
   # Ensure all required vars are set
   ```

4. **App Not Starting**
   ```bash
   railway logs --tail 100
   # Check for startup errors
   ```

## 📞 Get Help

- **Railway Discord**: https://discord.gg/railway
- **Documentation**: https://docs.railway.app
- **GitHub Issues**: Your repo's issues page
- **Railway Docs**: [./RAILWAY-DEPLOY.md](./docs/RAILWAY-DEPLOY.md)

---

## ✨ Success!

Once all items are checked, your Goal Quest app is:
- ✅ Deployed on Railway
- ✅ PostgreSQL database configured
- ✅ SSL/HTTPS enabled
- ✅ Monitoring active
- ✅ Ready for users!

**Deployment Time:** ~5-10 minutes
**Monthly Cost:** ~$10-20 (after free $5 credit)

🎉 Congratulations! Your gamified habit tracker is live! 🎮✨

---

**Next Steps:**
- Share with friends and get feedback
- Monitor usage and performance
- Add features and improvements
- Scale as needed

**Happy tracking!** 🚀
