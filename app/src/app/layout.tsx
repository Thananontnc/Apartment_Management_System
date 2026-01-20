import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { I18nProvider } from "@/providers/I18nProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import SettingsToggle from "@/components/SettingsToggle";

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
      <body className="antialiased" suppressHydrationWarning>
        <AuthProvider>
          <I18nProvider>
            <ThemeProvider>
              <div className="layout-wrapper">
                {children}
              </div>
              <SettingsToggle />
            </ThemeProvider>
          </I18nProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
