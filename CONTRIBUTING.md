# Contributing

Thanks for considering a contribution. This is a small Next.js app with no backend beyond a
Google Sheet, so getting set up is quick.

## Setup

```bash
git clone https://github.com/LukeG294/enrichment-programs.git
cd enrichment-programs
npm install
npm run setup   # points your local copy at your own test Sheet (see README)
npm run dev
```

You don't need access to any production data — copy the
[template Sheet](https://docs.google.com/spreadsheets/d/1sO8OVoDH1I2nAPeJmwjzBdaYrIPsjWEOE6fVRXheOYU/edit)
and point `npm run setup` at your copy to get a working local instance with sample data.

## Making changes

- Keep PRs focused — one feature or fix per PR is easier to review than several bundled together.
- Run `npm run build` and `npm run lint` before opening a PR; both should pass cleanly.
- UI changes should be checked in the browser (`npm run dev`), not just type-checked.
- This app is intentionally dependency-light and has no database — if a change would require
  adding one, open an issue first to discuss whether it fits the project's scope.

## Reporting bugs / requesting features

Open an [issue](https://github.com/LukeG294/enrichment-programs/issues) with:
- What you expected vs. what happened.
- Steps to reproduce, if it's a bug.
- Whether it's about the hosted LJCDS instance specifically or the app in general.
