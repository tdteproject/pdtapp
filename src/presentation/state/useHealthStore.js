import { create } from 'zustand';
const DEFAULT_GOALS = {
    steps: 10000,
    caloriesBurned: 500,
    workoutMinutes: 45,
    hydration: 2500,
};
// Stable initial metrics (not random on mount)
const INITIAL_METRICS = {
    steps: 7243,
    heartRate: 72,
    hydration: 1800,
    caloriesBurned: 312,
    timestamp: new Date(),
};
export const useHealthStore = create((set) => ({
    metrics: INITIAL_METRICS,
    goals: DEFAULT_GOALS,
    workoutMinutes: 28,
    refreshMetrics: async () => {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 800));
        set({
            metrics: {
                steps: Math.floor(Math.random() * 3000) + 6000,
                heartRate: Math.floor(Math.random() * 20) + 62,
                hydration: Math.floor(Math.random() * 1000) + 1500,
                caloriesBurned: Math.floor(Math.random() * 200) + 250,
                timestamp: new Date(),
            },
        });
    },
}));
