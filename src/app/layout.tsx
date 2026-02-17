import type { Metadata } from "next";
import { Heebo, Rubik, Nunito } from "next/font/google";
import "./globals.css";

// Hebrew fonts
const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["latin", "hebrew"],
  weight: ["400", "500", "600", "700"],
});

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin", "hebrew"],
  weight: ["500", "600", "700", "800"],
});

// English font (for lessons)
const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "לילי ✨ מורה לאנגלית",
  description: "למדי אנגלית עם לילי הפיה הקסומה!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body 
        className={`
          ${heebo.variable} 
          ${rubik.variable} 
          ${nunito.variable} 
          font-sans antialiased 
          bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 
          min-h-screen
        `}
      >
        {children}
      </body>
    </html>
  );
}
