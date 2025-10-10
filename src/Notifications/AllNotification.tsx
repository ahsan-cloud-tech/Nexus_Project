import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, StyleSheet, PermissionsAndroid, Platform } from "react-native";
import { useSelector } from "react-redux";
import axios from "react-native-axios";
import notifee, { AndroidImportance } from "@notifee/react-native";

const AllNotification = () => {
  const token = useSelector((state) => state.auth.token);
  const [notifications, setNotifications] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);

  // ✅ Request POST_NOTIFICATIONS permission (Android 13+)
  const requestNotificationPermission = async () => {
    if (Platform.OS === "android" && Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const showNotification = async (message, date) => {
    await requestNotificationPermission();
    await notifee.requestPermission();

    const channelId = await notifee.createChannel({
      id: "default",
      name: "Default Channel",
      importance: AndroidImportance.HIGH,
    });

    // ✅ Always display notification, even when foreground
    await notifee.displayNotification({
      title: "New Notification",
      body: `${message}\n${date}`,
      android: {
        channelId,
        smallIcon: "ic_launcher", // Use your app icon
        pressAction: { id: "default" },
        importance: AndroidImportance.HIGH,
      },
    });
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(
          `https://your-api-url.com/api/v1/notifications/for-mobile?page_number=${pageNumber}&limit=1`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = response.data.data || [];
        setNotifications(data);

        if (data.length > 0) {
          const latest = data[0];
          await showNotification(latest.message, latest.string_date);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [pageNumber]);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" />
        <Text>Loading Notifications...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.pageText}>Page: {pageNumber}</Text>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.message}>{item.message}</Text>
            <Text style={styles.date}>{item.string_date}</Text>
          </View>
        )}
      />
    </View>
  );
};

export default AllNotification;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  pageText: { fontSize: 16, fontWeight: "bold", marginBottom: 10 },
  card: {
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  message: { fontSize: 15, fontWeight: "600", color: "#333" },
  date: { fontSize: 13, color: "#888", marginTop: 4 },
  loaderContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
});
