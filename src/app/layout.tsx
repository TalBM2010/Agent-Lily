import type { Metadata } from "next";
import { Heebo, Rubik, Nunito, Varela_Round, Quicksand } from "next/font/google";
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

// Hebrew Headings - Varela Round (rounded, friendly)
const varelaRound = Varela_Round({
  variable: "--font-varela-round",
  subsets: ["latin", "hebrew"],
  weight: "400",
});

// English font - Quicksand (playful, rounded)
const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// English fallback - Nunito
const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "לילי 🌸 מורה לאנגלית",
  description: "למדי אנגלית עם לילי בספר הסיפורים הקסום!",
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
          ${varelaRound.variable}
          ${quicksand.variable}
          ${nunito.variable} 
          font-sans antialiased 
          bg-paper
          min-h-screen
          text-text-dark
        `}
      >
        {children}
      </body>
    </html>
  );
}
