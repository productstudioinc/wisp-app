import React, { useCallback, useRef } from 'react';
import { View, TouchableOpacity, Dimensions } from 'react-native';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { Upload } from '~/lib/icons/Upload';
import { Image } from 'expo-image';
import Carousel from 'react-native-reanimated-carousel';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Math.min(SCREEN_WIDTH - 96, 280); // Smaller width with max of 280
const CARD_HEIGHT = (CARD_WIDTH * 4) / 3; // 3:4 aspect ratio

interface ImageStackProps {
  images: string[];
  onReorder: (newImages: string[]) => void;
  onAddImages: () => void;
}

export default function ImageStack({ images, onReorder, onAddImages }: ImageStackProps) {
  const carouselRef = useRef(null);

  const renderItem = useCallback(({ item: uri, index }: { item: string; index: number }) => {
    return (
      <View
        style={{
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          borderRadius: 20,
          overflow: 'hidden',
          backgroundColor: 'white',
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 8,
        }}>
        <Image
          source={{ uri }}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          contentPosition="top"
          transition={300}
        />
      </View>
    );
  }, []);

  return (
    <View className="h-[320] items-center justify-center">
      {images.length > 0 ? (
        <>
          <Carousel
            ref={carouselRef}
            loop
            width={CARD_WIDTH}
            height={CARD_HEIGHT}
            autoPlay={false}
            data={images}
            renderItem={renderItem}
            mode="horizontal-stack"
            modeConfig={{
              snapDirection: 'left',
              stackInterval: 12,
            }}
            customConfig={() => ({ type: 'positive', viewCount: 3 })}
          />
          <View className="absolute -bottom-16 left-0 right-0 flex-row justify-center space-x-2">
            <Button onPress={onAddImages} variant="outline" className="h-10 px-4 rounded-full">
              <Upload size={18} className="mr-2 text-foreground" />
              <Text className="text-base">Add More</Text>
            </Button>
          </View>
        </>
      ) : (
        <TouchableOpacity
          onPress={onAddImages}
          className="w-full h-[280] rounded-2xl bg-muted/50 justify-center items-center border border-border">
          <View className="items-center space-y-4">
            <View className="w-16 h-16 rounded-full bg-muted justify-center items-center">
              <Upload size={32} className="text-muted-foreground" />
            </View>
            <View className="items-center space-y-1">
              <Text className="text-lg font-medium text-foreground">Add images</Text>
            </View>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}
