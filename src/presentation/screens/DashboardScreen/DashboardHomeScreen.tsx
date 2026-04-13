import React, { useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  RefreshControl,
  Pressable,
  Animated,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useHealthStore } from '@/presentation/state/useHealthStore';
import SafeAreaWrapper from '@/presentation/common/layout/SafeAreaWrapper';
import DashboardHeader from '@/presentation/common/ui/DashboardHeader';
import HealthCard from '@/presentation/common/ui/HealthCard';
import CircularProgressCard from '@/presentation/common/ui/CircularProgressCard';
import { colors } from '@/presentation/themes/colors';
import { fontFamily, fontSize, letterSpacing } from '@/presentation/themes/typography';
import AnimatedBackground from '@/presentation/common/ui/AnimatedBackground';

const DashboardHomeScreen = () => {
  const { metrics, goals, workoutMinutes, refreshMetrics } = useHealthStore();
  const [refreshing, setRefreshing] = React.useState(false);

  const cardAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(cardAnim, {
      toValue: 1,
      tension: 50,
      friction: 10,
      useNativeDriver: true,
      delay: 200,
    }).start();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshMetrics();
    setRefreshing(false);
  };

  useEffect(() => {
    refreshMetrics();
  }, []);

  const stepsProgress = Math.round((metrics.steps / goals.steps) * 100);
  const caloriesProgress = Math.round((metrics.caloriesBurned / goals.caloriesBurned) * 100);
  const workoutProgress = Math.round((workoutMinutes / goals.workoutMinutes) * 100);
  const hydrationProgress = Math.round((metrics.hydration / goals.hydration) * 100);

  const activityScore = Math.min(
    Math.round((stepsProgress + caloriesProgress + workoutProgress) / 3),
    100
  );

  const cardStyle = {
    opacity: cardAnim,
    transform: [
      {
        translateY: cardAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [20, 0],
        }),
      },
    ],
  };

  return (
    <SafeAreaWrapper>
      <AnimatedBackground type="rich" />
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary.main} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <DashboardHeader />

        {/* Activity Ring */}
        <Animated.View style={[styles.section, cardStyle]}>
          <View style={[styles.sectionCard, styles.ringCard]}>
            <CircularProgressCard
              title="Daily Activity"
              centerScore={activityScore}
              size={160}
              ringWidth={12}
              rings={[
                { color: colors.health.steps, progress: stepsProgress, label: 'Steps', value: metrics.steps.toLocaleString(), unit: `/${(goals.steps / 1000).toFixed(0)}k` },
                { color: colors.health.calories, progress: caloriesProgress, label: 'Calories', value: metrics.caloriesBurned.toString(), unit: `/${goals.caloriesBurned}` },
                { color: colors.health.workout, progress: workoutProgress, label: 'Workout', value: workoutMinutes.toString(), unit: `/${goals.workoutMinutes}m` },
              ]}
            />
          </View>
        </Animated.View>

        {/* Today's Goals */}
        <Animated.View style={[styles.section, cardStyle]}>
          <Text style={styles.sectionTitle}>Today's Goals</Text>
          <View style={styles.goalsRow}>
            {[
              { label: 'Steps', value: metrics.steps.toLocaleString(), progress: stepsProgress, color: colors.health.steps, icon: 'directions-walk' },
              { label: 'Calories', value: metrics.caloriesBurned.toString(), progress: caloriesProgress, color: colors.health.calories, icon: 'local-fire-department' },
              { label: 'Water', value: `${(metrics.hydration / 1000).toFixed(1)}L`, progress: hydrationProgress, color: colors.health.hydration, icon: 'water-drop' },
            ].map((item) => (
              <View key={item.label} style={styles.goalItem}>
                <View style={[styles.goalIconBg, { backgroundColor: `${item.color}18` }]}>
                  <MaterialIcons name={item.icon as any} size={16} color={item.color} />
                </View>
                <Text style={styles.goalValue}>{item.value}</Text>
                <Text style={styles.goalLabel}>{item.label}</Text>
                <View style={styles.goalTrack}>
                  <View style={[styles.goalFill, { width: `${Math.min(item.progress, 100)}%`, backgroundColor: item.color }]} />
                </View>
                <Text style={styles.goalPct}>{Math.min(item.progress, 100)}%</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Health Metrics Grid */}
        <Animated.View style={[styles.section, cardStyle]}>
          <Text style={styles.sectionTitle}>Health Metrics</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricsRow}>
              <HealthCard title="Heart Rate" value={metrics.heartRate.toString()} unit="bpm" icon="favorite" color={colors.health.heartRate} progress={Math.round((metrics.heartRate / 180) * 100)} trend={metrics.heartRate > 100 ? 'up' : 'neutral'} trendValue={metrics.heartRate > 100 ? 'High' : undefined} />
              <HealthCard title="Blood Oxygen" value="98" unit="%" icon="water-drop" color={colors.health.bloodOxygen} progress={98} trend="neutral" />
            </View>
            <View style={styles.metricsRow}>
              <HealthCard title="Sleep" value="7.5" unit="hrs" icon="bedtime" color={colors.health.sleep} progress={Math.round((7.5 / 8) * 100)} trend="up" trendValue="+0.5h" />
              <HealthCard title="Weight" value="72" unit="kg" icon="monitor-weight" color={colors.health.weight} trend="down" trendValue="-0.5kg" />
            </View>
          </View>
        </Animated.View>

        {/* AI Insight */}
        <Animated.View style={[styles.section, cardStyle, { marginBottom: 30 }]}>
          <View style={styles.aiCard}>
            <View style={styles.aiLeft}>
              <View style={styles.aiBadge}>
                <Text style={styles.aiBadgeText}>AI Insight</Text>
              </View>
              <Text style={styles.aiTitle}>Great Progress! 🏆</Text>
              <Text style={styles.aiDesc}>
                You're 72% to your daily step goal. A 20-min walk would complete it.
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

        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaWrapper>
  );
};

export default DashboardHomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 24, paddingHorizontal: 12 },
  section: { marginBottom: 12 },
  sectionTitle: { fontFamily: fontFamily.bold, fontSize: fontSize.md, color: colors.text.primary, marginBottom: 8, paddingHorizontal: 4 },
  sectionCard: { backgroundColor: colors.card, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 16 },
  ringCard: { paddingVertical: 16 },

  goalsRow: { flexDirection: 'row', gap: 8 },
  goalItem: { flex: 1, backgroundColor: colors.card, borderRadius: 12, padding: 12, alignItems: 'center', gap: 4, borderWidth: 1, borderColor: colors.border },
  goalIconBg: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 2 },
  goalValue: { fontFamily: fontFamily.bold, fontSize: fontSize.lg, color: colors.text.primary, letterSpacing: letterSpacing.tight },
  goalLabel: { fontFamily: fontFamily.medium, fontSize: fontSize.xs, color: colors.text.secondary },
  goalTrack: { width: '100%', height: 4, backgroundColor: colors.border, borderRadius: 2, overflow: 'hidden', marginTop: 4 },
  goalFill: { height: '100%', borderRadius: 2 },
  goalPct: { fontFamily: fontFamily.regular, fontSize: fontSize.xs, color: colors.text.muted },

  metricsGrid: { gap: 8 },
  metricsRow: { flexDirection: 'row', gap: 8 },

  aiCard: { backgroundColor: colors.card, borderRadius: 16, padding: 16, flexDirection: 'row', borderWidth: 1, borderColor: colors.borderAccent, alignItems: 'center' },
  aiLeft: { flex: 1, marginRight: 12 },
  aiBadge: { alignSelf: 'flex-start', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, backgroundColor: colors.primary.subtle, borderWidth: 1, borderColor: colors.borderAccent, marginBottom: 6 },
  aiBadgeText: { fontFamily: fontFamily.bold, fontSize: fontSize.xs, color: colors.primary.main, textTransform: 'uppercase' },
  aiTitle: { fontFamily: fontFamily.bold, fontSize: fontSize.md, color: colors.text.primary, marginBottom: 4 },
  aiDesc: { fontFamily: fontFamily.regular, fontSize: fontSize.sm, color: colors.text.secondary, lineHeight: 18 },
  aiRight: { alignItems: 'center', justifyContent: 'center', gap: 6 },
  aiEmoji: { fontSize: 32 },
  aiScoreBadge: { alignItems: 'center', backgroundColor: colors.primary.subtle, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  aiScore: { fontFamily: fontFamily.bold, fontSize: fontSize.lg, color: colors.primary.main, letterSpacing: letterSpacing.tight },
  aiScoreLabel: { fontFamily: fontFamily.bold, fontSize: fontSize.xs, color: colors.text.muted, textTransform: 'uppercase' },
});
