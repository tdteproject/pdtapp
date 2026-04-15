import { Pedometer } from 'expo-sensors';
import { Platform } from 'react-native';

class SensorService {
    constructor() {
        this.subscription = null;
        this.isAvailable = false;
        this.stepCount = 0;
        
        // Simulation props
        this.simInterval = null;
    }

    async init() {
        if (Platform.OS === 'web') {
            this.isAvailable = false;
            return false;
        }
        
        try {
            // Check availability and request permissions for hardware sensors
            const { status } = await Pedometer.requestPermissionsAsync();
            this.isAvailable = (status === 'granted') && await Pedometer.isAvailableAsync();
            
            console.log(`[SensorService] Pedometer Available: ${this.isAvailable}, Status: ${status}`);
            return this.isAvailable;
        } catch (error) {
            console.error('[SensorService] Pedometer initialization failed:', error);
            this.isAvailable = false;
            return false;
        }
    }

    /**
     * Fetch historical steps for the current day.
     * This ensures the app is synced with the phone's actual storage even if closed for hours.
     */
    async getStepsForToday() {
        if (!this.isAvailable) return 0;
        
        try {
            const start = new Date();
            start.setHours(0,0,0,0);
            const end = new Date();
            
            const result = await Pedometer.getStepCountAsync(start, end);
            return result.steps || 0;
        } catch (error) {
            console.error('[SensorService] Failed to fetch history:', error);
            return 0;
        }
    }

    /**
     * Start live tracking. Uses real pedometer if available, otherwise runs a realistic simulation.
     * @param {function} onStepUpdate - Callback with current step count delta
     */
    startTracking(currentStepState, onStepUpdate) {
        if (this.subscription || this.simInterval) {
            this.stopTracking();
        }

        if (this.isAvailable) {
            console.log('[SensorService] Starting HW Pedometer tracking');
            this.subscription = Pedometer.watchStepCount(result => {
                // Pedometer returns steps taken since watchStepCount was called
                // We pass the delta so the store can aggregate it into today's bucket
                onStepUpdate(result.steps);
            });
        } else {
            console.log('[SensorService] Starting simulation fallback tracking');
            // Simulate 1-3 steps every 2 seconds if the user is "active"
            this.simInterval = setInterval(() => {
                const isWalking = Math.random() > 0.3; // 70% chance of walking
                if (isWalking) {
                    const stepsTaken = Math.floor(Math.random() * 3) + 1;
                    onStepUpdate(stepsTaken);
                }
            }, 2000);
        }
    }

    stopTracking() {
        if (this.subscription) {
            this.subscription.remove();
            this.subscription = null;
        }
        if (this.simInterval) {
            clearInterval(this.simInterval);
            this.simInterval = null;
        }
    }
}

export const sensorService = new SensorService();
