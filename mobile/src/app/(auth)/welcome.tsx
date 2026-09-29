import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Alert, Text, View } from "react-native";
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/ui/button";
import { useEnter } from "@/lib/motion";
import { GoogleIcon } from "@/components/ui/google-icon";

const heroImage = require("@/assets/images/app-imgs/background-dish.png");

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const enter = useEnter();

  const showSocialStub = (provider: string) => {
    Alert.alert(
      `${provider} sign-in is coming soon`,
      "Continue with email for now — it takes about a minute.",
    );
  };

  return (
    <View className="flex-1 bg-foreground">
      <Image
        accessibilityIgnoresInvertColors
        alt=""
        contentFit="cover"
        source={heroImage}
        style={{ height: "100%", position: "absolute", width: "100%" }}
        transition={300}
      />
      <LinearGradient
        colors={["rgba(4,20,20,0.55)", "rgba(4,20,20,0.15)", "rgba(4,20,20,0.92)"]}
        locations={[0, 0.35, 0.78]}
        style={{ flex: 1 }}
      >
        <View
          className="flex-1 justify-end px-5"
          style={{ paddingBottom: insets.bottom + 24, paddingTop: insets.top + 24 }}
        >
          <Animated.View entering={enter()}>
            <Text accessibilityRole="header" className="font-title text-hero text-white">
              Chowly
            </Text>
          </Animated.View>

          <Animated.View className="mt-3" entering={enter()}>
            <Text className="font-title text-title text-white">
              Your neighbourhood,{"\n"}delivered.
            </Text>
          </Animated.View>

          <Animated.View className="mt-9 gap-3" entering={enter()}>
            <Button label="Continue with email" onPress={() => router.push("/sign-up")} />
            <Button
              icon={<GoogleIcon />}
              label="Continue with Google"
              onPress={() => showSocialStub("Google")}
              variant="outline-inverse"
            />
          </Animated.View>

          <Animated.View className="mt-5 flex-row items-center justify-center" entering={enter()}>
            <Text className="font-sans text-body text-white/80">Already have an account? </Text>
            <Text
              accessibilityRole="link"
              className="font-heading text-body text-white"
              onPress={() => router.push("/sign-in")}
              suppressHighlighting
            >
              Log in
            </Text>
          </Animated.View>
        </View>
      </LinearGradient>
    </View>
  );
}
