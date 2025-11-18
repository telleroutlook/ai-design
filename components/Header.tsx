import React from 'react';
import { DesignIcon } from './icons';

export const Header: React.FC = () => {
    return (
        <header className="bg-white shadow-sm">
            <div className="container mx-auto px-4 py-4 flex items-center justify-center">
                <DesignIcon />
                <h1 className="text-2xl font-bold text-slate-700 ml-3">
                    AI Design Assistant
                </h1>
            </div>
        </header>
    );
};
