# Figma SVG Asset Guide

This guide explains how to use the SVG assets from Goal Quest in Figma for design work.

## 📁 Asset Organization

```
assets/svg/
├── characters/        # Character evolution sprites
│   ├── beginner.svg
│   ├── warrior.svg
│   ├── elite.svg
│   ├── master.svg
│   ├── monarch.svg
│   └── shadow-monarch.svg
├── icons/            # UI icons and badges
│   ├── achievement-badges.svg
│   ├── stat-icons.svg
│   └── menu-icons.svg
└── ui/               # UI components
    ├── xp-bar.svg
    ├── level-badge.svg
    └── progress-ring.svg
```

## 🎨 Importing SVGs to Figma

### Method 1: Direct Import

1. Open Figma
2. Go to **File → Import**
3. Select the SVG file(s)
4. Click **Open**

### Method 2: Copy-Paste

1. Open the SVG file in a text editor
2. Copy the entire SVG code
3. In Figma, go to an empty area
4. Press `Cmd+Shift+V` (Mac) or `Ctrl+Shift+V` (Windows)
5. Paste the SVG code

### Method 3: Drag-and-Drop

1. Simply drag the SVG file from your file browser
2. Drop it onto your Figma canvas

## 🔧 Working with SVG Layers

Once imported, SVGs are organized into Figma layers matching the SVG structure:

### Character SVGs
```
Shadow Monarch
├── Aura Background (circle)
├── Character Group
│   ├── Crown
│   ├── Head
│   ├── Eyes (group)
│   ├── Torso
│   ├── Arms (group)
│   ├── Legs (group)
│   └── Weapons (group)
├── Level Badge
└── Stats
```

### UI Component SVGs
```
XP Bar
├── Background Container
├── Fill Progress
├── Shine Effect
├── Level Badge
└── XP Text
```

## 🎯 Editing SVG Assets

### Changing Colors

1. **Select the layer** you want to recolor
2. In the **Fill** section, click the color square
3. Choose your new color
4. The gradient IDs are preserved for easy editing

### Modifying Gradients

Our SVGs use named gradients for easy customization:

- `shadowGlow` - Purple gradient for Shadow Monarch
- `beginnerGlow` - Gray gradient for Beginner
- `xpBarFill` - Purple animated gradient for XP bars
- `monarchAura` - Radial gradient for aura effects

To edit:
1. Select layer using the gradient
2. Click **Fill** → **Linear/Radial gradient**
3. Adjust color stops

### Resizing SVGs

1. **Select the SVG group**
2. Press `K` for Scale tool
3. Hold `Shift` to maintain aspect ratio
4. Drag to resize

## 📐 Design Specifications

### Character Dimensions
- **Canvas**: 400x600px
- **Character Height**: ~450px
- **Head Size**: 80-90px diameter
- **Level Badge**: 60-70px diameter

### UI Component Dimensions
- **XP Bar**: 600x80px
- **Achievement Badge**: 160px diameter
- **Stat Icons**: 24x24px

## 🎨 Color Palette

### Primary Colors
```
Purple Primary:   #8B5CF6
Purple Light:     #A78BFA
Purple Dark:      #6D28D9
Purple Darkest:   #4C1D95
```

### Accent Colors
```
Gold:            #FFD700
Gold Dark:       #F59E0B
Orange:          #FFA500
```

### Neutral Colors
```
Gray 900:        #1F2937
Gray 800:        #2D3748
Gray 700:        #374151
Gray 600:        #4B5563
Gray 500:        #6B7280
Gray 400:        #9CA3AF
Gray 300:        #D1D5DB
Gray 200:        #E5E7EB
Gray 100:        #F3F4F6
```

### Rarity Colors
```
Common:          #9CA3AF (Gray)
Rare:            #60A5FA (Blue)
Epic:            #A78BFA (Purple)
Legendary:       #FBBF24 (Gold)
```

## ✨ Effects and Filters

### Glow Effects

Our SVGs use `<filter>` elements for glow effects:

```svg
<filter id="shadowGlow">
  <feGaussianBlur stdDeviation="5"/>
  <feMerge>
    <feMergeNode in="coloredBlur"/>
    <feMergeNode in="SourceGraphic"/>
  </feMerge>
</filter>
```

In Figma, these appear as:
- **Layer Blur**: Gaussian Blur effect
- **Effects**: Combined with the original layer

To adjust:
1. Select the layer
2. In **Effects** panel
3. Adjust blur radius

### Creating New Glows

1. Select your layer
2. **Effects** → **+** → **Layer Blur**
3. Set blur amount (2-5px typical)
4. Adjust opacity for intensity

## 🔄 Creating Variations

### Character Color Variants

To create different character themes:

1. **Duplicate the character group**
2. Select all colored layers
3. **Edit → Select Layers → Same Fill Color**
4. Apply new color scheme

### Achievement Badge Variants

Create custom rarities:

1. Duplicate existing badge
2. Change gradient fills
3. Adjust glow intensity
4. Update text label

## 📦 Exporting from Figma

### For Web Use

1. Select layer(s)
2. **Export** panel
3. Format: **SVG**
4. Settings:
   - ✅ Include "id" attribute
   - ✅ Outline text
   - ✅ Simplify stroke
5. Click **Export**

### For Development

Export settings for optimal code:
```
Format: SVG
Suffix: @1x
Include: id attribute
Outline text: Yes
Simplify stroke: Yes
```

## 🎯 Component Best Practices

### Creating Figma Components

1. **Select your SVG group**
2. `Cmd+Opt+K` (Mac) or `Ctrl+Alt+K` (Windows)
3. Name it descriptively: "Character/Shadow Monarch"
4. Add component description

### Variant Properties

Create variants for states:
- Default
- Hover
- Active
- Disabled

### Auto Layout Integration

For UI components:
1. Wrap SVG in **Auto Layout** frame
2. Set padding: 8-16px
3. Configure spacing for nested elements

## 🔍 Optimization Tips

### Before Import
- Remove unnecessary metadata
- Consolidate similar paths
- Simplify complex shapes

### In Figma
- Use **Simplify Path** on complex shapes
- Flatten similar layers when possible
- Group related elements
- Use components for repeated elements

## 📱 Responsive Design

### Scaling Characters
- Maintain 2:3 aspect ratio (width:height)
- Minimum size: 200x300px
- Maximum size: 800x1200px

### Scaling UI Components
- XP Bar: Min 300px, Max 800px width
- Badges: Keep square (1:1 ratio)
- Icons: 16px, 24px, 32px, 48px

## 🚀 Advanced Techniques

### Animated Components

Create animation-ready assets:
1. Separate layers for animation
2. Name layers clearly
3. Group related animated elements
4. Set pivot points appropriately

### Interactive Prototypes

Link character evolution:
1. Create frames for each rank
2. Add prototype transitions
3. Use "Smart Animate" for smooth transitions

### Design Tokens

Extract colors as styles:
1. **Styles** → **+** → **Color Style**
2. Name: `Primary/Purple/500`
3. Apply to layers

## 📚 Resources

- [Figma SVG Import Guide](https://help.figma.com/hc/en-us/articles/360040028034)
- [SVG Optimization Tools](https://jakearchibald.github.io/svgomg/)
- [Color Palette Generator](https://coolors.co)

## 🤝 Contributing New Assets

When creating new SVG assets:

1. **Follow naming conventions**: `category-name-variant.svg`
2. **Use consistent dimensions**
3. **Include proper viewBox**
4. **Test in Figma** before submitting
5. **Document in this guide**

---

**Happy Designing! 🎨✨**

For questions or contributions, see [CONTRIBUTING.md](../CONTRIBUTING.md)
