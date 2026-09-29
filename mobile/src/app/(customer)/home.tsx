import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCSSVariable } from "uniwind";

import { AddressSheet } from "@/components/address-sheet";
import { BannerCarousel, type Banner } from "@/components/banner-carousel";
import { CategoryStrip } from "@/components/category-strip";
import { RestaurantCard } from "@/components/restaurant-card";
import { RestaurantListSkeleton } from "@/components/restaurant-list-skeleton";
import { useBanners } from "@/features/catalogue/use-banners";
import { useRestaurants } from "@/features/catalogue/use-restaurants";
import { useDefaultAddress } from "@/features/location/use-addresses";
import { toast } from "@/lib/sonner";

/**
 * Bundled artwork. The carousel is admin-managed now, so this is only the
 * stand-in while the request is in flight, or if it fails: the home screen
 * should never open with a hole where the offers go.
 */
const fallbackArtwork = [
  {
    category: "offers",
    label: "20% off selected comfort favourites. Show offers.",
    source: require("@/assets/images/app-imgs/banner-1-full.png"),
  },
  {
    category: "all",
    label: "Free delivery this weekend on orders over $15. Explore restaurants.",
    source: require("@/assets/images/app-imgs/banner-2.png"),
  },
  {
    category: "offers",
    label: "$5 off your next order with code CHOWLY5. Show offers.",
    source: require("@/assets/images/app-imgs/banner-3.png"),
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: address } = useDefaultAddress();
  const contentWidth = useWindowDimensions().width - 40;
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [addressSheetOpen, setAddressSheetOpen] = useState(false);
  const handedOff = useRef(false);
  const {
    data: restaurants,
    isLoading,
    isRefetching,
    refetch,
  } = useRestaurants({ category: selectedCategory });
  const { data: liveBanners, refetch: refetchBanners } = useBanners();
  const [headerFrom, headerTo, headerInk, muted, foreground, primary, subtle] = useCSSVariable([
    "--color-header-from",
    "--color-header-to",
    "--color-header-foreground",
    "--color-muted-foreground",
    "--color-foreground",
    "--color-primary",
    "--color-subtle-foreground",
  ]);

  // A banner with no artwork would be a blank slide, so it never reaches here.
  const published = liveBanners?.filter((banner) => banner.imageUrl) ?? [];

  const banners: Banner[] = published.length
    ? published.map((banner) => ({
        label: [banner.title, banner.subtitle].filter(Boolean).join(". "),
        onPress: () => setSelectedCategory(banner.categorySlug || "all"),
        source: { uri: banner.imageUrl },
      }))
    : fallbackArtwork.map((banner) => ({
        label: banner.label,
        onPress: () => setSelectedCategory(banner.category),
        source: banner.source,
      }));

  // The API sorts by rating, so the leaders head the feed and the rest follow.
  const popular = restaurants?.slice(0, 2) ?? [];
  const rest = restaurants?.slice(2) ?? [];

  /**
   * Hand off to the search screen the moment this field is touched. Waiting for
   * the first character loses the rest of the word: those keystrokes land here
   * while the push is still in flight, and this field is left behind.
   */
  const openSearch = (value?: string) => {
    if (handedOff.current) return;

    handedOff.current = true;
    setSearchTerm("");
    router.push({
      pathname: "/search",
      params: { handoff: String(Date.now()), q: value?.trim() ?? "" },
    });

    // Ready again for the next visit to the feed.
    setTimeout(() => {
      handedOff.current = false;
    }, 600);
  };

  return (
    <View className="flex-1 bg-background">
      <LinearGradient colors={[headerFrom as string, headerTo as string]}>
        <View
          className="flex-row items-start justify-between px-5 pb-9"
          style={{ paddingTop: insets.top + 12 }}
        >
          <Pressable
            accessibilityHint="Opens your saved delivery addresses"
            accessibilityLabel={`Deliver to ${address?.line1 ?? "choose an address"}`}
            accessibilityRole="button"
            className="flex-1 active:opacity-80"
            onPress={() => setAddressSheetOpen(true)}
          >
            <Text
              className="font-label text-label"
              style={{ color: headerInk as string, opacity: 0.7 }}
            >
              Deliver to
            </Text>
            <View className="flex-row items-center gap-1">
              <Text
                className="font-title text-title"
                numberOfLines={1}
                style={{ color: headerInk as string }}
              >
                {address ? `${address.line1}, ${address.city}` : "Add an address"}
              </Text>
              <Ionicons color={headerInk as string} name="chevron-down" size={20} />
            </View>
          </Pressable>

          <Pressable
            accessibilityLabel="Notifications"
            accessibilityRole="button"
            className="h-11 w-11 items-center justify-center active:opacity-80"
            hitSlop={8}
            onPress={() =>
              toast("Notifications arrive with order tracking", {
                description: "You will hear from us once orders are live.",
              })
            }
          >
            <Ionicons color={headerInk as string} name="notifications-outline" size={24} />
            <View className="absolute right-2 top-2 h-2.5 w-2.5 rounded-pill bg-accent" />
          </Pressable>
        </View>
      </LinearGradient>

      <ScrollView
        className="-mt-6 rounded-t-sheet bg-background"
        contentContainerClassName="pb-8"
        refreshControl={
          <RefreshControl
            colors={[primary as string]}
            onRefresh={() => {
              void refetch();
              void refetchBanners();
            }}
            refreshing={isRefetching}
            tintColor={primary as string}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View className="px-5 pt-5">
          <View className="h-13 flex-row items-center gap-3 rounded-input border border-border bg-card px-4">
            <Ionicons color={muted as string} name="search" size={20} />
            <TextInput
              accessibilityLabel="Search for restaurants or dishes"
              autoCorrect={false}
              className="flex-1 font-sans text-body text-foreground"
              onChangeText={openSearch}
              onFocus={() => openSearch()}
              onSubmitEditing={(event) => openSearch(event.nativeEvent.text)}
              placeholder="Search for restaurants or dishes"
              placeholderTextColor={subtle as string}
              returnKeyType="search"
              value={searchTerm}
            />
            <Pressable
              accessibilityLabel="Open search"
              accessibilityRole="button"
              hitSlop={8}
              onPress={() => router.push("/search")}
            >
              <Ionicons color={foreground as string} name="options-outline" size={20} />
            </Pressable>
          </View>
        </View>

        <View className="py-6 pt-4">
          <CategoryStrip onSelect={setSelectedCategory} selectedSlug={selectedCategory} />
        </View>

        <View className="px-5">
          <BannerCarousel banners={banners} width={contentWidth} />
        </View>

        {isLoading ? (
          <RestaurantListSkeleton contentWidth={contentWidth} />
        ) : restaurants && restaurants.length > 0 ? (
          <>
            <SectionHeader title="Popular near you" />
            <ScrollView
              contentContainerClassName="gap-4 px-5"
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              {popular.map((restaurant) => (
                <RestaurantCard
                  key={restaurant._id}
                  restaurant={restaurant}
                  width={contentWidth * 0.72}
                />
              ))}
            </ScrollView>

            {rest.length > 0 ? (
              <>
                <SectionHeader title="Top picks for you" />
                <View className="gap-4 px-5">
                  {rest.map((restaurant) => (
                    <RestaurantCard
                      key={restaurant._id}
                      restaurant={restaurant}
                    />
                  ))}
                </View>
              </>
            ) : null}
          </>
        ) : (
          <View className="items-center gap-2 px-5 py-16">
            <Ionicons color={muted as string} name="storefront-outline" size={40} />
            <Text className="text-center font-heading text-section text-foreground">
              Nothing here yet
            </Text>
            <Text className="text-center font-sans text-body text-muted-foreground">
              No restaurants in this category right now. Try another one.
            </Text>
          </View>
        )}
      </ScrollView>

      <AddressSheet onClose={() => setAddressSheetOpen(false)} open={addressSheetOpen} />
    </View>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <View className="px-5 pb-4 pt-7">
      <Text accessibilityRole="header" className="font-heading text-section text-foreground">
        {title}
      </Text>
    </View>
  );
}
