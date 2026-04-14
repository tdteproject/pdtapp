// Mock profile API
export const saveProfile = async (user) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    return user;
};
