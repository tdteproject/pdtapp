import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useUserStore } from '@/presentation/state/useUserStore';
import { useAuthStore } from '@/presentation/state/useAuthStore';
import SafeAreaWrapper from '@/presentation/common/layout/SafeAreaWrapper';
import { colors } from '@/presentation/themes/colors';
import { fontFamily, fontSize, fontWeight, letterSpacing } from '@/presentation/themes/typography';
import { LinearGradient } from 'expo-linear-gradient';

const SETTINGS = [
    { icon: 'notifications-none', label: 'Notifications', value: 'On', valueColor: colors.notification.on, iconColor: '#0d9488', group: 'preferences' },
    { icon: 'straighten', label: 'Units', value: 'Metric (kg, cm)', iconColor: '#0d9488', group: 'preferences' },
    { icon: 'language', label: 'Language', value: 'English', iconColor: '#0d9488', group: 'preferences' },
    { icon: 'privacy-tip', label: 'Privacy Policy', value: null, iconColor: '#0d9488', group: 'legal' },
    { icon: 'description', label: 'Terms of Service', value: null, iconColor: '#0d9488', group: 'legal' },
    { icon: 'info-outline', label: 'App Version', value: '1.0.0', noChevron: true, iconColor: '#0d9488', group: 'legal' },
];

const getBmiStatus = (bmi) => {
    if (!bmi) return { label: '—', color: colors.text.muted };
    const val = parseFloat(bmi);
    if (val < 18.5) return { label: 'Underweight', color: '#FF9800' };
    if (val < 25) return { label: 'Healthy', color: colors.success };
    if (val < 30) return { label: 'Overweight', color: '#FF9800' };
    return { label: 'Obese', color: colors.error };
};

export default function MeScreen() {
    const { user } = useUserStore();
    const { logout, userPhone } = useAuthStore();
    const navigation = useNavigation();

    const handleLogout = () => {
        Alert.alert('Log Out', 'Are you sure you want to log out?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Log Out', style: 'destructive', onPress: () => logout() },
        ]);
    };

    const handleEditProfile = () => {
        navigation.navigate('EditProfile');
    };

    const firstName = user?.name?.split(' ')[0] || 'Athlete';
    const bmi = user?.weight && user?.height
        ? (user.weight / Math.pow(user.height / 100, 2)).toFixed(1)
        : null;
    const bmiStatus = getBmiStatus(bmi);

    return (
    <SafeAreaWrapper>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} style={{ backgroundColor: '#FFFFFF' }}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        {/* Profile Card */}
        <LinearGradient
            colors={['#e0f2fe', '#ccfbf1']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.profileCard}
        >
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{firstName.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name || 'Setup your profile'}</Text>
            <Text style={styles.profilePhone}>{userPhone || 'No phone'}</Text>
            {user?.gender && (
              <Text style={styles.profileMeta}>
                {user.gender.charAt(0).toUpperCase() + user.gender.slice(1)} · {user?.age} yrs
              </Text>
            )}
          </View>
          <Pressable
            style={({ pressed }) => [styles.editBtn, pressed && { transform: [{ scale: 0.9 }] }]}
            onPress={handleEditProfile}
          >
            <MaterialIcons name="edit" size={16} color={colors.primary.main}/>
          </Pressable>
        </LinearGradient>

        {/* Stats Row */}
        {user?.weight && user?.height && (
          <View style={styles.statsRow}>
            {[
              { label: 'Weight', value: `${user.weight}`, unit: 'kg', icon: 'fitness-center', color: colors.health.weight },
              { label: 'Height', value: `${user.height}`, unit: 'cm', icon: 'straighten', color: colors.health.sleep },
              { label: 'BMI', value: bmi || '—', unit: '', icon: 'monitor-weight', color: colors.health.heartRate, status: bmiStatus },
            ].map((stat) => (
              <View key={stat.label} style={styles.statCard}>
                <MaterialIcons name={stat.icon} size={20} color={stat.color} style={{ marginBottom: 6 }}/>
                <Text style={styles.statValue}>{stat.value}</Text>
                {stat.unit ? <Text style={styles.statUnit}>{stat.unit}</Text> : null}
                <Text style={styles.statLabel}>{stat.label}</Text>
                {stat.status && (
                  <View style={[styles.bmiPill, { backgroundColor: stat.status.color }]}>
                    <Text style={[styles.bmiPillText, { color: '#FFFFFF' }]}>{stat.status.label}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Settings Groups */}
        {['preferences', 'legal'].map((group) => (
          <View key={group} style={styles.section}>
            <Text style={styles.groupTitle}>
              {group === 'preferences' ? 'PREFERENCES' : 'ABOUT'}
            </Text>
            <View style={styles.settingsCard}>
              {SETTINGS.filter((s) => s.group === group).map((s, idx, arr) => (
                <Pressable
                  key={s.label}
                  style={({ pressed }) => [
                    styles.settingRow,
                    idx < arr.length - 1 && styles.settingBorder,
                    pressed && { backgroundColor: colors.tapState },
                  ]}
                >
                  <View style={styles.settingLeft}>
                    <View style={[styles.settingIconBg, { backgroundColor: `${s.iconColor}15` }]}>
                      <MaterialIcons name={s.icon} size={18} color={s.iconColor}/>
                    </View>
                    <Text style={styles.settingLabel}>{s.label}</Text>
                  </View>
                  <View style={styles.settingRight}>
                    {s.value && (
                      <Text style={[styles.settingValue, s.valueColor && { color: s.valueColor }]}>
                        {s.value}
                      </Text>
                    )}
                    {!s.noChevron && (
                      <MaterialIcons name="chevron-right" size={16} color={colors.text.muted}/>
                    )}
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        ))}

        {/* Logout */}
        <View style={styles.section}>
          <Pressable
            style={({ pressed }) => [styles.logoutBtn, pressed && { transform: [{ scale: 0.98 }] }]}
            onPress={handleLogout}
          >
            <MaterialIcons name="logout" size={18} color={colors.logout.text}/>
            <Text style={styles.logoutText}>Log Out</Text>
          </Pressable>
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaWrapper>
    );
}

const styles = StyleSheet.create({
    content: { paddingBottom: 24, paddingHorizontal: 16 },
    header: { paddingTop: 16, paddingBottom: 12 },
    headerTitle: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize['2xl'],
        fontWeight: fontWeight.medium,
        color: colors.text.primary,
        letterSpacing: letterSpacing.tight,
    },
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        borderRadius: 20,
        padding: 20,
        gap: 12,
        shadowColor: '#34d399',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 6,
    },
    avatarCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#0369a1', // Deeper blue
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#FFFFFF',
    },
    avatarText: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize['2xl'],
        color: '#FFFFFF',
    },
    profileInfo: { flex: 1 },
    profileName: {
        fontFamily: fontFamily.bold,
        fontSize: 20,
        fontWeight: fontWeight.medium,
        color: '#0f172a',
    },
    profilePhone: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.sm,
        color: '#334155',
        marginTop: 2,
    },
    profileMeta: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.sm,
        color: '#475569',
        marginTop: 2,
    },
    editBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.editBg,
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Stats Row
    statsRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 20,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 4,
    },
    statValue: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize['2xl'],
        fontWeight: fontWeight.medium,
        color: colors.text.primary,
    },
    statUnit: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.xs,
        color: colors.text.muted,
    },
    statLabel: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.sm,
        color: colors.text.muted,
        marginTop: 2,
    },
    bmiPill: {
        marginTop: 6,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 99,
    },
    bmiPillText: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.micro,
        textTransform: 'uppercase',
    },
    // Sections
    section: { marginBottom: 16 },
    groupTitle: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.micro,
        color: colors.text.muted,
        textTransform: 'uppercase',
        letterSpacing: letterSpacing.wider,
        marginBottom: 8,
        marginTop: 4,
    },
    settingsCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 2,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        minHeight: 52,
    },
    settingBorder: {
        borderBottomWidth: 0.5,
        borderBottomColor: colors.borderLight,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    settingIconBg: {
        width: 32,
        height: 32,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    settingLabel: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.base,
        color: colors.text.primary,
    },
    settingRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    settingValue: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.sm,
        color: colors.text.muted,
    },
    // Logout
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        height: 56,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: colors.error,
    },
    logoutText: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.base,
        color: colors.error,
    },
});
