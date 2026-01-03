import { useRef, useState } from 'react';

export default function EvidenceUpload({ onUpload, uploading }) {
    const fileInputRef = useRef(null);
    const [dragActive, setDragActive] = useState(false);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (file) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            alert('Only JPEG, PNG, GIF, and PDF files are allowed.');
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            alert('File size must be less than 10MB.');
            return;
        }
        onUpload(file);
    };

    return (
        <div
            className={`
                border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
                ${dragActive
                    ? 'border-accent-500 bg-accent-50 dark:bg-accent-900/20'
                    : 'border-[var(--color-border)] hover:border-accent-400'
                }
                ${uploading ? 'opacity-50 pointer-events-none' : ''}
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
        >
            <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/jpeg,image/png,image/gif,application/pdf"
                onChange={handleChange}
                disabled={uploading}
            />

            {uploading ? (
                <div className="flex flex-col items-center gap-2">
                    <div className="spinner text-accent-500" />
                    <p className="text-sm text-[var(--color-text-secondary)]">Uploading...</p>
                </div>
            ) : (
                <>
                    <svg className="w-10 h-10 mx-auto text-[var(--color-text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="mt-3 text-sm font-medium">
                        Drag and drop your file here, or click to browse
                    </p>
                    <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                        JPEG, PNG, GIF, or PDF up to 10MB
                    </p>
                </>
            )}
        </div>
    );
}
