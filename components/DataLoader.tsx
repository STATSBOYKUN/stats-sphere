"use client";

import { useEffect } from "react";
import { useDataStore } from "@/stores/useDataStore";
import {useResultStore} from "@/stores/useResultStore";
import {useVariableStore} from "@/stores/useVariableStore";

export default function DataLoader() {
    const loadData = useDataStore((state) => state.loadData);
    const loadVariables = useVariableStore((state) => state.loadVariables);
    const fetchLogs = useResultStore((state) => state.fetchLogs);
    const fetchAnalytics = useResultStore((state) => state.fetchAnalytics);
    const fetchStatistics = useResultStore((state) => state.fetchStatistics);

    useEffect(() => {
        loadData();
        loadVariables();
        fetchLogs();
        fetchAnalytics();
        fetchStatistics();
    }, [loadData, loadVariables, fetchLogs, fetchAnalytics, fetchStatistics]);

    return null;
}
