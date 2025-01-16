import React, { useCallback, useRef, useState, useMemo, useEffect } from 'react';
import { View, Alert, Platform, Keyboard } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { useFocusEffect } from '@react-navigation/native';
import { useSharedValue } from 'react-native-reanimated';
import { supabase } from '~/supabase/client';
import { vars, useColorScheme } from 'nativewind';
import { Asset } from 'expo-asset';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateAPIUrl } from '~/lib/utils';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { Text } from '~/components/ui/text';
import StepHeader from './create-project/StepHeader';
import FirstStep from './create-project/FirstStep';
import SecondStep from './create-project/SecondStep';
import StepFooter from './create-project/StepFooter';
import LoadingStep from './create-project/LoadingStep';

interface Question {
  id: string;
  question: string;
  answer: string;
}

interface CreateProjectFormData {
  name: string;
  description: string;
  prompt: string;
  icon: string | null;
  isGeneratingIcon: boolean;
  questions: Question[];
  imagesDescription: string[];
  imageSuggestions: string;
}

const INITIAL_QUESTIONS = [
  {
    id: '1',
    question: 'Who is your target audience?',
    answer: '',
  },
  {
    id: '2',
    question: 'What are the most important features you need?',
    answer: '',
  },
  {
    id: '3',
    question: 'What inspired this app idea?',
    answer: '',
  },
];

interface CreateProjectSheetProps {
  onPresentRef?: (present: () => void) => void;
}

export function CreateProjectSheet({ onPresentRef }: CreateProjectSheetProps) {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [formData, setFormData] = useState<CreateProjectFormData>({
    name: '',
    description: '',
    prompt: '',
    icon: null,
    isGeneratingIcon: false,
    questions: INITIAL_QUESTIONS,
    imagesDescription: [],
    imageSuggestions: '',
  });
  const progress = useSharedValue(0);
  const { colorScheme } = useColorScheme();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [shouldRegenerate, setShouldRegenerate] = useState(false);

  const [firstPageSnapshot, setFirstPageSnapshot] = useState({
    name: '',
    description: '',
  });

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

  const handleNext = async () => {
    if (step === 0 && (!formData.name || !formData.description)) {
      return;
    }

    const hasContentChanged =
      formData.name !== firstPageSnapshot.name ||
      formData.description !== firstPageSnapshot.description;

    if (!hasGenerated) {
      // First time, always show loading
      setIsTransitioning(true);
      setFirstPageSnapshot({
        name: formData.name,
        description: formData.description,
      });

      try {
        const response = await fetch(generateAPIUrl('/api/refine'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name,
            description: formData.description,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to refine project');
        }

        const data = await response.json();

        setFormData((prev) => ({
          ...prev,
          questions: data.questions.map((question: string, index: number) => ({
            id: (index + 1).toString(),
            question,
            answer: '',
          })),
          imageSuggestions: data.imageSuggestions,
        }));

        setIsTransitioning(false);
        setStep(1);
        setHasGenerated(true);
        progress.value = 1;
      } catch (error) {
        console.error('Error refining project:', error);
        setIsTransitioning(false);
      }
    } else {
      // Already generated before, just navigate
      setStep(1);
      progress.value = 1;
    }
  };

  const handleBack = () => {
    setStep(0);
    progress.value = 0;
  };

  const resetForm = () => {
    setStep(0);
    setHasGenerated(false);
    setShouldRegenerate(true);
    progress.value = 0;
    setFirstPageSnapshot({
      name: '',
      description: '',
    });
    setFormData({
      name: '',
      description: '',
      prompt: '',
      icon: null,
      isGeneratingIcon: false,
      questions: INITIAL_QUESTIONS,
      imagesDescription: [],
      imageSuggestions: '',
    });
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      const formattedName = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9._-]/g, '-')
        .replace(/---+/g, '--');

      if (formattedName.length > 100) {
        throw new Error('Project name must be 100 characters or less');
      }

      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const response = await fetch(generateAPIUrl('/api/projects'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formattedName,
          prompt: formData.prompt || undefined,
          userId: userData.user.id,
        }),
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

  const canContinue = () => {
    if (step === 0) {
      return !!formData.name && !!formData.description;
    }
    return true;
  };

  const handleReset = () => {
    Alert.alert(
      'Are you sure you want to reset?',
      'This will reset your app idea and your personalized questions',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: resetForm,
        },
      ],
    );
  };

  const pickMultipleImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsMultipleSelection: true,
      selectionLimit: 10,
      quality: 1,
    });

    if (!result.canceled) {
      const newImages = result.assets.map((asset) => asset.uri);
      setFormData((prev) => ({
        ...prev,
        imagesDescription: [...prev.imagesDescription, ...newImages].slice(0, 5),
      }));
    }
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

  const handleQuestionAnswer = (id: string, answer: string) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => (q.id === id ? { ...q, answer } : q)),
    }));
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
        width: 40,
        height: 4,
        marginTop: 10,
      }}>
      <BottomSheetView style={{ flex: 1 }} className="pt-6">
        <View className="flex-1 px-6">
          <StepHeader step={step} hasGenerated={hasGenerated} onReset={handleReset} />

          {!isTransitioning ? (
            step === 0 ? (
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
            ) : (
              <SecondStep
                questions={formData.questions}
                imagesDescription={formData.imagesDescription}
                imageSuggestions={formData.imageSuggestions}
                onQuestionAnswer={handleQuestionAnswer}
                onImagesChange={(newImages) =>
                  setFormData((prev) => ({ ...prev, imagesDescription: newImages }))
                }
                onAddImages={pickMultipleImages}
              />
            )
          ) : (
            <LoadingStep isImageLoaded={isImageLoaded} />
          )}

          {!isTransitioning && (
            <StepFooter
              step={step}
              progress={progress}
              isLoading={isLoading}
              hasGenerated={hasGenerated}
              canContinue={canContinue()}
              onBack={handleBack}
              onNext={step === 0 ? handleNext : handleSubmit}
            />
          )}
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}
