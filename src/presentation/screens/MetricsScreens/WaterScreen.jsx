import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import SafeAreaWrapper from '@/presentation/common/layout/SafeAreaWrapper';
import CircularProgressCard from '@/presentation/common/ui/CircularProgressCard';
import { useHealthStore } from '@/presentation/state/useHealthStore';
import { colors } from '@/presentation/themes/colors';
import { fontFamily, fontSize } from '@/presentation/themes/typography';

export default function WaterScreen() {
    const navigation = useNavigation();
    const { metrics, goals, addWater } = useHealthStore();

    const progressPct = Math.min((metrics.hydration / goals.hydration) * 100, 100);
    const ringData = [{
        label: 'Consumed',
        value: metrics.hydration,
        unit: 'ml',
        color: colors.health.hydration,
        progress: progressPct
    }];

    const handleAddWater = (amount) => {
        addWater(amount);
    };

    return (
        <SafeAreaWrapper>
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                
                {/* Header Navbar */}
                <View style={styles.navbar}>
                    <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <MaterialIcons name="arrow-back" size={24} color={colors.text.primary} />
                    </Pressable>
                    <Text style={styles.navTitle}>Hydration</Text>
                    <View style={{ width: 24 }} />
                </View>

                {/* Hero Add Card */}
                <LinearGradient
                    colors={['#e0f2fe', '#f0f9ff']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={styles.heroCard}
                >
                    <CircularProgressCard
                        title=""
                        centerScore={`${(metrics.hydration / 1000).toFixed(1)}L`}
                        size={200}
                        ringWidth={16}
                        rings={ringData}
                    />

                    <Text style={styles.goalText}>Daily Goal: {goals.hydration} ml</Text>
                    
                    <View style={styles.quickAddRow}>
                        <Pressable style={({pressed}) => [styles.addBtn, pressed && {transform: [{scale: 0.95}]}]} onPress={() => handleAddWater(250)}>
                            <MaterialIcons name="local-drink" size={20} color={colors.health.hydration} />
                            <Text style={styles.addBtnText}>+250 ml</Text>
                        </Pressable>
                        <Pressable style={({pressed}) => [styles.addBtn, pressed && {transform: [{scale: 0.95}]}]} onPress={() => handleAddWater(500)}>
                            <MaterialIcons name="water-drop" size={20} color={colors.health.hydration} />
                            <Text style={styles.addBtnText}>+500 ml</Text>
                        </Pressable>
                    </View>
                </LinearGradient>

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
    goalText: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.sm,
        color: colors.text.secondary,
        marginVertical: 16,
    },
    quickAddRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    addBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#FFFFFF',
        paddingVertical: 14,
        borderRadius: 16,
        shadowColor: colors.health.hydration,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    addBtnText: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.base,
        color: colors.health.hydration,
    },
});
