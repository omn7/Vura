"use client";

import { useState, useRef, useEffect } from "react";
import { FileUp, FileSpreadsheet, Loader2, CheckCircle, AlertCircle, Crosshair, LayoutDashboard, LogOut } from "lucide-react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";

import dynamic from 'next/dynamic';

const PdfPreview = dynamic(() => import('@/components/PdfPreview'), { ssr: false });

export default function Dashboard() {
    const { data: session, status } = useSession();

    if (status === "unauthenticated") {
        redirect("/login");
    }

    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [excelFile, setExcelFile] = useState<File | null>(null);

    const [loading, setLoading] = useState(false);
    const [statusText, setStatusText] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [successCount, setSuccessCount] = useState<number | null>(null);

    const [certificates, setCertificates] = useState<any[]>([]);

    // Coordinate Assistant State
    const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
    const [activeTarget, setActiveTarget] = useState<'name' | 'course' | 'issueDate' | 'qrCode' | null>(null);
    const [draggingTarget, setDraggingTarget] = useState<'name' | 'course' | 'issueDate' | 'qrCode' | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Explicit UI Colors for Markers
    const MARKER_COLORS = {
        name: '#3b82f6', // Blue
        course: '#22c55e', // Green
        issueDate: '#eab308', // Yellow
        qrCode: '#f97316' // Orange
    };

    // Advanced Configuration State (Coordinates as % of dimensions)
    const [config, setConfig] = useState({
        name: { enabled: true, x: 50, y: 40, size: 32, hex: "#000000" },
        course: { enabled: true, x: 50, y: 55, size: 20, hex: "#333333" },
        issueDate: { enabled: true, x: 50, y: 65, size: 14, hex: "#000000" },
        qrCode: { enabled: true, x: 80, y: 85, scale: 0.5 },
    });

    const handleConfigChange = (field: keyof typeof config, key: string, value: any) => {
        setConfig(prev => ({
            ...prev,
            [field]: { ...prev[field], [key]: value }
        }));
    };

    // --- Coordinate Visualizer Logic ---
    useEffect(() => {
        if (pdfFile) {
            const objectUrl = URL.createObjectURL(pdfFile);
            setPdfPreviewUrl(objectUrl);
            return () => URL.revokeObjectURL(objectUrl);
        } else {
            setPdfPreviewUrl(null);
        }
    }, [pdfFile]);

    const handlePdfClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!activeTarget) return;

        // Get bounding box of the react-pdf page container
        const rect = e.currentTarget.getBoundingClientRect();

        // Calculate percentage click (0-100 mapped from top-left)
        const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
        const yPercent = ((e.clientY - rect.top) / rect.height) * 100;

        // pdf-lib draws from bottom-left up, but standard coordinates usually start top-left 
        // We pass percentages and let the backend resolve the inversion and PDF scaling

        handleConfigChange(activeTarget, 'x', Number(xPercent.toFixed(2)));
        handleConfigChange(activeTarget, 'y', Number(yPercent.toFixed(2)));

        // Clear active target after click
        setActiveTarget(null);
    };

    const handleGenerate = async () => {
        if (!pdfFile || !excelFile) {
            setError("Please upload both a PDF template and an Excel dataset.");
            return;
        }

        setLoading(true);
        setError(null);
        setSuccessCount(null);
        setCertificates([]);
        setStatusText("Uploading and processing files...");

        const formData = new FormData();
        formData.append("template", pdfFile);
        formData.append("dataset", excelFile);
        formData.append("settings", JSON.stringify(config));

        try {
            const response = await fetch("/api/generate", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to generate certificates.");
            }

            setSuccessCount(data.count || 0);
            setCertificates(data.certificates || []);
            setStatusText(`Successfully generated and uploaded ${data.count} certificates.`);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex-1 flex flex-col items-center p-8 z-10 min-h-screen pt-24">
            <div className="glow-bg" style={{ top: '10%' }}></div>

            {/* Header Navbar Layer */}
            <div className="w-full max-w-6xl mb-6 flex items-center justify-between relative z-20">
                <Link href="/" className="text-xl font-black tracking-widest uppercase flex items-center gap-2 text-white">
                    <div className="w-6 h-6 rounded-md bg-[var(--color-neon-primary)] flex items-center justify-center">
                        <div className="w-2 h-2 bg-black rounded-sm rotate-45 transform"></div>
                    </div>
                    VURA
                </Link>
                <div className="flex gap-4 items-center">
                    <Link href="/dashboard" className="btn-secondary py-2 px-4 flex items-center gap-2 text-sm">
                        <LayoutDashboard className="w-4 h-4" /> Gallery
                    </Link>
                    <Link href="/api/auth/signout" className="btn-secondary py-2 px-4 flex items-center gap-2 text-sm text-red-400 hover:text-red-300 hover:border-red-400">
                        <LogOut className="w-4 h-4" /> Sign Out
                    </Link>
                </div>
            </div>

            <div className="w-full max-w-6xl glass-card relative z-10">
                <h1 className="text-3xl font-bold mb-2 text-center">Certificate Generator</h1>
                <p className="text-[var(--color-neon-muted)] mb-8 text-center max-w-2xl mx-auto">
                    Upload your base PDF template and an Excel mapping file to create and deploy verifiable certificates in bulk.
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* LEFT COLUMN: Visualizer */}
                    <div className="flex flex-col space-y-6">

                        <div className="grid grid-cols-2 gap-4">
                            {/* PDF Upload */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-[var(--color-neon-text)]">Base Template</label>
                                <div className="relative group border-2 border-dashed border-[var(--color-neon-border)] rounded-xl p-6 text-center transition-colors hover:border-[var(--color-neon-primary)] cursor-pointer h-32 flex items-center justify-center">
                                    <input
                                        type="file"
                                        accept="application/pdf"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                                    />
                                    <div className="flex flex-col items-center pointer-events-none">
                                        <FileUp className="w-6 h-6 mb-2 text-[var(--color-neon-primary)]" />
                                        <span className="text-xs">
                                            {pdfFile ? <span className="text-[var(--color-neon-primary)] truncate max-w-[120px] block">{pdfFile.name}</span> : "Browse PDF"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Excel Upload */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-[var(--color-neon-text)]">Dataset</label>
                                <div className="relative group border-2 border-dashed border-[var(--color-neon-border)] rounded-xl p-6 text-center transition-colors hover:border-[var(--color-neon-secondary)] cursor-pointer h-32 flex items-center justify-center">
                                    <input
                                        type="file"
                                        accept=".xlsx, .xls"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={(e) => setExcelFile(e.target.files?.[0] || null)}
                                    />
                                    <div className="flex flex-col items-center pointer-events-none">
                                        <FileSpreadsheet className="w-6 h-6 mb-2 text-[var(--color-neon-secondary)]" />
                                        <span className="text-xs">
                                            {excelFile ? <span className="text-[var(--color-neon-secondary)] truncate max-w-[120px] block">{excelFile.name}</span> : "Browse Excel"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* PDF Visual Coordinate Assistant */}
                        {pdfPreviewUrl ? (
                            <div className="flex-1 flex flex-col min-h-[500px]">
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="text-lg font-semibold text-[var(--color-neon-primary)]">Visualizer</h3>
                                    <button
                                        onClick={() => setIsFullscreen(true)}
                                        className="text-xs bg-[var(--color-neon-surface-hover)] border border-[var(--color-neon-border)] hover:border-[var(--color-neon-primary)] text-[var(--color-neon-text)] px-3 py-1.5 rounded-lg transition-colors"
                                    >
                                        Open Fullscreen Map
                                    </button>
                                </div>
                                <p className="text-xs text-[var(--color-neon-muted)] mb-4">Click "Target" on a setting, then click the preview. Drag markers to adjust.</p>

                                <div className="relative border-2 border-[var(--color-neon-border)] rounded-xl overflow-hidden bg-black/50 flex flex-1 items-center justify-center p-4">
                                    <div
                                        className={`relative transition-all duration-300 ${activeTarget ? 'cursor-crosshair ring-2 ring-[var(--color-neon-primary)] ring-offset-2 ring-offset-black' : ''}`}
                                        onClick={handlePdfClick}
                                        onMouseMove={(e) => {
                                            if (draggingTarget) {
                                                const rect = e.currentTarget.getBoundingClientRect();
                                                const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
                                                const yPercent = ((e.clientY - rect.top) / rect.height) * 100;

                                                // Clamp between 0 and 100
                                                const finalX = Math.max(0, Math.min(100, xPercent));
                                                const finalY = Math.max(0, Math.min(100, yPercent));

                                                handleConfigChange(draggingTarget, 'x', Number(finalX.toFixed(2)));
                                                handleConfigChange(draggingTarget, 'y', Number(finalY.toFixed(2)));
                                            }
                                        }}
                                        onMouseUp={() => setDraggingTarget(null)}
                                        onMouseLeave={() => setDraggingTarget(null)}
                                    >
                                        <PdfPreview fileUrl={pdfPreviewUrl} />

                                        {/* Visual Markers */}
                                        {(['name', 'course', 'issueDate', 'qrCode'] as const).map((key) => {
                                            const fieldParams = config[key];
                                            if (!fieldParams.enabled) return null;

                                            // Explicit UI Colors
                                            const markerColor = MARKER_COLORS[key];

                                            return (
                                                <div
                                                    key={key}
                                                    onMouseDown={(e) => {
                                                        e.stopPropagation();
                                                        setDraggingTarget(key);
                                                    }}
                                                    className={`absolute w-4 h-4 rounded-full border-2 border-white transform -translate-x-1/2 -translate-y-1/2 shadow-lg cursor-grab active:cursor-grabbing pointer-events-auto z-50 flex items-center justify-center text-[10px] font-bold text-white uppercase ${draggingTarget === key ? 'scale-150 animate-pulse' : ''}`}
                                                    style={{
                                                        left: `${fieldParams.x}%`,
                                                        top: `${fieldParams.y}%`,
                                                        backgroundColor: markerColor,
                                                        boxShadow: `0 0 10px ${markerColor}80`
                                                    }}
                                                    title={`Drag to move ${key}`}
                                                >
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-[var(--color-neon-border)] rounded-xl bg-black/20 text-[var(--color-neon-muted)] p-8 text-center min-h-[500px]">
                                <Crosshair className="w-12 h-12 mb-4 opacity-30" />
                                <p>Upload a Base Template (PDF) to activate the Visualizer</p>
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN: Settings */}
                    <div className="flex flex-col h-full space-y-6">

                        {/* Advanced Configuration Options */}
                        <div className="flex-1 border border-[var(--color-neon-border)] rounded-xl bg-[var(--color-neon-surface)] p-6 space-y-6 flex flex-col">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-[var(--color-neon-primary)]">Advanced Configuration</h3>
                                    <p className="text-xs text-[var(--color-neon-muted)] mt-1">Fine-tune formatting & coordinates.</p>
                                </div>
                            </div>

                            <div className="space-y-6 divide-y divide-[var(--color-neon-border)]/50 flex-1 overflow-y-auto pr-2">
                                {/* Name settings */}
                                <div className="pt-4 first:pt-0">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center space-x-3">
                                            <span className="w-3 h-3 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.6)]" style={{ backgroundColor: MARKER_COLORS.name }}></span>
                                            <label className="flex items-center space-x-2 cursor-pointer">
                                                <input type="checkbox" checked={config.name.enabled} onChange={(e) => handleConfigChange('name', 'enabled', e.target.checked)} className="rounded border-[var(--color-neon-border)] text-[var(--color-neon-primary)] focus:ring-[var(--color-neon-primary)] bg-[var(--color-neon-bg)]" />
                                                <span className="font-semibold" style={{ color: MARKER_COLORS.name }}>Recipient Name</span>
                                            </label>
                                        </div>
                                        {config.name.enabled && (
                                            <button onClick={() => setActiveTarget(activeTarget === 'name' ? null : 'name')} className={`text-xs px-3 py-1.5 rounded-lg flex items-center transition-colors ${activeTarget === 'name' ? 'bg-[var(--color-neon-primary)] text-black font-bold' : 'bg-[var(--color-neon-surface-hover)] border border-[var(--color-neon-border)] hover:border-[var(--color-neon-primary)]'}`}>
                                                <Crosshair className="w-3 h-3 mr-1.5" /> {activeTarget === 'name' ? 'Select on Preview...' : 'Target'}
                                            </button>
                                        )}
                                    </div>
                                    {config.name.enabled && (
                                        <div className="grid grid-cols-4 gap-4">
                                            <div><label className="text-xs text-[var(--color-neon-muted)]">X Position (%)</label><input type="number" step="0.1" value={config.name.x} onChange={e => handleConfigChange('name', 'x', Number(e.target.value))} className="w-full bg-[var(--color-neon-bg)] border border-[var(--color-neon-border)] rounded-lg p-2 text-sm mt-1" /></div>
                                            <div><label className="text-xs text-[var(--color-neon-muted)]">Y Position (%)</label><input type="number" step="0.1" value={config.name.y} onChange={e => handleConfigChange('name', 'y', Number(e.target.value))} className="w-full bg-[var(--color-neon-bg)] border border-[var(--color-neon-border)] rounded-lg p-2 text-sm mt-1" /></div>
                                            <div><label className="text-xs text-[var(--color-neon-muted)]">Font Size</label><input type="number" value={config.name.size} onChange={e => handleConfigChange('name', 'size', Number(e.target.value))} className="w-full bg-[var(--color-neon-bg)] border border-[var(--color-neon-border)] rounded-lg p-2 text-sm mt-1" /></div>
                                            <div><label className="text-xs text-[var(--color-neon-muted)]">Color (Hex)</label><input type="text" value={config.name.hex} onChange={e => handleConfigChange('name', 'hex', e.target.value)} className="w-full bg-[var(--color-neon-bg)] border border-[var(--color-neon-border)] rounded-lg p-2 text-sm mt-1 font-mono uppercase" /></div>
                                        </div>
                                    )}
                                </div>

                                {/* Course settings */}
                                <div className="pt-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center space-x-3">
                                            <span className="w-3 h-3 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]" style={{ backgroundColor: MARKER_COLORS.course }}></span>
                                            <label className="flex items-center space-x-2 cursor-pointer">
                                                <input type="checkbox" checked={config.course.enabled} onChange={(e) => handleConfigChange('course', 'enabled', e.target.checked)} className="rounded border-[var(--color-neon-border)] text-[var(--color-neon-primary)] focus:ring-[var(--color-neon-primary)] bg-[var(--color-neon-bg)]" />
                                                <span className="font-semibold" style={{ color: MARKER_COLORS.course }}>Course Name</span>
                                            </label>
                                        </div>
                                        {config.course.enabled && (
                                            <button onClick={() => setActiveTarget(activeTarget === 'course' ? null : 'course')} className={`text-xs px-3 py-1.5 rounded-lg flex items-center transition-colors ${activeTarget === 'course' ? 'bg-[var(--color-neon-primary)] text-black font-bold' : 'bg-[var(--color-neon-surface-hover)] border border-[var(--color-neon-border)] hover:border-[var(--color-neon-primary)]'}`}>
                                                <Crosshair className="w-3 h-3 mr-1.5" /> {activeTarget === 'course' ? 'Select on Preview...' : 'Target'}
                                            </button>
                                        )}
                                    </div>
                                    {config.course.enabled && (
                                        <div className="grid grid-cols-4 gap-4">
                                            <div><label className="text-xs text-[var(--color-neon-muted)]">X Position (%)</label><input type="number" step="0.1" value={config.course.x} onChange={e => handleConfigChange('course', 'x', Number(e.target.value))} className="w-full bg-[var(--color-neon-bg)] border border-[var(--color-neon-border)] rounded-lg p-2 text-sm mt-1" /></div>
                                            <div><label className="text-xs text-[var(--color-neon-muted)]">Y Position (%)</label><input type="number" step="0.1" value={config.course.y} onChange={e => handleConfigChange('course', 'y', Number(e.target.value))} className="w-full bg-[var(--color-neon-bg)] border border-[var(--color-neon-border)] rounded-lg p-2 text-sm mt-1" /></div>
                                            <div><label className="text-xs text-[var(--color-neon-muted)]">Font Size</label><input type="number" value={config.course.size} onChange={e => handleConfigChange('course', 'size', Number(e.target.value))} className="w-full bg-[var(--color-neon-bg)] border border-[var(--color-neon-border)] rounded-lg p-2 text-sm mt-1" /></div>
                                            <div><label className="text-xs text-[var(--color-neon-muted)]">Color (Hex)</label><input type="text" value={config.course.hex} onChange={e => handleConfigChange('course', 'hex', e.target.value)} className="w-full bg-[var(--color-neon-bg)] border border-[var(--color-neon-border)] rounded-lg p-2 text-sm mt-1 font-mono uppercase" /></div>
                                        </div>
                                    )}
                                </div>

                                {/* Issue Date settings */}
                                <div className="pt-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center space-x-3">
                                            <span className="w-3 h-3 rounded-full shadow-[0_0_8px_rgba(234,179,8,0.6)]" style={{ backgroundColor: MARKER_COLORS.issueDate }}></span>
                                            <label className="flex items-center space-x-2 cursor-pointer">
                                                <input type="checkbox" checked={config.issueDate.enabled} onChange={(e) => handleConfigChange('issueDate', 'enabled', e.target.checked)} className="rounded border-[var(--color-neon-border)] text-[var(--color-neon-primary)] focus:ring-[var(--color-neon-primary)] bg-[var(--color-neon-bg)]" />
                                                <span className="font-semibold" style={{ color: MARKER_COLORS.issueDate }}>Issue Date</span>
                                            </label>
                                        </div>
                                        {config.issueDate.enabled && (
                                            <button onClick={() => setActiveTarget(activeTarget === 'issueDate' ? null : 'issueDate')} className={`text-xs px-3 py-1.5 rounded-lg flex items-center transition-colors ${activeTarget === 'issueDate' ? 'bg-[var(--color-neon-primary)] text-black font-bold' : 'bg-[var(--color-neon-surface-hover)] border border-[var(--color-neon-border)] hover:border-[var(--color-neon-primary)]'}`}>
                                                <Crosshair className="w-3 h-3 mr-1.5" /> {activeTarget === 'issueDate' ? 'Select on Preview...' : 'Target'}
                                            </button>
                                        )}
                                    </div>
                                    {config.issueDate.enabled && (
                                        <div className="grid grid-cols-4 gap-4">
                                            <div><label className="text-xs text-[var(--color-neon-muted)]">X Position (%)</label><input type="number" step="0.1" value={config.issueDate.x} onChange={e => handleConfigChange('issueDate', 'x', Number(e.target.value))} className="w-full bg-[var(--color-neon-bg)] border border-[var(--color-neon-border)] rounded-lg p-2 text-sm mt-1" /></div>
                                            <div><label className="text-xs text-[var(--color-neon-muted)]">Y Position (%)</label><input type="number" step="0.1" value={config.issueDate.y} onChange={e => handleConfigChange('issueDate', 'y', Number(e.target.value))} className="w-full bg-[var(--color-neon-bg)] border border-[var(--color-neon-border)] rounded-lg p-2 text-sm mt-1" /></div>
                                            <div><label className="text-xs text-[var(--color-neon-muted)]">Font Size</label><input type="number" value={config.issueDate.size} onChange={e => handleConfigChange('issueDate', 'size', Number(e.target.value))} className="w-full bg-[var(--color-neon-bg)] border border-[var(--color-neon-border)] rounded-lg p-2 text-sm mt-1" /></div>
                                            <div><label className="text-xs text-[var(--color-neon-muted)]">Color (Hex)</label><input type="text" value={config.issueDate.hex} onChange={e => handleConfigChange('issueDate', 'hex', e.target.value)} className="w-full bg-[var(--color-neon-bg)] border border-[var(--color-neon-border)] rounded-lg p-2 text-sm mt-1 font-mono uppercase" /></div>
                                        </div>
                                    )}
                                </div>

                                {/* QR Code settings */}
                                <div className="pt-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center space-x-3">
                                            <span className="w-3 h-3 rounded-full shadow-[0_0_8px_rgba(249,115,22,0.6)]" style={{ backgroundColor: MARKER_COLORS.qrCode }}></span>
                                            <label className="flex items-center space-x-2 cursor-pointer">
                                                <input type="checkbox" checked={config.qrCode.enabled} onChange={(e) => handleConfigChange('qrCode', 'enabled', e.target.checked)} className="rounded border-[var(--color-neon-border)] text-[var(--color-neon-primary)] focus:ring-[var(--color-neon-primary)] bg-[var(--color-neon-bg)]" />
                                                <span className="font-semibold" style={{ color: MARKER_COLORS.qrCode }}>QR Code Verification Badge</span>
                                            </label>
                                        </div>
                                        {config.qrCode.enabled && (
                                            <button onClick={() => setActiveTarget(activeTarget === 'qrCode' ? null : 'qrCode')} className={`text-xs px-3 py-1.5 rounded-lg flex items-center transition-colors ${activeTarget === 'qrCode' ? 'bg-[var(--color-neon-primary)] text-black font-bold' : 'bg-[var(--color-neon-surface-hover)] border border-[var(--color-neon-border)] hover:border-[var(--color-neon-primary)]'}`}>
                                                <Crosshair className="w-3 h-3 mr-1.5" /> {activeTarget === 'qrCode' ? 'Select on Preview...' : 'Target'}
                                            </button>
                                        )}
                                    </div>
                                    {config.qrCode.enabled && (
                                        <div className="grid grid-cols-4 gap-4">
                                            <div><label className="text-xs text-[var(--color-neon-muted)]">X Position (%)</label><input type="number" step="0.1" value={config.qrCode.x} onChange={e => handleConfigChange('qrCode', 'x', Number(e.target.value))} className="w-full bg-[var(--color-neon-bg)] border border-[var(--color-neon-border)] rounded-lg p-2 text-sm mt-1" /></div>
                                            <div><label className="text-xs text-[var(--color-neon-muted)]">Y Position (%)</label><input type="number" step="0.1" value={config.qrCode.y} onChange={e => handleConfigChange('qrCode', 'y', Number(e.target.value))} className="w-full bg-[var(--color-neon-bg)] border border-[var(--color-neon-border)] rounded-lg p-2 text-sm mt-1" /></div>
                                            <div><label className="text-xs text-[var(--color-neon-muted)]">Scale Multiplier</label><input type="number" step="0.1" value={config.qrCode.scale} onChange={e => handleConfigChange('qrCode', 'scale', Number(e.target.value))} className="w-full bg-[var(--color-neon-bg)] border border-[var(--color-neon-border)] rounded-lg p-2 text-sm mt-1" /></div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                onClick={handleGenerate}
                                disabled={loading}
                                className="w-full btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin text-black" />
                                        Generating...
                                    </>
                                ) : (
                                    "Generate Certificates"
                                )}
                            </button>
                        </div>

                        {/* Status Feedback */}
                        {error && (
                            <div className="mt-4 p-4 rounded-xl bg-red-900/20 border border-red-500/50 flex items-start text-red-200">
                                <AlertCircle className="w-5 h-5 mr-3 shrink-0 mt-0.5 text-red-400" />
                                <p className="text-sm">{error}</p>
                            </div>
                        )}

                        {successCount !== null && (
                            <div className="mt-4 p-4 rounded-xl bg-[#00e599]/10 border border-[#00e599]/30 flex items-start text-[#00e599]">
                                <CheckCircle className="w-5 h-5 mr-3 shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-sm">Success!</p>
                                    <p className="text-sm text-[#00e599]/80">{statusText}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Generated Certificates List view */}
            {certificates.length > 0 && (
                <div className="w-full max-w-4xl mt-12 mb-20 relative z-10 animate-in fade-in slide-in-from-bottom-5 duration-500">
                    <h2 className="text-2xl font-bold mb-6 flex items-center">
                        <CheckCircle className="w-6 h-6 mr-3 text-[var(--color-neon-primary)]" />
                        Generated Documents
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {certificates.map((cert) => (
                            <div key={cert.certificateId} className="glass-card flex flex-col p-5 hover:border-[var(--color-neon-primary)] transition-colors group">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-semibold text-lg">{cert.name}</h3>
                                        <p className="text-[var(--color-neon-muted)] text-sm">{cert.course}</p>
                                    </div>
                                    <span className="text-xs font-mono text-[var(--color-neon-primary)] bg-[#00e599]/10 px-2 py-1 rounded">
                                        {cert.certificateId}
                                    </span>
                                </div>
                                <div className="flex gap-3 mt-auto pt-2">
                                    <a
                                        href={cert.pdfUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-xs bg-[var(--color-neon-surface-hover)] border border-[var(--color-neon-border)] hover:border-[var(--color-neon-primary)] px-3 py-2 rounded-lg flex-1 text-center transition-colors"
                                    >
                                        View PDF
                                    </a>
                                    <a
                                        href={`/verify/${cert.certificateId}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-xs bg-[var(--color-neon-primary)] text-black font-semibold hover:bg-[#00ffaa] flex-1 px-3 py-2 rounded-lg text-center transition-colors"
                                    >
                                        Verify Page
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {/* Fullscreen PDF Map Modal */}
            {isFullscreen && pdfPreviewUrl && (
                <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex flex-col">
                    <div className="p-4 flex items-center justify-between border-b border-[var(--color-neon-border)]/50 bg-black/50">
                        <div>
                            <h2 className="text-xl font-bold text-[var(--color-neon-primary)]">Fullscreen Template Map</h2>
                            <p className="text-xs text-[var(--color-neon-muted)]">Drag the colored markers perfectly into place</p>
                        </div>
                        <button
                            onClick={() => setIsFullscreen(false)}
                            className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>

                    <div className="flex-1 overflow-auto flex items-center justify-center p-8">
                        <div
                            className={`relative transition-all duration-300 ${activeTarget ? 'cursor-crosshair ring-2 ring-[var(--color-neon-primary)] ring-offset-2 ring-offset-black' : ''}`}
                            onClick={handlePdfClick}
                            onMouseMove={(e) => {
                                if (draggingTarget) {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
                                    const yPercent = ((e.clientY - rect.top) / rect.height) * 100;

                                    const finalX = Math.max(0, Math.min(100, xPercent));
                                    const finalY = Math.max(0, Math.min(100, yPercent));

                                    handleConfigChange(draggingTarget, 'x', Number(finalX.toFixed(2)));
                                    handleConfigChange(draggingTarget, 'y', Number(finalY.toFixed(2)));
                                }
                            }}
                            onMouseUp={() => setDraggingTarget(null)}
                            onMouseLeave={() => setDraggingTarget(null)}
                        >
                            {/* We re-mount the preview in the popup. It handles its own scaling/fit usually, but here it's full size */}
                            <PdfPreview fileUrl={pdfPreviewUrl} />

                            {/* Visual Markers mapped at exactly the same absolute coordinate */}
                            {(['name', 'course', 'issueDate', 'qrCode'] as const).map((key) => {
                                const fieldParams = config[key];
                                if (!fieldParams.enabled) return null;

                                const markerColor = MARKER_COLORS[key];

                                return (
                                    <div
                                        key={key}
                                        onMouseDown={(e) => {
                                            e.stopPropagation();
                                            setDraggingTarget(key);
                                        }}
                                        className={`absolute w-6 h-6 rounded-full border-2 border-white transform -translate-x-1/2 -translate-y-1/2 shadow-2xl cursor-grab active:cursor-grabbing pointer-events-auto z-50 flex items-center justify-center text-[10px] font-bold text-white uppercase ${draggingTarget === key ? 'scale-150 animate-pulse' : ''}`}
                                        style={{
                                            left: `${fieldParams.x}%`,
                                            top: `${fieldParams.y}%`,
                                            backgroundColor: markerColor,
                                            boxShadow: `0 0 15px ${markerColor}`
                                        }}
                                        title={`Drag to move ${key}`}
                                    >
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Controls Footer Overlay visible in Fullscreen */}
                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-[var(--color-neon-surface)] border border-[var(--color-neon-border)] p-4 rounded-xl flex gap-4 shadow-2xl z-[110]">
                        {(['name', 'course', 'issueDate', 'qrCode'] as const).map((key) => {
                            const fieldParams = config[key];
                            if (!fieldParams.enabled) return null;
                            const color = MARKER_COLORS[key];
                            const isActive = activeTarget === key;

                            return (
                                <button
                                    key={key}
                                    onClick={() => setActiveTarget(isActive ? null : key)}
                                    className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition-all ${isActive ? 'ring-2 ring-white scale-105' : 'hover:scale-105'}`}
                                    style={{ backgroundColor: color + '20', color: color, border: `1px solid ${color}50` }}
                                >
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
                                    {key.charAt(0).toUpperCase() + key.slice(1)} {isActive ? '(Click map...)' : ''}
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}
        </main>
    );
}
