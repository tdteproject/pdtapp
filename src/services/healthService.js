export const healthService = {
    /**
     * Calculate derived distance (meters) based on steps and user height.
     * @param {number} steps - Number of steps taken
     * @param {number} heightCm - User height in cm. Default 170.
     * @returns {number} Distance in kilometers
     */
    calculateDistance: (steps, heightCm = 170) => {
        // Average stride length is roughly 41.5% of height
        const strideLengthMeters = (heightCm * 0.415) / 100;
        const totalDistanceMeters = steps * strideLengthMeters;
        return (totalDistanceMeters / 1000).toFixed(2); // return KM
    },

    /**
     * Calculate active calories burned from step count.
     * Basic approximation finding active calories over BMR.
     * @param {number} steps
     * @param {number} weightKg
     * @returns {number} Calories burned
     */
    calculateActiveCalories: (steps, weightKg = 70) => {
        // Roughly ~0.04 calories per step per kg
        const calsPerStep = 0.04 * (weightKg / 70); 
        return Math.round(steps * calsPerStep);
    },

    /**
     * Optional: Complex BMR (Basal Metabolic Rate) calculation using Mifflin-St Jeor Equation
     */
    calculateBMR: (weightKg = 70, heightCm = 170, age = 25, gender = 'male') => {
        let bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age);
        bmr += (gender === 'male' ? 5 : -161);
        return Math.round(bmr);
    }
};
