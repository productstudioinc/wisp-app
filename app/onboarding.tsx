import { Pagination } from '~/components/pagination';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Dimensions, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import Carousel, { ICarouselInstance } from 'react-native-reanimated-carousel';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RadioGroup, RadioGroupItem } from '~/components/ui/radio-group';
import { Label } from '~/components/ui/label';
import { Input } from '~/components/ui/input';

const { width } = Dimensions.get('window');
type OnboardingStep = {
  type: 'website-purpose' | 'website-type';
  component: React.ComponentType;
};

const WebsitePurposeStep = () => {
  const [value, setValue] = useState('');

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
    <View className="flex-1 px-6">
      <Text className="text-4xl font-bold mb-2 text-foreground">
        Who are you creating a website for?
      </Text>
      <Text className="text-lg text-muted-foreground mb-8">Let's get started!</Text>

      <RadioGroup value={value} onValueChange={setValue} className="gap-4">
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            onPress={() => setValue(option.value)}
            className="flex-row items-center p-4 rounded-xl bg-secondary">
            <RadioGroupItem
              value={option.value}
              aria-labelledby={`label-for-${option.value}`}
              className="mr-4"
            />
            <View>
              <Label
                nativeID={`label-for-${option.value}`}
                className="text-lg font-semibold text-foreground">
                {option.label}
              </Label>
              <Text className="text-muted-foreground">{option.subtext}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </RadioGroup>
    </View>
  );
};

const WebsiteTypeStep = () => {
  const [value, setValue] = useState('');
  const [inputText, setInputText] = useState('');

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

  const handleOptionSelect = (optionValue: string) => {
    setValue(optionValue);
    const selectedOption = options.find((opt) => opt.value === optionValue);
    if (selectedOption) {
      setInputText(selectedOption.label);
    }
  };

  const handleInputChange = (text: string) => {
    setInputText(text);
    setValue(text);
  };

  return (
    <View className="flex-1 px-6">
      <Text className="text-4xl font-bold mb-2 text-foreground">
        What type of website do you want to create?
      </Text>
      <Text className="text-lg text-muted-foreground mb-8">Type or select an option below</Text>

      <View className="mb-8">
        <Input
          placeholder="Enter website type..."
          value={inputText}
          onChangeText={handleInputChange}
          aria-labelledby="websiteTypeInput"
        />
      </View>

      <RadioGroup value={value} onValueChange={handleOptionSelect} className="gap-4">
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            onPress={() => handleOptionSelect(option.value)}
            className="flex-row items-center p-4 rounded-xl bg-secondary">
            <RadioGroupItem
              value={option.value}
              aria-labelledby={`label-for-${option.value}`}
              className="mr-4"
            />
            <View>
              <Label
                nativeID={`label-for-${option.value}`}
                className="text-lg font-semibold text-foreground">
                {option.label}
              </Label>
              <Text className="text-muted-foreground">{option.subtext}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </RadioGroup>
    </View>
  );
};

const onboardingSteps: OnboardingStep[] = [
  {
    type: 'website-purpose',
    component: WebsitePurposeStep,
  },
  {
    type: 'website-type',
    component: WebsiteTypeStep,
  },
];

export default function WelcomeScreen() {
  const progress = useSharedValue<number>(0);
  const router = useRouter();
  const CAROUSEL_WIDTH = width - 32;
  const carouselRef = useRef<ICarouselInstance>(null);

  const renderItem = ({ item }: { item: OnboardingStep }) => {
    const StepComponent = item.component;
    return <StepComponent />;
  };

  const handleContinue = async () => {
    try {
      await AsyncStorage.setItem('onboarding_complete', 'true');
      router.push('/(tabs)');
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
  };

  const onPressPagination = (index: number) => {
    console.log(index, progress);
    carouselRef.current?.scrollTo({
      count: index - progress.value,
      animated: true,
    });
  };

  console.log(Math.floor(width / onboardingSteps.length));

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="items-center mt-4 pb-12">
        <Pagination
          progress={progress}
          data={onboardingSteps}
          dotStyle={{
            width: Math.floor(width / onboardingSteps.length) - 10,
            height: 4,
          }}
          dotClassName="bg-muted"
          activeDotClassName="bg-primary"
          activeDotStyle={{
            width: Math.floor(width / onboardingSteps.length) - 10,
            height: 4,
          }}
          containerStyle={{
            gap: 10,
          }}
          horizontal
          onPress={onPressPagination}
        />
      </View>
      <View className="flex-1">
        <Carousel
          ref={carouselRef}
          data={onboardingSteps}
          height={Dimensions.get('window').height}
          width={width}
          loop={false}
          pagingEnabled={true}
          snapEnabled={true}
          onProgressChange={(_: any, absoluteProgress: number) => {
            progress.value = absoluteProgress;
          }}
          renderItem={renderItem}
          defaultIndex={0}
        />
      </View>

      <View className="px-6 pb-8">
        <TouchableOpacity
          className="bg-primary py-4 rounded-full"
          onPress={() => {
            if (progress.value < onboardingSteps.length - 1) {
              carouselRef.current?.scrollTo({
                count: 1,
                animated: true,
              });
            } else {
              handleContinue();
            }
          }}>
          <Text className="text-primary-foreground text-center font-semibold text-lg">
            {progress.value < onboardingSteps.length - 1 ? 'Next' : 'Continue'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
