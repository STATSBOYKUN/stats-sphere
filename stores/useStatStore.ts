// useStatStore.ts

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import db, { Log, Result, Statistic } from '@/lib/db';
import { devtools } from 'zustand/middleware';

// Define the shape of your store
interface StatifyState {
    logs: Log[];
    results: Result[];
    statistics: Statistic[];
    // Actions for Logs
    fetchLogs: () => Promise<void>;
    addLog: (log: Omit<Log, 'log_id' | 'timestamp'>) => Promise<void>;
    deleteLog: (log_id: number) => Promise<void>;
    // Actions for Results
    fetchResults: () => Promise<void>;
    addResult: (result: Omit<Result, 'result_id'>) => Promise<void>;
    deleteResult: (result_id: number) => Promise<void>;
    // Actions for Statistics
    fetchStatistics: () => Promise<void>;
    addStatistic: (stat: Omit<Statistic, 'stat_id'>) => Promise<void>;
    deleteStatistic: (stat_id: number) => Promise<void>;
    // Utility
    clearAll: () => Promise<void>;
}

const useStatifyStore = create<StatifyState>()(
    devtools(
        immer((set, get) => ({
            logs: [],
            results: [],
            statistics: [],

            // Fetch Logs
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

            // Add Log
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

            // Delete Log with Cascading Delete
            deleteLog: async (log_id: number) => {
                try {
                    // Find all results associated with this log
                    const resultsToDelete = await db.results.where('log_id').equals(log_id).toArray();
                    const resultIds = resultsToDelete.map(result => result.result_id);

                    if (resultIds.length > 0) {
                        // Delete related statistics
                        await db.statistics.where('result_id').anyOf(resultIds).delete();
                        // Delete related results
                        await db.results.where('log_id').equals(log_id).delete();
                    }

                    // Delete the log
                    await db.logs.delete(log_id);

                    // Update the store
                    set((state) => {
                        state.logs = state.logs.filter(log => log.log_id !== log_id);
                        state.results = state.results.filter(result => result.log_id !== log_id);
                        state.statistics = state.statistics.filter(stat => !resultIds.includes(stat.result_id));
                    });
                } catch (error) {
                    console.error('Failed to delete log:', error);
                }
            },

            // Fetch Results
            fetchResults: async () => {
                try {
                    const results = await db.results.toArray();
                    set((state) => {
                        state.results = results;
                    });
                } catch (error) {
                    console.error('Failed to fetch results:', error);
                }
            },

            // Add Result
            addResult: async (result) => {
                try {
                    const id = await db.results.add(result);
                    set((state) => {
                        state.results.push({ ...result, result_id: id });
                    });
                } catch (error) {
                    console.error('Failed to add result:', error);
                }
            },

            // Delete Result with Cascading Delete
            deleteResult: async (result_id: number) => {
                try {
                    // Find all sub-results
                    const subResults = await db.results.where('parent_id').equals(result_id).toArray();
                    const subResultIds = subResults.map(result => result.result_id);

                    if (subResultIds.length > 0) {
                        // Delete statistics of sub-results
                        await db.statistics.where('result_id').anyOf(subResultIds).delete();
                        // Delete sub-results
                        await db.results.where('parent_id').equals(result_id).delete();
                    }

                    // Delete statistics of the result
                    await db.statistics.where('result_id').equals(result_id).delete();
                    // Delete the result
                    await db.results.delete(result_id);

                    // Update the store
                    set((state) => {
                        state.results = state.results.filter(result => result.result_id !== result_id && !subResultIds.includes(result.result_id));
                        state.statistics = state.statistics.filter(stat => stat.result_id !== result_id && !subResultIds.includes(stat.result_id));
                    });
                } catch (error) {
                    console.error('Failed to delete result:', error);
                }
            },

            // Fetch Statistics
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

            // Add Statistic
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

            // Delete Statistic
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

            // Clear All Data (Optional Utility)
            clearAll: async () => {
                try {
                    await db.logs.clear();
                    await db.results.clear();
                    await db.statistics.clear();
                    set((state) => {
                        state.logs = [];
                        state.results = [];
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
