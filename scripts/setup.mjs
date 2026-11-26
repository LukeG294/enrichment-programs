#!/usr/bin/env node
// Interactive setup for a new instance of this app. Writes .env.local with
// the values that point the site at your own Google Sheet and branding.
import { createInterface } from "node:readline/promises"
import { writeFile, readFile } from "node:fs/promises"
import { existsSync } from "node:fs"

const TEMPLATE_SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1sO8OVoDH1I2nAPeJmwjzBdaYrIPsjWEOE6fVRXheOYU/edit?usp=drivesdk"

const rl = createInterface({ input: process.stdin, output: process.stdout })
const ask = async (question, fallback = "") => {
  const answer = (await rl.question(fallback ? `${question} (${fallback}): ` : `${question}: `)).trim()
  return answer || fallback
}

const extractSheetId = (input) => {
  const match = input.match(/\/d\/([a-zA-Z0-9-_]+)/)
  return match ? match[1] : input
}

console.log("Set up your own instance of this app.\n")
console.log(`1. Copy the template Sheet: ${TEMPLATE_SHEET_URL}`)
console.log("   Open it, then File > Make a copy, then edit the rows for your own programs.")
console.log("2. Share your copy so anyone with the link can view it (needed for the site to read it).")
console.log("3. Paste its URL or Sheet ID below.\n")

const sheetInput = await ask("Your Google Sheet URL or ID")
if (!sheetInput) {
  console.error("\nA Sheet ID is required. Run `npm run setup` again once you have one.")
  rl.close()
  process.exit(1)
}
const sheetId = extractSheetId(sheetInput)
const sheetTab = await ask("Tab name in the Sheet", "Sheet1")

console.log("\nBranding (leave blank to skip):")
const siteTitle = await ask("Browser tab title", "Enrichment Programs")
const siteHeading = await ask("Heading shown on the page", siteTitle)
const siteDescription = await ask("Short description (meta tag)", "Browse enrichment programs and opportunities.")
const logoPath = await ask("Logo image path under /public (e.g. /logo.png), or blank for none")
const logoAlt = logoPath ? await ask("Logo alt text", `${siteTitle} logo`) : ""
const resourceLinkLabel = await ask("Extra banner link label (e.g. a policy page), or blank to skip")
const resourceLinkUrl = resourceLinkLabel ? await ask("Banner link URL") : ""

rl.close()

const lines = [
  `NEXT_PUBLIC_SHEET_ID=${sheetId}`,
  `NEXT_PUBLIC_SHEET_TAB=${sheetTab}`,
  `NEXT_PUBLIC_SITE_TITLE=${siteTitle}`,
  `NEXT_PUBLIC_SITE_HEADING=${siteHeading}`,
  `NEXT_PUBLIC_SITE_DESCRIPTION=${siteDescription}`,
  `NEXT_PUBLIC_LOGO_PATH=${logoPath}`,
  `NEXT_PUBLIC_LOGO_ALT=${logoAlt}`,
  `NEXT_PUBLIC_RESOURCE_LINK_LABEL=${resourceLinkLabel}`,
  `NEXT_PUBLIC_RESOURCE_LINK_URL=${resourceLinkUrl}`,
  "",
]

const envPath = new URL("../.env.local", import.meta.url)
if (existsSync(envPath)) {
  const existing = await readFile(envPath, "utf8")
  console.log("\n.env.local already exists. Appending a backup copy to .env.local.bak first.")
  await writeFile(new URL("../.env.local.bak", import.meta.url), existing)
}
await writeFile(envPath, lines.join("\n"))

console.log("\nWrote .env.local. Run `npm run dev` to see your instance.")
