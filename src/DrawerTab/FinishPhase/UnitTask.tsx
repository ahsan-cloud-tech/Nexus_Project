import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  PermissionsAndroid,
  Image,
  GestureResponderEvent,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native';
import Header from '../../Components/Header';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import EditBtn from '../../Components/EditBtn';
import Slider from '@react-native-community/slider';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import Svg, { Path, Rect, Text as SvgText } from 'react-native-svg';
import MultilineInput from '../../Components/MultilineInput';
import { launchImageLibrary } from 'react-native-image-picker';
import { useDesignStore, DesignFormData } from '../../Store/designStore';
import { useProjectStore } from '../../Store/useProjectStore';
import { useFinishesIdsStore } from '../../Store/finishesIds';
import { baseUrl } from '../../utils/Api';

// API Service functions
const fetchUnitCompletionData = async (
  projectId: string,
  stepId: string,
  buildingId: string,
  levelId: string,
  unitName: string,
  bearerToken: string
) => {
  try {
    console.log('🔍 Completion API Call URL:', `${baseUrl}/reports/overall_completion/unit_wise?project_id=${projectId}&step_type=${stepId}&building=${buildingId}&level=${levelId}&unit_name=${unitName}`);
    
    const response = await fetch(
      `${baseUrl}/reports/overall_completion/unit_wise?project_id=${projectId}&step_type=${stepId}&building=${buildingId}&level=${levelId}&unit_name=${unitName}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${bearerToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('📡 Completion API Response Status:', response.status);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    console.log('🔍 RAW COMPLETION API RESPONSE:', JSON.stringify(data, null, 2));
    
    return data;
  } catch (error) {
    console.error('❌ Error fetching completion data:', error);
    throw error;
  }
};

// New API function for tasks data
const fetchTasksData = async (
  projectId: string,
  stepId: string,
  buildingId: string,
  levelId: string,
  unitName: string,
  bearerToken: string
) => {
  try {
    console.log('🔍 Tasks API Call URL:', `${baseUrl}/projects/unit_wise/${projectId}?step_type=${stepId}&building=${buildingId}&level=${levelId}&unit_name=${unitName}`);
    
    const response = await fetch(
      `${baseUrl}/projects/unit_wise/${projectId}?step_type=${stepId}&building=${buildingId}&level=${levelId}&unit_name=${unitName}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${bearerToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('📡 Tasks API Response Status:', response.status);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    console.log('🔍 RAW TASKS API RESPONSE:', JSON.stringify(data, null, 2));
    
    return data;
  } catch (error) {
    console.error('❌ Error fetching tasks data:', error);
    throw error;
  }
};

// ✅ NEW: PATCH API function for updating progress
const updateTaskProgress = async (
  projectId: string,
  requestData: any,
  bearerToken: string
) => {
  try {
    console.log('🔄 PATCH API Call URL:', `${baseUrl}/projects/action-finishes-step2?id=${projectId}`);
    console.log('📦 PATCH API Request Data:', JSON.stringify(requestData, null, 2));

    const response = await fetch(
      `${baseUrl}/projects/action-finishes-step2?id=${projectId}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${bearerToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      }
    );

    console.log('📡 PATCH API Response Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ PATCH API Error Response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ PATCH API Success Response:', JSON.stringify(data, null, 2));
    
    return data;
  } catch (error) {
    console.error('❌ Error updating task progress:', error);
    throw error;
  }
};

export default function UnitTask() {
  const navigation = useNavigation();
  
  // ✅ Get data from Zustand stores
  const {
    selectedProjectId: projectId,
    selectedStepId: stepId,
    selectedBuildingId: buildingId,
    selectedLevelId: levelId,
    selectedUnitName: unitName,
  } = useProjectStore();
  
  // ✅ Get finishes IDs store
  const { setFinishesIds, getProgressId, getTaskId } = useFinishesIdsStore();
  
  // ✅ Get token from Redux store
  const token = useSelector(state => state.auth.token);

  console.log('🚀 UnitTask Component - Initial Data:', {
    projectId,
    stepId,
    buildingId,
    levelId,
    unitName,
    hasToken: !!token
  });

  type TaskItem = { 
    id: string; 
    title: string; 
    date: string; 
    progress: number;
    completion_value?: number;
    hold: boolean;
    step_id?: string;
    progress_id?: string;
    task_id?: string;
    type?: string; // ✅ NEW: Add type field
  };

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isEditTextModalVisible, setIsEditTextModalVisible] = useState<boolean>(false);
  const [isCameraVisible, setIsCameraVisible] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<TaskItem | null>(null);
  const [cameraDevice, setCameraDevice] = useState<'back' | 'front'>('back');
  const [capturedPhotoPath, setCapturedPhotoPath] = useState<string | null>(null);
  const [photoTimestamp, setPhotoTimestamp] = useState<string | null>(null);
  const [isDrawingVisible, setIsDrawingVisible] = useState(false);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [strokeColor, setStrokeColor] = useState<string>('#ff0000');
  const [strokeWidth] = useState<number>(4);
  const [selectedImages, setSelectedImages] = useState<Array<{ uri: string; fileName: string }>>([]);
  const [isTextMode, setIsTextMode] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [textElements, setTextElements] = useState<Array<{ id: string; text: string; x: number; y: number; color: string }>>([]);
  const [currentTextPosition, setCurrentTextPosition] = useState<{ x: number; y: number } | null>(null);
  const [showTextInputModal, setShowTextInputModal] = useState(false);

  // New states for API loading and data
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isTasksLoading, setIsTasksLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false); // ✅ NEW: Saving state
  const [completionData, setCompletionData] = useState<any>(null);
  const [tasksData, setTasksData] = useState<any>(null);
  const [overallCompletion, setOverallCompletion] = useState<number>(0);
  const [categoryName, setCategoryName] = useState<string>('Finishes');
  const [hasHoldPoint, setHasHoldPoint] = useState<boolean>(false);

  // New states for detail modal
  const [isDetailModalVisible, setIsDetailModalVisible] = useState<boolean>(false);
  const [selectedFormData, setSelectedFormData] = useState<DesignFormData | null>(null);

  // New state for image detail modal
  const [isImageDetailModalVisible, setIsImageDetailModalVisible] = useState<boolean>(false);
  const [selectedImageData, setSelectedImageData] = useState<{
    image: { uri: string; fileName: string } | null;
    capturedPhoto: string | null;
    formData: DesignFormData | null;
  }>({
    image: null,
    capturedPhoto: null,
    formData: null,
  });

  // Zustand stores
  const { designForms, addDesignForm, updateDesignForm, getFormByTaskId } = useDesignStore();

  const cameraRef = useRef<Camera>(null);
  const drawingStageRef = useRef<View>(null);

  // drawing state
  type DrawPath = {
    id: string;
    color: string;
    width: number;
    points: { x: number; y: number }[];
  };
  const [paths, setPaths] = useState<DrawPath[]>([]);
  const [currentPath, setCurrentPath] = useState<DrawPath | null>(null);

  // Initial data - will be replaced by API data
  const [data, setData] = useState<TaskItem[]>([
    {
      id: '1',
      title: '1.1 Waterproof (Int)',
      date: '09/12/24',
      progress: 0,
      hold: false,
    },
    {
      id: '2',
      title: '1.2  Waterproof (Ext.)',
      date: '31/12/24',
      progress: 25,
      hold: false,
    },
    {
      id: '3',
      title: '1.3  Bed and Bath/Balconies',
      date: '01/01/25',
      progress: 50,
      hold: false,
    },
    {
      id: '4',
      title: '1.4 Tiles - Bath/ Laun',
      date: '01/01/25',
      progress: 75,
      hold: false,
    },
    {
      id: '5',
      title: '1.5 Tile Balconies',
      date: '01/01/25',
      progress: 100,
      hold: false,
    },
  ]);

  const [modalForm, setModalForm] = useState<{
    details: string;
    comments: string;
    links: string;
  }>({
    details: '',
    comments: '',
    links: '',
  });

  // ✅ Fetch completion data when component mounts or dependencies change
  useEffect(() => {
    console.log('🚀 Component mounted with params:', {
      projectId,
      stepId, 
      buildingId,
      levelId,
      unitName,
      hasToken: !!token
    });

    if (projectId && stepId && buildingId && levelId && unitName && token) {
      fetchCompletionData();
      fetchTasksDataFromAPI();
    } else {
      console.log('❌ Missing required parameters for API call:', {
        projectId: !!projectId,
        stepId: !!stepId,
        buildingId: !!buildingId,
        levelId: !!levelId,
        unitName: !!unitName,
        token: !!token
      });
    }
  }, [projectId, stepId, buildingId, levelId, unitName, token]);

  const fetchCompletionData = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Fetching completion data with params:', {
        projectId,
        stepId,
        buildingId,
        levelId,
        unitName
      });

      const data = await fetchUnitCompletionData(
        projectId,
        stepId,
        buildingId,
        levelId,
        unitName,
        token
      );

      console.log('✅ Completion data received - STRUCTURE:', {
        hasData: !!data,
        dataType: typeof data,
        isArray: Array.isArray(data),
        keys: data ? Object.keys(data) : 'No data'
      });

      // ✅ Process the API data and update tasks
      if (data && data.tasks) {
        console.log('📊 Tasks data found:', {
          tasksCount: data.tasks.length,
          tasksSample: data.tasks.slice(0, 2)
        });

        const updatedData = data.tasks.map((task: any) => ({
          id: task.task_id || task.id,
          title: task.task_name || task.title,
          date: task.date || 'N/A',
          progress: task.completion_value || 0,
          completion_value: task.completion_value || 0,
          hold: task.hold || false,
        }));
        
        setData(updatedData);
        
        // ✅ Check if API response has overall_completion field
        if (data.overall_completion !== undefined) {
          console.log('🎯 API se direct overall_completion mila:', data.overall_completion);
          setOverallCompletion(parseFloat(data.overall_completion));
        } else if (data.overall_completion_percentage !== undefined) {
          console.log('🎯 API se overall_completion_percentage mila:', data.overall_completion_percentage);
          setOverallCompletion(parseFloat(data.overall_completion_percentage));
        } else {
          console.log('⚠️ API response mein direct overall_completion nahi mila, tasks se calculate karna hoga');
        }

      } else {
        console.log('⚠️ No tasks data found in API response');
      }

    } catch (error) {
      console.error('❌ Error fetching completion data:', error);
      Alert.alert('Error', 'Failed to fetch completion data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ New function to fetch tasks data
  const fetchTasksDataFromAPI = async () => {
    try {
      setIsTasksLoading(true);
      console.log('🔄 Fetching tasks data with params:', {
        projectId,
        stepId,
        buildingId,
        levelId,
        unitName
      });

      const data = await fetchTasksData(
        projectId,
        stepId,
        buildingId,
        levelId,
        unitName,
        token
      );

      console.log('✅ Tasks data received - STRUCTURE:', {
        hasData: !!data,
        dataType: typeof data,
        isArray: Array.isArray(data),
        keys: data ? Object.keys(data) : 'No data'
      });

      if (data && data.data && data.data.length > 0) {
        const finishesData = data.data[0];
        console.log('📊 Finishes data found:', {
          stepId: finishesData.step_id,
          name: finishesData.name,
          tasksCount: finishesData.tasks?.length || 0
        });

        // ✅ Set category name from API
        if (finishesData.name) {
          setCategoryName(finishesData.name);
        }

        // ✅ Process tasks and save IDs to store
        if (finishesData.tasks && finishesData.tasks.length > 0) {
          const progressIds: Record<string, string> = {};
          const taskIds: Record<string, string> = {};
          let hasHold = false;

          const tasksWithIds = finishesData.tasks.map((task: any) => {
            // Check if any task has hold true
            if (task.hold) {
              hasHold = true;
            }

            // Save IDs to store
            if (task._id && task.progress_all && task.progress_all.length > 0) {
              progressIds[task._id] = task.progress_all[0]._id;
            }
            if (task.name && task._id) {
              taskIds[task.name] = task._id;
            }

            return {
              id: task._id,
              title: task.name,
              date: task.progress_all && task.progress_all.length > 0 ? 
                    task.progress_all[0].completion_string_date || 'N/A' : 'N/A',
              progress: task.progress_all && task.progress_all.length > 0 ? 
                       task.progress_all[0].progress || 0 : 0,
              hold: task.hold || false,
              step_id: finishesData.step_id,
              progress_id: task.progress_all && task.progress_all.length > 0 ? 
                          task.progress_all[0]._id : null,
              task_id: task._id,
              type: task.type || 'task' // ✅ NEW: Get type from API response
            };
          });

          // ✅ Set hold point status
          setHasHoldPoint(hasHold);

          // ✅ Save IDs to Zustand store
          setFinishesIds(finishesData.step_id, progressIds, taskIds);
          
          // ✅ Update the tasks data
          setData(tasksWithIds);
          setTasksData(finishesData);

          console.log('💾 Saved to FinishesIds Store:', {
            stepId: finishesData.step_id,
            progressIdsCount: Object.keys(progressIds).length,
            taskIdsCount: Object.keys(taskIds).length,
            hasHoldPoint: hasHold
          });
        }
      } else {
        console.log('⚠️ No tasks data found in API response');
      }

    } catch (error) {
      console.error('❌ Error fetching tasks data:', error);
      Alert.alert('Error', 'Failed to fetch tasks data. Please try again.');
    } finally {
      setIsTasksLoading(false);
    }
  };

  // ✅ NEW: Function to handle save changes and call PATCH API
  const handleSaveChanges = async () => {
    try {
      setIsSaving(true);
      
      console.log('💾 Saving changes for project:', projectId);
      console.log('📊 Current data to save:', data);

      // Prepare all tasks data for API
      const updatePromises = data.map(async (task) => {
        // Get form data for this task
        const formData = getFormByTaskId(task.id);
        
        // Prepare request data according to API structure
        const requestData = {
          step_id: task.step_id || stepId, // Use task step_id or fallback to global stepId
          task_id: task.task_id || task.id, // Use task_id or fallback to id
          progress_id: task.progress_id || getProgressId(task.id), // Get from store
          type: task.type || 'task', // Get type from task data
          comment: formData?.comments || '', // Get comments from form data
          progress: task.completion_value !== undefined ? task.completion_value : task.progress, // Use completion_value or progress
          images: formData?.images?.map(img => img.uri) || [], // Get image URIs
          links: formData?.links || '', // Get links from form data
        };

        console.log(`📤 Sending data for task ${task.title}:`, requestData);

        // Call PATCH API for each task
        return updateTaskProgress(projectId, requestData, token);
      });

      // Wait for all API calls to complete
      const results = await Promise.all(updatePromises);
      
      console.log('✅ All tasks updated successfully:', results);
      
      // Exit editing mode
      setIsEditing(false);
      
      Alert.alert('Success', 'All changes have been saved successfully!');
      
    } catch (error) {
      console.error('❌ Error saving changes:', error);
      Alert.alert('Error', 'Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const getFileName = (fullPath: string) => {
    const parts = fullPath.split(/[\\\/]/);
    return parts[parts.length - 1] || '';
  };

  const AnySlider: any = Slider;

  // Correct useCameraDevice usage
  const backDevice = useCameraDevice('back');
  const frontDevice = useCameraDevice('front');
  const device = cameraDevice === 'back' ? backDevice : frontDevice;

  useEffect(() => {
    (async () => {
      try {
        if (Platform.OS === 'android') {
          const granted = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.CAMERA,
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          ]);

          if (
            granted['android.permission.CAMERA'] !==
              PermissionsAndroid.RESULTS.GRANTED ||
            granted['android.permission.RECORD_AUDIO'] !==
              PermissionsAndroid.RESULTS.GRANTED
          ) {
            Alert.alert(
              'Permission denied',
              'Camera & Audio access is required.',
            );
            return;
          }
        }

        const cameraPermission = await Camera.requestCameraPermission();
        const microphonePermission = await Camera.requestMicrophonePermission();

        if (
          cameraPermission !== 'granted' ||
          microphonePermission !== 'granted'
        ) {
          Alert.alert(
            'Permission denied',
            'Please enable Camera & Mic in settings.',
          );
        }
      } catch (error) {
        console.error('Permission error:', error);
      }
    })();
  }, []);

  // Load existing form data when modal opens
  useEffect(() => {
    if (isEditTextModalVisible && selectedItem) {
      const existingForm = getFormByTaskId(selectedItem.id);
      if (existingForm) {
        setModalForm({
          details: existingForm.details || '',
          comments: existingForm.comments || '',
          links: existingForm.links || '',
        });
        setSelectedImages(existingForm.images || []);
        setCapturedPhotoPath(existingForm.capturedPhoto || null);
        setPhotoTimestamp(existingForm.photoTimestamp || null);
      } else {
        // Reset form if no existing data
        setModalForm({
          details: '',
          comments: '',
          links: '',
        });
        setSelectedImages([]);
        setCapturedPhotoPath(null);
        setPhotoTimestamp(null);
      }
    }
  }, [isEditTextModalVisible, selectedItem]);

  const formatTimestamp = (date: Date) => {
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    const d = `${pad(date.getDate())}/${pad(
      date.getMonth() + 1,
    )}/${date.getFullYear()}`;
    const t = `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
      date.getSeconds(),
    )}`;
    return `${d} ${t}`;
  };

  const cameraOverlayTitle = useMemo(() => {
    if (!selectedItem) return '';
    return `${selectedItem.title} — ${formatTimestamp(new Date())}`;
  }, [selectedItem, isCameraVisible]);

  const handleProgressChange = (itemId: string, newValue: number) => {
    const updatedData = data.map(item =>
      item.id === itemId ? { ...item, progress: newValue } : item,
    );
    setData(updatedData);
  };

  const getProgressBarColor = (progress: number) => {
    if (progress < 50) return '#ff4500';
    if (progress < 75) return '#ffa500';
    return '#4caf50';
  };

  const handleEditTextPress = (item: TaskItem) => {
    setSelectedItem(item);
    setIsEditTextModalVisible(true);
  };

  const handleViewEditPress = (item: TaskItem) => {
    const existingForm = getFormByTaskId(item.id);
    setSelectedItem(item);
    setSelectedFormData(existingForm || null);
    setIsDetailModalVisible(true);
  };

  // New function to handle image click
  const handleImageClick = (
    imageData: { uri: string; fileName: string } | null,
    capturedPhoto: string | null,
  ) => {
    const formData = getFormByTaskId(selectedItem?.id || '');
    if (formData) {
      setSelectedImageData({
        image: imageData,
        capturedPhoto: capturedPhoto,
        formData: formData,
      });
      setIsImageDetailModalVisible(true);
    }
  };

  const resetFormState = () => {
    setModalForm({
      details: '',
      comments: '',
      links: '',
    });
    setSelectedImages([]);
    setCapturedPhotoPath(null);
    setPhotoTimestamp(null);
    setPaths([]);
    setCurrentPath(null);
    setTextElements([]);
    setTextInput('');
    setCurrentTextPosition(null);
    setIsTextMode(false);
    setShowTextInputModal(false);
    setIsDrawingMode(false);
  };

  const handleModalClose = () => {
    setIsEditTextModalVisible(false);
    setSelectedItem(null);
    resetFormState();
  };

  const handleModalSubmit = () => {
    if (!selectedItem) {
      Alert.alert('Error', 'No task selected');
      return;
    }

    // Check if at least one field is filled
    if (
      !modalForm.details.trim() &&
      !modalForm.comments.trim() &&
      !modalForm.links.trim() &&
      selectedImages.length === 0 &&
      !capturedPhotoPath
    ) {
      Alert.alert(
        'Warning',
        'Please fill at least one field before submitting.',
      );
      return;
    }

    try {
      const formData = {
        taskId: selectedItem.id,
        details: modalForm.details,
        comments: modalForm.comments,
        links: modalForm.links,
        images: selectedImages,
        capturedPhoto: capturedPhotoPath,
        photoTimestamp: photoTimestamp || formatTimestamp(new Date()),
      };

      addDesignForm(formData);

      // Reset form state after successful submission
      resetFormState();

      // Close modal immediately after successful submission
      handleModalClose();

      // Show success message after modal is closed
      setTimeout(() => {
        Alert.alert('Success', 'Form submitted successfully!', [
          { text: 'OK' },
        ]);
      }, 100);

      console.log('Form saved to Zustand:', formData);
    } catch (error) {
      console.error('Error saving form:', error);
      Alert.alert('Error', 'Failed to save form data. Please try again.');
    }
  };

  // ✅ Console mein overall completion value show karo
  useEffect(() => {
    console.log('🎯 OVERALL COMPLETION VALUE:', overallCompletion + '%');
  }, [overallCompletion]);

  // Function to handle multiple image selection
  const handleDocumentIconPress = () => {
    const options = {
      mediaType: 'photo' as const,
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8,
      selectionLimit: 10,
      includeExtra: true,
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
        Alert.alert('Error', 'Failed to select images');
      } else if (response.assets && response.assets.length > 0) {
        const newImages = response.assets.map(asset => ({
          uri: asset.uri!,
          fileName: asset.fileName || getFileName(asset.uri!) || 'image.jpg',
        }));
        setSelectedImages(prev => [...prev, ...newImages]);
      }
    });
  };

  // Function to remove a selected image
  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeCapturedPhoto = () => {
    setCapturedPhotoPath(null);
    setPaths([]);
    setCurrentPath(null);
    setTextElements([]);
    setPhotoTimestamp(null);
  };

  const handleRetakePhoto = () => {
    setPaths([]);
    setCurrentPath(null);
    setTextElements([]);
    setIsTextMode(false);
    setShowTextInputModal(false);
    setTextInput('');
    setCurrentTextPosition(null);
    setCapturedPhotoPath(null);
    setPhotoTimestamp(null);
    setIsDrawingVisible(false);
    setIsCameraVisible(true);
  };

  // Function to handle text addition
  const handleAddText = () => {
    setIsTextMode(true);
    setShowTextInputModal(true);
    setTextInput('');
    setCurrentTextPosition(null);
  };

  // Function to handle canvas tap for text placement
  const handleCanvasTap = (e: GestureResponderEvent) => {
    if (!isTextMode || !showTextInputModal) return;

    const { locationX, locationY } = e.nativeEvent;
    console.log('Text placement at:', locationX, locationY);
    setCurrentTextPosition({ x: locationX, y: locationY });

    // Auto-confirm text placement if text is already entered
    if (textInput.trim()) {
      handleConfirmText();
    }
  };

  // Function to confirm text placement
  const handleConfirmText = () => {
    if (textInput.trim() && currentTextPosition) {
      const newTextElement = {
        id: `text-${Date.now()}`,
        text: textInput,
        x: currentTextPosition.x,
        y: currentTextPosition.y,
        color: strokeColor,
      };
      console.log('Adding text element:', newTextElement);
      setTextElements(prev => [...prev, newTextElement]);
      setTextInput('');
      setCurrentTextPosition(null);
      setIsTextMode(false);
      setShowTextInputModal(false);
    } else if (textInput.trim() && !currentTextPosition) {
      // If text is entered but no position selected, place at center
      const { width, height } = Dimensions.get('window');
      const centerPosition = { x: width / 2, y: height / 2 };
      const newTextElement = {
        id: `text-${Date.now()}`,
        text: textInput,
        x: centerPosition.x,
        y: centerPosition.y,
        color: strokeColor,
      };
      console.log('Adding text element at center:', newTextElement);
      setTextElements(prev => [...prev, newTextElement]);
      setTextInput('');
      setCurrentTextPosition(null);
      setIsTextMode(false);
      setShowTextInputModal(false);
    } else {
      Alert.alert('Error', 'Please enter text');
    }
  };

  // Function to remove text element
  const removeTextElement = (id: string) => {
    setTextElements(prev => prev.filter(text => text.id !== id));
  };

  // Function to cancel text mode
  const handleCancelText = () => {
    setIsTextMode(false);
    setTextInput('');
    setCurrentTextPosition(null);
    setShowTextInputModal(false);
  };

  // Function to download all submitted data
  const handleDownloadAllData = async (formData: DesignFormData) => {
    try {
      Alert.alert(
        'Download All Data',
        'This will download all submitted data including images, comments, and links as a comprehensive report.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Download',
            onPress: async () => {
              try {
                // Simulate download process
                console.log('Starting download of all data:', formData);

                // Create a comprehensive data object
                const downloadData = {
                  taskId: formData.taskId,
                  taskTitle:
                    data.find(item => item.id === formData.taskId)?.title ||
                    'Unknown Task',
                  submissionDate: formData.photoTimestamp || 'Unknown Date',
                  details: formData.details,
                  comments: formData.comments,
                  links: formData.links,
                  imagesCount: formData.images.length,
                  hasCapturedPhoto: !!formData.capturedPhoto,
                  totalAttachments:
                    formData.images.length + (formData.capturedPhoto ? 1 : 0),
                };

                // In a real implementation, you would:
                // 1. Create a PDF report with all the data
                // 2. Compress images and attachments
                // 3. Generate a downloadable file
                // 4. Use a file system library to save the file

                // For now, we'll simulate the download process
                setTimeout(() => {
                  Alert.alert(
                    'Download Complete',
                    `All data for task "${downloadData.taskTitle}" has been downloaded successfully!\n\n` +
                      `• Details: ${downloadData.details ? 'Yes' : 'No'}\n` +
                      `• Comments: ${
                        downloadData.comments
                          ? `${downloadData.comments.length} characters`
                          : 'No'
                      }\n` +
                      `• Links: ${
                        downloadData.links
                          ? downloadData.links.split(',').length
                          : 0
                      }\n` +
                      `• Images: ${downloadData.imagesCount}\n` +
                      `• Captured Photos: ${
                        downloadData.hasCapturedPhoto ? 'Yes' : 'No'
                      }\n` +
                      `• Total Attachments: ${downloadData.totalAttachments}`,
                    [{ text: 'OK' }],
                  );
                }, 1500);
              } catch (error) {
                console.error('Download error:', error);
                Alert.alert(
                  'Error',
                  'Failed to download data. Please try again.',
                );
              }
            },
          },
        ],
      );
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Error', 'Failed to download data');
    }
  };

  const handleDownloadImage = async (imageUri: string, fileName: string) => {
    try {
      Alert.alert('Download Image', `Download ${fileName}?`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Download',
          onPress: () => {
            // Implement actual download logic here
            console.log('Downloading:', imageUri, fileName);
            Alert.alert('Success', 'Image download started!');
          },
        },
      ]);
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Error', 'Failed to download image');
    }
  };

  const handleViewImage = (imageUri: string) => {
    Alert.alert(
      'View Image',
      'Image viewing functionality would be implemented here',
      [{ text: 'OK' }],
    );
  };

  const handleTouchStart = (e: GestureResponderEvent) => {
    if (!isDrawingMode || isTextMode) return;
    const { locationX, locationY } = e.nativeEvent;
    const newPath: DrawPath = {
      id: `${Date.now()}`,
      color: strokeColor,
      width: strokeWidth,
      points: [{ x: locationX, y: locationY }],
    };
    setCurrentPath(newPath);
    setPaths(prev => [...prev, newPath]);
  };

  const handleTouchMove = (e: GestureResponderEvent) => {
    if (!currentPath || !isDrawingMode || isTextMode) return;
    const { locationX, locationY } = e.nativeEvent;
    setPaths(prev => {
      const updated = [...prev];
      const idx = updated.findIndex(p => p.id === currentPath.id);
      if (idx !== -1) {
        updated[idx] = {
          ...updated[idx],
          points: [...updated[idx].points, { x: locationX, y: locationY }],
        };
      }
      return updated;
    });
  };

  const handleTouchEnd = () => {
    setCurrentPath(null);
  };

  const buildSvgPathD = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return '';
    const [first, ...rest] = pts;
    const move = `M ${first.x} ${first.y}`;
    const lines = rest.map(p => `L ${p.x} ${p.y}`).join(' ');
    return `${move} ${lines}`;
  };

  const renderItem = ({ item }: { item: TaskItem }) => {
    const isItemEditable = isEditing;
    const existingForm = getFormByTaskId(item.id);
    const hasSubmittedData = Boolean(existingForm);

    // ✅ Har task ka data console mein dikhayein
    console.log(`📋 Task ${item.id}:`, {
      title: item.title,
      progress: item.progress,
      completion_value: item.completion_value,
      hold: item.hold,
      hasSubmittedData,
      step_id: item.step_id,
      progress_id: item.progress_id,
      task_id: item.task_id,
      type: item.type // ✅ NEW: Log type
    });

    return (
      <View style={styles.itemContainer}>
        <View style={styles.itemRow}>
          <View style={{ flex: 1 }}>
            <View style={{flexDirection:"row", gap:hp('2%'), alignItems:"center"}}>
            <Text style={styles.date}>{item.date}</Text>
            <Text style={styles.title}>{item.title}</Text>
            </View>
            {hasSubmittedData && (
              <View style={styles.submittedBadge}>
                <Ionicons
                  name="checkmark-circle"
                  size={hp('1.8%')}
                  color="#1d9b20"
                />
                <Text style={styles.submittedText}>Data Submitted</Text>
              </View>
            )}
          </View>
          <View style={{ alignItems: 'center' }}>
            <Ionicons
              name={isItemEditable ? 'lock-open' : 'lock-closed'}
              size={hp('2.5%')}
              color={hasSubmittedData ? '#1d9b20' : '#99999'}
            />
            {isEditing && (
              <TouchableOpacity
                onPress={() => {
                  if (hasSubmittedData) {
                    handleViewEditPress(item);
                  } else {
                    handleEditTextPress(item);
                  }
                }}
              >
                <Text
                  style={[
                    styles.editText,
                    hasSubmittedData && styles.disabledEditText,
                  ]}
                >
                  {hasSubmittedData ? 'Edit' : 'Edit'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        <Text style={styles.progressText}>
          {item.completion_value !== undefined ? item.completion_value : item.progress}%
        </Text>
        <AnySlider
          value={item.completion_value !== undefined ? item.completion_value : item.progress}
          minimumValue={0}
          maximumValue={100}
          disabled={!isEditing}
          minimumTrackTintColor={getProgressBarColor(item.completion_value !== undefined ? item.completion_value : item.progress)}
          maximumTrackTintColor="#e0e0e0"
          thumbTintColor="#CFCFCF"
          style={[
            styles.slider,
            isEditing ? styles.sliderEditing : styles.sliderNormal,
          ]}
          onValueChange={(val: number) =>
            handleProgressChange(item.id, Math.round(val))
          }
        />
      </View>
    );
  };

  // Camera Modal
  const CameraModal = () => (
    <Modal visible={isCameraVisible} animationType="slide">
      <View style={{ flex: 1, backgroundColor: 'black' }}>
        {device ? (
          <Camera
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={true}
            ref={cameraRef}
            photo={true}
          />
        ) : (
          <Text
            style={{ color: 'white', textAlign: 'center', marginTop: hp('6%') }}
          >
            Loading Camera...
          </Text>
        )}

        {selectedItem && (
          <Text style={styles.cameraTitle}>{cameraOverlayTitle}</Text>
        )}

        <View style={styles.cameraControls}>
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() =>
              setCameraDevice(cameraDevice === 'back' ? 'front' : 'back')
            }
          >
            <Ionicons name="camera-reverse" size={hp('3.5%')} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shutterButton}
            onPress={async () => {
              try {
                if (!cameraRef.current) return;
                const photo = await cameraRef.current.takePhoto({});
                setCapturedPhotoPath(photo?.path || null);

                const now = new Date();
                const timestamp = formatTimestamp(now);
                setPhotoTimestamp(timestamp);

                setIsCameraVisible(false);
                setPaths([]);
                setCurrentPath(null);
                setTextElements([]);
                setIsDrawingVisible(true);
              } catch (e) {
                console.error('Capture error:', e);
                Alert.alert('Error', 'Failed to capture photo.');
              }
            }}
          >
            <Ionicons name="camera" size={hp('4.2%')} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setIsCameraVisible(false)}
          >
            <Ionicons name="close" size={hp('3.5%')} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const DrawingModal = () => (
    <Modal visible={isDrawingVisible} animationType="slide">
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        <View style={styles.drawingHeader}>
          <TouchableOpacity
            onPress={() => {
              setIsDrawingVisible(false);
              setPaths([]);
              setCapturedPhotoPath(null);
              setPhotoTimestamp(null);
              setIsDrawingMode(false);
              setIsTextMode(false);
              setTextElements([]);
            }}
            style={styles.drawingHeaderBtns}
          >
            <Text style={styles.drawingHeaderBtnTexts}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setIsDrawingVisible(false);
              setIsEditTextModalVisible(true);
              setIsDrawingMode(false);
              setIsTextMode(false);

              // Ensure the captured photo data is preserved
              if (capturedPhotoPath) {
                console.log('Inserting captured photo:', capturedPhotoPath);
              }
            }}
            style={styles.drawingHeaderBtn}
          >
            <Text style={styles.drawingHeaderBtnText}>Insert</Text>
          </TouchableOpacity>
        </View>

        {/* Text Input Modal */}
        {showTextInputModal && (
          <View style={styles.textInputOverlay}>
            <View style={styles.textInputContainer}>
              <Text style={styles.textInputLabel}>Enter your text:</Text>
              <Text style={styles.textPlacementHint}>
                Tap anywhere on the image to place the text
              </Text>
              <TextInput
                style={styles.textInputField}
                placeholder="Type text here..."
                placeholderTextColor="#999"
                value={textInput}
                onChangeText={setTextInput}
                multiline
                autoFocus
              />
              <View style={styles.textInputButtons}>
                <TouchableOpacity
                  style={styles.textCancelButton}
                  onPress={handleCancelText}
                >
                  <Text style={styles.textButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.textConfirmButton,
                    !textInput.trim() && styles.disabledButton,
                  ]}
                  onPress={handleConfirmText}
                  disabled={!textInput.trim()}
                >
                  <Text style={styles.textButtonText}>Add Text</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Drawing Canvas */}
        <View
          ref={drawingStageRef}
          style={styles.drawingStage}
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => isDrawingMode && !isTextMode}
          onResponderGrant={isTextMode ? handleCanvasTap : handleTouchStart}
          onResponderMove={handleTouchMove}
          onResponderRelease={handleTouchEnd}
        >
          {capturedPhotoPath ? (
            <Image
              source={{ uri: `file://${capturedPhotoPath}` }}
              style={styles.drawingImage}
              resizeMode="contain"
            />
          ) : null}
          {cameraOverlayTitle ? (
            <Text style={styles.drawingTitle} numberOfLines={3}>
              {cameraOverlayTitle}
            </Text>
          ) : null}

          <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
            <Rect x={0} y={0} width="100%" height="100%" fill="transparent" />
            {paths.map(p => (
              <Path
                key={p.id}
                d={buildSvgPathD(p.points)}
                stroke={p.color}
                strokeWidth={p.width}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
            {textElements.map(text => (
              <SvgText
                key={text.id}
                x={text.x}
                y={text.y}
                fill={text.color}
                fontSize={hp('2.5%')}
                fontWeight="bold"
                textAnchor="start"
              >
                {text.text}
              </SvgText>
            ))}
            {currentTextPosition && showTextInputModal && textInput && (
              <SvgText
                x={currentTextPosition.x}
                y={currentTextPosition.y}
                fill={strokeColor}
                fontSize={hp('2.5%')}
                fontWeight="bold"
                textAnchor="start"
              >
                {textInput}
              </SvgText>
            )}
          </Svg>

          {/* Undo/Delete overlay at bottom inside the image */}
          {(paths.length > 0 || textElements.length > 0) && (
            <View style={styles.undoDeleteOverlay} pointerEvents="box-none">
              <View style={styles.undoDeleteBar}>
                <TouchableOpacity
                  onPress={() => {
                    if (textElements.length > 0) {
                      setTextElements(prev => prev.slice(0, -1));
                    } else if (paths.length > 0) {
                      setPaths(prev => prev.slice(0, -1));
                    }
                  }}
                  style={styles.overlayBtn}
                >
                  <Ionicons name="arrow-undo" size={hp('3.5%')} color="#fff" />
                  <Text style={styles.overlayBtnText}>Undo</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setPaths([]);
                    setCurrentPath(null);
                    setTextElements([]);
                    setIsTextMode(false);
                    setShowTextInputModal(false);
                    setTextInput('');
                    setCurrentTextPosition(null);
                  }}
                  style={styles.overlayBtn}
                >
                  <Ionicons name="trash" size={hp('3.5%')} color="#ff6b6b" />
                  <Text style={styles.overlayBtnText}>Delete All</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
        <View style={styles.drawingBottomControls}>
          <TouchableOpacity
            style={styles.drawingBottomBtn}
            onPress={handleRetakePhoto}
          >
            <Ionicons name="camera-reverse" size={hp('3.5%')} color="#fff" />
            <Text style={styles.drawingBottomBtnTexts}>Retake</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.drawingBottomBtn}>
            <Ionicons name="calendar" size={hp('3.5%')} color="#fff" />
            <Text style={styles.drawingBottomBtnTexts}>Date/Time</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.drawingBottomBtn}
            onPress={handleAddText}
          >
            <Ionicons
              name="document-text"
              size={hp('3.5%')}
              color={isTextMode ? 'yellow' : '#fff'}
            />
            <Text style={styles.drawingBottomBtnTexts}>Text</Text>
          </TouchableOpacity>

          {/* Brush Toggle */}
          <TouchableOpacity
            style={styles.drawingBottomBtn}
            onPress={() => {
              setIsDrawingMode(!isDrawingMode);
              setIsTextMode(false);
              setShowTextInputModal(false);
            }}
          >
            <Ionicons
              name="brush"
              size={hp('3.5%')}
              color={isDrawingMode ? 'yellow' : '#fff'}
            />
            <Text style={styles.drawingBottomBtnTexts}>Draw</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.drawingBottomBtn}>
            <Ionicons name="save" size={hp('3.5%')} color="#fff" />
            <Text style={styles.drawingBottomBtnTexts}>Save</Text>
          </TouchableOpacity>
        </View>

        {/* Color Palette - Visible only in Draw or Text Mode */}
        {(isDrawingMode || isTextMode) && (
          <View style={styles.colorPalette}>
            {[
              '#ff0000',
              '#0000ff',
              '#00ff00',
              '#ffff00',
              '#ffffff',
              '#000000',
            ].map(c => (
              <TouchableOpacity
                key={c}
                style={[
                  styles.colorOption,
                  {
                    backgroundColor: c,
                    borderColor: strokeColor === c ? '#fff' : 'transparent',
                  },
                ]}
                onPress={() => setStrokeColor(c)}
              />
            ))}
          </View>
        )}
      </View>
    </Modal>
  );

  const EditTextModal = () => {
    const existingForm = selectedItem ? getFormByTaskId(selectedItem.id) : null;

    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={isEditTextModalVisible}
        onRequestClose={handleModalClose}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? hp('5%') : 0}
            style={styles.keyboardAvoidingView}
          >
            <View style={styles.modalContent}>
              <ScrollView
                style={styles.modalBody}
                contentContainerStyle={{ paddingBottom: hp('2.4%') }}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="interactive"
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Insert details</Text>
                  {capturedPhotoPath || selectedImages.length > 0 ? (
                    <View style={styles.imagesContainer}>
                      {capturedPhotoPath && (
                        <TouchableOpacity
                          style={styles.fileRow}
                          onPress={() =>
                            handleImageClick(null, capturedPhotoPath)
                          }
                        >
                          <Ionicons
                            name="camera"
                            size={hp('3%')}
                            color="#1d9b20"
                          />
                          <Text style={styles.fileNameText} numberOfLines={1}>
                            [ Captured Photo -{' '}
                            {formatTimestamp(
                              new Date(photoTimestamp || Date.now()),
                            )}{' '}
                            ]
                          </Text>
                          <TouchableOpacity onPress={removeCapturedPhoto}>
                            <Ionicons
                              name="trash-outline"
                              size={hp('2.4%')}
                              color="red"
                            />
                          </TouchableOpacity>
                        </TouchableOpacity>
                      )}
                      {selectedImages.map((image, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.fileRow}
                          onPress={() => handleImageClick(image, null)}
                        >
                          <Ionicons
                            name="image"
                            size={hp('3%')}
                            color="#1d9b20"
                          />
                          <Text style={styles.fileNameText} numberOfLines={1}>
                            [ {image.fileName} ]
                          </Text>
                          <TouchableOpacity onPress={() => removeImage(index)}>
                            <Ionicons
                              name="trash-outline"
                              size={hp('2.4%')}
                              color="red"
                            />
                          </TouchableOpacity>
                        </TouchableOpacity>
                      ))}
                    </View>
                  ) : (
                    <View style={styles.uploadBox}>
                      <View style={styles.uploadIconsContainer}>
                        <TouchableOpacity
                          style={styles.uploadIconButton}
                          onPress={() => {
                            setIsCameraVisible(true);
                            setIsEditTextModalVisible(true);
                          }}
                        >
                          <Ionicons
                            name="camera"
                            size={hp('5%')}
                            color="#808080"
                          />
                          <Text style={styles.uploadIconText}>Take Photo</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.uploadIconButton}
                          onPress={handleDocumentIconPress}
                        >
                          <Ionicons
                            name="document"
                            size={hp('5%')}
                            color="#808080"
                          />
                          <Text style={styles.uploadIconText}>Choose File</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>

                <View style={styles.formGroup}>
                  <MultilineInput
                    label={`Comments (${modalForm.comments.length} / 600 characters)`}
                    placeholder="Enter comments..."
                    maxLength={600}
                    value={modalForm.comments}
                    onChangeText={(text: string) =>
                      setModalForm({ ...modalForm, comments: text })
                    }
                  />
                </View>

                <View style={styles.formGroup}>
                  <MultilineInput
                    label="Links (Separate multiple links with commas)"
                    placeholder="https://example.com, https://anotherlink.com"
                    value={modalForm.links}
                    onChangeText={(text: string) =>
                      setModalForm({ ...modalForm, links: text })
                    }
                  />
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={handleModalClose}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.submitButton]}
                  onPress={handleModalSubmit}
                >
                  <Text style={styles.submitButtonText}>Submit</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    );
  };

  const DetailModal = () => {
    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={isDetailModalVisible}
        onRequestClose={() => setIsDetailModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? hp('5%') : 0}
            style={styles.keyboardAvoidingView}
          >
            <View style={styles.detailModalContent}>
              <ScrollView
                style={styles.modalBody}
                contentContainerStyle={{ paddingBottom: hp('2.4%') }}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="interactive"
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Details</Text>
                  <TouchableOpacity
                    style={styles.closeHeaderButton}
                    onPress={() => setIsDetailModalVisible(false)}
                  >
                    <Ionicons name="close" size={hp('2.5%')} color="#666" />
                  </TouchableOpacity>
                </View>

                {/* Images Section */}
                {(selectedFormData?.capturedPhoto ||
                  selectedFormData?.images.length > 0) && (
                  <View style={styles.formGroup}>
                    <View style={{ flexDirection: 'row', gap: hp('3%') }}>
                      <Text style={styles.label}>Type</Text>
                      <Text style={styles.label}>Name</Text>
                    </View>
                    {/* Captured Photo */}
                    {selectedFormData?.capturedPhoto && (
                      <TouchableOpacity
                        style={styles.imageItem}
                        onPress={() =>
                          handleImageClick(
                            null,
                            selectedFormData.capturedPhoto!,
                          )
                        }
                      >
                        <View style={styles.imageInfo}>
                          <Ionicons
                            name="camera"
                            size={hp('3%')}
                            color="#1d9b20"
                          />
                          <View style={styles.imageDetails}>
                            <Text style={styles.imageName}>Captured Photo</Text>
                            <Text style={styles.imageTimestamp}>
                              {selectedFormData.photoTimestamp ||
                                'No timestamp'}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.imageActions}>
                          <TouchableOpacity
                            style={styles.imageActionBtn}
                            onPress={() =>
                              handleViewImage(selectedFormData.capturedPhoto!)
                            }
                          >
                            <Ionicons
                              name="download"
                              size={hp('2.2%')}
                              color="#34C759"
                            />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.imageActionBtn}
                            onPress={() =>
                              handleDownloadImage(
                                selectedFormData.capturedPhoto!,
                                `captured_photo_${
                                  selectedFormData.photoTimestamp || Date.now()
                                }.jpg`,
                              )
                            }
                          >
                            <Ionicons
                              name="trash"
                              size={hp('2.2%')}
                              color="red"
                            />
                          </TouchableOpacity>
                        </View>
                      </TouchableOpacity>
                    )}

                    {/* Selected Images */}
                    {selectedFormData?.images.map((image, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.imageItem}
                        onPress={() => handleImageClick(image, null)}
                      >
                        <View style={styles.imageInfo}>
                          <Ionicons
                            name="image"
                            size={hp('3%')}
                            color="#1d9b20"
                          />
                          <View style={styles.imageDetails}>
                            <Text style={styles.imageName} numberOfLines={1}>
                              {image.fileName}
                            </Text>
                            <Text style={styles.imageType}>Uploaded Image</Text>
                          </View>
                        </View>
                        <View style={styles.imageActions}>
                          <TouchableOpacity
                            style={styles.imageActionBtn}
                            onPress={() => handleViewImage(image.uri)}
                          >
                            <Ionicons
                              name="download"
                              size={hp('2.2%')}
                              color="#34C759"
                            />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.imageActionBtn}
                            onPress={() =>
                              handleDownloadImage(image.uri, image.fileName)
                            }
                          >
                            <Ionicons
                              name="trash"
                              size={hp('2.2%')}
                              color="red"
                            />
                          </TouchableOpacity>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
                {selectedFormData?.details && (
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Details</Text>
                    <View style={styles.textDisplayContainer}>
                      <Text style={styles.displayText}>
                        {selectedFormData.details}
                      </Text>
                    </View>
                  </View>
                )}
                {!selectedFormData && (
                  <View style={styles.noDataContainer}>
                    <Ionicons
                      name="document-outline"
                      size={hp('8%')}
                      color="#ccc"
                    />
                    <Text style={styles.noDataText}>No data submitted yet</Text>
                  </View>
                )}
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.closeButton]}
                  onPress={() => setIsDetailModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    );
  };

  const ImageDetailModal = () => {
    const { image, capturedPhoto, formData } = selectedImageData;

    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={isImageDetailModalVisible}
        onRequestClose={() => setIsImageDetailModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? hp('5%') : 0}
            style={styles.keyboardAvoidingView}
          >
            <View style={styles.imageDetailModalContent}>
              <ScrollView
                style={styles.modalBody}
                contentContainerStyle={{ paddingBottom: hp('2.4%') }}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="interactive"
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    {image ? image.fileName : 'Captured Photo'}
                  </Text>
                  <TouchableOpacity
                    style={styles.closeHeaderButton}
                    onPress={() => setIsImageDetailModalVisible(false)}
                  >
                    <Ionicons name="close" size={hp('2.5%')} color="#666" />
                  </TouchableOpacity>
                </View>

                {/* Image Display */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Image</Text>
                  <View style={styles.imagePreviewContainer}>
                    {capturedPhoto ? (
                      <Image
                        source={{ uri: `file://${capturedPhoto}` }}
                        style={styles.imagePreview}
                        resizeMode="contain"
                      />
                    ) : image ? (
                      <Image
                        source={{ uri: image.uri }}
                        style={styles.imagePreview}
                        resizeMode="contain"
                      />
                    ) : null}
                  </View>
                </View>

                {/* Comments Section */}
                {formData?.comments && (
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Comments</Text>
                    <View style={styles.textDisplayContainer}>
                      <Text style={styles.displayText}>
                        {formData.comments}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Links Section */}
                {formData?.links && (
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Links</Text>
                    <View style={styles.textDisplayContainer}>
                      <Text style={styles.displayText}>{formData.links}</Text>
                    </View>
                  </View>
                )}

                {/* Details Section */}
                {formData?.details && (
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Details</Text>
                    <View style={styles.textDisplayContainer}>
                      <Text style={styles.displayText}>{formData.details}</Text>
                    </View>
                  </View>
                )}

                {/* Image Info */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Image Information</Text>
                  <View style={styles.infoContainer}>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Type:</Text>
                      <Text style={styles.infoValue}>
                        {capturedPhoto ? 'Captured Photo' : 'Uploaded Image'}
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>File Name:</Text>
                      <Text style={styles.infoValue}>
                        {image ? image.fileName : 'captured_photo.jpg'}
                      </Text>
                    </View>
                    {formData?.photoTimestamp && (
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Timestamp:</Text>
                        <Text style={styles.infoValue}>
                          {formData.photoTimestamp}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setIsImageDetailModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.downloadButton]}
                  onPress={() => handleDownloadAllData(selectedFormData)}
                >
                  <Text style={styles.downloadButtonText}>Download</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.headerContainer}>
          <Text style={styles.pageTitle}>Park Sydney Stage 2</Text>
          <TouchableOpacity
            style={styles.iconContainer}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={hp('2.8%')} color="#ffff" />
          </TouchableOpacity>
        </View>

        <Text style={styles.subtitle}>Core 1- Level 0 - Unit G19</Text>

        {/* Loading Indicators */}
        {(isLoading || isTasksLoading || isSaving) && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1d9b20" />
            <Text style={styles.loadingText}>
              {isSaving ? 'Saving changes...' : 
               isTasksLoading ? 'Fetching tasks data...' : 'Fetching completion data...'}
            </Text>
          </View>
        )}

        <View style={styles.completionHeader}>
          <Text style={styles.completionLabel}>Completion</Text>
          <EditBtn
            title={isEditing ? (isSaving ? 'Saving...' : 'Save Changes') : 'Edit Tasks'}
            bgColor="#1d9b20"
            onPress={() =>
              isEditing ? handleSaveChanges() : setIsEditing(true)
            }
            disabled={isSaving} // ✅ NEW: Disable button when saving
          />
        </View>
        
        {/* ✅ Sirf overallCompletion ki value display karo */}
        <Text style={styles.completionPercentage}>
          {overallCompletion}%
        </Text>
        
        {/* ✅ Console mein sirf overallCompletion value show karo */}
        {console.log('🎯 OVERALL COMPLETION VALUE FROM API:', overallCompletion + '%')}
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between'}}>
          {/* ✅ Use category name from API */}
          <Text style={styles.sectionTitle}>1. {categoryName}</Text>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginHorizontal: wp('3%'),
            }}
          >
            <Text
              style={{
                fontSize: hp('2%'),
                marginVertical: hp('1.5%'),
                color: '#222',
                fontFamily: 'Poppins-Bold',
              }}
            >
              Hold Point
            </Text>

            <Text
              style={{
                fontSize: hp('2%'),
                marginVertical: hp('1.5%'),
                color: '#222',
                fontFamily: 'Poppins-Light',
                marginLeft: wp('2%'),
              }}
            >
              {/* ✅ Show hold point status from API data */}
              {hasHoldPoint ? 'Yes' : 'No'}
            </Text>
          </View>
        </View>

        <FlatList<TaskItem>
          data={data}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          scrollEnabled={false}
        />
      </ScrollView>
      <EditTextModal />
      <CameraModal />
      <DrawingModal />
      <DetailModal />
      <ImageDetailModal />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  scrollViewContent: {
    padding: wp('5%'),
    paddingBottom: wp('3%'),
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: hp('2.5%'),
    fontWeight: 'bold',
    color: '#222',
  },
  iconContainer: {
    padding: wp('2.5%'),
    backgroundColor: '#1d9b20',
    borderRadius: wp('2%'),
  },
  subtitle: {
    marginTop: hp('1%'),
    fontSize: hp('2%'),
    color: '#1d9b20',
    fontFamily: 'Poppins-BoldItalic',
  },
  // New loading styles
  loadingContainer: {
    alignItems: 'center',
    padding: hp('2%'),
    backgroundColor: '#f0f9f0',
    borderRadius: wp('2%'),
    marginVertical: hp('1%'),
  },
  loadingText: {
    marginTop: hp('1%'),
    fontSize: hp('1.6%'),
    color: '#1d9b20',
  },
  completionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: hp('2%'),
  },
  completionLabel: {
    fontSize: hp('2%'),
    color: '#333',
  },
  completionPercentage: {
    fontSize: hp('2.2%'),
    fontWeight: 'bold',
    color: '#1d9b20',
    marginVertical: hp('1%'),
  },
  sectionTitle: {
    fontSize: hp('2.2%'),
    fontWeight: 'bold',
    marginVertical: hp('1.5%'),
    color: '#222',
  },
  listContent: {
    paddingBottom: hp('3.5%'),
  },
  itemContainer: {
    backgroundColor: '#fff',
    padding: wp('3%'),
    borderRadius: wp('2%'),
    marginBottom: hp('1.5%'),
    elevation: 2,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: hp('1.7%'),
    fontWeight: '500',
    color: '#333',
  },
  date: {
    fontSize: hp('1.6%'),
    color: '#777',
    marginTop: hp('0.5%'),
  },
  submittedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp('0.5%'),
  },
  submittedText: {
    fontSize: hp('1.4%'),
    color: '#1d9b20',
    marginLeft: wp('1%'),
    fontWeight: '500',
  },
  editText: {
    marginTop: hp('1%'),
    color: '#1d9b20',
    fontSize: hp('1.6%'),
  },
  disabledEditText: {
    color: '#1d9b20',
  },
  progressText: {
    marginTop: hp('1%'),
    fontSize: hp('1.6%'),
    color: '#555',
  },
  slider: {
    marginTop: hp('0.5%'),
  },
  sliderNormal: {
    height: hp('1.2%'),
  },
  sliderEditing: {
    height: hp('1%'),
    transform: [{ scaleY: 1.1 }],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: wp('2%'),
    margin: wp('1%'),
    padding: wp('4%'),
    width: wp('85%'),
    maxHeight: hp('74%'),
    alignSelf: 'center',
  },
  detailModalContent: {
    backgroundColor: '#fff',
    borderRadius: wp('2%'),
    margin: wp('1%'),
    padding: wp('4%'),
    width: wp('90%'),
    maxHeight: hp('80%'),
  },
  imageDetailModalContent: {
    backgroundColor: '#fff',
    borderRadius: wp('2%'),
    margin: wp('1%'),
    padding: wp('4%'),
    width: wp('95%'),
    maxHeight: hp('85%'),
  },
  modalBody: {
    marginBottom: hp('1.5%'),
  },
  formGroup: {
    marginBottom: hp('1%'),
  },
  label: {
    fontSize: hp('1.8%'),
    fontWeight: 'bold',
    marginBottom: hp('1%'),
    color: '#333',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('2%'),
    paddingBottom: hp('1%'),
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: hp('2.2%'),
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  closeHeaderButton: {
    padding: wp('1%'),
  },
  textDisplayContainer: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: wp('1.5%'),
    padding: wp('3%'),
    backgroundColor: '#f9f9f9',
  },
  displayText: {
    fontSize: hp('1.8%'),
    color: '#333',
    lineHeight: hp('2.5%'),
  },
  noDataContainer: {
    alignItems: 'center',
    padding: hp('5%'),
  },
  noDataText: {
    fontSize: hp('2%'),
    color: '#888',
    marginTop: hp('2%'),
  },
  imageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e1e1e1',
    backgroundColor: '#fafafa',
    paddingVertical: hp('1.2%'),
    paddingHorizontal: wp('3%'),
    borderRadius: wp('2%'),
    marginBottom: hp('1%'),
  },
  imageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: wp('2.5%'),
  },
  imageDetails: {
    flex: 1,
  },
  imageName: {
    color: '#333',
    fontSize: hp('1.6%'),
    fontWeight: '500',
  },
  imageType: {
    color: '#666',
    fontSize: hp('1.4%'),
  },
  imageTimestamp: {
    color: '#888',
    fontSize: hp('1.3%'),
    fontStyle: 'italic',
  },
  imageActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('2%'),
  },
  imageActionBtn: {
    padding: wp('1.5%'),
  },
  // New styles for image detail modal
  imagePreviewContainer: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: wp('2%'),
    padding: wp('2%'),
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
  },
  imagePreview: {
    width: '100%',
    height: hp('30%'),
    borderRadius: wp('1.5%'),
  },
  infoContainer: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: wp('1.5%'),
    padding: wp('3%'),
    backgroundColor: '#f9f9f9',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('1%'),
  },
  infoLabel: {
    fontSize: hp('1.6%'),
    fontWeight: '500',
    color: '#666',
  },
  infoValue: {
    fontSize: hp('1.6%'),
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  downloadButton: {
    backgroundColor: '#34C759',
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('2%'),
  },
  downloadButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  // New styles for download all button
  downloadAllButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('2%'),
  },
  downloadAllButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: wp('1.5%'),
    padding: wp('2%'),
    fontSize: hp('1.8%'),
    backgroundColor: '#fafafa',
  },
  multilineInput: {
    height: hp('10%'),
    textAlignVertical: 'top',
  },
  uploadBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: wp('1.5%'),
    padding: hp('2.5%'),
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
    marginBottom: hp('1.5%'),
  },
  uploadIconsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: hp('2%'),
  },
  uploadIconButton: {
    alignItems: 'center',
    padding: wp('2.5%'),
  },
  uploadIconText: {
    marginTop: hp('1%'),
    color: '#555',
    fontSize: hp('1.5%'),
    textAlign: 'center',
  },
  uploadHelperText: {
    color: '#888',
    fontSize: hp('1.5%'),
    textAlign: 'center',
    marginTop: hp('0.6%'),
  },
  imagesContainer: {
    marginBottom: hp('1.2%'),
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('2.5%'),
    borderWidth: 1,
    borderColor: '#e1e1e1',
    backgroundColor: '#fafafa',
    paddingVertical: hp('1.2%'),
    paddingHorizontal: wp('3%'),
    borderRadius: wp('2%'),
    marginBottom: hp('1%'),
  },
  fileNameText: {
    flex: 1,
    color: '#333',
    fontSize: hp('1.5%'),
  },
  addMoreContainer: {
    marginTop: hp('1.2%'),
  },
  addMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: hp('1.2%'),
    borderWidth: 1,
    borderColor: '#1d9b20',
    borderRadius: wp('1.5%'),
    backgroundColor: '#f0f9f0',
    marginTop: hp('1%'),
  },
  addMoreText: {
    color: '#1d9b20',
    marginLeft: wp('1%'),
    fontWeight: '500',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: hp('1%'),
    gap: wp('2%'),
  },
  modalButton: {
    paddingVertical: hp('1%'),
    paddingHorizontal: wp('4%'),
    borderRadius: wp('1.5%'),
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('1%'),
  },
  cancelButton: {
    backgroundColor: '#eee',
  },
  cancelButtonText: {
    color: '#333',
  },
  closeButton: {
    backgroundColor: '#1d9b20',
  },
  closeButtonText: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#1d9b20',
  },
  submitButtonText: {
    color: '#fff',
  },
  cameraTitle: {
    position: 'absolute',
    top: hp('2.5%'),
    left: wp('5%'),
    right: wp('5%'),
    color: '#fff',
    fontSize: hp('2%'),
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: hp('0.8%'),
    borderRadius: wp('1%'),
  },
  cameraControls: {
    position: 'absolute',
    bottom: hp('3.5%'),
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  toggleButton: {
    padding: wp('3%'),
  },
  shutterButton: {
    width: wp('17%'),
    height: wp('17%'),
    borderRadius: wp('8.5%'),
    backgroundColor: '#1d9b20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    padding: wp('3%'),
  },
  drawingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: hp('1.5%'),
    backgroundColor: '#111',
    gap: wp('3%'),
    alignSelf: 'flex-end',
  },
  drawingHeaderBtn: {
    paddingHorizontal: wp('8%'),
    paddingVertical: hp('0.8%'),
    backgroundColor: '#1d9b20',
    borderRadius: wp('1.5%'),
  },
  drawingHeaderBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: hp('1.8%'),
  },
  drawingHeaderBtns: {
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('0.8%'),
    borderRadius: wp('1.5%'),
  },
  drawingHeaderBtnTexts: {
    color: 'red',
    fontFamily: 'Poppins-Bold',
    fontSize: hp('2.2%'),
  },
  drawingBottomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('2%'),
    gap: wp('3%'),
    justifyContent: 'center',
    paddingHorizontal: wp('2%'),
  },
  drawingBottomBtn: {
    alignItems: 'center',
    padding: wp('1%'),
  },
  drawingBottomBtnTexts: {
    color: '#ffff',
    fontFamily: 'Poppins-Bold',
    fontSize: hp('1.8%'),
    textAlign: 'center',
    marginTop: hp('0.5%'),
  },
  drawingStage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  drawingImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  drawingTitle: {
    position: 'absolute',
    top: hp('2.5%'),
    left: wp('2.5%'),
    right: wp('2.5%'),
    fontSize: hp('2%'),
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: hp('0.8%'),
    borderRadius: wp('1%'),
    zIndex: 10,
  },
  colorPalette: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: hp('2%'),
    paddingHorizontal: wp('5%'),
  },
  colorOption: {
    width: wp('7%'),
    height: wp('7%'),
    borderRadius: wp('3.5%'),
    marginHorizontal: wp('1.5%'),
    borderWidth: wp('0.5%'),
  },
  undoDeleteOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: hp('1.5%'),
    alignItems: 'center',
  },
  undoDeleteBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: wp('6%'),
    paddingVertical: hp('0.8%'),
    paddingHorizontal: wp('3%'),
    gap: wp('3%'),
  },
  overlayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('1.5%'),
    paddingHorizontal: wp('1.5%'),
  },
  overlayBtnText: {
    color: '#fff',
    fontFamily: 'Poppins-Bold',
    fontSize: hp('1.8%'),
  },
  editLink: {
    color: '#1d9b20',
    fontWeight: '600',
  },
  // New styles for text input
  textInputOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  textInputContainer: {
    backgroundColor: '#fff',
    padding: hp('2.5%'),
    borderRadius: wp('2.5%'),
    width: wp('80%'),
    maxWidth: wp('90%'),
  },
  textInputLabel: {
    fontSize: hp('2%'),
    fontWeight: 'bold',
    marginBottom: hp('1.2%'),
    color: '#333',
  },
  textInputField: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: wp('1.5%'),
    padding: wp('3%'),
    fontSize: hp('1.8%'),
    marginBottom: hp('2%'),
    minHeight: hp('10%'),
    textAlignVertical: 'top',
    backgroundColor: '#f9f9f9',
  },
  textInputButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: hp('1.2%'),
  },
  textCancelButton: {
    paddingHorizontal: wp('5%'),
    paddingVertical: hp('1.5%'),
    backgroundColor: '#ff6b6b',
    borderRadius: wp('1.5%'),
    minWidth: wp('25%'),
    alignItems: 'center',
  },
  textConfirmButton: {
    paddingHorizontal: wp('5%'),
    paddingVertical: hp('1.5%'),
    backgroundColor: '#1d9b20',
    borderRadius: wp('1.5%'),
    minWidth: wp('25%'),
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  textButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: hp('1.8%'),
  },
  textPlacementHint: {
    color: '#666',
    fontSize: hp('1.6%'),
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: hp('1.2%'),
  },
});