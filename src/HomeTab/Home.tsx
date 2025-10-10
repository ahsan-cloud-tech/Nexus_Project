import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Header from '../Components/Header';
import { baseUrl } from "../utils/Api";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import Ionicons from '@react-native-vector-icons/ionicons';
import { AnimatedCircularProgress } from 'react-native-circular-progress';

export default function Home({navigation}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const token = useSelector(state => state.auth.token);
  const dispatch = useDispatch();

  const fetchProjects = async (isRefresh = false) => {
    try {
      if (!isRefresh) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      setError(null);
      setIsSessionExpired(false);
    
      if (!token) {
        console.error('❌ No token found in Redux store');
        setError('Authentication required');
        setData([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      console.log('==========================================');
      console.log('🔍 Fetching projects from:', `${baseUrl}/reports/main-dashboard`);
      console.log('🔑 Token:', token.substring(0, 20) + '...');
      console.log('==========================================');

      const response = await fetch(`${baseUrl}/reports/main-dashboard`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      
      console.log('📡 Response status:', response.status);
      
      // ✅ Handle authentication errors
      if (response.status === 401) {
        setIsSessionExpired(true);
        setError('Session expired. Please login again.');
        Alert.alert(
          'Session Expired',
          'Your session has expired. Please login again.',
          [
            {
              text: 'Login',
              onPress: () => {
                // dispatch({ type: 'LOGOUT' }); // Uncomment based on your Redux setup
                navigation.navigate('Login');
              }
            }
          ]
        );
        setData([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      // ✅ Handle 404 errors
      if (response.status === 404) {
        setError('API endpoint not found. Please contact support.');
        console.error('❌ 404 Error: API endpoint not found');
        setData([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      // ✅ Handle other HTTP errors
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ API Response received successfully');
      console.log('📦 Full Response:', JSON.stringify(result, null, 2));
      
      // ✅ FIXED: Handle different API response structures
      let projectsData = [];
      
      if (result && Array.isArray(result.data)) {
        projectsData = result.data;
      } else if (result && result.data && Array.isArray(result.data)) {
        projectsData = result.data;
      } else if (result && Array.isArray(result)) {
        projectsData = result;
      } else if (result && result.projects && Array.isArray(result.projects)) {
        projectsData = result.projects;
      } else {
        console.log('⚠️ No projects data found in response');
        console.log('Response structure:', result);
        setData([]);
        setError('No projects data found');
        setLoading(false);
        setRefreshing(false);
        return;
      }
      
      console.log('==========================================');
      console.log('📊 Total Projects Found:', projectsData.length);
      console.log('==========================================\n');

      // ✅ Log each project's details
      projectsData.forEach((item, index) => {
        console.log(`📍 Project ${index + 1}:`);
        console.log(`   Name: ${item.name || item.projectName || 'N/A'}`);
        console.log(`   Industry: ${item.industry?.name || item.industry || 'N/A'}`);
        console.log(`   Profile Picture: ${item.profile_picture || item.profilePicture || item.image || 'N/A'}`);
        console.log(`   Completion %: ${item.completion_percentage || item.completionPercentage || item.completion || 0}%`);
        console.log(`   Last Week Productivity: ${item.allLastWeekProductivity || item.lastWeekProductivity || item.productivity || 0}%`);
        console.log(`   Status: ${item.status || 'Active'}`);
        console.log(`   ID: ${item._id || item.id || 'N/A'}`);
        console.log('   ─────────────────────────\n');
      });

      const formattedData = projectsData.map(item => {
        let imageSource = require('../assets/images/house.jpg');
        const profilePicture = item.profile_picture || item.profilePicture || item.image;
        
        if (profilePicture) {
          // Check if it's already a full URL
          if (profilePicture.startsWith('http')) {
            imageSource = { uri: profilePicture };
          } else if (profilePicture.startsWith('/')) {
            // Remove leading slash if present
            const cleanPath = profilePicture.replace(/^\//, '');
            imageSource = { uri: `${baseUrl}/${cleanPath}` };
          } else {
            // Add baseUrl if it's just a filename/path
            imageSource = { uri: `${baseUrl}/${profilePicture}` };
          }
        }
        const completionPercentage = item.completion_percentage || item.completionPercentage || item.completion || 0;
        const lastWeekProductivity = item.allLastWeekProductivity || item.lastWeekProductivity || item.productivity || 0;
        return {
          id: (item._id || item.id || Math.random().toString()).toString(),
          title: item.name || item.projectName || 'Unnamed Project',
          image: imageSource,
          // ✅ Use parsed numbers with fallbacks
          redProgress: lastWeekProductivity 
            ? Math.min(Math.max(parseFloat(lastWeekProductivity), 0), 100) 
            : 0,
          greenProgress: completionPercentage 
            ? Math.min(Math.max(parseFloat(completionPercentage), 0), 100) 
            : 0,
          company: item.industry?.name || item.industry || 'No Industry',
          status: item.status || 'Active',
          originalData: item // Save complete data
        };
      });
      
      console.log('==========================================');
      console.log('✅ Data formatted successfully');
      console.log('📊 Formatted Projects Count:', formattedData.length);
      console.log('==========================================\n');
      
      setData(formattedData);
      setError(null);
      
    } catch (error) {
      console.error('==========================================');
      console.error('❌ API Error occurred:');
      console.error('Error Message:', error.message);
      console.error('Error Stack:', error.stack);
      console.error('==========================================');
      
      // ✅ Better error messages
      if (error.message.includes('Network request failed')) {
        setError('Network error. Please check your internet connection.');
      } else if (error.message.includes('timeout')) {
        setError('Request timeout. Please try again.');
      } else {
        setError('Failed to load projects. Please try again.');
      }
      
      setData([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    fetchProjects(true);
  };

  useEffect(() => {
    if (token) {
      fetchProjects();
    } else {
      setLoading(false);
      setData([]);
      setError('Please login to continue');
    }
  }, [token]);

  // ✅ Filter data based on search query
  const filteredData = data.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      activeOpacity={0.8}
      onPress={() => {
        console.log('==========================================');
        console.log('🎯 Project Pressed:');
        console.log(`   Name: ${item.title}`);
        console.log(`   ID: ${item.id}`);
        console.log(`   Industry: ${item.company}`);
        console.log(`   Completion: ${item.greenProgress.toFixed(1)}%`);
        console.log(`   Last Week Productivity: ${item.redProgress.toFixed(1)}%`);
        console.log('==========================================');
        
        // Navigate to project details
        navigation.navigate('CurrentProjectsPhases', { 
          project: item,
          project_id: item.id
        });
      }}
    >
      <View style={styles.card}>
        <View style={styles.leftContainer}>
          <View style={styles.headerRow}>
            <View style={styles.titleContainer}>
              <Image 
                source={item.image} 
                style={styles.image}
                resizeMode="cover"
                defaultSource={require('../assets/images/house.jpg')}
                onError={(error) => {
                  console.log('⚠️ Image loading error for:', item.title, error.nativeEvent.error);
                  // Fallback to default image
                  item.image = require('../assets/images/house.jpg');
                }}
              />
              <Text style={styles.projectTitle} numberOfLines={2}>
                {item.title}
              </Text>
            </View>
            <Text style={styles.companyText}>
              {item.company}
            </Text>
          </View>
          <View style={styles.progressContainer}>
            <View style={styles.legendContainer}>
              <View style={styles.legendRow}>
                <View style={[styles.dot, { backgroundColor: 'green' }]} />
                <Text style={styles.legendText}>
                  Completion: {item.greenProgress.toFixed(0)}%
                </Text>
              </View>
              <View style={styles.legendRow}>
                <View style={[styles.dot, { backgroundColor: 'red' }]} />
                <Text style={styles.legendText}>
                  Last Week: {item.redProgress.toFixed(0)}%
                </Text>
              </View>
            </View>
            <View style={styles.circularProgressContainer}>
              <AnimatedCircularProgress
                size={75}
                width={6}
                fill={item.redProgress}
                tintColor="red"
                backgroundColor="#e0e0e0"
                rotation={0}
              />
              <AnimatedCircularProgress
                size={60}
                width={7}
                fill={item.greenProgress}
                tintColor="green"
                backgroundColor="#e0e0e0"
                rotation={0}
                style={styles.innerProgress}
              >
                {() => (
                  <Text style={styles.progressText}>
                    {item.greenProgress.toFixed(0)}%
                  </Text>
                )}
              </AnimatedCircularProgress>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  // ✅ Loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <Header toggleDrawer={() => navigation.toggleDrawer()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1d9b20" />
          <Text style={styles.loadingText}>Loading projects...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header toggleDrawer={() => navigation.toggleDrawer()} />
      
      <Image
        source={require('../assets/images/logos.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      
      <Text style={styles.title}>Alliance Project Group</Text>
      
      <View style={styles.subcontainer}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#555" />
          <TextInput 
            placeholder="Search projects..." 
            style={styles.input}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {/* ✅ Error State with Retry Button */}
      {error ? (
        <View style={styles.errorContainer}>
          <Ionicons 
            name={isSessionExpired ? "lock-closed" : "alert-circle"} 
            size={60} 
            color="#ff6b6b" 
          />
          <Text style={styles.errorText}>{error}</Text>
          {!isSessionExpired && (
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={fetchProjects}
            >
              <Ionicons name="refresh" size={20} color="#fff" />
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          )}
          {isSessionExpired && (
            <TouchableOpacity 
              style={styles.loginButton}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.loginButtonText}>Go to Login</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : filteredData.length === 0 && !loading ? (
        <View style={styles.noDataContainer}>
          <Ionicons name="folder-open-outline" size={60} color="#ccc" />
          <Text style={styles.noDataText}>
            {searchQuery ? 'No projects found' : 'No projects available'}
          </Text>
          <Text style={styles.noDataSubText}>
            {searchQuery ? 'Try adjusting your search terms' : 'Projects will appear here once available'}
          </Text>
          {!searchQuery && (
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={fetchProjects}
            >
              <Ionicons name="refresh" size={20} color="#fff" />
              <Text style={styles.retryButtonText}>Refresh</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          showsVerticalScrollIndicator={false}
          data={filteredData}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.flatListContent}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffff',
  },
  subcontainer: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: wp('2%'),
  },
  title: {
    fontSize: hp('2.5%'),
    fontWeight: '600',
    marginHorizontal: wp('8%'),
    marginBottom: hp('1%'),
    fontFamily: 'Poppins-SemiBold',
    textAlign: 'center',
  },
  logo: {
    alignItems: 'center',
    height: hp('15%'),
    width: wp('80%'),
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: wp('5%'),
    marginTop: hp('1%'),
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: wp('85%'),
    borderRadius: wp('3%'),
    backgroundColor: '#D3D3D3',
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('0.6%'),
  },
  input: {
    flex: 1,
    marginLeft: wp('2%'),
    fontSize: hp('2%'),
    fontFamily: 'Poppins-Regular',
    color: '#333',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: wp('3%'),
    marginVertical: hp('0.5%'),
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    marginHorizontal: wp('1%'),
  },
  leftContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: hp('1%'),
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  image: {
    width: wp('12%'),
    height: wp('12%'),
    borderRadius: 8,
    marginRight: wp('2%'),
  },
  projectTitle: {
    fontSize: hp('1.9%'),
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    flex: 1,
    flexWrap: 'wrap',
  },
  companyText: {
    fontSize: hp('1.5%'),
    color: '#1d9b20',
    fontFamily: 'Poppins-SemiBold',
    marginLeft: wp('2%'),
    textAlign: 'right',
    flexShrink: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: hp('1%'),
  },
  legendContainer: {
    flex: 1,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('0.5%'),
  },
  dot: {
    width: wp('2%'),
    height: wp('2%'),
    borderRadius: wp('1%'),
    marginRight: wp('2%'),
  },
  legendText: {
    fontSize: hp('1.6%'),
    fontFamily: 'Poppins-Regular',
    color: '#666',
  },
  circularProgressContainer: {
    position: 'relative',
    width: 75,
    height: 75,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerProgress: {
    position: 'absolute',
  },
  progressText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'green',
    fontFamily: 'Poppins-Bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: hp('2%'),
    fontSize: hp('2%'),
    fontFamily: 'Poppins-Regular',
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp('10%'),
  },
  errorText: {
    fontSize: hp('2%'),
    fontFamily: 'Poppins-SemiBold',
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
    fontFamily: 'Poppins-SemiBold',
  },
  loginButton: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: wp('8%'),
    paddingVertical: hp('1.5%'),
    borderRadius: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: hp('1.8%'),
    fontFamily: 'Poppins-SemiBold',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp('10%'),
  },
  noDataText: {
    fontSize: hp('2.2%'),
    fontFamily: 'Poppins-SemiBold',
    color: '#666',
    marginTop: hp('2%'),
    marginBottom: hp('1%'),
  },
  noDataSubText: {
    fontSize: hp('1.8%'),
    fontFamily: 'Poppins-Regular',
    color: '#999',
    textAlign: 'center',
    marginBottom: hp('2%'),
  },
  flatListContent: {
    paddingHorizontal: wp('4%'),
    paddingBottom: hp('2%'),
  },
});