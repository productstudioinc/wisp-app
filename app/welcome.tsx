import { cssInterop } from 'nativewind';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, Linking, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

type OnboardingStep = {
  title: string;
  description: string;
  icon: React.ReactNode;
};

cssInterop(MaterialIcons, {
  className: {
    target: 'style',
  },
});

const onboardingSteps: OnboardingStep[] = [
  {
    title: 'Describe Your Dream App',
    description:
      'Tell us your idea - from romantic games to personal planners - and watch it come to life',
    icon: <MaterialIcons name="lightbulb" className="text-primary" size={24} />,
  },
  {
    title: 'AI Creates Your Design',
    description: 'Our AI transforms your vision into a beautiful, professional app in minutes',
    icon: <MaterialIcons name="auto-awesome-motion" className="text-primary" size={24} />,
  },
  {
    title: 'Share With Anyone',
    description: 'Your app works perfectly on all devices - ready to surprise and delight',
    icon: <MaterialIcons name="share" className="text-primary" size={24} />,
  },
];

export default function WelcomeScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();

  const handleContinue = async () => {
    try {
      await AsyncStorage.setItem('onboarding_complete', 'true');
      router.push('/onboarding');
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-primary-background">
      <View className="mx-auto w-full flex-1 justify-between px-8">
        <Animated.View className="pt-16" entering={FadeInDown.delay(0).duration(1000).springify()}>
          <Animated.Text
            className="text-3xl font-black text-left mb-1 text-primary"
            entering={FadeInDown.delay(300).duration(1000).springify()}>
            Welcome to
          </Animated.Text>
          <Animated.Text
            className="text-6xl font-black text-left text-primary"
            entering={FadeInDown.delay(600).duration(1000).springify()}>
            Wisp AI
          </Animated.Text>
        </Animated.View>

        <View className="gap-12 py-12">
          {onboardingSteps.map((step) => (
            <View key={step.title} className="flex-row items-start gap-6">
              <View className="w-10 items-center justify-center">{step.icon}</View>
              <View className="flex-1">
                <Text className="text-xl font-semibold mb-1 text-foreground">{step.title}</Text>
                <Text className="text-base text-muted-foreground leading-5">
                  {step.description}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View className="gap-6 pb-8">
          <View className="items-center">
            <MaterialIcons name="people" className="text-primary" size={24} />
            <Text className="pt-2 text-center text-[15px] text-muted-foreground">
              By pressing continue, you agree to our{' '}
              <Text className="text-foreground" onPress={() => Linking.openURL('#')}>
                Terms of Service
              </Text>{' '}
              and that you have read our{' '}
              <Text className="text-foreground" onPress={() => Linking.openURL('#')}>
                Privacy Policy
              </Text>
            </Text>
          </View>

          <TouchableOpacity className="bg-primary py-4 rounded-full" onPress={handleContinue}>
            <Text className="text-primary-foreground text-center font-semibold text-[17px]">
              Continue
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
