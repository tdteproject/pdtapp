import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useUserStore } from '@/presentation/state/useUserStore';
import { useAuthStore } from '@/presentation/state/useAuthStore';
import SafeAreaWrapper from '@/presentation/common/layout/SafeAreaWrapper';
import { colors } from '@/presentation/themes/colors';
import { fontFamily, fontSize, letterSpacing } from '@/presentation/themes/typography';
import AnimatedBackground from '@/presentation/common/ui/AnimatedBackground';

const SETTINGS = [
  { icon: 'notifications-none', label: 'Notifications', value: 'On', group: 'preferences' },
  { icon: 'straighten', label: 'Units', value: 'Metric (kg, cm)', group: 'preferences' },
  { icon: 'language', label: 'Language', value: 'English', group: 'preferences' },
  { icon: 'privacy-tip', label: 'Privacy Policy', value: null, group: 'legal' },
  { icon: 'description', label: 'Terms of Service', value: null, group: 'legal' },
  { icon: 'info-outline', label: 'App Version', value: '1.0.0', group: 'legal' },
];

export default function MeScreen() {
  const { user } = useUserStore();
  const { logout, userPhone } = useAuthStore();
  const navigation = useNavigation<any>();

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: () => logout(),
        },
      ]
    );
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  const firstName = user?.name?.split(' ')[0] || 'Athlete';
  const bmi = user?.weight && user?.height
    ? (user.weight / Math.pow(user.height / 100, 2)).toFixed(1)
    : null;

  return (
    <SafeAreaWrapper>
      <AnimatedBackground type="minimal" />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        {/* Avatar + Info */}
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{firstName.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name || 'Setup your profile'}</Text>
            <Text style={styles.profilePhone}>{userPhone || 'No phone'}</Text>
            {user?.gender && (
              <View style={styles.profileBadge}>
                <Text style={styles.profileBadgeText}>
                  {user.gender.charAt(0).toUpperCase() + user.gender.slice(1)} · {user?.age} yrs
                </Text>
              </View>
            )}
          </View>
          <Pressable style={styles.editBtn} onPress={handleEditProfile}>
            <MaterialIcons name="edit" size={16} color={colors.primary.main} />
          </Pressable>
        </View>

        {/* Stats Row */}
        {user?.weight && user?.height && (
          <View style={styles.statsRow}>
            {[
              { label: 'Weight', value: `${user.weight}`, unit: 'kg', icon: 'fitness-center', color: colors.health.weight },
              { label: 'Height', value: `${user.height}`, unit: 'cm', icon: 'straighten', color: colors.health.sleep },
              { label: 'BMI', value: bmi || '—', unit: '', icon: 'monitor-weight', color: colors.health.heartRate },
            ].map((stat) => (
              <View key={stat.label} style={styles.statCard}>
                <MaterialIcons name={stat.icon as any} size={16} color={stat.color} style={{ marginBottom: 4 }} />
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statUnit}>{stat.unit}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Settings Groups */}
        {['preferences', 'legal'].map((group) => (
          <View key={group} style={styles.section}>
            <Text style={styles.groupTitle}>
              {group === 'preferences' ? 'Preferences' : 'About'}
            </Text>
            <View style={styles.settingsCard}>
              {SETTINGS.filter((s) => s.group === group).map((s, idx, arr) => (
                <Pressable
                  key={s.label}
                  style={[styles.settingRow, idx < arr.length - 1 && styles.settingBorder]}
                >
                  <View style={styles.settingLeft}>
                    <View style={styles.settingIconBg}>
                      <MaterialIcons name={s.icon as any} size={16} color={colors.text.secondary} />
                    </View>
                    <Text style={styles.settingLabel}>{s.label}</Text>
                  </View>
                  <View style={styles.settingRight}>
                    {s.value && <Text style={styles.settingValue}>{s.value}</Text>}
                    <MaterialIcons name="chevron-right" size={16} color={colors.text.muted} />
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        ))}

        {/* Logout */}
        <View style={styles.section}>
          <Pressable style={styles.logoutBtn} onPress={handleLogout}>
            <MaterialIcons name="logout" size={18} color={colors.error} />
            <Text style={styles.logoutText}>Log Out</Text>
          </Pressable>
        </View>

      </ScrollView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 80, paddingHorizontal: 16 },
  header: { paddingTop: 16, paddingBottom: 8 },
  title: { fontFamily: fontFamily.bold, fontSize: fontSize['2xl'], color: colors.text.primary, letterSpacing: letterSpacing.tight },

  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  avatarCircle: {
    width: 48, height: 48, borderRadius: 16,
    backgroundColor: colors.primary.main,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontFamily: fontFamily.bold, fontSize: fontSize['xl'], color: '#fff' },
  profileInfo: { flex: 1 },
  profileName: { fontFamily: fontFamily.bold, fontSize: fontSize.lg, color: colors.text.primary },
  profilePhone: { fontFamily: fontFamily.regular, fontSize: fontSize.sm, color: colors.text.secondary, marginTop: 2 },
  profileBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.cardElevated,
    borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, marginTop: 4,
  },
  profileBadgeText: { fontFamily: fontFamily.medium, fontSize: fontSize.xs, color: colors.text.muted },
  editBtn: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: colors.primary.subtle,
    borderWidth: 1, borderColor: colors.borderAccent,
    justifyContent: 'center', alignItems: 'center',
  },

  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  statCard: {
    flex: 1, backgroundColor: colors.card,
    borderRadius: 12, padding: 12, alignItems: 'center',
    borderWidth: 1, borderColor: colors.border,
  },
  statValue: { fontFamily: fontFamily.bold, fontSize: fontSize.lg, color: colors.text.primary },
  statUnit: { fontFamily: fontFamily.medium, fontSize: fontSize.xs, color: colors.text.muted },
  statLabel: { fontFamily: fontFamily.regular, fontSize: fontSize.xs, color: colors.text.secondary, marginTop: 2 },

  section: { marginBottom: 16 },
  groupTitle: { fontFamily: fontFamily.bold, fontSize: fontSize.xs, color: colors.text.muted, textTransform: 'uppercase', letterSpacing: letterSpacing.wide, marginBottom: 8 },
  settingsCard: { backgroundColor: colors.card, borderRadius: 12, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  settingBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  settingIconBg: { width: 28, height: 28, borderRadius: 8, backgroundColor: colors.cardElevated, justifyContent: 'center', alignItems: 'center' },
  settingLabel: { fontFamily: fontFamily.medium, fontSize: fontSize.base, color: colors.text.primary },
  settingRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  settingValue: { fontFamily: fontFamily.regular, fontSize: fontSize.sm, color: colors.text.muted },

  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: 'rgba(255, 55, 95, 0.08)',
    borderRadius: 12, paddingVertical: 12,
    borderWidth: 1, borderColor: 'rgba(255, 55, 95, 0.2)',
  },
  logoutText: { fontFamily: fontFamily.bold, fontSize: fontSize.base, color: colors.error },
});
