import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import Header from '../Components/Header';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'react-native-animatable';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { baseUrl } from '../utils/Api';
import { useProjectStore } from '../Store/useProjectStore';
import { useSelector, useDispatch } from 'react-redux';

export default function ProjectScreen() {
  const [searchText, setSearchText] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('active'); 
  const [projectData, setProjectData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);
  const [projectImages, setProjectImages] = useState({}); // ✅ Store fetched images
  const dropdownRef = useRef(null);
  const navigation = useNavigation();

  const token = useSelector(state => state.auth.token);
  const dispatch = useDispatch();
  const { setSelectedProjectId, setProjectData: setStoreProjectData } = useProjectStore();

  const statusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Archive', value: 'archive' },
  ];

  // ✅ Fetch project image from API
  const fetchProjectImage = async (imageName, projectId) => {
    if (!imageName || !token) {
      console.log(`⚠️ No image name or token for project ${projectId}`);
      return null;
    }

    try {
      const imageUrl = `${baseUrl}/projects/images/${imageName}`;
      console.log(`🖼️ Fetching image from: ${imageUrl}`);

      const response = await fetch(imageUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        console.log(`✅ Image fetched successfully for: ${imageName}`);
        // ✅ Save to Redux
        dispatch({
          type: 'SET_PROJECT_IMAGE',
          payload: {
            project_id: projectId,
            image_name: imageName,
            image_url: imageUrl
          }
        });
        
        return imageUrl;
      } else {
        console.log(`❌ Image fetch failed for: ${imageName}, Status: ${response.status}`);
        return null;
      }
    } catch (error) {
      console.error(`❌ Error fetching image for ${imageName}:`, error.message);
      return null;
    }
  };

  // ✅ Fetch projects based on selected status
  const fetchProjects = async (status = 'active') => {
    try {
      setLoading(true);
      setApiError(false);
      
      if (!token) {
        console.error('❌ No token found in Redux store');
        Alert.alert(
          'Authentication Required',
          'Please login to access projects.',
          [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
        );
        setLoading(false);
        return;
      }

      const statusParam = status === 'active' ? 'Active' : 'Archive';
      const apiUrl = `${baseUrl}/projects/query?status=${statusParam}`;
      
      console.log('==========================================');
      console.log('🔍 Fetching projects from:', apiUrl);
      console.log('📊 Status Parameter:', statusParam);
      console.log('🔑 Token:', token.substring(0, 20) + '...');
      console.log('==========================================');
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      console.log('📡 Response Status:', response.status);
      
      if (response.status === 401) {
        Alert.alert(
          'Session Expired',
          'Your session has expired. Please login again.',
          [{ text: 'Login', onPress: () => navigation.navigate('Login') }]
        );
        setLoading(false);
        return;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ API Response received successfully');
      console.log('📦 Full API Response:', JSON.stringify(result, null, 2));
      
      if (result && result.data && Array.isArray(result.data)) {
        console.log('==========================================');
        console.log('📊 Total Projects Found:', result.data.length);
        console.log('==========================================\n');
        
        // ✅ Fetch images for all projects
        const imagePromises = result.data.map(async (item) => {
          console.log(`📍 Project: ${item.name || 'N/A'}`);
          console.log(`   Location: ${item.location || 'N/A'}`);
          console.log(`   Profile Picture: ${item.profile_picture || 'N/A'}`);
          console.log(`   Status: ${item.status || 'N/A'}`);
          console.log(`   ID: ${item._id || 'N/A'}`);
          
          let imageUrl = null;
          if (item.profile_picture) {
            imageUrl = await fetchProjectImage(item.profile_picture, item._id);
          }
          
          console.log(`   Final Image URL: ${imageUrl || 'No image'}`);
          console.log('   ─────────────────────────\n');
          
          return {
            projectId: item._id,
            imageUrl: imageUrl
          };
        });

        const imageResults = await Promise.all(imagePromises);
        
        // ✅ Create image mapping
        const imagesMap = {};
        imageResults.forEach(result => {
          if (result.imageUrl) {
            imagesMap[result.projectId] = result.imageUrl;
          }
        });
        
        setProjectImages(imagesMap);
        
        const formattedData = result.data.map(item => {
          let addressLine1 = 'Address not available';
          let addressLine2 = '';
          let addressLine3 = 'Australia';

          if (item.location) {
            const locationParts = item.location.split(',');
            if (locationParts.length >= 3) {
              addressLine1 = locationParts[0]?.trim() || 'Address not available';
              addressLine2 = locationParts[1]?.trim() || '';
              addressLine3 = locationParts[2]?.trim() || 'Australia';
            } else if (locationParts.length === 2) {
              addressLine1 = locationParts[0]?.trim() || 'Address not available';
              addressLine2 = locationParts[1]?.trim() || '';
            } else {
              addressLine1 = item.location;
            }
          }

          // ✅ Use fetched image URL
          let imageSource = null;
          if (imagesMap[item._id]) {
            imageSource = { uri: imagesMap[item._id] };
          }

          return {
            id: item._id,
            title: item.name || 'No Name',
            profile_picture: item.profile_picture,
            addressLine1: addressLine1,
            addressLine2: addressLine2,
            addressLine3: addressLine3,
            image: imageSource,
            project_id: item._id,
            status: item.status,
            originalData: item
          };
        });
        
        console.log('==========================================');
        console.log('✅ Data formatted successfully');
        console.log('📊 Formatted Projects Count:', formattedData.length);
        console.log('📊 Images Fetched:', Object.keys(imagesMap).length);
        console.log('==========================================\n');
        
        setProjectData(formattedData);
        setStoreProjectData(result.data);
        
      } else {
        console.log('⚠️ No data found in response');
        setProjectData([]);
        setApiError(true);
        Alert.alert(
          'No Data',
          `No ${statusParam} projects found.`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('==========================================');
      console.error('❌ API Error occurred:');
      console.error('Error Message:', error.message);
      console.error('==========================================');
      
      setProjectData([]);
      setApiError(true);
      
      Alert.alert(
        'Connection Error',
        'Unable to fetch projects. Please check your internet connection and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  // ✅ Save project data including profile_picture to Redux and AsyncStorage
  const saveProjectData = async (projectId, profilePicture, projectName) => {
    try {
      await AsyncStorage.setItem('selected_project_id', projectId.toString());
      console.log('✅ Project ID saved to AsyncStorage:', projectId);
      
      setSelectedProjectId(projectId);
      
      // ✅ Get image URL from projectImages state
      const imageUrl = projectImages[projectId] || null;
      
      dispatch({
        type: 'SET_SELECTED_PROJECT',
        payload: {
          project_id: projectId,
          profile_picture: profilePicture,
          project_name: projectName,
          image_url: imageUrl,
          saved_at: new Date().toISOString()
        }
      });
      
      console.log('==========================================');
      console.log('✅ Project Data Saved to Redux:');
      console.log('   Project ID:', projectId);
      console.log('   Profile Picture:', profilePicture || 'No image');
      console.log('   Image URL:', imageUrl || 'No URL');
      console.log('   Project Name:', projectName);
      console.log('==========================================');
      
      const projectDataToSave = {
        project_id: projectId,
        profile_picture: profilePicture,
        image_url: imageUrl,
        project_name: projectName,
        saved_at: new Date().toISOString()
      };
      await AsyncStorage.setItem('project_data', JSON.stringify(projectDataToSave));
      
    } catch (error) {
      console.error('❌ Error saving project data:', error);
    }
  };

  const handleStatusSelect = (status) => {
    console.log('==========================================');
    console.log('🔄 Status changed to:', status);
    console.log('==========================================');
    
    setSelectedStatus(status);
    setDropdownOpen(false);
    fetchProjects(status);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const filteredData = projectData.filter(item =>
    item.title.toLowerCase().includes(searchText.toLowerCase()),
  );

  const handleProjectPress = async (item) => {
    console.log('==========================================');
    console.log('🎯 Project Selected:');
    console.log('   Project Name:', item.title);
    console.log('   Project ID:', item.project_id);
    console.log('   Profile Picture:', item.profile_picture || 'No image');
    console.log('   Image URL:', projectImages[item.project_id] || 'No URL');
    console.log('   Location:', `${item.addressLine1}, ${item.addressLine2}, ${item.addressLine3}`);
    console.log('==========================================');
    
    await saveProjectData(item.project_id, item.profile_picture, item.title);
    
    if (item.title === 'Oran Park Rest 3' || item.title === 'Oran Park Resi 3') {
      navigation.navigate('CurrentProjectsPhases', { 
        project: item,
        project_id: item.project_id,
        profile_picture: item.profile_picture,
        image_url: projectImages[item.project_id]
      });
    } else {
      navigation.navigate('ProjectDetails', { 
        project: item,
        project_id: item.project_id,
        profile_picture: item.profile_picture,
        image_url: projectImages[item.project_id]
      });
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => handleProjectPress(item)}
    >
      <View style={styles.projectCard}>
        <View style={styles.titleRow}>
          <Text style={styles.projectTitle}>{item.title}</Text>
          <View style={[
            styles.statusBadge, 
            { backgroundColor: item.status === 'Active' ? '#1d9b20' : '#ff9800' }
          ]}>
            <Text style={styles.statusText}>{item.status || 'Active'}</Text>
          </View>
        </View>
        <View style={styles.cardContent}>
          {item.image ? (
            <Image
              source={item.image}
              style={styles.projectImage}
              resizeMode="cover"
              onError={(error) => {
                console.log('⚠️ Image loading failed for:', item.title, error.nativeEvent);
              }}
            />
          ) : (
            <View style={styles.noImagePlaceholder}>
              <Ionicons name="image-outline" size={30} color="#ccc" />
            </View>
          )}
          <View style={styles.addressContainer}>
            <Text style={styles.projectAddress}>{item.addressLine1}</Text>
            <Text style={styles.projectAddress}>{item.addressLine2}</Text>
            <Text style={styles.projectAddress}>{item.addressLine3}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  useEffect(() => {
    if (token) {
      fetchProjects('active');
    } else {
      setLoading(false);
      Alert.alert(
        'Login Required',
        'Please login to view projects.',
        [{ text: 'Login', onPress: () => navigation.navigate('Login') }]
      );
    }
  }, [token]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Header toggleDrawer={() => navigation.toggleDrawer()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1d9b20" />
          <Text style={styles.loadingText}>
            Loading {selectedStatus === 'active' ? 'Active' : 'Archive'} projects...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header toggleDrawer={() => navigation.toggleDrawer()} />
      <View style={styles.contentWrapper}>
        <Text style={styles.mainTitle}>Alliance Project Group</Text>

        {apiError && (
          <View style={styles.errorBanner}>
            <Ionicons name="warning-outline" size={20} color="#fff" />
            <Text style={styles.errorText}>Unable to load projects. Please try again.</Text>
          </View>
        )}

        {!token && !loading && (
          <View style={styles.authBanner}>
            <Ionicons name="log-in-outline" size={20} color="#fff" />
            <Text style={styles.authText}>Please login to view projects</Text>
            <TouchableOpacity 
              style={styles.loginBannerButton}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.loginBannerButtonText}>Login</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.headerRow}>
          <Text style={styles.projectsTitle}>Projects</Text>
          <View style={styles.dropdownWrapper}>
            <View style={styles.dropdownContainer} ref={dropdownRef}>
              <TouchableOpacity
                style={[
                  styles.dropdownButton,
                  dropdownOpen && styles.dropdownButtonOpen,
                  !token && styles.dropdownDisabled
                ]}
                onPress={token ? toggleDropdown : null}
                activeOpacity={0.7}
                disabled={!token}
              >
                <Text style={[
                  styles.dropdownText,
                  !token && styles.dropdownTextDisabled
                ]}>
                  {statusOptions.find(opt => opt.value === selectedStatus)?.label}
                </Text>
                <View style={styles.curvedLine} />
                <Ionicons
                  name={dropdownOpen ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={token ? "#1d9b20" : "#ccc"}
                  style={styles.dropdownIcon}
                />
              </TouchableOpacity>
              {dropdownOpen && token && (
                <View style={styles.dropdownOptions}>
                  {statusOptions.map((option, index) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.optionItem,
                        selectedStatus === option.value && styles.selectedOption,
                        index === statusOptions.length - 1 && styles.lastOptionItem,
                      ]}
                      onPress={() => handleStatusSelect(option.value)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          selectedStatus === option.value && styles.selectedOptionText,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
            {dropdownOpen && (
              <TouchableOpacity
                style={styles.dropdownBackdrop}
                onPress={() => setDropdownOpen(false)}
                activeOpacity={1}
              />
            )}
          </View>
        </View>

        <View style={styles.subtitleContainer}>
          <Text style={styles.subtitle}>
            {`${statusOptions.find(opt => opt.value === selectedStatus)?.label} Projects (${filteredData.length})`}
          </Text>
        </View>

        <View style={styles.searchContainerWrapper}>
          <View style={[
            styles.searchContainer,
            !token && styles.searchContainerDisabled
          ]}>
            <Ionicons name="search" size={20} color={token ? "#555" : "#ccc"} />
            <TextInput
              placeholder="Search"
              style={[
                styles.input,
                !token && styles.inputDisabled
              ]}
              value={searchText}
              onChangeText={token ? setSearchText : null}
              placeholderTextColor="#999"
              editable={!!token}
            />
          </View>
        </View>

        {!token ? (
          <View style={styles.noDataContainer}>
            <Ionicons name="lock-closed-outline" size={50} color="#ccc" />
            <Text style={styles.noDataText}>Authentication Required</Text>
            <Text style={styles.noDataSubText}>Please login to view projects</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.retryButtonText}>Go to Login</Text>
            </TouchableOpacity>
          </View>
        ) : filteredData.length === 0 ? (
          <View style={styles.noDataContainer}>
            <Ionicons 
              name={apiError ? "alert-circle-outline" : "folder-open-outline"} 
              size={60} 
              color="#ccc" 
            />
            <Text style={styles.noDataText}>
              {apiError ? 'Unable to load projects' : `No ${selectedStatus === 'active' ? 'Active' : 'Archive'} projects found`}
            </Text>
            <Text style={styles.noDataSubText}>
              {apiError 
                ? 'Please check your connection and try again' 
                : searchText 
                  ? 'Try adjusting your search terms'
                  : `No projects in ${selectedStatus === 'active' ? 'Active' : 'Archive'} status`
              }
            </Text>
            {apiError && (
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={() => fetchProjects(selectedStatus)}
              >
                <Ionicons name="refresh" size={20} color="#fff" />
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <FlatList
            data={filteredData}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.flatListContent}
            style={{ flex: 1 }}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  curvedLine: {
    width: wp('0.8%'),
    height: hp('2%'),
    backgroundColor: 'transparent',
    borderLeftWidth: 1.5,
    borderLeftColor: '#1d9b20',
    borderTopLeftRadius: wp('2%'),
    borderBottomLeftRadius: wp('2%'),
    marginRight: wp('1%'),
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentWrapper: {
    flex: 1,
    padding: wp('5%'),
  },
  mainTitle: {
    fontSize: hp(2.5),
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginBottom: hp('1%'),
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff6b6b',
    padding: wp('3%'),
    borderRadius: wp('2%'),
    marginBottom: hp('1%'),
  },
  errorText: {
    color: '#fff',
    fontSize: hp(1.6),
    fontFamily: 'Poppins-Medium',
    marginLeft: wp('2%'),
  },
  authBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffa726',
    padding: wp('3%'),
    borderRadius: wp('2%'),
    marginBottom: hp('1%'),
  },
  authText: {
    color: '#fff',
    fontSize: hp(1.6),
    fontFamily: 'Poppins-Medium',
    marginLeft: wp('2%'),
    flex: 1,
  },
  loginBannerButton: {
    backgroundColor: '#fff',
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('0.8%'),
    borderRadius: wp('1%'),
  },
  loginBannerButtonText: {
    color: '#ffa726',
    fontSize: hp(1.4),
    fontFamily: 'Poppins-SemiBold',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('2%'),
    marginTop: hp('1%'),
    gap: hp('5%'),
  },
  projectsTitle: {
    fontSize: hp(2.2),
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
  },
  dropdownWrapper: {
    position: 'relative',
  },
  dropdownContainer: {
    position: 'relative',
    zIndex: 1000,
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
    borderColor: '#D3D3D3',
    backgroundColor: '#f0f8f0',
  },
  dropdownDisabled: {
    backgroundColor: '#f5f5f5',
    borderColor: '#e0e0e0',
  },
  dropdownText: {
    fontSize: hp(1.8),
    fontFamily: 'Poppins-Medium',
    color: '#333',
  },
  dropdownTextDisabled: {
    color: '#999',
  },
  dropdownIcon: {
    marginLeft: wp('2%'),
  },
  dropdownOptions: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: wp('3%'),
    borderWidth: 1.5,
    borderColor: '#D3D3D3',
    marginTop: hp('0.8%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    zIndex: 1001,
    overflow: 'hidden',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: hp('1.8%'),
    paddingHorizontal: wp('4%'),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  lastOptionItem: {
    borderBottomWidth: 0,
  },
  selectedOption: {
    backgroundColor: '#f0f8f0',
  },
  optionText: {
    fontSize: hp(1.8),
    fontFamily: 'Poppins-Regular',
    color: '#333',
  },
  selectedOptionText: {
    fontFamily: 'Poppins-SemiBold',
    color: '#1d9b20',
  },
  dropdownBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  subtitleContainer: {
    marginBottom: hp('1%'),
  },
  subtitle: {
    fontSize: hp(2),
    fontFamily: 'Poppins-SemiBold',
    color: '#555',
    marginHorizontal: wp('1%'),
  },
  searchContainerWrapper: {
    alignItems: 'center',
    marginBottom: hp('2%'),
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: wp('88%'),
    borderRadius: wp('3%'),
    backgroundColor: '#f0f0f0',
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('0.6%'),
  },
  searchContainerDisabled: {
    backgroundColor: '#f5f5f5',
  },
  input: {
    flex: 1,
    marginLeft: wp('2%'),
    fontSize: hp('1.8%'),
    fontFamily: 'Poppins-Regular',
    color: '#333',
  },
  inputDisabled: {
    color: '#999',
  },
  flatListContent: { 
    paddingBottom: hp('10%') 
  },
  projectCard: {
    backgroundColor: '#fff',
    borderRadius: wp('3%'),
    padding: wp('4%'),
    marginBottom: hp('1%'),
    borderWidth: 0.2,
    borderColor: '#e0e0e0',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('1%'),
  },
  statusBadge: {
    paddingHorizontal: wp('2%'),
    paddingVertical: hp('0.3%'),
    borderRadius: wp('1%'),
  },
  statusText: {
    color: '#fff',
    fontSize: hp(1.4),
    fontFamily: 'Poppins-SemiBold',
  },
  cardContent: {
    flexDirection: 'row',
  },
  projectImage: {
    height: hp('6%'),
    width: wp('20%'),
    marginRight: wp('4%'),
    borderRadius: wp('1%')
  },
  noImagePlaceholder: {
    height: hp('6%'),
    width: wp('20%'),
    marginRight: wp('4%'),
    borderRadius: wp('1%'),
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  addressContainer: {
    flex: 1,
  },
  projectTitle: {
    fontSize: hp(2.2),
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    flex: 1,
  },
  projectAddress: {
    fontSize: hp(1.8),
    fontFamily: 'Poppins-Regular',
    color: '#666',
    marginBottom: hp('0.5%'),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: hp(2),
    fontFamily: 'Poppins-Regular',
    color: '#666',
    marginTop: hp('1%'),
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp('10%'),
  },
  noDataText: {
    fontSize: hp(2.2),
    fontFamily: 'Poppins-SemiBold',
    color: '#666',
    marginTop: hp('2%'),
    marginBottom: hp('1%'),
    textAlign: 'center',
  },
  noDataSubText: {
    fontSize: hp(1.8),
    fontFamily: 'Poppins-Regular',
    color: '#999',
    textAlign: 'center',
    marginBottom: hp('2%'),
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1',
    paddingHorizontal: wp('6%'),
    paddingVertical: hp('1.5%'),
    borderRadius: wp('2%'),
    gap: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: hp(1.8),
    fontFamily: 'Poppins-SemiBold',
    marginLeft: wp('1%'),
  },
});