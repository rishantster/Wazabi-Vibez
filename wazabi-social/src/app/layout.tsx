import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import { Header } from "@/components/layout/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wazabi — Social Layer for Token Launches",
  description:
    "Discover token launches ranked by creator reputation, vesting conviction, and LP commitment. A social feed where every launch is a post.",
  openGraph: {
    title: "Wazabi",
    description: "Social layer for token launches",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen">
        <Providers>
          <Header />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
