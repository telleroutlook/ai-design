import type { ResultItem } from '../types';

// Let TypeScript know jsPDF is available globally
declare const jspdf: any;

// Helper to load an image and return its dimensions
const getImageDimensions = (src: string): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve({ width: img.width, height: img.height });
        img.onerror = (err) => reject(err);
        img.src = src;
    });
};

export const generatePdfFromResults = async (results: ResultItem[], title: string): Promise<void> => {
    const { jsPDF } = jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');
    const FONT_NAME = 'NotoSansCJKjp-Regular';
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const margin = 15;
    const contentWidth = pdfWidth - margin * 2;
    let cursorY = margin;

    const addNewPageIfNecessary = (requiredHeight: number) => {
        if (cursorY + requiredHeight > pdf.internal.pageSize.getHeight() - margin) {
            pdf.addPage();
            cursorY = margin;
        }
    };

    // --- Title Page ---
    pdf.setFont(FONT_NAME, 'normal'); // Use CJK-compatible font, normal style
    pdf.setFontSize(24);
    const titleLines = pdf.splitTextToSize(title, contentWidth);
    addNewPageIfNecessary(titleLines.length * 10);
    pdf.text(titleLines, pdfWidth / 2, cursorY, { align: 'center' });
    cursorY += titleLines.length * 10 + 10;
    
    pdf.setFont(FONT_NAME, 'normal'); // Use CJK-compatible font
    pdf.setFontSize(12);
    pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, pdfWidth / 2, cursorY, { align: 'center' });
    
    pdf.addPage();
    cursorY = margin;


    for (const item of results) {
        if (item.type === 'text') {
            pdf.setFont(FONT_NAME, 'normal'); // Set default font for text blocks
            pdf.setFontSize(12);
            const lines = item.content.split('\n');
            for (const line of lines) {
                let isHeader = false;
                let processedLine = line;
                let lineHeight = 7;
                let preSpacing = 0;
                let postSpacing = 0;
                let leftMargin = margin;

                if (line.startsWith('# ')) {
                    pdf.setFontSize(18);
                    processedLine = line.substring(2);
                    isHeader = true;
                    preSpacing = 5;
                    postSpacing = 2;
                } else if (line.startsWith('## ')) {
                    pdf.setFontSize(16);
                    processedLine = line.substring(3);
                    isHeader = true;
                    preSpacing = 4;
                    postSpacing = 2;
                } else if (line.startsWith('### ')) {
                    pdf.setFontSize(14);
                    processedLine = line.substring(4);
                    isHeader = true;
                    preSpacing = 3;
                    postSpacing = 1;
                } else if (line.startsWith('* ') || line.startsWith('- ')) {
                    processedLine = `• ${line.substring(2)}`;
                    leftMargin = margin + 5; // Indent bullet points
                }

                if (processedLine.trim() === '') {
                     cursorY += 5; // Add space for empty lines
                     continue;
                }
                
                // Always reset to normal style, font size is handled above
                pdf.setFont(FONT_NAME, 'normal');

                const splitLines = pdf.splitTextToSize(processedLine, contentWidth - (leftMargin - margin));
                addNewPageIfNecessary(splitLines.length * lineHeight + preSpacing + postSpacing);
                
                cursorY += preSpacing;
                pdf.text(splitLines, leftMargin, cursorY);
                cursorY += splitLines.length * lineHeight + postSpacing;
                
                // Reset font size for next line
                pdf.setFontSize(12);
            }
             cursorY += 5; // Space between text blocks
        } else if (item.type === 'image' && item.content) {
             try {
                const { width, height } = await getImageDimensions(item.content);
                const aspectRatio = width / height;
                const imgHeight = contentWidth / aspectRatio;

                addNewPageIfNecessary(imgHeight + 15); // Image + alt text
                
                pdf.addImage(item.content, 'WEBP', margin, cursorY, contentWidth, imgHeight);
                cursorY += imgHeight + 5;

                if (item.alt) {
                    pdf.setFontSize(10);
                    pdf.setFont(FONT_NAME, 'normal'); // Use normal style for captions
                    const altLines = pdf.splitTextToSize(item.alt, contentWidth);
                    addNewPageIfNecessary(altLines.length * 5);
                    pdf.text(altLines, pdfWidth / 2, cursorY, { align: 'center' });
                    cursorY += altLines.length * 5 + 10;
                }
             } catch (error) {
                console.error("Could not add image to PDF:", error);
                addNewPageIfNecessary(10);
                pdf.text('[Image could not be loaded]', margin, cursorY);
                cursorY += 10;
             }
             // Reset font for subsequent items
             pdf.setFontSize(12);
             pdf.setFont(FONT_NAME, 'normal');
        }
    }

    const safeTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 50);
    pdf.save(`${safeTitle}-design-package.pdf`);
};