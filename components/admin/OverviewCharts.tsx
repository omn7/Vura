"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Award, Mail, AlertTriangle, RefreshCw } from "lucide-react";

interface TrendItem {
    label: string;
    count: number;
}

interface StatusBreakdown {
    sent: number;
    pending: number;
    failed: number;
    revoked: number;
}

interface Props {
    trendData: TrendItem[];
    statusBreakdown: StatusBreakdown;
}

export default function OverviewCharts({ trendData, statusBreakdown }: Props) {
    const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

    // Calculate maximum trend count (default to at least 10 for a good scale)
    const maxVal = Math.max(...trendData.map(d => d.count), 10);
    
    // SVG Dimensions
    const svgWidth = 500;
    const svgHeight = 160;
    const paddingX = 40;
    const paddingY = 20;
    
    const chartWidth = svgWidth - paddingX * 2;
    const chartHeight = svgHeight - paddingY * 2;

    // Map data points to SVG Coordinates
    const points = trendData.map((d, i) => {
        const x = paddingX + (i / (trendData.length - 1)) * chartWidth;
        const y = paddingY + chartHeight - (d.count / maxVal) * chartHeight;
        return { x, y, label: d.label, count: d.count };
    });

    // Create SVG Path for Area Chart
    const linePath = points.length > 0 
        ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(" ")
        : "";

    const areaPath = points.length > 0
        ? `${linePath} L ${points[points.length - 1].x} ${paddingY + chartHeight} L ${points[0].x} ${paddingY + chartHeight} Z`
        : "";

    // Status breakdown calculation
    const totalStatus = statusBreakdown.sent + statusBreakdown.pending + statusBreakdown.failed + statusBreakdown.revoked;
    const getPercentage = (val: number) => {
        if (totalStatus === 0) return 0;
        return Math.round((val / totalStatus) * 100);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {/* SVG Trend Chart */}
            <div className="md:col-span-2 space-y-4">
                <div className="relative bg-[#070707] border border-[var(--color-neon-border)] rounded-2xl p-4 shadow-inner overflow-hidden min-h-[220px] flex flex-col justify-end">
                    {/* Background Grid Lines */}
                    <div className="absolute inset-0 flex flex-col justify-between py-5 px-9 opacity-5 pointer-events-none">
                        <div className="w-full h-px bg-white" />
                        <div className="w-full h-px bg-white" />
                        <div className="w-full h-px bg-white" />
                        <div className="w-full h-px bg-white" />
                    </div>

                    <div className="relative w-full h-[160px] select-none">
                        <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
                            <defs>
                                <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="rgba(0, 229, 153, 0.35)" />
                                    <stop offset="100%" stopColor="rgba(0, 229, 153, 0.0)" />
                                </linearGradient>
                            </defs>

                            {/* Area Fill */}
                            {areaPath && (
                                <motion.path
                                    d={areaPath}
                                    fill="url(#chartGlow)"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                />
                            )}

                            {/* Line */}
                            {linePath && (
                                <motion.path
                                    d={linePath}
                                    fill="none"
                                    stroke="var(--color-neon-primary)"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 1.2, ease: "easeInOut" }}
                                />
                            )}

                            {/* Horizontal Axes Labels (Max / Mid / Zero) */}
                            <text x={8} y={paddingY + 4} fill="var(--color-neon-muted)" fontSize="9" fontWeight="bold" className="font-mono">
                                {maxVal}
                            </text>
                            <text x={8} y={paddingY + chartHeight / 2 + 4} fill="var(--color-neon-muted)" fontSize="9" fontWeight="bold" className="font-mono">
                                {Math.round(maxVal / 2)}
                            </text>
                            <text x={8} y={paddingY + chartHeight + 4} fill="var(--color-neon-muted)" fontSize="9" fontWeight="bold" className="font-mono">
                                0
                            </text>

                            {/* Y axis line */}
                            <line x1={32} y1={paddingY} x2={32} y2={paddingY + chartHeight} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                            {/* X axis line */}
                            <line x1={32} y1={paddingY + chartHeight} x2={svgWidth - 16} y2={paddingY + chartHeight} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

                            {/* Interactive Data Nodes */}
                            {points.map((p, i) => (
                                <g key={i} className="cursor-pointer">
                                    {/* X label */}
                                    <text 
                                        x={p.x} 
                                        y={paddingY + chartHeight + 18} 
                                        fill={hoveredIdx === i ? "#fff" : "var(--color-neon-muted)"} 
                                        fontSize="10" 
                                        textAnchor="middle"
                                        fontWeight={hoveredIdx === i ? "bold" : "normal"}
                                        className="transition-colors duration-150"
                                    >
                                        {p.label}
                                    </text>

                                    {/* Interactive Hover Zone (Vertical Bar) */}
                                    <rect
                                        x={p.x - 20}
                                        y={paddingY}
                                        width={40}
                                        height={chartHeight}
                                        fill="transparent"
                                        onMouseEnter={() => setHoveredIdx(i)}
                                        onMouseLeave={() => setHoveredIdx(null)}
                                    />

                                    {/* Outer Pulse */}
                                    {hoveredIdx === i && (
                                        <circle
                                            cx={p.x}
                                            cy={p.y}
                                            r="9"
                                            fill="rgba(0, 229, 153, 0.2)"
                                            stroke="var(--color-neon-primary)"
                                            strokeWidth="1"
                                            className="animate-ping"
                                        />
                                    )}

                                    {/* Data Circle */}
                                    <circle
                                        cx={p.x}
                                        cy={p.y}
                                        r={hoveredIdx === i ? "6" : "4"}
                                        fill={hoveredIdx === i ? "#fff" : "var(--color-neon-primary)"}
                                        stroke="var(--color-neon-bg)"
                                        strokeWidth="1.5"
                                        className="transition-all duration-150"
                                        onMouseEnter={() => setHoveredIdx(i)}
                                        onMouseLeave={() => setHoveredIdx(null)}
                                    />
                                </g>
                            ))}
                        </svg>

                        {/* Tooltip Overlay */}
                        <AnimatePresence>
                            {hoveredIdx !== null && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                    style={{
                                        position: "absolute",
                                        left: points[hoveredIdx].x - 60,
                                        top: points[hoveredIdx].y - 50,
                                    }}
                                    className="px-3 py-1.5 bg-[#0e0e0e] border border-[var(--color-neon-primary)]/40 rounded-xl text-center shadow-lg z-20 pointer-events-none min-w-[120px]"
                                >
                                    <p className="text-[10px] text-[var(--color-neon-muted)] font-bold uppercase tracking-wider">{points[hoveredIdx].label}</p>
                                    <p className="text-sm font-black text-white">{points[hoveredIdx].count} certs</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Status Distribution Breakdown */}
            <div className="flex flex-col justify-between space-y-4">
                <div className="p-4 bg-[#070707] border border-[var(--color-neon-border)] rounded-2xl h-full flex flex-col justify-between">
                    <div>
                        <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Status Distribution</h3>
                        <div className="space-y-3">
                            {/* Sent Progress */}
                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-[var(--color-neon-muted)] flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-neon-primary)]" />
                                        Sent
                                    </span>
                                    <span className="text-white font-bold">{statusBreakdown.sent} ({getPercentage(statusBreakdown.sent)}%)</span>
                                </div>
                                <div className="h-1.5 w-full bg-[var(--color-neon-border)] rounded-full overflow-hidden">
                                    <motion.div 
                                        className="h-full bg-[var(--color-neon-primary)] rounded-full" 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${getPercentage(statusBreakdown.sent)}%` }}
                                        transition={{ duration: 1, delay: 0.2 }}
                                    />
                                </div>
                            </div>

                            {/* Pending Progress */}
                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-[var(--color-neon-muted)] flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                                        Pending
                                    </span>
                                    <span className="text-white font-bold">{statusBreakdown.pending} ({getPercentage(statusBreakdown.pending)}%)</span>
                                </div>
                                <div className="h-1.5 w-full bg-[var(--color-neon-border)] rounded-full overflow-hidden">
                                    <motion.div 
                                        className="h-full bg-yellow-500 rounded-full" 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${getPercentage(statusBreakdown.pending)}%` }}
                                        transition={{ duration: 1, delay: 0.3 }}
                                    />
                                </div>
                            </div>

                            {/* Revoked Progress */}
                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-[var(--color-neon-muted)] flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                                        Revoked
                                    </span>
                                    <span className="text-white font-bold">{statusBreakdown.revoked} ({getPercentage(statusBreakdown.revoked)}%)</span>
                                </div>
                                <div className="h-1.5 w-full bg-[var(--color-neon-border)] rounded-full overflow-hidden">
                                    <motion.div 
                                        className="h-full bg-purple-500 rounded-full" 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${getPercentage(statusBreakdown.revoked)}%` }}
                                        transition={{ duration: 1, delay: 0.4 }}
                                    />
                                </div>
                            </div>

                            {/* Failed Progress */}
                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-[var(--color-neon-muted)] flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                        Failed
                                    </span>
                                    <span className="text-white font-bold">{statusBreakdown.failed} ({getPercentage(statusBreakdown.failed)}%)</span>
                                </div>
                                <div className="h-1.5 w-full bg-[var(--color-neon-border)] rounded-full overflow-hidden">
                                    <motion.div 
                                        className="h-full bg-red-500 rounded-full" 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${getPercentage(statusBreakdown.failed)}%` }}
                                        transition={{ duration: 1, delay: 0.5 }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[var(--color-neon-border)] text-[10px] text-[var(--color-neon-muted)] flex items-center gap-2">
                        <Award className="w-3.5 h-3.5 text-[var(--color-neon-primary)]" />
                        <span>Metrics reflect all system-wide engine outputs</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
