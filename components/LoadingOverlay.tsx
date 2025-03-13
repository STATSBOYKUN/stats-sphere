// components/LoadingOverlay.tsx
"use client";

import React, { Suspense } from 'react';
import { useDataStore } from "@/stores/useDataStore";
import { useVariableStore } from "@/stores/useVariableStore";
import { useResultStore } from "@/stores/useResultStore";

interface LoadingOverlayProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

function GlobalLoadingIndicator() {
    const dataIsLoading = useDataStore((state) => state.isLoading);
    const variablesIsLoading = useVariableStore((state) => state.isLoading);
    const logsLoading = useResultStore((state) => state.isLoading);

    const isLoading = dataIsLoading || variablesIsLoading || logsLoading;

    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="flex flex-col items-center gap-2 bg-white p-6 rounded-lg shadow-lg">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    <p className="text-sm text-muted-foreground">Loading application data...</p>
                </div>
            </div>
        );
    }

    return null;
}

export default function LoadingOverlay({ children, fallback }: LoadingOverlayProps) {
    return (
        <>
            <GlobalLoadingIndicator />
            <Suspense fallback={fallback || <div>Loading...</div>}>
                {children}
            </Suspense>
        </>
    );
}