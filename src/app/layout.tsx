import type { Metadata } from "next";
import { Raleway, Caveat } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/hooks/useTheme";
import { AuthProvider } from "@/hooks/useAuth";
import { LanguageProvider } from "@/hooks/useLanguage";

const ralewayBody = Raleway({ subsets: ["latin", "vietnamese"], variable: "--font-body", weight: ['300', '400', '500', '600', '700'] });
const ralewayHeading = Raleway({ subsets: ["latin", "vietnamese"], variable: "--font-heading", weight: ['400', '500', '600', '700', '800', '900'] });
const caveat = Caveat({ subsets: ["latin"], variable: "--font-accent", weight: ['400', '700'] });

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "TravelApp - Đại lý Du lịch Sang trọng",
  description: "Trải nghiệm thế giới theo phong cách riêng với các tour du lịch bản sắc của chúng tôi.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${ralewayBody.variable} ${ralewayHeading.variable} ${caveat.variable}`}>
        <AuthProvider>
          <LanguageProvider>
            <ThemeProvider>
              {children}
            </ThemeProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
