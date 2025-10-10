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
      designId: null, // New state for design ID
      
      // ✅ NEW: Building, Level & Unit State
      selectedBuildingId: null,
      selectedBuildingName: null,
      selectedLevelId: null,
      selectedLevelName: null,
      selectedUnitName: null,
      
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
      
      // New action to set design ID
      setDesignId: (designId) => {
        console.log('💾 Setting design ID:', designId);
        set({ designId });
      },
      
      setProjectCardsData: (cardsData) => {
        console.log('🔄 Setting projectCardsData:', cardsData.length, 'items');
        set({ projectCardsData: cardsData });
      },
      
      setProjectStepTypes: (stepTypes) => {
        console.log('🔄 Setting projectStepTypes:', stepTypes.length, 'items');
        set({ projectStepTypes: stepTypes });
      },
      
      // ✅ NEW: Building Selection Actions
      setSelectedBuildingId: (buildingId) => {
        console.log('🏢 Setting selected building ID:', buildingId);
        set({ selectedBuildingId: buildingId });
      },
      
      setSelectedBuildingName: (buildingName) => {
        console.log('🏢 Setting selected building name:', buildingName);
        set({ selectedBuildingName: buildingName });
      },
      
      setSelectedBuilding: (buildingId, buildingName = null) => {
        console.log('🏢 Setting selected building:', { buildingId, buildingName });
        set({ 
          selectedBuildingId: buildingId,
          selectedBuildingName: buildingName 
        });
      },
      
      // ✅ NEW: Level Selection Actions
      setSelectedLevelId: (levelId) => {
        console.log('🏗️ Setting selected level ID:', levelId);
        set({ selectedLevelId: levelId });
      },
      
      setSelectedLevelName: (levelName) => {
        console.log('🏗️ Setting selected level name:', levelName);
        set({ selectedLevelName: levelName });
      },
      
      setSelectedLevel: (levelId, levelName = null) => {
        console.log('🏗️ Setting selected level:', { levelId, levelName });
        set({ 
          selectedLevelId: levelId,
          selectedLevelName: levelName 
        });
      },
      
      // ✅ NEW: Unit Selection Actions
      setSelectedUnitName: (unitName) => {
        console.log('🏠 Setting selected unit name:', unitName);
        set({ selectedUnitName: unitName });
      },
      
      // ✅ NEW: Combined Location Setter
      setSelectedLocation: (buildingId, buildingName, levelId, levelName, unitName) => {
        console.log('📍 Setting selected location:', {
          buildingId,
          buildingName,
          levelId,
          levelName,
          unitName
        });
        set({
          selectedBuildingId: buildingId,
          selectedBuildingName: buildingName,
          selectedLevelId: levelId,
          selectedLevelName: levelName,
          selectedUnitName: unitName
        });
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
      
      // ✅ NEW: Get current location data
      getCurrentLocation: () => {
        const state = get();
        return {
          buildingId: state.selectedBuildingId,
          buildingName: state.selectedBuildingName,
          levelId: state.selectedLevelId,
          levelName: state.selectedLevelName,
          unitName: state.selectedUnitName
        };
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
          projectStepTypes: [],
          designId: null, // Also clear designId
          // ✅ NEW: Clear building, level, and unit data
          selectedBuildingId: null,
          selectedBuildingName: null,
          selectedLevelId: null,
          selectedLevelName: null,
          selectedUnitName: null
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
      
      // Clear only design ID
      clearDesignId: () => {
        console.log('🗑️ Clearing design ID');
        set({ designId: null });
      },
      
      // ✅ NEW: Clear only building selection
      clearBuildingSelection: () => {
        console.log('🗑️ Clearing building selection');
        set({ 
          selectedBuildingId: null,
          selectedBuildingName: null
        });
      },
      
      // ✅ NEW: Clear only level selection
      clearLevelSelection: () => {
        console.log('🗑️ Clearing level selection');
        set({ 
          selectedLevelId: null,
          selectedLevelName: null
        });
      },
      
      // ✅ NEW: Clear only unit selection
      clearUnitSelection: () => {
        console.log('🗑️ Clearing unit selection');
        set({ selectedUnitName: null });
      },
      
      // ✅ NEW: Clear all location data
      clearLocationData: () => {
        console.log('🗑️ Clearing all location data');
        set({
          selectedBuildingId: null,
          selectedBuildingName: null,
          selectedLevelId: null,
          selectedLevelName: null,
          selectedUnitName: null
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
            designId: state.designId,
            // ✅ NEW: Log building, level, and unit data
            selectedBuildingId: state.selectedBuildingId,
            selectedBuildingName: state.selectedBuildingName,
            selectedLevelId: state.selectedLevelId,
            selectedLevelName: state.selectedLevelName,
            selectedUnitName: state.selectedUnitName,
          });
        }
      }
    }
  )
);

// ✅ NEW: Export individual hooks for better usage
export const useSelectedProject = () => useProjectStore(state => ({
  projectId: state.selectedProjectId,
  projectData: state.projectData,
  setSelectedProjectId: state.setSelectedProjectId,
  setProjectData: state.setProjectData,
  clearProjectData: state.clearProjectData
}));

export const useSelectedStep = () => useProjectStore(state => ({
  stepType: state.selectedStepType,
  stepId: state.selectedStepId,
  setSelectedStepType: state.setSelectedStepType,
  setSelectedStepId: state.setSelectedStepId,
  clearStepSelection: state.clearStepSelection
}));

export const useSelectedLocation = () => useProjectStore(state => ({
  buildingId: state.selectedBuildingId,
  buildingName: state.selectedBuildingName,
  levelId: state.selectedLevelId,
  levelName: state.selectedLevelName,
  unitName: state.selectedUnitName,
  setSelectedBuilding: state.setSelectedBuilding,
  setSelectedLevel: state.setSelectedLevel,
  setSelectedUnitName: state.setSelectedUnitName,
  setSelectedLocation: state.setSelectedLocation,
  getCurrentLocation: state.getCurrentLocation,
  clearLocationData: state.clearLocationData,
  clearBuildingSelection: state.clearBuildingSelection,
  clearLevelSelection: state.clearLevelSelection,
  clearUnitSelection: state.clearUnitSelection
}));

export const useProjectStepTypes = () => useProjectStore(state => ({
  stepTypes: state.projectStepTypes,
  setProjectStepTypes: state.setProjectStepTypes,
  getAllStepTypes: state.getAllStepTypes,
  getStepTypeById: state.getStepTypeById,
  getStepTypeByType: state.getStepTypeByType
}));

export const useDesignId = () => useProjectStore(state => ({
  designId: state.designId,
  setDesignId: state.setDesignId,
  clearDesignId: state.clearDesignId
}));

export default useProjectStore;