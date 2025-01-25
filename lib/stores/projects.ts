import { observable } from '@legendapp/state';
import { supabase } from '~/supabase/client';

export type ProjectStatus = 'creating' | 'deployed' | 'failed' | 'deploying';

export interface Project {
  id: string;
  name: string;
  display_name: string;
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

interface ProjectsState {
  projects: Project[];
  isLoading: boolean;
  error: string | null;
}

export const projectsState = observable<ProjectsState>({
  projects: [],
  isLoading: false,
  error: null,
});

export const projectsActions = {
  async fetchProjects() {
    try {
      projectsState.isLoading.set(true);
      projectsState.error.set(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('No user found');
      }

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      projectsState.projects.set(data || []);
    } catch (error) {
      projectsState.error.set(error instanceof Error ? error.message : 'Failed to fetch projects');
    } finally {
      projectsState.isLoading.set(false);
    }
  },

  setupRealtimeSubscription() {
    let userId: string | null = null;

    // Get initial user ID
    supabase.auth.getUser().then(({ data }) => {
      userId = data.user?.id ?? null;
    });

    // Listen for auth changes
    supabase.auth.onAuthStateChange((_event, session) => {
      userId = session?.user?.id ?? null;
    });

    const channel = supabase
      .channel('projects-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
          filter: userId ? `user_id=eq.${userId}` : undefined,
        },
        (payload) => {
          const currentProjects = projectsState.projects.get();

          switch (payload.eventType) {
            case 'INSERT':
              projectsState.projects.set([...currentProjects, payload.new as Project]);
              break;
            case 'UPDATE':
              projectsState.projects.set(
                currentProjects.map((project) =>
                  project.id === payload.new.id ? (payload.new as Project) : project,
                ),
              );
              break;
            case 'DELETE':
              projectsState.projects.set(
                currentProjects.filter((project) => project.id !== payload.old.id),
              );
              break;
          }
        },
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  },
}; 