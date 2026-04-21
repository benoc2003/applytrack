import AsyncStorage from '@react-native-async-storage/async-storage';

const CURRENT_USER_KEY = 'currentUserId';

export async function saveCurrentUser(userId: number) {
  await AsyncStorage.setItem(CURRENT_USER_KEY, String(userId));
}

export async function getCurrentUser() {
  const value = await AsyncStorage.getItem(CURRENT_USER_KEY);
  return value ? Number(value) : null;
}

export async function clearCurrentUser() {
  await AsyncStorage.removeItem(CURRENT_USER_KEY);
}