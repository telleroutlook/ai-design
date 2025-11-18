import React, { useState, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { InputForm } from './components/InputForm';
import { ResultsDisplay } from './components/ResultsDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
import { Chatbot } from './components/Chatbot';
import { SparklesIcon, PdfIcon, ChatIcon } from './components/icons';
import { generateDesignAssets } from './services/geminiService';
import { generatePdfFromResults } from './services/pdfService';
import type { ResultItem } from './types';

const isAbortError = (error: unknown): boolean =>
    error instanceof Error && error.name === 'AbortError';

const App: React.FC = () => {
    const [results, setResults] = useState<ResultItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingMessage, setLoadingMessage] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [currentPrompt, setCurrentPrompt] = useState<string>('');
    const [isChatbotOpen, setIsChatbotOpen] = useState(false);
    const [formResetKey, setFormResetKey] = useState(0);

    const designAbortControllerRef = useRef<AbortController | null>(null);
    const pdfAbortControllerRef = useRef<AbortController | null>(null);
    const hasClearedResultsRef = useRef(false);

    const handleGenerate = useCallback(async (prompt: string, imageFile: File | null) => {
        const trimmedPrompt = prompt.trim();
        if (!trimmedPrompt) {
            setError('Please provide a design brief or concept.');
            return;
        }
        const controller = new AbortController();
        designAbortControllerRef.current?.abort();
        designAbortControllerRef.current = controller;
        hasClearedResultsRef.current = false;
        setIsLoading(true);
        setError(null);
        setCurrentPrompt(trimmedPrompt);
        setLoadingMessage('Warming up the design engine...');

        try {
            const stream = generateDesignAssets(trimmedPrompt, imageFile, controller.signal);
            for await (const result of stream) {
                 if (result.type === 'status') {
                    setLoadingMessage(result.content);
                } else {
                    setResults(prev => {
                        if (!hasClearedResultsRef.current) {
                            hasClearedResultsRef.current = true;
                            return [result];
                        }
                        return [...prev, result];
                    });
                }
            }
        } catch (err) {
            console.error(err);
            if (isAbortError(err)) {
                return;
            }
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(`An error occurred while generating the design: ${errorMessage}`);
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
            if (designAbortControllerRef.current?.signal === controller.signal) {
                designAbortControllerRef.current = null;
            }
        }
    }, []);

    const handleExportPdf = useCallback(async () => {
        if (results.length === 0) return;

        setIsLoading(true);
        setLoadingMessage('Generating PDF, please wait...');
        setError(null);
        const controller = new AbortController();
        pdfAbortControllerRef.current?.abort();
        pdfAbortControllerRef.current = controller;

        try {
            await generatePdfFromResults(results, currentPrompt || "AI Design Package", controller.signal);
        } catch (err) {
            console.error(err);
            if (!isAbortError(err)) {
                const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
                setError(`An error occurred while generating the PDF: ${errorMessage}`);
            }
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
            if (pdfAbortControllerRef.current?.signal === controller.signal) {
                pdfAbortControllerRef.current = null;
            }
        }
    }, [results, currentPrompt]);

    const handleReset = useCallback(() => {
        designAbortControllerRef.current?.abort();
        pdfAbortControllerRef.current?.abort();
        designAbortControllerRef.current = null;
        pdfAbortControllerRef.current = null;
        hasClearedResultsRef.current = false;
        setResults([]);
        setError(null);
        setCurrentPrompt('');
        setIsLoading(false);
        setLoadingMessage('');
        setFormResetKey(prev => prev + 1);
    }, []);


    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased">
            <Header />
            <main className="container mx-auto px-4 py-8">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">AI Design Assistant</h2>
                    <p className="text-slate-600 mb-8">From app mockups to interior renderings. Describe your idea, and let AI bring it to life.</p>
                </div>
                
                <InputForm onGenerate={handleGenerate} isLoading={isLoading} resetKey={formResetKey} />

                {error && (
                    <div className="max-w-3xl mx-auto mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                        {error}
                    </div>
                )}
                
                {isLoading && (
                    <div className="text-center my-12">
                        <LoadingSpinner />
                        <p className="text-lg text-indigo-600 mt-4 animate-pulse">{loadingMessage}</p>
                    </div>
                )}

                {results.length > 0 && !isLoading && (
                    <div className="mt-12 max-w-4xl mx-auto animate-fade-in">
                        <div className="text-center mb-8 flex flex-col sm:flex-row justify-center items-center gap-4">
                            <h3 className="text-2xl font-bold text-slate-800">Your Design Package is Ready!</h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleExportPdf}
                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all duration-300 ease-in-out"
                                >
                                    <PdfIcon />
                                    Export as PDF
                                </button>
                                <button
                                    onClick={handleReset}
                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-white text-slate-600 font-semibold rounded-lg border border-slate-300 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 ease-in-out"
                                >
                                    Start New Design
                                </button>
                            </div>
                        </div>
                        <ResultsDisplay results={results} />
                    </div>
                )}

                {!isLoading && results.length === 0 && (
                     <div className="text-center text-slate-500 mt-16 p-8 bg-white rounded-xl shadow-sm max-w-2xl mx-auto border border-slate-200">
                        <SparklesIcon className="mx-auto h-16 w-16 text-indigo-300" />
                        <p className="mt-4 text-lg">Your generated design assets will appear here.</p>
                        <p className="text-sm">Try an app idea like "a language learning app for kids" or upload an inspirational image.</p>
                    </div>
                )}

            </main>

            <Chatbot isOpen={isChatbotOpen} onClose={() => setIsChatbotOpen(false)} />

            <button
                onClick={() => setIsChatbotOpen(prev => !prev)}
                className="fixed bottom-6 right-6 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-110"
                aria-label="Toggle Chatbot"
            >
                <ChatIcon />
            </button>
        </div>
    );
};

export default App;
