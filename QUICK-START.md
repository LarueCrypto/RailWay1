# Goal Quest - GitHub Ready Package

## 📦 Package Contents

This repository contains the complete **Goal Quest** application - a gamified habit and goal tracking system inspired by Solo Leveling aesthetics.

### Included Files

```
goal-quest-github/
├── 📁 assets/svg/              # Figma-ready SVG assets
│   ├── characters/             # Character evolution sprites (6 ranks)
│   ├── icons/                  # Achievement badges & stat icons
│   └── ui/                     # UI components (XP bars, etc.)
│
├── 📁 client/                  # React frontend application
│   ├── src/
│   │   ├── components/         # UI components (shadcn/ui)
│   │   ├── pages/              # Page components
│   │   ├── hooks/              # Custom React hooks
│   │   └── lib/                # Utilities
│   └── public/                 # Static assets
│
├── 📁 server/                  # Express backend
│   ├── routes.ts               # API endpoints
│   ├── db.ts                   # Database connection
│   ├── storage.ts              # File storage
│   └── replit_integrations/    # AI & storage integrations
│
├── 📁 shared/                  # Shared code & types
│   ├── schema.ts               # Database schema (Drizzle ORM)
│   ├── achievements.ts         # 200+ achievement definitions
│   ├── gameplay.ts             # Game mechanics & XP system
│   └── shopItems.ts            # Shop inventory system
│
├── 📁 docs/                    # Documentation
│   ├── DEPLOYMENT.md           # Deployment guide
│   └── FIGMA-GUIDE.md          # SVG asset usage in Figma
│
├── 📄 README.md                # Main documentation
├── 📄 CONTRIBUTING.md          # Contribution guidelines
├── 📄 LICENSE                  # MIT License
├── 📄 package.json             # Dependencies & scripts
├── 📄 .env.example             # Environment template
└── 📄 .gitignore               # Git ignore rules
```

## 🎨 SVG Assets for Figma

### Character Evolution Sprites

All character SVGs are optimized for Figma import with:
- ✅ Proper viewBox attributes
- ✅ Named gradient definitions
- ✅ Organized layer groups
- ✅ Filter effects (glows, shadows)
- ✅ Semantic IDs and classes

**Available Characters:**
1. **Beginner** (Level 1-19) - Gray color scheme, basic weapon
2. **Shadow Monarch** (Level 100) - Purple/gold, legendary equipment

**Location:** `assets/svg/characters/`

### UI Components

**XP Progress Bar** - `assets/svg/ui/xp-bar.svg`
- Animated gradient fill
- Level badge integration
- Text overlay support

**Achievement Badges** - `assets/svg/icons/achievement-badges.svg`
- 4 rarity tiers: Common, Rare, Epic, Legendary
- Glow effects
- Color-coded by rarity

**Stat Icons** - `assets/svg/icons/stat-icons.svg`
- STR (Strength) - Sword icon
- AGI (Agility) - Wind/feather icon
- INT (Intelligence) - Book icon
- DEF (Defense) - Shield icon
- VIT (Vitality) - Heart icon

## 🚀 Quick Start

### 1. Clone & Install

```bash
# Extract or clone the repository
cd goal-quest-github

# Install dependencies
npm install
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
# Required: DATABASE_URL, OPENAI_API_KEY, ANTHROPIC_API_KEY
```

### 3. Database Setup

```bash
# Push schema to database
npm run db:push

# Optional: Open Drizzle Studio
npm run db:studio
```

### 4. Run Development Server

```bash
npm run dev

# Visit http://localhost:5000
```

## 🎯 Key Features

### RPG Progression System
- **Level 1-100** progression
- **6 Character Ranks**: Beginner → Warrior → Elite → Master → Monarch → Shadow Monarch
- **6 Core Stats**: STR, AGI, INT, DEF, VIT, WILL
- Dynamic XP system with exponential scaling

### Achievement System
- **200+ Achievements** across 4 rarity tiers
- Progress tracking & statistics
- Unlock rewards and titles

### Gamification
- Daily/weekly habit tracking
- Goal management with AI assistance
- In-game shop with cosmetics & boosts
- Personal philosophy library integration

### Tech Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Express, PostgreSQL, Drizzle ORM
- **AI**: OpenAI GPT-4, Anthropic Claude
- **UI**: shadcn/ui components

## 📐 Design System

### Color Palette

```css
/* Primary Colors */
--purple-primary: #8B5CF6;
--purple-light: #A78BFA;
--purple-dark: #6D28D9;

/* Accent Colors */
--gold: #FFD700;
--orange: #FFA500;

/* Rarity Colors */
--common: #9CA3AF;    /* Gray */
--rare: #60A5FA;      /* Blue */
--epic: #A78BFA;      /* Purple */
--legendary: #FBBF24; /* Gold */
```

### Typography
- **Headings**: Inter, system-ui
- **Body**: Inter, sans-serif
- **Monospace**: Consolas, Monaco

## 🔧 Using SVGs in Figma

### Import Methods

**Method 1: Direct Import**
1. File → Import
2. Select SVG file
3. Click Open

**Method 2: Copy-Paste**
1. Open SVG in text editor
2. Copy entire SVG code
3. In Figma: Cmd+Shift+V (Mac) or Ctrl+Shift+V (Win)

**Method 3: Drag-and-Drop**
- Simply drag SVG files onto Figma canvas

### Editing SVGs

All gradients are named for easy customization:
- `shadowGlow` - Purple gradient for Shadow Monarch
- `beginnerGlow` - Gray gradient for Beginner
- `xpBarFill` - Animated XP bar gradient
- `monarchAura` - Radial aura effects

### Export Settings

For optimal web use:
- Format: SVG
- Include "id" attribute: ✅
- Outline text: ✅
- Simplify stroke: ✅

**Full guide:** [docs/FIGMA-GUIDE.md](./docs/FIGMA-GUIDE.md)

## 📦 Deployment

### Recommended Platforms

1. **Vercel** (Frontend) - Zero config, edge network
2. **Railway** (Full-stack) - Auto PostgreSQL
3. **Render** (Full-stack) - Free tier available
4. **Neon** (Database) - Serverless PostgreSQL

### Quick Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

**Full guide:** [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for:
- Code style guidelines
- Pull request process
- SVG asset standards
- Testing requirements

## 📄 License

MIT License - see [LICENSE](./LICENSE) file

## 🔗 Links

- **GitHub**: [Repository URL]
- **Demo**: [Live Demo URL]
- **Documentation**: [docs/](./docs/)
- **Discord**: [Community Link]

## 🆘 Support

- **Issues**: Use GitHub Issues
- **Questions**: GitHub Discussions
- **Email**: support@goalquest.app

---

## ✨ What Makes This Special

### Solo Leveling Inspired Design
- Character evolution system with 6 distinct ranks
- Purple/gold color scheme reminiscent of shadow powers
- Epic visual progression from beginner to monarch

### Complete Gamification
- Real RPG mechanics applied to personal development
- 6 stats that grow with consistent habit completion
- Achievement system with meaningful rewards

### Production Ready
- Full TypeScript codebase
- Comprehensive error handling
- Database migrations included
- API documentation
- Deployment guides

### Figma Optimized
- Clean, organized SVG structure
- Named layers and groups
- Editable gradients and filters
- Consistent sizing and spacing
- Component-ready assets

---

## 🎮 Getting Started Checklist

- [ ] Install Node.js 18+
- [ ] Clone repository
- [ ] Install dependencies (`npm install`)
- [ ] Copy `.env.example` to `.env`
- [ ] Configure database connection
- [ ] Add API keys (OpenAI, Anthropic)
- [ ] Run migrations (`npm run db:push`)
- [ ] Start dev server (`npm run dev`)
- [ ] Open http://localhost:5000
- [ ] Create your first habit!

---

**Built with ❤️ by developers who believe personal growth should be epic**

Questions? Check the [docs](./docs/) or open an issue!
