import { create } from "zustand";
import { projectsApi, environmentsApi, usersApi } from "@/lib/api";
import type { Project, Environment } from "@/types";

interface ProjectState {
  projects: Project[];
  selectedProject: Project | null;
  environments: Environment[];
  loading: boolean;

  fetchProjects: () => Promise<void>;
  selectProject: (project: Project, persist?: boolean) => Promise<void>;
  refreshProjects: () => Promise<void>;
  createProject: (data: { name: string; key: string; description?: string }) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;

  createEnvironment: (
    projectId: string,
    data: { name: string; key: string; requireConfirmation?: boolean },
  ) => Promise<void>;
  updateEnvironment: (
    id: string,
    data: { name?: string; key?: string; requireConfirmation?: boolean },
  ) => Promise<void>;
  deleteEnvironment: (id: string) => Promise<void>;
  fetchEnvironments: (projectId: string) => Promise<void>;
}

let projectsFetchPromise: Promise<void> | null = null;

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  selectedProject: null,
  environments: [],
  loading: false,

  fetchProjects: async () => {
    if (get().projects.length > 0) return;
    if (projectsFetchPromise) return projectsFetchPromise;

    projectsFetchPromise = (async () => {
      set({ loading: true });
      try {
        const projects = await projectsApi.getAll();
        set({ projects });

        // Get user profile to check for lastProjectId
        try {
          const userProfile = await usersApi.getProfile();
          if (userProfile.lastProjectId) {
            const lastProject = projects.find((p: Project) => p.id === userProfile.lastProjectId);
            if (lastProject) {
              await get().selectProject(lastProject, false); // false means don't persist back to DB since we just read it
              return;
            }
          }
        } catch (profileError) {
          console.error("Failed to fetch profile in fetchProjects:", profileError);
        }

        if (projects.length > 0 && !get().selectedProject) {
          await get().selectProject(projects[0]);
        }
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      } finally {
        set({ loading: false });
        projectsFetchPromise = null;
      }
    })();

    return projectsFetchPromise;
  },

  selectProject: async (project, persist = true) => {
    set({ selectedProject: project, loading: true });

    try {
      // Save last selected project to DB
      if (persist) {
        usersApi.updateProfile({ lastProjectId: project.id }).catch((err) => {
          console.error("Failed to save last selected project:", err);
        });
      }

      const environments = await environmentsApi.getByProject(project.id);
      set({ environments });
    } catch (error) {
      console.error("Failed to fetch environments for project:", error);
      set({ environments: [] });
    } finally {
      set({ loading: false });
    }
  },

  refreshProjects: async () => {
    set({ loading: true });
    try {
      const projects = await projectsApi.getAll();
      set({ projects });

      const current = get().selectedProject;
      if (current) {
        const freshCurrent = projects.find((p: Project) => p.id === current.id);
        if (freshCurrent) {
          set({ selectedProject: freshCurrent });
        } else {
          set({ selectedProject: projects.length > 0 ? projects[0] : null });
        }
      } else if (projects.length > 0) {
        get().selectProject(projects[0]);
      }
    } catch (error) {
      console.error("Failed to refresh projects:", error);
    } finally {
      set({ loading: false });
    }
  },

  createProject: async (data) => {
    await projectsApi.create(data);
    await get().refreshProjects();
  },

  deleteProject: async (id) => {
    await projectsApi.delete(id);
    await get().refreshProjects();
  },

  createEnvironment: async (projectId, data) => {
    await environmentsApi.create(projectId, data);
    const envs = await environmentsApi.getByProject(projectId);
    set({ environments: envs });
  },

  updateEnvironment: async (id, data) => {
    await environmentsApi.update(id, data);
    const projectId = get().selectedProject?.id;
    if (projectId) {
      const envs = await environmentsApi.getByProject(projectId);
      set({ environments: envs });
    }
  },

  deleteEnvironment: async (id) => {
    await environmentsApi.delete(id);
    const projectId = get().selectedProject?.id;
    if (projectId) {
      const envs = await environmentsApi.getByProject(projectId);
      set({ environments: envs });
    }
  },

  fetchEnvironments: async (projectId) => {
    set({ loading: true });
    try {
      const environments = await environmentsApi.getByProject(projectId);
      set({ environments });
    } catch (error) {
      console.error("Failed to fetch environments:", error);
    } finally {
      set({ loading: false });
    }
  },
}));
