import React from 'react';
import { StyleSheet, View } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { easeGradient } from 'react-native-easing-gradient';

interface GradientBlurProps {
  children: React.ReactNode;
  height?: number;
  intensity?: number;
}

export function GradientBlur({ children, height = 200, intensity = 50 }: GradientBlurProps) {
  const { colors, locations } = easeGradient({
    colorStops: {
      0: { color: 'transparent' },
      0.3: { color: 'rgba(0,0,0,0.3)' },
      0.6: { color: 'rgba(0,0,0,0.7)' },
      1: { color: 'black' },
    },
  });

  return (
    <View style={[styles.container, { height }]}>
      <MaskedView
        style={StyleSheet.absoluteFill}
        maskElement={
          <LinearGradient
            locations={[0, 0.3, 0.6, 1] as const}
            colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)', 'black'] as const}
            style={StyleSheet.absoluteFill}
          />
        }>
        <BlurView intensity={intensity} style={StyleSheet.absoluteFill} />
      </MaskedView>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 2,
  },
});
