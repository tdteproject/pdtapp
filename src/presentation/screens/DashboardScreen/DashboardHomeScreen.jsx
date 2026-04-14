import React, { useEffect, useRef, useState } from 'react';
import { View, ScrollView, StyleSheet, Text, RefreshControl, Animated, Easing, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useHealthStore } from '@/presentation/state/useHealthStore';
import SafeAreaWrapper from '@/presentation/common/layout/SafeAreaWrapper';
import DashboardHeader from '@/presentation/common/ui/DashboardHeader';
import HealthCard from '@/presentation/common/ui/HealthCard';
import CircularProgressCard from '@/presentation/common/ui/CircularProgressCard';
import { colors } from '@/presentation/themes/colors';
import { fontFamily, fontSize, fontWeight, letterSpacing } from '@/presentation/themes/typography';
import AnimatedBackground from '@/presentation/common/ui/AnimatedBackground';

// Shimmer placeholder
const ShimmerBar = ({ width = '100%', height = 16, style }) => {
    const shimmer = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.loop(
            Animated.timing(shimmer, {
                toValue: 1,
                duration: 1200,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();
    }, []);
    const translateX = shimmer.interpolate({
        inputRange: [0, 1],
        outputRange: [-200, 200],
    });
    return (
        <View style={[{ width, height, backgroundColor: colors.skeleton, borderRadius: 8, overflow: 'hidden' }, style]}>
            <Animated.View style={{
                width: '50%',
                height: '100%',
                backgroundColor: 'rgba(255,255,255,0.5)',
                transform: [{ translateX }],
            }} />
        </View>
    );
};

const DashboardHomeScreen = () => {
    const { metrics, goals, workoutMinutes, refreshMetrics } = useHealthStore();
    const [refreshing, setRefreshing] = useState(false);
    const [showSkeleton, setShowSkeleton] = useState(true);
    const cardAnim = useRef(new Animated.Value(0)).current;
    const fabAnim = useRef(new Animated.Value(0)).current;
    const scrollY = useRef(new Animated.Value(0)).current;

    // Progress bar animations
    const barAnims = useRef([
        new Animated.Value(0),
        new Animated.Value(0),
        new Animated.Value(0),
    ]).current;

    useEffect(() => {
        // Show skeleton for 800ms
        const timer = setTimeout(() => setShowSkeleton(false), 800);

        Animated.spring(cardAnim, {
            toValue: 1,
            tension: 50,
            friction: 10,
            useNativeDriver: true,
            delay: 200,
        }).start();

        // AI FAB bounce: translateY 0→-6→0 400ms
        Animated.sequence([
            Animated.delay(600),
            Animated.sequence([
                Animated.timing(fabAnim, { toValue: -6, duration: 200, useNativeDriver: true }),
                Animated.spring(fabAnim, { toValue: 0, tension: 80, friction: 5, useNativeDriver: true }),
            ]),
        ]).start();

        return () => clearTimeout(timer);
    }, []);

    // Animate goal progress bars on data load
    useEffect(() => {
        if (!showSkeleton) {
            barAnims.forEach((anim, idx) => {
                Animated.timing(anim, {
                    toValue: 1,
                    duration: 600,
                    delay: idx * 100,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: false,
                }).start();
            });
        }
    }, [showSkeleton]);

    const onRefresh = async () => {
        setRefreshing(true);
        await refreshMetrics();
        setRefreshing(false);
    };

    useEffect(() => { refreshMetrics(); }, []);

    const stepsProgress = Math.round((metrics.steps / goals.steps) * 100);
    const caloriesProgress = Math.round((metrics.caloriesBurned / goals.caloriesBurned) * 100);
    const workoutProgress = Math.round((workoutMinutes / goals.workoutMinutes) * 100);
    const hydrationProgress = Math.round((metrics.hydration / goals.hydration) * 100);
    const activityScore = Math.min(Math.round((stepsProgress + caloriesProgress + workoutProgress) / 3), 100);

    const cardStyle = {
        opacity: cardAnim,
        transform: [{
            translateY: cardAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [16, 0],
            }),
        }],
    };

    const goalItems = [
        { label: 'Steps', value: metrics.steps.toLocaleString(), progress: stepsProgress, color: colors.health.steps, icon: 'directions-walk' },
        { label: 'Calories', value: metrics.caloriesBurned.toString(), progress: caloriesProgress, color: colors.health.calories, icon: 'local-fire-department' },
        { label: 'Water', value: `${(metrics.hydration / 1000).toFixed(1)}L`, progress: hydrationProgress, color: colors.health.hydration, icon: 'water-drop' },
    ];

    return (
    <SafeAreaWrapper>
      <AnimatedBackground type="rich"/>
      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary.main}/>}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        scrollEventThrottle={16}
      >
        <DashboardHeader scrollY={scrollY} />

        {/* Activity Ring */}
        <Animated.View style={[styles.section, cardStyle]}>
          <View style={styles.ringCard}>
            {showSkeleton ? (
                <View style={{ padding: 20, gap: 12 }}>
                    <ShimmerBar width={120} height={18} />
                    <ShimmerBar width="100%" height={160} style={{ borderRadius: 80 }} />
                </View>
            ) : (
                <CircularProgressCard
                    title="Daily Activity"
                    centerScore={activityScore}
                    size={160}
                    ringWidth={10}
                    rings={[
                        { color: colors.health.steps, progress: stepsProgress, label: 'Steps', value: metrics.steps.toLocaleString(), unit: `/${(goals.steps / 1000).toFixed(0)}k` },
                        { color: colors.health.calories, progress: caloriesProgress, label: 'Calories', value: metrics.caloriesBurned.toString(), unit: `/${goals.caloriesBurned}` },
                        { color: colors.health.workout, progress: workoutProgress, label: 'Workout', value: workoutMinutes.toString(), unit: `/${goals.workoutMinutes}m` },
                    ]}
                />
            )}
          </View>
        </Animated.View>

        {/* Today's Goals */}
        <Animated.View style={[styles.section, cardStyle]}>
          <Text style={styles.sectionTitle}>Today's Goals</Text>
          <View style={styles.goalsRow}>
            {goalItems.map((item, idx) => (
              <Pressable key={item.label} style={({ pressed }) => [styles.goalItem, pressed && { transform: [{ scale: 0.97 }] }]}>
                <View style={[styles.goalIconBg, { backgroundColor: `${item.color}18` }]}>
                  <MaterialIcons name={item.icon} size={20} color={item.color}/>
                </View>
                <Text style={styles.goalValue}>{item.value}</Text>
                <Text style={styles.goalLabel}>{item.label}</Text>
                <View style={styles.goalTrack}>
                  <Animated.View style={[
                    styles.goalFill,
                    {
                      backgroundColor: item.color,
                      width: barAnims[idx].interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', `${Math.min(item.progress, 100)}%`],
                      }),
                    },
                  ]}/>
                </View>
                <Text style={styles.goalPct}>{Math.min(item.progress, 100)}%</Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        {/* Health Metrics Grid */}
        <Animated.View style={[styles.section, cardStyle]}>
          <Text style={styles.sectionTitle}>Health Metrics</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricsRow}>
              <HealthCard
                title="Heart Rate"
                value={metrics.heartRate.toString()}
                unit="bpm"
                icon="favorite"
                color={colors.health.heartRate}
                trend={metrics.heartRate > 100 ? 'up' : 'neutral'}
                trendValue={metrics.heartRate > 100 ? 'High' : undefined}
                sparklineData={[68, 72, 75, 70, 78, metrics.heartRate]}
              />
              <HealthCard
                title="Blood Oxygen"
                value="98"
                unit="%"
                icon="water-drop"
                color={colors.health.bloodOxygen}
                trend="neutral"
              />
            </View>
            <View style={styles.metricsRow}>
              <HealthCard
                title="Sleep"
                value="7.5"
                unit="hrs"
                icon="bedtime"
                color={colors.health.sleep}
                trend="up"
                trendValue="+0.5h"
              />
              <HealthCard
                title="Weight"
                value="72"
                unit="kg"
                icon="monitor-weight"
                color={colors.health.weight}
                trend="down"
                trendValue="-0.5kg"
              />
            </View>
          </View>
        </Animated.View>

        {/* AI Insight Card */}
        <Animated.View style={[styles.section, cardStyle, { marginBottom: 30 }]}>
          <View style={styles.aiCard}>
            <View style={styles.aiLeft}>
              <View style={styles.aiBadge}>
                <Text style={styles.aiBadgeText}>AI Insight</Text>
              </View>
              <Text style={styles.aiTitle}>Great Progress! 🏆</Text>
              <Text style={styles.aiDesc}>
                You're {stepsProgress}% to your daily step goal. A 20-min walk would complete it.
              </Text>
            </View>
            <View style={styles.aiRight}>
              <Text style={styles.aiEmoji}>🤖</Text>
              <View style={styles.aiScoreBadge}>
                <Text style={styles.aiScore}>{activityScore}</Text>
                <Text style={styles.aiScoreLabel}>Score</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        <View style={{ height: 80 }}/>
      </ScrollView>

      {/* AI Insight FAB */}
      <Animated.View style={[styles.fabContainer, { transform: [{ translateY: fabAnim }] }]}>
        <Pressable style={({ pressed }) => [styles.fab, pressed && { transform: [{ scale: 0.95 }] }]}>
          <MaterialIcons name="auto-awesome" size={18} color="#FFFFFF" />
          <Text style={styles.fabText}>AI Insight</Text>
        </Pressable>
      </Animated.View>
    </SafeAreaWrapper>
    );
};
export default DashboardHomeScreen;

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { paddingBottom: 24, paddingHorizontal: 16 },
    section: { marginBottom: 16 },
    sectionTitle: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.md,
        fontWeight: fontWeight.medium,
        color: colors.text.primary,
        marginBottom: 10,
        paddingHorizontal: 4,
    },
    ringCard: {
        backgroundColor: colors.card,
        borderRadius: 16,
        borderWidth: 0.5,
        borderColor: colors.border,
        paddingVertical: 16,
    },
    goalsRow: { flexDirection: 'row', gap: 10 },
    goalItem: {
        flex: 1,
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
        gap: 4,
        borderWidth: 0.5,
        borderColor: colors.border,
    },
    goalIconBg: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    goalValue: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.lg,
        fontWeight: fontWeight.medium,
        color: colors.text.primary,
        letterSpacing: letterSpacing.tight,
    },
    goalLabel: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.xs,
        color: colors.text.muted,
    },
    goalTrack: {
        width: '100%',
        height: 4,
        backgroundColor: colors.border,
        borderRadius: 99,
        overflow: 'hidden',
        marginTop: 4,
    },
    goalFill: { height: '100%', borderRadius: 99 },
    goalPct: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.micro,
        color: colors.text.muted,
    },
    metricsGrid: { gap: 10 },
    metricsRow: { flexDirection: 'row', gap: 10 },
    aiCard: {
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        borderWidth: 0.5,
        borderColor: colors.borderAccent,
        alignItems: 'center',
    },
    aiLeft: { flex: 1, marginRight: 12 },
    aiBadge: {
        alignSelf: 'flex-start',
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 3,
        backgroundColor: colors.primary.subtle,
        borderWidth: 0.5,
        borderColor: colors.borderAccent,
        marginBottom: 8,
    },
    aiBadgeText: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.micro,
        color: colors.primary.main,
        textTransform: 'uppercase',
        letterSpacing: letterSpacing.wider,
    },
    aiTitle: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.md,
        color: colors.text.primary,
        marginBottom: 4,
    },
    aiDesc: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.sm,
        color: colors.text.secondary,
        lineHeight: 18,
    },
    aiRight: { alignItems: 'center', justifyContent: 'center', gap: 6 },
    aiEmoji: { fontSize: 32 },
    aiScoreBadge: {
        alignItems: 'center',
        backgroundColor: colors.primary.subtle,
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    aiScore: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.lg,
        color: colors.primary.main,
        letterSpacing: letterSpacing.tight,
    },
    aiScoreLabel: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.micro,
        color: colors.text.muted,
        textTransform: 'uppercase',
    },
    fabContainer: {
        position: 'absolute',
        bottom: 90,
        left: 16,
    },
    fab: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        height: 48,
        paddingHorizontal: 18,
        backgroundColor: colors.primary.main,
        borderRadius: 99,
        shadowColor: colors.primary.main,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    fabText: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.sm,
        color: '#FFFFFF',
    },
});
