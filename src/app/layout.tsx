import type { Metadata } from "next";
import "./globals.css";

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
      <head>
        <style>{`
          * {
            font-family: 'Space Grotesk', sans-serif !important;
          }
        `}</style>
      </head>
      <body className="min-h-screen font-sans" style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}
