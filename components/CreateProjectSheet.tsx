import React, { useCallback, useRef, useState, useMemo, useEffect } from 'react';
import { View, Alert, Platform, Keyboard, Text } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { useFocusEffect } from '@react-navigation/native';
import { useSharedValue } from 'react-native-reanimated';
import { supabase } from '~/supabase/client';
import { useColorScheme } from 'nativewind';
import { Asset } from 'expo-asset';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateAPIUrl } from '~/lib/utils';
import * as ImagePicker from 'expo-image-picker';
import Superwall from '@superwall/react-native-superwall';
import StepHeader from './create-project/StepHeader';
import FirstStep from './create-project/FirstStep';
import LoadingStep from './create-project/LoadingStep';
import * as Crypto from 'expo-crypto';
import { withTiming } from 'react-native-reanimated';
import { Button } from './ui/button';

interface CreateProjectFormData {
  name: string;
  description: string;
  icon: string | null;
  isGeneratingIcon: boolean;
}

interface CreateProjectSheetProps {
  onPresentRef?: (present: () => void) => void;
}

export function CreateProjectSheet({ onPresentRef }: CreateProjectSheetProps) {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [formData, setFormData] = useState<CreateProjectFormData>({
    name: '',
    description: '',
    icon: null,
    isGeneratingIcon: false,
  });
  const progress = useSharedValue(0);
  const { colorScheme } = useColorScheme();

  const snapPoints = useMemo(() => ['80%'], []);

  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  useEffect(() => {
    if (onPresentRef) {
      onPresentRef(handlePresentModalPress);
    }
  }, [onPresentRef, handlePresentModalPress]);

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      resetForm();
    }
  }, []);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.5} />
    ),
    [],
  );

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setFormData({ ...formData, icon: result.assets[0].uri });
    }
  };

  // Reset form when navigating away
  useFocusEffect(
    useCallback(() => {
      return () => {
        bottomSheetModalRef.current?.dismiss();
        resetForm();
      };
    }, []),
  );

  const resetForm = () => {
    progress.value = 0;
    setFormData({
      name: '',
      description: '',
      icon: null,
      isGeneratingIcon: false,
    });
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      if (formData.name.length > 100) {
        throw new Error('Project name must be 100 characters or less');
      }

      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const form = new FormData();
      form.append('name', formData.name);
      form.append('description', formData.description);
      form.append('userId', userData.user.id);

      if (formData.icon) {
        const iconName = formData.icon.split('/').pop() || 'icon.jpg';
        form.append('icon', {
          uri: formData.icon,
          name: iconName,
          type: 'image/jpeg',
        } as any);
      }

      const response = await fetch(generateAPIUrl('/api/projects'), {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: form,
      });

      if (!response.ok) {
        throw new Error('Failed to create project');
      }

      bottomSheetModalRef.current?.dismiss();
      resetForm();
    } catch (error) {
      console.error('Error creating project:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to create project. Please try again.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const canSubmit = () => {
    return !!formData.name && !!formData.description;
  };

  // Load saved form data
  useEffect(() => {
    async function loadSavedForm() {
      try {
        const savedForm = await AsyncStorage.getItem('createProjectForm');
        if (savedForm) {
          setFormData(JSON.parse(savedForm));
        }
      } catch (error) {
        console.error('Failed to load saved form:', error);
      }
    }
    loadSavedForm();
  }, []);

  // Save form data when it changes
  useEffect(() => {
    async function saveForm() {
      try {
        await AsyncStorage.setItem('createProjectForm', JSON.stringify(formData));
      } catch (error) {
        console.error('Failed to save form:', error);
      }
    }
    saveForm();
  }, [formData]);

  // Preload the wand image
  useEffect(() => {
    async function loadWandImage() {
      try {
        const asset = Asset.fromModule(require('~/assets/images/icon-wand.png'));
        await asset.downloadAsync();
        setIsImageLoaded(true);
      } catch (error) {
        console.error('Failed to preload wand image:', error);
      }
    }
    loadWandImage();
  }, []);

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
          <StepHeader step={0} hasGenerated={false} onReset={() => resetForm()} />

          <View style={{ flex: 1 }}>
            <FirstStep
              name={formData.name}
              description={formData.description}
              icon={formData.icon}
              onNameChange={(text) => setFormData((prev) => ({ ...prev, name: text }))}
              onDescriptionChange={(text) =>
                setFormData((prev) => ({ ...prev, description: text }))
              }
              onPickImage={pickImage}
            />
          </View>

          <View className="pb-8">
            <View className="mt-4">
              {isLoading ? (
                <LoadingStep />
              ) : (
                <Button
                  className={`w-full h-[56px] border-2 border-primary/10 rounded-full ${canSubmit() ? 'bg-primary' : 'bg-muted'}`}
                  size="lg"
                  onPress={handleSubmit}
                  disabled={!canSubmit()}>
                  <Text
                    className={`text-center text-lg font-semibold ${
                      canSubmit() ? 'text-primary-foreground' : 'text-muted-foreground'
                    }`}>
                    Create Project
                  </Text>
                </Button>
              )}
            </View>
          </View>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}
