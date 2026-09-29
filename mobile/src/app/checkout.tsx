import { Ionicons } from "@expo/vector-icons";
import { initStripe, useStripe } from "@stripe/stripe-react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCSSVariable } from "uniwind";

import { useBasket } from "@/features/basket/use-basket";
import { useCurrentUser } from "@/features/auth/use-auth";
import { useDefaultAddress } from "@/features/location/use-addresses";
import { useCreateOrder, useSyncOrder } from "@/features/orders/use-orders";
import { formatPrepTime, formatPrice } from "@/lib/format";
import { toast } from "@/lib/sonner";

type EditableField = "phone" | "instructions" | null;

/**
 * Final review before paying. Every price shown here comes from the server's
 * basket totals, and the amount charged is recomputed again when the order is
 * created, so nothing on this screen can change what the customer pays.
 */
export default function CheckoutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [primary, subtle, muted, border, foreground] = useCSSVariable([
    "--color-primary",
    "--color-subtle-foreground",
    "--color-muted-foreground",
    "--color-border",
    "--color-foreground",
  ]);

  const { data: basketData, isLoading } = useBasket();
  const { data: user } = useCurrentUser();
  const { data: address } = useDefaultAddress();
  const createOrder = useCreateOrder();
  const syncOrder = useSyncOrder();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const [paying, setPaying] = useState(false);
  const [editing, setEditing] = useState<EditableField>(null);
  const [phone, setPhone] = useState("");
  const [instructions, setInstructions] = useState("");

  const basket = basketData?.basket ?? null;
  const restaurant = basketData?.restaurant ?? null;
  const totals = basketData?.totals;

  const contactPhone = phone || user?.phone || "";
  const deliveryInstructions = instructions || address?.instructions || "";

  const close = () => (router.canGoBack() ? router.back() : router.replace("/home"));

  const renderHeader = () => (
    <View className="flex-row items-center px-5 py-3">
      <Pressable
        accessibilityLabel="Back to basket"
        accessibilityRole="button"
        className="-ml-2 h-11 w-11 items-center justify-center"
        hitSlop={8}
        onPress={close}
      >
        <Ionicons color={foreground as string} name="arrow-back" size={24} />
      </Pressable>
      <Text
        accessibilityRole="header"
        className="flex-1 text-center font-title text-title text-foreground"
      >
        Checkout
      </Text>
      <View className="h-11 w-11" />
    </View>
  );

  if (isLoading) {
    return (
      <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
        {renderHeader()}
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={primary as string} size="large" />
        </View>
      </View>
    );
  }

  if (!basket || !restaurant || !totals || basket.items.length === 0) {
    return (
      <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
        {renderHeader()}
        <View className="flex-1 items-center justify-center gap-3 px-5">
          <Ionicons color={subtle as string} name="basket-outline" size={44} />
          <Text className="text-center font-heading text-section text-foreground">
            Nothing to check out
          </Text>
          <Text className="text-center font-sans text-body text-muted-foreground">
            Your basket is empty, so there is nothing to pay for yet.
          </Text>
          <Pressable
            accessibilityRole="button"
            className="mt-2 h-13 items-center justify-center rounded-input bg-primary px-6"
            onPress={close}
          >
            <Text className="font-heading text-body text-primary-foreground">
              Back to restaurants
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const addressLine = address
    ? [address.line1, address.line2, address.city].filter(Boolean).join(", ")
    : "No delivery address yet";

  /**
   * Creates the order, pays for it in Stripe's sheet, then asks the server what
   * Stripe says. A closed sheet is never treated as a completed payment.
   */
  const placeOrder = async () => {
    if (paying) return;

    if (!address) {
      toast.error("Add a delivery address", {
        description: "We need somewhere to take your order.",
      });

      return;
    }

    setPaying(true);

    try {
      const checkout = await createOrder.mutateAsync({
        addressId: address._id,
        contactPhone: contactPhone || undefined,
        deliveryInstructions: deliveryInstructions || undefined,
      });

      const { order, paymentIntentClientSecret, publishableKey } = checkout.data;

      await initStripe({ publishableKey });

      const { error: initError } = await initPaymentSheet({
        allowsDelayedPaymentMethods: false,
        defaultBillingDetails: { name: user?.name },
        merchantDisplayName: "Chowly",
        paymentIntentClientSecret,
      });

      if (initError) throw new Error(initError.message);

      const { error: sheetError } = await presentPaymentSheet();

      if (sheetError) {
        // Cancelling is an ordinary choice, not a failure worth shouting about.
        if (sheetError.code !== "Canceled") {
          toast.error("Payment not completed", { description: sheetError.message });
        }

        return;
      }

      const synced = await syncOrder.mutateAsync(order._id);

      if (synced.data.order.status === "pending_payment") {
        // Stripe took the payment but has not settled it yet; the webhook will.
        toast("Payment received", { description: "We are confirming your order." });
      }

      router.replace({ params: { id: order._id }, pathname: "/order-confirmed" });
    } catch (error) {
      Alert.alert(
        "We could not place your order",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setPaying(false);
    }
  };

  const belowMinimum = totals.belowMinimum;

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {renderHeader()}

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Where, when and how it arrives */}
        <View className="mx-5 overflow-hidden rounded-card border border-border bg-card">
          <View className="flex-row items-center gap-3 p-4">
            <Ionicons color={subtle as string} name="location-outline" size={20} />
            <View className="flex-1">
              <Text className="font-heading text-label text-foreground">Delivery address</Text>
              <Text className="font-sans text-body text-muted-foreground">{addressLine}</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              hitSlop={8}
              onPress={() => router.push("/(onboarding)/address")}
            >
              <Text className="font-heading text-label text-primary">Edit</Text>
            </Pressable>
          </View>

          <View className="flex-row items-center gap-3 border-t border-border p-4">
            <Ionicons color={subtle as string} name="time-outline" size={20} />
            <View className="flex-1">
              <Text className="font-heading text-label text-foreground">Arrival estimate</Text>
              <Text className="font-sans text-body text-muted-foreground">
                {formatPrepTime(restaurant.prepTimeMinMinutes, restaurant.prepTimeMaxMinutes)}
              </Text>
            </View>
          </View>

          <View className="border-t border-border p-4">
            <View className="flex-row items-center gap-3">
              <Ionicons color={subtle as string} name="call-outline" size={20} />
              <View className="flex-1">
                <Text className="font-heading text-label text-foreground">Contact details</Text>
                <Text className="font-sans text-body text-muted-foreground">
                  {contactPhone || "Add a number so the rider can reach you"}
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                hitSlop={8}
                onPress={() => setEditing(editing === "phone" ? null : "phone")}
              >
                <Text className="font-heading text-label text-primary">
                  {editing === "phone" ? "Done" : "Edit"}
                </Text>
              </Pressable>
            </View>

            {editing === "phone" ? (
              <TextInput
                autoFocus
                className="mt-3 h-12 rounded-input border border-border bg-card px-3 font-sans text-body text-foreground"
                keyboardType="phone-pad"
                onChangeText={setPhone}
                placeholder="+44 7700 900123"
                placeholderTextColor={muted as string}
                value={contactPhone}
              />
            ) : null}
          </View>

          {/* Card is the only method Chowly takes, so there is nothing to change. */}
          <View className="flex-row items-center gap-3 border-t border-border p-4">
            <Ionicons color={subtle as string} name="card-outline" size={20} />
            <View className="flex-1">
              <Text className="font-heading text-label text-foreground">Payment method</Text>
              <Text className="font-sans text-body text-muted-foreground">Card</Text>
            </View>
          </View>

          <View className="border-t border-border p-4">
            <View className="flex-row items-center gap-3">
              <Ionicons color={subtle as string} name="chatbubble-outline" size={20} />
              <View className="flex-1">
                <Text className="font-heading text-label text-foreground">
                  Delivery instructions
                </Text>
                <Text className="font-sans text-body text-muted-foreground">
                  {deliveryInstructions || "Add a note for the rider"}
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                hitSlop={8}
                onPress={() => setEditing(editing === "instructions" ? null : "instructions")}
              >
                <Text className="font-heading text-label text-primary">
                  {editing === "instructions" ? "Done" : "Edit"}
                </Text>
              </Pressable>
            </View>

            {editing === "instructions" ? (
              <TextInput
                autoFocus
                className="mt-3 h-12 rounded-input border border-border bg-card px-3 font-sans text-body text-foreground"
                maxLength={200}
                onChangeText={setInstructions}
                placeholder="E.g. Leave at the door"
                placeholderTextColor={muted as string}
                value={deliveryInstructions}
              />
            ) : null}
          </View>
        </View>

        {/* What is being bought */}
        <Text className="mx-5 mb-2 mt-6 font-heading text-section text-foreground">
          Order summary
        </Text>

        <View className="mx-5 overflow-hidden rounded-card border border-border bg-card">
          {basket.items.map((item, index) => (
            <View
              className={`flex-row items-center gap-3 p-3 ${index > 0 ? "border-t border-border" : ""}`}
              key={item._id}
            >
              {item.imageUrl ? (
                <Image
                  accessibilityIgnoresInvertColors
                  alt=""
                  contentFit="cover"
                  source={{ uri: item.imageUrl }}
                  style={{ borderRadius: 12, height: 56, width: 56 }}
                  transition={200}
                />
              ) : (
                <View
                  className="items-center justify-center rounded-input bg-muted"
                  style={{ height: 56, width: 56 }}
                >
                  <Ionicons color={subtle as string} name="restaurant-outline" size={20} />
                </View>
              )}

              <View className="flex-1">
                <Text className="font-heading text-body text-foreground">{item.name}</Text>
                {item.optionNames.length > 0 ? (
                  <Text className="font-sans text-label text-muted-foreground">
                    {item.optionNames.join(", ")}
                  </Text>
                ) : null}
                {item.note ? (
                  <Text className="font-sans text-caption text-muted-foreground">{item.note}</Text>
                ) : null}
              </View>

              <Text className="w-8 text-center font-sans text-body text-muted-foreground">
                {item.quantity}
              </Text>
              <Text className="font-heading text-body text-foreground">
                {formatPrice(item.unitPrice * item.quantity)}
              </Text>
            </View>
          ))}

          <View className="gap-2 border-t border-border p-4">
            <View className="flex-row items-center justify-between">
              <Text className="font-sans text-body text-muted-foreground">Subtotal</Text>
              <Text className="font-sans text-body text-foreground">
                {formatPrice(totals.subtotal)}
              </Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="font-sans text-body text-muted-foreground">Delivery fee</Text>
              <Text className="font-sans text-body text-foreground">
                {totals.deliveryFee === 0 ? "Free" : formatPrice(totals.deliveryFee)}
              </Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="font-sans text-body text-muted-foreground">Service fee</Text>
              <Text className="font-sans text-body text-foreground">
                {formatPrice(totals.serviceFee)}
              </Text>
            </View>
          </View>

          <View
            className="flex-row items-center justify-between border-t p-4"
            style={{ borderColor: border as string }}
          >
            <Text className="font-heading text-section text-foreground">Total</Text>
            <Text className="font-title text-title text-foreground">
              {formatPrice(totals.total)}
            </Text>
          </View>
        </View>

        {belowMinimum ? (
          <Text className="mx-5 mt-3 font-sans text-label text-error">
            Minimum order for {restaurant.name} is {formatPrice(totals.minOrder)}.
          </Text>
        ) : null}
      </ScrollView>

      <View
        className="absolute left-0 right-0 bottom-0 border-t border-border bg-background px-5 pt-3"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <Pressable
          accessibilityLabel={`Place order, ${formatPrice(totals.total)}`}
          accessibilityRole="button"
          accessibilityState={{ disabled: belowMinimum || paying }}
          className={`h-14 flex-row items-center justify-center rounded-input ${
            belowMinimum || paying ? "bg-muted" : "bg-primary active:bg-primary-pressed"
          }`}
          disabled={belowMinimum || paying}
          onPress={placeOrder}
        >
          {paying ? (
            <ActivityIndicator color={belowMinimum ? (subtle as string) : "#ffffff"} />
          ) : (
            <Text
              className={`font-heading text-body ${
                belowMinimum ? "text-muted-foreground" : "text-primary-foreground"
              }`}
            >
              Place order • {formatPrice(totals.total)}
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}
