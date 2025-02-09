import React, { useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  SharedValue,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

interface PageTransitionProps {
  children: React.ReactNode;
  isActive: boolean;
  transitionValue: SharedValue<number>;
  index: number;
}

export function PageTransition({
  children,
  isActive,
  transitionValue,
  index,
}: PageTransitionProps) {
  const isFirstRender = useRef(true);

  useEffect(() => {
    isFirstRender.current = false;
  }, []);

  const animatedStyles = useAnimatedStyle(() => {
    const position = interpolate(
      transitionValue.value,
      [index - 1, index, index + 1],
      [100, 0, -100],
      Extrapolate.CLAMP,
    );

    const opacity = interpolate(
      transitionValue.value,
      [index - 0.5, index, index + 0.5],
      [0, 1, 0],
      Extrapolate.CLAMP,
    );

    if (isFirstRender.current && index === 0) {
      return {
        transform: [{ translateX: 0 }],
        opacity: 1,
        position: 'absolute',
        width: '100%',
        height: '100%',
        display: isActive ? 'flex' : 'none',
      };
    }

    return {
      transform: [{ translateX: withTiming(position, { duration: 200 }) }],
      opacity: withTiming(opacity, { duration: 200 }),
      position: 'absolute',
      width: '100%',
      height: '100%',
      display: isActive ? 'flex' : 'none',
    };
  });

  return <Animated.View style={[styles.page, animatedStyles]}>{children}</Animated.View>;
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
});
