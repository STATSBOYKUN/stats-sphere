// app/data/page.tsx

"use client";

import React from 'react';
import DataTable from '../../components/DataTable';

export default function DataPage() {
    return (
        <div className="flex-grow w-full flex flex-col">
            <DataTable />
        </div>
    );
}
