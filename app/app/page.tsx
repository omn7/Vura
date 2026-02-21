"use client";

import { useState } from "react";
import { FileUp, FileSpreadsheet, Loader2, CheckCircle, AlertCircle } from "lucide-react";

export default function Dashboard() {
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [excelFile, setExcelFile] = useState<File | null>(null);

    const [loading, setLoading] = useState(false);
    const [statusText, setStatusText] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [successCount, setSuccessCount] = useState<number | null>(null);

    const [certificates, setCertificates] = useState<any[]>([]);

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
        <main className="flex-1 flex flex-col items-center p-8 z-10 min-h-screen pt-20">
            <div className="glow-bg" style={{ top: '10%' }}></div>

            <div className="w-full max-w-2xl glass-card relative z-10">
                <h1 className="text-3xl font-bold mb-2">Certificate Generator</h1>
                <p className="text-[var(--color-neon-muted)] mb-8">
                    Upload your base PDF template and an Excel mapping file to create and deploy verifiable certificates in bulk.
                </p>

                <div className="space-y-6">
                    {/* PDF Upload */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-[var(--color-neon-text)]">Base Template (PDF)</label>
                        <div className="relative group border-2 border-dashed border-[var(--color-neon-border)] rounded-xl p-8 text-center transition-colors hover:border-[var(--color-neon-primary)] cursor-pointer">
                            <input
                                type="file"
                                accept="application/pdf"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                            />
                            <div className="flex flex-col items-center pointer-events-none">
                                <FileUp className="w-8 h-8 mb-2 text-[var(--color-neon-primary)]" />
                                <span className="text-sm">
                                    {pdfFile ? <span className="text-[var(--color-neon-primary)]">{pdfFile.name}</span> : "Click to browse or drag PDF here"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Excel Upload */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-[var(--color-neon-text)]">Dataset (Excel)</label>
                        <div className="relative group border-2 border-dashed border-[var(--color-neon-border)] rounded-xl p-8 text-center transition-colors hover:border-[var(--color-neon-secondary)] cursor-pointer">
                            <input
                                type="file"
                                accept=".xlsx, .xls"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={(e) => setExcelFile(e.target.files?.[0] || null)}
                            />
                            <div className="flex flex-col items-center pointer-events-none">
                                <FileSpreadsheet className="w-8 h-8 mb-2 text-[var(--color-neon-secondary)]" />
                                <span className="text-sm">
                                    {excelFile ? <span className="text-[var(--color-neon-secondary)]">{excelFile.name}</span> : "Click to browse or drag Excel (.xlsx) here"}
                                </span>
                            </div>
                        </div>
                        <p className="text-xs text-[var(--color-neon-muted)] mt-1">
                            Required Excel columns: <strong>name</strong>, <strong>course</strong>, <strong>issueDate</strong>.
                        </p>
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
        </main>
    );
}
