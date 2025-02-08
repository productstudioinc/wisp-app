import React, { useEffect, useState, useCallback } from 'react';
import { Text, View, ScrollView, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeInUp,
  Layout,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  useSharedValue,
  withTiming,
  withRepeat,
  withSequence,
  interpolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { CreateProjectSheet } from '~/components/CreateProjectSheet';
import { Sparkles } from '~/lib/icons/Sparkles';
import { Plus } from '~/lib/icons/Plus';
import { Button } from '~/components/ui/button';
import { Background } from '~/components/ui/background';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'expo-router';
import { Project, ProjectStatus, useProjectsStore, projectsActions } from '~/lib/stores/projects';

const ProjectCard = ({ project, index }: { project: Project; index: number }) => {
  const router = useRouter();
  const [isPressed, setIsPressed] = useState(false);

  const pulseAnim = useSharedValue(0);

  useEffect(() => {
    if (project.status === 'deployed' || project.status === 'failed') {
      pulseAnim.value = 0;
    } else {
      pulseAnim.value = withRepeat(
        withSequence(withTiming(1, { duration: 1000 }), withTiming(0, { duration: 1000 })),
        -1, // Infinite repetition
        true, // Reverse animation
      );
    }
  }, [project.status]);

  const dotAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(pulseAnim.value, [0, 1], [0.4, 1]);

    return {
      opacity,
    };
  });

  const getStatusColor = (status: ProjectStatus) => {
    if (status === 'deployed') {
      return 'bg-green-500';
    }
    if (status === 'failed') {
      return 'bg-red-500';
    }
    return 'bg-yellow-500';
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withSpring(isPressed ? 0.95 : 1, {
            damping: 15,
            stiffness: 300,
          }),
        },
      ],
    };
  });

  const handlePress = () => {
    setIsPressed(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeout(() => {
      setIsPressed(false);
      router.push(`/project/${project.id}`);
    }, 100);
  };

  const faviconUrl = project.custom_domain ? `https://${project.custom_domain}/favicon.png` : null;

  return (
    <Animated.View entering={FadeInUp.delay(index * 100)} layout={Layout} style={animatedStyle}>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={1}
        className="bg-card/80 backdrop-blur-md rounded-2xl py-4 px-4 mb-3 border border-border">
        <View className="flex-row items-start">
          <View className="w-11 h-11 rounded-xl bg-muted mr-3 overflow-hidden">
            {faviconUrl && project.status === 'deployed' ? (
              <Image source={{ uri: faviconUrl }} className="w-full h-full" />
            ) : (
              <View className="w-full h-full bg-secondary items-center justify-center">
                <Text className="text-base font-semibold text-muted-foreground">
                  {project.name.charAt(0)}
                </Text>
              </View>
            )}
          </View>

          <View className="flex-1">
            <View className="flex-row items-center mb-0.5">
              <Text className="text-base font-semibold text-foreground mr-2" numberOfLines={1}>
                {project.display_name}
              </Text>
              <Animated.View
                className={`w-2 h-2 rounded-full ${getStatusColor(project.status)}`}
                style={
                  project.status === 'deployed' || project.status === 'failed'
                    ? undefined
                    : dotAnimatedStyle
                }
              />
            </View>

            {project.created_at && (
              <Text className="text-base text-muted-foreground">
                {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const EmptyState = () => (
  <View className="flex-1 items-center justify-center py-12">
    <Sparkles className="w-14 h-14 text-muted-foreground mb-4" />
    <Text className="text-xl font-semibold text-foreground mb-2">No apps yet</Text>
    <Text className="text-base text-muted-foreground text-center px-6">
      Create your first app to get started.{'\n'}It only takes a few seconds!
    </Text>
  </View>
);

const HomeScreen = () => {
  const [presentCreateProject, setPresentCreateProject] = useState<(() => void) | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { projects, isLoading, error } = useProjectsStore();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await projectsActions.fetchProjects();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    projectsActions.fetchProjects();
    const cleanup = projectsActions.setupRealtimeSubscription();
    return cleanup;
  }, []);

  const handlePresentRef = useCallback((present: () => void) => {
    setPresentCreateProject(() => present);
  }, []);

  if (error) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-destructive text-base">Error: {error}</Text>
        <Button onPress={onRefresh} variant="outline" className="mt-4">
          Retry
        </Button>
      </View>
    );
  }

  return (
    <Background>
      <SafeAreaView className="flex-1" edges={['top']}>
        <View className="flex-1 px-4">
          <View className="px-4 py-4">
            <Text className="text-3xl font-title text-foreground">My Apps</Text>
          </View>

          {projects.length > 0 ? (
            <ScrollView
              showsVerticalScrollIndicator={false}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
              contentContainerStyle={{
                flexGrow: 0,
              }}>
              <View>
                {projects.map((project, index) => (
                  <ProjectCard key={project.id} project={project} index={index} />
                ))}
              </View>
            </ScrollView>
          ) : (
            <EmptyState />
          )}
        </View>

        <Button
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            presentCreateProject?.();
          }}
          size="icon"
          className="absolute bottom-8 right-4 w-14 h-14 bg-primary rounded-full items-center justify-center shadow-lg">
          <Plus className="text-primary-foreground w-7 h-7" />
        </Button>
        <CreateProjectSheet onPresentRef={handlePresentRef} />
      </SafeAreaView>
    </Background>
  );
};

export default HomeScreen;
