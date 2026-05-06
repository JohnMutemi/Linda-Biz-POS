export type DashboardThemeId = "emerald" | "amber" | "cyan" | "minimal" | "dark"

export interface DashboardThemeClasses {
  id: DashboardThemeId
  label: string
  /** Fixed page background */
  pageBg: string
  orb1: string
  orb2: string
  /** Default card shell */
  card: string
  cardTitle: string
  cardDesc: string
  border: string
  textStrong: string
  textMuted: string
  textLabel: string
  btnPrimary: string
  btnOutline: string
  tabList: string
  /** Full class string for TabsTrigger (includes active + inactive states) */
  tabTrigger: string
  selectTrigger: string
  tableHead: string
  tableRowAlt: string
  successBanner: string
  /** Distinct colors for charts / analytics rows (hex) */
  chartPalette: string[]
}

const CHART_EMERALD = ["#059669", "#10b981", "#34d399", "#14b8a6", "#22c55e", "#0d9488", "#4ade80", "#2dd4bf"]
const CHART_AMBER = ["#d97706", "#f59e0b", "#fbbf24", "#fcd34d", "#ea580c", "#fb923c", "#fdba74", "#f97316"]
const CHART_CYAN = ["#0891b2", "#06b6d4", "#22d3ee", "#67e8f9", "#0e7490", "#14b8a6", "#5eead4", "#2dd4bf"]
const CHART_MINIMAL = ["#475569", "#64748b", "#94a3b8", "#cbd5e1", "#78716c", "#a8a29e", "#57534e", "#44403c"]
const CHART_DARK = ["#34d399", "#2dd4bf", "#38bdf8", "#a78bfa", "#fbbf24", "#fb7185", "#4ade80", "#f472b6"]

export const DASHBOARD_THEMES: Record<DashboardThemeId, DashboardThemeClasses> = {
  emerald: {
    id: "emerald",
    label: "Emerald (default)",
    pageBg: "bg-emerald-50",
    orb1: "bg-emerald-300/40",
    orb2: "bg-emerald-300/40",
    card: "bg-white/70 backdrop-blur-sm border-emerald-100",
    cardTitle: "text-emerald-900",
    cardDesc: "text-emerald-700",
    border: "border-emerald-100",
    textStrong: "text-emerald-900",
    textMuted: "text-emerald-700",
    textLabel: "text-emerald-600",
    btnPrimary: "bg-emerald-600 hover:bg-emerald-700 text-white",
    btnOutline: "border-emerald-200 hover:bg-emerald-50 text-emerald-800",
    tabList: "bg-white/60 border border-emerald-100 p-1",
    tabTrigger:
      "text-emerald-800 hover:bg-emerald-50/80 data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-sm",
    selectTrigger: "border-emerald-200 bg-white/80 text-emerald-900",
    tableHead: "bg-emerald-50 text-emerald-900",
    tableRowAlt: "bg-emerald-50/30",
    successBanner: "border-emerald-100 bg-emerald-50/50 text-emerald-700",
    chartPalette: CHART_EMERALD,
  },
  amber: {
    id: "amber",
    label: "Amber warmth",
    pageBg: "bg-amber-50",
    orb1: "bg-amber-300/45",
    orb2: "bg-orange-300/35",
    card: "bg-white/75 backdrop-blur-sm border-amber-100",
    cardTitle: "text-amber-950",
    cardDesc: "text-amber-800",
    border: "border-amber-100",
    textStrong: "text-amber-950",
    textMuted: "text-amber-800",
    textLabel: "text-amber-700",
    btnPrimary: "bg-amber-600 hover:bg-amber-700 text-white",
    btnOutline: "border-amber-200 hover:bg-amber-50 text-amber-900",
    tabList: "bg-white/60 border border-amber-100 p-1",
    tabTrigger:
      "text-amber-900 hover:bg-amber-50/80 data-[state=active]:bg-amber-600 data-[state=active]:text-white data-[state=active]:shadow-sm",
    selectTrigger: "border-amber-200 bg-white/80 text-amber-950",
    tableHead: "bg-amber-50 text-amber-950",
    tableRowAlt: "bg-amber-50/40",
    successBanner: "border-amber-100 bg-amber-50/60 text-amber-800",
    chartPalette: CHART_AMBER,
  },
  cyan: {
    id: "cyan",
    label: "Cyan fresh",
    pageBg: "bg-cyan-50",
    orb1: "bg-cyan-300/40",
    orb2: "bg-sky-300/35",
    card: "bg-white/75 backdrop-blur-sm border-cyan-100",
    cardTitle: "text-cyan-950",
    cardDesc: "text-cyan-800",
    border: "border-cyan-100",
    textStrong: "text-cyan-950",
    textMuted: "text-cyan-800",
    textLabel: "text-cyan-700",
    btnPrimary: "bg-cyan-600 hover:bg-cyan-700 text-white",
    btnOutline: "border-cyan-200 hover:bg-cyan-50 text-cyan-900",
    tabList: "bg-white/60 border border-cyan-100 p-1",
    tabTrigger:
      "text-cyan-900 hover:bg-cyan-50/80 data-[state=active]:bg-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-sm",
    selectTrigger: "border-cyan-200 bg-white/80 text-cyan-950",
    tableHead: "bg-cyan-50 text-cyan-950",
    tableRowAlt: "bg-cyan-50/35",
    successBanner: "border-cyan-100 bg-cyan-50/50 text-cyan-800",
    chartPalette: CHART_CYAN,
  },
  minimal: {
    id: "minimal",
    label: "Subtle minimalist",
    pageBg: "bg-stone-50",
    orb1: "bg-stone-200/50",
    orb2: "bg-neutral-200/40",
    card: "bg-white/85 backdrop-blur-sm border-stone-200/80",
    cardTitle: "text-stone-900",
    cardDesc: "text-stone-600",
    border: "border-stone-200",
    textStrong: "text-stone-900",
    textMuted: "text-stone-600",
    textLabel: "text-stone-500",
    btnPrimary: "bg-stone-800 hover:bg-stone-900 text-white",
    btnOutline: "border-stone-200 hover:bg-stone-100 text-stone-800",
    tabList: "bg-white/70 border border-stone-200 p-1",
    tabTrigger:
      "text-stone-700 hover:bg-stone-100/80 data-[state=active]:bg-stone-800 data-[state=active]:text-white data-[state=active]:shadow-sm",
    selectTrigger: "border-stone-200 bg-white text-stone-900",
    tableHead: "bg-stone-100 text-stone-900",
    tableRowAlt: "bg-stone-50/80",
    successBanner: "border-stone-200 bg-stone-50 text-stone-600",
    chartPalette: CHART_MINIMAL,
  },
  dark: {
    id: "dark",
    label: "Dark",
    pageBg: "bg-slate-950",
    orb1: "bg-emerald-500/15",
    orb2: "bg-cyan-500/10",
    card: "bg-slate-900/80 backdrop-blur-sm border-slate-700/80",
    cardTitle: "text-slate-100",
    cardDesc: "text-slate-400",
    border: "border-slate-700",
    textStrong: "text-slate-100",
    textMuted: "text-slate-400",
    textLabel: "text-slate-500",
    btnPrimary: "bg-emerald-600 hover:bg-emerald-500 text-white",
    btnOutline: "border-slate-600 hover:bg-slate-800 text-slate-200",
    tabList: "bg-slate-900/90 border border-slate-700 p-1",
    tabTrigger:
      "text-slate-400 hover:bg-slate-800/80 data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-sm",
    selectTrigger: "border-slate-600 bg-slate-900 text-slate-100",
    tableHead: "bg-slate-800 text-slate-100",
    tableRowAlt: "bg-slate-800/40",
    successBanner: "border-slate-700 bg-slate-800/60 text-slate-300",
    chartPalette: CHART_DARK,
  },
}

export const DASHBOARD_THEME_STORAGE_KEY = "lindabiz_dashboard_theme"

export function isDashboardThemeId(value: string): value is DashboardThemeId {
  return value in DASHBOARD_THEMES
}
