export interface PDFFile {
    name: string;
    size: string;
    publishedDate: string;
    url: string;
    id?: string;
    fileType?: 'pdf' | 'doc' | 'docx';
    department?: string;
    category?: string;
}

export interface PDFViewerProps {
    isOpen: boolean;
    onClose: () => void;
    pdfUrl: string;
    fileName: string;
}
