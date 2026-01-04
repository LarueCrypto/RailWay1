# Deployment Guide

This guide covers deploying Goal Quest to various platforms.

## 📋 Prerequisites

- Node.js 18+ and npm 9+
- PostgreSQL database
- Environment variables configured
- Domain name (optional, for production)

## 🚀 Platform-Specific Guides

### 1. Vercel (Recommended for Frontend)

#### Setup

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel
```

#### Configuration

Create `vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "server/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "/client/dist/$1"
    }
  ],
  "env": {
    "DATABASE_URL": "@database-url",
    "OPENAI_API_KEY": "@openai-api-key",
    "ANTHROPIC_API_KEY": "@anthropic-api-key"
  }
}
```

#### Environment Variables

Add in Vercel dashboard:
- `DATABASE_URL`
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `SESSION_SECRET`

### 2. Railway

#### Setup

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy
railway up
```

#### Database

Railway provides PostgreSQL automatically:

```bash
# Add PostgreSQL service
railway add -d postgres

# Link to your app
railway link
```

### 3. Render

#### Setup

1. Connect your GitHub repository
2. Create a new Web Service
3. Configure build command: `npm run build`
4. Configure start command: `npm start`

#### Database

1. Create PostgreSQL database
2. Copy connection string
3. Add to environment variables

### 4. Heroku

#### Setup

```bash
# Install Heroku CLI
brew install heroku/brew/heroku

# Login
heroku login

# Create app
heroku create goal-quest-app

# Add PostgreSQL
heroku addons:create heroku-postgresql:mini

# Deploy
git push heroku main
```

#### Configuration

```bash
# Set environment variables
heroku config:set OPENAI_API_KEY=your_key
heroku config:set ANTHROPIC_API_KEY=your_key
heroku config:set SESSION_SECRET=your_secret
```

### 5. Docker Deployment

#### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]
```

#### Docker Compose

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/goalquest
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - SESSION_SECRET=${SESSION_SECRET}
    depends_on:
      - db

  db:
    image: postgres:14-alpine
    environment:
      - POSTGRES_DB=goalquest
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

#### Deploy

```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

## 🗄️ Database Setup

### PostgreSQL

#### Local Setup

```bash
# Install PostgreSQL
# macOS
brew install postgresql

# Ubuntu
sudo apt-get install postgresql

# Start service
# macOS
brew services start postgresql

# Ubuntu
sudo service postgresql start
```

#### Create Database

```sql
CREATE DATABASE goalquest;
CREATE USER goalquest_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE goalquest TO goalquest_user;
```

#### Run Migrations

```bash
# Push schema
npm run db:push

# Or use Drizzle Studio
npm run db:studio
```

### Managed Databases

#### Neon (Recommended)

1. Sign up at [neon.tech](https://neon.tech)
2. Create new project
3. Copy connection string
4. Add to `.env` as `DATABASE_URL`

#### Supabase

1. Sign up at [supabase.com](https://supabase.com)
2. Create new project
3. Get connection string from Settings → Database
4. Add to `.env` as `DATABASE_URL`

## 🔒 Security Checklist

### Production Setup

- [ ] Set `NODE_ENV=production`
- [ ] Use strong `SESSION_SECRET`
- [ ] Enable HTTPS
- [ ] Set up CORS properly
- [ ] Use environment variables for all secrets
- [ ] Enable rate limiting
- [ ] Set up monitoring
- [ ] Configure backups
- [ ] Use secure headers
- [ ] Validate all inputs

### Environment Variables

Never commit these to Git:
- `DATABASE_URL`
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `SESSION_SECRET`

### Security Headers

Add to your server:

```typescript
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000');
  next();
});
```

## 📊 Monitoring

### Recommended Tools

- **Sentry** - Error tracking
- **LogRocket** - Session replay
- **Datadog** - APM
- **Uptimerobot** - Uptime monitoring

### Setup Sentry

```bash
npm install @sentry/node @sentry/react
```

```typescript
// server/index.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

## 🚦 CI/CD

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Build
        run: npm run build
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 🔄 Backup Strategy

### Database Backups

```bash
# Automated daily backups
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Upload to S3
aws s3 cp backup-$(date +%Y%m%d).sql s3://your-bucket/backups/
```

### File Uploads

Configure automatic backups for:
- User-uploaded documents
- Philosophy library files
- Character avatars

## 📈 Performance Optimization

### Build Optimization

```bash
# Production build
NODE_ENV=production npm run build

# Analyze bundle
npm run build -- --report
```

### Caching

- Enable CDN for static assets
- Use Redis for session storage
- Implement API response caching
- Enable browser caching headers

### Database

- Add indexes for frequently queried fields
- Use connection pooling
- Enable query caching
- Regular VACUUM and ANALYZE

## 🔧 Troubleshooting

### Common Issues

**Database Connection Failed**
```bash
# Check connection string
psql $DATABASE_URL

# Verify SSL mode
DATABASE_URL="postgresql://...?sslmode=require"
```

**Build Errors**
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Check Node version
node --version
npm --version
```

**Port Already in Use**
```bash
# Find process
lsof -i :5000

# Kill process
kill -9 <PID>
```

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/goal-quest/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/goal-quest/discussions)
- **Email**: support@goalquest.app

---

**Need help? Check our [FAQ](./FAQ.md) or join our [Discord community](#)!**
