import type { Metadata } from "next";
import "./globals.css";
import ConvexClientProvider from "@/components/convex-provider";
import FloatingCoach from "@/components/floating-coach";
import Mascot from "@/components/mascot/mascot";

export const metadata: Metadata = {
  title: "L1NX — Interview Forge",
  description: "AI-powered spaced repetition interview prep system",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-forge-bg text-forge-text min-h-screen">
        <ConvexClientProvider>
          {children}
          <FloatingCoach />
          <Mascot />
        </ConvexClientProvider>
      </body>
    </html>
  );
}
