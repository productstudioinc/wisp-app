import React from 'react';
import { View } from 'react-native';
import { Text } from '~/components/ui/text';
import { Image } from 'expo-image';
import Animated, {
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  useAnimatedStyle,
} from 'react-native-reanimated';

interface LoadingStepProps {
  isImageLoaded: boolean;
}

export default function LoadingStep({ isImageLoaded }: LoadingStepProps) {
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
    <View className="flex-1 items-center justify-center px-6">
      <View className="items-center space-y-4 -mt-20">
        <Animated.View style={floatingStyle}>
          {isImageLoaded && (
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
          )}
        </Animated.View>
        <View className="justify-center">
          <View className="items-center">
            <Text className="text-2xl font-medium text-foreground text-center">
              Analyzing your idea...
            </Text>
            <Text className="text-base text-muted-foreground mt-2 text-center max-w-[280]">
              I'm thinking about what additional details we'll need to make your perfect app
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
