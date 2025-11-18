import React from 'react';
import type { ResultItem } from '../types';

const parseMarkdown = (line: string): React.ReactNode => {
    // Escape HTML to prevent XSS - applied only to plain text parts.
    const escapeHtml = (unsafe: string) => 
        unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");

    // Process markdown syntax for inline elements
    const parts = line
        // Bold: **text**
        .split(/(\*\*.*?\*\*)/g)
        // Italics: *text*
        .flatMap(part => part.split(/(\*.*?\*)/g))
        // Links: [text](url)
        .flatMap(part => part.split(/(\[.*?\]\(.*?\))/g))
        .filter(part => part);

    return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index}>{parseMarkdown(part.slice(2, -2))}</strong>;
        }
        if (part.startsWith('*') && part.endsWith('*')) {
            return <em key={index}>{parseMarkdown(part.slice(1, -1))}</em>;
        }
        if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
            const match = part.match(/\[(.*?)\]\((.*?)\)/);
            if (match) {
                const text = match[1];
                const url = match[2];
                return <a href={url} key={index} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">{text}</a>;
            }
        }
        // It's a plain text part, so we can render it as is. React escapes it by default.
        return part;
    });
};

const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
    const renderContent = () => {
        const elements: React.ReactNode[] = [];
        let currentList: string[] = [];

        const flushList = () => {
            if (currentList.length > 0) {
                elements.push(
                    <ul key={`ul-${elements.length}`} className="list-disc pl-6 my-3 space-y-1">
                        {currentList.map((item, i) => (
                            <li key={i} className="text-slate-600 leading-relaxed">{parseMarkdown(item)}</li>
                        ))}
                    </ul>
                );
                currentList = [];
            }
        };

        content.split('\n').forEach((line, index) => {
            if (line.startsWith('* ') || line.startsWith('- ')) {
                currentList.push(line.substring(2));
            } else {
                flushList(); // Render any pending list before processing the current line
                
                if (line.startsWith('# ')) {
                    elements.push(<h1 key={index} className="text-3xl font-bold mt-6 mb-3 text-slate-800">{parseMarkdown(line.substring(2))}</h1>);
                } else if (line.startsWith('## ')) {
                    elements.push(<h2 key={index} className="text-2xl font-semibold mt-5 mb-2 text-slate-700">{parseMarkdown(line.substring(3))}</h2>);
                } else if (line.startsWith('### ')) {
                    elements.push(<h3 key={index} className="text-xl font-semibold mt-4 mb-2 text-slate-700">{parseMarkdown(line.substring(4))}</h3>);
                } else if (line.trim() === '') {
                    elements.push(<p key={index}>&nbsp;</p>);
                } else {
                    elements.push(<p key={index} className="my-2 text-slate-600 leading-relaxed">{parseMarkdown(line)}</p>);
                }
            }
        });

        flushList(); // Render any remaining list at the end

        return elements;
    };

    return <div className="prose prose-slate max-w-none">{renderContent()}</div>;
};


export const ResultsDisplay: React.FC<{ results: ResultItem[] }> = ({ results }) => {
    return (
        <div className="space-y-8">
            {results.map((item, index) => {
                if (item.type === 'image') {
                    return (
                        <div key={index} className="bg-white p-4 rounded-lg shadow-md border border-slate-200 transition-transform transform hover:scale-105 hover:shadow-xl">
                             <img 
                                src={item.content} 
                                alt={item.alt} 
                                className="w-full h-auto object-contain rounded-md bg-slate-100"
                            />
                            <p className="text-sm text-gray-500 mt-2 text-center font-semibold">{item.alt}</p>
                        </div>
                    );
                }
                if (item.type === 'text') {
                    return (
                        <div key={index} className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
                           <MarkdownRenderer content={item.content} />
                        </div>
                    );
                }
                return null;
            })}
        </div>
    );
};