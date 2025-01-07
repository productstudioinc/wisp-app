import { useAuthStore } from "@/stores/auth";
import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";

export default function AppLayout() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (isLoading) return;

    console.log("ok 321");

    if (!isAuthenticated) {
      router.replace("/(auth)/sign-in");
    }
  }, [isAuthenticated, isLoading]);

  return <Stack screenOptions={{ headerShown: false }} />;
}
