import ApiKeyPanel from "@/components/ApiKeyPanel";
import Link from "next/link";
import { Code2 } from "lucide-react";

export default function ApiKeyPage() {
    return (
        <div className="space-y-8 max-w-2xl">
            <div>
                <h1 className="text-2xl font-bold text-white">API Key</h1>
                <p className="text-sm text-[var(--color-neon-muted)] mt-1">
                    Use your secret key to create and verify certificates from any external application.
                </p>
            </div>

            <ApiKeyPanel />

            {/* Quick reference */}
            <div className="glass-card p-6 space-y-4">
                <div className="flex items-center gap-3">
                    <Code2 className="w-5 h-5 text-[var(--color-neon-primary)]" />
                    <h2 className="font-semibold text-white">Quick Reference</h2>
                </div>
                <div className="rounded-xl bg-[#0d0d0d] border border-[var(--color-neon-border)] p-4 font-mono text-xs text-gray-300 space-y-1 overflow-x-auto">
                    <p><span className="text-purple-400">POST</span> https://vurakit.in/api/certificates/create</p>
                    <p><span className="text-[var(--color-neon-muted)]">Authorization:</span> Bearer {"<your_api_key>"}</p>
                    <p><span className="text-[var(--color-neon-muted)]">Content-Type:</span> application/json</p>
                </div>
                <Link href="/docs" className="inline-flex items-center gap-2 text-sm text-[var(--color-neon-primary)] hover:underline underline-offset-4">
                    View full API documentation →
                </Link>
            </div>
        </div>
    );
}
