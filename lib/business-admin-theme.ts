/**

 * Ocean Blue & Teal — business owner admin panel only.

 * Import as `ba` and use tokens everywhere; paired with owner-admin-theme.css.

 */

export const businessAdminTheme = {

  /* Shell */

  pageBg: "owner-admin-page-bg bg-gradient-to-br from-sky-50 via-slate-50 to-cyan-50",

  blobPrimary: "bg-blue-400/30",

  blobSecondary: "bg-sky-300/35",

  blobAccent: "bg-cyan-200/35",



  /* Typography */

  textPrimary: "text-slate-900",

  textSecondary: "text-slate-600",

  textAccent: "oa-label-accent text-sky-800",

  navIcon: "text-blue-900",

  textMuted: "text-slate-500",

  textOnPrimary: "text-white",

  textOnHeroMuted: "text-sky-100",



  /* Borders & surfaces */

  border: "border-sky-200/90",

  borderStrong: "border-sky-200",

  borderSubtle: "border-slate-200/80",

  surface: "bg-white",

  surfaceIce: "bg-sky-50/50 owner-admin-tab-rail",

  surfaceMuted: "bg-slate-100/60",



  /* Badges — same pill everywhere (sidebar + hero) */

  badgePill:
    "owner-admin-badge-pill inline-flex items-center gap-1 rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-900 sm:text-[11px]",

  badgePillIcon: "h-3 w-3 text-blue-600 shrink-0",

  badgeReady: "owner-admin-badge-ready h-7 border-0 bg-sky-100 px-2 text-[11px] text-slate-900",

  badgeHeroMeta: "h-7 border-0 bg-white/20 px-2 text-[11px] text-white",

  badgeOutline: "border-sky-200 bg-sky-50 text-slate-800",

  badgeToday: "owner-admin-badge-today shrink-0 border-0 bg-blue-600 text-white hover:bg-blue-600",



  /* Buttons */

  primary: "bg-blue-600 hover:bg-blue-700 text-white",

  btnHero: "h-8 bg-white px-3 text-xs text-slate-900 hover:bg-sky-50 sm:h-9 sm:text-sm",

  btnOutline: "border-sky-200 bg-white text-slate-800 hover:bg-sky-50 hover:border-sky-300",

  btnFilterActive: "bg-blue-600 hover:bg-blue-700 text-white",

  btnFilterInactive: "border-sky-200 bg-white text-slate-700 hover:bg-sky-50",

  btnLogout:

    "border-sky-200 bg-white text-slate-600 hover:bg-sky-50 hover:text-rose-700 hover:border-rose-200",

  profileAvatar:
    "inline-flex items-center justify-center rounded-full bg-gradient-to-br from-blue-600 via-blue-700 to-slate-800 font-semibold text-white shadow-sm ring-2 ring-sky-200/90",

  profileTriggerCompact:
    "flex h-11 w-11 items-center justify-center rounded-xl border border-sky-200/90 bg-white hover:bg-sky-50 hover:border-sky-300 touch-manipulation",

  profileTriggerFull:
    "flex w-full min-h-11 items-center gap-3 rounded-xl border border-sky-200/90 bg-white px-3 py-2.5 hover:bg-sky-50 hover:border-sky-300 touch-manipulation",

  profileMenu:
    "owner-admin-profile-menu z-[200] w-56 rounded-xl border border-sky-200/90 bg-white p-1.5 shadow-lg shadow-blue-900/10",

  profileMenuLogout:
    "cursor-pointer gap-2 rounded-lg px-2 py-2 text-sm font-medium text-rose-600 focus:bg-rose-50 focus:text-rose-700",



  /* Nav */

  activeNav:

    "owner-admin-nav-active bg-blue-600 text-white border border-blue-700 shadow-md shadow-blue-700/30",

  inactiveNav:

    "text-slate-800 hover:bg-sky-50 hover:text-slate-900 border border-transparent",

  sidebarShell:

    "owner-admin-sidebar border-r border-sky-200/80 bg-white shadow-lg shadow-sky-200/25",

  sidebarBrand:

    "owner-admin-sidebar-brand border-b border-sky-200/80 bg-gradient-to-br from-sky-50/80 via-white to-white",

  sidebarMenuLabel: "text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-700/90",

  railActive: "owner-admin-rail-active bg-blue-600 text-white border border-blue-700 shadow-md shadow-blue-700/30",

  railInactive: "text-slate-700 hover:bg-sky-50 hover:text-slate-900",



  /* Header */

  headerBar:

    "owner-admin-header-bar fixed z-[100] border-b border-sky-200/70 bg-slate-100/90 shadow-[0_8px_24px_-8px_rgba(30,58,138,0.12)] backdrop-blur-xl backdrop-saturate-150",

  headerGradient:

    "owner-admin-hero bg-gradient-to-r from-blue-600 via-blue-800 to-slate-900",

  headerShadow: "shadow-[0_12px_40px_-20px_rgba(30,58,138,0.55)]",



  /* Tabs */

  pillTabsList:

    "owner-admin-tabs-list flex h-auto w-full min-h-11 justify-start gap-1 overflow-x-auto overscroll-x-contain snap-x snap-mandatory rounded-2xl border border-sky-200/90 !bg-white p-1 shadow-sm shadow-sky-100/50 backdrop-blur-md [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:justify-center lg:gap-1.5 lg:p-1.5 xl:max-w-4xl xl:mx-auto",

  pillTabsTrigger:

    "owner-admin-tabs-trigger shrink-0 snap-start rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 transition-all touch-manipulation min-h-10 sm:min-h-11 sm:px-4 sm:text-sm lg:px-6 lg:py-3 lg:text-[15px] data-[state=active]:!bg-blue-600 data-[state=active]:!text-white data-[state=active]:!shadow-md data-[state=active]:!shadow-blue-600/25 hover:bg-sky-50",



  /* Cards & panels */

  mainPanel:

    "owner-admin-main-panel rounded-2xl border border-sky-200/80 bg-slate-100/55 shadow-[0_12px_40px_-18px_rgba(30,58,138,0.18)] ring-1 ring-sky-100/80 backdrop-blur-sm sm:rounded-3xl",

  card: "owner-admin-card border-sky-200/90 bg-white shadow-sm shadow-sky-100/40 transition-shadow hover:shadow-md hover:shadow-sky-200/40 lg:rounded-2xl",

  cardTitle: "text-slate-900 lg:text-xl",

  cardHeader: "border-b border-sky-200/80 bg-sky-50/40",

  cardIcon: "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-blue-700",

  innerPanel: "rounded-2xl border border-sky-200/90 bg-sky-50/30",

  statTile: "rounded-lg border border-sky-100 bg-white px-3 py-2",

  metricCard: "rounded-2xl border border-sky-200/90 bg-white p-5 shadow-sm sm:p-6",

  tipCard:
    "rounded-xl border border-sky-200/90 bg-sky-50/80 p-4 text-slate-900 shadow-sm hover:border-blue-300 hover:bg-sky-50",

  tipIcon:
    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-blue-500 bg-sky-50 text-blue-700",

  emptyState:
    "rounded-2xl border border-dashed border-sky-200/90 bg-gradient-to-br from-white via-sky-50/50 to-cyan-50/40 p-5 shadow-sm sm:p-6",

  emptyStateIcon:
    "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-sky-200 bg-white text-blue-600 shadow-sm",

  rankBadge: "oa-rank-badge flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white",



  /* Section chrome */

  sectionEyebrow:
    "owner-admin-eyebrow text-xs font-semibold uppercase tracking-[0.16em] text-sky-800",

  sectionTitle: "text-base font-semibold tracking-tight text-slate-900 sm:text-lg",

  sectionDesc: "max-w-3xl text-sm leading-relaxed text-slate-600",

  sectionDivider: "border-b border-sky-200/80",



  /* Inputs */

  input: "border-sky-200 bg-white focus-visible:ring-blue-300",



  /* KPI tones — ocean blue family (no emerald-like teal) */

  kpiTeal: {

    ring: "ring-sky-100/80",

    chip: "bg-sky-50 text-blue-800 border-sky-200",

    glow: "shadow-[0_18px_50px_-30px_rgba(37,99,235,0.35)]",

  },

  kpiBlue: {

    ring: "ring-sky-100/80",

    chip: "bg-sky-50 text-blue-800 border-sky-200",

    glow: "shadow-[0_18px_50px_-30px_rgba(37,99,235,0.35)]",

  },

  kpiNavy: {

    ring: "ring-slate-200/80",

    chip: "bg-slate-100 text-slate-800 border-slate-200",

    glow: "shadow-[0_18px_50px_-30px_rgba(15,23,42,0.25)]",

  },

  kpiCyan: {

    ring: "ring-cyan-100/80",

    chip: "bg-cyan-50 text-cyan-900 border-cyan-200",

    glow: "shadow-[0_18px_50px_-30px_rgba(6,182,212,0.35)]",

  },



  /* Semantic stock (still distinct but softened) */

  stockLow: "border-amber-200/90 bg-amber-50/60",

  stockOut: "border-rose-200/90 bg-rose-50/60",

  btnStockLow: "border-amber-200 bg-amber-50/80 text-amber-900 hover:bg-amber-100",

  btnStockOut: "border-rose-200 bg-rose-50/80 text-rose-800 hover:bg-rose-100",

  btnFilterLowActive: "bg-amber-600 hover:bg-amber-700 text-white",

  btnFilterOutActive: "bg-rose-600 hover:bg-rose-700 text-white",



  chartLine: "#2563eb",

  chartGrid: "#e0f2fe",

  chartTooltipBorder: "#99f6e4",

} as const



export type InventoryUiTheme = {
  pageLoading: string
  pageLoadingEmbedded: string
  pageBg: string
  blobPrimary: string
  blobSecondary: string
  spinner: string
  text: string
  textStrong: string
  textTitle: string
  textMuted: string
  textBody: string
  textSearchIcon: string
  textSearchEmpty: string
  btn: string
  btnPaginationActive: string
  border: string
  borderStrong: string
  borderSubtle: string
  card: string
  cardMuted: string
  cardTable: string
  input: string
  inputField: string
  badge: string
  badgeOk: string
  emptyIconWrap: string
  emptyIcon: string
  panel: string
  panelTitle: string
  panelIcon: string
  panelDesc: string
  listCard: string
  tableHead: string
  tableHeadCell: string
  tableRowAlt: string
  tableRowEven: string
  btnOutline: string
  btnOutlineSm: string
  paginationBar: string
  dialog: string
  dialogTitle: string
  dialogDesc: string
  popularCard: string
  popularCardTitle: string
  popularCardDesc: string
  popularItemBtn: string
  popularItemName: string
  popularItemMeta: string
  hint: string
}

/** Emerald palette — standalone `/products` and seller flows only. */
export const sellerInventoryTheme: InventoryUiTheme = {
  pageLoading:
    "min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center",
  pageLoadingEmbedded: "py-12 text-center",
  pageBg: "bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50",
  blobPrimary: "bg-emerald-200",
  blobSecondary: "bg-green-200",
  spinner: "border-emerald-600",
  text: "text-emerald-700",
  textStrong: "text-emerald-900",
  textTitle: "text-emerald-950",
  textMuted: "text-emerald-600",
  textBody: "text-emerald-800",
  textSearchIcon: "text-emerald-500",
  textSearchEmpty: "text-emerald-400",
  btn: "bg-emerald-600 hover:bg-emerald-700 text-white font-medium",
  btnPaginationActive: "bg-emerald-600 hover:bg-emerald-700",
  border: "border-emerald-100",
  borderStrong: "border-emerald-200",
  borderSubtle: "border-emerald-100/50",
  card: "bg-white/80 backdrop-blur-sm border-emerald-100",
  cardMuted: "bg-white/70 backdrop-blur-sm border-emerald-100",
  cardTable: "overflow-hidden border-emerald-100 bg-white/85 shadow-sm backdrop-blur-sm",
  input: "border-emerald-200 pl-10 text-sm focus-visible:ring-emerald-300",
  inputField: "border-emerald-200 focus:border-emerald-400",
  badge: "w-fit border-emerald-200 bg-emerald-50 text-emerald-700 text-xs",
  badgeOk: "shrink-0 border-emerald-200 bg-emerald-50 text-emerald-800",
  emptyIconWrap: "bg-emerald-50 p-4 rounded-full mb-4",
  emptyIcon: "text-emerald-600",
  panel: "rounded-xl border border-emerald-100 bg-white/80 px-4 py-3",
  panelTitle: "flex items-center text-sm font-semibold text-emerald-900",
  panelIcon: "mr-2 h-4 w-4 shrink-0 text-emerald-600",
  panelDesc: "mt-0.5 text-xs leading-relaxed text-emerald-700",
  listCard: "rounded-xl border border-emerald-100 bg-white/90 p-3 shadow-sm",
  tableHead: "border-b border-emerald-100 bg-emerald-50/90",
  tableHeadCell: "font-semibold text-emerald-900",
  tableRowAlt: "bg-emerald-50/35 border-t border-emerald-100/50",
  tableRowEven: "bg-white/90",
  btnOutline: "border-emerald-200 text-emerald-700 hover:bg-emerald-50",
  btnOutlineSm: "border-emerald-200 hover:bg-emerald-50",
  paginationBar: "rounded-xl border border-emerald-100 bg-white/80 px-4 py-3",
  dialog: "bg-white/95 backdrop-blur-sm border-emerald-100 max-w-md mx-4 sm:max-w-2xl max-h-[90vh] overflow-y-auto",
  dialogTitle: "text-emerald-900",
  dialogDesc: "text-emerald-700",
  popularCard: "bg-emerald-50/50 border-emerald-200",
  popularCardTitle: "text-sm text-emerald-800",
  popularCardDesc: "text-emerald-600",
  popularItemBtn: "justify-start text-left h-auto p-3 border-emerald-200 hover:bg-emerald-100",
  popularItemName: "font-medium text-emerald-900",
  popularItemMeta: "text-xs text-emerald-600",
  hint: "text-xs text-emerald-600",
}

/** Ocean blue & teal — business admin Inventory tab only. */
export const ownerAdminInventoryTheme: InventoryUiTheme = {
  pageLoading:
    "min-h-screen bg-gradient-to-br from-sky-50 via-slate-50 to-cyan-50 flex items-center justify-center",
  pageLoadingEmbedded: "py-12 text-center",
  pageBg: "bg-gradient-to-br from-sky-50 via-slate-50 to-cyan-50",
  blobPrimary: "bg-blue-400/30",
  blobSecondary: "bg-sky-300/35",
  spinner: "border-blue-600",
  text: "text-slate-600",
  textStrong: "text-slate-900",
  textTitle: "text-slate-950",
  textMuted: "oa-text-accent",
  textBody: "text-slate-700",
  textSearchIcon: "text-sky-600",
  textSearchEmpty: "text-sky-400",
  btn: "oa-btn-primary font-medium",
  btnPaginationActive: "oa-pagination-active",
  border: "border-sky-200/90",
  borderStrong: "border-sky-200",
  borderSubtle: "border-sky-200/50",
  card: "bg-white/80 backdrop-blur-sm border-sky-200/90",
  cardMuted: "bg-white/70 backdrop-blur-sm border-sky-200/90",
  cardTable: "overflow-hidden border-sky-200/90 bg-white/85 shadow-sm backdrop-blur-sm",
  input: "border-sky-200 pl-10 text-sm focus-visible:ring-blue-300",
  inputField: "border-sky-200 focus:border-blue-400",
  badge: "w-fit border-sky-200 bg-sky-50 text-slate-700 text-xs",
  badgeOk: "shrink-0 border-sky-200 bg-sky-50 text-blue-800",
  emptyIconWrap: "bg-sky-50 p-4 rounded-full mb-4",
  emptyIcon: "text-blue-600",
  panel: "rounded-xl border border-sky-200/90 bg-white/80 px-4 py-3",
  panelTitle: "flex items-center text-sm font-semibold text-slate-900",
  panelIcon: "mr-2 h-4 w-4 shrink-0 text-blue-600",
  panelDesc: "mt-0.5 text-xs leading-relaxed text-slate-600",
  listCard: "rounded-xl border border-sky-200/90 bg-white/90 p-3 shadow-sm",
  tableHead: "border-b border-sky-200/90 bg-sky-50/90",
  tableHeadCell: "font-semibold text-slate-900",
  tableRowAlt: "bg-sky-50/35 border-t border-sky-200/50",
  tableRowEven: "bg-white/90",
  btnOutline: "oa-btn-outline",
  btnOutlineSm: "oa-btn-outline",
  paginationBar: "rounded-xl border border-sky-200/90 bg-white/80 px-4 py-3",
  dialog:
    "bg-white/95 backdrop-blur-sm border-sky-200/90 max-w-md mx-4 sm:max-w-2xl max-h-[90vh] overflow-y-auto",
  dialogTitle: "text-slate-900",
  dialogDesc: "text-slate-600",
  popularCard: "bg-sky-50/50 border-sky-200",
  popularCardTitle: "text-sm text-slate-800",
  popularCardDesc: "oa-text-accent text-sm",
  popularItemBtn: "oa-btn-outline justify-start text-left h-auto p-3",
  popularItemName: "font-medium text-slate-900",
  popularItemMeta: "text-xs oa-text-accent",
  hint: "text-xs oa-text-accent",
}

export function getInventoryTheme(mode: "default" | "owner-admin"): InventoryUiTheme {
  return mode === "owner-admin" ? ownerAdminInventoryTheme : sellerInventoryTheme
}

export type BusinessAdminTheme = typeof businessAdminTheme


