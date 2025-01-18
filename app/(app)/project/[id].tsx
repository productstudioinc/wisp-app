import { View, Text, Image, ScrollView, Alert, ActionSheetIOS } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatDistanceToNow } from 'date-fns';
import { Share2 } from '~/lib/icons/Share2';
import { ExternalLink } from '~/lib/icons/ExternalLink';
import { TouchableOpacity } from 'react-native';
import { shareUrl, openUrl, generateAPIUrl } from '~/lib/utils';
import { supabase } from '~/supabase/client';
import { useEffect, useState } from 'react';
import { Background } from '~/components/ui/background';
import { ChevronLeft } from '~/lib/icons/ChevronLeft';
import { Button } from '~/components/ui/button';
import { MoreVertical } from '~/lib/icons/MoreVertical';
import { BlurView } from 'expo-blur';

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
  mobile_screenshot: string | null;
}

export default function ProjectDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserAndProject = async () => {
      const { data: userData } = await supabase.auth.getUser();
      setCurrentUserId(userData.user?.id ?? null);

      const { data: projectData, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && projectData) {
        setProject(projectData);
      }
    };

    fetchUserAndProject();
  }, [id]);

  const isOwner = currentUserId && project?.user_id === currentUserId;

  const handleShare = () =>
    project?.custom_domain && shareUrl(project.custom_domain, `Share ${project.name}`);
  const handleOpen = () => project?.custom_domain && openUrl(project.custom_domain);

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

  if (!project) return null;

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
          <View className="px-6 py-4 flex-row justify-between items-center">
            <TouchableOpacity onPress={() => router.back()}>
              <ChevronLeft size={24} className="text-foreground" />
            </TouchableOpacity>
            {isOwner && (
              <TouchableOpacity
                onPress={handleOpenMenu}
                className="w-10 h-10 items-center justify-center rounded-full">
                <MoreVertical size={24} className="text-foreground" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 140 }}>
          <View className="px-6 mb-8">
            <View className="flex-row items-start">
              <View className="w-28 h-28 rounded-[22px] bg-muted overflow-hidden shadow-lg">
                {faviconUrl ? (
                  <Image
                    source={{ uri: faviconUrl }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="w-full h-full bg-secondary items-center justify-center">
                    <Text className="text-3xl font-semibold text-muted-foreground">
                      {project.name.charAt(0)}
                    </Text>
                  </View>
                )}
              </View>

              <View className="flex-1 ml-5 pt-1">
                <Text className="text-2xl font-title text-foreground mb-1" numberOfLines={2}>
                  {project.name}
                </Text>
                {isOwner && (
                  <View className="flex-row items-center">
                    <View
                      className={`w-2.5 h-2.5 rounded-full ${getStatusColor(project.status)} mr-2`}
                    />
                    <Text className="text-base text-muted-foreground capitalize">
                      {project.status}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {project.prompt && (
            <View className="px-6 mb-8">
              <Text className="text-lg font-medium text-foreground mb-3">About</Text>
              <Text className="text-base text-muted-foreground leading-relaxed">
                {project.prompt}
              </Text>
            </View>
          )}

          {project.mobile_screenshot && (
            <View className="mb-8">
              <Text className="text-lg font-medium text-foreground mb-3 px-6">Preview</Text>
              <View className="px-6">
                <View className="w-[260px] aspect-[9/16] bg-muted rounded-3xl overflow-hidden shadow-xl mx-auto">
                  <Image
                    source={{ uri: project.mobile_screenshot }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                </View>
              </View>
            </View>
          )}

          <View className="px-6">
            <Text className="text-lg font-medium text-foreground mb-3">Information</Text>
            <View className="space-y-4">
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
        </ScrollView>

        <SafeAreaView edges={['bottom']} className="absolute bottom-0 left-0 right-0">
          <View className="px-6 pb-2">
            <View className="flex-row w-full">
              <Button
                className="flex-1 flex-row items-center justify-center rounded-full h-12 shadow-xl"
                onPress={handleOpen}
                disabled={!project.custom_domain}>
                <ExternalLink size={20} className="text-primary-foreground" />
                <Text className="text-base font-medium text-primary-foreground ml-2">Open</Text>
              </Button>

              <Button
                className="w-12 h-12 flex-row items-center justify-center ml-4 rounded-full shadow-xl"
                onPress={handleShare}
                disabled={!project.custom_domain}
                variant="secondary">
                <Share2 size={20} className="text-foreground" />
              </Button>
            </View>
          </View>
        </SafeAreaView>
      </SafeAreaView>
    </Background>
  );
}
