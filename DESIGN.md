---
name: Froggy Sticky Notes
colors:
  surface: '#f4fbf4'
  surface-dim: '#d5dcd5'
  surface-bright: '#f4fbf4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eef5ee'
  surface-container: '#e9f0e9'
  surface-container-high: '#e3eae3'
  surface-container-highest: '#dde4de'
  on-surface: '#161d19'
  on-surface-variant: '#40493d'
  inverse-surface: '#2b322e'
  inverse-on-surface: '#ecf3ec'
  outline: '#707a6c'
  outline-variant: '#bfcaba'
  surface-tint: '#1b6d24'
  primary: '#0d631b'
  on-primary: '#ffffff'
  primary-container: '#2e7d32'
  on-primary-container: '#cbffc2'
  inverse-primary: '#88d982'
  secondary: '#286b33'
  on-secondary: '#ffffff'
  secondary-container: '#abf4ac'
  on-secondary-container: '#2e7238'
  tertiary: '#666018'
  on-tertiary: '#ffffff'
  tertiary-container: '#b6ad5d'
  on-tertiary-container: '#464000'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#a3f69c'
  primary-fixed-dim: '#88d982'
  on-primary-fixed: '#002204'
  on-primary-fixed-variant: '#005312'
  secondary-fixed: '#abf4ac'
  secondary-fixed-dim: '#90d792'
  on-secondary-fixed: '#002107'
  on-secondary-fixed-variant: '#07521d'
  tertiary-fixed: '#efe58f'
  tertiary-fixed-dim: '#d2c976'
  on-tertiary-fixed: '#1f1c00'
  on-tertiary-fixed-variant: '#4e4800'
  background: '#f4fbf4'
  on-background: '#161d19'
  surface-variant: '#dde4de'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  title-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Nunito Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Nunito Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Nunito Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Nunito Sans
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Nunito Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
  label-sm:
    fontFamily: Nunito Sans
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.25rem
  gutter-mobile: 0.75rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style
This design system pairs the systematic discipline of Google Material Design 3 with a whimsical, stationery-inspired desk atmosphere. Designed for playful productivity and approachable task management, it turns mundane daily checklists into a tactile corkboard of colorful sticky notes watched over by friendly amphibian motifs.

The design movement mixes **Modern Material 3** (tonal surfaces, standard interaction states, elevated floating action buttons) with **Subtle Skeuomorphic Stationery accents** (washi-tape strips, soft angled card tilts between -1.5° and +1.5°, and authentic pastel sticky note hues). The emotional resonance is gentle, encouraging, and organized—free of cold corporate rigidity and focused on low-stress, cheerful task completion.

## Colors
The color architecture adheres strictly to Material Design 3 dynamic tonal logic, rooted in natural frog greens and warm stationery pastels:

- **Primary (`#2E7D32`)**: Fresh deep leaf green used for prominent brand moments, primary FABs, active toggle states, and key call-to-actions.
- **Secondary (`#81C784`)**: Soft meadow green used for tonal containers, secondary actions, active chip fills, and subtle focus borders.
- **Tertiary (`#FFF59D`)**: Classic sticky-note canary yellow used for badges, highlight stickers, pin accents, and urgent reminders.
- **Neutral Canvas (`#F4FBF4`)**: Mint-tinged light surface background that softens pure display white and evokes morning dew on lily pads.

### Sticky Note Palette Accents
Individual sticky note cards adopt dedicated pastel surface tokens with complementary border shades:
- **Sticky Yellow**: Surface `#FFFDE7`, Container `#FFF9C4`, Outline `#FFF59D`
- **Pastel Pink**: Surface `#FDF2F4`, Container `#FCE4EC`, Outline `#F8BBD0`
- **Mint Green**: Surface `#F1F8E9`, Container `#E8F5E9`, Outline `#C8E6C9`
- **Sky Blue**: Surface `#F0F9FF`, Container `#E1F5FE`, Outline `#B3E5FC`

## Typography
The typographic identity balances structured clarity with organic, friendly rhythm. **Plus Jakarta Sans** provides sturdy, wide, modern geometry with soft terminals for all headings, giving the UI an optimistic presence. **Nunito Sans** serves as the body and functional label face, offering open counters, rounded curves, and effortless legibility when rendering handwriting-style reminders or dense checklists.

All text layers maintain strict minimum contrast against their respective pastel sticky surfaces; body text relies on dark slate green (`#1B381E`) instead of harsh pure black to preserve the organic atmosphere.

## Layout & Spacing
The layout follows a responsive adaptive board system that mimics physical post-it boards:

- **Desktop (1024px+)**: 12-column masonry or flexible auto-fit grid (`minmax(280px, 1fr)`) with `2rem` outer padding and `1.25rem` gutters. Sticky notes arrange organically with alternate gentle rotational offsets.
- **Tablet (600px - 1023px)**: 8-column layout with `1.5rem` canvas margins and `1rem` component spacing.
- **Mobile (< 600px)**: Single column stream with `1rem` edge margin and `0.75rem` vertical gap between post-it cards.

Internal component rhythm follows a 4px/8px standard base unit. Input pads and composer drawers utilize generous internal padding (`space-md` to `space-lg`) to preserve the airy feel of spacious blank stationery.

## Elevation & Depth
Depth adheres to Material 3 elevation tiers with customized ambient green-tinged drop shadows to make pastel papers lift off the background:

- **Level 0 (Flat Canvas)**: No shadow. Flat surface background `#F4FBF4`.
- **Level 1 (Resting Sticky Card)**: `0px 2px 6px -1px rgba(30, 70, 32, 0.08), 0px 1px 4px -1px rgba(0, 0, 0, 0.04)`. Imparts a delicate paper lift.
- **Level 2 (Hover / Active Chip)**: `0px 6px 14px -2px rgba(30, 70, 32, 0.12), 0px 3px 6px -2px rgba(0, 0, 0, 0.06)`. Accompanied by a subtle `-1px` vertical lift transform.
- **Level 3 (Modal / Floating Composer / FAB)**: `0px 12px 24px -4px rgba(30, 70, 32, 0.16), 0px 4px 8px -2px rgba(0, 0, 0, 0.06)`. Used for the frog FAB and note creation drawer.
- **Stationery Detail (Washi Tape)**: Centered top tape graphic rendered with semi-transparent tinted overlay (`rgba(255, 255, 255, 0.65)` with a faint `0.5px` border) resting at Level 1 atop cards.

## Shapes
A roundedness level of `2` provides standard base radii of `0.5rem` (8px), scaling up to `1rem` (16px, `rounded-lg`) and `1.5rem` (24px, `rounded-xl`) for main stationery cards and container sheets.

- **Sticky Note Cards**: `rounded-xl` (24px) for cozy, playful corners mimicking modern rounded memo paper.
- **Form Inputs & Search**: `rounded-lg` (16px) with soft, organic contours.
- **Chips & Filter Pills**: Full pill geometry (`rounded-full`) for high-touch tap targets.
- **Floating Action Buttons**: `rounded-2xl` (28px) conforming to standard Material 3 elevated action patterns.

## Components

### Sticky Note Cards
- **Structure**: Rendered with subtle organic rotations (alternating `rotate(-1deg)` and `rotate(1deg)` using `:nth-child(even)` rules).
- **Surface**: Colored according to chosen pastel tone with matching 1px semi-opaque border (`border-opacity-30`).
- **Header**: Includes category badge, optional washi tape decoration strip, and frog icon completion indicator.
- **Interactivity**: Checkbox interaction scratches through text with a bouncy spring animation. Hovering lifts the note slightly with an augmented shadow.

### Buttons & Floating Action Button (FAB)
- **Primary FAB**: Material 3 large FAB with deep frog leaf green (`#2E7D32`) background, crisp white label/icon, and Level 3 elevation.
- **Standard Buttons**: Filled primary buttons feature `12px` vertical and `24px` horizontal padding with `rounded-lg` contours.
- **Tonal / Text Buttons**: Mint-tinted transparent backdrops with primary green text and ripple feedback.

### Category Filter Chips
- **Resting**: Light pastel surface with a fine border (`#C8E6C9`), typography set to `label-md`.
- **Selected**: Solid secondary green fill (`#81C784`) or deep green (`#2E7D32`) with inverted white text and a frog checkmark prefix icon.

### Form Inputs & Composer Sheet
- **Input Fields**: Soft fill (`#FFFFFF`) with 1.5px outline in `#C8E6C9`, transitioning smoothly to `#2E7D32` on focus with no harsh black rings.
- **Placeholder**: Warm slate tone (`#68826B`) adopting a friendly, conversational tone (e.g., "여기 메모하라개굴~").

### Frog Badge & Status Indicators
- Circular or squircle mini-containers (`28px x 28px`) hosting frog face vector badges indicating task urgency, completed state, or folder tag classification.