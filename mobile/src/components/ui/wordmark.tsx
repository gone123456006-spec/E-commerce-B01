import { Image } from "expo-image";
import { Text, View } from "react-native";

const marks = {
  brand: require("@/assets/images/logo-mark-teal.png"),
  inverse: require("@/assets/images/logo-mark-white.png"),
};

type Props = {
  /** "brand" renders teal for light surfaces, "inverse" renders white over media. */
  tone?: "brand" | "inverse";
  size?: "hero" | "title";
  showMark?: boolean;
};

/** The Chowly mark and name, from the same artwork the app icon uses. */
export function Wordmark({ tone = "brand", size = "title", showMark = false }: Props) {
  const markSize = size === "hero" ? 56 : 36;

  return (
    <View className="flex-row items-center gap-2">
      {showMark ? (
        // expo-image ignores className for sizing, so the box is a style.
        <Image
          contentFit="contain"
          source={marks[tone]}
          style={{ height: markSize, width: markSize }}
        />
      ) : null}
      <Text
        accessibilityRole="header"
        className={`font-title ${size === "hero" ? "text-hero" : "text-display"} ${
          tone === "inverse" ? "text-white" : "text-primary"
        }`}
      >
        Chowly
      </Text>
    </View>
  );
}
