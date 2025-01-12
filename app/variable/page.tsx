// app/variables/page.tsx

"use client";

import React from 'react';
import VariableTable from '../../components/VariableTable/VariableTable';

export default function VariablesPage() {
    return (
        <div className="h-full w-full">
            <VariableTable />
        </div>
    );
}
