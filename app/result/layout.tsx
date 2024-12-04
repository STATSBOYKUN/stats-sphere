// components/Layout/ResultLayout.tsx

import { ReactNode } from 'react';
import Sidebar from '@/components/Layout/Main/Sidebar';

export default function ResultLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex flex-1 overflow-hidden">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-grow overflow-y-auto p-4">
                    {children}
                </div>
            </div>
        </div>
    );
}
