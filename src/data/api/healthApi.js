// Mock health API
export const fetchMetrics = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
        steps: Math.floor(Math.random() * 10000),
        heartRate: Math.floor(Math.random() * 30) + 70,
        hydration: Math.floor(Math.random() * 50) + 30,
        caloriesBurned: Math.floor(Math.random() * 500) + 200,
    };
};
