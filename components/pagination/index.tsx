import { type StyleProp, View, type ViewStyle } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';

import React from 'react';
import { DotStyle, PaginationItem } from './item';

export interface BasicProps<T> {
  progress: SharedValue<number>;
  horizontal?: boolean;
  data: Array<T>;
  renderItem?: (item: T, index: number) => React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  dotStyle?: DotStyle;
  activeDotStyle?: DotStyle;
  dotClassName?: string;
  activeDotClassName?: string;
  size?: number;
  onPress?: (index: number) => void;
}

export const Pagination = <T extends {}>(props: BasicProps<T>) => {
  const {
    activeDotStyle,
    dotStyle,
    progress,
    horizontal = true,
    data,
    size,
    containerStyle,
    renderItem,
    onPress,
    dotClassName,
    activeDotClassName,
  } = props;

  if (
    typeof size === 'string' ||
    typeof dotStyle?.width === 'string' ||
    typeof dotStyle?.height === 'string'
  )
    throw new Error('size/width/height must be a number');

  return (
    <View
      style={[
        {
          justifyContent: 'space-between',
          alignSelf: 'center',
        },
        horizontal
          ? {
              flexDirection: 'row',
            }
          : {
              flexDirection: 'column',
            },
        containerStyle,
      ]}>
      {data.map((item, index) => {
        return (
          <PaginationItem
            key={index}
            index={index}
            size={size}
            count={data.length}
            dotStyle={dotStyle}
            animValue={progress}
            horizontal={!horizontal}
            activeDotStyle={activeDotStyle}
            dotClassName={dotClassName}
            activeDotClassName={activeDotClassName}
            onPress={() => onPress?.(index)}>
            {renderItem?.(item, index)}
          </PaginationItem>
        );
      })}
    </View>
  );
};
