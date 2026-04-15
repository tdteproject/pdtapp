import { parseISO, format, getHours, startOfDay, addHours, isSameDay } from 'date-fns';

export const dataProcessor = {
    /**
     * Aggregates raw step events into fixed 4-hour time buckets for a given day.
     * Buckets: 0-4, 4-8, 8-12, 12-16, 16-20, 20-24
     * @param {Array<{timestamp: string, steps: number}>} rawSteps - Historical raw step events
     * @param {Date} targetDate - The day to aggregate for
     * @returns {Array<{label: string, value: number}>} - Array of length 6 with bucketed step counts
     */
    aggregateStepsTo4HourBuckets: (rawSteps, targetDate = new Date()) => {
        const buckets = [
            { label: '4am', value: 0 },
            { label: '8am', value: 0 },
            { label: '12pm', value: 0 },
            { label: '4pm', value: 0 },
            { label: '8pm', value: 0 },
            { label: '12am', value: 0 },
            { label: '4am(+1)', value: 0 } // For continuous graph rendering
        ];
        
        // Remove the extra layout padding bucket for processing
        const processBuckets = [0, 0, 0, 0, 0, 0];

        rawSteps.forEach(entry => {
            const entryDate = entry.timestamp instanceof Date ? entry.timestamp : parseISO(entry.timestamp);
            if (isSameDay(entryDate, targetDate)) {
                const hour = getHours(entryDate);
                const bucketIndex = Math.floor(hour / 4);
                if (bucketIndex >= 0 && bucketIndex < 6) {
                    processBuckets[bucketIndex] += entry.steps;
                }
            }
        });

        // Map back to labels
        for(let i=0; i<6; i++) {
            buckets[i].value = processBuckets[i];
        }

        return buckets.slice(0, 6);
    },

    /**
     * Helper to add a live step delta to the raw historical array
     */
    appendLiveStep: (rawSteps, stepDelta) => {
        const now = new Date();
        return [...rawSteps, { timestamp: now.toISOString(), steps: stepDelta }];
    }
};
