import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useUserStore } from '@/presentation/state/useUserStore';
import { useAuthStore } from '@/presentation/state/useAuthStore';
import SafeAreaWrapper from '@/presentation/common/layout/SafeAreaWrapper';
import { colors } from '@/presentation/themes/colors';
import { fontFamily, fontSize, fontWeight, letterSpacing } from '@/presentation/themes/typography';
import AnimatedBackground from '@/presentation/common/ui/AnimatedBackground';

const SETTINGS = [
    { icon: 'notifications-none', label: 'Notifications', value: 'On', valueColor: colors.notification.on, iconColor: colors.primary.main, group: 'preferences' },
    { icon: 'straighten', label: 'Units', value: 'Metric (kg, cm)', iconColor: colors.health.workout, group: 'preferences' },
    { icon: 'language', label: 'Language', value: 'English', iconColor: colors.health.bloodOxygen, group: 'preferences' },
    { icon: 'privacy-tip', label: 'Privacy Policy', value: null, iconColor: colors.health.sleep, group: 'legal' },
    { icon: 'description', label: 'Terms of Service', value: null, iconColor: colors.health.hrv, group: 'legal' },
    { icon: 'info-outline', label: 'App Version', value: '1.0.0', noChevron: true, iconColor: colors.text.muted, group: 'legal' },
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
      <AnimatedBackground type="minimal"/>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
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
        </View>

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
                  <View style={[styles.bmiPill, { backgroundColor: `${stat.status.color}18` }]}>
                    <Text style={[styles.bmiPillText, { color: stat.status.color }]}>{stat.status.label}</Text>
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
    // Profile Card
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 16,
        borderWidth: 0.5,
        borderColor: colors.border,
        gap: 12,
    },
    avatarCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.primary.main,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.xl,
        color: '#fff',
    },
    profileInfo: { flex: 1 },
    profileName: {
        fontFamily: fontFamily.bold,
        fontSize: 18,
        fontWeight: fontWeight.medium,
        color: colors.text.primary,
    },
    profilePhone: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.sm,
        color: colors.text.muted,
        marginTop: 2,
    },
    profileMeta: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.sm,
        color: colors.text.muted,
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
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 14,
        alignItems: 'center',
        borderWidth: 0.5,
        borderColor: colors.border,
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
        backgroundColor: colors.card,
        borderRadius: 12,
        borderWidth: 0.5,
        borderColor: colors.border,
        overflow: 'hidden',
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
        backgroundColor: colors.logout.bg,
        borderRadius: 16,
        borderWidth: 0.5,
        borderColor: colors.logout.border,
    },
    logoutText: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.base,
        color: colors.logout.text,
    },
});
