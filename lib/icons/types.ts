import { SvgProps } from 'react-native-svg';

export interface IconProps extends Omit<SvgProps, 'width' | 'height'> {
  size?: number;
  className?: string;
}
