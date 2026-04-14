import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Animated as RNAnimated, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { useUserStore } from '@/presentation/state/useUserStore';
import { colors } from '@/presentation/themes/colors';
import { fontFamily, fontSize, fontWeight } from '@/presentation/themes/typography';

const DashboardHeader = ({ scrollY }) => {
    const { user } = useUserStore();
    const navigation = useNavigation();

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';
    const firstName = user?.name?.split(' ')[0] || 'Athlete';

    // Frosted glass blur appears on scroll-down 48px with 200ms transition
    const blurOpacity = scrollY
        ? scrollY.interpolate({
            inputRange: [0, 48],
            outputRange: [0, 1],
            extrapolate: 'clamp',
        })
        : 0;

    return (
        <View style={styles.container}>
            {/* Frosted glass background */}
            {scrollY && (
                <RNAnimated.View style={[styles.blurContainer, { opacity: blurOpacity }]} pointerEvents="none">
                    <BlurView intensity={60} tint="light" style={StyleSheet.absoluteFill} />
                </RNAnimated.View>
            )}

            <View style={styles.inner}>
                <View style={styles.left}>
                    <Text style={styles.greeting}>{greeting},</Text>
                    <Text style={styles.name}>{firstName}</Text>
                </View>
                <Pressable style={styles.avatarBtn} onPress={() => navigation.navigate('Me')}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{firstName.charAt(0).toUpperCase()}</Text>
                    </View>
                </Pressable>
            </View>
        </View>
    );
};
export default DashboardHeader;

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        marginBottom: 16,
    },
    blurContainer: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 16,
        overflow: 'hidden',
    },
    inner: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 4,
        paddingVertical: 8,
    },
    left: {
        flex: 1,
    },
    greeting: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.sm,
        color: colors.text.muted,
        marginBottom: 2,
    },
    name: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize['2xl'],
        fontWeight: fontWeight.medium,
        color: colors.text.primary,
    },
    avatarBtn: {
        borderRadius: 22,
        borderWidth: 2,
        borderColor: colors.borderAccent,
        padding: 2,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.primary.main,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.lg,
        color: '#FFF',
    },
});
