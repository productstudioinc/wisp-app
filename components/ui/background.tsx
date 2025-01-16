import React from 'react';
import { ImageBackground, View } from 'react-native';
import { useColorScheme } from '~/lib/useColorScheme';

interface BackgroundProps {
  children: React.ReactNode;
}

export function Background({ children }: BackgroundProps) {
  const { isDarkColorScheme } = useColorScheme();

  return (
    <ImageBackground
      source={
        isDarkColorScheme
          ? require('~/assets/images/background-dark.webp')
          : require('~/assets/images/background.webp')
      }
      className="flex-1"
      resizeMode="cover"
      imageStyle={{ opacity: 0.6 }}>
      {children}
    </ImageBackground>
  );
}
