'use client';

import { X } from 'lucide-react';
import { useEffect } from 'react';

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

    useEffect(() => {
        return () => {
            if (pdfUrl && pdfUrl.startsWith('blob:')) {
                window.URL.revokeObjectURL(pdfUrl);
            }
        };
    }, [pdfUrl]);


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

    const handleDownload = async () => {
        try {

            if (pdfUrl.startsWith('blob:')) {
                const link = document.createElement('a');
                link.href = pdfUrl;
                link.download = fileName.endsWith('.pdf') ? fileName : fileName + '.pdf';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                return;
            }
        } catch (error) {
            console.error('Error downloading PDF:', error);
        }
    };

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
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onClose}
                            className="p-2 rounded-md text-white hover:text-black hover:bg-gray-200 transition-colors"
                            title="Close"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <button
                            onClick={handleDownload}
                            className="p-2 rounded-md text-white hover:text-black hover:bg-gray-200 transition-colors"
                            title="Download"
                        >
                            Download
                        </button>
                    </div>
                </div>

                {/* PDF Content */}
                <div className="flex-1 overflow-hidden">
                    <iframe
                        src={pdfUrl}
                        className="w-full h-full border-0"
                        title={fileName}
                    />
                </div>
            </div>
        </div>
    );
}
