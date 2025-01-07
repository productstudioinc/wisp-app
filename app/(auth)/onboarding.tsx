import { useAuthStore } from "@/stores/auth";
import { useRouter } from "expo-router";
import { Text, View } from "react-native";

export default function OnboardingScreen() {
  const router = useRouter();
  const { setOnboardingComplete } = useAuthStore();

  const handleComplete = async () => {
    await setOnboardingComplete();
    router.replace("/(auth)/sign-in");
  };

  return (
    <View>
      <Text>Onboarding</Text>
    </View>
  );
}
