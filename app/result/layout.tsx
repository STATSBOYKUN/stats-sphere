// app/output/layout.tsx
import { ReactNode } from 'react';
import Sidebar from '@/components/Layout/Main/Sidebar';

export default function OutputLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex">
            <Sidebar />
            <div className="flex-1">
                {children}
            </div>
        </div>
    );
}
