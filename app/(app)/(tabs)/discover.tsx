import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Image, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Background } from '~/components/ui/background';
import { supabase } from '~/supabase/client';

type ProjectStatus = 'creating' | 'deployed' | 'failed' | 'deploying';

interface Project {
  id: string;
  name: string;
  user_id: string;
  display_name: string;
  project_id: string;
  dns_record_id: string | null;
  custom_domain: string | null;
  description: string | null;
  status: ProjectStatus;
  created_at: string | null;
  status_message: string | null;
  last_updated: string | null;
  error: string | null;
  deployed_at: string | null;
  private: boolean;
  icon: string | null;
}

const ProjectCard = ({ project, index }: { project: Project; index: number }) => {
  const router = useRouter();
  const [isPressed, setIsPressed] = useState(false);

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
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={1}
        className="bg-card/80 backdrop-blur-md rounded-2xl py-4 px-4 mb-3 border border-border">
        <View>
          <View className="flex-row items-center mb-2.5">
            <View className="w-10 h-10 rounded-xl bg-muted mr-3 overflow-hidden">
              {faviconUrl ? (
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
              <Text className="text-base font-semibold text-foreground">
                {project.display_name}
              </Text>
            </View>
          </View>

          {project.description && (
            <Text className="text-base text-muted-foreground leading-[22px]" numberOfLines={2}>
              {project.description}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const ProjectCardSkeleton = ({ index }: { index: number }) => {
  const shimmerValue = useSharedValue(0);

  useEffect(() => {
    shimmerValue.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
  }, []);

  const shimmerStyle = useAnimatedStyle(() => {
    const translateX = interpolate(shimmerValue.value, [0, 1], [-100, 100]);

    return {
      transform: [{ translateX }],
    };
  });

  return (
    <View className="bg-card/80 backdrop-blur-md rounded-2xl py-5 px-5 mb-4 border border-border overflow-hidden">
      <View>
        <View className="flex-row items-center mb-3">
          <View className="w-10 h-10 rounded-xl bg-muted mr-3 overflow-hidden" />
          <View className="flex-1">
            <View className="h-6 bg-muted rounded-lg w-3/4" />
          </View>
        </View>
        <View className="h-4 bg-muted rounded-lg w-full mb-2" />
        <View className="h-4 bg-muted rounded-lg w-2/3" />
        <Animated.View
          className="absolute top-0 left-0 right-0 bottom-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          style={shimmerStyle}
        />
      </View>
    </View>
  );
};

const LoadingState = () => (
  <View>
    {[0, 1, 2].map((index) => (
      <ProjectCardSkeleton key={index} index={index} />
    ))}
  </View>
);

const EmptyState = () => (
  <View className="flex-1 items-center justify-center py-12">
    <Text className="text-xl font-semibold text-foreground mb-2">No public apps yet</Text>
    <Text className="text-base text-muted-foreground text-center px-6">
      Check back later for inspiration from the community
    </Text>
  </View>
);

export default function DiscoverScreen() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('private', false)
      .eq('status', 'deployed')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
      return;
    }

    setProjects(data || []);
    setIsLoading(false);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProjects();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <Background>
      <SafeAreaView className="flex-1" edges={['top']}>
        <View className="flex-1 px-4">
          <View className="px-4 py-4">
            <Text className="text-3xl font-title text-foreground">Discover</Text>
            <Text className="text-base text-muted-foreground mt-1">
              Find inspiration for your next project
            </Text>
          </View>

          {isLoading ? (
            <LoadingState />
          ) : projects.length > 0 ? (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                flexGrow: 0,
              }}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
              <View className="flex-row flex-wrap">
                <View className="w-1/2 px-2">
                  {projects
                    .filter((_, index) => index % 2 === 0)
                    .map((project, index) => (
                      <ProjectCard key={project.id} project={project} index={index * 2} />
                    ))}
                </View>
                <View className="w-1/2 px-2">
                  {projects
                    .filter((_, index) => index % 2 === 1)
                    .map((project, index) => (
                      <ProjectCard key={project.id} project={project} index={index * 2 + 1} />
                    ))}
                </View>
              </View>
            </ScrollView>
          ) : (
            <EmptyState />
          )}
        </View>
      </SafeAreaView>
    </Background>
  );
}
