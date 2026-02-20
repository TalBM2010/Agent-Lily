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
      <div className="bg-white border-t border-gray-200 shadow-lg safe-area-bottom">
        <div className="flex items-center justify-around px-2 py-2 max-w-lg mx-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center w-full py-1"
              >
                <motion.div
                  className={`
                    flex flex-col items-center justify-center
                    w-14 h-12 rounded-xl transition-all duration-200
                    ${isActive 
                      ? "bg-lily" 
                      : "hover:bg-gray-100"
                    }
                  `}
                  whileTap={{ scale: 0.9 }}
                >
                  <Icon 
                    className={`w-5 h-5 ${isActive ? "text-white" : "text-gray-400"}`} 
                  />
                  <span
                    className={`
                      text-xs mt-0.5 font-bold
                      ${isActive ? "text-white" : "text-gray-400"}
                    `}
                  >
                    {item.label}
                  </span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
