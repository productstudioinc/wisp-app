import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  Linking,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

type OnboardingStep = {
  title: string;
  description: string;
  icon: React.ReactNode;
};

const onboardingSteps: OnboardingStep[] = [
  {
    title: "Website Creation",
    description:
      "Create beautiful mobile-optimized websites in minutes using AI",
    icon: <MaterialIcons name="web" size={24} className="text-blue-500" />,
  },
  {
    title: "AI-Powered Design",
    description:
      "Let AI generate stunning layouts and designs tailored to your needs",
    icon: (
      <MaterialIcons name="auto-awesome" size={24} className="text-blue-500" />
    ),
  },
  {
    title: "Mobile Optimization",
    description:
      "Your website will look and work perfectly on all mobile devices",
    icon: (
      <MaterialIcons name="phone-iphone" size={24} className="text-blue-500" />
    ),
  },
];

export default function WelcomeScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();

  const handleContinue = async () => {
    try {
      await AsyncStorage.setItem("onboarding_complete", "true");
      router.push("/onboarding");
    } catch (error) {
      console.error("Error saving onboarding status:", error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="mx-auto w-full flex-1 justify-between px-8 py-4">
        <Animated.View
          className="pt-16"
          entering={FadeInDown.delay(0).duration(1000).springify()}
        >
          <Animated.Text
            className="text-3xl font-black text-left mb-1"
            entering={FadeInDown.delay(300).duration(1000).springify()}
          >
            Welcome to
          </Animated.Text>
          <Animated.Text
            className="text-6xl font-black text-left text-[#007AFF]"
            entering={FadeInDown.delay(600).duration(1000).springify()}
          >
            Wisp AI
          </Animated.Text>
        </Animated.View>

        <View className="gap-12 py-12">
          {onboardingSteps.map((step) => (
            <View key={step.title} className="flex-row items-start gap-6">
              <View className="w-10 items-center justify-center">
                {step.icon}
              </View>
              <View className="flex-1">
                <Text className="text-xl font-semibold mb-1">{step.title}</Text>
                <Text className="text-base text-gray-500 leading-5">
                  {step.description}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View className="gap-6 pb-8">
          <View className="items-center">
            <MaterialIcons name="people" size={24} color="black" />
            <Text className="pt-2 text-center text-[15px] text-gray-500">
              By pressing continue, you agree to our{" "}
              <Text className="text-black" onPress={() => Linking.openURL("#")}>
                Terms of Service
              </Text>{" "}
              and that you have read our{" "}
              <Text className="text-black" onPress={() => Linking.openURL("#")}>
                Privacy Policy
              </Text>
            </Text>
          </View>

          <TouchableOpacity
            className="bg-black py-4 rounded-full"
            onPress={handleContinue}
          >
            <Text className="text-white text-center font-semibold text-[17px]">
              Continue
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
