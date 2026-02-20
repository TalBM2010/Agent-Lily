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
    <div className="min-h-screen bg-storybook relative overflow-hidden">
      {/* Storybook decorations */}
      <div className="storybook-decorations">
        {/* Floating leaves */}
        <motion.span
          className="absolute text-2xl opacity-20"
          style={{ top: "12%", left: "3%" }}
          animate={{ y: [0, -8, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          🍃
        </motion.span>
        <motion.span
          className="absolute text-xl opacity-15"
          style={{ top: "35%", right: "5%" }}
          animate={{ y: [0, -6, 0], rotate: [0, -3, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        >
          🌿
        </motion.span>
        
        {/* Floating flower */}
        <motion.span
          className="absolute text-2xl opacity-25"
          style={{ bottom: "25%", left: "5%" }}
          animate={{ y: [0, -10, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          🌸
        </motion.span>
        
        {/* Subtle butterfly */}
        <motion.span
          className="absolute text-lg opacity-30"
          style={{ top: "50%", right: "8%" }}
          animate={{ 
            x: [0, 15, 0], 
            y: [0, -10, 0]
          }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        >
          🦋
        </motion.span>
      </div>

      {/* Warm vignette */}
      <div className="vignette" />

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
