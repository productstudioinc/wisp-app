import { create } from 'zustand';
import { supabase } from '~/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export type ProjectStatus = 'pending' | 'deployed' | 'failed';

export interface Project {
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

interface ProjectsState {
  projects: Project[];
  isLoading: boolean;
  error: string | null;
  realtimeChannel: RealtimeChannel | null;
  // Actions
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  removeProject: (id: string) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setRealtimeChannel: (channel: RealtimeChannel | null) => void;
}

export const useProjectsStore = create<ProjectsState>((set, get) => ({
  projects: [],
  isLoading: false,
  error: null,
  realtimeChannel: null,
  setProjects: (projects) => set({ projects }),
  addProject: (project) => set((state) => {
    // Find the correct position to insert the new project based on created_at
    const newProjects = [...state.projects];
    const insertIndex = newProjects.findIndex(
      (p) => new Date(p.created_at!) < new Date(project.created_at!)
    );
    
    if (insertIndex === -1) {
      newProjects.push(project);
    } else {
      newProjects.splice(insertIndex, 0, project);
    }

    return { projects: newProjects };
  }),
  updateProject: (id, updates) => set((state) => ({
    projects: state.projects.map((project) =>
      project.id === id ? { ...project, ...updates } : project
    ),
  })),
  removeProject: (id) => set((state) => ({
    projects: state.projects.filter((project) => project.id !== id),
  })),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setRealtimeChannel: (channel) => set({ realtimeChannel: channel }),
}));

// Actions
export const projectsActions = {
  fetchProjects: async () => {
    const store = useProjectsStore.getState();
    try {
      store.setIsLoading(true);
      store.setError(null);

      const { data: projects, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      store.setProjects(projects || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      store.setError(error instanceof Error ? error.message : 'Failed to fetch projects');
    } finally {
      store.setIsLoading(false);
    }
  },

  setupRealtimeSubscription: () => {
    const store = useProjectsStore.getState();
    
    // Clean up existing subscription if any
    if (store.realtimeChannel) {
      supabase.removeChannel(store.realtimeChannel);
    }

    const channel = supabase
      .channel('projects_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newProject = payload.new as Project;
            // Only add if not already in store (prevents duplication with optimistic updates)
            if (!store.projects.some(p => p.id === newProject.id)) {
              store.addProject(newProject);
            }
          } else if (payload.eventType === 'UPDATE') {
            store.updateProject(payload.new.id, payload.new as Project);
          } else if (payload.eventType === 'DELETE') {
            store.removeProject(payload.old.id);
          }
        },
      )
      .subscribe();

    store.setRealtimeChannel(channel);

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  },

  // Optimistic update helpers
  optimisticAddProject: (project: Project) => {
    useProjectsStore.getState().addProject(project);
  },

  optimisticUpdateProject: (id: string, updates: Partial<Project>) => {
    useProjectsStore.getState().updateProject(id, updates);
  },

  optimisticRemoveProject: (id: string) => {
    useProjectsStore.getState().removeProject(id);
  },
}; 