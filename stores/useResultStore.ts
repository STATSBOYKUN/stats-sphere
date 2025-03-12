import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { devtools } from "zustand/middleware";
import db from "@/lib/db";
import { Log } from '@/types/Log';
import { Analytic } from '@/types/Analytic';
import { Statistic } from '@/types/Statistic';

export interface ResultState {
    logs: Log[];

    fetchLogs: () => Promise<void>;
    getLogById: (id: number) => Promise<Log | undefined>;

    addLog: (log: Omit<Log, "id" | "analytics">) => Promise<number>;
    updateLog: (id: number, logData: Partial<Omit<Log, "id" | "analytics">>) => Promise<void>;
    deleteLog: (logId: number) => Promise<void>;

    addAnalytic: (logId: number, analytic: Omit<Analytic, "id" | "log_id" | "statistics">) => Promise<number>;
    updateAnalytic: (analyticId: number, analyticData: Partial<Omit<Analytic, "id" | "log_id" | "statistics">>) => Promise<void>;
    deleteAnalytic: (analyticId: number) => Promise<void>;

    addStatistic: (analyticId: number, statistic: Omit<Statistic, "id" | "analytic_id">) => Promise<number>;
    updateStatistic: (statisticId: number, statisticData: Partial<Omit<Statistic, "id" | "analytic_id">>) => Promise<void>;
    deleteStatistic: (statisticId: number) => Promise<void>;

    clearAll: () => Promise<void>;
}

export const useResultStore = create<ResultState>()(
    devtools(
        immer((set) => ({
            logs: [],

            fetchLogs: async () => {
                try {
                    const logs = await db.getAllLogsWithRelations();
                    set((state) => {
                        state.logs = logs;
                    });
                } catch (error) {
                    console.error("Failed to fetch logs:", error);
                }
            },

            getLogById: async (id: number) => {
                try {
                    return await db.getLogWithRelations(id);
                } catch (error) {
                    console.error("Failed to fetch log by id:", error);
                    return undefined;
                }
            },

            addLog: async (log) => {
                try {
                    const id = await db.logs.add(log);
                    set((state) => {
                        state.logs.push({ ...log, id, analytics: [] });
                    });
                    return id;
                } catch (error) {
                    console.error("Failed to add log:", error);
                    throw error;
                }
            },

            updateLog: async (id, logData) => {
                try {
                    await db.logs.update(id, logData);
                    set((state) => {
                        const logIndex = state.logs.findIndex(log => log.id === id);
                        if (logIndex >= 0) {
                            Object.assign(state.logs[logIndex], logData);
                        }
                    });
                } catch (error) {
                    console.error("Failed to update log:", error);
                    throw error;
                }
            },

            deleteLog: async (logId) => {
                try {
                    const analytics = await db.analytics.where('log_id').equals(logId).toArray();
                    const analyticIds = analytics.map(a => a.id!).filter(id => id !== undefined);

                    if (analyticIds.length > 0) {
                        await Promise.all(
                            analyticIds.map(id =>
                                db.statistics.where('analytic_id').equals(id).delete()
                            )
                        );
                    }

                    await db.analytics.where('log_id').equals(logId).delete();
                    await db.logs.delete(logId);

                    set((state) => {
                        state.logs = state.logs.filter(log => log.id !== logId);
                    });
                } catch (error) {
                    console.error("Failed to delete log:", error);
                    throw error;
                }
            },

            addAnalytic: async (logId, analyticData) => {
                try {
                    const analytic: Omit<Analytic, "id"> = {
                        ...analyticData,
                        log_id: logId,
                    };

                    const analyticId = await db.analytics.add(analytic);

                    set((state) => {
                        const logIndex = state.logs.findIndex(log => log.id === logId);
                        if (logIndex >= 0) {
                            const analyticWithId = { ...analytic, id: analyticId, statistics: [] };
                            if (!state.logs[logIndex].analytics) {
                                state.logs[logIndex].analytics = [];
                            }
                            state.logs[logIndex].analytics!.push(analyticWithId);
                        }
                    });

                    return analyticId;
                } catch (error) {
                    console.error("Failed to add analytic:", error);
                    throw error;
                }
            },

            updateAnalytic: async (analyticId, analyticData) => {
                try {
                    await db.analytics.update(analyticId, analyticData);

                    set((state) => {
                        for (const log of state.logs) {
                            if (!log.analytics) continue;

                            const analyticIndex = log.analytics.findIndex(a => a.id === analyticId);
                            if (analyticIndex >= 0) {
                                Object.assign(log.analytics[analyticIndex], analyticData);
                                break;
                            }
                        }
                    });
                } catch (error) {
                    console.error("Failed to update analytic:", error);
                    throw error;
                }
            },

            deleteAnalytic: async (analyticId) => {
                try {
                    await db.statistics.where('analytic_id').equals(analyticId).delete();
                    await db.analytics.delete(analyticId);

                    set((state) => {
                        for (const log of state.logs) {
                            if (!log.analytics) continue;

                            const analyticIndex = log.analytics.findIndex(a => a.id === analyticId);
                            if (analyticIndex >= 0) {
                                log.analytics.splice(analyticIndex, 1);
                                break;
                            }
                        }
                    });
                } catch (error) {
                    console.error("Failed to delete analytic:", error);
                    throw error;
                }
            },

            addStatistic: async (analyticId, statisticData) => {
                try {
                    const statistic: Omit<Statistic, "id"> = {
                        ...statisticData,
                        analytic_id: analyticId
                    };

                    const statisticId = await db.statistics.add(statistic);
                    const statisticWithId = { ...statistic, id: statisticId };

                    set((state) => {
                        outerLoop: for (const log of state.logs) {
                            if (!log.analytics) continue;

                            for (const analytic of log.analytics) {
                                if (analytic.id === analyticId) {
                                    if (!analytic.statistics) {
                                        analytic.statistics = [];
                                    }
                                    analytic.statistics.push(statisticWithId);
                                    break outerLoop;
                                }
                            }
                        }
                    });

                    return statisticId;
                } catch (error) {
                    console.error("Failed to add statistic:", error);
                    throw error;
                }
            },

            updateStatistic: async (statisticId, statisticData) => {
                try {
                    await db.statistics.update(statisticId, statisticData);

                    set((state) => {
                        outerLoop: for (const log of state.logs) {
                            if (!log.analytics) continue;

                            for (const analytic of log.analytics) {
                                if (!analytic.statistics) continue;

                                const statisticIndex = analytic.statistics.findIndex(s => s.id === statisticId);
                                if (statisticIndex >= 0) {
                                    Object.assign(analytic.statistics[statisticIndex], statisticData);
                                    break outerLoop;
                                }
                            }
                        }
                    });
                } catch (error) {
                    console.error("Failed to update statistic:", error);
                    throw error;
                }
            },

            deleteStatistic: async (statisticId) => {
                try {
                    await db.statistics.delete(statisticId);

                    set((state) => {
                        outerLoop: for (const log of state.logs) {
                            if (!log.analytics) continue;

                            for (const analytic of log.analytics) {
                                if (!analytic.statistics) continue;

                                const statisticIndex = analytic.statistics.findIndex(s => s.id === statisticId);
                                if (statisticIndex >= 0) {
                                    analytic.statistics.splice(statisticIndex, 1);
                                    break outerLoop;
                                }
                            }
                        }
                    });
                } catch (error) {
                    console.error("Failed to delete statistic:", error);
                    throw error;
                }
            },

            clearAll: async () => {
                try {
                    await Promise.all([
                        db.statistics.clear(),
                        db.analytics.clear(),
                        db.logs.clear()
                    ]);

                    set((state) => {
                        state.logs = [];
                    });
                } catch (error) {
                    console.error("Failed to clear all data:", error);
                    throw error;
                }
            }
        })),
        { name: "StatifyStore" }
    )
);