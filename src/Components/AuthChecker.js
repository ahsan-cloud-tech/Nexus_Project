import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AppState } from "react-native";
import Toast from "react-native-toast-message";
import { logout } from "../Store/store";
import { baseUrl } from "../utils/Api";

const AuthChecker = () => {
  const token = useSelector((state) => state.auth.token);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!token) return;

    const checkAuth = async () => {
      try {
        const response = await fetch(`${baseUrl}/users/check-auth`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok || !data.valid) {
          // dispatch(logout());
          Toast.show({
            type: "error",
            text1: "Session Expired ⏰",
            text2: data.message || "Aapka session expire ho gaya hai. Please login karein.",
            position: "top",
            visibilityTime: 4000,
            topOffset: 50,
          });
        }
      } catch (error) {
        console.error("Auth check error:", error);
      }
    };

    // 🔹 Pehli baar check karo (component mount hone par)
    checkAuth();

    // 🔹 Har 5 minute mein check karo
    const interval = setInterval(checkAuth, 5 * 60 * 1000);

    // 🔹 Jab app background se foreground mein aaye
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        checkAuth();
      }
    });

    // Cleanup
    return () => {
      clearInterval(interval);
      subscription?.remove();
    };
  }, [token, dispatch]);

  return null; // Yeh component kuch render nahi karta
};

export default AuthChecker;