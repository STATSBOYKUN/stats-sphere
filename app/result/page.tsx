// app/result/page.tsx
"use client";

import React from 'react';
import DataTable from '../../components/DataTable/DataTable';
import Sidebar from '../../components/Layout/Main/Sidebar';
import ResultOutput from "@/components/Output/ResultOutput";

export default function DataPage() {
    return (
        <div className="flex w-full h-80 flex-grow">
            <Sidebar />
            <div className="flex-grow h-full overflow-hidden">
                <ResultOutput />
            </div>
        </div>
    );
}
