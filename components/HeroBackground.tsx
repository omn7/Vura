"use client"

import { motion } from "framer-motion"

export default function HeroBackgroundInner() {
    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden bg-[#02040A]">
            
            {/* ─── 1. DYNAMIC LIGHT SOURCES ─── */}
            {/* These massive glowing orbs live behind the "glass" and illuminate it */}
            
            {/* Core center intense glow */}
            <motion.div 
               className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] lg:w-[70vw] h-[120vh] rounded-full mix-blend-screen"
               style={{ 
                   background: "radial-gradient(ellipse at center, rgba(0, 229, 153, 0.75) 0%, rgba(0, 229, 153, 0.3) 40%, transparent 80%)",
                   filter: "blur(70px)"
               }}
               animate={{ 
                   opacity: [0.7, 1, 0.7],
                   scale: [1, 1.05, 1],
               }}
               transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Drifting secondary light (Cyan) */}
            <motion.div 
               className="absolute top-0 bottom-0 w-[50vw] mix-blend-screen"
               style={{ 
                   background: "linear-gradient(to right, transparent, rgba(34, 211, 238, 0.35), transparent)",
                   filter: "blur(60px)"
               }}
               animate={{ x: ["-50vw", "100vw"] }}
               transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            />

            {/* Drifting secondary light (Green) */}
            <motion.div 
               className="absolute top-0 bottom-0 w-[40vw] mix-blend-screen"
               style={{ 
                   background: "linear-gradient(to right, transparent, rgba(0, 229, 153, 0.3), transparent)",
                   filter: "blur(50px)"
               }}
               animate={{ x: ["100vw", "-50vw"] }}
               transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
            />


            {/* ─── 2. RIBBED GLASS MASK (THE BARS) ─── */}
            {/* This layer blocks light at the edges to simulate 3D cylindrical vertical bars */}
            <div className="absolute inset-0 pointer-events-none" style={{
                background: `repeating-linear-gradient(
                    to right,
                    rgba(2, 4, 10, 0.95) 0px,
                    rgba(2, 4, 10, 0) 3px,
                    rgba(2, 4, 10, 0) 5px,
                    rgba(2, 4, 10, 0.95) 8px
                )`,
            }} />

            {/* A secondary ultra-fine stripe to give the glass a frosted/machined texture */}
            <div className="absolute inset-0 pointer-events-none opacity-40" style={{
                background: `repeating-linear-gradient(
                    to right,
                    transparent 0px,
                    rgba(0,0,0,0.8) 1px,
                    transparent 2px
                )`,
            }} />


            {/* ─── 3. BASE VIGNETTES ─── */}
            {/* Smooths the edges out into pure black to blend with the rest of the site */}
            <div className="absolute inset-0 pointer-events-none" style={{
                background: "radial-gradient(circle at center, transparent 20%, #030303 90%)"
            }} />
            
            <div className="absolute top-0 left-0 right-0 h-[15vh] pointer-events-none" style={{
                background: "linear-gradient(to bottom, #030303 0%, transparent 100%)"
            }} />
            <div className="absolute bottom-0 left-0 right-0 h-[15vh] pointer-events-none" style={{
                background: "linear-gradient(to top, #030303 0%, transparent 100%)"
            }} />

        </div>
    )
}
