import React, { useCallback, useRef, useState, useMemo, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  Keyboard,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Text } from '~/components/ui/text';
import { Pagination } from '~/components/pagination';
import { supabase } from '~/supabase/client';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { useFocusEffect } from '@react-navigation/native';
import Animated, { SlideInRight, SlideOutLeft, useSharedValue } from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import { Upload } from '~/lib/icons/Upload';
import { ChevronLeft } from '~/lib/icons/ChevronLeft';
import { vars, useColorScheme } from 'nativewind';

interface CreateProjectFormData {
  name: string;
  description: string;
  prompt: string;
  icon: string | null;
  isGeneratingIcon: boolean;
}

const EXAMPLE_IDEAS = [
  {
    name: 'Love Language Timer',
    description: "Make a love language tracker for me and Jake to see who's more romantic",
  },
  {
    name: 'Study Session Aesthetic',
    description: 'Make me a kawaii study timer with lofi aesthetics',
  },
  {
    name: 'Situationship Calculator',
    description:
      "Make a situationship calculator that tells me if we're dating based on how many times we've hung out",
  },
  {
    name: 'Outfit Decision Maker',
    description: 'Make an outfit randomizer for my capsule wardrobe',
  },
  {
    name: 'Gym Split Randomizer',
    description: 'Make a workout generator for my gym bro Mark that gives him crazy exercises',
  },
];

interface CreateProjectSheetProps {
  onPresentRef?: (present: () => void) => void;
}

export function CreateProjectSheet({ onPresentRef }: CreateProjectSheetProps) {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const descriptionInputRef = useRef<TextInput>(null);
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

  const renderExampleIdeas = useMemo(
    () => (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row -mx-6 px-6">
        {EXAMPLE_IDEAS.map((idea, index) => (
          <TouchableOpacity
            key={index}
            onPress={() =>
              setFormData((prev) => ({
                ...prev,
                name: idea.name,
                description: idea.description,
              }))
            }
            className="mr-3 px-5 py-3 rounded-full bg-primary/10 border border-primary/20">
            <Text className="text-base text-primary font-medium">{idea.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    ),
    [],
  );

  const handleNameChange = useCallback((text: string) => {
    setFormData((prev) => ({ ...prev, name: text }));
  }, []);

  const handleDescriptionChange = useCallback((text: string) => {
    setFormData((prev) => ({ ...prev, description: text }));
  }, []);

  const handleDescriptionSubmit = () => {
    Keyboard.dismiss();
  };

  const renderFirstStep = useMemo(
    () => (
      <Animated.View
        className="flex-1"
        entering={SlideInRight.duration(300)}
        exiting={SlideOutLeft.duration(300)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1">
          <ScrollView
            contentContainerStyle={{ paddingBottom: 150 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View className="space-y-8">
              <View className="items-center">
                <View className="flex-row space-x-4">
                  <TouchableOpacity
                    onPress={pickImage}
                    className="w-28 h-28 rounded-2xl bg-muted justify-center items-center overflow-hidden border-2 border-dashed border-border">
                    {formData.icon ? (
                      <Image source={{ uri: formData.icon }} className="w-full h-full" />
                    ) : (
                      <View className="items-center space-y-3">
                        <Upload size={28} className="text-muted-foreground" />
                        <Text className="text-base text-muted-foreground">Upload</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
                <Text className="text-base text-muted-foreground mt-3">Choose an app icon</Text>
              </View>
              <View>
                <Text className="text-lg font-medium mb-2">App Name</Text>
                <Input
                  defaultValue={formData.name}
                  onChangeText={handleNameChange}
                  className="bg-transparent text-lg py-3"
                  placeholder="Enter your app name"
                  returnKeyType="next"
                  blurOnSubmit={false}
                  bottomSheet
                  onSubmitEditing={() => {
                    descriptionInputRef.current?.focus();
                  }}
                />
              </View>
              <View>
                <Text className="text-lg font-medium mb-2 mt-2">App Idea</Text>
                <Input
                  ref={descriptionInputRef}
                  defaultValue={formData.description}
                  onChangeText={handleDescriptionChange}
                  multiline
                  bottomSheet
                  numberOfLines={4}
                  className="min-h-[120] py-3 px-4 bg-transparent text-lg"
                  textAlignVertical="top"
                  placeholder="Describe your app idea"
                  returnKeyType="done"
                  blurOnSubmit={true}
                  onSubmitEditing={handleDescriptionSubmit}
                />
                <View className="mt-6">
                  <Text className="text-base text-muted-foreground mb-3">
                    Or try one of these examples:
                  </Text>
                  {renderExampleIdeas}
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Animated.View>
    ),
    [
      formData.name,
      formData.description,
      handleNameChange,
      handleDescriptionChange,
      renderExampleIdeas,
    ],
  );

  const renderStep = useCallback(() => {
    if (step === 0) {
      return renderFirstStep;
    }
  }, [step, renderFirstStep]);

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
        width: 40,
        height: 4,
        marginTop: 10,
      }}>
      <BottomSheetView style={{ flex: 1 }} className="pt-6">
        <View className="flex-1 px-6">
          <View className="mb-8">
            <Text className="text-4xl font-bold mb-3 text-foreground">Create a New App</Text>
          </View>

          <View className="flex-1">{renderStep()}</View>

          <View className="pb-8 bg-background">
            <View className="mb-4">
              <Pagination
                data={[0, 1]}
                progress={progress}
                dotClassName="rounded-full bg-muted mx-1"
                activeDotClassName="rounded-full bg-primary"
              />
            </View>

            <View className="flex-row">
              {step > 0 && (
                <Button
                  onPress={() => setStep(0)}
                  className="rounded-full mr-2 h-10 w-12"
                  variant="ghost">
                  <ChevronLeft size={24} className="text-primary" />
                </Button>
              )}
              <Button
                className={`flex-1 rounded-full ${canContinue() ? 'bg-primary' : 'bg-muted'}`}
                size="lg"
                onPress={step === 0 ? handleNext : handleSubmit}
                disabled={!canContinue() || isLoading}>
                <Text
                  className={`text-center font-semibold ${
                    canContinue() ? 'text-primary-foreground' : 'text-muted-foreground'
                  }`}>
                  {step === 0 ? 'Continue' : isLoading ? 'Creating...' : 'Create Project'}
                </Text>
              </Button>
            </View>
          </View>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}
