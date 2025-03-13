"use client";

import { useEffect } from "react";
import { useDataStore } from "@/stores/useDataStore";
import { useResultStore } from "@/stores/useResultStore";
import { useVariableStore } from "@/stores/useVariableStore";

// This component remains at the application level to ensure all data is loaded
export default function DataLoader() {
    const loadData = useDataStore((state) => state.loadData);
    const loadVariables = useVariableStore((state) => state.loadVariables);
    const fetchLogs = useResultStore((state) => state.fetchLogs);

    useEffect(() => {
        // Load all required data in parallel
        const loadAllData = async () => {
            try {
                await Promise.all([
                    loadData(),
                    loadVariables(),
                    fetchLogs()
                ]);
            } catch (error) {
                console.error("Failed to load application data:", error);
            }
        };

        loadAllData();
    }, [loadData, loadVariables, fetchLogs]);

    return null;
}