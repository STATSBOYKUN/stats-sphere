// app/result/page.tsx

"use client";

import React, {Suspense} from 'react';
import Sidebar from '@/components/Sidebar/Sidebar';
import ResultOutput from "@/components/Output/ResultOutput";
import {ResultsSkeleton, SidebarSkeleton} from "@/components/Skeletons";

export default function ResultPage() { // Ganti nama fungsi menjadi ResultPage untuk menghindari duplikasi
    return (
        <div className="h-full w-full flex">
            <Suspense fallback={<SidebarSkeleton />}>
                <Sidebar />
            </Suspense>
            <div className="flex-grow h-full overflow-y-auto">
                <Suspense fallback={<ResultsSkeleton />}>
                    <ResultOutput />
                </Suspense>
            </div>
        </div>
    );
}
