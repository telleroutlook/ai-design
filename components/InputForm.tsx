import React, { useState, useRef, useEffect, useCallback } from 'react';
import { SparklesIcon, UploadIcon, CloseIcon } from './icons';

interface InputFormProps {
    onGenerate: (prompt: string, imageFile: File | null) => void;
    isLoading: boolean;
    resetKey?: number;
}

export const InputForm: React.FC<InputFormProps> = ({ onGenerate, isLoading, resetKey }) => {
    const [prompt, setPrompt] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [inputError, setInputError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const MAX_UPLOAD_SIZE_MB = 10;

    const handleFile = (file: File | null) => {
        if (!file) {
            setImageFile(null);
            setImagePreview(null);
            setUploadError(null);
            return;
        }

        if (file && file.type.startsWith('image/')) {
            const fileSizeMb = file.size / (1024 * 1024);
            if (fileSizeMb > MAX_UPLOAD_SIZE_MB) {
                setUploadError(`文件大小不能超过 ${MAX_UPLOAD_SIZE_MB}MB。`);
                return;
            }
            setUploadError(null);
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setUploadError('只能上传图片格式（PNG/JPG/WEBP）。');
            console.warn('Attempted to upload a non-image file.');
        }
    }
    
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleFile(e.target.files?.[0] ?? null);
    };

    const resetImageState = useCallback(() => {
        setImageFile(null);
        setImagePreview(null);
        setUploadError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, []);

    const handleRemoveImage = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        resetImageState();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoading) return;
        const trimmedPrompt = prompt.trim();
        if (!trimmedPrompt) {
            setInputError('Please describe your design concept before generating.');
            return;
        }
        setInputError(null);
        onGenerate(trimmedPrompt, imageFile);
    };

    const handleDragEnter = (e: React.DragEvent) => {
        if (isLoading) return;
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            setIsDragging(true);
        }
    };
    
    const handleDragLeave = (e: React.DragEvent) => {
        if (isLoading) return;
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };
    
    const handleDragOver = (e: React.DragEvent) => {
        if (isLoading) return;
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        if (isLoading) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        handleFile(e.dataTransfer.files?.[0] ?? null);
    };

    useEffect(() => {
        if (resetKey === undefined) return;
        setPrompt('');
        setInputError(null);
        resetImageState();
    }, [resetKey, resetImageState]);

    const dropZoneClasses = [
        'mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md transition-colors duration-200',
        isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300',
        isLoading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:border-indigo-400',
    ].join(' ');

    return (
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg border border-slate-200 space-y-4">
            <div className="space-y-2">
                <label htmlFor="prompt" className="block text-sm font-medium text-gray-700">Design Brief</label>
                <textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => {
                        setPrompt(e.target.value);
                        if (inputError) {
                            setInputError(null);
                        }
                    }}
                    placeholder="Describe your concept, e.g., 'A mobile app for gardeners,' 'a modern living room,' or 'a cute cartoon water cup'."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 placeholder-gray-400 min-h-[100px]"
                    required
                />
                {inputError && (
                    <p className="text-sm text-red-600 mt-1">{inputError}</p>
                )}
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Upload Image (Optional)</label>
                <div 
                    className={dropZoneClasses}
                    onClick={() => !isLoading && fileInputRef.current?.click()}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                >
                    <div className="space-y-1 text-center">
                        <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                            <p className="pl-1">Click or drag & drop a reference image, sketch, or logo</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 10MB</p>
                    </div>
                </div>
                <input
                    id="file-upload"
                    ref={fileInputRef}
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    accept="image/*"
                    onChange={handleImageChange}
                />
            </div>
            {uploadError && (
                <p className="text-sm text-red-600 mt-1">{uploadError}</p>
            )}
           
            {imagePreview && (
                <div className="flex items-center space-x-4 p-3 bg-slate-50 rounded-lg border">
                     <img src={imagePreview} alt="Image preview" className="w-16 h-16 object-cover rounded-md" />
                     <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{imageFile?.name}</p>
                        <p className="text-xs text-slate-500">{imageFile ? `${(imageFile.size / 1024).toFixed(1)} KB` : ''}</p>
                     </div>
                    <button 
                        type="button" 
                        onClick={handleRemoveImage}
                        className="p-1 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors"
                        aria-label="Remove image"
                    >
                        <CloseIcon className="h-5 w-5" />
                    </button>
                </div>
            )}

            <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-all duration-300 ease-in-out"
            >
                {isLoading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating...
                    </>
                ) : (
                    <>
                        <SparklesIcon />
                        Generate Design
                    </>
                )}
            </button>
        </form>
    );
};
