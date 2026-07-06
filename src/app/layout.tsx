import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Online Resturent",
  description: "A modern online restaurant ordering and menu starter."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

