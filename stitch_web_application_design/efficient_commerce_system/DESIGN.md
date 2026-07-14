---
name: Efficient Commerce System
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#45464d'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#0058be'
  on-secondary: '#ffffff'
  secondary-container: '#2170e4'
  on-secondary-container: '#fefcff'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#0b1c30'
  on-tertiary-container: '#75859d'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc6ff'
  on-secondary-fixed: '#001a42'
  on-secondary-fixed-variant: '#004395'
  tertiary-fixed: '#d3e4fe'
  tertiary-fixed-dim: '#b7c8e1'
  on-tertiary-fixed: '#0b1c30'
  on-tertiary-fixed-variant: '#38485d'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
  status-pending: '#F59E0B'
  status-completed: '#10B981'
  status-canceled: '#EF4444'
  admin-deep-blue: '#0F172A'
  tenant-accent: '#3B82F6'
  border-subtle: '#E2E8F0'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  body-base:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  price-display:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '700'
    lineHeight: 24px
    letterSpacing: '0'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  container-margin: 24px
  gutter: 16px
  section-gap: 32px
  input-padding: 12px
---

## Brand & Style

The design system is engineered for a multi-tenant SaaS environment where the platform serves as a reliable, high-performance engine for commerce. The brand personality is **Technical, Utilitarian, and Efficient**. It follows a **Corporate Modern** aesthetic—prioritizing clarity, speed, and trust. 

While the admin interface remains steadfast and professional to reduce cognitive load for vendors, the storefront infrastructure is "transparent," allowing tenant-specific brand colors to lead without compromising the underlying structural integrity. The goal is to evoke a sense of "invisible power": a system that works perfectly without getting in the way of the transaction.

## Colors

The palette is divided into two distinct functional zones:

1.  **Admin Infrastructure:** Uses a "Corporate Deep Blue" (`#0F172A`) as the primary anchor to convey stability and authority. Grays are pulled from the Slate and Slate-Zinc scales to provide a neutral, sophisticated backdrop that doesn't compete with data visualizations.
2.  **Tenant Stores:** The secondary color (`#3B82F6`) acts as the default brand accent but is intended to be overwritten by tenant-specific configurations.

**Status Tokens:**
- **Pending:** Amber/Gold to signal "attention required" without the urgency of an error.
- **Completed:** Emerald green to signify success and finality.
- **Canceled:** Red to indicate a stopped process or lost sale.

## Typography

This design system uses **Inter** exclusively to ensure maximum legibility across all devices, particularly within mobile WebViews (Instagram/TikTok). 

- **Headlines:** Utilize tighter letter-spacing and heavier weights to create a strong visual hierarchy.
- **Functional Labels:** Used for status badges and table headers, these use uppercase styling and increased letter-spacing to distinguish them from interactive body text.
- **Price Rendering:** Specifically weighted for visibility in the catalog, ensuring the most critical data point in e-commerce is always prominent.

## Layout & Spacing

The system follows a **Fluid Grid** model with an 8px rhythmic scale (using a 4px base unit for fine-tuned adjustments). 

- **Admin Dashboard:** A structured 12-column layout on desktop, collapsing to a single-column stack on mobile. Sidebars are fixed-width (280px) to maximize the "workspace" area.
- **Storefront Catalogs:** Uses a responsive CSS Grid with `auto-fill` logic. On mobile, products are displayed in a 2-column format to balance density and touch-target size.
- **Safe Zones:** A 24px margin is enforced on all mobile layouts to prevent content from touching screen edges in in-app browsers.

## Elevation & Depth

This design system utilizes **Tonal Layers** and **Low-contrast Outlines** rather than heavy shadows to maintain a "lightweight" feel and ensure high performance on mobile devices.

- **Admin Surfaces:** Tiers are created using background color shifts (e.g., a white card on a light-gray background) rather than elevation.
- **Modals & Flyouts:** These use a single, ultra-diffused "Ambient Shadow" (0px 10px 15px -3px rgba(0,0,0,0.1)) to separate critical interactions from the background.
- **Borders:** A 1px border (`#E2E8F0`) is the primary method of separation for all UI components, creating a crisp, architectural look.

## Shapes

The shape language is **Soft** and professional. 

- **Buttons & Inputs:** Use a 0.25rem (4px) border radius to maintain a precise, corporate feel.
- **Cards & Containers:** Scale up to 0.5rem (8px) for larger layout blocks to soften the interface slightly without appearing "playful."
- **Status Badges:** Use a pill-shaped radius (full round) to distinguish them clearly from interactive buttons.

## Components

**Buttons (Shadcn/ui base):**
- **Primary:** High-contrast solid background (Deep Blue for admin, Tenant Color for stores).
- **Secondary:** Ghost or Outline variants using 1px borders.
- **Interactive State:** Subtle opacity shift (0.9) on hover; 2px focus ring using the brand-accent color.

**Order Status Chips:**
- **Structure:** Small text, semi-bold, uppercase.
- **Styling:** Light background tint (10% opacity) with a solid text color matching the status (e.g., Light Green bg with Dark Green text for "Completed").

**Input Fields:**
- Minimalist design: 1px border, 12px horizontal padding.
- Focused state: Border color shifts to the brand-primary with a subtle 2px outer glow.

**Cards:**
- White background, 1px border (`#E2E8F0`), no shadow.
- Used for product listings and dashboard widgets to maintain a clean, "flat" aesthetic.

**Lists & Tables:**
- High-density spacing for admin tables to allow for quick scanning of orders.
- Zebra-striping (using `#F8FAFC`) on alternate rows to improve horizontal eye-tracking.