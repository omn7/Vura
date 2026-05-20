'use client';

import { useState } from 'react';

export default function CopyLinkButton({ url }: { url: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            alert(`✅ Link copied!\n\n${url}`);
        } catch (err) {
            alert(`⚠️ Please copy manually:\n${url}`);
        }
    };

    return (
        <button
            onClick={handleCopy}
            className="p-1.5 text-[var(--color-neon-muted)] hover:text-[var(--color-neon-primary)] hover:bg-[var(--color-neon-primary)]/08 rounded-lg transition-colors"
            title="Copy verification link"
        >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
        </button>
    );
}
