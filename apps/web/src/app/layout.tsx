import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import ConsentModal from "../components/privacy/ConsentModal";
import { CareerCompanionWidget } from "@/components/companion/CareerCompanionWidget";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#4C1D95",
};

export const metadata: Metadata = {
  title: "UNNATI — Your Growth Companion",
  description: "Discover your strengths, build relevant skills and move your career forward. Objective career intelligence across Business, Analytics, Finance, Design and Technology.",
  icons: {
    icon: [
      { url: "/icon.png" },
      { url: "/favicon.ico", sizes: "32x32" }
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180" }
    ],
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Poppins:wght@500;600;700;800;900&display=swap"
            rel="stylesheet"
          />
        </head>
        <body className="min-h-screen bg-warm-pattern text-slate-900 font-sans antialiased selection:bg-purple-200 selection:text-purple-900">
          {children}
          <ConsentModal />
          <CareerCompanionWidget />
        </body>
      </html>
    </ClerkProvider>
  );
}
