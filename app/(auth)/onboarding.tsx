import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInRight, SlideOutLeft } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RadioGroup, RadioGroupItem } from '~/components/ui/radio-group';
import { Label } from '~/components/ui/label';
import { Auth } from '~/components/Auth.native';

type Step = 'purpose' | 'type' | 'sign-in';

const WebsitePurposeStep = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => {
  const options = [
    {
      value: 'personal',
      label: 'For myself, my business or a friend',
      subtext: 'Personal or small business website',
    },
    {
      value: 'professional',
      label: 'For a client, as a freelancer or an agency',
      subtext: 'Professional web development',
    },
  ];

  return (
    <Animated.View
      className="flex-1 px-6"
      entering={SlideInRight.duration(300)}
      exiting={SlideOutLeft.duration(300)}>
      <Text className="text-4xl font-bold mb-3 text-foreground">
        Who are you creating a website for?
      </Text>
      <Text className="text-xl text-muted-foreground mb-8">Let's get started!</Text>

      <RadioGroup value={value} onValueChange={onChange} className="gap-5">
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            onPress={() => onChange(option.value)}
            className="flex-row items-center p-5 rounded-xl bg-secondary">
            <RadioGroupItem
              value={option.value}
              aria-labelledby={`label-for-${option.value}`}
              className="mr-4"
            />
            <View>
              <Label
                nativeID={`label-for-${option.value}`}
                className="text-xl font-semibold text-foreground mb-1">
                {option.label}
              </Label>
              <Text className="text-base text-muted-foreground">{option.subtext}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </RadioGroup>
    </Animated.View>
  );
};

const WebsiteTypeStep = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => {
  const options = [
    {
      value: 'online-store',
      label: 'Online Store',
      subtext: 'E-commerce and retail websites',
    },
    {
      value: 'portfolio',
      label: 'Portfolio',
      subtext: 'Showcase your work and projects',
    },
    {
      value: 'blog',
      label: 'Blog',
      subtext: 'Share your thoughts and content',
    },
    {
      value: 'business',
      label: 'Business Website',
      subtext: 'Professional company presence',
    },
    {
      value: 'personal',
      label: 'Personal Website',
      subtext: 'Your personal online space',
    },
    {
      value: 'landing',
      label: 'Landing Page',
      subtext: 'Focused conversion page',
    },
  ];

  return (
    <Animated.View
      className="flex-1 px-6"
      entering={SlideInRight.duration(300)}
      exiting={SlideOutLeft.duration(300)}>
      <Text className="text-4xl font-bold mb-3 text-foreground">
        What type of website do you want to create?
      </Text>
      <Text className="text-xl text-muted-foreground mb-8">Select an option below</Text>

      <RadioGroup value={value} onValueChange={onChange} className="gap-5">
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            onPress={() => onChange(option.value)}
            className="flex-row items-center p-5 rounded-xl bg-secondary">
            <RadioGroupItem
              value={option.value}
              aria-labelledby={`label-for-${option.value}`}
              className="mr-4"
            />
            <View>
              <Label
                nativeID={`label-for-${option.value}`}
                className="text-xl font-semibold text-foreground mb-1">
                {option.label}
              </Label>
              <Text className="text-base text-muted-foreground">{option.subtext}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </RadioGroup>
    </Animated.View>
  );
};

const SignInStep = () => {
  return (
    <Animated.View
      className="flex-1 px-6"
      entering={SlideInRight.duration(300)}
      exiting={SlideOutLeft.duration(300)}>
      <Text className="text-4xl font-bold mb-3 text-foreground">Sign in to continue</Text>
      <Text className="text-xl text-muted-foreground mb-8">
        Create an account or sign in to save your progress
      </Text>
      <View className="flex-1" />
    </Animated.View>
  );
};

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>('purpose');
  const [formData, setFormData] = useState({
    purpose: '',
    type: '',
  });

  const steps: Step[] = ['purpose', 'type', 'sign-in'];
  const currentStepIndex = steps.indexOf(currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const handleContinue = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex]);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'purpose':
        return (
          <WebsitePurposeStep
            value={formData.purpose}
            onChange={(value) => setFormData((prev) => ({ ...prev, purpose: value }))}
          />
        );
      case 'type':
        return (
          <WebsiteTypeStep
            value={formData.type}
            onChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}
          />
        );
      case 'sign-in':
        return <SignInStep />;
    }
  };

  const canContinue = () => {
    switch (currentStep) {
      case 'purpose':
        return !!formData.purpose;
      case 'type':
        return !!formData.type;
      default:
        return false;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Progress bar */}
      <View className="px-6 pt-6 pb-8">
        <View className="h-1.5 bg-muted rounded-full overflow-hidden">
          <Animated.View
            className="h-full bg-primary"
            entering={FadeIn}
            style={{ width: `${progress}%` }}
          />
        </View>
      </View>

      {/* Step content */}
      <View className="flex-1">{renderStep()}</View>

      {/* Continue or Sign in button */}
      <View className="px-6 pb-8">
        {currentStep === 'sign-in' ? (
          <Auth />
        ) : (
          <TouchableOpacity
            className={`py-4 rounded-full ${canContinue() ? 'bg-primary' : 'bg-muted'}`}
            onPress={handleContinue}
            disabled={!canContinue()}>
            <Text
              className={`text-center font-semibold text-xl ${
                canContinue() ? 'text-primary-foreground' : 'text-muted-foreground'
              }`}>
              Continue
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}
