# CashHeros Color Scheme

This document outlines the color scheme implementation for the CashHeros application.

## Color Variables

The color variables are defined in `src/styles/colors.css`:

```css
:root {
  --primary-green: #22C55E;        /* Main buttons, highlights, tags */
  --green-hover: #16A34A;          /* Hover for green buttons */
  --header-footer-bg: #34D399;     /* Brighter, friendly header/footer background */
  --text-on-header: #0F172A;       /* Dark text on green background */
  --neutral-bg: #F8FAFC;           /* Light page background */
  --card-bg: #FFFFFF;              /* Card/module background */
  --border-color: #E5E7EB;         /* Borders, dividers */
  --text-main: #0F172A;            /* Headings, main text */
  --text-secondary: #64748B;       /* Paragraphs, subtext */
  --accent-blue: #3B82F6;          /* Optional highlight color for tabs/info */
  --error-red: #EF4444;            /* "Sale" or error indicators */
  --sale-orange: #F97316;          /* Limited-time offers, urgent promos */
}
```

## Theme Implementation

The theme is implemented across several CSS files:

1. `src/styles/colors.css` - Base color variables
2. `src/styles/theme.css` - Theme variables and dark mode support
3. `src/styles/cashheros-theme.css` - Component-specific styling

## Component Styling

### Header
- Background: var(--header-footer-bg)
- Logo/Links/Text: var(--text-on-header)
- Hover: Add underline or font-weight: 600
- Login/Signup Button: var(--primary-green) with white text

### Footer
- Background: var(--header-footer-bg)
- Text/Links: #0F172A or #1E293B
- Icons: White or muted gray (#CBD5E1)

### Buttons (CTA, Shop Now, Sign Up)
```css
background-color: var(--primary-green);
color: white;
border-radius: 8px;
font-weight: 600;
transition: 0.2s;
```

Hover:
```css
background-color: var(--green-hover);
```

### Cards (Deals, Cashback Offers)
- Background: var(--card-bg)
- Text: var(--text-main)
- Subtext: var(--text-secondary)
- Tags (TRENDING, SALE):
  - Default Green Tag: var(--primary-green)
  - Sale Tag: var(--error-red)
  - Info/Promo Tag: var(--accent-blue)
- Borders: 1px solid var(--border-color)
- Box Shadow (optional): 0 2px 6px rgba(0,0,0,0.05)

### Section Backgrounds
- Home Hero Section: var(--neutral-bg) or light image background
- Deal Listing Pages: var(--neutral-bg)
- How It Works / Explainers: var(--card-bg)
- Newsletter/CTA Areas: var(--header-footer-bg)
- Blog: var(--neutral-bg) with green accents

### Text Colors
```css
h1, h2, h3 { color: var(--text-main); }
p, span, li { color: var(--text-secondary); }
a { color: var(--accent-blue); }
a:hover { text-decoration: underline; }
```

### Tags / Labels / Badges
- TRENDING
  - Background Color: var(--primary-green)
  - Text Color: white
- SALE
  - Background Color: var(--error-red)
  - Text Color: white
- NEW / INFO
  - Background Color: var(--accent-blue)
  - Text Color: white
- DISCOUNT %
  - Background Color: var(--sale-orange)
  - Text Color: white

## Blog Section Colors
- Blog Header Background: #22C55E
- Article Cards Background: #FFFFFF
- Section Background: #F8FAFC
- Article Title Text: #0F172A
- Article Description Text: #475569
- Featured Tags: #16A34A
- Secondary Tags: #3B82F6
- Borders & Dividers: #E2E8F0
- Read More / CTA Buttons: #22C55E (Hover: #16A34A)
- Newsletter Box Background: #22C55E with white text and CTA button

## Demo Page

A theme demo page is available at `/theme-demo` which showcases all the components with the new color scheme.