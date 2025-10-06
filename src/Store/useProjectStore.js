// 
// import { persist } from 'zustand/middleware';

// export const useProjectStore = create(
//   persist(
//     (set, get) => ({
//       selectedProjectId: null,
//       projectData: null,
//       selectedStepType: null,
//       selectedStepId: null,
//       projectCardsData: [],
//       projectStepTypes: [],
//       setSelectedProjectId: (projectId) => {
//         console.log('🔄 Setting selectedProjectId:', projectId);
//         set({ selectedProjectId: projectId });
//       },
      
//       setProjectData: (data) => set({ projectData: data }),
      
//       setSelectedStepType: (stepType) => {
//         console.log('🔄 setSelectedStepType called with:', stepType);
//         console.log('📝 Previous selectedStepType:', get().selectedStepType);
        
//         set({ 
//           selectedStepType: stepType
//         });
        
//         console.log('✅ New selectedStepType:', get().selectedStepType);
//       },
      
//       setProjectCardsData: (cardsData) => {
//         set({ projectCardsData: cardsData });
//       },
      
//       setProjectStepTypes: (stepTypes) => {
//         console.log('🔄 Setting projectStepTypes:', stepTypes.length, 'items');
//         set({ projectStepTypes: stepTypes });
//       },
      
//       getAllStepTypes: () => {
//         const state = get();
//         return state.projectStepTypes;
//       },
      
//       getStoreState: () => {
//         return get();
//       },
      
//       clearProjectData: () => set({ 
//         selectedProjectId: null, 
//         projectData: null,
//         selectedStepType: null,
//         selectedStepId: null,
//         projectCardsData: [],
//         projectStepTypes: []
//       }),
//     }),
//     {
//       name: 'project-storage',
//       onRehydrateStorage: () => (state) => {
//         console.log('🔄 Store rehydrated:', state);
//       }
//     }
//   )
// );

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useProjectStore = create(
  persist(
    (set, get) => ({
      // State
      selectedProjectId: null,
      projectData: null,
      selectedStepType: null,
      selectedStepId: null,
      projectCardsData: [],
      projectStepTypes: [],
      
      // Actions
      setSelectedProjectId: (projectId) => {
        console.log('🔄 Setting selectedProjectId:', projectId);
        set({ selectedProjectId: projectId });
      },
      
      setProjectData: (data) => {
        console.log('🔄 Setting projectData');
        set({ projectData: data });
      },
      
      setSelectedStepType: (stepType) => {
        console.log('🔄 setSelectedStepType called with:', stepType);
        console.log('📝 Previous selectedStepType:', get().selectedStepType);
        
        set({ 
          selectedStepType: stepType
        });
        
        console.log('✅ New selectedStepType:', get().selectedStepType);
      },
      
      setSelectedStepId: (stepId) => {
        console.log('🔄 setSelectedStepId called with:', stepId);
        console.log('📝 Previous selectedStepId:', get().selectedStepId);
        
        set({ 
          selectedStepId: stepId
        });
        
        console.log('✅ New selectedStepId:', get().selectedStepId);
      },
      
      setProjectCardsData: (cardsData) => {
        console.log('🔄 Setting projectCardsData:', cardsData.length, 'items');
        set({ projectCardsData: cardsData });
      },
      
      setProjectStepTypes: (stepTypes) => {
        console.log('🔄 Setting projectStepTypes:', stepTypes.length, 'items');
        set({ projectStepTypes: stepTypes });
      },
      
      // Getters
      getAllStepTypes: () => {
        const state = get();
        return state.projectStepTypes;
      },
      
      getStepTypeById: (stepId) => {
        const state = get();
        return state.projectStepTypes.find(step => step.step_id === stepId || step._id === stepId);
      },
      
      getStepTypeByType: (stepType) => {
        const state = get();
        return state.projectStepTypes.find(step => step.step_type === stepType);
      },
      
      getStoreState: () => {
        return get();
      },
      
      // Clear all project data
      clearProjectData: () => {
        console.log('🗑️ Clearing all project data');
        set({ 
          selectedProjectId: null, 
          projectData: null,
          selectedStepType: null,
          selectedStepId: null,
          projectCardsData: [],
          projectStepTypes: []
        });
      },
      
      // Clear only step selection (useful when navigating between steps)
      clearStepSelection: () => {
        console.log('🗑️ Clearing step selection');
        set({ 
          selectedStepType: null,
          selectedStepId: null,
        });
      },
    }),
    {
      name: 'project-storage',
      onRehydrateStorage: () => (state) => {
        console.log('🔄 Store rehydrated');
        if (state) {
          console.log('📦 Rehydrated state:', {
            selectedProjectId: state.selectedProjectId,
            selectedStepType: state.selectedStepType,
            selectedStepId: state.selectedStepId,
            projectStepTypes: state.projectStepTypes?.length || 0,
          });
        }
      }
    }
  )
);