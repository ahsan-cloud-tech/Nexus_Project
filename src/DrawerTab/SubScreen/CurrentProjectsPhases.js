import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Modal,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import Header from '../../Components/Header';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import DownloadBtn from '../../Components/DownloadBtn';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { baseUrl } from '../../utils/Api';
import { useProjectStore } from '../../Store/useProjectStore';
import RNFetchBlob from 'rn-fetch-blob';

const CustomDropdown = ({ label, options, selectedValue, onSelect }) => {
  const [open, setOpen] = useState(false);

  return (
    <View style={{ marginBottom: hp('2.5%') }}>
      <View style={styles.dropdownRow}>
        <Text style={styles.projectsTitle}>{label}</Text>
        <TouchableOpacity
          style={[styles.dropdownButton, open && styles.dropdownButtonOpen]}
          onPress={() => setOpen(!open)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.dropdownText,
              !selectedValue && styles.placeholderText,
            ]}
          >
            {selectedValue
              ? options.find(opt => opt.value === selectedValue)?.label
              : `Select ${label}`}
          </Text>
          <Ionicons
            name={open ? 'chevron-up' : 'chevron-down'}
            size={20}
            color="#1d9b20"
            style={styles.dropdownIcon}
          />
        </TouchableOpacity>
      </View>

      {open && (
        <View style={styles.dropdownOptions}>
          {options.map(option => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionItem,
                selectedValue === option.value && styles.selectedOption,
              ]}
              onPress={() => {
                onSelect(option.value);
                setOpen(false);
              }}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedValue === option.value && styles.selectedOptionText,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const CurrentProjectsPhases = ({ route }) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [overallData, setOverallData] = useState(null);
  const [cardsData, setCardsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cardsLoading, setCardsLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);
  const [buildingsData, setBuildingsData] = useState([]);
  const [levelsData, setLevelsData] = useState([]);
  const [unitsData, setUnitsData] = useState([]);
  const [buildingsLoading, setBuildingsLoading] = useState(false);
  const navigation = useNavigation();

  const token = useSelector(state => state.auth.token);
  const { 
    selectedProjectId, 
    setSelectedStepType,
    setSelectedStepId,
    selectedStepType,
    selectedStepId,
    setProjectStepTypes,
    getStoreState,
    setSelectedBuildingId,
    setSelectedLevelId,
    setSelectedUnitName
  } = useProjectStore();

  // ✅ Function to fetch buildings data
  const fetchBuildingsData = async () => {
    try {
      setBuildingsLoading(true);
      
      if (!token || !selectedProjectId) {
        console.log('❌ Missing token or project ID for buildings API');
        return;
      }

      console.log('🏢 ===== Fetching buildings data =====');
      console.log('📁 Project ID:', selectedProjectId);
      console.log('🌐 API URL:', `${baseUrl}/buildings/all/${selectedProjectId}`);

      const response = await fetch(
        `${baseUrl}/buildings/all/${selectedProjectId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }
      );

      console.log('📡 Buildings API Response status:', response.status);

      if (response.status === 401) {
        console.log('🔐 Buildings API: Unauthorized');
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Buildings API Error:', errorText);
        return;
      }

      const result = await response.json();
      console.log('✅ Buildings API Response:', JSON.stringify(result, null, 2));

      if (Array.isArray(result)) {
        setBuildingsData(result);
        console.log('🏢 Buildings data loaded:', result.length, 'buildings');
      } else {
        console.log('⚠️ No buildings data found in response');
        setBuildingsData([]);
      }

    } catch (error) {
      console.error('❌ Error fetching buildings data:', error);
    } finally {
      setBuildingsLoading(false);
    }
  };

  // ✅ Function to handle building selection
  const handleBuildingSelect = (buildingId) => {
    setSelectedBuilding(buildingId);
    setSelectedLevel(null);
    setSelectedUnit(null);
    setUnitsData([]);
    
    // Find the selected building
    const building = buildingsData.find(b => b._id === buildingId);
    if (building && building.levels) {
      setLevelsData(building.levels);
      console.log('🏗️ Levels data set for building:', building.name);
    } else {
      setLevelsData([]);
    }

    // ✅ Save building ID to useProjectStore
    setSelectedBuildingId(buildingId);
    console.log('💾 Building ID saved to useProjectStore:', buildingId);
  };

  // ✅ Function to handle level selection
  const handleLevelSelect = (levelId) => {
    setSelectedLevel(levelId);
    setSelectedUnit(null);
    
    // Find the selected level
    const level = levelsData.find(l => l._id === levelId);
    if (level && level.progress_names) {
      const unitOptions = level.progress_names.map((unitName, index) => ({
        label: unitName,
        value: unitName,
        id: `unit-${levelId}-${index}`
      }));
      setUnitsData(unitOptions);
      console.log('📋 Units data set for level:', level.name);
    } else {
      setUnitsData([]);
    }

    // ✅ Save level ID to useProjectStore
    setSelectedLevelId(levelId);
    console.log('💾 Level ID saved to useProjectStore:', levelId);
  };

  // ✅ Function to handle unit selection
  const handleUnitSelect = (unitName) => {
    setSelectedUnit(unitName);
    
    // ✅ Save unit name to useProjectStore
    setSelectedUnitName(unitName);
    console.log('💾 Unit name saved to useProjectStore:', unitName);
  };

  // ✅ Function to download Excel report
  const downloadExcelReport = async () => {
    try {
      if (!token || !selectedProjectId) {
        Alert.alert('Error', 'Authentication required or no project selected');
        return;
      }

      setDownloading(true);

      console.log('📥 Starting Excel download...');
      console.log('📁 Project ID:', selectedProjectId);
      console.log('🌐 API URL:', `${baseUrl}/projects/export-function/data?project=${selectedProjectId}`);

      // Define the download path
      const { config, fs } = RNFetchBlob;
      const date = new Date();
      const filename = `Project_Report_${selectedProjectId}_${date.getTime()}.xlsx`;
      
      // For Android, use Download directory; for iOS, use DocumentDirectory
      const downloadDir = Platform.OS === 'ios' ? 
        fs.dirs.DocumentDir : 
        fs.dirs.DownloadDir;
      
      const path = `${downloadDir}/${filename}`;

      const response = await config({
        fileCache: true,
        addAndroidDownloads: {
          useDownloadManager: true,
          notification: true,
          path: path,
          description: 'Project Report Download',
        },
      }).fetch(
        'GET',
        `${baseUrl}/projects/export-function/data?project=${selectedProjectId}`,
        {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        }
      );

      console.log('📥 Download response status:', response.info().status);
      console.log('📥 Download path:', path);

      if (response.info().status === 200) {
        if (Platform.OS === 'ios') {
          // For iOS, we need to open the document
          RNFetchBlob.ios.openDocument(response.data);
        }
        
        Alert.alert(
          'Success',
          `Excel report downloaded successfully!\nFile: ${filename}`,
          [{ text: 'OK' }]
        );
        
        console.log('✅ Excel file downloaded successfully');
      } else {
        throw new Error(`Download failed with status: ${response.info().status}`);
      }

    } finally {
      setDownloading(false);
    }
  };

  // ✅ Function to log current status
  const logStatus = () => {
    console.log('🔍 ===== STORE STATUS CHECK =====');
    console.log('📁 Current Project ID:', selectedProjectId);
    
    const storeState = getStoreState();
    console.log('🏪 useProjectStore Status:');
    console.log('   - selectedStepType:', selectedStepType);
    console.log('   - selectedStepId:', selectedStepId);
    console.log('   - selectedBuildingId:', storeState.selectedBuildingId);
    console.log('   - selectedLevelId:', storeState.selectedLevelId);
    console.log('   - selectedUnitName:', storeState.selectedUnitName);
    console.log('   - Full store state:', storeState);
    
    console.log('🔍 ===== END STATUS CHECK =====');
  };

  // Fetch cards data and save step_type & step_id to useProjectStore
  const fetchCardsData = async () => {
    try {
      setCardsLoading(true);

      if (!token || !selectedProjectId) {
        console.log('❌ Missing token or project ID for cards API');
        return;
      }

      console.log('==========================================');
      console.log('🃏 Fetching cards data...');
      console.log('📁 Project ID:', selectedProjectId);
      console.log('🌐 API URL:', `${baseUrl}/reports/project/cards2?projectId=${selectedProjectId}`);
      console.log('==========================================');

      const response = await fetch(
        `${baseUrl}/reports/project/cards2?projectId=${selectedProjectId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }
      );

      console.log('📡 Cards API Response status:', response.status);

      if (response.status === 401) {
        console.log('🔐 Cards API: Unauthorized');
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Cards API Error:', errorText);
        return;
      }

      const result = await response.json();
      console.log('✅ Cards API Response:', JSON.stringify(result, null, 2));

      // ✅ Use manipulated array if available, otherwise use original
      const dataArray = result.manipulated && result.manipulated.length > 0 
        ? result.manipulated 
        : result.original || [];

      if (Array.isArray(dataArray)) {
        setCardsData(dataArray);
        
        // ✅ Extract step_type and step_id from the response
        const stepTypesData = dataArray.map(item => ({
          step_type: item.step_type,
          step_id: item.step_id || item._id, // Use step_id if available, otherwise _id
          _id: item._id,
          name: item.name,
          type: item.type,
          order: item.order,
          completed_count: item.completed_count,
          last_week_count: item.last_week_count,
          project_id: selectedProjectId,
          fetched_at: new Date().toISOString()
        }));
        
        console.log('💾 ===== SAVING DATA TO useProjectStore =====');
        
        // ✅ Save all step types data to useProjectStore
        setProjectStepTypes(stepTypesData);
        console.log('✅ Step Types data saved to useProjectStore:', stepTypesData.length, 'items');
        
        // ✅ Save the FIRST step_type and step_id for immediate access
        if (stepTypesData.length > 0) {
          const firstStep = stepTypesData[0];
          setSelectedStepType(firstStep.step_type);
          setSelectedStepId(firstStep.step_id);
          
          console.log('✅ First step data saved to useProjectStore:', {
            step_type: firstStep.step_type,
            step_id: firstStep.step_id,
            _id: firstStep._id,
            name: firstStep.name,
            type: firstStep.type
          });
          
          // ✅ Verify the store was updated
          const currentState = getStoreState();
          console.log('🔍 Store verification:', {
            selectedStepType: currentState.selectedStepType,
            selectedStepId: currentState.selectedStepId
          });
        }

        // Log each step for verification
        console.log('📋 Individual Steps Found:');
        stepTypesData.forEach((step, index) => {
          console.log(`   ${index + 1}. ${step.name}:`, {
            step_type: step.step_type,
            step_id: step.step_id,
            _id: step._id,
            type: step.type
          });
        });
        
        console.log('💾 ===== DATA SAVE COMPLETE =====');
        
        // ✅ Log final status
        setTimeout(() => {
          logStatus();
        }, 1000);

      } else {
        console.log('⚠️ No cards data found in response');
        setCardsData([]);
      }

    } catch (error) {
      console.error('❌ Error fetching cards data:', error);
    } finally {
      setCardsLoading(false);
    }
  };

  // Fetch overall project data
  const fetchOverallData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!token) {
        setError('Authentication required');
        setLoading(false);
        return;
      }

      if (!selectedProjectId) {
        setError('No project selected');
        setLoading(false);
        return;
      }

      console.log('==========================================');
      console.log('🔍 Fetching overall project data...');
      console.log('📁 Project ID:', selectedProjectId);
      console.log('🔑 Token:', token.substring(0, 20) + '...');
      console.log('🌐 API URL:', `${baseUrl}/reports/project/overall?projectId=${selectedProjectId}`);
      console.log('==========================================');

      const response = await fetch(
        `${baseUrl}/reports/project/overall?projectId=${selectedProjectId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }
      );

      console.log('📡 Response status:', response.status);

      if (response.status === 401) {
        setError('Session expired. Please login again.');
        Alert.alert(
          'Session Expired',
          'Your session has expired. Please login again.',
          [
            {
              text: 'Login',
              onPress: () => navigation.navigate('Login')
            }
          ]
        );
        setLoading(false);
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Overall API Response:', JSON.stringify(result, null, 2));

      if (result && result.data) {
        setOverallData(result.data);
        console.log('📊 Overall Completion:', result.data.completed_count || 0);
        console.log('📊 Last Week Count:', result.data.last_week_count || 0);
        
        await fetchCardsData();
        await fetchBuildingsData(); // ✅ Fetch buildings data after overall data
      } else {
        console.log('⚠️ No data found in response');
        setOverallData({
          completed_count: 0,
          last_week_count: 0
        });
        
        await fetchCardsData();
        await fetchBuildingsData(); // ✅ Fetch buildings data even if no overall data
      }

    } catch (error) {
      console.error('❌ Error fetching overall data:', error);
      setError('Failed to load project data. Please try again.');
      
      setOverallData({
        completed_count: 0,
        last_week_count: 0
      });
      
      await fetchCardsData();
      await fetchBuildingsData(); // ✅ Fetch buildings data even on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🚀 CurrentProjectsPhases mounted - Starting data fetch...');
    logStatus(); // Log initial status
    
    if (token && selectedProjectId) {
      fetchOverallData();
    } else {
      setLoading(false);
      setError(!token ? 'Authentication required' : 'No project selected');
    }
  }, [token, selectedProjectId]);

  // Log when component updates
  useEffect(() => {
    if (!loading && !cardsLoading) {
      console.log('✅ Data loading complete - checking final status...');
      logStatus();
    }
  }, [loading, cardsLoading]);

  // ✅ Add navigation focus listener
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('🔍 CurrentProjectsPhases focused - checking store state');
      logStatus();
    });

    return unsubscribe;
  }, [navigation]);

  const sections = [
    {
      id: '1',
      title: 'Overall Completion',
      lastWeek: overallData ? `${overallData.completed_count || 0}%` : '0%',
      update: 'Completion to Date',
    },
    {
      id: '2',
      title: 'Overall Productivity',
      lastWeek: overallData ? `${overallData.last_week_count || 0}%` : '0%',
      update: 'Last Week Productivity',
    },
  ];

  const getVerticalData = () => {
    if (cardsData.length > 0) {
      return cardsData.map((item, index) => ({
        id: item._id || `card-${index}`,
        title: item.name || 'Unnamed Phase',
        lastWeek: item.last_week_count ? `${item.last_week_count}%` : '0%',
        redProgress: 0,
        greenProgress: item.last_week_count ? Math.min(Math.max(parseFloat(item.last_week_count), 0), 100) : 0,
        step_type: item.step_type,
        step_id: item.step_id || item._id,
        type: item.type || 'step', // ✅ Default type set karein agar nahi hai toh
        originalData: item
      }));
    }

    return [];
  };

  const data = getVerticalData();

  const renderHorizontalItem = ({ item }) => (
    <View style={styles.cardContainer}>
      <View style={styles.horizontalCard}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <View style={styles.percentageContainer}>
          <Text style={styles.percentageText}>{item.lastWeek}</Text>
          <Text style={styles.updateText}>{item.update}</Text>
        </View>
      </View>
    </View>
  );

  const renderVerticalItem = ({ item }) => (
    <TouchableOpacity
      style={styles.verticalCard}
      onPress={() => {
        console.log('📍 ===== PHASE CARD PRESSED =====');
        console.log('📋 Selected Phase:', {
          title: item.title,
          step_type: item.step_type,
          step_id: item.step_id,
          type: item.type,
        });

        // ✅ Save step_type AND step_id to useProjectStore when pressed
        if (item.step_type || item.step_id) {
          if (item.step_type) {
            setSelectedStepType(item.step_type);
            console.log('✅ step_type saved to useProjectStore:', item.step_type);
          }
          
          if (item.step_id) {
            setSelectedStepId(item.step_id);
            console.log('✅ step_id saved to useProjectStore:', item.step_id);
          }
          
          const currentState = getStoreState();
          console.log('🔍 Store after saving:', {
            selectedStepType: currentState.selectedStepType,
            selectedStepId: currentState.selectedStepId
          });
          
          // Log updated status
          setTimeout(() => {
            logStatus();
          }, 500);
        } else {
          console.log('❌ Missing step_type and step_id in item:', item);
        }

        console.log('📍 ===== NAVIGATION BASED ON TYPE =====');
        
        // ✅ MAIN CONDITION: Type ke hisaab se navigate karein
        if (item.type === "step") {
          console.log('🎯 Type is "step" - Navigating to DesignTask...');
          navigation.navigate('DesignTask', { 
            project: item,
            projectId: selectedProjectId,
            step_type: item.step_type,
            step_id: item.step_id
          });
        } 
        // ✅ CONDITION 2: Agar type "multi-step" hai toh modal open karein
        else if (item.type === "multi-step") {
          console.log('🎯 Type is "multi-step" - Opening modal...');
          setModalVisible(true);
        }
        // ✅ CONDITION 3: Agar type nahi hai ya koi aur type hai
        else {
          console.log('📍 Unknown or missing type:', item.type);
          // Fallback: Agar type nahi hai lekin title "Design" hai
          if (item.title === 'Design' && item.step_type) {
            console.log('🎯 Fallback: Navigating to DesignTask based on title...');
            navigation.navigate('DesignTask', { 
              project: item,
              projectId: selectedProjectId,
              step_type: item.step_type,
              step_id: item.step_id
            });
          } 
          // Fallback: Agar type nahi hai lekin title "Finishes" hai
          else if (item.title === 'Finishes') {
            console.log('🎯 Fallback: Opening modal based on title...');
            setModalVisible(true);
          }
          else {
            console.log('📍 No specific navigation for this item');
          }
        }
      }}
    >
      <View style={styles.leftContainer}>
        <Text style={styles.projectTitle}>{item.title}</Text>
        <Text style={styles.legendText}>Last Week: {item.lastWeek}</Text>
        
        {/* ✅ Type display karein UI mein bhi */}
        <View style={styles.typeContainer}>
          <Text style={[
            styles.typeText,
            item.type === "step" ? styles.stepType : 
            item.type === "multi-step" ? styles.multiStepType : 
            styles.unknownType
          ]}>
            Type: {item.type || 'Not specified'}
          </Text>
        </View>
        
        {item.step_type && (
          <Text style={styles.stepTypeText}>Step Type: {item.step_type}</Text>
        )}
        {item.step_id && (
          <Text style={styles.stepIdText}>Step ID: {item.step_id}</Text>
        )}
      </View>
      <View style={styles.progressContainer}>
        <AnimatedCircularProgress
          size={wp('15%')}
          width={6}
          fill={item.redProgress}
          tintColor="red"
          backgroundColor="#e0e0e0"
          rotation={0}
        />
        <AnimatedCircularProgress
          size={wp('12%')}
          width={7}
          fill={item.greenProgress}
          tintColor="green"
          backgroundColor="#e0e0e0"
          rotation={0}
          style={styles.innerProgress}
        >
          {() => <Text style={styles.progressText}>{item.greenProgress}%</Text>}
        </AnimatedCircularProgress>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: wp('5%') }}>
          <Text style={styles.title}>Oran Park Resi 3</Text>
          <TouchableOpacity
            style={styles.iconContainer}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={hp('2.8%')} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1d9b20" />
          <Text style={styles.loadingText}>Loading project data...</Text>
          {cardsLoading && (
            <Text style={styles.loadingSubText}>Fetching phase details...</Text>
          )}
          {buildingsLoading && (
            <Text style={styles.loadingSubText}>Loading buildings data...</Text>
          )}
        </View>
      </View>
    );
  }

  if (error && !overallData) {
    return (
      <View style={styles.container}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: wp('5%') }}>
          <Text style={styles.title}>Oran Park Resi 3</Text>
          <TouchableOpacity
            style={styles.iconContainer}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={hp('2.8%')} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={60} color="#ff6b6b" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={fetchOverallData}
          >
            <Ionicons name="refresh" size={20} color="#fff" />
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={{ fontSize: 18, marginBottom: 10 }}>Finishes</Text>
            
            {/* Building Dropdown */}
            <CustomDropdown
              label="Building"
              options={buildingsData.map(building => ({
                label: building.name,
                value: building._id
              }))}
              selectedValue={selectedBuilding}
              onSelect={handleBuildingSelect}
            />

            {/* Level Dropdown */}
            <CustomDropdown
              label="Level"
              options={levelsData.map(level => ({
                label: level.name,
                value: level._id
              }))}
              selectedValue={selectedLevel}
              onSelect={handleLevelSelect}
            />

            {/* Unit Dropdown */}
            <CustomDropdown
              label="Unit"
              options={unitsData}
              selectedValue={selectedUnit}
              onSelect={handleUnitSelect}
            />

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#fff' }]}
                onPress={() => {
                  setModalVisible(false);
                  // Reset selections
                  setSelectedBuilding(null);
                  setSelectedLevel(null);
                  setSelectedUnit(null);
                  setLevelsData([]);
                  setUnitsData([]);
                }}
              >
                <Text style={[styles.modalButtonText, { color: 'red' }]}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton, 
                  { 
                    backgroundColor: (selectedBuilding || selectedLevel) ? '#5cb85c' : '#cccccc' 
                  }
                ]}
                onPress={() => {
                  // ✅ CHANGED CONDITION: Building OR Level select hone par navigate karega
                  if (selectedBuilding || selectedLevel) {
                    setModalVisible(false);
                    
                    console.log('📍 ===== NAVIGATING TO CoreTask =====');
                    console.log('🏢 Building ID:', selectedBuilding);
                    console.log('🏗️ Level ID:', selectedLevel);
                    console.log('🏠 Unit Name:', selectedUnit);
                    
                    // ✅ Log store status before navigation
                    logStatus();
                    
                    navigation.navigate('CoreTask', {
                      building: selectedBuilding,
                      level: selectedLevel,
                      unit: selectedUnit,
                      projectId: selectedProjectId,
                    });
                  } else {
                    alert(
                      'Please select at least Building OR Level before proceeding.',
                    );
                  }
                }}
                disabled={!selectedBuilding && !selectedLevel} // ✅ Button disable agar kuch bhi select nahi hai
              >
                <Text style={[styles.modalButtonText, { color: '#fff' }]}>
                  Confirm
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView style={styles.scrollView}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={styles.title}>Oran Park Resi 3</Text>
          <TouchableOpacity
            style={styles.iconContainer}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={hp('2.8%')} color="#fff" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[styles.downloadButton, downloading && styles.downloadButtonDisabled]}
          onPress={downloadExcelReport}
          disabled={downloading}
        >
          {downloading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="download-outline" size={20} color="#fff" />
          )}
          <Text style={styles.downloadButtonText}>
            {downloading ? 'Downloading...' : 'Download Report'}
          </Text>
        </TouchableOpacity>

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={sections}
          renderItem={renderHorizontalItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.horizontalFlatListContent}
          style={{ marginVertical: hp('2%') }}
        />

        <FlatList
          numColumns={2}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
          data={data}
          renderItem={renderVerticalItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.verticalFlatListContent}
          columnWrapperStyle={styles.columnWrapper}
        />
       
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  dropdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  placeholderText: { color: '#999' },
  dropdownText: {
    fontSize: hp(1.8),
    color: '#333',
  },
  projectsTitle: {
    fontSize: hp(2),
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f8f8',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.5%'),
    borderRadius: wp('3%'),
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    minWidth: wp('45%'),
  },
  dropdownButtonOpen: {
    borderColor: '#1d9b20',
    backgroundColor: '#f0f8f0',
  },
  dropdownIcon: { marginLeft: wp('2%') },
  dropdownOptions: {
    marginTop: hp('1%'),
    backgroundColor: '#fff',
    borderRadius: wp('3%'),
    borderWidth: 1.5,
    borderColor: '#D3D3D3',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  optionItem: {
    paddingVertical: hp('1.8%'),
    paddingHorizontal: wp('4%'),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedOption: { backgroundColor: '#f0f8f0' },
  optionText: { fontSize: hp(1.8), color: '#333' },
  selectedOptionText: { fontWeight: '600', color: '#1d9b20' },
  modalButtonRow: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    gap: hp('2%'),
    marginTop: hp('2%'),
  },
  modalButton: {
    paddingVertical: hp('1%'),
    paddingHorizontal: wp('5%'),
    borderRadius: 8,
  },
  modalButtonText: {
    fontSize: hp('1.8%'),
    fontWeight: '600',
    textAlign: 'center',
  },
  iconContainer: {
    backgroundColor: 'gray',
    padding: wp('1%'),
    borderRadius: wp('5%'),
  },
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  scrollView: { flex: 1, padding: wp('5%') },
  title: { fontSize: hp('2.5%'), fontWeight: 'bold', color: '#333' },
  
  // ✅ Download Button Styles
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1d9b20',
    paddingVertical: hp('1.5%'),
    paddingHorizontal: wp('4%'),
    borderRadius: 8,
    marginVertical: hp('1%'),
    gap: 10,
  },
  downloadButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: hp('1.8%'),
    fontWeight: '600',
  },
  
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalBox: {
    width: wp('85%'),
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  horizontalFlatListContent: { paddingHorizontal: wp('2%') },
  cardContainer: { width: wp('42%'), marginHorizontal: wp('1%') },
  horizontalCard: {
    backgroundColor: '#fff',
    padding: wp('1%'),
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    height: hp('16%'),
  },
  cardTitle: { fontSize: hp('1.8%'), fontWeight: '600', color: '#333' },
  percentageContainer: { alignItems: 'center' },
  percentageText: { fontSize: hp('3%'), fontWeight: 'bold', color: '#1d9b20' },
  updateText: { fontSize: hp('1.5%'), color: '#666', marginTop: hp('0.5%') },
  verticalFlatListContent: {
    paddingHorizontal: wp('1%'),
    paddingBottom: hp('2%'),
  },
  columnWrapper: { justifyContent: 'space-between', paddingBottom: wp('1.3%') },
  verticalCard: {
    backgroundColor: '#fff',
    padding: wp('3%'),
    marginVertical: hp('0.5%'),
    marginHorizontal: wp('1%'),
    borderRadius: 12,
    width: wp('43%'),
    elevation: 3,
    minHeight: hp('10%'),
  },
  leftContainer: { flex: 1, marginRight: wp('2%'), justifyContent: 'center' },
  projectTitle: { fontSize: hp('1.8%'), fontWeight: 'bold', color: '#333' },
  legendText: { fontSize: hp('1.5%'), color: '#666' },
  
  // ✅ New styles for type display
  typeContainer: {
    marginTop: 4,
  },
  typeText: {
    fontSize: hp('1.2%'),
    fontWeight: '600',
    fontStyle: 'italic',
  },
  stepType: {
    color: '#1d9b20', // Green for step type
  },
  multiStepType: {
    color: '#ff9800', // Orange for multi-step type
  },
  unknownType: {
    color: '#757575', // Gray for unknown type
  },
  
  stepTypeText: { 
    fontSize: hp('1.2%'), 
    color: '#999', 
    fontStyle: 'italic', 
    marginTop: 2 
  },
  stepIdText: { 
    fontSize: hp('1.2%'), 
    color: '#666', 
    fontStyle: 'italic', 
    marginTop: 2 
  },
  progressContainer: {
    position: 'relative',
    width: wp('15%'),
    height: wp('15%'),
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: hp('1.5%'),
  },
  innerProgress: { position: 'absolute' },
  progressText: { fontSize: hp('1.3%'), fontWeight: 'bold', color: 'green' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp('10%'),
  },
  loadingText: {
    marginTop: hp('2%'),
    fontSize: hp('2%'),
    color: '#666',
    textAlign: 'center',
  },
  loadingSubText: {
    marginTop: hp('1%'),
    fontSize: hp('1.5%'),
    color: '#999',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp('10%'),
  },
  errorText: {
    fontSize: hp('2%'),
    color: '#ff6b6b',
    textAlign: 'center',
    marginTop: hp('2%'),
    marginBottom: hp('3%'),
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1d9b20',
    paddingHorizontal: wp('6%'),
    paddingVertical: hp('1.5%'),
    borderRadius: 8,
    gap: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: hp('1.8%'),
    fontWeight: '600',
  },
});

export default CurrentProjectsPhases;