// import { create } from 'zustand';
// import { persist, createJSONStorage } from 'zustand/middleware';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// export const useAuthStore = create(
//   persist(
//     (set, get) => ({
//       // State
//       userToken: null,
//       isLoading: true,
//       userData: null,
      
//       // Actions
//       setToken: (token) => set({ userToken: token }),
//       setUserData: (userData) => set({ userData }),
//       setLoading: (loading) => set({ isLoading: loading }),
      
//       // Login action
//       login: async (token, userData) => {
//         set({ userToken: token, userData });
//       },
      
//       // Logout action
//       logout: async () => {
//         set({ userToken: null, userData: null });
//         // Also remove from AsyncStorage for consistency
//         await AsyncStorage.removeItem('userToken');
//       },
      
//       // Check authentication
//       checkAuth: async () => {
//         try {
//           const token = await AsyncStorage.getItem('userToken');
//           if (token) {
//             set({ userToken: token, isLoading: false });
//           } else {
//             set({ userToken: null, isLoading: false });
//           }
//         } catch (error) {
//           console.error('Error checking auth:', error);
//           set({ userToken: null, isLoading: false });
//         }
//       },
//     }),
//     {
//       name: 'auth-storage', // unique name for storage
//       storage: createJSONStorage(() => AsyncStorage),
//       // Only save token in storage, not loading state
//       partialize: (state) => ({ 
//         userToken: state.userToken,
//         userData: state.userData 
//       }),
//     }
//   )
// );