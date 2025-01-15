import React, { useEffect, useState, useCallback } from 'react';
import { Text, View, Pressable, ScrollView, TouchableOpacity, Linking, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInUp, Layout } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { CreateProjectSheet } from '~/components/CreateProjectSheet';
import { supabase } from '~/supabase/client';
import { Sparkles } from '~/lib/icons/Sparkles';
import { Plus } from '~/lib/icons/Plus';
import { Button } from '~/components/ui/button';
import { Background } from '~/components/ui/background';
import { formatDistanceToNow } from 'date-fns';
import * as Sharing from 'expo-sharing';
import { Share2 } from '~/lib/icons/Share2';
import { ExternalLink } from '~/lib/icons/ExternalLink';

type ProjectStatus = 'creating' | 'deployed' | 'failed' | 'deploying';

interface Project {
  id: string;
  name: string;
  user_id: string;
  project_id: string;
  dns_record_id: string | null;
  custom_domain: string | null;
  prompt: string | null;
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
  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case 'deployed':
        return 'bg-green-500';
      case 'creating':
        return 'bg-yellow-500';
      case 'deploying':
        return 'bg-blue-500';
      default:
        return 'bg-red-500';
    }
  };

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (project.custom_domain) {
      await Sharing.shareAsync(project.custom_domain);
    }
  };

  const handleOpen = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (project.custom_domain) {
      Linking.openURL(project.custom_domain);
    }
  };

  return (
    <Animated.View entering={FadeInUp.delay(index * 100)} layout={Layout}>
      <View className="bg-card/80 backdrop-blur-md rounded-2xl py-5 px-6 mb-4 border border-border">
        <View className="flex-row items-center">
          <View className="w-14 h-14 rounded-xl bg-muted mr-4 overflow-hidden">
            {project.icon ? (
              <Image source={{ uri: project.icon }} className="w-full h-full" />
            ) : (
              <View className="w-full h-full bg-secondary items-center justify-center">
                <Text className="text-xl font-semibold text-muted-foreground">
                  {project.name.charAt(0)}
                </Text>
              </View>
            )}
          </View>

          <View className="flex-1 flex-row items-center justify-between min-h-[56px]">
            <View className="flex-1 mr-4">
              <Text className="text-2xl font-semibold text-foreground mb-2" numberOfLines={1}>
                {project.name}
              </Text>
              <View className="flex-row items-center">
                <View
                  className={`w-2.5 h-2.5 rounded-full mr-2 ${getStatusColor(project.status)}`}
                />
                <Text className="text-base text-muted-foreground" numberOfLines={1}>
                  {project.status}
                  {project.status_message && ` • ${project.status_message}`}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center">
              {project.created_at && (
                <Text className="text-base text-muted-foreground mr-4">
                  {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
                </Text>
              )}
              <TouchableOpacity
                onPress={handleShare}
                className="p-3 rounded-full bg-secondary mr-2.5"
                disabled={!project.custom_domain}>
                <Share2 size={22} className="text-foreground" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleOpen}
                className="p-3 rounded-full bg-secondary"
                disabled={!project.custom_domain}>
                <ExternalLink size={22} className="text-foreground" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

const EmptyState = () => (
  <View className="flex-1 items-center justify-center py-12">
    <Sparkles className="w-16 h-16 text-muted-foreground mb-6" />
    <Text className="text-2xl font-semibold text-foreground mb-3">No apps yet</Text>
    <Text className="text-lg text-muted-foreground text-center px-6">
      Create your first app to get started.{'\n'}It only takes a few seconds!
    </Text>
  </View>
);

export default function ProjectsScreen() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [presentCreateProject, setPresentCreateProject] = useState<(() => void) | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      const { data, error } = await supabase.from('projects').select('*');

      if (error) {
        console.error('Error fetching projects:', error);
        return;
      }

      setProjects(data || []);
    };

    fetchProjects();

    const channel = supabase
      .channel('projects-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
        },
        (payload) => {
          console.log('Change received:', payload);

          switch (payload.eventType) {
            case 'INSERT':
              setProjects((current) => [...current, payload.new as Project]);
              break;
            case 'UPDATE':
              setProjects((current) =>
                current.map((project) =>
                  project.id === payload.new.id ? (payload.new as Project) : project,
                ),
              );
              break;
            case 'DELETE':
              setProjects((current) => current.filter((project) => project.id !== payload.old.id));
              break;
          }
        },
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const handlePresentRef = useCallback((present: () => void) => {
    setPresentCreateProject(() => present);
  }, []);

  return (
    <Background>
      <SafeAreaView className="flex-1" edges={['top']}>
        <View className="flex-1 px-6">
          <View className="py-6">
            <Text className="text-4xl font-bold text-foreground">My Apps</Text>
          </View>

          {projects.length > 0 ? (
            <ScrollView
              showsVerticalScrollIndicator={false}
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
          className="absolute bottom-8 right-6 w-16 h-16 bg-primary rounded-full items-center justify-center shadow-lg">
          <Plus className="text-primary-foreground w-8 h-8" />
        </Button>
        <CreateProjectSheet onPresentRef={handlePresentRef} />
      </SafeAreaView>
    </Background>
  );
}
