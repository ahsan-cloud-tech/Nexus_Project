// Store/finishesIds.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FinishesIdsState {
  stepId: string | null;
  progressIds: Record<string, string>; // taskId -> progressId mapping
  taskIds: Record<string, string>; // task name -> taskId mapping
  setFinishesIds: (stepId: string, progressIds: Record<string, string>, taskIds: Record<string, string>) => void;
  getProgressId: (taskId: string) => string | null;
  getTaskId: (taskName: string) => string | null;
  clearFinishesIds: () => void;
}

export const useFinishesIdsStore = create<FinishesIdsState>()(
  persist(
    (set, get) => ({
      stepId: null,
      progressIds: {},
      taskIds: {},
      
      setFinishesIds: (stepId: string, progressIds: Record<string, string>, taskIds: Record<string, string>) => {
        set({ stepId, progressIds, taskIds });
      },
      
      getProgressId: (taskId: string) => {
        const state = get();
        return state.progressIds[taskId] || null;
      },
      
      getTaskId: (taskName: string) => {
        const state = get();
        return state.taskIds[taskName] || null;
      },
      
      clearFinishesIds: () => {
        set({ stepId: null, progressIds: {}, taskIds: {} });
      },
    }),
    {
      name: 'finishes-ids-storage',
    }
  )
);