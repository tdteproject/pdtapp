import { create } from 'zustand';
import { validateProfile } from '@/core/utils/validators';
export const useUserStore = create((set, get) => ({
    user: null,
    isProfileComplete: false,
    updateProfile: (data) => {
        const validation = validateProfile(data);
        if (validation !== true)
            return validation;
        set({ user: { ...get().user, ...data } });
        return true;
    },
    saveProfile: async () => {
        const { user } = get();
        if (!user)
            return;
        // mock save
        set({ isProfileComplete: true });
    },
    clearProfile: () => set({ user: null, isProfileComplete: false }),
}));
