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
          : "bg-white border-b border-gray-200"
        }
      `}
    >
      <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
        {/* Left side - Back button */}
        <div className="w-11">
          {showBack && (
            <motion.button
              onClick={() => router.back()}
              className="w-11 h-11 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </motion.button>
          )}
        </div>

        {/* Center - Title */}
        {title && (
          <h1 className="text-lg font-bold text-gray-800">
            {title}
          </h1>
        )}

        {/* Right side */}
        <div className="w-11 flex justify-end">
          {rightContent}
          {showLogout && (
            <motion.button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-11 h-11 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <LogOut className="w-5 h-5 text-gray-600" />
            </motion.button>
          )}
        </div>
      </div>
    </header>
  );
}
