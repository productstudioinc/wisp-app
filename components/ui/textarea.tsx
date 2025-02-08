import * as React from 'react';
import {
  TextInput,
  type TextInputProps,
  type NativeSyntheticEvent,
  type TextInputFocusEventData,
} from 'react-native';
import { useBottomSheetInternal } from '@gorhom/bottom-sheet';
import { cn } from '~/lib/utils';

interface TextareaProps extends TextInputProps {
  bottomSheet?: boolean;
}

const Textarea = React.forwardRef<React.ElementRef<typeof TextInput>, TextareaProps>(
  (
    {
      className,
      multiline = true,
      numberOfLines = 4,
      placeholderClassName,
      bottomSheet,
      onFocus,
      onBlur,
      ...props
    },
    ref,
  ) => {
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
          'web:flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base lg:text-sm native:text-lg native:leading-[1.25] text-foreground web:ring-offset-background placeholder:text-muted-foreground web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2',
          props.editable === false && 'opacity-50 web:cursor-not-allowed',
          className,
        )}
        placeholderClassName={cn('text-muted-foreground', placeholderClassName)}
        multiline={multiline}
        numberOfLines={numberOfLines}
        textAlignVertical="top"
        onFocus={handleOnFocus}
        onBlur={handleOnBlur}
        {...props}
      />
    );
  },
);

Textarea.displayName = 'Textarea';

export { Textarea };
