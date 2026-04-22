import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = 'themePreference';

export type ThemePreference = 'light' | 'dark';

export async function saveThemePreference(theme: ThemePreference) {
  await AsyncStorage.setItem(THEME_KEY, theme);
}

export async function getThemePreference(): Promise<ThemePreference | null> {
  const value = await AsyncStorage.getItem(THEME_KEY);
  if (value === 'light' || value === 'dark') {
    return value;
  }
  return null;
}