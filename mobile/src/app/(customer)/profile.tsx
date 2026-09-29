import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, Switch, Text, View } from "react-native";
import { useCSSVariable, useUniwind } from "uniwind";

import { Screen } from "@/components/ui/screen";
import { useCurrentUser, useLogout } from "@/features/auth/use-auth";
import { useDefaultAddress } from "@/features/location/use-addresses";
import { applyTheme } from "@/features/settings/theme-preference";
import { toast } from "@/lib/sonner";

type Row = {
  icon: "heart-outline" | "location-outline" | "card-outline" | "notifications-outline" | "help-circle-outline" | "information-circle-outline";
  label: string;
  detail?: string;
  onPress: () => void;
};

export default function ProfileScreen() {
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const { data: address } = useDefaultAddress();
  const logout = useLogout();
  const { theme } = useUniwind();
  const [muted, destructive, primary, border, card] = useCSSVariable([
    "--color-muted-foreground",
    "--color-destructive",
    "--color-primary",
    "--color-border",
    "--color-card",
  ]);

  const dark = theme === "dark";

  const laterMilestone = (what: string) =>
    toast(`${what} arrives with the next milestone`, {
      description: "Ordering, favourites and payments follow the catalogue work.",
    });

  const rows: Row[] = [
    { icon: "heart-outline", label: "Favourites", onPress: () => laterMilestone("Favourites") },
    {
      detail: address ? `${address.label} · ${address.line1}` : undefined,
      icon: "location-outline",
      label: "Addresses",
      onPress: () => router.push("/address"),
    },
    { icon: "card-outline", label: "Payment methods", onPress: () => laterMilestone("Payments") },
    {
      icon: "notifications-outline",
      label: "Notifications",
      onPress: () => laterMilestone("Notifications"),
    },
    { icon: "help-circle-outline", label: "Help", onPress: () => laterMilestone("Help") },
    { icon: "information-circle-outline", label: "About", onPress: () => laterMilestone("About") },
  ];

  const handleLogOut = () => logout.mutate();

  return (
    <Screen edges={["top"]}>
      <ScrollView contentContainerClassName="px-5 pb-8 pt-4" showsVerticalScrollIndicator={false}>
        <Text accessibilityRole="header" className="font-title text-title text-foreground">
          Profile
        </Text>

        <View className="mt-6 flex-row items-center gap-4 rounded-card border border-border bg-card p-5">
          <View className="h-14 w-14 items-center justify-center rounded-pill bg-secondary">
            <Text className="font-title text-title text-secondary-foreground">
              {(user?.name ?? "?").charAt(0).toUpperCase()}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="font-heading text-section text-card-foreground" numberOfLines={1}>
              {user?.name ?? "Your account"}
            </Text>
            <Text className="font-sans text-label text-muted-foreground" numberOfLines={1}>
              {user?.email ?? "Signed in on this device"}
            </Text>
          </View>
        </View>

        <View className="mt-6 overflow-hidden rounded-card border border-border bg-card">
          {rows.map((row, index) => (
            <Pressable
              accessibilityLabel={row.label}
              accessibilityRole="button"
              className={`flex-row items-center gap-4 px-5 py-4 active:bg-muted ${
                index > 0 ? "border-t border-border" : ""
              }`}
              key={row.label}
              onPress={row.onPress}
            >
              <Ionicons color={primary as string} name={row.icon} size={22} />
              <View className="flex-1">
                <Text className="font-label text-body text-card-foreground">{row.label}</Text>
                {row.detail ? (
                  <Text className="font-sans text-label text-muted-foreground" numberOfLines={1}>
                    {row.detail}
                  </Text>
                ) : null}
              </View>
              <Ionicons color={muted as string} name="chevron-forward" size={18} />
            </Pressable>
          ))}
        </View>

        <View className="mt-6 overflow-hidden rounded-card border border-border bg-card">
          <View className="flex-row items-center gap-4 px-5 py-4">
            <Ionicons color={primary as string} name="moon-outline" size={22} />
            <View className="flex-1">
              <Text className="font-label text-body text-card-foreground">Dark mode</Text>
              <Text className="font-sans text-label text-muted-foreground">
                {dark ? "On" : "Following your phone settings"}
              </Text>
            </View>
            <Switch
              accessibilityLabel="Dark mode"
              ios_backgroundColor={border as string}
              onValueChange={(value) => void applyTheme(value ? "dark" : "light")}
              thumbColor={card as string}
              trackColor={{ false: border as string, true: primary as string }}
              value={dark}
            />
          </View>
        </View>

        <Pressable
          accessibilityLabel="Log out"
          accessibilityRole="button"
          className="mt-6 h-13 flex-row items-center justify-center gap-2 rounded-input border border-border bg-card active:bg-muted"
          onPress={handleLogOut}
        >
          <Ionicons color={destructive as string} name="log-out-outline" size={20} />
          <Text className="font-heading text-body text-destructive">Log out</Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}
