import type { Metadata } from "next";
import { Inter, Caveat, Playfair_Display, Lora } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/hooks/useTheme";
import { AuthProvider } from "@/hooks/useAuth";
import { LanguageProvider } from "@/hooks/useLanguage";

const inter = Inter({ subsets: ["latin", "vietnamese"], variable: "--font-inter", weight: ['300', '400', '500', '600', '700', '800', '900'] });
const caveat = Caveat({ subsets: ["latin"], variable: "--font-accent", weight: ['400', '700'] });

// Import high-quality editorial Serif fonts with Vietnamese subset
const playfair = Playfair_Display({ 
  subsets: ["latin", "vietnamese"], 
  variable: "--font-serif-heading", 
  weight: ['400', '500', '600', '700'] 
});
const lora = Lora({ 
  subsets: ["latin", "vietnamese"], 
  variable: "--font-serif-body", 
  weight: ['400', '500', '600', '700'] 
});

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Tour Chọn Lọc - Luôn mang lại giá trị cốt lõi",
  description: "Trải nghiệm thế giới theo phong cách riêng with các tour du lịch bản sắc của chúng tôi.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${inter.variable} ${caveat.variable} ${playfair.variable} ${lora.variable}`}>
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
