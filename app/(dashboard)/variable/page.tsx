// app/variables/page.tsx

"use client";

import React, {Suspense} from 'react';
import VariableTable from '../../../components/VariableTable/VariableTable';
import {VariableTableSkeleton} from "@/components/Skeletons";

export default function VariablesPage() {
    return (
        <div className="h-full w-full">
            <Suspense fallback={<VariableTableSkeleton />}>
                <VariableTable />
            </Suspense>
        </div>
    );
}
