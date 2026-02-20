"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronRight, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

interface TopNavProps {
  title?: string;
  showBack?: boolean;
  showLogout?: boolean;
  rightContent?: ReactNode;
  transparent?: boolean;
}

export function TopNav({
  title,
  showBack = true,
  showLogout = false,
  rightContent,
  transparent = false,
}: TopNavProps) {
  const router = useRouter();

  return (
    <header
      className={`
        sticky top-0 z-40 safe-area-top
        ${transparent 
          ? "bg-transparent" 
          : "bg-white/90 backdrop-blur-xl border-b border-cream-200 shadow-sm"
        }
      `}
    >
      <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
        {/* Left side - Back button */}
        <div className="w-12">
          {showBack && (
            <motion.button
              onClick={() => router.back()}
              className="w-12 h-12 flex items-center justify-center rounded-xl bg-cream-100 hover:bg-cream-200 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronRight className="w-6 h-6 text-text-medium" />
            </motion.button>
          )}
        </div>

        {/* Center - Title */}
        {title && (
          <motion.h1
            className="text-lg font-bold text-text-dark"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {title}
          </motion.h1>
        )}

        {/* Right side */}
        <div className="w-12 flex justify-end">
          {rightContent}
          {showLogout && (
            <motion.button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-12 h-12 flex items-center justify-center rounded-xl bg-cream-100 hover:bg-cream-200 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <LogOut className="w-5 h-5 text-text-medium" />
            </motion.button>
          )}
        </div>
      </div>
    </header>
  );
}
