import { View, Text, Image, ScrollView, Alert, ActionSheetIOS, Animated } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatDistanceToNow } from 'date-fns';
import { ExternalLink } from '~/lib/icons/ExternalLink';
import { TouchableOpacity } from 'react-native';
import { shareUrl, openUrl, generateAPIUrl } from '~/lib/utils';
import { supabase } from '~/supabase/client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { Background } from '~/components/ui/background';
import { ChevronLeft } from '~/lib/icons/ChevronLeft';
import { Button } from '~/components/ui/button';
import { MoreVertical } from '~/lib/icons/MoreVertical';
import { BlurView } from 'expo-blur';
import { GradientBlur } from '~/components/ui/gradient-blur';
import { Share } from '~/lib/icons/Share';
import { EditProjectSheet } from '~/components/EditProjectSheet';
import { RealtimeChannel } from '@supabase/supabase-js';

type ProjectStatus = 'creating' | 'deployed' | 'failed' | 'deploying' | 'pending';

interface Project {
  id: string;
  name: string;
  user_id: string;
  project_id: string;
  display_name: string;
  description: string;
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
  mobile_screenshot: string | null;
}

export default function ProjectDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const presentEditSheet = useRef<() => void>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerOpacity = scrollY.interpolate({
    inputRange: [40, 60],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const fetchProject = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (projectError) throw projectError;
      if (projectData) setProject(projectData);
    } catch (err) {
      console.error('Error fetching project:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch project');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  const setupRealtimeSubscription = useCallback(() => {
    if (!id) return;

    const channel = supabase
      .channel(`project_${id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
          filter: `id=eq.${id}`,
        },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            router.back();
            return;
          }

          const updatedProject = payload.new as Project;
          setProject(updatedProject);
        },
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [id, router]);

  useEffect(() => {
    const fetchUserAndSetupSubscription = async () => {
      const { data: userData } = await supabase.auth.getUser();
      setCurrentUserId(userData.user?.id ?? null);

      await fetchProject();
      const cleanup = setupRealtimeSubscription();
      return cleanup;
    };

    const cleanup = fetchUserAndSetupSubscription();
    return () => {
      cleanup.then((cleanupFn) => cleanupFn?.());
    };
  }, [fetchProject, setupRealtimeSubscription]);

  const isOwner = currentUserId && project?.user_id === currentUserId;

  const handleShare = () =>
    project?.custom_domain && shareUrl(project.custom_domain, `Share ${project.name}`);

  const handleOpen = () => {
    if (!project?.custom_domain) return;
    const params = new URLSearchParams({
      title: project.display_name,
      iconUrl: `https://${project.custom_domain}/favicon.png`,
    });
    openUrl(`${project.custom_domain}?${params.toString()}`);
  };

  const getStatusColor = (status: ProjectStatus) => {
    if (status === 'deployed') {
      return 'bg-green-500';
    }
    if (status === 'failed') {
      return 'bg-red-500';
    }
    return 'bg-yellow-500';
  };

  const handleDelete = async () => {
    if (!project || !isOwner) return;

    try {
      const response = await fetch(generateAPIUrl(`/api/projects/${project.name}`), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUserId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete project');
      }

      router.back();
    } catch (error) {
      console.error('Error deleting project:', error);
      Alert.alert('Error', 'Failed to delete project. Please try again.');
    }
  };

  const handleOpenMenu = () => {
    if (!isOwner) return;

    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ['Cancel', 'Delete Project'],
        cancelButtonIndex: 0,
        destructiveButtonIndex: 1,
      },
      (buttonIndex) => {
        if (buttonIndex === 1) {
          Alert.alert(
            'Delete Project',
            'Are you sure you want to delete this project? This action cannot be undone.',
            [
              {
                text: 'Cancel',
                style: 'cancel',
              },
              {
                text: 'Delete',
                style: 'destructive',
                onPress: handleDelete,
              },
            ],
          );
        }
      },
    );
  };

  if (error) {
    return (
      <Background>
        <SafeAreaView className="flex-1 items-center justify-center" edges={['top']}>
          <Text className="text-destructive text-base mb-4">{error}</Text>
          <Button onPress={fetchProject} variant="outline">
            <Text className="text-base font-semibold text-primary">Retry</Text>
          </Button>
        </SafeAreaView>
      </Background>
    );
  }

  if (isLoading || !project) {
    return (
      <Background>
        <SafeAreaView className="flex-1 items-center justify-center" edges={['top']}>
          <Text className="text-base text-muted-foreground">Loading...</Text>
        </SafeAreaView>
      </Background>
    );
  }

  const faviconUrl = project.custom_domain ? `https://${project.custom_domain}/favicon.png` : null;

  return (
    <Background>
      <SafeAreaView className="flex-1" edges={['top']}>
        <Stack.Screen
          options={{
            headerShown: false,
          }}
        />

        <View className="w-full">
          <BlurView intensity={20} className="absolute inset-0" />
          <View className="px-4 py-3 flex-row justify-between items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 -ml-2 items-center justify-center">
              <ChevronLeft size={22} className="text-foreground" />
            </TouchableOpacity>

            <Animated.Text
              numberOfLines={1}
              className="text-base font-semibold text-foreground absolute left-14 right-24"
              style={{
                opacity: headerOpacity,
                transform: [
                  {
                    translateY: headerOpacity.interpolate({
                      inputRange: [0, 1],
                      outputRange: [10, 0],
                    }),
                  },
                ],
              }}>
              {project?.display_name}
            </Animated.Text>

            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={handleShare}
                disabled={!project?.custom_domain}
                className="w-10 h-10 items-center justify-center">
                <Share size={22} className="text-foreground" />
              </TouchableOpacity>
              {isOwner && (
                <TouchableOpacity
                  onPress={handleOpenMenu}
                  className="w-10 h-10 items-center justify-center">
                  <MoreVertical size={22} className="text-foreground" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        <Animated.ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 120 }}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
            useNativeDriver: true,
          })}
          scrollEventThrottle={16}>
          <View className="px-4 mb-6">
            <View className="flex-row items-start">
              <View className="w-24 h-24 rounded-[18px] bg-muted overflow-hidden shadow-lg">
                {faviconUrl && project.status === 'deployed' ? (
                  <Image
                    source={{ uri: faviconUrl }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="w-full h-full bg-secondary items-center justify-center">
                    <Text className="text-2xl font-semibold text-muted-foreground">
                      {project.name.charAt(0)}
                    </Text>
                  </View>
                )}
              </View>

              <View className="flex-1 ml-4 pt-1">
                <Text className="text-base font-title text-foreground mb-1" numberOfLines={2}>
                  {project.display_name}
                </Text>
                {isOwner && (
                  <View className="flex-row items-center">
                    <View
                      className={`w-2 h-2 rounded-full ${getStatusColor(project.status)} mr-2`}
                    />
                    <Text className="text-muted-foreground capitalize">
                      {project.status === 'deployed'
                        ? 'Ready'
                        : project.status === 'failed'
                          ? 'Failed'
                          : 'Preparing'}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {project.prompt && project.status === 'deployed' && (
            <View className="px-4 mb-6">
              <Text className="text-base font-semibold text-foreground mb-2">About</Text>
              <Text className="text-base text-muted-foreground leading-[22px]">
                {project.prompt}
              </Text>
            </View>
          )}

          {project.mobile_screenshot && project.status === 'deployed' && (
            <View className="mb-6">
              {project.description && (
                <View className="px-4 mb-6">
                  <Text className="text-base font-semibold text-foreground mb-2">Description</Text>
                  <Text className="text-base text-muted-foreground leading-[22px]">
                    {project.description}
                  </Text>
                </View>
              )}
              <Text className="text-base font-semibold text-foreground mb-3 px-4">Preview</Text>
              <View className="px-4">
                <View
                  className="w-[240px] aspect-[3/4] bg-muted rounded-3xl overflow-hidden shadow-2xl mx-auto"
                  style={{
                    shadowColor: '#000',
                    shadowOffset: {
                      width: 0,
                      height: 4,
                    },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: 8,
                  }}>
                  <Image
                    source={{ uri: project.mobile_screenshot }}
                    resizeMode="cover"
                    style={{
                      position: 'absolute',
                      width: '100%',
                      height: undefined,
                      aspectRatio: 9 / 19,
                      top: 0,
                    }}
                  />
                </View>
              </View>
            </View>
          )}

          <View className="px-4">
            <Text className="text-base font-semibold text-foreground mb-2">Information</Text>
            <View className="space-y-3">
              <View className="flex-row justify-between items-center">
                <Text className="text-base text-muted-foreground">Created</Text>
                <Text className="text-base text-foreground">
                  {formatDistanceToNow(new Date(project.created_at!), { addSuffix: true })}
                </Text>
              </View>

              {isOwner && project.deployed_at && (
                <View className="flex-row justify-between items-center">
                  <Text className="text-base text-muted-foreground">Last Updated</Text>
                  <Text className="text-base text-foreground">
                    {formatDistanceToNow(new Date(project.deployed_at), { addSuffix: true })}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Animated.ScrollView>

        <GradientBlur height={140}>
          <SafeAreaView edges={['bottom']} className="flex-1 justify-end">
            <View className="flex-row w-full px-4 gap-3">
              <Button
                variant="outline"
                className={`flex-1 flex-row items-center justify-center rounded-full h-[56px] border-2 border-primary/10 ${
                  !isOwner || project.status !== 'deployed' ? 'opacity-50' : ''
                }`}
                onPress={() => presentEditSheet.current?.()}
                disabled={!isOwner || project.status !== 'deployed'}>
                <Text
                  className={`text-lg font-semibold leading-[22px] ${
                    !isOwner || project.status !== 'deployed'
                      ? 'text-muted-foreground'
                      : 'text-primary'
                  }`}>
                  Edit
                </Text>
              </Button>

              <Button
                className={`flex-1 flex-row items-center justify-center rounded-full h-[56px] border-2 border-primary/10 ${
                  !project?.custom_domain || project.status !== 'deployed'
                    ? 'opacity-50 bg-muted'
                    : 'bg-primary'
                }`}
                onPress={handleOpen}
                disabled={!project?.custom_domain || project.status !== 'deployed'}>
                <Text
                  className={`text-lg font-semibold leading-[22px] ${
                    !project?.custom_domain || project.status !== 'deployed'
                      ? 'text-muted-foreground'
                      : 'text-primary-foreground'
                  }`}>
                  Open
                </Text>
              </Button>
            </View>
          </SafeAreaView>
        </GradientBlur>
      </SafeAreaView>
      <EditProjectSheet
        onPresentRef={(present) => (presentEditSheet.current = present)}
        projectId={project?.id}
      />
    </Background>
  );
}
