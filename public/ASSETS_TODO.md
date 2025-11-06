# Assets To Generate

This file tracks assets that need to be generated using online tools or downloaded.

## Fonts (Self-Hosted)

Download from Google Fonts and place in `public/fonts/`:

### DM Sans
- URL: https://fonts.google.com/specimen/DM+Sans
- Weights needed: 400 (Regular), 500 (Medium), 700 (Bold)
- Format: woff2
- Files:
  - `dm-sans-v13-latin-regular.woff2`
  - `dm-sans-v13-latin-500.woff2`
  - `dm-sans-v13-latin-700.woff2`

### Inter
- URL: https://fonts.google.com/specimen/Inter
- Weights needed: 400 (Regular), 500 (Medium), 600 (Semi-Bold)
- Format: woff2
- Files:
  - `inter-v13-latin-regular.woff2`
  - `inter-v13-latin-500.woff2`
  - `inter-v13-latin-600.woff2`

**Download Instructions:**
1. Visit Google Fonts link
2. Select font weights
3. Click "Download family"
4. Extract woff2 files from the zip
5. Place in `public/fonts/` directory

## Favicon & PWA Icons

Use https://realfavicongenerator.net/ or https://favicon.io/

### favicon.ico
- Size: 32x32px
- Design: White letter "A" on terracotta (#D4745E) background
- Place in: `public/favicon.ico`

### apple-touch-icon.png
- Size: 180x180px
- Design: White letter "A" on terracotta background
- Place in: `public/apple-touch-icon.png`

### PWA Icons
- icon-192.png (192x192px)
- icon-512.png (512x512px)
- Design: White letter "A" on terracotta background
- Place in: `public/icon-192.png` and `public/icon-512.png`

### Open Graph Image
- Size: 1200x630px
- Design:
  - Warm gradient background (#FAF8F5 to #F5F1EB)
  - "Amara.day" text centered in DM Sans Bold (terracotta #D4745E)
  - Tagline: "Mindful habits. Lasting change." below in smaller text
- File size: < 300KB
- Place in: `public/og-image.png`

**Generation Tool:** Use Canva, Figma, or https://www.opengraph.xyz/

## Status

- ✅ favicon.svg (placeholder created)
- ⏳ favicon.ico (needs generation)
- ⏳ apple-touch-icon.png (needs generation)
- ⏳ icon-192.png (needs generation)
- ⏳ icon-512.png (needs generation)
- ⏳ og-image.png (needs generation)
- ⏳ DM Sans fonts (needs download)
- ⏳ Inter fonts (needs download)

## Quick Start Command

After downloading fonts:
```bash
# Verify fonts are in place
ls -l public/fonts/

# Should show:
# dm-sans-v13-latin-regular.woff2
# dm-sans-v13-latin-500.woff2
# dm-sans-v13-latin-700.woff2
# inter-v13-latin-regular.woff2
# inter-v13-latin-500.woff2
# inter-v13-latin-600.woff2
```

After generating icons:
```bash
# Verify icons are in place
ls -l public/*.{png,ico}

# Should show:
# apple-touch-icon.png
# favicon.ico
# icon-192.png
# icon-512.png
# og-image.png
```
