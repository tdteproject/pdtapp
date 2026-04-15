import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sensorService } from '@/services/sensorService';
import { healthService } from '@/services/healthService';
import { dataProcessor } from '@/services/dataProcessor';

const DEFAULT_GOALS = {
    steps: 10000,
    caloriesBurned: 500,
    workoutMinutes: 45,
    hydration: 2500,
};

const INITIAL_METRICS = {
    steps: 0,
    heartRate: 72,
    hydration: 0,
    caloriesBurned: 0,
    activeTimeMinutes: 0,
    timestamp: new Date().toISOString(),
};

export const useHealthStore = create(
    persist(
        (set, get) => ({
            metrics: INITIAL_METRICS,
            rawStepsHistory: [], // Raw tracking array for bucketing
            goals: DEFAULT_GOALS,
            workoutMinutes: 0,

            // Initialize background/simulated hardware tracking
            initTracking: async () => {
                await sensorService.init();
                
                // 1. Sync any steps that happened while the app was closed (Real HW only)
                const historicalStepsAtLaunch = await sensorService.getStepsForToday();
                if (historicalStepsAtLaunch > 0) {
                    const currentSteps = get().metrics.steps;
                    const deltaMissing = historicalStepsAtLaunch - currentSteps;
                    if (deltaMissing > 0) {
                        get().processStepDelta(deltaMissing);
                    }
                }

                // 2. Start the live step listener
                sensorService.startTracking(get().metrics.steps, (stepDelta) => {
                    get().processStepDelta(stepDelta);
                });
            },

            // Stop tracking when app backgrounds or unmounts
            stopTracking: () => {
                sensorService.stopTracking();
            },

            // Process an incoming step delta from the pedometer
            processStepDelta: (stepDelta) => {
                const state = get();
                const newSteps = state.metrics.steps + stepDelta;
                const newCals = healthService.calculateActiveCalories(newSteps);
                
                // Active time estimation (rough: 100 steps = ~1 min active time)
                const newActiveTime = Math.floor(newSteps / 100);

                const newHistory = dataProcessor.appendLiveStep(state.rawStepsHistory, stepDelta);

                set((state) => ({
                    metrics: {
                        ...state.metrics,
                        steps: newSteps,
                        caloriesBurned: newCals,
                        activeTimeMinutes: newActiveTime,
                        timestamp: new Date().toISOString()
                    },
                    workoutMinutes: newActiveTime,
                    rawStepsHistory: newHistory
                }));
            },

            // Water feature: Manual input
            addWater: (amountMl) => {
                set((state) => ({
                    metrics: {
                        ...state.metrics,
                        hydration: state.metrics.hydration + amountMl,
                        timestamp: new Date().toISOString()
                    }
                }));
            },

            // Legacy support for dashboard initial load
            refreshMetrics: async () => {
                // If tracking hasn't started, start it
                get().initTracking();
            },
            
            // Testing utility to clear local storage
            resetStore: () => {
                set({ 
                    metrics: INITIAL_METRICS, 
                    rawStepsHistory: [], 
                    workoutMinutes: 0 
                });
            }
        }),
        {
            name: 'health-storage',
            storage: createJSONStorage(() => AsyncStorage),
            // Only persist metrics and history, not goals or active tracking instances
            partialize: (state) => ({ 
                metrics: state.metrics,
                rawStepsHistory: state.rawStepsHistory,
                workoutMinutes: state.workoutMinutes
            }),
        }
    )
);
