"use client";

import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronRight, LogOut, Settings } from "lucide-react";
import { signOut } from "next-auth/react";

interface TopNavProps {
  title?: string;
  showBack?: boolean;
  showSettings?: boolean;
  showLogout?: boolean;
  rightContent?: React.ReactNode;
  transparent?: boolean;
}

export function TopNav({
  title,
  showBack = true,
  showSettings = false,
  showLogout = false,
  rightContent,
  transparent = false,
}: TopNavProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleBack = () => {
    // Smart back navigation
    if (pathname.includes("/games/")) {
      router.push("/games");
    } else if (pathname.includes("/lesson")) {
      router.push("/topics");
    } else if (pathname === "/topics" || pathname === "/games" || pathname === "/profile") {
      router.push("/dashboard");
    } else {
      router.back();
    }
  };

  return (
    <nav
      className={`
        sticky top-0 z-40 safe-area-top
        ${transparent 
          ? "bg-transparent" 
          : "bg-cream-50/90 backdrop-blur-lg border-b border-wood-light/30"
        }
      `}
    >
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left side - Back button */}
        <div className="w-10">
          {showBack && (
            <motion.button
              onClick={handleBack}
              className={`
                p-2 rounded-full transition-colors
                ${transparent 
                  ? "bg-cream-50/80 text-text-dark hover:bg-cream-50" 
                  : "text-text-medium hover:bg-cream-200 hover:text-garden-green-dark"
                }
              `}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          )}
        </div>

        {/* Center - Title */}
        {title && (
          <h1 className={`
            text-lg font-bold font-heading
            ${transparent ? "text-white drop-shadow-lg" : "text-text-dark"}
          `}>
            {title}
          </h1>
        )}

        {/* Right side - Actions */}
        <div className="flex items-center gap-2">
          {rightContent}
          
          {showSettings && (
            <motion.button
              onClick={() => router.push("/settings")}
              className={`
                p-2 rounded-full transition-colors
                ${transparent 
                  ? "bg-cream-50/80 text-text-dark hover:bg-cream-50" 
                  : "text-text-medium hover:bg-cream-200 hover:text-garden-green-dark"
                }
              `}
              whileTap={{ scale: 0.9 }}
            >
              <Settings className="w-5 h-5" />
            </motion.button>
          )}

          {showLogout && (
            <motion.button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className={`
                p-2 rounded-full transition-colors
                ${transparent 
                  ? "bg-cream-50/80 text-text-dark hover:bg-cream-50" 
                  : "text-text-medium hover:bg-cream-200 hover:text-garden-green-dark"
                }
              `}
              whileTap={{ scale: 0.9 }}
              title="התנתקות"
            >
              <LogOut className="w-5 h-5" />
            </motion.button>
          )}
        </div>
      </div>
    </nav>
  );
}
