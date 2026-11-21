import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppColors } from '@/constants/colors';
import { HabitsProvider, useHabits } from '@/context/habits-context';

SplashScreen.preventAutoHideAsync().catch(() => {});

function SplashGate() {
  const { status } = useHabits();
  useEffect(() => {
    if (status !== 'loading') SplashScreen.hideAsync().catch(() => {});
  }, [status]);
  return null;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <HabitsProvider>
        <SplashGate />
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            contentStyle: { backgroundColor: AppColors.background },
            headerStyle: { backgroundColor: AppColors.background },
            headerTintColor: AppColors.accent,
            headerTitleStyle: { color: AppColors.text, fontWeight: '700', fontSize: 17 },
            headerShadowVisible: false,
          }}>
          <Stack.Screen name="index" options={{ headerShown: false, title: 'Habit Streaks' }} />
          <Stack.Screen name="habit/[id]" options={{ title: 'Habit details' }} />
        </Stack>
      </HabitsProvider>
    </SafeAreaProvider>
  );
}
