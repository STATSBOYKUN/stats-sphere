// app/data/page.tsx

"use client";

import React from 'react';
import DataTable from './components/DataTable';

export default function DataPage() {
    return (
        <div className="z-0 h-full w-full">
            <DataTable />
        </div>
    );
}
