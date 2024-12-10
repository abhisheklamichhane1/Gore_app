import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { router, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { useColorScheme } from "@/components/useColorScheme";
import { UserProvider } from "@/context/UserContext";
import { TaskProvider } from "@/context/TaskContext";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { CommentProvider } from "@/context/CommentContext";

// Create a light theme by extending DefaultTheme
const LightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "rgb(0, 122, 255)", // Standard iOS blue
    background: "rgb(242, 242, 242)", // Light gray background
    card: "rgb(255, 255, 255)", // White card background
    text: "rgb(0, 0, 0)", // Black text
    border: "rgb(216, 216, 216)", // Light border color
    notification: "rgb(255, 59, 48)", // Notification/alert color
  },
};

export const queryClient = new QueryClient();

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
      router.navigate("/login");
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <TaskProvider>
          <CommentProvider>
            <ThemeProvider value={LightTheme}>
              <StatusBar style="dark" />

              <SafeAreaProvider>
                <GestureHandlerRootView style={{ flex: 1 }}>
                  <SafeAreaView style={{ flex: 1 }}>
                    <Stack screenOptions={{ headerShown: false }}>
                      <Stack.Screen name="login" />
                      <Stack.Screen name="day-start" />
                      <Stack.Screen name="mainscreen" />
                      <Stack.Screen
                        name="modal"
                        options={{ headerShown: false, presentation: "modal" }}
                      />
                    </Stack>
                  </SafeAreaView>
                </GestureHandlerRootView>
              </SafeAreaProvider>
            </ThemeProvider>
          </CommentProvider>
        </TaskProvider>
      </UserProvider>
    </QueryClientProvider>
  );
}
