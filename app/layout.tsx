import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "localed.info",
  description: "Simple web presence for small local businesses",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
