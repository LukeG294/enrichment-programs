import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Summer Enrichment",
  description: "Summer enrichment programs and opportunities.",
  icons: {
    icon: "/ljcds.png",
  },
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://use.typekit.net/bqg8evd.css"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
