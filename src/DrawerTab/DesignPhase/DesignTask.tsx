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
  
  // Get data from useProjectStore (where step_type is saved)
  const { 
    selectedProjectId, 
    selectedStepType,
    getStoreState
  } = useProjectStore();
  
  // Also get step_type from route params as fallback
  const routeStepType = route.params?.step_type;
  
  const token = useSelector(state => state.auth.token);
  
  const [sections, setSections] = useState([
    {
      id: '1',
      title: 'Productivity',
      percentage: '0%',
      subtitle: 'Last Weeks Productivity',
      timestamp: 'Loading...',
      lastWeekData: '0%',
    },
    {
      id: '2',
      title: 'Completion',
      percentage: '0%',
      subtitle: '',
      timestamp: 'Loading...',
    },
  ]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Use stepType from store OR route params
  const stepType = selectedStepType || routeStepType;

  // Fetch productivity and completion data from first API
  const fetchOverallStepWiseData = async () => {
    try {
      if (!selectedProjectId || !stepType || !token) {
        console.log('Missing data for overall API:', {
          projectId: selectedProjectId,
          stepType: stepType,
          token: token ? 'Available' : 'Missing'
        });
        return;
      }

      const API_URL = `${baseUrl}/reports/project/overall_step_wise?projectId=${selectedProjectId}&step_type=${stepType}`;
      
      console.log('==========================================');
      console.log('Fetching overall step wise data...');
      console.log('API URL:', API_URL);
      console.log('Project ID:', selectedProjectId);
      console.log('Step Type:', stepType);
      console.log('==========================================');

      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Overall Step Wise API Response:', JSON.stringify(result, null, 2));

      if (result && result.data) {
        const data = result.data;
        console.log('Completed Count:', data.completed_count);
        console.log('Last Week Count:', data.last_week_count);

        setSections(prevSections => [
          {
            ...prevSections[0],
            percentage: `${data.last_week_count || 0}%`,
            timestamp: 'As of just now',
          },
          {
            ...prevSections[1],
            percentage: `${data.completed_count || 0}%`,
            timestamp: 'As of just now',
          },
        ]);
      } else {
        console.log('No data in response');
      }

    } catch (err) {
      console.error('Error fetching overall step wise data:', err);
      throw err;
    }
  };

  // Fetch last week productivity data from second API
  const fetchIndividualProductivityData = async () => {
    try {
      if (!selectedProjectId || !stepType || !token) {
        console.log('Missing data for individual API:', {
          projectId: selectedProjectId,
          stepType: stepType,
          token: token ? 'Available' : 'Missing'
        });
        return;
      }

      const API_URL = `${baseUrl}/reports/project/s-cursive/individual?projectId=${selectedProjectId}&step_type=${stepType}`;
      
      console.log('==========================================');
      console.log('Fetching individual productivity data...');
      console.log('API URL:', API_URL);
      console.log('==========================================');

      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Individual Productivity API Response:', JSON.stringify(result, null, 2));

      if (result && result.data) {
        const data = result.data;
        console.log('Last Week Data:', data.lastWeek || data.last_week);

        setSections(prevSections => [
          {
            ...prevSections[0],
            lastWeekData: `${data.lastWeek || data.last_week || 0}%`,
          },
          prevSections[1]
        ]);
      } else {
        console.log('No data in response');
      }

      return result;

    } catch (err) {
      console.error('Error fetching individual productivity data:', err);
      throw err;
    }
  };

  // Main function to fetch all data
  const fetchAllData = async () => {
    try {
      if (!selectedProjectId || !stepType || !token) {
        console.log('Missing required data:', {
          projectId: selectedProjectId,
          stepType: stepType,
          token: token ? 'Available' : 'Missing'
        });
        setLoading(false);
        return;
      }

      console.log('Starting data fetch...');
      setLoading(true);
      setError(null);

      await Promise.all([
        fetchOverallStepWiseData(),
        fetchIndividualProductivityData()
      ]);

      console.log('All data fetched successfully');

    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
      
      setSections([
        {
          id: '1',
          title: 'Productivity',
          percentage: 'N/A',
          subtitle: 'Last Weeks Productivity',
          timestamp: 'Failed to load',
          lastWeekData: 'N/A',
        },
        {
          id: '2',
          title: 'Completion',
          percentage: 'N/A',
          subtitle: '',
          timestamp: 'Failed to load',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('==========================================');
    console.log('useEffect triggered - DesignTask');
    console.log('Project ID:', selectedProjectId);
    console.log('Step Type (from useProjectStore):', selectedStepType);
    console.log('Step Type (from route params):', routeStepType);
    console.log('Final Step Type being used:', stepType);
    console.log('Token:', token ? 'Available' : 'Missing');
    
    // ✅ Check full store state
    const fullStoreState = getStoreState();
    console.log('💾 Full store state:', fullStoreState);
    console.log('==========================================');

    if (selectedProjectId && stepType && token) {
      fetchAllData();
    } else {
      setLoading(false);
      
      if (!stepType) {
        console.log('❌ stepType is null/undefined');
        console.log('Store selectedStepType:', selectedStepType);
        console.log('Route step_type:', routeStepType);
      }
    }
  }, [selectedProjectId, stepType, token]);

  // ✅ Add delayed check to see if store updates
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('⏰ Delayed store check in DesignTask:');
      const currentState = getStoreState();
      console.log('Store state after delay:', currentState);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const designStages = [
    {
      id: '1',
      title: 'Design Preparation Stage',
      date: '04/03/25',
      progress: 'Progress',
      percentage: 30,
      color: '#4CAF50',
    },
    {
      id: '2',
      title: 'Design Development Stage',
      date: '19/05/25',
      progress: 'Progress',
      percentage: 55,
      color: '#4CAF50',
    },
    {
      id: '3',
      title: 'Detail Design (70%-100%)',
      date: '19/05/25',
      progress: 'Progress',
      percentage: 80,
      color: '#FF9800',
    },
    {
      id: '4',
      title: 'Issue For Construction (IFC)',
      date: '06/06/25',
      progress: 'Progress',
      percentage: 100,
      color: '#757575',
    },
  ];

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => {
        if (item.title === 'Design Development Stage') {
          navigation.navigate('DesignList', { project: item });
        }
      }}
    >
      <View style={[styles.leftBar, { backgroundColor: item.color }]} />
      <View style={{ flex: 1 }}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {item.id}. {item.title}
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
        {loading ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator size="small" color="#1d9b20" />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : (
          <>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <View style={styles.percentageContainer}>
              <Text style={styles.percentageText}>{item.percentage}</Text>
              
              {item.title === 'Productivity' && item.lastWeekData && (
                <View style={styles.lastWeekContainer}>
                  <Text style={styles.lastWeekLabel}>Last Week:</Text>
                  <Text style={styles.lastWeekValue}>{item.lastWeekData}</Text>
                </View>
              )}
              
              {item.subtitle ? (
                <Text style={styles.updateText}>{item.subtitle}</Text>
              ) : null}
              <Text style={styles.updateTexts}>{item.timestamp}</Text>
            </View>
          </>
        )}
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
            
            {/* Step Type Display */}
            <View style={styles.stepTypeContainer}>
              <Text style={styles.stepTypeLabel}>Current Step Type: </Text>
              <Text style={styles.stepTypeValue}>{stepType || 'Not available'}</Text>
            </View>
            
            <Text style={styles.subtitle}>
              Productivity-Matrix {stepType ? 'Design' : 'Loading...'}
            </Text>
            
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
            <Text style={styles.sectionTitle}>
              {stepType ? 'Design' : 'Loading...'}
            </Text>
          </>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  stepTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: hp('1%'),
    marginBottom: hp('0.5%'),
    borderLeftWidth: 4,
    borderLeftColor: '#1d9b20',
  },
  stepTypeLabel: {
    fontSize: hp('1.8%'),
    color: '#666',
    fontWeight: '500',
  },
  stepTypeValue: {
    fontSize: hp('1.8%'),
    color: '#1d9b20',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: hp('2.3%'),
    color: '#ADADAD',
    marginBottom: hp('1%'),
    fontFamily: 'Poppins-Italic',
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
  updateText: {
    fontSize: hp('1.5%'),
    color: '#000',
    fontWeight: 'bold',
    marginTop: hp('0.5%'),
    textAlign: 'left', 
  },
  updateTexts: {
    fontSize: hp('1.3%'),
    color: '#666',
    marginTop: hp('0.5%'),
    textAlign: 'left',
  },
  lastWeekContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp('0.5%'),
    backgroundColor: '#f0f8f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  lastWeekLabel: {
    fontSize: hp('1.4%'),
    color: '#666',
    marginRight: 5,
  },
  lastWeekValue: {
    fontSize: hp('1.5%'),
    color: '#1d9b20',
    fontWeight: 'bold',
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
  loadingCard: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: hp('1.4%'),
    color: '#666',
    marginTop: 5,
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
});