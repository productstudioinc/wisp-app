import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { default as React, useEffect, useRef, useState } from 'react';
import { Dimensions, Text, TouchableOpacity, View } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Carousel, { ICarouselInstance } from 'react-native-reanimated-carousel';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pagination } from '~/components/pagination';

const { width } = Dimensions.get('window');
type OnboardingStep = {
  type: 'welcome' | 'introduction' | 'describe' | 'loading' | 'success';
  component: React.ComponentType;
};

const FloatingImage = () => {
  const floatAnim = useSharedValue(0);
  const rotateAnim = useSharedValue(0);

  React.useEffect(() => {
    floatAnim.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );

    rotateAnim.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );

    return () => {
      floatAnim.value = 0;
      rotateAnim.value = 0;
    };
  }, []);

  const floatingStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: floatAnim.value * -15 },
        { rotate: `${(rotateAnim.value - 0.5) * 6}deg` },
      ],
    };
  });

  return (
    <Animated.View style={floatingStyle}>
      <View className="shadow-lg shadow-primary/20">
        <Image
          source={require('~/assets/images/icon-wand.png')}
          style={{
            width: 256,
            height: 128,
          }}
          contentFit="contain"
          cachePolicy="memory-disk"
          transition={300}
        />
      </View>
    </Animated.View>
  );
};

const WelcomeStep = () => {
  return (
    <View className="flex-1 px-6 justify-center items-center">
      <FloatingImage />
      <Text className="text-5xl font-bold mb-4 text-foreground text-center">
        Welcome to Wisp AI
      </Text>
      <Text className="text-xl text-muted-foreground text-center">
        Let's build something amazing together
      </Text>
    </View>
  );
};

const IntroductionStep = () => {
  return (
    <View className="flex-1 px-6">
      <Text className="text-4xl font-bold mb-4 text-foreground text-center">
        Wisp AI turns your ideas into apps
      </Text>
      <Text className="text-base text-muted-foreground text-center">Here's how it works...</Text>
    </View>
  );
};

const DescribeStep = () => {
  const [displayText, setDisplayText] = useState('');
  const fullText = 'I want to build a workout tracking app.';

  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setDisplayText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <View className="flex-1 px-6">
      <View className="flex-row items-center mb-6">
        <View className="w-10 h-10 bg-primary rounded-full items-center justify-center mr-3">
          <Text className="text-primary-foreground text-lg font-bold">1</Text>
        </View>
        <Text className="text-4xl font-bold text-foreground">Describe Your App</Text>
      </View>

      <Text className="text-lg text-muted-foreground mb-8">
        Tell us about the app you want to build. Be as descriptive as possible.
      </Text>

      <View className="bg-secondary/50 rounded-lg p-4 h-40">
        <Text className="text-muted-foreground">
          {displayText}
          <Text className="text-foreground">|</Text>
        </Text>
      </View>
    </View>
  );
};

const LoadingStep = () => {
  return (
    <View className="flex-1 px-6">
      <View className="flex-row items-center mb-6">
        <View className="w-10 h-10 bg-primary rounded-full items-center justify-center mr-3">
          <Text className="text-primary-foreground text-lg font-bold">2</Text>
        </View>
        <Text className="text-4xl font-bold text-foreground">Building Your App</Text>
      </View>

      <Text className="text-lg text-muted-foreground mb-8">
        Our AI takes your description and creates your app. This process takes a few moments.
      </Text>

      <View className="bg-secondary/50 rounded-lg p-6 space-y-4">
        <Animated.View
          className="flex-row items-center"
          entering={FadeInDown.delay(0).duration(500).springify()}>
          <MaterialIcons name="psychology" size={24} className="text-primary mr-3" />
          <Text className="text-muted-foreground">Thinking about how to make app</Text>
        </Animated.View>
        <Animated.View
          className="flex-row items-center"
          entering={FadeInDown.delay(500).duration(500).springify()}>
          <MaterialIcons name="code" size={24} className="text-primary mr-3" />
          <Text className="text-muted-foreground">Writing code for your app</Text>
        </Animated.View>
        <Animated.View
          className="flex-row items-center"
          entering={FadeInDown.delay(1000).duration(500).springify()}>
          <MaterialIcons name="rocket-launch" size={24} className="text-primary mr-3" />
          <Text className="text-muted-foreground">Deploying your app to the real world</Text>
        </Animated.View>
      </View>
    </View>
  );
};

const SuccessStep = () => {
  return (
    <View className="flex-1 px-6">
      <View className="flex-row items-center mb-6">
        <View className="w-10 h-10 bg-primary rounded-full items-center justify-center mr-3">
          <Text className="text-primary-foreground text-lg font-bold">3</Text>
        </View>
        <Text className="text-4xl font-bold text-foreground">Success!</Text>
      </View>

      <Text className="text-lg text-muted-foreground mb-8">
        Congratulations! Your app is now live in the real world!
      </Text>

      <ConfettiCannon
        count={50}
        origin={{ x: -0, y: 0 }}
        autoStart={true}
        autoStartDelay={1000}
        fadeOut={true}
      />
    </View>
  );
};

const onboardingSteps: OnboardingStep[] = [
  {
    type: 'welcome',
    component: WelcomeStep,
  },
  {
    type: 'introduction',
    component: IntroductionStep,
  },
  {
    type: 'describe',
    component: DescribeStep,
  },
  {
    type: 'loading',
    component: LoadingStep,
  },
  {
    type: 'success',
    component: SuccessStep,
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
      router.push('/(app)/(tabs)/projects');
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
      <View className="flex-1">
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
            height={Dimensions.get('window').height - 180} // Reduced height to make room for button
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
      </View>

      <View className="px-6 py-4">
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
