import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";

import "./globals.css";

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "500", "600", "700"],
});

const sans = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Nuby Arango Pérez | Psicología con sentido humano",
  description:
    "Sitio web de Nuby Arango Pérez, psicóloga clínica y organizacional. Un espacio para reconectar contigo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <meta charSet="UTF-8" />
      </head>
      <body
        className={`${serif.variable} ${sans.variable} min-h-screen bg-dawn font-sans text-pine antialiased`}
      >
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute left-0 top-0 h-[28rem] w-[28rem] rounded-full bg-white/55 blur-3xl" />
          <div className="absolute right-[-8rem] top-[12rem] h-[30rem] w-[30rem] rounded-full bg-moss/25 blur-3xl" />
          <div className="absolute bottom-[-8rem] left-[15%] h-[24rem] w-[24rem] rounded-full bg-forest/10 blur-3xl" />
        </div>
        {children}
      </body>
    </html>
  );
}
