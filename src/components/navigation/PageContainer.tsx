"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { BottomNav } from "./BottomNav";
import { TopNav } from "./TopNav";

interface PageContainerProps {
  children: ReactNode;
  title?: string;
  showTopNav?: boolean;
  showBottomNav?: boolean;
  showBack?: boolean;
  showLogout?: boolean;
  topNavTransparent?: boolean;
  rightContent?: ReactNode;
  noPadding?: boolean;
  className?: string;
}

export function PageContainer({
  children,
  title,
  showTopNav = true,
  showBottomNav = true,
  showBack = true,
  showLogout = false,
  topNavTransparent = false,
  rightContent,
  noPadding = false,
  className = "",
}: PageContainerProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-100 via-purple-50 to-pink-100">
      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-0 w-64 h-64 bg-purple-200/40 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-0 w-72 h-72 bg-pink-200/40 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-yellow-200/30 rounded-full blur-3xl" />
      </div>

      {/* Top navigation */}
      {showTopNav && (
        <TopNav
          title={title}
          showBack={showBack}
          showLogout={showLogout}
          rightContent={rightContent}
          transparent={topNavTransparent}
        />
      )}

      {/* Main content */}
      <motion.main
        className={`
          relative z-10
          ${showBottomNav ? "pb-24" : "pb-4"}
          ${noPadding ? "" : "px-4 pt-4"}
          ${className}
        `}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.main>

      {/* Bottom navigation */}
      {showBottomNav && <BottomNav />}
    </div>
  );
}
