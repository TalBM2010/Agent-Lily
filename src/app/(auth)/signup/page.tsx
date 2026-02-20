"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Create account
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "שגיאה בהרשמה");
        setIsLoading(false);
        return;
      }

      // Auto sign in after signup
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("נרשמת בהצלחה! אנא התחבר");
        router.push("/login");
      } else {
        router.push("/children");
        router.refresh();
      }
    } catch {
      setError("שגיאה בהרשמה");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setIsLoading(true);
    await signIn("google", { callbackUrl: "/children" });
  }

  return (
    <main className="min-h-screen min-h-dvh bg-storybook flex items-center justify-center px-4 relative overflow-hidden">
      {/* Storybook decorations */}
      <div className="storybook-decorations">
        {/* Floating leaves */}
        <motion.span
          className="absolute text-3xl opacity-30"
          style={{ top: "12%", right: "10%" }}
          animate={{ y: [0, -12, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          🍃
        </motion.span>
        <motion.span
          className="absolute text-2xl opacity-25"
          style={{ bottom: "20%", left: "8%" }}
          animate={{ y: [0, -8, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
        >
          🌿
        </motion.span>
        
        {/* Floating flowers */}
        <motion.span
          className="absolute text-3xl opacity-40"
          style={{ top: "25%", left: "10%" }}
          animate={{ y: [0, -6, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          🌷
        </motion.span>
        <motion.span
          className="absolute text-2xl opacity-35"
          style={{ bottom: "30%", right: "15%" }}
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        >
          🌸
        </motion.span>
        
        {/* Little bird */}
        <motion.span
          className="absolute text-2xl opacity-45"
          style={{ top: "40%", right: "5%" }}
          animate={{ 
            x: [0, -20, 0], 
            y: [0, -15, 0],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          🐦
        </motion.span>
      </div>
      
      {/* Soft vignette */}
      <div className="vignette" />

      <motion.div
        className="relative z-10 w-full max-w-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Logo */}
        <div className="text-center mb-6">
          <motion.div 
            className="relative inline-block"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <span className="text-6xl">🌸</span>
            <motion.span
              className="absolute -top-1 -left-1 text-xl"
              animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.1, 0.8] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
            >
              ✨
            </motion.span>
          </motion.div>
          <h1 className="text-2xl font-bold font-heading text-text-dark mt-2">הצטרפו ללילי!</h1>
          <p className="text-garden-green-dark font-medium">צרו חשבון והתחילו ללמוד אנגלית</p>
        </div>

        {/* Form Card - Storybook style */}
        <div className="card-storybook p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-lily-pink-light text-lily-pink-dark text-sm p-3 rounded-xl text-center border border-lily-pink">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-text-dark mb-1.5 text-right">
                שם
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-storybook text-right"
                placeholder="השם שלך"
                required
                minLength={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-dark mb-1.5 text-right">
                אימייל
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-storybook"
                placeholder="your@email.com"
                dir="ltr"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-dark mb-1.5 text-right">
                סיסמה
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-storybook"
                placeholder="לפחות 6 תווים"
                dir="ltr"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary"
            >
              {isLoading ? "נרשם..." : "הרשמה 🌟"}
            </button>
          </form>

          <div className="my-4 flex items-center gap-3">
            <div className="flex-1 h-px bg-cream-300" />
            <span className="text-sm text-text-light">או</span>
            <div className="flex-1 h-px bg-cream-300" />
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full btn-outline flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            הרשמה עם Google
          </button>
        </div>

        {/* Login link */}
        <p className="text-center mt-4 text-text-medium">
          כבר יש לך חשבון?{" "}
          <Link href="/login" className="text-garden-green-dark font-semibold hover:underline">
            התחברות
          </Link>
        </p>
      </motion.div>
    </main>
  );
}
