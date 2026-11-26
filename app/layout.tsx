import type { Metadata } from "next"
import "./globals.css"

// An env var explicitly set to "" (e.g. in .env.local) means "turn this off"
// and must be told apart from one that's simply unset, so these compare
// against undefined rather than using `||`.
const logoPath =
  process.env.NEXT_PUBLIC_LOGO_PATH !== undefined ? process.env.NEXT_PUBLIC_LOGO_PATH : "/ljcds.png"
const fontStylesheetUrl =
  process.env.NEXT_PUBLIC_FONT_STYLESHEET_URL !== undefined
    ? process.env.NEXT_PUBLIC_FONT_STYLESHEET_URL
    : "https://use.typekit.net/bqg8evd.css"

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_SITE_TITLE || "Summer Enrichment",
  description: process.env.NEXT_PUBLIC_SITE_DESCRIPTION || "Summer enrichment programs and opportunities.",
  icons: logoPath ? { icon: logoPath } : undefined,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {fontStylesheetUrl && <link rel="stylesheet" href={fontStylesheetUrl} />}
      </head>
      <body>{children}</body>
    </html>
  );
}
