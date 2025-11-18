import React from 'react';

export const SparklesIcon: React.FC<{ className?: string }> = ({ className = "h-5 w-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.84 2.84l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.84 2.84l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.84-2.84l-2.846-.813a.75.75 0 010-1.442l2.846-.813a3.75 3.75 0 002.84-2.84l.813-2.846A.75.75 0 019 4.5zM18 1.5a.75.75 0 01.728.568l.258 1.036a6.75 6.75 0 005.156 5.156l1.036.258a.75.75 0 010 1.456l-1.036.258a6.75 6.75 0 00-5.156 5.156l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a6.75 6.75 0 00-5.156-5.156l-1.036-.258a.75.75 0 010-1.456l1.036-.258a6.75 6.75 0 005.156-5.156l.258-1.036A.75.75 0 0118 1.5z" clipRule="evenodd" />
    </svg>
);

export const DesignIcon: React.FC<{ className?: string }> = ({ className = "h-8 w-8 text-indigo-600" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
);

export const UploadIcon: React.FC<{ className?: string }> = ({ className = "h-6 w-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
);

// Fix: Add SendIcon for use in Chatbot component.
export const SendIcon: React.FC<{ className?: string }> = ({ className = "h-6 w-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
    </svg>
);

export const ChatIcon: React.FC<{ className?: string }> = ({ className = "h-6 w-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M4.804 21.644A6.707 6.707 0 006 21.75a6.75 6.75 0 006.75-6.75v-2.5a.75.75 0 011.5 0v2.5a8.25 8.25 0 01-8.25 8.25c-1.33 0-2.59-.333-3.712-.924a.75.75 0 01-.36-1.043 8.25 8.25 0 01-.14-8.845.75.75 0 011.161.492 6.75 6.75 0 00.114 7.23z" clipRule="evenodd" />
        <path fillRule="evenodd" d="M12.75 3a.75.75 0 01.75.75v6.5a.75.75 0 01-1.5 0v-6.5A.75.75 0 0112.75 3zM16.5 6.75a.75.75 0 00-1.5 0v.25a.75.75 0 001.5 0v-.25zM18.75 9a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5a.75.75 0 01.75-.75zM18 2.25a.75.75 0 00-1.5 0v.25a.75.75 0 001.5 0V2.25z" clipRule="evenodd" />
    </svg>
);


export const CloseIcon: React.FC<{ className?: string }> = ({ className = "h-6 w-6" }) => (
     <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
    </svg>
);

export const PdfIcon: React.FC<{ className?: string }> = ({ className = "h-5 w-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a.375.375 0 01-.375-.375V6.75A3.75 3.75 0 0010.5 3h-4.875A1.875 1.875 0 005.625 1.5zM12 11.25a.75.75 0 01.75.75v3.19l1.72-1.72a.75.75 0 011.06 1.06l-3 3a.75.75 0 01-1.06 0l-3-3a.75.75 0 111.06-1.06l1.72 1.72V12a.75.75 0 01.75-.75zm-3-5.25a.75.75 0 000 1.5h.75a.75.75 0 000-1.5h-.75z" clipRule="evenodd" />
        <path d="M12.971 1.816A5.23 5.23 0 0115.375 3V6.75h3.75c1.352 0 2.54.822 3.012 2.016A5.23 5.23 0 0118.375 12h-1.875a.375.375 0 01-.375-.375V9.75A1.875 1.875 0 0014.25 7.875h-1.875a.375.375 0 01-.375-.375V5.625A1.875 1.875 0 0010.125 3.75H8.25a.75.75 0 01-.75-.75 5.25 5.25 0 015.471-1.184z" />
    </svg>
);