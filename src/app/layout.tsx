import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "3D Gallery Portfolio",
  description: "An immersive 3D gallery experience showcasing my work",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ height: '100%' }}>
      <body className={`${inter.className} min-h-screen`} style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}
