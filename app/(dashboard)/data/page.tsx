// app/data/page.tsx

"use client";

import React, { Suspense } from 'react';
import DataTable from '../../../components/DataTable/DataTable';
import {DataTableSkeleton} from "@/components/Skeletons";

export default function DataPage() {
    return (
        <div className="z-0 h-full w-full">
            <Suspense fallback={<DataTableSkeleton />}>
                <DataTable />
            </Suspense>
        </div>
    );
}
