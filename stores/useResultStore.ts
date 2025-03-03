import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { devtools } from "zustand/middleware";
import db, { Log, Analytic, Statistic } from "@/lib/db";

export interface ResultState {
    logs: Log[];
    analytics: Analytic[];
    statistics: Statistic[];

    fetchLogs: () => Promise<void>;
    getLogById: (id: number) => Promise<Log | undefined>;
    addLog: (log: Omit<Log, "id">) => Promise<number>;
    deleteLog: (log_id: number) => Promise<void>;

    fetchAnalytics: () => Promise<void>;
    getAnalyticById: (id: number) => Promise<Analytic | undefined>;
    addAnalytic: (analytic: Omit<Analytic, "id">) => Promise<number>;
    deleteAnalytic: (analytic_id: number) => Promise<void>;

    fetchStatistics: () => Promise<void>;
    getStatisticById: (id: number) => Promise<Statistic | undefined>;
    addStatistic: (stat: Omit<Statistic, "id">) => Promise<number>;
    deleteStatistic: (stat_id: number) => Promise<void>;

    clearAll: () => Promise<void>;
}

export const useResultStore = create<ResultState>()(
    devtools(
        immer((set) => ({
            logs: [] as Log[],
            analytics: [] as Analytic[],
            statistics: [] as Statistic[],

            fetchLogs: async () => {
                try {
                    const logs = await db.logs.toArray();
                    set((state) => {
                        state.logs = logs;
                    });
                } catch (error) {
                    console.error("Failed to fetch logs:", error);
                }
            },

            getLogById: async (id: number) => {
                try {
                    const log = await db.logs.get(id);
                    return log;
                } catch (error) {
                    console.error("Failed to fetch log by id:", error);
                    return undefined;
                }
            },

            addLog: async (log) => {
                try {
                    const id = await db.logs.add(log);
                    set((state) => {
                        state.logs.push({ ...log, id });
                    });
                    return id;
                } catch (error) {
                    console.error("Failed to add log:", error);
                    throw error;
                }
            },

            deleteLog: async (log_id: number) => {
                try {
                    await db.logs.delete(log_id);
                    set((state) => {
                        state.logs = state.logs.filter((log) => log.id !== log_id);
                    });
                } catch (error) {
                    console.error("Failed to delete log:", error);
                }
            },

            fetchAnalytics: async () => {
                try {
                    const analytics = await db.analytics.toArray();
                    set((state) => {
                        state.analytics = analytics;
                    });
                } catch (error) {
                    console.error("Failed to fetch analytics:", error);
                }
            },

            getAnalyticById: async (id: number) => {
                try {
                    const analytic = await db.analytics.get(id);
                    return analytic;
                } catch (error) {
                    console.error("Failed to fetch analytic by id:", error);
                    return undefined;
                }
            },

            addAnalytic: async (analytic) => {
                try {
                    const id = await db.analytics.add(analytic);
                    set((state) => {
                        state.analytics.push({ ...analytic, id });
                    });
                    return id;
                } catch (error) {
                    console.error("Failed to add analytic:", error);
                    throw error;
                }
            },

            deleteAnalytic: async (analytic_id: number) => {
                try {
                    await db.analytics.delete(analytic_id);
                    set((state) => {
                        state.analytics = state.analytics.filter(
                            (analytic) => analytic.id !== analytic_id
                        );
                    });
                } catch (error) {
                    console.error("Failed to delete analytic:", error);
                }
            },

            fetchStatistics: async () => {
                try {
                    const statistics = await db.statistics.toArray();
                    set((state) => {
                        state.statistics = statistics;
                    });
                } catch (error) {
                    console.error("Failed to fetch statistics:", error);
                }
            },

            getStatisticById: async (id: number) => {
                try {
                    const statistic = await db.statistics.get(id);
                    return statistic;
                } catch (error) {
                    console.error("Failed to fetch statistic by id:", error);
                    return undefined;
                }
            },

            addStatistic: async (stat) => {
                try {
                    const id = await db.statistics.add(stat);
                    set((state) => {
                        state.statistics.push({ ...stat, id });
                    });
                    return id;
                } catch (error) {
                    console.error("Failed to add statistic:", error);
                    throw error;
                }
            },

            deleteStatistic: async (stat_id: number) => {
                try {
                    await db.statistics.delete(stat_id);
                    set((state) => {
                        state.statistics = state.statistics.filter(
                            (stat) => stat.id !== stat_id
                        );
                    });
                } catch (error) {
                    console.error("Failed to delete statistic:", error);
                }
            },

            clearAll: async () => {
                try {
                    await db.logs.clear();
                    await db.analytics.clear();
                    await db.statistics.clear();
                    set((state) => {
                        state.logs = [];
                        state.analytics = [];
                        state.statistics = [];
                    });
                } catch (error) {
                    console.error("Failed to clear all data:", error);
                }
            },
        })),
        { name: "StatifyStore" }
    )
);
