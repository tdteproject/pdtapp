import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { Platform, View, Text } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, Easing } from 'react-native-reanimated';

import { useAuthStore } from '@/presentation/state/useAuthStore';
import { useUserStore } from '@/presentation/state/useUserStore';

import PhoneOTPAuthScreen from '@/presentation/screens/AuthScreen/PhoneOTPAuthScreen';
import ProfileSetupScreen from '@/presentation/screens/ProfileScreen/ProfileSetupScreen';
import DashboardHomeScreen from '@/presentation/screens/DashboardScreen/DashboardHomeScreen';
import WorkoutsScreen from '@/presentation/screens/WorkoutsScreen/WorkoutsScreen';
import MeScreen from '@/presentation/screens/MeScreen/MeScreen';

import { colors } from '@/presentation/themes/colors';
import { fontFamily, fontSize } from '@/presentation/themes/typography';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TAB_ICONS: Record<string, string> = {
  Health: 'favorite',
  Workouts: 'directions-run',
  Me: 'account-circle',
};

const AnimatedTabIcon = ({ focused, color, iconName }: { focused: boolean; color: string; iconName: string }) => {
  const scale = useSharedValue(1);

  React.useEffect(() => {
    if (focused) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.08, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
          withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      );
    } else {
      scale.value = withTiming(1, { duration: 300 });
    }
  }, [focused]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          alignItems: 'center',
          justifyContent: 'center',
          width: 32,
          height: 32,
          borderRadius: 10,
          backgroundColor: focused ? colors.primary.subtle : 'transparent',
        },
        animatedStyle,
      ]}
    >
      <MaterialIcons name={iconName as any} size={20} color={color} />
    </Animated.View>
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
          fontSize: fontSize.xs,
          marginBottom: Platform.OS === 'android' ? 6 : 0,
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
          paddingTop: 6,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.2,
          shadowRadius: 10,
          elevation: 10,
          borderWidth: 1,
          borderColor: colors.border,
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
      <Tab.Screen
        name="Health"
        component={DashboardHomeScreen}
        options={{ tabBarLabel: 'Health' }}
      />
      <Tab.Screen
        name="Workouts"
        component={WorkoutsScreen}
        options={{ tabBarLabel: 'Workouts' }}
      />
      <Tab.Screen
        name="Me"
        component={MeScreen}
        options={{ tabBarLabel: 'Me' }}
      />
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
          <Stack.Screen name="Auth" component={PhoneOTPAuthScreen} />
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
