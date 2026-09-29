import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCSSVariable } from "uniwind";

import { useOrder } from "@/features/orders/use-orders";

/** "Arriving by 18:40" — the estimate the order was placed with. */
const formatArrival = (iso: string): string => {
  const at = new Date(iso);

  if (Number.isNaN(at.getTime())) return "shortly";

  return at.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export default function OrderConfirmedScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [primary] = useCSSVariable(["--color-primary"]);

  const { data: order, isLoading } = useOrder(id ?? "");

  if (isLoading || !order) {
    return (
      <View className="flex-1 items-center justify-center bg-card">
        <ActivityIndicator color={primary as string} size="large" />
      </View>
    );
  }

  // Payment can still be settling; the copy says so rather than over-promising.
  const settled = order.status !== "pending_payment";

  return (
    <View
      className="flex-1 items-center justify-center gap-3 bg-card px-8"
      style={{ paddingBottom: insets.bottom + 24, paddingTop: insets.top }}
    >
      <View className="mb-3 h-32 w-32 items-center justify-center rounded-pill bg-secondary">
        <Ionicons color={primary as string} name="checkmark" size={64} />
      </View>

      <Text
        accessibilityRole="header"
        className="text-center font-title text-display text-foreground"
      >
        {settled ? "Order confirmed" : "Payment received"}
      </Text>

      <Text className="font-sans text-section text-muted-foreground">#{order.reference}</Text>

      <Text className="mb-6 font-sans text-body text-muted-foreground">
        {settled
          ? `Arriving by ${formatArrival(order.estimatedDeliveryAt)}`
          : "We are confirming your order with the restaurant"}
      </Text>

      <Pressable
        accessibilityRole="button"
        className="h-14 w-full items-center justify-center rounded-input bg-primary active:bg-primary-pressed"
        onPress={() => router.replace("/orders")}
      >
        <Text className="font-heading text-body text-primary-foreground">Track order</Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        className="h-14 w-full items-center justify-center rounded-input border border-primary bg-card active:bg-secondary"
        onPress={() => router.replace("/home")}
      >
        <Text className="font-heading text-body text-primary">Back to home</Text>
      </Pressable>
    </View>
  );
}
