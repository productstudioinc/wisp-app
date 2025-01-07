import { useAuthStore } from "@/stores/auth";
import { useRouter } from "expo-router";
import { Text, View } from "react-native";

export default function SignInScreen() {
  const router = useRouter();
  const { signIn } = useAuthStore();

  const handleSignIn = async () => {
    await signIn("your-auth-token");
    router.replace("/(tabs)");
  };

  return (
    <View>
      <Text>Sign In</Text>
    </View>
  );
}
