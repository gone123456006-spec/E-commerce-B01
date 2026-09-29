import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCSSVariable } from "uniwind";

/** Four tabs; Favourites lives inside Profile per the approved v1 plan. */
export default function CustomerLayout() {
  const insets = useSafeAreaInsets();
  const [primary, muted, card, border] = useCSSVariable([
    "--color-primary",
    "--color-muted-foreground",
    "--color-card",
    "--color-border",
  ]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: primary as string,
        tabBarInactiveTintColor: muted as string,
        tabBarLabelStyle: { fontFamily: "Inter_500Medium", fontSize: 11 },
        tabBarStyle: {
          backgroundColor: card as string,
          borderTopColor: border as string,
          height: 64 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 6,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons color={color} name={focused ? "home" : "home-outline"} size={size} />
          ),
          title: "Home",
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons color={color} name="search" size={size} />,
          title: "Search",
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons color={color} name={focused ? "receipt" : "receipt-outline"} size={size} />
          ),
          title: "Orders",
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons color={color} name={focused ? "person" : "person-outline"} size={size} />
          ),
          title: "Profile",
        }}
      />

    </Tabs>
  );
}
