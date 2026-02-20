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
    <div className="min-h-screen bg-gray-50">
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
          ${showBottomNav ? "pb-24" : "pb-6"}
          ${noPadding ? "" : ""}
          ${className}
        `}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.main>

      {/* Bottom navigation */}
      {showBottomNav && <BottomNav />}
    </div>
  );
}
