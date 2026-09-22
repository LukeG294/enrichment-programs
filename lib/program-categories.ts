// The 8 program_types categories from the CheckPoint Student database, now
// hardcoded here since the Google Sheet only carries each program's category
// name (see lib/programs.ts) and not a color.
export const PROGRAM_CATEGORIES = [
  "Arts",
  "Business",
  "Employment",
  "Humanities",
  "Internships",
  "Research",
  "STEM",
  "Volunteering",
] as const

export type ProgramCategory = (typeof PROGRAM_CATEGORIES)[number]

export const CATEGORY_COLORS: Record<string, string> = {
  Arts: "#ec4899",
  Business: "#f59e0b",
  Employment: "#0ea5e9",
  Humanities: "#8b5cf6",
  Internships: "#14b8a6",
  Research: "#6366f1",
  STEM: "#10b981",
  Volunteering: "#f97316",
}

export const getCategoryColor = (category: string | null): string | undefined =>
  category ? CATEGORY_COLORS[category] : undefined
