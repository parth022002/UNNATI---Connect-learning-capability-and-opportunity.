import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import "./globals.css";
import ConsentModal from "../components/privacy/ConsentModal";

export const metadata: Metadata = {
  title: "UNNATI — Your Growth Companion",
  description: "Discover your strengths, build relevant skills and move your career forward.",
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
    <html lang="en">
      <body>
        <ClerkProvider>
          {children}
          <ConsentModal />
        </ClerkProvider>
      </body>
    </html>
  );
}