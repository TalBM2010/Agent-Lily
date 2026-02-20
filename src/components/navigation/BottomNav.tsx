"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Home, BookOpen, Gamepad2, User } from "lucide-react";

const navItems = [
  { href: "/dashboard", icon: Home, label: "בית", labelEn: "Home" },
  { href: "/topics", icon: BookOpen, label: "שיעורים", labelEn: "Lessons" },
  { href: "/games", icon: Gamepad2, label: "משחקים", labelEn: "Games" },
  { href: "/profile", icon: User, label: "פרופיל", labelEn: "Profile" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom">
      <div className="bg-cream-50/95 backdrop-blur-lg border-t border-wood-light/30 shadow-warm-lg">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex flex-col items-center justify-center px-3 py-2 min-w-[60px]"
              >
                <motion.div
                  className={`
                    relative p-2 rounded-xl transition-colors duration-200
                    ${isActive 
                      ? "bg-garden-gradient text-white shadow-garden" 
                      : "text-text-light hover:text-garden-green-dark hover:bg-cream-200"
                    }
                  `}
                  whileTap={{ scale: 0.9 }}
                >
                  <Icon className="w-5 h-5" />
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-xl bg-white/20"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      layoutId="navHighlight"
                    />
                  )}
                </motion.div>
                <span
                  className={`
                    text-xs mt-1 font-medium transition-colors duration-200
                    ${isActive ? "text-garden-green-dark" : "text-text-light"}
                  `}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
