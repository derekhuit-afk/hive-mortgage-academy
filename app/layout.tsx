import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hive Mortgage Academy — Day 1 LO Training",
  description: "You passed the test. Now learn how to actually build a mortgage career. AI-powered training for new loan officers — built by an LO with 1B+ in production.",
  keywords: "loan officer training, mortgage academy, LO coaching, mortgage career, NMLS training",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
        <script src="https://ase.huit.ai/widget.js" data-product="DEFAULT" defer></script>
      </body>
    </html>
  );
}
