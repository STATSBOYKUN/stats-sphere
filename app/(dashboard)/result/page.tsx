"use client";

import React, {Suspense} from 'react';
import Sidebar from '@/components/Sidebar/Sidebar';
import ResultOutput from "@/components/Output/ResultOutput";
import {ResultsSkeleton, SidebarSkeleton} from "@/components/Skeletons";

export default function ResultPage() {
    return (
        <div className="flex h-full w-full overflow-hidden">
            <Suspense fallback={<SidebarSkeleton />}>
                <Sidebar />
            </Suspense>
            <div className="flex-1 overflow-y-auto">
                <Suspense fallback={<ResultsSkeleton />}>
                    <ResultOutput />
                </Suspense>
            </div>
        </div>
    );
}