import React, { useCallback, useRef, useState, useMemo } from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Text } from '~/components/ui/text';
import { useSharedValue } from 'react-native-reanimated';
import { Pagination } from '~/components/pagination';
import { supabase } from '~/supabase/client';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { useFocusEffect } from '@react-navigation/native';
import Animated, { SlideInRight, SlideOutLeft } from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import { Upload } from '~/lib/icons/Upload';
import { ChevronLeft } from '~/lib/icons/ChevronLeft';
import { Sparkles } from '~/lib/icons/Sparkles';

interface CreateProjectFormData {
  name: string;
  description: string;
  prompt: string;
  icon: string | null;
  isGeneratingIcon: boolean;
}

export function CreateProjectSheet() {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateProjectFormData>({
    name: '',
    description: '',
    prompt: '',
    icon: null,
    isGeneratingIcon: false,
  });
  const progress = useSharedValue(0);

  const snapPoints = useMemo(() => ['80%'], []);

  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      resetForm();
    }
  }, []);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
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

  const handleNext = () => {
    if (step === 0 && (!formData.name || !formData.description)) {
      return;
    }
    setStep(1);
    progress.value = 1;
  };

  const resetForm = () => {
    setStep(0);
    progress.value = 0;
    setFormData({
      name: '',
      description: '',
      prompt: '',
      icon: null,
      isGeneratingIcon: false,
    });
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { error } = await supabase.from('projects').insert({
        name: formData.name,
        prompt: formData.prompt,
        status: 'creating',
        user_id: userData.user.id,
        project_id: crypto.randomUUID(),
      });

      if (error) throw error;

      bottomSheetModalRef.current?.dismiss();
      resetForm();
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const canContinue = () => {
    if (step === 0) {
      return !!formData.name && !!formData.description;
    }
    return !!formData.prompt;
  };

  const handleGenerateIcon = async () => {
    setFormData((prev) => ({ ...prev, isGeneratingIcon: true }));
    // TODO: Implement AI icon generation
    // For now, just simulate a delay
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setFormData((prev) => ({ ...prev, isGeneratingIcon: false }));
  };

  const renderStep = () => {
    if (step === 0) {
      return (
        <Animated.View
          className="flex-1"
          entering={SlideInRight.duration(300)}
          exiting={SlideOutLeft.duration(300)}>
          <View className="space-y-6">
            <View className="items-center">
              <View className="flex-row space-x-4">
                <TouchableOpacity
                  onPress={pickImage}
                  className="w-24 h-24 rounded-2xl bg-muted justify-center items-center overflow-hidden border-2 border-dashed border-border">
                  {formData.icon ? (
                    <Image source={{ uri: formData.icon }} className="w-full h-full" />
                  ) : (
                    <View className="items-center space-y-2">
                      <Upload size={24} className="text-muted-foreground" />
                      <Text className="text-xs text-muted-foreground">Upload</Text>
                    </View>
                  )}
                </TouchableOpacity>
                {/* <TouchableOpacity
                  onPress={handleGenerateIcon}
                  disabled={formData.isGeneratingIcon}
                  className="w-24 h-24 rounded-2xl bg-muted justify-center items-center overflow-hidden border-2 border-dashed border-border">
                  <View className="items-center space-y-2">
                    <Sparkles size={24} className="text-muted-foreground" />
                    <Text className="text-xs text-muted-foreground">
                      {formData.isGeneratingIcon ? 'Generating...' : 'Generate'}
                    </Text>
                  </View>
                </TouchableOpacity> */}
              </View>
              <Text className="text-sm text-muted-foreground mt-2">Choose an app icon</Text>
            </View>
            <View>
              <Text className="text-sm font-medium mb-1.5">App Name</Text>
              <Input
                placeholder="My Awesome App"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
              />
            </View>
            <View>
              <Text className="text-sm font-medium mb-1.5">App Description</Text>
              <Input
                placeholder="A brief description of your app"
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                multiline
                numberOfLines={4}
                className="min-h-[100] py-2 px-3"
                textAlignVertical="top"
              />
            </View>
          </View>
        </Animated.View>
      );
    }

    return (
      <Animated.View
        className="flex-1"
        entering={SlideInRight.duration(300)}
        exiting={SlideOutLeft.duration(300)}>
        <View>
          <Text className="text-sm font-medium mb-1.5">Project Prompt</Text>
          <Input
            placeholder="Describe what you want to build..."
            value={formData.prompt}
            onChangeText={(text) => setFormData({ ...formData, prompt: text })}
            multiline
            numberOfLines={6}
            className="min-h-[200] py-2 px-3"
            textAlignVertical="top"
          />
        </View>
      </Animated.View>
    );
  };

  return (
    <>
      <Button onPress={handlePresentModalPress}>
        <Text>Create</Text>
      </Button>

      <BottomSheetModal
        ref={bottomSheetModalRef}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        enablePanDownToClose
        enableDynamicSizing={false}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={{
          backgroundColor: '#999',
          width: 40,
          height: 4,
          marginTop: 10,
        }}>
        <BottomSheetView style={{ flex: 1 }} className="pt-4">
          <View className="flex-1 px-6">
            <View className="mb-6">
              {step > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    setStep(0);
                    progress.value = 0;
                  }}
                  className="mb-4 flex-row items-center">
                  <ChevronLeft size={20} className="text-foreground" />
                  <Text className="text-foreground ml-1">Back</Text>
                </TouchableOpacity>
              )}
              <Text className="text-4xl font-bold mb-2 text-foreground">Create a New App</Text>
              <Text className="text-lg text-muted-foreground">
                {step === 0
                  ? 'Fill in the details for your new app'
                  : 'Describe what you want to build'}
              </Text>
            </View>

            <View className="flex-1">{renderStep()}</View>

            <View className="pb-8">
              <View className="mb-4">
                <Pagination
                  data={[0, 1]}
                  progress={progress}
                  dotClassName="rounded-sm bg-muted"
                  activeDotClassName="rounded-sm bg-primary"
                />
              </View>

              <TouchableOpacity
                className={`py-4 rounded-full ${canContinue() ? 'bg-primary' : 'bg-muted'}`}
                onPress={step === 0 ? handleNext : handleSubmit}
                disabled={!canContinue() || isLoading}>
                <Text
                  className={`text-center font-semibold text-lg ${
                    canContinue() ? 'text-primary-foreground' : 'text-muted-foreground'
                  }`}>
                  {step === 0 ? 'Continue' : isLoading ? 'Creating...' : 'Create Project'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    </>
  );
}
