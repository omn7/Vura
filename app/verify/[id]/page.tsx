import prisma from "@/lib/prisma"
import { CheckCircle2, XCircle, ExternalLink, Calendar, GraduationCap, User } from "lucide-react"

export default async function VerifyPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const id = params.id;

    // Fetch from DB
    const certificate = await prisma.certificate.findUnique({
        where: {
            certificateId: id,
        }
    });

    if (!certificate) {
        return (
            <main className="flex-1 flex flex-col items-center justify-center p-8 z-10 min-h-screen">
                <div className="glow-bg" style={{ background: 'radial-gradient(ellipse at center, rgba(255, 50, 50, 0.15) 0%, transparent 70%)' }}></div>
                <div className="glass-card text-center max-w-md w-full relative z-10 border-red-500/30">
                    <XCircle className="w-20 h-20 mx-auto text-red-500 mb-6 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
                    <h1 className="text-3xl font-bold mb-2">Invalid Certificate</h1>
                    <p className="text-[var(--color-neon-muted)]">
                        We couldn't find a certificate matching the ID: <span className="text-white font-mono">{id}</span>.
                    </p>
                </div>
            </main>
        )
    }

    return (
        <main className="flex-1 flex flex-col items-center justify-center p-8 z-10 min-h-screen">
            <div className="glow-bg"></div>

            <div className="glass-card w-full max-w-lg relative z-10">
                <div className="flex flex-col items-center border-b border-[var(--color-neon-border)] pb-8 mb-8">
                    <CheckCircle2 className="w-20 h-20 text-[var(--color-neon-primary)] mb-6 drop-shadow-[0_0_15px_rgba(0,229,153,0.5)]" />
                    <h1 className="text-3xl font-bold mb-2">Valid Certificate</h1>
                    <span className="bg-[#00e599]/20 text-[#00e599] font-mono px-4 py-1.5 rounded-full text-sm font-semibold tracking-wider border border-[#00e599]/40">
                        {certificate.certificateId}
                    </span>
                </div>

                <div className="space-y-6">
                    <div className="flex items-start">
                        <User className="w-5 h-5 mt-0.5 mr-4 text-[var(--color-neon-muted)]" />
                        <div>
                            <p className="text-sm text-[var(--color-neon-muted)] mb-1">Recipient Name</p>
                            <p className="text-lg font-semibold">{certificate.name}</p>
                        </div>
                    </div>

                    <div className="flex items-start">
                        <GraduationCap className="w-5 h-5 mt-0.5 mr-4 text-[var(--color-neon-muted)]" />
                        <div>
                            <p className="text-sm text-[var(--color-neon-muted)] mb-1">Course / Certification</p>
                            <p className="text-lg font-semibold">{certificate.course}</p>
                        </div>
                    </div>

                    <div className="flex items-start">
                        <Calendar className="w-5 h-5 mt-0.5 mr-4 text-[var(--color-neon-muted)]" />
                        <div>
                            <p className="text-sm text-[var(--color-neon-muted)] mb-1">Date of Issue</p>
                            <p className="text-lg font-semibold text-white">{certificate.issueDate}</p>
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t border-[var(--color-neon-border)] text-center w-full">
                    <a
                        href={certificate.pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center w-full py-4 text-sm font-semibold text-black bg-[var(--color-neon-primary)] rounded-xl transition-all hover:bg-[#00ffaa] shadow-[0_0_15px_rgba(0,229,153,0.2)] hover:shadow-[0_0_20px_rgba(0,229,153,0.4)]"
                    >
                        View Original PDF <ExternalLink className="w-4 h-4 ml-2" />
                    </a>
                </div>
            </div>
        </main>
    )
}
