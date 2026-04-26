import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kova — Budget Dashboard",
  description: "Couples budget dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider taskUrls={{ 'choose-organization': '/onboarding' }}>
      <html lang="en">
        <body style={{ margin: 0 }}>{children}</body>
      </html>
    </ClerkProvider>
  );
}
