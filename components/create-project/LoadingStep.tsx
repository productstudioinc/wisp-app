import React from 'react';
import { View } from 'react-native';
import { Text } from '~/components/ui/text';
import { Image } from 'expo-image';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  withSpring,
} from 'react-native-reanimated';

interface LoadingStepProps {
  isImageLoaded: boolean;
}

export default function LoadingStep({ isImageLoaded }: LoadingStepProps) {
  const floatingAnimation = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: withRepeat(
            withSequence(
              withSpring(-10, { damping: 8, stiffness: 100 }),
              withSpring(0, { damping: 8, stiffness: 100 }),
            ),
            -1,
            true,
          ),
        },
      ],
    };
  });

  const fadeInAnimation = useAnimatedStyle(() => {
    return {
      opacity: withTiming(1, { duration: 200 }),
      transform: [
        {
          translateY: withTiming(0, {
            duration: 200,
          }),
        },
      ],
    };
  });

  return (
    <View className="flex-1 justify-center items-center">
      <Animated.View style={[floatingAnimation]} className="items-center">
        <Image
          source="icon-wand"
          className="w-16 h-16"
          contentFit="contain"
          cachePolicy="memory-disk"
          transition={200}
        />
      </Animated.View>
      <Animated.View style={fadeInAnimation} className="mt-6">
        <Text className="text-xl font-medium text-center">Personalizing your app...</Text>
        <Text className="text-base text-muted-foreground text-center mt-2">
          This will take just a moment
        </Text>
      </Animated.View>
    </View>
  );
}
