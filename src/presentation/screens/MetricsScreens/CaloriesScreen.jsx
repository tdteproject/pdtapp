import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import SafeAreaWrapper from '@/presentation/common/layout/SafeAreaWrapper';
import { useHealthStore } from '@/presentation/state/useHealthStore';
import { useUserStore } from '@/presentation/state/useUserStore';
import { healthService } from '@/services/healthService';
import { colors } from '@/presentation/themes/colors';
import { fontFamily, fontSize, fontWeight } from '@/presentation/themes/typography';

export default function CaloriesScreen() {
    const navigation = useNavigation();
    const { metrics, goals } = useHealthStore();
    const { user } = useUserStore();

    // Derived logic
    const bmr = healthService.calculateBMR(user?.weight || 70, user?.height || 170, user?.age || 25, user?.gender || 'male');
    const totalBurned = metrics.caloriesBurned + Math.round(bmr / 3); // Approx fraction of BMR passing through the day for demo
    const progressPct = Math.min((totalBurned / goals.caloriesBurned) * 100, 100).toFixed(0);

    return (
        <SafeAreaWrapper>
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                
                {/* Header Navbar */}
                <View style={styles.navbar}>
                    <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <MaterialIcons name="arrow-back" size={24} color={colors.text.primary} />
                    </Pressable>
                    <Text style={styles.navTitle}>Calories</Text>
                    <View style={{ width: 24 }} />
                </View>

                {/* Hero Metric Section */}
                <LinearGradient
                    colors={['#ffedd5', '#fff7ed']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={styles.heroCard}
                >
                    <View style={styles.iconBg}>
                        <MaterialIcons name="local-fire-department" size={28} color={colors.health.calories} />
                    </View>
                    <Text style={styles.heroValue}>{totalBurned}</Text>
                    <Text style={styles.heroLabel}>Kcal Burned Today</Text>

                    <View style={styles.progressContainer}>
                        <View style={styles.progressHeader}>
                            <Text style={styles.progressLabel}>Goal: {goals.caloriesBurned}</Text>
                            <Text style={styles.progressPct}>{progressPct}%</Text>
                        </View>
                        <View style={styles.track}>
                            <View style={[styles.fill, { width: `${progressPct}%`, backgroundColor: colors.health.calories }]} />
                        </View>
                    </View>
                </LinearGradient>

                {/* Breakdown Grid */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Energy Breakdown</Text>
                    <View style={styles.card}>
                        <View style={styles.breakdownRow}>
                            <View style={styles.dotGroup}>
                                <View style={[styles.dot, { backgroundColor: colors.health.calories }]} />
                                <Text style={styles.breakdownLabel}>Active Burn</Text>
                            </View>
                            <Text style={styles.breakdownValue}>{metrics.caloriesBurned} kcal</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.breakdownRow}>
                            <View style={styles.dotGroup}>
                                <View style={[styles.dot, { backgroundColor: colors.text.muted }]} />
                                <Text style={styles.breakdownLabel}>Resting Energy (BMR)</Text>
                            </View>
                            <Text style={styles.breakdownValue}>{Math.round(bmr / 3)} kcal</Text>
                        </View>
                    </View>
                </View>

                <View style={{ height: 80 }} />
            </ScrollView>
        </SafeAreaWrapper>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    content: { paddingBottom: 24, paddingHorizontal: 16 },
    navbar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 56,
        marginBottom: 16,
    },
    backBtn: { padding: 8, marginLeft: -8 },
    navTitle: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.lg,
        color: colors.text.primary,
    },
    heroCard: {
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        marginBottom: 24,
    },
    iconBg: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    heroValue: { fontFamily: fontFamily.bold, fontSize: 48, letterSpacing: -1, color: colors.text.primary },
    heroLabel: { fontFamily: fontFamily.medium, fontSize: fontSize.sm, color: colors.text.secondary, marginTop: 4 },
    progressContainer: { width: '100%', marginTop: 24 },
    progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    progressLabel: { fontFamily: fontFamily.medium, fontSize: fontSize.sm, color: colors.text.secondary },
    progressPct: { fontFamily: fontFamily.bold, fontSize: fontSize.sm, color: colors.health.calories },
    track: { width: '100%', height: 6, backgroundColor: '#FFFFFF', borderRadius: 3, overflow: 'hidden' },
    fill: { height: '100%', borderRadius: 3 },
    section: { marginBottom: 24 },
    sectionTitle: { fontFamily: fontFamily.bold, fontSize: fontSize.md, color: colors.text.primary, marginBottom: 12, marginLeft: 4 },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: colors.borderLight,
    },
    breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
    dotGroup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    dot: { width: 10, height: 10, borderRadius: 5 },
    breakdownLabel: { fontFamily: fontFamily.medium, fontSize: fontSize.sm, color: colors.text.primary },
    breakdownValue: { fontFamily: fontFamily.bold, fontSize: fontSize.sm, color: colors.text.primary },
    divider: { height: 1, backgroundColor: colors.borderLight, marginVertical: 8 },
});
