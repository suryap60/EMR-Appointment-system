import React from 'react';
import { useLocation } from 'react-router-dom';

const PlaceholderPage: React.FC = () => {
    const location = useLocation();
    const pageName = location.pathname.split('/').filter(Boolean).pop()?.replace('-', ' ') || 'Page';

    return (
        <div className="fade-in max-w-5xl mx-auto flex flex-col items-center justify-center min-h-[60vh]">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-6">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 capitalize mb-2">{pageName}</h2>
            <p className="text-slate-500 text-center max-w-md">
                This module is part of the EMR assessment requirements but is not yet fully implemented.
            </p>
        </div>
    );
};

export default PlaceholderPage;
