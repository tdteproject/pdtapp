export interface User {
  id: string;
  phone: string;
  name?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  weight?: number; // kg
  height?: number; // cm
  createdAt: Date;
}

export interface HealthMetrics {
  steps: number;
  heartRate: number; // bpm
  hydration: number; // percentage 0-100
  caloriesBurned: number;
  timestamp: Date;
}

export interface AuthFormData {
  phone: string;
  otp: string;
}

export type Gender = 'male' | 'female' | 'other';
export type ScreenNames = 'Auth' | 'ProfileSetup' | 'Dashboard';

