// app/layout.tsx
// Bu dosya bir Sunucu Bileşenidir (varsayılan olarak).
// Client-side hook'lar veya DOM etkileşimleri burada olmaz.

import "./globals.css"; // Global CSS dosyanız
import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Örnek olarak Inter fontu

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Film Uygulaması",
  description: "Next.js ile film keşif uygulaması",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        {/* Navbar ve GenreList burada doğrudan render edilmiyor. */}
        {/* Bunlar artık `MainLayoutWrapper` bileşeni içinde yer alıyor. */}
        {/* `children` prop'u, `app/page.tsx` veya `app/movie/[id]/page.tsx` içeriğini alacak. */}
        {children}
      </body>
    </html>
  );
}