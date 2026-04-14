/**
 * Validates a mobile number.
 * Simplified to allow any 10 digits for broader compatibility during testing.
 */
export const validatePhone = (phone) => {
    const cleaned = phone.replace(/\D/g, ''); // Keep only digits
    if (!cleaned)
        return 'Phone number is required';
    if (cleaned.length !== 10)
        return 'Enter a valid 10-digit mobile number';
    return true;
};
export const validateOTP = (otp) => {
    if (!otp || otp.length !== 6)
        return 'OTP must be 6 digits';
    if (!/^\d{6}$/.test(otp))
        return 'OTP must contain only digits';
    return true;
};
export const validateAuthForm = (data) => {
    const phoneErr = validatePhone(data.phone);
    if (phoneErr !== true)
        return phoneErr;
    const otpErr = validateOTP(data.otp);
    if (otpErr !== true)
        return otpErr;
    return true;
};
export const validateProfile = (user) => {
    if (!user.name || user.name.trim().length < 2)
        return 'Name is required (min 2 characters)';
    if (!user.age || user.age < 13 || user.age > 120)
        return 'Age must be between 13 and 120';
    if (!user.gender)
        return 'Please select your gender';
    if (!user.weight || user.weight <= 0 || user.weight > 500)
        return 'Please enter a valid weight';
    if (!user.height || user.height <= 0 || user.height > 300)
        return 'Please enter a valid height';
    return true;
};
