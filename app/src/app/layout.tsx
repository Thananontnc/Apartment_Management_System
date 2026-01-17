import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LuxeStay | Apartment Management",
  description: "Premium Apartment Management System for Modern Owners",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="layout-wrapper">
          {/* We can add a global sidebar or nav here later */}
          {children}
        </div>
      </body>
    </html>
  );
}
