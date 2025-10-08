import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
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
import { useProjectStore } from '../../Store/useProjectStore'; 
import { baseUrl } from '../../utils/Api';

export default function CoreTask() {
  const navigation = useNavigation();
  const token = useSelector(state => state.auth.token);
  const { selectedProjectId, selectedStepId } = useProjectStore();
  
  const [sections, setSections] = useState([]);
  const [designStages, setDesignStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCoreTaskData = async () => {
    if (!selectedProjectId || !selectedStepId || !token) {
      setError('Missing project ID, step ID, or authentication token');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const API_URL = `${baseUrl}/reports/project/overall_step_wise?projectId=${selectedProjectId}&step_type=${selectedStepId}`;

      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Transform API data to match your component structure
      if (data) {
        // Update sections with API data
        const updatedSections = [
          {
            id: '1',
            title: 'Productivity',
            percentage: `${data.last_week_count || '0'}`,
            subtitle: 'Last Weeks Productivity',
            timestamp: 'As of Friday 23 May at 1:38 pm',
          },
          {
            id: '2',
            title: 'Completion',
            percentage: `${data.completed_count || '0'}`,
            subtitle: '',
            timestamp: 'As of just now',
          },
        ];
        setSections(updatedSections);

        // Update design stages if available in API response
        // You might need to adjust this based on your actual API response structure
        if (data.design_stages || data.stages) {
          setDesignStages(data.design_stages || data.stages);
        } else {
          // Fallback to your existing design stages if not in API
          setDesignStages([
            {
              id: '1',
              title: 'Core 1',
              date: '04/03/25',
              progress: 93.75,
              color: '#90EE90',
            },
            {
              id: '2',
              title: 'Core 2',
              date: '19/05/25',
              progress: 98.83,
              color: '#4CAF50',
            },
            {
              id: '3',
              title: 'Core 3',
              date: '19/05/25',
              progress: 72.79,
              color: '#FF9800',
            },
            {
              id: '4',
              title: 'Core 4',
              date: '06/06/25',
              progress: 16.58,
              color: '#757575',
            },
          ]);
        }
      }
    } catch (err) {
      console.error('Error fetching core task data:', err);
      setError('Failed to load data. Please try again.');
      
      // Set fallback data in case of error
      setSections([
        {
          id: '1',
          title: 'Productivity',
          percentage: '0',
          subtitle: 'Last Weeks Productivity',
          timestamp: 'As of Friday 23 May at 1:38 pm',
        },
        {
          id: '2',
          title: 'Completion',
          percentage: '0',
          subtitle: '',
          timestamp: 'As of just now',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoreTaskData();
  }, [selectedProjectId, selectedStepId, token]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => {
        if (item.title === 'Core 1') {
          navigation.navigate('LevelsTask');
        }
      }}
    >
      <View style={[styles.leftBar, { backgroundColor: item.color }]} />
      <View style={{ flex: 1 }}>
        <View style={styles.header}>
          <Text style={styles.title}>{item.title}</Text>
        </View>
        <Text style={styles.date}>{item.date}</Text>
        <Text style={styles.progressLabel}>Completion</Text>
        <View style={styles.progressRow}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${item.progress}%`, backgroundColor: item.color },
              ]}
            />
          </View>
          <Text style={styles.progressText}>{item.progress.toFixed(2)}%</Text>
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
          {item.subtitle ? (
            <Text style={styles.updateText}>{item.subtitle}</Text>
          ) : null}
          <Text style={styles.updateTexts}>{item.timestamp}</Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1d9b20" />
          <Text style={styles.loadingText}>Loading data...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchCoreTaskData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
              <Text style={styles.pageTitle}>Park Sydney Stage 2</Text>
              <TouchableOpacity
                style={styles.iconContainer}
                onPress={() => {
                  navigation.goBack();
                }}
              >
                <Ionicons name="arrow-back" size={hp('2.8%')} color="#ffff" />
              </TouchableOpacity>
            </View>
            <Text
              style={{
                fontSize: hp('2.3%'),
                color: '#ADADAD',
                marginBottom: hp('0.1%'),
                fontFamily: 'Poppins-Italic',
              }}
            >
              Building A1
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
          </>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
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
    minWidth: 50,
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
    padding: wp('1.5%'),
    borderRadius: 12,
    height: hp('18%'),
  },
  cardTitle: {
    fontSize: hp('1.8%'),
    fontWeight: '600',
    color: '#333',
    marginBottom: hp('1%'),
    textAlign: 'left',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: hp('2%'),
    fontSize: hp('2%'),
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp('5%'),
  },
  errorText: {
    fontSize: hp('2%'),
    color: '#ff0000',
    textAlign: 'center',
    marginBottom: hp('2%'),
  },
  retryButton: {
    backgroundColor: '#1d9b20',
    paddingHorizontal: wp('5%'),
    paddingVertical: hp('1.5%'),
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: hp('1.8%'),
    fontWeight: 'bold',
  },
});