import { Stack } from 'expo-router';
import { ThemeToggle } from '~/components/ThemeToggle';

export default function AppLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
