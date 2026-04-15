import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import SafeAreaWrapper from '@/presentation/common/layout/SafeAreaWrapper';
import HealthGraph from '@/presentation/common/ui/HealthGraph';
import { useHealthStore } from '@/presentation/state/useHealthStore';
import { healthService } from '@/services/healthService';
import { dataProcessor } from '@/services/dataProcessor';
import { colors } from '@/presentation/themes/colors';
import { fontFamily, fontSize, fontWeight, letterSpacing } from '@/presentation/themes/typography';

export default function StepsScreen() {
    const navigation = useNavigation();
    const { metrics, rawStepsHistory, goals } = useHealthStore();

    // Derived logic
    const distanceKm = healthService.calculateDistance(metrics.steps);
    const progressPct = Math.min((metrics.steps / goals.steps) * 100, 100).toFixed(0);

    // Process raw history into graph data
    const graphData = useMemo(() => {
        return dataProcessor.aggregateStepsTo4HourBuckets(rawStepsHistory, new Date());
    }, [rawStepsHistory]);

    return (
        <SafeAreaWrapper>
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                
                {/* Header Navbar */}
                <View style={styles.navbar}>
                    <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <MaterialIcons name="arrow-back" size={24} color={colors.text.primary} />
                    </Pressable>
                    <Text style={styles.navTitle}>Steps</Text>
                    <View style={{ width: 24 }} />
                </View>

                {/* Hero Metric Section */}
                <LinearGradient
                    colors={['#dcfce7', '#f0fdf4']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={styles.heroCard}
                >
                    <View style={styles.iconBg}>
                        <MaterialIcons name="directions-walk" size={28} color={colors.health.steps} />
                    </View>
                    <Text style={styles.heroValue}>{metrics.steps.toLocaleString()}</Text>
                    <Text style={styles.heroLabel}>Total Steps Today</Text>

                    <View style={styles.progressContainer}>
                        <View style={styles.progressHeader}>
                            <Text style={styles.progressLabel}>Goal: {goals.steps.toLocaleString()}</Text>
                            <Text style={styles.progressPct}>{progressPct}%</Text>
                        </View>
                        <View style={styles.track}>
                            <View style={[styles.fill, { width: `${progressPct}%`, backgroundColor: colors.health.steps }]} />
                        </View>
                    </View>
                </LinearGradient>

                {/* Graph Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Activity by Time</Text>
                    <View style={styles.graphCard}>
                         <HealthGraph data={graphData} color={colors.health.steps} height={240} yUnit="steps" />
                    </View>
                </View>

                {/* Derived Metrics Grid */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Derived Insights</Text>
                    <View style={styles.grid}>
                        <View style={styles.gridCard}>
                            <MaterialIcons name="map" size={24} color={colors.health.steps} />
                            <Text style={styles.gridValue}>{distanceKm} <Text style={styles.gridUnit}>km</Text></Text>
                            <Text style={styles.gridLabel}>Distance</Text>
                        </View>
                        <View style={styles.gridCard}>
                            <MaterialIcons name="timer" size={24} color={colors.health.workout} />
                            <Text style={styles.gridValue}>{metrics.activeTimeMinutes} <Text style={styles.gridUnit}>min</Text></Text>
                            <Text style={styles.gridLabel}>Active Time</Text>
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
    heroValue: {
        fontFamily: fontFamily.bold,
        fontSize: 48,
        letterSpacing: -1,
        color: colors.text.primary,
    },
    heroLabel: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.sm,
        color: colors.text.secondary,
        marginTop: 4,
    },
    progressContainer: { width: '100%', marginTop: 24 },
    progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    progressLabel: { fontFamily: fontFamily.medium, fontSize: fontSize.sm, color: colors.text.secondary },
    progressPct: { fontFamily: fontFamily.bold, fontSize: fontSize.sm, color: colors.health.steps },
    track: { width: '100%', height: 6, backgroundColor: '#FFFFFF', borderRadius: 3, overflow: 'hidden' },
    fill: { height: '100%', borderRadius: 3 },
    section: { marginBottom: 24 },
    sectionTitle: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.md,
        color: colors.text.primary,
        marginBottom: 12,
        marginLeft: 4,
    },
    graphCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        paddingVertical: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 4,
        borderWidth: 1,
        borderColor: colors.borderLight,
        overflow: 'hidden',
    },
    grid: { flexDirection: 'row', gap: 12 },
    gridCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: colors.borderLight,
    },
    gridValue: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize['2xl'],
        color: colors.text.primary,
        marginTop: 12,
    },
    gridUnit: { fontSize: fontSize.sm, color: colors.text.muted, fontFamily: fontFamily.medium },
    gridLabel: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.sm,
        color: colors.text.secondary,
        marginTop: 2,
    },
});
