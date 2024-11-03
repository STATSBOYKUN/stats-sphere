// app/variables/page.tsx

"use client";

import React, { useState } from 'react';
import VariableTable from '../../components/VariableTable/VariableTable';

export default function VariablesPage() {

    return (
        <div className="flex-grow w-full flex flex-col">
            <VariableTable/>
        </div>
    );
}
