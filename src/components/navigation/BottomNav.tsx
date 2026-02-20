"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Home, BookOpen, Gamepad2, User } from "lucide-react";

const navItems = [
  { href: "/dashboard", icon: Home, label: "בית" },
  { href: "/topics", icon: BookOpen, label: "שיעורים" },
  { href: "/games", icon: Gamepad2, label: "משחקים" },
  { href: "/profile", icon: User, label: "פרופיל" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      {/* Safe area background */}
      <div className="bg-white/95 backdrop-blur-xl border-t border-cream-200 shadow-lg safe-area-bottom">
        <div className="flex items-center justify-around px-2 py-2 max-w-lg mx-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex flex-col items-center justify-center w-full py-2"
              >
                <motion.div
                  className={`
                    relative flex flex-col items-center justify-center
                    w-16 h-14 rounded-2xl transition-all duration-200
                    ${isActive 
                      ? "bg-gradient-to-br from-garden-green to-garden-green-dark shadow-lg" 
                      : "hover:bg-cream-100"
                    }
                  `}
                  whileTap={{ scale: 0.9 }}
                >
                  <Icon 
                    className={`w-6 h-6 ${isActive ? "text-white" : "text-text-light"}`} 
                  />
                  <span
                    className={`
                      text-xs mt-1 font-bold transition-colors duration-200
                      ${isActive ? "text-white" : "text-text-light"}
                    `}
                  >
                    {item.label}
                  </span>
                  
                  {/* Active indicator dot */}
                  {isActive && (
                    <motion.div
                      className="absolute -bottom-1 w-1.5 h-1.5 bg-white rounded-full"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      layoutId="navDot"
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
