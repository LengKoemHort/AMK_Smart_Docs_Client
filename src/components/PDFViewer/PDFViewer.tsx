// This has been depreciated and use the PDFViewerBlob.tsx instead

'use client';

import { X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface PDFViewerProps {
    isOpen: boolean;
    onClose: () => void;
    pdfUrl: string;
    fileName: string;
}

export default function PDFViewer({
    isOpen,
    onClose,
    pdfUrl,
    fileName,
}: PDFViewerProps) {
    const [rotation, setRotation] = useState(0);

    // Close modal on Escape key
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    // ...existing code...

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-60 backdrop-blur-sm">
            <div className="relative w-full h-full flex flex-col max-w-full max-h-screen shadow-xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between py-2 pr-4 pl-6 border-b bg-primary flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <h3 className="text-lg font-semibold text-white truncate">
                            {fileName}
                        </h3>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onClose}
                            className="p-2 rounded-md text-white hover:text-black hover:bg-gray-200 transition-colors"
                            title="Close"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* PDF Content */}
                <div className="flex-1 overflow-hidden">
                    <iframe
                        src={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1&page=1&view=FitH`}
                        className="w-full h-full border-0"
                        style={{
                            transform: `rotate(${rotation}deg)`,
                            transition: 'transform 0.3s ease',
                        }}
                        title={fileName}
                    />
                </div>
            </div>
        </div>
    );
}
