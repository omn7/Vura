import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import BatchCertificateDashboard from "@/components/BatchCertificateDashboard";

export default async function BatchDashboardPage(props: { params: Promise<{ batchId: string }> }) {
    const params = await props.params;

    // The `batchId` is passed directly as a prop. 
    // Ensure that `BatchCertificateDashboard` and any underlying API calls 
    // (e.g., app/api/batches/[batchId]/certificates/route.ts) 
    // enforce authorization (e.g., userId check) to prevent IDOR.
    // The API route for certificates already does this.

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-[var(--color-neon-muted)] hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to dashboard
                </Link>
            </div>

            <BatchCertificateDashboard batchId={params.batchId} />
        </div>
    );
}
