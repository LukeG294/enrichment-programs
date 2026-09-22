# Enrichment Programs

Browse summer enrichment opportunities.

## Data source

Program data lives in a Google Sheet, not in this app or any API:

https://docs.google.com/spreadsheets/d/1yJWdjWMs1Yv_Zf6kwxtfAlmi3n8ymW6Hujjvz69g470

**To add, edit, or remove a program, edit the Sheet directly** — changes show up on the
site after a refresh (see `lib/programs.ts`, which fetches and caches the Sheet as CSV).
There is no admin UI or write API in this app; the old CheckPoint Student AWS Lambda
backend has been decommissioned.

The Sheet's `category` column is expected to be one of the 8 known program categories
(`lib/program-categories.ts`): Arts, Business, Employment, Humanities, Internships,
Research, STEM, Volunteering.

## Development

```bash
npm install
npm run dev
```
