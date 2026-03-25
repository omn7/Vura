"use client";

import { useState, useEffect } from "react";
import { FileUp, FileSpreadsheet, Loader2, CheckCircle, AlertCircle, Crosshair, LayoutDashboard, LogOut, Home, Github, Twitter, Linkedin, Mail, Download } from "lucide-react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import JSZip from "jszip";

import dynamic from 'next/dynamic';

const PdfPreview = dynamic(() => import('@/components/PdfPreview'), { ssr: false });

export default function Dashboard() {
    const { status } = useSession();

    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [excelFile, setExcelFile] = useState<File | null>(null);

    const [loading, setLoading] = useState(false);
    const [statusText, setStatusText] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [successCount, setSuccessCount] = useState<number | null>(null);
    const [saveToDb, setSaveToDb] = useState(false);
    const [isZipping, setIsZipping] = useState(false);

    useEffect(() => {
        if (status === "authenticated" && saveToDb === false) {
            setSaveToDb(true);
        } else if (status === "unauthenticated") {
            setSaveToDb(false);
            setConfig(prev => ({ ...prev, qrCode: { ...prev.qrCode, enabled: false } }));
        }
    }, [status]);

    type Certificate = {
        certificateId: string;
        name: string;
        course: string;
        issueDate: string;
        pdfUrl: string;
    };
    const [certificates, setCertificates] = useState<Certificate[]>([]);

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
        name: { enabled: true, x: 50, y: 40, size: 32, hex: "#000000", fontStyle: "bold" },
        course: { enabled: true, x: 50, y: 55, size: 20, hex: "#333333", fontStyle: "normal" },
        issueDate: { enabled: true, x: 50, y: 65, size: 14, hex: "#000000", fontStyle: "normal" },
        qrCode: { enabled: true, x: 80, y: 85, scale: 0.5 },
    });

    const handleConfigChange = (field: keyof typeof config, key: string, value: string | number | boolean) => {
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
        formData.append("saveToDb", String(saveToDb));

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
        } catch (err: unknown) {
            console.error(err);
            setError(err instanceof Error ? err.message : "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadZip = async () => {
        setIsZipping(true);
        try {
            const zip = new JSZip();
            
            const fetchPromises = certificates.map(async (cert) => {
                const safeName = cert.name.replace(/[^a-zA-Z0-9]/g, '_');
                const fileName = `${safeName}_${cert.certificateId}.pdf`;

                if (cert.pdfUrl.startsWith('data:application/pdf;base64,')) {
                    const base64Data = cert.pdfUrl.replace('data:application/pdf;base64,', '');
                    zip.file(fileName, base64Data, { base64: true });
                } else {
                    // Try fetch S3 URL
                    try {
                        const response = await fetch(cert.pdfUrl);
                        const blob = await response.blob();
                        zip.file(fileName, blob);
                    } catch (err) {
                        console.error(`Failed to fetch ${cert.pdfUrl}`, err);
                    }
                }
            });

            await Promise.all(fetchPromises);
            const zipContent = await zip.generateAsync({ type: 'blob' });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(zipContent);
            link.download = `Vura_Certificates_${Date.now()}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        } catch (err) {
            console.error(err);
            setError("Failed to create ZIP archive.");
        } finally {
            setIsZipping(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen overflow-x-hidden">
        <main className="flex-1 flex flex-col items-center p-8 z-10 pt-24">
            <div className="glow-bg" style={{ top: '10%' }}></div>

            {/* Header Navbar Layer */}
            <div className="w-full max-w-6xl mb-6 flex items-center justify-between relative z-20">
                <Link href="/" className="text-xl font-black tracking-widest uppercase flex items-center gap-2 text-white">
                    <Image src="/vuralogo.png" alt="Vura Logo" width={32} height={32} className="rounded-lg object-contain" />
                    VURA
                </Link>
                <div className="flex gap-4 items-center">
                    <Link href="/" className="btn-secondary py-2 px-4 flex items-center gap-2 text-sm">
                        <Home className="w-4 h-4" /> Home
                    </Link>
                    <Link href="/dashboard" className="btn-secondary py-2 px-4 flex items-center gap-2 text-sm">
                        <LayoutDashboard className="w-4 h-4" /> Gallery
                    </Link>
                    {status === 'authenticated' ? (
                        <Link href="/api/auth/signout" className="btn-secondary py-2 px-4 flex items-center gap-2 text-sm text-red-400 hover:text-red-300 hover:border-red-400">
                            <LogOut className="w-4 h-4" /> Sign Out
                        </Link>
                    ) : (
                        <Link href="/login" className="btn-primary py-2 px-4 flex items-center gap-2 text-sm">
                            Login
                        </Link>
                    )}
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
                                <p className="text-xs text-[var(--color-neon-muted)] mb-4">Click &quot;Target&quot; on a setting, then click the preview. Drag markers to adjust.</p>

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
                                        <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => handleConfigChange('name', 'enabled', !config.name.enabled)}>
                                            <span className="w-3 h-3 rounded-full flex-shrink-0 transition-colors" style={{ backgroundColor: config.name.enabled ? MARKER_COLORS.name : 'var(--color-neon-surface-hover)', boxShadow: config.name.enabled ? `0 0 8px ${MARKER_COLORS.name}99` : 'none' }}></span>
                                            <div className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors border ${config.name.enabled ? 'border-transparent' : 'border-[var(--color-neon-border)]'}`} style={{ backgroundColor: config.name.enabled ? MARKER_COLORS.name : 'transparent' }}>
                                                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${config.name.enabled ? 'translate-x-4' : 'translate-x-1'}`} />
                                            </div>
                                            <span className="font-semibold transition-colors" style={{ color: config.name.enabled ? MARKER_COLORS.name : 'var(--color-neon-muted)' }}>Recipient Name</span>
                                        </div>
                                        {config.name.enabled && (
                                            <button onClick={() => setActiveTarget(activeTarget === 'name' ? null : 'name')} className={`text-xs px-3 py-1.5 rounded-lg flex items-center transition-colors ${activeTarget === 'name' ? 'bg-[var(--color-neon-primary)] text-black font-bold' : 'bg-[var(--color-neon-surface-hover)] border border-[var(--color-neon-border)] hover:border-[var(--color-neon-primary)]'}`}>
                                                <Crosshair className="w-3 h-3 mr-1.5" /> {activeTarget === 'name' ? 'Select on Preview...' : 'Target'}
                                            </button>
                                        )}
                                    </div>
                                    {config.name.enabled && (
                                        <div className="grid grid-cols-3 gap-4 bg-black/20 p-4 rounded-xl border border-[var(--color-neon-border)]/50 mt-2">
                                            <div><label className="text-xs text-[var(--color-neon-muted)] font-medium mb-1 block">Font Size</label><input type="number" value={config.name.size} onChange={e => handleConfigChange('name', 'size', Number(e.target.value))} className="w-full bg-[var(--color-neon-bg)] border border-[var(--color-neon-border)] rounded-lg p-2 text-sm focus:border-[var(--color-neon-primary)] outline-none transition-colors" /></div>
                                            <div><label className="text-xs text-[var(--color-neon-muted)] font-medium mb-1 block">Style</label><select value={config.name.fontStyle} onChange={e => handleConfigChange('name', 'fontStyle', e.target.value)} className="w-full bg-[var(--color-neon-bg)] border border-[var(--color-neon-border)] text-[var(--color-neon-text)] rounded-lg p-2 text-sm focus:border-[var(--color-neon-primary)] outline-none transition-colors"><option value="normal">Normal</option><option value="bold">Bold</option><option value="italic">Italic</option></select></div>
                                            <div><label className="text-xs text-[var(--color-neon-muted)] font-medium mb-1 block">Color</label><div className="flex items-center gap-2 bg-[var(--color-neon-bg)] border border-[var(--color-neon-border)] rounded-lg p-1.5"><input type="color" value={config.name.hex} onChange={e => handleConfigChange('name', 'hex', e.target.value)} className="w-6 h-6 rounded cursor-pointer border-0 p-0 bg-transparent flex-shrink-0" /><span className="text-xs font-mono uppercase text-[var(--color-neon-muted)] truncate">{config.name.hex}</span></div></div>
                                        </div>
                                    )}
                                </div>

                                {/* Course settings */}
                                <div className="pt-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => handleConfigChange('course', 'enabled', !config.course.enabled)}>
                                            <span className="w-3 h-3 rounded-full flex-shrink-0 transition-colors" style={{ backgroundColor: config.course.enabled ? MARKER_COLORS.course : 'var(--color-neon-surface-hover)', boxShadow: config.course.enabled ? `0 0 8px ${MARKER_COLORS.course}99` : 'none' }}></span>
                                            <div className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors border ${config.course.enabled ? 'border-transparent' : 'border-[var(--color-neon-border)]'}`} style={{ backgroundColor: config.course.enabled ? MARKER_COLORS.course : 'transparent' }}>
                                                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${config.course.enabled ? 'translate-x-4' : 'translate-x-1'}`} />
                                            </div>
                                            <span className="font-semibold transition-colors" style={{ color: config.course.enabled ? MARKER_COLORS.course : 'var(--color-neon-muted)' }}>Course Name</span>
                                        </div>
                                        {config.course.enabled && (
                                            <button onClick={() => setActiveTarget(activeTarget === 'course' ? null : 'course')} className={`text-xs px-3 py-1.5 rounded-lg flex items-center transition-colors ${activeTarget === 'course' ? 'bg-[var(--color-neon-primary)] text-black font-bold' : 'bg-[var(--color-neon-surface-hover)] border border-[var(--color-neon-border)] hover:border-[var(--color-neon-primary)]'}`}>
                                                <Crosshair className="w-3 h-3 mr-1.5" /> {activeTarget === 'course' ? 'Select on Preview...' : 'Target'}
                                            </button>
                                        )}
                                    </div>
                                    {config.course.enabled && (
                                        <div className="grid grid-cols-3 gap-4 bg-black/20 p-4 rounded-xl border border-[var(--color-neon-border)]/50 mt-2">
                                            <div><label className="text-xs text-[var(--color-neon-muted)] font-medium mb-1 block">Font Size</label><input type="number" value={config.course.size} onChange={e => handleConfigChange('course', 'size', Number(e.target.value))} className="w-full bg-[var(--color-neon-bg)] border border-[var(--color-neon-border)] rounded-lg p-2 text-sm focus:border-[var(--color-neon-primary)] outline-none transition-colors" /></div>
                                            <div><label className="text-xs text-[var(--color-neon-muted)] font-medium mb-1 block">Style</label><select value={config.course.fontStyle} onChange={e => handleConfigChange('course', 'fontStyle', e.target.value)} className="w-full bg-[var(--color-neon-bg)] border border-[var(--color-neon-border)] text-[var(--color-neon-text)] rounded-lg p-2 text-sm focus:border-[var(--color-neon-primary)] outline-none transition-colors"><option value="normal">Normal</option><option value="bold">Bold</option><option value="italic">Italic</option></select></div>
                                            <div><label className="text-xs text-[var(--color-neon-muted)] font-medium mb-1 block">Color</label><div className="flex items-center gap-2 bg-[var(--color-neon-bg)] border border-[var(--color-neon-border)] rounded-lg p-1.5"><input type="color" value={config.course.hex} onChange={e => handleConfigChange('course', 'hex', e.target.value)} className="w-6 h-6 rounded cursor-pointer border-0 p-0 bg-transparent flex-shrink-0" /><span className="text-xs font-mono uppercase text-[var(--color-neon-muted)] truncate">{config.course.hex}</span></div></div>
                                        </div>
                                    )}
                                </div>

                                {/* Issue Date settings */}
                                <div className="pt-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => handleConfigChange('issueDate', 'enabled', !config.issueDate.enabled)}>
                                            <span className="w-3 h-3 rounded-full flex-shrink-0 transition-colors" style={{ backgroundColor: config.issueDate.enabled ? MARKER_COLORS.issueDate : 'var(--color-neon-surface-hover)', boxShadow: config.issueDate.enabled ? `0 0 8px ${MARKER_COLORS.issueDate}99` : 'none' }}></span>
                                            <div className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors border ${config.issueDate.enabled ? 'border-transparent' : 'border-[var(--color-neon-border)]'}`} style={{ backgroundColor: config.issueDate.enabled ? MARKER_COLORS.issueDate : 'transparent' }}>
                                                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${config.issueDate.enabled ? 'translate-x-4' : 'translate-x-1'}`} />
                                            </div>
                                            <span className="font-semibold transition-colors" style={{ color: config.issueDate.enabled ? MARKER_COLORS.issueDate : 'var(--color-neon-muted)' }}>Issue Date</span>
                                        </div>
                                        {config.issueDate.enabled && (
                                            <button onClick={() => setActiveTarget(activeTarget === 'issueDate' ? null : 'issueDate')} className={`text-xs px-3 py-1.5 rounded-lg flex items-center transition-colors ${activeTarget === 'issueDate' ? 'bg-[var(--color-neon-primary)] text-black font-bold' : 'bg-[var(--color-neon-surface-hover)] border border-[var(--color-neon-border)] hover:border-[var(--color-neon-primary)]'}`}>
                                                <Crosshair className="w-3 h-3 mr-1.5" /> {activeTarget === 'issueDate' ? 'Select on Preview...' : 'Target'}
                                            </button>
                                        )}
                                    </div>
                                    {config.issueDate.enabled && (
                                        <div className="grid grid-cols-3 gap-4 bg-black/20 p-4 rounded-xl border border-[var(--color-neon-border)]/50 mt-2">
                                            <div><label className="text-xs text-[var(--color-neon-muted)] font-medium mb-1 block">Font Size</label><input type="number" value={config.issueDate.size} onChange={e => handleConfigChange('issueDate', 'size', Number(e.target.value))} className="w-full bg-[var(--color-neon-bg)] border border-[var(--color-neon-border)] rounded-lg p-2 text-sm focus:border-[var(--color-neon-primary)] outline-none transition-colors" /></div>
                                            <div><label className="text-xs text-[var(--color-neon-muted)] font-medium mb-1 block">Style</label><select value={config.issueDate.fontStyle} onChange={e => handleConfigChange('issueDate', 'fontStyle', e.target.value)} className="w-full bg-[var(--color-neon-bg)] border border-[var(--color-neon-border)] text-[var(--color-neon-text)] rounded-lg p-2 text-sm focus:border-[var(--color-neon-primary)] outline-none transition-colors"><option value="normal">Normal</option><option value="bold">Bold</option><option value="italic">Italic</option></select></div>
                                            <div><label className="text-xs text-[var(--color-neon-muted)] font-medium mb-1 block">Color</label><div className="flex items-center gap-2 bg-[var(--color-neon-bg)] border border-[var(--color-neon-border)] rounded-lg p-1.5"><input type="color" value={config.issueDate.hex} onChange={e => handleConfigChange('issueDate', 'hex', e.target.value)} className="w-6 h-6 rounded cursor-pointer border-0 p-0 bg-transparent flex-shrink-0" /><span className="text-xs font-mono uppercase text-[var(--color-neon-muted)] truncate">{config.issueDate.hex}</span></div></div>
                                        </div>
                                    )}
                                </div>

                                {/* QR Code settings */}
                                <div className="pt-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className={`flex items-center space-x-3 transition-opacity ${!saveToDb ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer group'}`} onClick={() => saveToDb && handleConfigChange('qrCode', 'enabled', !config.qrCode.enabled)}>
                                            <span className="w-3 h-3 rounded-full flex-shrink-0 transition-colors" style={{ backgroundColor: config.qrCode.enabled ? MARKER_COLORS.qrCode : 'var(--color-neon-surface-hover)', boxShadow: config.qrCode.enabled ? `0 0 8px ${MARKER_COLORS.qrCode}99` : 'none' }}></span>
                                            <div className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors border ${config.qrCode.enabled ? 'border-transparent' : 'border-[var(--color-neon-border)]'}`} style={{ backgroundColor: config.qrCode.enabled ? MARKER_COLORS.qrCode : 'transparent' }}>
                                                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${config.qrCode.enabled ? 'translate-x-4' : 'translate-x-1'}`} />
                                            </div>
                                            <span className="font-semibold transition-colors" style={{ color: config.qrCode.enabled ? MARKER_COLORS.qrCode : 'var(--color-neon-muted)' }}>QR Code Badge</span>
                                        </div>
                                        {config.qrCode.enabled && (
                                            <button onClick={() => setActiveTarget(activeTarget === 'qrCode' ? null : 'qrCode')} className={`text-xs px-3 py-1.5 rounded-lg flex items-center transition-colors ${activeTarget === 'qrCode' ? 'bg-[var(--color-neon-primary)] text-black font-bold' : 'bg-[var(--color-neon-surface-hover)] border border-[var(--color-neon-border)] hover:border-[var(--color-neon-primary)]'}`}>
                                                <Crosshair className="w-3 h-3 mr-1.5" /> {activeTarget === 'qrCode' ? 'Select on Preview...' : 'Target'}
                                            </button>
                                        )}
                                    </div>
                                    {config.qrCode.enabled && (
                                        <div className="grid grid-cols-1 gap-4 bg-black/20 p-4 rounded-xl border border-[var(--color-neon-border)]/50 mt-2">
                                            <div><label className="text-xs text-[var(--color-neon-muted)] font-medium mb-1 block">Scale Multiplier</label><input type="number" step="0.1" value={config.qrCode.scale} onChange={e => handleConfigChange('qrCode', 'scale', Number(e.target.value))} className="w-full bg-[var(--color-neon-bg)] border border-[var(--color-neon-border)] rounded-lg p-2 text-sm focus:border-[var(--color-neon-primary)] outline-none transition-colors" /></div>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Save to Database Toggle */}
                                <div className="pt-4 border-t border-[var(--color-neon-border)]/30 mt-2">
                                    <div className="flex items-center justify-between">
                                        <div className={`flex items-center space-x-3 transition-opacity ${status === 'unauthenticated' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer group'}`} onClick={() => {
                                            if (status === 'unauthenticated') return;
                                            setSaveToDb(!saveToDb);
                                            if (saveToDb) { // going from true to false
                                                setConfig(prev => ({ ...prev, qrCode: { ...prev.qrCode, enabled: false } }));
                                            }
                                        }}>
                                            <div className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors border ${saveToDb ? 'border-transparent bg-green-500' : 'border-[var(--color-neon-border)] bg-transparent'}`}>
                                                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${saveToDb ? 'translate-x-4' : 'translate-x-1'}`} />
                                            </div>
                                            <span className="font-semibold text-white">Save to Gallery (Database)</span>
                                        </div>
                                    </div>
                                    {!saveToDb && (
                                        <p className="text-xs text-yellow-400 mt-2">
                                            {status === 'unauthenticated' ? 'Log in to enable saving securely to the gallery and QR verification.' : 'Database saving disabled. Documents won\'t appear in gallery. QR Verification is turned off.'}
                                        </p>
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
                    
                    <div className="mt-10 flex justify-center">
                        <button 
                            onClick={handleDownloadZip} 
                            disabled={isZipping}
                            className="bg-[var(--color-neon-primary)] text-black font-semibold hover:bg-[#00ffaa] py-3 px-8 rounded-xl flex items-center justify-center gap-3 group transition-all duration-300 disabled:opacity-50 shadow-[0_0_20px_rgba(0,229,153,0.3)] hover:shadow-[0_0_30px_rgba(0,229,153,0.5)]"
                        >
                            {isZipping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />}
                            {isZipping ? "Creating ZIP Archive..." : "Download All as ZIP"}
                        </button>
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
        
            {/* ─── Footer ─── */}
            <footer className="relative bg-[#02040A] pt-16 pb-8 px-6 border-t border-[var(--color-neon-border)]/50 mt-20 w-full z-10">
                {/* Subtle top glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-[var(--color-neon-primary)]/20 to-transparent" />
                
                <div className="max-w-7xl mx-auto w-full">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12 mb-16">
                        <div className="col-span-2 flex flex-col items-start">
                            <Link href="/" className="flex items-center gap-2 mb-6 w-fit group">
                                <Image src="/vuralogo.png" alt="Vura Logo" width={32} height={32} className="object-contain transition-transform group-hover:scale-110" />
                                <span className="text-lg font-bold tracking-widest uppercase text-white">Vura</span>
                            </Link>
                            <p className="text-[13px] text-[var(--color-neon-muted)] leading-relaxed max-w-xs mb-6">
                                The modern certificate generation platform for educators, trainers, and startup events.
                            </p>
                            <div className="flex items-center gap-4">
                                {[{ icon: Github, href: "https://github.com/omn7/Vura" }, { icon: Twitter, href: "https://x.com/mr_codex" }, { icon: Linkedin, href: "https://linkedin.com/in/omnarkhede/" }, { icon: Mail, href: "mailto:dev.om@outlook.com" }].map(({ icon: Icon, href }) => (
                                    <a key={href} href={href} target="_blank" rel="noreferrer" className="text-[#888] hover:text-[#00e599] transition-colors">
                                        <Icon className="w-4 h-4" />
                                    </a>
                                ))}
                            </div>
                        </div>
                        
                        <div className="col-span-1">
                            <p className="text-xs font-semibold text-white uppercase tracking-wider mb-5">Product</p>
                            <ul className="flex flex-col gap-3.5">
                                {[["Features", "/#features"], ["How It Works", "/#how-it-works"], ["Pricing", "/#pricing"], ["Dashboard", "/dashboard"], ["API Docs", "/docs"]].map(([label, href]) => (
                                    <li key={label}>
                                        <a href={href} className="text-[13px] text-[#888] hover:text-white transition-colors">{label}</a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="col-span-1">
                            <p className="text-xs font-semibold text-white uppercase tracking-wider mb-5">Company</p>
                            <ul className="flex flex-col gap-3.5">
                                {[["About", "/about"], ["Privacy Policy", "/privacy"], ["Terms of Service", "/terms"], ["Contact", "mailto:dev.om@outlook.com"]].map(([label, href]) => (
                                    <li key={label}>
                                        <a href={href} className="text-[13px] text-[#888] hover:text-white transition-colors">{label}</a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    
                    <div className="pt-8 border-t border-white/[0.05] flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-[12px] text-[#666]">
                            © {new Date().getFullYear()} <a href="https://omnarkhede.tech" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Om Narkhede</a>. All rights reserved.
                        </p>
                        <div className="flex items-center gap-2 text-[12px] text-[#666]">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#00e599] animate-pulse" />
                            All systems operational
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
