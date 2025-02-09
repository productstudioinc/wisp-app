import React from 'react';
import { View } from 'react-native';
import { Text } from '~/components/ui/text';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  withSpring,
} from 'react-native-reanimated';

export default function LoadingStep() {
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
      <Animated.View style={fadeInAnimation} className="mt-6">
        <Text className="text-xl font-medium text-center">Creating your project...</Text>
        <Text className="text-base text-muted-foreground text-center mt-2">
          This will take just a moment
        </Text>
      </Animated.View>
    </View>
  );
}
