import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { Platform, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { useAuthStore } from '@/presentation/state/useAuthStore';
import { useUserStore } from '@/presentation/state/useUserStore';
import PhoneAuthScreen from '@/presentation/screens/AuthScreen/PhoneAuth';
import OTPVerifyScreen from '@/presentation/screens/AuthScreen/OTPVerify';
import ProfileSetupScreen from '@/presentation/screens/ProfileScreen/ProfileSetupScreen';
import DashboardHomeScreen from '@/presentation/screens/DashboardScreen/DashboardHomeScreen';
import WorkoutsScreen from '@/presentation/screens/WorkoutsScreen/WorkoutsScreen';
import MeScreen from '@/presentation/screens/MeScreen/MeScreen';
import { colors } from '@/presentation/themes/colors';
import { fontFamily, fontSize } from '@/presentation/themes/typography';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TAB_ICONS = {
    Health: 'favorite',
    Workouts: 'directions-run',
    Me: 'account-circle',
};

const AnimatedTabIcon = ({ focused, color, iconName }) => {
    const scale = useSharedValue(1);

    React.useEffect(() => {
        // Tab switch spring anim: scale 1.0->1.15->1.0
        if (focused) {
            scale.value = withSpring(1.15, { damping: 12, stiffness: 150 }, () => {
                scale.value = withSpring(1, { damping: 15, stiffness: 200 });
            });
        } else {
            scale.value = withTiming(1, { duration: 150 });
        }
    }, [focused]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            {focused && (
                <View style={{
                    position: 'absolute',
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: colors.primary.subtle,
                }} />
            )}
            <Animated.View style={animatedStyle}>
                <MaterialIcons name={iconName} size={24} color={color} />
            </Animated.View>
        </View>
    );
};

function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarShowLabel: true,
                tabBarActiveTintColor: colors.primary.main,
                tabBarInactiveTintColor: colors.text.muted,
                tabBarLabelStyle: {
                    fontFamily: fontFamily.medium,
                    fontSize: 10,
                    marginBottom: Platform.OS === 'android' ? 6 : 0,
                    marginTop: -4,
                },
                tabBarStyle: {
                    backgroundColor: colors.card,
                    borderTopWidth: 0,
                    position: 'absolute',
                    bottom: 16,
                    left: 16,
                    right: 16,
                    borderRadius: 20,
                    height: 60,
                    paddingBottom: 6,
                    paddingTop: 8,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 16,
                    elevation: 10,
                    borderWidth: 1,
                    borderColor: colors.borderLight,
                },
                tabBarItemStyle: {
                    borderRadius: 12,
                },
                tabBarIcon: ({ color, focused }) => {
                    const iconName = TAB_ICONS[route.name] || 'circle';
                    return <AnimatedTabIcon focused={focused} color={color} iconName={iconName} />;
                },
            })}
        >
            <Tab.Screen name="Health" component={DashboardHomeScreen} options={{ tabBarLabel: 'Health' }} />
            <Tab.Screen name="Workouts" component={WorkoutsScreen} options={{ tabBarLabel: 'Workouts' }} />
            <Tab.Screen name="Me" component={MeScreen} options={{ tabBarLabel: 'Me' }} />
        </Tab.Navigator>
    );
}

export default function AppNavigator() {
    const { isAuthenticated } = useAuthStore();
    const { isProfileComplete } = useUserStore();

    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: colors.background },
                    animation: 'fade',
                }}
            >
                {!isAuthenticated ? (
                    <Stack.Group>
                        <Stack.Screen name="PhoneAuth" component={PhoneAuthScreen} />
                        <Stack.Screen name="OTPVerify" component={OTPVerifyScreen} />
                    </Stack.Group>
                ) : (
                    <Stack.Group>
                        {!isProfileComplete ? (
                            <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
                        ) : (
                            <>
                                <Stack.Screen name="Dashboard" component={MainTabs} />
                                <Stack.Screen
                                    name="EditProfile"
                                    component={ProfileSetupScreen}
                                    initialParams={{ isEditMode: true }}
                                    options={{ animation: 'slide_from_right' }}
                                />
                            </>
                        )}
                    </Stack.Group>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
