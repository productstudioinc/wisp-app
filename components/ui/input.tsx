import * as React from 'react';
import {
  TextInput,
  type TextInputProps,
  type NativeSyntheticEvent,
  type TextInputFocusEventData,
} from 'react-native';
import { useBottomSheetInternal } from '@gorhom/bottom-sheet';
import { cn } from '~/lib/utils';

interface InputProps extends TextInputProps {
  bottomSheet?: boolean;
}

const Input = React.forwardRef<React.ElementRef<typeof TextInput>, InputProps>(
  ({ className, placeholderClassName, bottomSheet, onFocus, onBlur, ...props }, ref) => {
    const bottomSheetInternal = bottomSheet ? useBottomSheetInternal() : null;

    const handleOnFocus = React.useCallback(
      (args: NativeSyntheticEvent<TextInputFocusEventData>) => {
        if (bottomSheet) {
          bottomSheetInternal!.shouldHandleKeyboardEvents.value = true;
        }
        onFocus?.(args);
      },
      [bottomSheet, bottomSheetInternal, onFocus],
    );

    const handleOnBlur = React.useCallback(
      (args: NativeSyntheticEvent<TextInputFocusEventData>) => {
        if (bottomSheet) {
          bottomSheetInternal!.shouldHandleKeyboardEvents.value = false;
        }
        onBlur?.(args);
      },
      [bottomSheet, bottomSheetInternal, onBlur],
    );

    React.useEffect(() => {
      if (bottomSheet) {
        return () => {
          bottomSheetInternal!.shouldHandleKeyboardEvents.value = false;
        };
      }
    }, [bottomSheet, bottomSheetInternal]);

    return (
      <TextInput
        ref={ref}
        className={cn(
          'web:flex h-10 native:min-h-[48px] web:w-full rounded-md border border-input bg-background px-3 py-3 text-base lg:text-sm native:text-lg native:leading-[22px] text-foreground placeholder:text-muted-foreground web:ring-offset-background file:border-0 file:bg-transparent file:font-medium web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2',
          props.editable === false && 'opacity-50 web:cursor-not-allowed',
          className,
        )}
        placeholderClassName={cn('text-muted-foreground', placeholderClassName)}
        onFocus={handleOnFocus}
        onBlur={handleOnBlur}
        {...props}
      />
    );
  },
);

Input.displayName = 'Input';

export { Input };
