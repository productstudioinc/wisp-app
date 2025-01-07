import { useAuthStore } from "@/stores/auth";
import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";

export default function AuthLayout() {
  const router = useRouter();
  const { isAuthenticated, isOnboardingComplete, isLoading } = useAuthStore();

  useEffect(() => {
    if (isLoading) return;

    console.log("ok 123");

    if (isAuthenticated) {
      router.replace("/(tabs)");
    } else if (!isOnboardingComplete) {
      router.replace("/(auth)/onboarding");
    }
  }, [isAuthenticated, isOnboardingComplete, isLoading]);

  return <Stack screenOptions={{ headerShown: false }} />;
}
