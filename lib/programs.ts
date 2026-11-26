import Papa from "papaparse"
import type { CounselingProgram } from "@/lib/counseling-programs"

// The Google Sheet is the single source of truth for program data. Editing
// happens in the Sheet directly, not in this app — see README.md. Override
// these for your own instance via NEXT_PUBLIC_SHEET_ID / NEXT_PUBLIC_SHEET_TAB.
const SHEET_ID = process.env.NEXT_PUBLIC_SHEET_ID || "1yJWdjWMs1Yv_Zf6kwxtfAlmi3n8ymW6Hujjvz69g470"
const TAB_NAME = process.env.NEXT_PUBLIC_SHEET_TAB || "Sheet1"

const normalizeTags = (tags: unknown): string[] => {
  if (Array.isArray(tags)) {
    return tags.map((tag) => String(tag).trim()).filter(Boolean)
  }
  if (typeof tags === "string") {
    return tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
  }
  return []
}

const toNullableString = (value: unknown): string | null => {
  const trimmed = String(value ?? "").trim()
  return trimmed ? trimmed : null
}

const mapRow = (row: Record<string, unknown>): CounselingProgram | null => {
  const id = Number(row.id)
  if (!Number.isFinite(id)) {
    return null
  }

  return {
    id,
    program: String(row.program ?? "").trim(),
    organization: String(row.organization ?? "").trim(),
    location: toNullableString(row.location),
    description: toNullableString(row.description),
    link: toNullableString(row.link),
    category: toNullableString(row.category),
    tags: normalizeTags(row.tags),
  }
}

let cachedPrograms: Promise<CounselingProgram[]> | null = null

const fetchPrograms = async (): Promise<CounselingProgram[]> => {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(TAB_NAME)}`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error("Unable to load programs from the Google Sheet")
  }

  const csvText = await response.text()
  const { data } = Papa.parse<Record<string, unknown>>(csvText, {
    header: true,
    skipEmptyLines: true,
  })

  return data
    .map(mapRow)
    .filter((program): program is CounselingProgram => program !== null)
}

// Cache the parsed result across the whole session — this is a live Google
// Doc, not a low-latency API, so we only fetch it once per page load.
export const loadPrograms = (): Promise<CounselingProgram[]> => {
  if (!cachedPrograms) {
    cachedPrograms = fetchPrograms().catch((error) => {
      cachedPrograms = null
      throw error
    })
  }
  return cachedPrograms
}
