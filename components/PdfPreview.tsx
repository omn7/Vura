import React, { useState, Component, ErrorInfo, ReactNode } from 'react';

import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();

interface PdfPreviewProps {
    fileUrl: string;
}

class PdfErrorBoundary extends Component<{ children: ReactNode, fallback: ReactNode }, { hasError: boolean }> {
    constructor(props: { children: ReactNode, fallback: ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(_: Error) {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.warn("Caught PDF render error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback;
        }
        return this.props.children;
    }
}

export default function PdfPreview({ fileUrl }: PdfPreviewProps) {
    const [error, setError] = useState(false);

    const fallbackIframe = (
        <div className="w-full h-full min-h-[500px] bg-white rounded-lg overflow-hidden flex flex-col pointer-events-none">
            <div className="bg-amber-500/20 text-amber-500 text-xs p-2 text-center border-b border-amber-500/50">
                PDF format warning: Rendering in compatibility mode
            </div>
            <iframe src={fileUrl} className="w-full h-full flex-1 pointer-events-none" title="PDF Preview" />
        </div>
    );

    if (error) {
        return fallbackIframe;
    }

    return (
        <PdfErrorBoundary fallback={fallbackIframe}>
            <Document
                file={fileUrl}
                onLoadError={(err) => {
                    console.warn(err);
                    setError(true);
                }}
                onSourceError={(err) => {
                    console.warn(err);
                    setError(true);
                }}
                loading={<div className="p-10 text-[var(--color-neon-muted)] animate-pulse">Loading preview...</div>}
            >
                <Page pageNumber={1} renderTextLayer={false} renderAnnotationLayer={false} className="shadow-2xl pointer-events-none" />
            </Document>
        </PdfErrorBoundary>
    );
}
