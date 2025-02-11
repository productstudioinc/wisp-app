import React, { useCallback, useRef, useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { useColorScheme } from 'nativewind';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { generateAPIUrl } from '~/lib/utils';
import { supabase } from '~/supabase/client';

interface EditProjectSheetProps {
  onPresentRef?: (present: () => void) => void;
  projectId?: string;
}

export function EditProjectSheet({ onPresentRef, projectId }: EditProjectSheetProps) {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const promptRef = useRef<string>('');
  const { colorScheme } = useColorScheme();
  const [isLoading, setIsLoading] = useState(false);

  const snapPoints = React.useMemo(() => ['60%'], []);

  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  React.useEffect(() => {
    if (onPresentRef) {
      onPresentRef(handlePresentModalPress);
    }
  }, [onPresentRef, handlePresentModalPress]);

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      promptRef.current = '';
    }
  }, []);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.5} />
    ),
    [],
  );

  const handleSubmit = async () => {
    if (!projectId || !promptRef.current.trim()) return;

    try {
      setIsLoading(true);

      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const form = new FormData();
      form.append('description', promptRef.current);
      form.append('userId', userData.user.id);

      const response = await fetch(generateAPIUrl(`/api/projects/${projectId}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: form,
      });

      if (!response.ok) {
        throw new Error('Failed to update project');
      }

      bottomSheetModalRef.current?.dismiss();
      promptRef.current = '';
    } catch (error) {
      console.error('Error updating project:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to update project. Please try again.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose
      enableDynamicSizing={false}
      backdropComponent={renderBackdrop}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      backgroundStyle={{
        backgroundColor: colorScheme === 'dark' ? 'hsl(240 10% 3.9%)' : 'hsl(0 0% 100%)',
      }}
      handleIndicatorStyle={{
        backgroundColor: colorScheme === 'dark' ? 'hsl(240 5% 64.9%)' : 'hsl(240 3.8% 46.1%)',
        width: 32,
        height: 4,
        marginTop: 8,
      }}>
      <BottomSheetView style={{ flex: 1 }} className="pt-4">
        <View className="flex-1 px-6">
          <View className="mb-4">
            <Text className="text-lg font-semibold text-foreground mb-1">Edit Your App</Text>
            <Text className="text-base text-muted-foreground">
              Describe how you'd like to change your app, and our AI will help redesign it.
            </Text>
          </View>

          <Textarea
            defaultValue=""
            onChangeText={(text) => (promptRef.current = text)}
            placeholder="Make it more minimalist, add a dark theme, or change the color scheme to be more vibrant"
            className="flex-1 mb-8"
          />

          <View className="pb-8">
            <Button
              className="w-full h-[56px] rounded-full"
              disabled={isLoading}
              onPress={handleSubmit}>
              <Text className="text-lg font-semibold text-primary-foreground">
                {isLoading ? 'Updating...' : 'Update'}
              </Text>
            </Button>
          </View>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}
