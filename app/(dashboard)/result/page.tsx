// app/result/page.tsx

"use client";

import React from 'react';
import Sidebar from '@/components/Sidebar/Sidebar';
import ResultOutput from "@/components/Output/ResultOutput";

export default function ResultPage() { // Ganti nama fungsi menjadi ResultPage untuk menghindari duplikasi
    return (
        <div className="h-full w-full flex">
            <Sidebar />
            <div className="flex-grow h-full overflow-y-auto">
                <ResultOutput />
            </div>
        </div>
    );
}
