import React, { useCallback, useEffect, useState } from 'react';
import { Text, View, ScrollView, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Background } from '~/components/ui/background';
import { supabase } from '~/supabase/client';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

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

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/project/${project.id}`);
  };

  const faviconUrl = project.custom_domain ? `https://${project.custom_domain}/favicon.png` : null;

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
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
            <Text className="text-base font-semibold text-foreground" numberOfLines={1}>
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
  );
};

const ProjectCardSkeleton = ({ index }: { index: number }) => {
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
      </SafeAreaView>
    </Background>
  );
}
