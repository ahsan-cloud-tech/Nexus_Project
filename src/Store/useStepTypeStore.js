import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useStepTypeStore = create(
  persist(
    (set, get) => ({
      // Step types data from cards2 API
      stepTypesData: [],
      currentProjectId: null,
      lastFetchedAt: null,
      
      // Set all step types data
      setStepTypesData: (projectId, data) => {
        console.log('🗃️ Saving step types to Zustand store:', {
          projectId,
          count: data?.length || 0
        });
        
        set({
          stepTypesData: data,
          currentProjectId: projectId,
          lastFetchedAt: new Date().toISOString()
        });
      },
      
      // Get all step types
      getStepTypesData: () => {
        const state = get();
        return state.stepTypesData;
      },
      
      // ✅ NEW: Get all step_type values only
      getAllStepTypeValues: () => {
        const state = get();
        return state.stepTypesData.map(item => item.step_type);
      },
      
      // Get step type by step_id
      getStepTypeById: (stepId) => {
        const state = get();
        return state.stepTypesData.find(item => item.step_id === stepId);
      },
      
      // Get step type by step_type name
      getStepTypeByName: (stepType) => {
        const state = get();
        return state.stepTypesData.find(item => item.step_type === stepType);
      },
      
      // Get all step types for current project
      getStepTypesForProject: (projectId) => {
        const state = get();
        if (state.currentProjectId !== projectId) {
          return [];
        }
        return state.stepTypesData;
      },
      
      // Clear all step types data
      clearStepTypesData: () => {
        console.log('🗑️ Clearing step types data from Zustand store');
        set({
          stepTypesData: [],
          currentProjectId: null,
          lastFetchedAt: null
        });
      },
      
      // Update single step type
      updateStepType: (stepId, updates) => {
        const state = get();
        const updatedData = state.stepTypesData.map(item =>
          item.step_id === stepId ? { ...item, ...updates } : item
        );
        
        set({
          stepTypesData: updatedData,
          lastFetchedAt: new Date().toISOString()
        });
      },
      
      // Get project info
      getProjectInfo: () => {
        const state = get();
        return {
          projectId: state.currentProjectId,
          lastFetched: state.lastFetchedAt,
          totalStepTypes: state.stepTypesData.length
        };
      }
    }),
    {
      name: 'step-data-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        stepTypesData: state.stepTypesData,
        currentProjectId: state.currentProjectId,
        lastFetchedAt: state.lastFetchedAt
      })
    }
  )
);