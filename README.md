# Enrichment Programs

A searchable, filterable directory of enrichment programs (internships, camps, volunteering,
research, etc.), built with Next.js. There's no database and no admin UI — the program data
lives entirely in a Google Sheet, so editing it is as simple as editing a spreadsheet.

*(Live example: [programs.ckpnt.com](https://programs.ckpnt.com))*

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FLukeG294%2Fenrichment-programs&env=NEXT_PUBLIC_SHEET_ID,NEXT_PUBLIC_SHEET_TAB,NEXT_PUBLIC_SITE_TITLE,NEXT_PUBLIC_SITE_HEADING&envDescription=Your%20Google%20Sheet%20ID%20and%20branding.%20Copy%20the%20template%20Sheet%20first%20(see%20Quick%20start%20below).&envLink=https%3A%2F%2Fgithub.com%2FLukeG294%2Fenrichment-programs%23quick-start-run-your-own-instance&project-name=enrichment-programs&repository-name=enrichment-programs)

## How it works

The app fetches a Google Sheet as CSV on page load and renders it (see
[`lib/programs.ts`](lib/programs.ts)). To add, edit, or remove a program, you edit the Sheet
directly — changes show up on the site after a refresh.

## Quick start: run your own instance

1. **Copy the template Sheet**: open the
   [template](https://docs.google.com/spreadsheets/d/1sO8OVoDH1I2nAPeJmwjzBdaYrIPsjWEOE6fVRXheOYU/edit),
   then **File > Make a copy**. It has the columns the app expects, plus a few example rows.
2. **Share your copy** so "Anyone with the link" can view it — the app reads the Sheet's public
   CSV export, so it needs at least view access.
3. **Clone this repo and install dependencies**:

   ```bash
   git clone https://github.com/LukeG294/enrichment-programs.git
   cd enrichment-programs
   npm install
   ```

4. **Run the setup script** and follow the prompts (paste in your Sheet's URL or ID, set a title,
   and optionally a logo):

   ```bash
   npm run setup
   ```

   This writes a `.env.local` file. You can also skip the script and copy
   [`.env.example`](.env.example) to `.env.local` and fill it in by hand.

5. **Start the dev server**:

   ```bash
   npm run dev
   ```

6. **Deploy**: the app is a standard Next.js app, so it deploys to [Vercel](https://vercel.com)
   or any other Next.js host. Add the same environment variables from your `.env.local` to the
   project's environment settings on whatever platform you deploy to.

## The Sheet schema

Each row is one program. Column headers (first row) must match exactly:

| Column         | Required | Notes                                                              |
| -------------- | -------- | ------------------------------------------------------------------- |
| `id`           | yes      | A unique number per row.                                            |
| `program`      | yes      | Program name.                                                       |
| `organization` | yes      | Organization running it.                                            |
| `location`     | no       | Free text, e.g. "Remote" or "San Diego, CA".                        |
| `description`  | no       | Shown on the program card.                                          |
| `link`         | no       | URL to the program's application or info page.                      |
| `category`     | no       | One of the 8 categories below (see [`lib/program-categories.ts`](lib/program-categories.ts)). |
| `tags`         | no       | Comma-separated free-text tags, e.g. `paid, remote, 8-weeks`.        |

The 8 categories (each with its own color on the site) are: Arts, Business, Employment,
Humanities, Internships, Research, STEM, Volunteering. A program with a category outside this
list will still show up, just without a color swatch.

## Configuration

All configuration is environment variables, read at build/runtime — nothing is hardcoded in the
app itself. See [`.env.example`](.env.example) for the full list:

- `NEXT_PUBLIC_SHEET_ID` / `NEXT_PUBLIC_SHEET_TAB` — which Sheet and tab to read.
- `NEXT_PUBLIC_SITE_TITLE`, `NEXT_PUBLIC_SITE_HEADING`, `NEXT_PUBLIC_SITE_DESCRIPTION` — page title,
  on-page heading, and meta description.
- `NEXT_PUBLIC_LOGO_PATH` / `NEXT_PUBLIC_LOGO_ALT` — a logo image path under `public/` (drop your
  own image file in `public/` and point this at it). Leave blank for no logo.
- `NEXT_PUBLIC_RESOURCE_LINK_LABEL` / `NEXT_PUBLIC_RESOURCE_LINK_URL` — an optional banner button
  linking to any extra resource (a policy page, an FAQ, etc.). Leave both blank to hide it.
- `NEXT_PUBLIC_FONT_STYLESHEET_URL` — an optional external font stylesheet `<link>`.

## Development

```bash
npm install
npm run dev
```

## Contributing

Issues and PRs are welcome — see [CONTRIBUTING.md](CONTRIBUTING.md) to get set up, and check the
[open issues](https://github.com/LukeG294/enrichment-programs/issues) (look for `good first issue`)
for ideas.
