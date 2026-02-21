"use client"

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-[var(--color-neon-bg)] text-white flex flex-col items-center justify-center relative overflow-hidden px-6">
            {/* Background Gradients */}
            <div className="absolute inset-0 pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.1, 0.2, 0.1],
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(0,229,153,0.3)_0%,rgba(157,78,221,0.1)_45%,transparent_70%)] blur-[80px]"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.1, 0.25, 0.1],
                    }}
                    transition={{
                        duration: 12,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1,
                    }}
                    className="absolute bottom-1/4 right-1/4 w-[600px] h-[400px] bg-[radial-gradient(ellipse_at_center,rgba(157,78,221,0.3)_0%,transparent_70%)] blur-[80px]"
                />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="glass-card flex flex-col items-center text-center p-12 max-w-2xl w-full z-10 border-[var(--color-neon-border)] shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-[rgba(10,10,10,0.6)] backdrop-blur-2xl relative overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--color-neon-primary)] via-[var(--color-neon-purple)] to-[var(--color-neon-secondary)]"></div>
                <h1 className="text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-[var(--color-neon-muted)] tracking-tighter mb-4 shadow-sm drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                    404
                </h1>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                    Page not found
                </h2>
                <p className="text-[var(--color-neon-muted)] text-lg mb-10 max-w-md mx-auto">
                    Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved or doesn&apos;t exist.
                </p>
                <Link
                    href="/"
                    className="btn-primary py-3 px-8 flex items-center justify-center gap-2 group w-full sm:w-auto"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    Go back home
                </Link>
            </motion.div>
        </div>
    );
}
