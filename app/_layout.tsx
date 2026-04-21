import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { getCurrentUser } from '@/utils/auth';
import { initDb } from '../drizzle/init';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [currentUserId, setCurrentUserId] = useState<number | null | undefined>(undefined);

  useEffect(() => {
    initDb();
    loadCurrentUser();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCurrentUser();
    }, [])
  );

  const loadCurrentUser = async () => {
    const userId = await getCurrentUser();
    setCurrentUserId(userId);
  };

  if (currentUserId === undefined) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        {currentUserId ? (
          <>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="applications/add" options={{ title: 'Add Application' }} />
            <Stack.Screen name="applications/[id]" options={{ title: 'Application Details' }} />
            <Stack.Screen name="applications/edit/[id]" options={{ title: 'Edit Application' }} />
            <Stack.Screen name="categories/add" options={{ title: 'Add Category' }} />
            <Stack.Screen name="status/add" options={{ title: 'Add Status Update' }} />
            <Stack.Screen name="targets/index" options={{ title: 'Targets' }} />
            <Stack.Screen name="targets/add" options={{ title: 'Add Target' }} />
            <Stack.Screen name="insights/index" options={{ title: 'Insights' }} />
          </>
        ) : (
          <>
            <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)/register" options={{ headerShown: false }} />
          </>
        )}
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}