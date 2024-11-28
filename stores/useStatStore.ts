// useStatStore.ts

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import db, { Log, Analytic, Statistic } from '@/lib/db';
import { devtools } from 'zustand/middleware';

interface StatifyState {
    logs: Log[];
    analytics: Analytic[];
    statistics: Statistic[];

    fetchLogs: () => Promise<void>;
    addLog: (log: Omit<Log, 'log_id' | 'timestamp'>) => Promise<void>;
    deleteLog: (log_id: number) => Promise<void>;

    fetchAnalytics: () => Promise<void>;
    addAnalytic: (analytic: Omit<Analytic, 'analytic_id'>) => Promise<void>;
    deleteAnalytic: (analytic_id: number) => Promise<void>;

    fetchStatistics: () => Promise<void>;
    addStatistic: (stat: Omit<Statistic, 'stat_id'>) => Promise<void>;
    deleteStatistic: (stat_id: number) => Promise<void>;

    clearAll: () => Promise<void>;
}

const useStatifyStore = create<StatifyState>()(
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
                    console.error('Failed to fetch logs:', error);
                }
            },

            addLog: async (log) => {
                try {
                    const logWithTimestamp = { ...log, timestamp: new Date() };
                    const id = await db.logs.add(logWithTimestamp);
                    set((state) => {
                        state.logs.push({ ...logWithTimestamp, log_id: id });
                    });
                } catch (error) {
                    console.error('Failed to add log:', error);
                }
            },

            deleteLog: async (log_id: number) => {
                try {
                    const analyticsToDelete = await db.analytics.where('log_id').equals(log_id).toArray();
                    const analyticIds = analyticsToDelete.map(analytic => analytic.analytic_id);

                    if (analyticIds.length > 0) {
                        await db.statistics.where('analytic_id').anyOf(analyticIds).delete();
                        await db.analytics.where('log_id').equals(log_id).delete();
                    }

                    await db.logs.delete(log_id);

                    set((state) => {
                        state.logs = state.logs.filter(log => log.log_id !== log_id);
                        state.analytics = state.analytics.filter(analytic => analytic.log_id !== log_id);
                        state.statistics = state.statistics.filter(stat => !analyticIds.includes(stat.analytic_id));
                    });
                } catch (error) {
                    console.error('Failed to delete log:', error);
                }
            },

            fetchAnalytics: async () => {
                try {
                    const analytics = await db.analytics.toArray();
                    set((state) => {
                        state.analytics = analytics;
                    });
                } catch (error) {
                    console.error('Failed to fetch analytics:', error);
                }
            },

            addAnalytic: async (analytic) => {
                try {
                    const id = await db.analytics.add(analytic);
                    set((state) => {
                        state.analytics.push({ ...analytic, analytic_id: id });
                    });
                } catch (error) {
                    console.error('Failed to add analytic:', error);
                }
            },

            deleteAnalytic: async (analytic_id: number) => {
                try {
                    const subAnalytics = await db.analytics.where('parent_id').equals(analytic_id).toArray();
                    const subAnalyticIds = subAnalytics.map(analytic => analytic.analytic_id);

                    if (subAnalyticIds.length > 0) {
                        await db.statistics.where('analytic_id').anyOf(subAnalyticIds).delete();
                        await db.analytics.where('parent_id').equals(analytic_id).delete();
                    }

                    await db.statistics.where('analytic_id').equals(analytic_id).delete();
                    await db.analytics.delete(analytic_id);

                    set((state) => {
                        state.analytics = state.analytics.filter(analytic => analytic.analytic_id !== analytic_id && !subAnalyticIds.includes(analytic.analytic_id));
                        state.statistics = state.statistics.filter(stat => stat.analytic_id !== analytic_id && !subAnalyticIds.includes(stat.analytic_id));
                    });
                } catch (error) {
                    console.error('Failed to delete analytic:', error);
                }
            },

            fetchStatistics: async () => {
                try {
                    const statistics = await db.statistics.toArray();
                    set((state) => {
                        state.statistics = statistics;
                    });
                } catch (error) {
                    console.error('Failed to fetch statistics:', error);
                }
            },

            addStatistic: async (stat) => {
                try {
                    const id = await db.statistics.add(stat);
                    set((state) => {
                        state.statistics.push({ ...stat, stat_id: id });
                    });
                } catch (error) {
                    console.error('Failed to add statistic:', error);
                }
            },

            deleteStatistic: async (stat_id: number) => {
                try {
                    await db.statistics.delete(stat_id);
                    set((state) => {
                        state.statistics = state.statistics.filter(stat => stat.stat_id !== stat_id);
                    });
                } catch (error) {
                    console.error('Failed to delete statistic:', error);
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
                    console.error('Failed to clear all data:', error);
                }
            },
        })),
        { name: 'StatifyStore' }
    )
);

export default useStatifyStore;
