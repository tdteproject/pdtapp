import { create } from 'zustand';
import { User } from '@/core/types';
import { validateProfile } from '@/core/utils/validators';

interface UserState {
  user: Partial<User> | null;
  isProfileComplete: boolean;
  updateProfile: (data: Partial<User>) => string | true;
  saveProfile: () => Promise<void>;
  clearProfile: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  isProfileComplete: false,
  updateProfile: (data) => {
    const validation = validateProfile(data);
    if (validation !== true) return validation;
    set({ user: { ...get().user, ...data } });
    return true;
  },
  saveProfile: async () => {
    const { user } = get();
    if (!user) return;
    // mock save
    set({ isProfileComplete: true });
  },
  clearProfile: () => set({ user: null, isProfileComplete: false }),
}));

