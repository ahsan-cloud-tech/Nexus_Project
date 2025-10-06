import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface DesignFormData {
  id: string;
  taskId: string;
  details: string;
  comments: string;
  links: string;
  images: Array<{ uri: string; fileName: string }>;
  capturedPhoto: string | null;
  photoTimestamp: string | null;
  createdAt: string;
}

interface DesignStore {
  designForms: DesignFormData[];
  addDesignForm: (formData: Omit<DesignFormData, 'id' | 'createdAt'>) => void;
  updateDesignForm: (id: string, formData: Partial<DesignFormData>) => void;
  deleteDesignForm: (id: string) => void;
  getFormByTaskId: (taskId: string) => DesignFormData | undefined;
  clearAllForms: () => void;
}

export const useDesignStore = create<DesignStore>()(
  persist(
    (set, get) => ({
      designForms: [],
      
      addDesignForm: (formData) => {
        const newForm: DesignFormData = {
          ...formData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        };
        
        set((state) => ({
          designForms: [...state.designForms, newForm],
        }));
        
        console.log('Form saved to Zustand:', newForm);
      },
      
      updateDesignForm: (id, formData) => {
        set((state) => ({
          designForms: state.designForms.map((form) =>
            form.id === id ? { ...form, ...formData } : form
          ),
        }));
      },
      
      deleteDesignForm: (id) => {
        set((state) => ({
          designForms: state.designForms.filter((form) => form.id !== id),
        }));
      },
      
      getFormByTaskId: (taskId) => {
        return get().designForms.find((form) => form.taskId === taskId);
      },
      
      clearAllForms: () => {
        set({ designForms: [] });
      },
    }),
    {
      name: 'design-storage',
    }
  )
);