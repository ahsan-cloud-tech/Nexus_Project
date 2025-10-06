import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
} from 'react-native';
import Header from '../../Components/Header';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';

export default function CoreTask() {
  const navigation = useNavigation();

  // States for modal
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [selectedCore, setSelectedCore] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);

  // ✅ Custom Dropdown Component
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

  // 🔹 Sections data
  const sections = [
    {
      id: '1',
      title: 'Productivity',
      percentage: '4.87%',
      subtitle: 'Last Weeks Over all Productivity',
    },
    {
      id: '2',
      title: 'Completion',
      percentage: '79.87%',
      subtitle: '',
      timestamp: 'As of just now',
    },
    {
      id: '3',
      percentage: '7.89%',
      subtitle: 'Last Weeks Completion Productivity',
      timestamp: 'As of Tuesday 27 May at 3:24 pm',
    },
  ];

  const designStages = [
    {
      id: '1',
      title: 'Level 1',
      date: 'Late: 17.65%',
      progress: 93.75,
      color: '#90EE90',
    },
    {
      id: '2',
      title: 'Level 2',
      date: 'Late: 17.65%',
      progress: 98.83,
      color: '#4CAF50',
    },
    {
      id: '3',
      title: 'Level 3',
      date: 'Late: 17.65%',
      progress: 72.79,
      color: '#FF9800',
    },
    {
      id: '4',
      title: 'Level 4',
      date: 'Late: 17.65%',
      progress: 16.58,
      color: '#757575',
    },
  ];

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => {
        if (item.title === 'Level 1') {
          setModalVisible(true); 
        }
      }}
    >
      <View style={[styles.leftBar, { backgroundColor: item.color }]} />
      <View style={{ flex: 1 }}>
        <View style={styles.header}>
          <Text style={styles.title}>{item.title}</Text>
        </View>
        <Text style={styles.date}>{item.date}</Text>
        <Text style={styles.progressLabel}>Done</Text>
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

  // 🔹 Render sections horizontally
  const renderHorizontalItem = ({ item }) => (
    <View style={styles.cardContainer}>
      <View style={styles.horizontalCard}>
        {item.title ? <Text style={styles.cardTitle}>{item.title}</Text> : null}
        <View style={styles.percentageContainer}>
          <Text style={styles.percentageText}>{item.percentage}</Text>
          {item.subtitle ? (
            <Text style={styles.updateText}>{item.subtitle}</Text>
          ) : null}
          {item.timestamp ? (
            <Text style={styles.updateTexts}>{item.timestamp}</Text>
          ) : null}
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={designStages}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: wp('5%'), paddingBottom: wp('3%')}}
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
              Core A1
            </Text>
            <FlatList
              numColumns={2}
              data={sections}
              renderItem={renderHorizontalItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.horizontalFlatListContent}
            />
          </>
        }
      />
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={{ fontSize: 18, marginBottom: 10 }}>
              Building A1 &gt; Core 1 &gt; Level 0
            </Text>
            <CustomDropdown
              label="Unit:"
              options={[
                { label: 'G19', value: 'G19' },
                { label: 'G20', value: 'G20' },
                { label: 'G21', value: 'G21' },
                { label: 'G22', value: 'G22' },
                { label: 'G23', value: 'G23' },
              ]}
              selectedValue={selectedUnit}
              onSelect={setSelectedUnit}
            />
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#5cb85c' }]}
                onPress={() => {
                  if (selectedUnit) {
                    setModalVisible(false);
                    navigation.navigate('UnitTask', {
                      unit: selectedUnit,
                    });
                  } else {
                    alert('Please select a Unit before proceeding.');
                  }
                }}
              >
                <Text style={[styles.modalButtonText, { color: '#fff' }]}>
                  Confirm
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#fff' }]}
                onPress={() => {
                  setModalVisible(false);
                }}
              >
                <Text style={[styles.modalButtonText, { color: 'red' }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
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
    borderRadius: 8,marginTop:hp('1.3%')
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
  horizontalFlatListContent: {
    paddingHorizontal: wp('2%'),
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  cardContainer: {
    flex: 1,
    margin: wp('1%'),
    maxWidth: '48%',
  },
  horizontalCard: {
    padding: wp('1.5%'),
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    height: hp('18%'),
    backgroundColor: '#fff',
  },
  cardTitle: {
    fontSize: hp('1.8%'),
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  percentageContainer: {
    alignItems: 'center',
  },
  percentageText: {
    fontSize: hp('3%'),
    fontWeight: 'bold',
    color: '#1d9b20',
    textAlign: 'center',
  },
  updateText: {
    fontSize: hp('1.3%'),
    color: '#000',
    fontWeight: 'bold',
    marginTop: hp('0.5%'),
    textAlign: 'center',
  },
  updateTexts: {
    fontSize: hp('1.3%'),
    color: '#666',
    marginTop: hp('0.5%'),
    textAlign: 'center',
  },

  // 🔹 Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    marginHorizontal: 5,
    borderRadius: 6,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  // 🔹 Dropdown styles
  dropdownRow: {
    marginBottom: 8,
  },
  projectsTitle: {
    fontSize: 14,
    marginBottom: 6,
    fontWeight: 'bold',
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#1d9b20',
    borderRadius: 6,
    padding: 10,
    alignItems: 'center',
  },
  dropdownButtonOpen: {
    borderColor: '#0b6e0b',
  },
  dropdownText: {
    fontSize: 14,
    color: '#333',
  },
  placeholderText: {
    color: '#aaa',
  },
  dropdownIcon: {
    marginLeft: 10,
  },
  dropdownOptions: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    marginTop: 5,
  },
  optionItem: {
    padding: 10,
  },
  optionText: {
    fontSize: 14,
  },
  selectedOption: {
    backgroundColor: '#e6f7e6',
  },
  selectedOptionText: {
    color: '#1d9b20',
    fontWeight: 'bold',
  },
});
