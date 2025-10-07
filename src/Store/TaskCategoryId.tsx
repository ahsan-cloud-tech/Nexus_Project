import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TaskCategory {
  _id: string;
  step_id: string;
  task_category: string;
  order: number;
  name: string;
  tasks: Array<{
    _id: string;
    task_id: string;
    name: string;
    progress: number;
    completion_string_date: string;
    completion_date: string;
    status: string;
  }>;
}

interface TaskCategoryState {
  taskCategories: TaskCategory[];
  setTaskCategories: (categories: TaskCategory[]) => void;
  getTaskCategoryById: (id: string) => TaskCategory | undefined;
  clearTaskCategories: () => void;
}

export const useTaskCategoryStore = create<TaskCategoryState>()(
  persist(
    (set, get) => ({
      taskCategories: [],
      
      setTaskCategories: (categories) => {
        console.log('💾 Setting task categories:', categories.length, 'items');
        set({ taskCategories: categories });
      },
      
      getTaskCategoryById: (id) => {
        return get().taskCategories.find(cat => cat._id === id || cat.step_id === id);
      },
      
      clearTaskCategories: () => {
        console.log('🗑️ Clearing task categories');
        set({ taskCategories: [] });
      },
    }),
    {
      name: 'task-category-storage',
      onRehydrateStorage: () => (state) => {
        console.log('🔄 Task Category Store rehydrated');
        if (state) {
          console.log('📦 Rehydrated categories:', state.taskCategories?.length || 0);
        }
      }
    }
  )
);