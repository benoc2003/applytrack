import { useColorScheme } from '@/hooks/use-color-scheme';
import { appColors, AppThemeMode } from '@/utils/app-theme';
import { getThemePreference } from '@/utils/theme';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

export function useAppTheme() {
  const systemColorScheme = useColorScheme();
  const [savedTheme, setSavedTheme] = useState<AppThemeMode | null>(null);

  const loadTheme = async () => {
    const theme = await getThemePreference();
    setSavedTheme(theme);
  };

  useEffect(() => {
    loadTheme();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTheme();
    }, [])
  );

  const mode: AppThemeMode =
    savedTheme === 'dark'
      ? 'dark'
      : savedTheme === 'light'
      ? 'light'
      : systemColorScheme === 'dark'
      ? 'dark'
      : 'light';

  return {
    mode,
    colors: appColors[mode],
  };
}