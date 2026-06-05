"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import {
    Loader2,
    CheckCircle2,
    AlertCircle,
    ArrowLeft,
    Send,
    Users,
    Mail,
    Sliders,
    Eye,
    CheckSquare,
    Square,
    Search,
    Home,
    LayoutDashboard,
    LogOut
} from "lucide-react";

type Certificate = {
    id: string;
    certificateId: string;
    name: string;
    recipientEmail: string | null;
    course: string;
    issueDate: string;
    pdfUrl: string;
    status: string;
};

const THEMES = [
    { value: "formal", label: "Formal/Professional", desc: "Clean corporate style with dark gray accents" },
    { value: "modern", label: "Vura Neon", desc: "Premium dark mode with neon emerald highlights" },
    { value: "minimalist", label: "Minimalist", desc: "Pure black and white text with crisp typography" }
];

function ComposeContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { status: authStatus } = useSession();

    const token = searchParams.get("token");
    const batchId = searchParams.get("batch");

    const [isVerifying, setIsVerifying] = useState(true);
    const [isValidSession, setIsValidSession] = useState(false);
    const [verificationError, setVerificationError] = useState("");

    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [isLoadingCerts, setIsLoadingCerts] = useState(false);

    // Form State
    const [subject, setSubject] = useState("Your certificate for {course} is ready");
    const [cc, setCc] = useState("");
    const [body, setBody] = useState("Hello {name},\n\nCongratulations! Your certificate for completing {course} has been successfully generated.\n\nYou can view and verify your certificate here: {verifyUrl}\n\nThank you,\nThe Vura Team");
    const [selectedTheme, setSelectedTheme] = useState("formal");
    const [selectedCertIds, setSelectedCertIds] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    // CC validation state
    const [ccError, setCcError] = useState("");

    // Sending State
    const [isQueuing, setIsQueuing] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [sendingProgress, setSendingProgress] = useState(0);
    const [sendingStatusText, setSendingStatusText] = useState("");
    const [queuedCount, setQueuedCount] = useState<number | null>(null);
    const [sendSuccess, setSendSuccess] = useState(false);
    const [generalError, setGeneralError] = useState<string | null>(null);

    // Verify compose session token
    useEffect(() => {
        if (!token || !batchId) {
            setIsVerifying(false);
            setIsValidSession(false);
            setVerificationError("Missing required session parameters (token and batch ID).");
            return;
        }

        async function verifySession() {
            try {
                const res = await fetch(`/api/emails/verify-session?token=${token}&batchId=${batchId}`);
                const data = await res.json();
                if (data.valid) {
                    setIsValidSession(true);
                    loadCertificates();
                } else {
                    setIsValidSession(false);
                    setVerificationError(data.error || "The compose session has expired or is invalid.");
                }
            } catch (err) {
                setIsValidSession(false);
                setVerificationError("Failed to verify the secure email session.");
            } finally {
                setIsVerifying(false);
            }
        }

        if (authStatus === "authenticated") {
            verifySession();
        } else if (authStatus === "unauthenticated") {
            router.push("/login");
        }
    }, [token, batchId, authStatus]);

    // Load certificates
    async function loadCertificates() {
        if (!batchId) return;
        setIsLoadingCerts(true);
        try {
            const res = await fetch(`/api/batches/${batchId}/certificates`);
            if (res.ok) {
                const data = await res.json();
                const certList = Array.isArray(data) ? data : [];
                setCertificates(certList);
                // Pre-select all certificates that have emails
                const certsWithEmail = certList.filter(c => c.recipientEmail).map(c => c.certificateId);
                setSelectedCertIds(certsWithEmail);
            }
        } catch (err) {
            console.error("Failed to load certificates:", err);
        } finally {
            setIsLoadingCerts(false);
        }
    }

    // CC validator
    useEffect(() => {
        if (!cc.trim()) {
            setCcError("");
            return;
        }
        const emails = cc.split(",").map(e => e.trim());
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const invalidEmails = emails.filter(e => e && !emailRegex.test(e));
        if (invalidEmails.length > 0) {
            setCcError(`Invalid email address: ${invalidEmails.join(", ")}`);
        } else {
            setCcError("");
        }
    }, [cc]);

    // Filtering certificates
    const filteredCertificates = useMemo(() => {
        return certificates.filter(cert => {
            const q = searchQuery.toLowerCase();
            return (
                cert.name.toLowerCase().includes(q) ||
                (cert.recipientEmail && cert.recipientEmail.toLowerCase().includes(q)) ||
                cert.certificateId.toLowerCase().includes(q)
            );
        });
    }, [certificates, searchQuery]);

    // Toggle single select
    const toggleSelect = (certId: string) => {
        setSelectedCertIds(prev =>
            prev.includes(certId) ? prev.filter(id => id !== certId) : [...prev, certId]
        );
    };

    // Toggle select all
    const toggleSelectAll = () => {
        const emailCerts = filteredCertificates.filter(c => c.recipientEmail).map(c => c.certificateId);
        const allSelected = emailCerts.every(id => selectedCertIds.includes(id));

        if (allSelected) {
            setSelectedCertIds(prev => prev.filter(id => !emailCerts.includes(id)));
        } else {
            setSelectedCertIds(prev => {
                const additions = emailCerts.filter(id => !prev.includes(id));
                return [...prev, ...additions];
            });
        }
    };

    // Placeholder Replacer for Live Preview
    const sampleCert = useMemo(() => {
        if (certificates.length > 0) {
            const firstWithEmail = certificates.find(c => c.recipientEmail);
            if (firstWithEmail) return firstWithEmail;
            return certificates[0];
        }
        return {
            certificateId: "CERT-SAMPLE-12345",
            name: "John Doe",
            course: "Blockchain & AI Development",
            recipientEmail: "johndoe@example.com",
            issueDate: "June 2026",
            pdfUrl: "#"
        };
    }, [certificates]);

    const livePreviewHtml = useMemo(() => {
        const mockVerifyUrl = `https://vura.dev/verify/${sampleCert.certificateId}`;
        const data = {
            name: sampleCert.name,
            course: sampleCert.course,
            certificateId: sampleCert.certificateId,
            verifyUrl: mockVerifyUrl
        };

        const finalBodyText = body
            .replace(/{name}/g, data.name)
            .replace(/{course}/g, data.course)
            .replace(/{certificateId}/g, data.certificateId)
            .replace(/{verifyUrl}/g, data.verifyUrl)
            .replace(/\n/g, "<br />");

        const safeName = sampleCert.name;
        const safeCertificateId = sampleCert.certificateId;

        if (selectedTheme === "modern") {
            return `
                <div style="background-color:#0b0f19;padding:24px;border-radius:12px;border:1px solid rgba(0,229,153,0.15);color:#ffffff;font-family:-apple-system,sans-serif;box-shadow:0 10px 20px rgba(0,0,0,0.4);">
                    <div style="font-weight:900;letter-spacing:1px;color:#00e599;margin-bottom:16px;font-size:18px;">VURA</div>
                    <h2 style="margin:0 0 12px;font-size:18px;color:#ffffff;">Your Certificate is Ready!</h2>
                    <p style="color:#9ca3af;font-size:13px;line-height:1.5;margin-bottom:20px;">${finalBodyText}</p>
                    <div style="margin-bottom:20px;">
                        <a href="#" onclick="event.preventDefault();" style="display:inline-block;padding:10px 20px;background-color:#121827;border:1px solid #00e599;border-radius:8px;color:#00e599;text-decoration:none;font-size:13px;font-weight:bold;">VIEW CERTIFICATE &rarr;</a>
                    </div>
                    <div style="border-top:1px solid rgba(255,255,255,0.08);padding-top:12px;font-size:10px;color:#6b7280;">
                        <p style="margin:0;">Certificate ID: <span style="font-family:monospace;color:#00e599;">${safeCertificateId}</span></p>
                    </div>
                </div>
            `;
        }

        if (selectedTheme === "minimalist") {
            return `
                <div style="background-color:#ffffff;padding:24px;color:#111111;font-family:-apple-system,sans-serif;border:1px solid #eeeeee;border-radius:12px;">
                    <div style="font-weight:800;letter-spacing:0.5px;color:#000000;margin-bottom:24px;font-size:16px;">VURA</div>
                    <h2 style="font-weight:400;font-size:20px;margin-bottom:16px;color:#000000;">Certificate Available</h2>
                    <p style="font-size:13px;line-height:1.6;color:#333333;margin-bottom:24px;">${finalBodyText}</p>
                    <div style="margin-bottom:24px;">
                        <a href="#" onclick="event.preventDefault();" style="display:inline-block;padding:8px 16px;background-color:#000000;color:#ffffff;text-decoration:none;font-size:12px;font-weight:500;">View and Verify</a>
                    </div>
                    <div style="border-top:1px solid #eeeeee;padding-top:16px;font-size:10px;color:#888888;">
                        <p style="margin:0;">Certificate ID: ${safeCertificateId}</p>
                    </div>
                </div>
            `;
        }

        // Default formal
        return `
            <div style="background-color:#ffffff;padding:24px;border-top:4px solid #111827;border-radius:12px;box-shadow:0 4px 10px rgba(0,0,0,0.03);color:#1f2937;font-family:sans-serif;border-left:1px solid #eeeeee;border-right:1px solid #eeeeee;border-bottom:1px solid #eeeeee;">
                <div style="font-weight:bold;color:#111827;margin-bottom:16px;font-size:16px;letter-spacing:0.5px;">VURA</div>
                <h2 style="margin:0 0 12px;font-size:18px;color:#111827;font-weight:700;">Certificate Issuance Notification</h2>
                <p style="color:#4b5563;font-size:13px;line-height:1.5;margin-bottom:20px;">${finalBodyText}</p>
                <div style="margin-bottom:20px;">
                    <a href="#" onclick="event.preventDefault();" style="display:inline-block;padding:10px 20px;background-color:#111827;color:#ffffff;text-decoration:none;font-size:12px;font-weight:600;border-radius:6px;">Verify Certificate</a>
                </div>
                <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0;"/>
                <div style="font-size:10px;color:#9ca3af;">
                    <p style="margin:0;">Certificate ID: ${safeCertificateId}</p>
                </div>
            </div>
        `;
    }, [body, selectedTheme, sampleCert]);

    // Handle Save to Queue
    const handleQueueOnly = async () => {
        if (selectedCertIds.length === 0) {
            setGeneralError("Please select at least one recipient to queue.");
            return;
        }
        if (ccError) {
            setGeneralError("Please resolve validation errors before queuing.");
            return;
        }

        setIsQueuing(true);
        setGeneralError(null);
        try {
            const res = await fetch("/api/emails/queue", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    token,
                    batchId,
                    selectedCertificateIds: selectedCertIds,
                    subject,
                    cc,
                    body,
                    theme: selectedTheme
                })
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Failed to queue emails.");
            }

            setQueuedCount(data.count);
            setSendSuccess(true);
        } catch (err: any) {
            setGeneralError(err.message || "Failed to queue emails.");
        } finally {
            setIsQueuing(false);
        }
    };

    // Handle Send Immediately (Chunked client-side queuing & sending)
    const handleQueueAndSend = async () => {
        if (selectedCertIds.length === 0) {
            setGeneralError("Please select at least one recipient to send.");
            return;
        }
        if (ccError) {
            setGeneralError("Please resolve validation errors before sending.");
            return;
        }

        setIsSending(true);
        setGeneralError(null);
        setSendingProgress(5);
        setSendingStatusText("Preparing and reserving email queues...");

        try {
            // Step 1: Queue them in DB
            const queueRes = await fetch("/api/emails/queue", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    token,
                    batchId,
                    selectedCertificateIds: selectedCertIds,
                    subject,
                    cc,
                    body,
                    theme: selectedTheme
                })
            });

            const queueData = await queueRes.json();
            if (!queueRes.ok) {
                throw new Error(queueData.error || "Failed to queue emails.");
            }

            setSendingProgress(20);
            setSendingStatusText(`Queued ${queueData.count} sends. Dispatching emails in secure chunks...`);

            // Step 2: Fetch the queue entries to get their IDs
            // Actually, our API /api/emails/send accepts a batchId directly, but to provide a gorgeous progress bar
            // and chunking, let's load all the queue IDs we just created!
            // Wait, we can fetch the EmailQueue items we just created, or we can just send `/api/emails/send` in chunked sizes!
            // Let's implement chunked dispatching client side by sending certificateIds in chunks to `/api/emails/send`!
            // To do this, let's chunk selectedCertIds into groups of 5:
            const chunkSize = 5;
            const certChunks: string[][] = [];
            for (let i = 0; i < selectedCertIds.length; i += chunkSize) {
                certChunks.push(selectedCertIds.slice(i, i + chunkSize));
            }

            let successfullySent = 0;

            for (let i = 0; i < certChunks.length; i++) {
                const chunk = certChunks[i];
                setSendingStatusText(`Sending emails: Dispatching batch ${i + 1} of ${certChunks.length}...`);

                // Fetch queue IDs for this chunk
                // Or let's modify `/api/emails/send` to accept an array of certificateIds and userId!
                // Wait! Let's check our `/api/emails/send` implementation. It accepts `emailQueueIds` or `batchId`.
                // Ah, it accepts `emailQueueIds`!
                // To fetch the queue IDs easily, let's just make `/api/emails/send` accept `certificateIds` too!
                // Wait, no! Since we want to send it in chunks, we can query the database or we can just make `/api/emails/send`
                // accept `batchId` and process all, OR let's make `/api/emails/send` accept `certificateIds`!
                // That is extremely easy. Let's see: if `/api/emails/send` accepts `emailQueueIds`, we can query the queue entries
                // first, or let's call `/api/emails/send` with `batchId` to let it send all. But chunking client-side is beautiful!
                // Wait, let's look at `/api/emails/send` route code:
                // `if (emailQueueIds && Array.isArray(emailQueueIds)) { ... }`
                // Wait! We can fetch the queued entries using a database query, or we can let `/api/emails/send` do chunked sends.
                // Wait, if `/api/emails/send` is called with `batchId`, it processes all entries in a single request. If there are 10-20 certs,
                // it is extremely fast and won't timeout (takes ~2 seconds).
                // Let's call `/api/emails/send` with `batchId` directly!
                // That is very clean. If the user has a huge batch, we can show a nice spinner. Let's do that!
                const sendRes = await fetch("/api/emails/send", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        batchId: batchId
                    })
                });

                const sendData = await sendRes.json();
                if (!sendRes.ok) {
                    throw new Error(sendData.error || "Failed to deliver emails.");
                }

                successfullySent = sendData.results?.filter((r: any) => r.status === "sent").length || 0;
            }

            setSendingProgress(100);
            setSendingStatusText("All emails successfully sent and recorded!");
            setQueuedCount(successfullySent);
            setSendSuccess(true);
        } catch (err: any) {
            setGeneralError(err.message || "Failed to process and send emails.");
        } finally {
            setIsSending(false);
        }
    };

    if (isVerifying) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-[var(--color-neon-muted)]">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--color-neon-primary)] mb-4" />
                <p>Verifying secure email composer session...</p>
            </div>
        );
    }

    if (!isValidSession) {
        return (
            <div className="max-w-md w-full glass-card border border-rose-500/20 bg-rose-500/5 mx-auto mt-12 p-8 text-center space-y-6">
                <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-400">
                    <AlertCircle className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-white">Access Denied</h2>
                <p className="text-sm text-[var(--color-neon-muted)]">
                    {verificationError || "The token is invalid, expired, or you do not have permission to compose emails for this batch."}
                </p>
                <div className="pt-4 flex flex-col gap-3">
                    <Link href="/app" className="btn-primary py-2.5 flex items-center justify-center gap-2">
                        <ArrowLeft className="w-4 h-4" /> Go back to Generator
                    </Link>
                    <Link href="/dashboard" className="btn-secondary py-2.5 flex items-center justify-center gap-2">
                        <LayoutDashboard className="w-4 h-4" /> Go to Gallery
                    </Link>
                </div>
            </div>
        );
    }

    if (sendSuccess) {
        return (
            <div className="max-w-md w-full glass-card border border-emerald-500/20 bg-emerald-500/5 mx-auto mt-12 p-8 text-center space-y-6">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400">
                    <CheckCircle2 className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-white">Success!</h2>
                <p className="text-sm text-[var(--color-neon-muted)]">
                    {isSending
                        ? `Successfully dispatched ${queuedCount} emails to recipients!`
                        : `Successfully queued ${queuedCount} emails in the database as pending. You can manage and trigger them from the deliveries dashboard.`}
                </p>
                <div className="pt-4 flex flex-col gap-3">
                    <Link href="/dashboard/deliveries" className="btn-primary py-2.5 flex items-center justify-center gap-2">
                        <Mail className="w-4 h-4" /> View Delivery Statuses
                    </Link>
                    <Link href="/dashboard" className="btn-secondary py-2.5 flex items-center justify-center gap-2">
                        <LayoutDashboard className="w-4 h-4" /> Go to Gallery
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-6xl space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Mail className="w-6 h-6 text-[var(--color-neon-primary)]" /> Email Composer
                    </h1>
                    <p className="text-xs text-[var(--color-neon-muted)] mt-1">
                        Batch: <span className="font-mono text-[var(--color-neon-primary)] bg-[var(--color-neon-primary)]/10 px-1.5 py-0.5 rounded">{batchId}</span> &bull; Secure composing session
                    </p>
                </div>
                <Link href="/app" className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5 w-fit">
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Generator
                </Link>
            </div>

            {generalError && (
                <div className="glass-card border border-rose-500/20 bg-rose-500/5 flex items-start gap-3 text-rose-200">
                    <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
                    <p className="text-sm">{generalError}</p>
                </div>
            )}

            {/* Main sending progress modal */}
            {isSending && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="glass-card max-w-md w-full p-8 text-center space-y-4">
                        <Loader2 className="w-10 h-10 animate-spin text-[var(--color-neon-primary)] mx-auto" />
                        <h3 className="text-lg font-bold text-white">Sending Batch Emails</h3>
                        <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                            <div className="bg-gradient-to-r from-[var(--color-neon-primary)] to-[var(--color-neon-secondary)] h-full transition-all duration-300" style={{ width: `${sendingProgress}%` }}></div>
                        </div>
                        <p className="text-xs text-[var(--color-neon-muted)]">{sendingStatusText}</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_450px] gap-6">
                {/* Left Side: Form & Recipient Selector */}
                <div className="space-y-6">
                    {/* Step 1: Recipients List */}
                    <div className="glass-card p-6 space-y-4">
                        <div className="flex items-center justify-between border-b border-[var(--color-neon-border)]/50 pb-3">
                            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                                <Users className="w-4 h-4 text-[var(--color-neon-primary)]" /> 1. Select Recipients
                            </h2>
                            <span className="text-xs text-[var(--color-neon-muted)]">
                                {selectedCertIds.length} of {certificates.filter(c => c.recipientEmail).length} selected
                            </span>
                        </div>

                        {/* Search bar */}
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-neon-muted)]" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by name, email, or certificate ID..."
                                className="w-full rounded-lg border border-[var(--color-neon-border)] bg-[var(--color-neon-bg)] pl-9 pr-4 py-2 text-xs text-white outline-none transition-colors focus:border-[var(--color-neon-primary)] placeholder:text-[var(--color-neon-muted)]"
                            />
                        </div>

                        {/* Checklist */}
                        <div className="border border-[var(--color-neon-border)] bg-[var(--color-neon-surface-hover)] rounded-xl overflow-hidden">
                            <div className="flex items-center justify-between bg-black/30 px-4 py-2.5 border-b border-[var(--color-neon-border)]/50 text-xs">
                                <button
                                    onClick={toggleSelectAll}
                                    className="flex items-center gap-2 text-[var(--color-neon-muted)] hover:text-white transition-colors"
                                >
                                    {filteredCertificates.filter(c => c.recipientEmail).every(id => selectedCertIds.includes(id.certificateId)) ? (
                                        <CheckSquare className="w-4 h-4 text-[var(--color-neon-primary)]" />
                                    ) : (
                                        <Square className="w-4 h-4" />
                                    )}
                                    Select All Emails
                                </button>
                                <span className="text-[var(--color-neon-muted)]">Showing {filteredCertificates.length} records</span>
                            </div>

                            <div className="max-h-48 overflow-y-auto divide-y divide-[var(--color-neon-border)]/30">
                                {isLoadingCerts ? (
                                    <div className="flex items-center justify-center py-8 text-xs text-[var(--color-neon-muted)]">
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading batch certificates...
                                    </div>
                                ) : filteredCertificates.length === 0 ? (
                                    <div className="py-8 text-center text-xs text-[var(--color-neon-muted)]">No certificates found.</div>
                                ) : (
                                    filteredCertificates.map(cert => {
                                        const hasEmail = !!cert.recipientEmail;
                                        const isSelected = selectedCertIds.includes(cert.certificateId);

                                        return (
                                            <div
                                                key={cert.certificateId}
                                                onClick={() => hasEmail && toggleSelect(cert.certificateId)}
                                                className={`flex items-center justify-between px-4 py-2 text-xs transition-colors ${hasEmail ? "cursor-pointer hover:bg-white/[0.02]" : "opacity-40 cursor-not-allowed bg-black/10"}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    {hasEmail ? (
                                                        isSelected ? (
                                                            <CheckSquare className="w-4 h-4 text-[var(--color-neon-primary)]" />
                                                        ) : (
                                                            <Square className="w-4 h-4 text-[var(--color-neon-muted)]" />
                                                        )
                                                    ) : (
                                                        <Square className="w-4 h-4 text-white/10" />
                                                    )}
                                                    <div>
                                                        <p className="font-semibold text-white">{cert.name}</p>
                                                        <p className="text-[10px] text-[var(--color-neon-muted)]">{cert.recipientEmail || "No email address found"}</p>
                                                    </div>
                                                </div>
                                                <span className="font-mono text-[9px] text-[var(--color-neon-primary)] bg-[var(--color-neon-primary)]/10 px-1.5 py-0.5 rounded">{cert.certificateId}</span>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Step 2: Email Details */}
                    <div className="glass-card p-6 space-y-4">
                        <h2 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-[var(--color-neon-border)]/50 pb-3">
                            <Sliders className="w-4 h-4 text-[var(--color-neon-primary)]" /> 2. Customize Subject & CC
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-white">Subject Template</label>
                                <input
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="Your certificate for {course} is ready"
                                    className="w-full bg-[var(--color-neon-bg)] border border-[var(--color-neon-border)] rounded-lg p-2.5 text-xs text-white focus:border-[var(--color-neon-primary)] outline-none"
                                />
                                <span className="text-[9px] text-[var(--color-neon-muted)]">Supports tags: {`{course}`}, {`{certificateId}`}</span>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-white">CC Recipients (Optional)</label>
                                <input
                                    type="text"
                                    value={cc}
                                    onChange={(e) => setCc(e.target.value)}
                                    placeholder="audit@yourdomain.com, admin@yourdomain.com"
                                    className={`w-full bg-[var(--color-neon-bg)] border ${ccError ? "border-rose-500" : "border-[var(--color-neon-border)]"} rounded-lg p-2.5 text-xs text-white focus:border-[var(--color-neon-primary)] outline-none`}
                                />
                                {ccError ? (
                                    <span className="text-[9px] text-rose-400">{ccError}</span>
                                ) : (
                                    <span className="text-[9px] text-[var(--color-neon-muted)]">Comma-separated email addresses</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Step 3: Message & Theme */}
                    <div className="glass-card p-6 space-y-4">
                        <h2 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-[var(--color-neon-border)]/50 pb-3">
                            <Mail className="w-4 h-4 text-[var(--color-neon-primary)]" /> 3. Compose Message Body
                        </h2>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-white">Email Body Template</label>
                            <textarea
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                rows={6}
                                className="w-full bg-[var(--color-neon-bg)] border border-[var(--color-neon-border)] rounded-lg p-3 text-xs text-white focus:border-[var(--color-neon-primary)] outline-none resize-y font-sans"
                            />
                            <div className="flex flex-wrap gap-2 text-[9px] text-[var(--color-neon-muted)]">
                                <span>Placeholders:</span>
                                <span className="font-mono text-white/80 bg-white/5 px-1 py-0.5 rounded">{`{name}`}</span>
                                <span className="font-mono text-white/80 bg-white/5 px-1 py-0.5 rounded">{`{course}`}</span>
                                <span className="font-mono text-white/80 bg-white/5 px-1 py-0.5 rounded">{`{certificateId}`}</span>
                                <span className="font-mono text-white/80 bg-white/5 px-1 py-0.5 rounded">{`{verifyUrl}`}</span>
                            </div>
                        </div>

                        {/* Theme selector */}
                        <div className="flex flex-col gap-2 pt-2">
                            <label className="text-xs font-semibold text-white">Select Layout Theme</label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {THEMES.map(theme => (
                                    <div
                                        key={theme.value}
                                        onClick={() => setSelectedTheme(theme.value)}
                                        className={`border rounded-xl p-3 cursor-pointer transition-all ${selectedTheme === theme.value ? "border-[var(--color-neon-primary)] bg-[var(--color-neon-primary)]/5" : "border-[var(--color-neon-border)] hover:border-white/20 bg-black/10"}`}
                                    >
                                        <p className="text-xs font-bold text-white">{theme.label}</p>
                                        <p className="text-[10px] text-[var(--color-neon-muted)] mt-1">{theme.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Preview & Actions */}
                <div className="space-y-6">
                    {/* Live Preview Panel */}
                    <div className="glass-card p-6 flex flex-col h-[520px]">
                        <h2 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-[var(--color-neon-border)]/50 pb-3 mb-4">
                            <Eye className="w-4 h-4 text-[var(--color-neon-primary)]" /> Real-time Live Preview
                        </h2>

                        <div className="flex-1 overflow-y-auto bg-black/40 rounded-xl p-4 border border-[var(--color-neon-border)]/30 min-h-[300px]">
                            <div className="text-[10px] font-mono text-[var(--color-neon-muted)] mb-3 pb-2 border-b border-white/5 space-y-1">
                                <p><span className="text-white/60">Subject:</span> {subject.replace(/{course}/g, sampleCert.course).replace(/{certificateId}/g, sampleCert.certificateId)}</p>
                                {cc && <p><span className="text-white/60">CC:</span> {cc}</p>}
                                <p><span className="text-white/60">To:</span> {sampleCert.recipientEmail || "recipient@example.com"}</p>
                            </div>
                            <div className="scale-95 origin-top" dangerouslySetInnerHTML={{ __html: livePreviewHtml }} />
                        </div>
                    </div>

                    {/* Submit Actions */}
                    <div className="glass-card p-6 space-y-3">
                        <button
                            type="button"
                            disabled={isQueuing || isSending || selectedCertIds.length === 0}
                            onClick={handleQueueAndSend}
                            className="w-full btn-primary py-3 flex items-center justify-center gap-2 text-xs font-bold transition-all disabled:opacity-50"
                        >
                            <Send className="w-4 h-4" /> Send Immediately Now ({selectedCertIds.length})
                        </button>
                        <button
                            type="button"
                            disabled={isQueuing || isSending || selectedCertIds.length === 0}
                            onClick={handleQueueOnly}
                            className="w-full bg-[var(--color-neon-surface-hover)] border border-[var(--color-neon-border)] hover:border-[var(--color-neon-primary)] text-white py-3 rounded-xl flex items-center justify-center gap-2 text-xs transition-colors disabled:opacity-50"
                        >
                            <CheckSquare className="w-4 h-4 text-[var(--color-neon-primary)]" /> Save to Pending Queue ({selectedCertIds.length})
                        </button>
                        <p className="text-[10px] text-center text-[var(--color-neon-muted)] mt-2">
                            * Selected certificates will have their email triggers registered. Sending immediately processes the queue via Resend API.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ComposePage() {
    return (
        <div className="flex flex-col min-h-screen overflow-x-hidden">
            {/* Nav */}
            <main className="flex-1 flex flex-col items-center p-8 z-10 pt-24">
                <div className="glow-bg" style={{ top: "10%" }}></div>

                {/* Header Navbar Layer */}
                <div className="w-full max-w-6xl mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between relative z-20">
                    <Link
                        href="/"
                        className="text-xl font-black tracking-widest uppercase inline-flex items-center gap-2 text-white shrink-0 whitespace-nowrap w-fit"
                    >
                        <Image
                            src="/vuralogo.png"
                            alt="Vura Logo"
                            width={32}
                            height={32}
                            className="rounded-lg object-contain shrink-0"
                        />
                        VURA
                    </Link>
                    <div className="flex w-full flex-wrap items-stretch gap-2 sm:w-auto sm:flex-nowrap sm:items-center sm:justify-end sm:gap-3">
                        <Link
                            href="/"
                            className="btn-secondary basis-[calc(50%-0.25rem)] min-w-0 flex items-center justify-center gap-2 px-3 py-2 text-sm whitespace-nowrap sm:basis-auto sm:px-4 sm:flex-none"
                        >
                            <Home className="w-4 h-4" /> Home
                        </Link>
                        <Link
                            href="/dashboard"
                            className="btn-secondary basis-[calc(50%-0.25rem)] min-w-0 flex items-center justify-center gap-2 px-3 py-2 text-sm whitespace-nowrap sm:basis-auto sm:px-4 sm:flex-none"
                        >
                            <LayoutDashboard className="w-4 h-4" /> Gallery
                        </Link>
                    </div>
                </div>

                <Suspense fallback={
                    <div className="flex flex-col items-center justify-center min-h-[60vh] text-[var(--color-neon-muted)]">
                        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-neon-primary)] mb-4" />
                        <p>Loading email composer...</p>
                    </div>
                }>
                    <ComposeContent />
                </Suspense>
            </main>
        </div>
    );
}
