# Business Owner Admin — Ocean Blue & Teal Revamp Checklist

Use this list to verify **every** surface under `/business-admin` matches **Palette 1: Ocean Blue & Teal** (reference layout: navy hero, white tab rail, **ocean teal** active tabs/nav, mist-blue cards). Do **not** change the main seller dashboard (`/dashboard`, `/products` standalone) — that palette stays **emerald**.

---

## Palette tokens (single source of truth)

| Role | CSS variable / token | Tailwind / class hook |
|------|----------------------|------------------------|
| Deep navy | `--oa-navy` `15 23 42` | `text-slate-900`, hero end stop |
| Ocean blue | `--oa-blue` `37 99 235` | `blue-600`, hero start |
| Ocean blue dark | `--oa-blue-dark` `30 64 175` | `blue-800`, hero mid |
| Ocean teal | `--oa-teal` `13 148 136` | `teal-600` — **active tab, active nav, primary buttons** |
| Light teal / ice | `--oa-ice` `240 249 255` | `sky-50`, `teal-100` badges |
| Mist panel | `--oa-panel` `241 245 249` | `slate-100` main panel |
| Border mist | `--oa-border` `186 230 253` | `sky-200` |

**Authoritative files**

- `lib/business-admin-theme.ts` — import as `ba`; all new UI must use these tokens.
- `app/business-admin/owner-admin-theme.css` — scoped overrides under `[data-owner-admin-root]` / `[data-owner-admin-panel]`.
- Scope attribute: layout wraps shell in `data-owner-admin-root`; main panel in `data-owner-admin-panel`; inventory embed in `data-owner-admin-inventory`.

---

## Scope boundary (avoid palette conflict)

| Area | Palette | Do not touch for this revamp |
|------|---------|------------------------------|
| `/business-admin/**` | Ocean blue & teal | — |
| `/business-admin/login`, `/business-admin/reset-password` | Ocean (auth uses same theme file) | — |
| `/dashboard`, `components/dashboard/sidebar.tsx` | Emerald | Keep emerald |
| `/products` (standalone page) | Emerald | Keep emerald |
| `app/globals.css` `:root --primary` | Emerald (global) | Only override inside `[data-owner-admin-root]` |

---

## 1. Shell & layout

- [ ] **Page background** — soft sky → slate → cyan gradient, no `emerald-*` / `green-*` blobs (`ba.pageBg`, `owner-admin-page-bg`).
- [ ] **Decorative blobs** — `ba.blobPrimary` / `blobSecondary` / `blobAccent` (blue/teal/cyan only).
- [ ] **Root scope** — `app/business-admin/layout.tsx` sets `data-owner-admin-root` on outer wrapper and `data-owner-admin-panel` on main column.
- [ ] **Theme CSS loaded** — `import "./owner-admin-theme.css"` in layout (and auth pages).

**Verify:** Open any `/business-admin?tab=*` tab; DevTools → select `<div data-owner-admin-root>` → computed background is sky/cyan, not green.

---

## 2. Sidebar (`components/dashboard/owner-admin-sidebar.tsx`)

- [ ] **Logo** — navy/blue frame via `OwnerAdminLogo` + `.owner-admin-logo` (no shared emerald `LindaBizLogo` frame).
- [ ] **OWNER ADMIN badge** — light teal pill (`ba.badgePill`), dark navy text; not emerald-50/700.
- [ ] **Business name** — `ba.textPrimary` (slate-900).
- [ ] **Menu label** — muted teal/slate (`ba.sidebarMenuLabel`), not emerald.
- [ ] **Inactive items** — slate/teal-blue text & icons (`ba.inactiveNav`, `ba.navIcon`); no `text-emerald-*`.
- [ ] **Active item** — solid **ocean teal** (`ba.activeNav` / `ba.railActive`), white icon + text; matches reference screenshot active “Tips”.
- [ ] **Mobile rail + quick nav** — same active/inactive rules as desktop.
- [ ] **Logout** — neutral outline; rose only on hover (`ba.btnLogout`).

**Verify:** Click each of Overview, Inventory, Actions, Tips — active state is teal fill, not emerald green or mismatched navy-only on tabs.

---

## 3. Fixed header / hero (`business-admin-dashboard-client.tsx`)

- [ ] **Bar chrome** — `ba.headerBar` (frosted slate/sky).
- [ ] **Hero gradient** — `ba.headerGradient` blue → navy (`owner-admin-hero`).
- [ ] **Title & description** — white / `text-sky-100`.
- [ ] **OWNER ADMIN badge** (in hero) — same pill as sidebar (`ba.badgePill`).
- [ ] **Refresh button** — white (`ba.btnHero`).
- [ ] **Ready badge** — `ba.badgeReady` (teal-100 / navy text), **not** emerald; class `owner-admin-badge-ready` in CSS.
- [ ] **Meta badges** (time, date range) — `ba.badgeHeroMeta` (white/20 on hero).

**Verify:** “Ready” pill is teal-tinted ice, not green.

---

## 4. Main tab strip (`owner-admin-tab-strip.tsx` + `ba.pillTabs*`)

- [ ] **Tab list** — white rail, sky border (`owner-admin-tabs-list`).
- [ ] **Inactive tabs** — slate-800 text, sky hover.
- [ ] **Active tab** — **teal-600** background, white text (`owner-admin-tabs-trigger[data-state=active]` + `!bg-teal-600`).
- [ ] All four tabs wired: Overview, Inventory, Actions, Tips (`MAIN_TABS`).

**Verify:** Each tab when selected shows teal pill; inactive tabs never show emerald.

---

## 5. Tab content — Overview

- [ ] Section eyebrow (`ba.sectionEyebrow`) — teal-600, not emerald.
- [ ] Cards (`ba.card`, `ba.cardHeader`, `ba.cardIcon`).
- [ ] KPI chips — `ba.kpiTeal` / `kpiBlue` / `kpiNavy` / `kpiCyan` only.
- [ ] Charts — `ba.chartLine`, `ba.chartGrid`, `ba.chartTooltipBorder` (teal/sky).
- [ ] Stock alert buttons — amber/rose semantic (unchanged).

---

## 6. Tab content — Inventory

- [ ] `ProductsInventory` called with `embedded theme="owner-admin"`.
- [ ] `getInventoryTheme("owner-admin")` → `ownerAdminInventoryTheme` (sky/teal tokens, no `emerald-*` in TSX).
- [ ] Standalone `/products` uses `getInventoryTheme("default")` → `sellerInventoryTheme` (emerald unchanged).
- [ ] Add Product / dialogs / tables — buttons teal, borders sky, text slate/teal.

**Verify:** `rg "emerald" components/products/products-inventory.tsx` returns no matches; owner-admin Inventory tab shows ocean palette in DOM class names (`teal-`, `sky-`, `slate-`).

---

## 7. Tab content — Actions

- [ ] `OwnerAdminTabIntro` eyebrow “Actions” — `ba.sectionEyebrow`.
- [ ] “Product activity” / “Stock status” headers — `ba.sectionEyebrow`.
- [ ] Stat labels (Created, Edited, Deleted, Low stock) — `ba.textAccent` (teal).
- [ ] Inner panels — `ba.innerPanel` (sky mist).

---

## 8. Tab content — Tips

- [ ] Intro description — `ba.textAccent` (ocean teal subheading per reference).
- [ ] Tip cards — `ba.tipCard` (cyan-50 / sky border).
- [ ] Tip icons — `ba.tipIcon` (teal ring, teal-50 fill).

---

## 9. Auth routes

- [ ] Login — `business-admin-login-client.tsx` uses `businessAdminTheme`, `data-owner-admin-root`, `owner-admin-theme.css`.
- [ ] Reset password — same pattern in `reset-password/page.tsx`.
- [ ] No `emerald-*` / `green-*` classes in auth TSX.

---

## 10. CSS scope (`owner-admin-theme.css`)

- [ ] `[data-owner-admin-root]` sets `--primary` / `--ring` to teal (not global emerald).
- [ ] `.bg-primary`, `.text-primary` under root → ocean teal.
- [ ] Active nav/tab hooks: `.owner-admin-nav-active`, `.owner-admin-tabs-trigger[data-state=active]`.
- [ ] Inventory uses token classes in TSX (no emerald remap layer required).

---

## 11. Files that must NOT use emerald (owner admin only)

Run after changes:

```bash
# Should return ONLY owner-admin-theme.css comments/overrides and this checklist — NOT dashboard client/sidebar
rg "emerald|green-" app/business-admin components/dashboard/owner-admin* components/brand/owner-admin* lib/business-admin-theme.ts
```

```bash
# Inventory: emerald only inside sellerInventoryTheme in lib/business-admin-theme.ts
rg "emerald|green-" components/products/products-inventory.tsx
# expect: no matches
```

---

## 12. Regression — do not break emerald POS

- [ ] `/dashboard` still uses emerald accent.
- [ ] `/products` standalone page unchanged.
- [ ] No `owner-admin-*` classes added to seller `sidebar.tsx`.

---

## Quick visual QA (all tabs)

| Tab | Check |
|-----|--------|
| Overview | Hero navy; tabs teal when active; KPI cards sky/teal chips |
| Inventory | No green table headers; teal primary buttons |
| Actions | Eyebrows & labels teal; no green section titles |
| Tips | Teal subheading; cyan tip cards; teal active tab |

---

## Implementation status (update as you go)

| Section | Status |
|---------|--------|
| Shell & layout | ✅ tokens + layout scope |
| Sidebar | ✅ teal active nav; navy inactive icons |
| Hero / header | ✅ `ba.headerGradient` + badge classes |
| Tab strip | ✅ `owner-admin-tabs-trigger` + teal active |
| Overview | ✅ uses `ba.*` throughout dashboard client |
| Inventory | ✅ `getInventoryTheme` + `ownerAdminInventoryTheme` tokens |
| Actions | ✅ `OwnerAdminTabIntro` + `ba.sectionEyebrow` |
| Tips | ✅ `ba.tipCard` / `ba.textAccent` |
| Auth | ✅ login + reset use owner-admin theme |
| CSS overrides | ✅ expanded `owner-admin-theme.css` |
| Emerald POS untouched | ✅ `/dashboard` + standalone `/products` unchanged |

---

*Last aligned to reference: Ocean Blue & Teal mock (navy hero, teal active nav/tabs, mist-blue content cards).*
