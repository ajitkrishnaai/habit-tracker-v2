# Favicon and Social Image Assets - TODO

## Current Status
✅ SVG favicon created: `public/favicon.svg` (letter "A" in moss green #6B8E5F)

## Remaining Assets to Create

### 1. Favicon Files (Task 1.6)

**Tool Recommendation**: https://realfavicongenerator.net/ or https://favicon.io/

**Files Needed**:

1. **favicon.ico** (32x32px)
   - Letter "A" in moss green (#6B8E5F)
   - Transparent background
   - Save to: `public/favicon.ico`

2. **apple-touch-icon.png** (180x180px)
   - Letter "A" in moss green (#6B8E5F)
   - Transparent background
   - Save to: `public/apple-touch-icon.png`

3. **icon-192.png** (192x192px)
   - White letter "A"
   - Moss green background (#6B8E5F)
   - Save to: `public/icon-192.png`

4. **icon-512.png** (512x512px)
   - White letter "A"
   - Moss green background (#6B8E5F)
   - Save to: `public/icon-512.png`

**Design Specs**:
- Font: DM Sans Bold (700)
- Primary color: Moss green (#6B8E5F)
- Style: Clean, minimal lettermark

### 2. Social Sharing Image (Task 1.7)

**Tool Recommendation**: https://www.canva.com/ (free templates available)

**File Needed**:
- **og-image.png** (1200x630px)
- Save to: `public/og-image.png`
- Target size: < 300KB

**Design Specs**:
- Background: Warm gradient (stone-0 #FEF9EC to stone-50 #FDF7E5)
- Main text: "Amara.day" in DM Sans Bold, moss-700 color (#567347)
- Tagline: "Mindful habits. Lasting change." (smaller text below)
- Layout: Centered, clean, minimal

**Alternative**: Use existing `public/favicon.svg` as a starting point and expand it in a design tool.

## Quick Steps

### Using RealFaviconGenerator.net:
1. Visit https://realfavicongenerator.net/
2. Upload `public/favicon.svg` or create new with letter "A"
3. Customize colors:
   - iOS/Android: Moss green background (#6B8E5F), white text
   - Desktop: Transparent background, moss green text
4. Generate and download all files
5. Extract to `public/` directory

### Using Canva for OG Image:
1. Visit https://www.canva.com/
2. Create custom size: 1200x630px
3. Add gradient background (warm tones)
4. Add "Amara.day" text in large bold font
5. Add tagline below
6. Download as PNG (optimize for web)
7. Save to `public/og-image.png`

## Verification

After creating the files, verify they exist:
```bash
ls -lh public/*.ico public/*.png public/*.svg
```

Expected files:
- favicon.ico
- favicon.svg ✅ (already created)
- apple-touch-icon.png
- icon-192.png
- icon-512.png
- og-image.png
