import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { useProjectStore } from '../../Store/useProjectStore';
import { baseUrl } from '../../utils/Api';

export default function DesignTask({ route }) {
  const navigation = useNavigation();
  
  const { 
    selectedProjectId, 
    selectedStepType,
    selectedStepId,
    getStoreState,
    setDesignId // Add this function to your Zustand store
  } = useProjectStore();
  
  const routeStepType = route.params?.step_type;
  const routeStepId = route.params?.step_id;
  
  const token = useSelector(state => state.auth.token);
  
  const [sections, setSections] = useState(null);
  const [designStages, setDesignStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stagesLoading, setStagesLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stepTypeName, setStepTypeName] = useState('Design'); // State for dynamic step type name

  // Use from store OR route params as fallback
  const stepType = selectedStepType || routeStepType;
  const stepId = selectedStepId || routeStepId;

  // Function to handle item click
  const handleItemClick = (item) => {
    // Save design_id to Zustand store
    if (item.originalData && item.originalData._id) {
      setDesignId(item.originalData._id);
      console.log('💾 Design ID saved to Zustand:', item.originalData._id);
    }
    
    // Navigate to DesignList screen with all necessary data including _id
    navigation.navigate('DesignList', { 
      project: item,
      designId: item.originalData?._id, // Pass _id explicitly
      stageName: item.title,
      stageData: item.originalData // Pass entire original data if needed
    });
  };

  // Fetch design stages data from table API
  const fetchDesignStagesData = async () => {
    try {
      if (!selectedProjectId || !stepId || !token) {
        console.log('❌ Missing data for design stages API:', {
          projectId: selectedProjectId,
          stepId: stepId,
          token: token ? 'Available' : 'Missing'
        });
        return [];
      }

      const API_URL = `${baseUrl}/reports/project/table?projectId=${selectedProjectId}&step_type=${stepId}`;
      
      console.log('==========================================');
      console.log('📋 Fetching design stages data...');
      console.log('🌐 API URL:', API_URL);
      console.log('📁 Project ID:', selectedProjectId);
      console.log('🔢 Step Type:', stepId);
      console.log('==========================================');

      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('📡 Design Stages API Response status:', response.status);
      console.log('📡 Response OK:', response.ok);

      const responseText = await response.text();
      console.log('📄 Raw Design Stages API Response:', responseText);

      // ✅ Parse successful response
      let result;
      try {
        result = JSON.parse(responseText);
        console.log('✅ Parsed Design Stages API Response:', JSON.stringify(result, null, 2));
      } catch (parseError) {
        console.error('❌ JSON Parse Error:', parseError);
        throw new Error('Invalid JSON response from server');
      }

      // ✅ Handle different response formats
      let stagesData = [];

      if (result && Array.isArray(result) && result.length > 0) {
        stagesData = result;
        console.log('🎯 Array Response Data:', stagesData);
      } 
      else if (result && result.data && Array.isArray(result.data)) {
        stagesData = result.data;
        console.log('🎯 Object with Data Array:', stagesData);
      }
      else if (result && typeof result === 'object') {
        stagesData = [result];
        console.log('🎯 Single Object Response:', stagesData);
      } else {
        console.log('⚠️ No recognizable data in design stages API response');
        return [];
      }

      // ✅ Transform API data to designStages format
      const transformedStages = stagesData.map((item, index) => {
        // Extract name, date, and avg from API response
        const name = item.name || item.stage_name || item.title || `Stage ${index + 1}`;
        const date = item.date || item.created_at || item.updated_at || 'Not specified';
        const avg = parseFloat(item.avg) || parseFloat(item.average) || parseFloat(item.progress) || 0;
        
        // Determine color based on avg percentage
        let color = '#757575'; // Default gray for 0-25%
        if (avg >= 50) {
          color = '#4CAF50'; // Green for 50-100%
        } else if (avg >= 25) {
          color = '#FF9800'; // Orange for 25-50%
        }

        return {
          id: item._id || item.id || `stage-${index}`,
          title: name,
          date: formatDate(date),
          progress: 'Progress',
          percentage: Math.min(Math.max(avg, 0), 100), // Ensure between 0-100
          color: color,
          originalData: item, // Keep original data for reference (includes _id)
          stepTypeName: item.step_type_name // ✅ Add step_type_name from API response
        };
      });

      console.log('✅ Transformed Design Stages:', transformedStages);
      return transformedStages;

    } catch (err) {
      console.error('❌ Error fetching design stages data:', err);
      console.error('❌ Error stack:', err.stack);
      return [];
    }
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString || dateString === 'Not specified') {
      return 'Not specified';
    }
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString; // Return original if invalid date
      }
      
      // Format as DD/MM/YY
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear().toString().slice(-2);
      
      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error('Date formatting error:', error);
      return dateString;
    }
  };

  // Fetch productivity and completion data
  const fetchOverallStepWiseData = async () => {
    try {
      if (!selectedProjectId || !token) {
        console.log('❌ Missing data for overall API:', {
          projectId: selectedProjectId,
          token: token ? 'Available' : 'Missing'
        });
        return null;
      }

      // ✅ CORRECTED API URL - Using step_type instead of step_id
      let API_URL = `${baseUrl}/reports/project/overall_step_wise?projectId=${selectedProjectId}&step_type={stepId}`;
      
      // Add step_id only if it exists (as optional parameter)
      if (stepId) {
        API_URL += `&step_id=${stepId}`;
      }
      
      console.log('==========================================');
      console.log('📊 Fetching overall step wise data...');
      console.log('🌐 API URL:', API_URL);
      console.log('📁 Project ID:', selectedProjectId);
      console.log('🔢 Step Type:', stepType);
      console.log('🆔 Step ID:', stepId);
      console.log('🔑 Token:', token ? 'Available' : 'Missing');
      console.log('==========================================');

      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('📡 Overall API Response status:', response.status);
      console.log('📡 Response OK:', response.ok);

      const responseText = await response.text();
      console.log('📄 Raw API Response:', responseText);

      // ✅ Parse successful response
      let result;
      try {
        result = JSON.parse(responseText);
        console.log('✅ Parsed API Response:', JSON.stringify(result, null, 2));
      } catch (parseError) {
        console.error('❌ JSON Parse Error:', parseError);
        throw new Error('Invalid JSON response from server');
      }

      // ✅ Handle array response (like your Postman example)
      if (result && Array.isArray(result) && result.length > 0) {
        const data = result[0];
        console.log('🎯 Array Response Data:', data);
        console.log('📊 Completed Count:', data.completed_count);
        console.log('📊 Last Week Count:', data.last_week_count);
        console.log('📊 Total Tasks:', data.totalTasks);
        console.log('📊 Completed Tasks:', data.completedTasks);
        
        // ✅ All available keys show karein
        console.log('🔑 All Available Keys:', Object.keys(data));
        
        return {
          completedCount: data.completed_count || 0,
          lastWeekCount: data.last_week_count || 0,
          totalTasks: data.totalTasks || 0,
          completedTasks: data.completedTasks || 0
        };
      } 
      // ✅ Handle object response with data property
      else if (result && result.data) {
        const data = result.data;
        console.log('🎯 Object Response Data:', data);
        return {
          completedCount: data.completed_count || 0,
          lastWeekCount: data.last_week_count || 0,
          totalTasks: data.totalTasks || 0,
          completedTasks: data.completedTasks || 0
        };
      }
      // ✅ Handle direct object response
      else if (result && typeof result === 'object') {
        console.log('🎯 Direct Object Response:', result);
        return {
          completedCount: result.completed_count || 0,
          lastWeekCount: result.last_week_count || 0,
          totalTasks: result.totalTasks || 0,
          completedTasks: result.completedTasks || 0
        };
      } else {
        console.log('⚠️ No recognizable data in API response');
        console.log('📊 Response received:', result);
        return null;
      }

    } catch (err) {
      console.error('❌ Error fetching overall step wise data:', err);
      console.error('❌ Error stack:', err.stack);
      return {
        completedCount: 0,
        lastWeekCount: 0,
        totalTasks: 0,
        completedTasks: 0
      };
    }
  };

  // Main function to fetch all data
  const fetchAllData = async () => {
    try {
      if (!selectedProjectId || !token) {
        console.log('❌ Missing required data:', {
          projectId: selectedProjectId,
          token: token ? 'Available' : 'Missing'
        });
        setLoading(false);
        setStagesLoading(false);
        return;
      }

      console.log('🚀 Starting data fetch...');
      console.log('📦 Using values:', {
        projectId: selectedProjectId,
        stepType: stepType,
        stepId: stepId,
      });
      
      setLoading(true);
      setStagesLoading(true);
      setError(null);

      // Fetch both APIs in parallel for better performance
      const [overallData, stagesData] = await Promise.all([
        fetchOverallStepWiseData(),
        fetchDesignStagesData()
      ]);

      console.log('==========================================');
      console.log('📦 FINAL API RESULTS:');
      console.log('Overall Data Received:', overallData);
      console.log('Design Stages Data Received:', stagesData);
      console.log('==========================================');

      // ✅ Step type name extract karo (first item se)
      if (stagesData && stagesData.length > 0) {
        const firstStage = stagesData[0];
        if (firstStage.stepTypeName) {
          setStepTypeName(firstStage.stepTypeName);
          console.log('✅ Step Type Name set:', firstStage.stepTypeName);
        } else {
          console.log('⚠️ No step_type_name found in API response');
          // Check if step_type_name exists in originalData
          if (firstStage.originalData && firstStage.originalData.step_type_name) {
            setStepTypeName(firstStage.originalData.step_type_name);
            console.log('✅ Step Type Name set from originalData:', firstStage.originalData.step_type_name);
          }
        }
      }

      // ✅ Set sections data
      let newSections = [];

      if (!overallData) {
        console.log('⚠️ No data received from overall API');
        newSections = [
          {
            id: '1',
            title: 'Productivity',
            percentage: '0%',
            subtitle: 'Last Weeks Productivity',
            timestamp: 'No data available',
            lastWeekData: '0%',
            rawValue: 0
          },
          {
            id: '2',
            title: 'Completion',
            percentage: '0%',
            subtitle: 'Tasks Completion',
            timestamp: 'No data available',
            rawValue: 0
          },
        ];
      } else {
        // ✅ CORRECTED: Use proper calculations based on your API response
        console.log('🎯 Building sections with data:');
        console.log('📊 Productivity (completed_count):', overallData.completedCount);
        console.log('📊 Last Week (last_week_count):', overallData.lastWeekCount);
        console.log('📊 Total Tasks:', overallData.totalTasks);
        console.log('📊 Completed Tasks:', overallData.completedTasks);
        
        const completionPercentage = overallData.totalTasks > 0 
          ? ((overallData.completedTasks / overallData.totalTasks) * 100).toFixed(2)
          : 0;

        newSections = [
          {
            id: '1',
            title: 'Productivity',
            percentage: `${overallData.completedCount}%`,
            subtitle: 'Current Productivity',
            lastWeekData: `${overallData.lastWeekCount}%`,
            rawValue: overallData.completedCount
          },
          {
            id: '2',
            title: 'Completion',
            percentage: `${completionPercentage}%`,
            subtitle: 'Tasks Completion',
            timestamp: 'As of just now',
            tasksCompleted: overallData.completedTasks,
            totalTasks: overallData.totalTasks,
            rawValue: completionPercentage
          },
        ];
      }

      // ✅ Set design stages data
      if (stagesData && stagesData.length > 0) {
        setDesignStages(stagesData);
        console.log('✅ Design stages set with API data');
      } else {
        // Fallback to default data if API returns empty
        const fallbackStages = [
          {
            id: '1',
            title: 'Design Preparation Stage',
            date: '04/03/25',
            progress: 'Progress',
            percentage: 30,
            color: '#FF9800',
            originalData: { _id: 'fallback-1' }, // Add fallback _id
            stepTypeName: 'Design' // Fallback step type name
          },
          {
            id: '2',
            title: 'Design Development Stage',
            date: '19/05/25',
            progress: 'Progress',
            percentage: 55,
            color: '#4CAF50',
            originalData: { _id: 'fallback-2' }, // Add fallback _id
            stepTypeName: 'Design' // Fallback step type name
          },
          {
            id: '3',
            title: 'Detail Design (70%-100%)',
            date: '19/05/25',
            progress: 'Progress',
            percentage: 80,
            color: '#4CAF50',
            originalData: { _id: 'fallback-3' }, // Add fallback _id
            stepTypeName: 'Design' // Fallback step type name
          },
          {
            id: '4',
            title: 'Issue For Construction (IFC)',
            date: '06/06/25',
            progress: 'Progress',
            percentage: 100,
            color: '#4CAF50',
            originalData: { _id: 'fallback-4' }, // Add fallback _id
            stepTypeName: 'Design' // Fallback step type name
          },
        ];
        setDesignStages(fallbackStages);
        console.log('⚠️ Using fallback design stages data');
      }

      console.log('✅ Final Sections Data:', newSections);
      console.log('✅ Final Design Stages:', designStages);
      setSections(newSections);
      setLoading(false);
      setStagesLoading(false);

    } catch (err) {
      console.error('❌ Error in fetchAllData:', err);
      console.error('❌ Error stack:', err.stack);
      setError(err.message);
      setLoading(false);
      setStagesLoading(false);
      
      // Set error state for sections with default values
      const errorSections = [
        {
          id: '1',
          title: 'Productivity',
          percentage: '0%',
          subtitle: 'Last Weeks Productivity',
          timestamp: 'Failed to load',
          lastWeekData: '0%',
          rawValue: 0
        },
        {
          id: '2',
          title: 'Completion',
          percentage: '0%',
          subtitle: 'Tasks Completion',
          timestamp: 'Failed to load',
          rawValue: 0
        },
      ];
      
      console.log('⚠️ Setting error sections:', errorSections);
      setSections(errorSections);
    
      const fallbackStages = [
        {
          id: '1',
          title: 'Design Preparation Stage',
          date: '04/03/25',
          progress: 'Progress',
          percentage: 30,
          color: '#FF9800',
          originalData: { _id: 'error-1' },
          stepTypeName: 'Design'
        },
        {
          id: '2',
          title: 'Design Development Stage',
          date: '19/05/25',
          progress: 'Progress',
          percentage: 55,
          color: '#4CAF50',
          originalData: { _id: 'error-2' },
          stepTypeName: 'Design'
        },
        {
          id: '3',
          title: 'Detail Design (70%-100%)',
          date: '19/05/25',
          progress: 'Progress',
          percentage: 80,
          color: '#4CAF50',
          originalData: { _id: 'error-3' },
          stepTypeName: 'Design'
        },
        {
          id: '4',
          title: 'Issue For Construction (IFC)',
          date: '06/06/25',
          progress: 'Progress',
          percentage: 100,
          color: '#4CAF50',
          originalData: { _id: 'error-4' },
          stepTypeName: 'Design'
        },
      ];
      setDesignStages(fallbackStages);
    }
  };

  useEffect(() => {
    console.log('==========================================');
    console.log('🎬 useEffect triggered - DesignTask');
    console.log('📁 Project ID:', selectedProjectId);
    console.log('🔢 Step Type (from useProjectStore):', selectedStepType);
    console.log('🔢 Step Type (from route params):', routeStepType);
    console.log('🆔 Step ID (from useProjectStore):', selectedStepId);
    console.log('🆔 Step ID (from route params):', routeStepId);
    console.log('✅ Final Step Type being used:', stepType);
    console.log('✅ Final Step ID being used:', stepId);
    console.log('🔑 Token:', token ? 'Available' : 'Missing');
    
    const fullStoreState = getStoreState();
    console.log('💾 Full store state:', fullStoreState);
    console.log('==========================================');

    if (selectedProjectId && token) {
      fetchAllData();
    } else {
      setLoading(false);
      setStagesLoading(false);
      console.log('❌ Cannot fetch - missing required data');
    }
  }, [selectedProjectId, stepType, stepId, token]);

  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('⏰ Delayed store check in DesignTask:');
      const currentState = getStoreState();
      console.log('📦 Store state after delay:', {
        selectedStepType: currentState.selectedStepType,
        selectedStepId: currentState.selectedStepId,
        selectedProjectId: currentState.selectedProjectId,
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => handleItemClick(item)} // Use the new handler function
    >
      <View style={[styles.leftBar, { backgroundColor: item.color }]} />
      <View style={{ flex: 1 }}>
        <View style={styles.header}>
          <Text style={styles.title}>
          {item.title}
          </Text>
        </View>
        <Text style={styles.date}>{item.date}</Text>

        <Text style={styles.progressLabel}>{item.progress}</Text>

        <View style={styles.progressRow}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${item.percentage}%`, backgroundColor: item.color },
              ]}
            />
          </View>
          <Text style={styles.progressText}>{item.percentage}%</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderHorizontalItem = ({ item }) => (
    <View style={styles.cardContainer}>
      <View style={styles.horizontalCard}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <View style={styles.percentageContainer}>
          <Text style={styles.percentageText}>{item.percentage}</Text>
          
          {item.title === 'Productivity' && (
            <View style={styles.dataContainer}>
              <Text style={styles.dataLabel}>Last Week's Productivity</Text>
              <Text style={styles.dataValue}>{item.lastWeekData}</Text>
            </View>
          )}
          
          <Text style={styles.updateTexts}>{item.timestamp}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={24} color="#c62828" />
          <Text style={styles.errorText}>Error: {error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={fetchAllData}
          >
            <Ionicons name="refresh" size={16} color="#fff" />
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}
      
      <FlatList
        data={designStages}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: wp('5%'), paddingBottom: wp('3%') }}
        ListHeaderComponent={
          <>
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between' }}
            >
              <Text style={styles.pageTitle}>Oran Park Resi 3</Text>
              <TouchableOpacity
                style={styles.iconContainer}
                onPress={() => {
                  navigation.goBack();
                }}
              >
                <Ionicons name="arrow-back" size={hp('2.8%')} color="#ffff" />
              </TouchableOpacity>
            </View>
            <Text style={styles.subtitle}>
              Productivity-Matrix {stepTypeName} {/* ✅ Dynamic step type name */}
            </Text>
            
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1d9b20" />
                <Text style={styles.loadingText}>Loading data...</Text>
              </View>
            ) : sections ? (
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={sections}
                renderItem={renderHorizontalItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.horizontalFlatListContent}
                style={[
                  styles.horizontalFlatList,
                  {
                    paddingBottom: wp('1%'),
                  },
                ]}
              />
            ) : (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>No data available</Text>
              </View>
            )}
            
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {stepTypeName} {/* ✅ Dynamic step type name */}
              </Text>
              {stagesLoading && (
                <ActivityIndicator size="small" color="#1d9b20" />
              )}
            </View>
          </>
        }
        ListEmptyComponent={
          !stagesLoading && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No design stages available</Text>
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    fontSize: hp('2.3%'),
    color: '#ADADAD',
    marginBottom: hp('1%'),
    fontFamily: 'Poppins-Italic',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('1%'),
  },
  sectionTitle: {
    fontSize: hp('2.2%'),
    fontWeight: 'bold',
    color: '#333',
    marginTop: 2,
    marginBottom: 4,
    fontFamily: 'Poppins-SemiBold',
    marginHorizontal: wp('2%'),
  },
  percentageContainer: {
    alignItems: 'flex-start',
  },
  percentageText: {
    fontSize: hp('3%'),
    fontWeight: 'bold',
    color: '#1d9b20',
    textAlign: 'left',
  },
  dataContainer: {
    marginTop: hp('1%'),
    padding: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    alignSelf: 'stretch',
  },
  dataLabel: {
    fontSize: hp('1.4%'),
    color: '#666',
    fontWeight: '600',
  },
  dataValue: {
    fontSize: hp('1.8%'),
    color: '#1d9b20',
    fontWeight: 'bold',
    marginTop: 4,
  },
  updateTexts: {
    fontSize: hp('1.3%'),
    color: '#666',
    marginTop: hp('1%'),
    textAlign: 'left',
  },
  leftBar: {
    width: wp('9%'),
    borderRadius: wp('2%'),
    marginRight: 15,
  },
  itemContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: wp('1%'),
    marginBottom: 12,
    borderRadius: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 4,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333',
    minWidth: 40, 
    textAlign: 'right',
  },
  iconContainer: {
    backgroundColor: 'gray',
    padding: wp('1%'),
    borderRadius: wp('5%'),
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  pageTitle: {
    fontSize: hp('2.5%'),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: hp('0.1%'),
  },
  horizontalFlatList: {
    marginVertical: hp('2%'),
  },
  horizontalFlatListContent: {
    paddingHorizontal: wp('2%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContainer: {
    width: wp('45%'),
    marginHorizontal: wp('3.5%'), 
  },
  horizontalCard: {
    backgroundColor: '#fff',
    padding: wp('3%'),
    borderRadius: 12,
    minHeight: hp('18%'),
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: hp('1.8%'),
    fontWeight: '600',
    color: '#333',
    marginBottom: hp('1%'),
    textAlign: 'left',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 12,
    margin: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorText: {
    color: '#c62828',
    fontSize: 13,
    flex: 1,
    marginLeft: 8,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1d9b20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5,
    gap: 4,
  },
  retryText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp('3%'),
    marginVertical: hp('2%'),
  },
  loadingText: {
    marginTop: 10,
    fontSize: hp('1.6%'),
    color: '#666',
  },
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp('3%'),
    marginVertical: hp('2%'),
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: wp('2%'),
  },
  noDataText: {
    fontSize: hp('1.8%'),
    color: '#999',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp('5%'),
  },
  emptyText: {
    fontSize: hp('1.8%'),
    color: '#999',
    textAlign: 'center',
  },
});