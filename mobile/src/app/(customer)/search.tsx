import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useCSSVariable } from "uniwind";

import { Screen } from "@/components/ui/screen";
import { popularCuisines } from "@/features/catalogue/fixtures";
import { useSearch } from "@/features/catalogue/use-search";
import { formatPrepTime, formatPrice } from "@/lib/format";

export default function SearchScreen() {
  const router = useRouter();
  // Typing on the home screen hands the first characters over to this one.
  const { handoff, q } = useLocalSearchParams<{ handoff?: string; q?: string }>();
  const [term, setTerm] = useState(q ?? "");

  // Search is a tab, so it keeps its last term. Arriving from the home field is a
  // fresh intent: the handoff stamp changes and the term starts over.
  useEffect(() => {
    if (handoff) setTerm(q ?? "");
  }, [handoff, q]);
  const { data, isLoading, isTyping } = useSearch(term);
  const [subtle, muted, foreground, primary, rating] = useCSSVariable([
    "--color-subtle-foreground",
    "--color-muted-foreground",
    "--color-foreground",
    "--color-primary",
    "--color-rating",
  ]);

  const hasTerm = term.trim().length > 0;
  const restaurants = data?.restaurants ?? [];
  const dishes = data?.dishes ?? [];
  const nothingFound = hasTerm && !isLoading && !isTyping && restaurants.length + dishes.length === 0;

  return (
    <Screen edges={["top"]}>
      <View className="gap-6 px-5 pt-4">
        <Text accessibilityRole="header" className="font-title text-title text-foreground">
          Search
        </Text>

        <View className="h-13 flex-row items-center gap-3 rounded-input border border-border bg-card px-4">
          <Ionicons color={muted as string} name="search" size={20} />
          <TextInput
            accessibilityLabel="Search for restaurants or dishes"
            autoCorrect={false}
            // Always focused: arriving mid-word from home, typing must continue.
            autoFocus
            className="flex-1 font-sans text-body text-foreground"
            onChangeText={setTerm}
            placeholder="Search for restaurants or dishes"
            placeholderTextColor={subtle as string}
            returnKeyType="search"
            selectionColor={foreground as string}
            value={term}
          />
          {hasTerm ? (
            <Pressable
              accessibilityLabel="Clear search"
              accessibilityRole="button"
              hitSlop={8}
              onPress={() => setTerm("")}
            >
              <Ionicons color={muted as string} name="close-circle" size={20} />
            </Pressable>
          ) : null}
        </View>
      </View>

      <ScrollView
        contentContainerClassName="px-5 pb-8 pt-6"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {!hasTerm ? (
          <View className="gap-4">
            <Text accessibilityRole="header" className="font-heading text-section text-foreground">
              Popular cuisines
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {popularCuisines.map((cuisine) => (
                <Pressable
                  accessibilityLabel={cuisine}
                  accessibilityRole="button"
                  className="rounded-pill border border-border bg-card px-4 py-2 active:bg-muted"
                  key={cuisine}
                  onPress={() => setTerm(cuisine)}
                >
                  <Text className="font-label text-body text-card-foreground">{cuisine}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : isLoading || isTyping ? (
          <View className="items-center py-16">
            <ActivityIndicator color={primary as string} />
          </View>
        ) : nothingFound ? (
          <View className="items-center gap-3 pt-16">
            <Ionicons color={subtle as string} name="search-outline" size={40} />
            <Text className="text-center font-heading text-section text-foreground">
              No results for “{term.trim()}”
            </Text>
            <Text className="text-center font-sans text-body text-muted-foreground">
              Try a different dish or cuisine.
            </Text>
          </View>
        ) : (
          <View className="gap-7">
            {restaurants.length > 0 ? (
              <View className="gap-3">
                <Text
                  accessibilityRole="header"
                  className="font-heading text-section text-foreground"
                >
                  Restaurants
                </Text>
                {restaurants.map((restaurant) => (
                  <Pressable
                    accessibilityLabel={`${restaurant.name}, ${restaurant.rating} stars`}
                    accessibilityRole="button"
                    className="flex-row items-center gap-4 rounded-card border border-border bg-card p-3 active:opacity-90"
                    key={restaurant._id}
                    onPress={() =>
                      router.push({
                        pathname: "/restaurant/[slug]",
                        params: {
                          id: restaurant._id,
                          image: restaurant.imageUrl,
                          slug: restaurant.slug,
                        },
                      })
                    }
                  >
                    {restaurant.imageUrl ? (
                      <Image
                        accessibilityIgnoresInvertColors
                        alt=""
                        contentFit="cover"
                        source={{ uri: restaurant.imageUrl }}
                        style={{ borderRadius: 12, height: 64, width: 64 }}
                        transition={200}
                      />
                    ) : (
                      <View
                        className="items-center justify-center rounded-input bg-secondary"
                        style={{ height: 64, width: 64 }}
                      >
                        <Text className="font-title text-title text-secondary-foreground">
                          {restaurant.name.charAt(0)}
                        </Text>
                      </View>
                    )}

                    <View className="flex-1 gap-1">
                      <Text className="font-heading text-body text-foreground">
                        {restaurant.name}
                      </Text>
                      <Text
                        className="font-sans text-label text-muted-foreground"
                        numberOfLines={1}
                      >
                        {restaurant.cuisines.join(" • ")}
                      </Text>
                      <View className="flex-row items-center gap-1">
                        <Ionicons color={rating as string} name="star" size={13} />
                        <Text className="font-label text-label text-foreground">
                          {restaurant.rating}
                        </Text>
                        <Text className="font-sans text-label text-muted-foreground">
                          ({restaurant.ratingCount}) · {formatPrepTime(
                            restaurant.prepTimeMinMinutes,
                            restaurant.prepTimeMaxMinutes,
                          )}
                        </Text>
                      </View>
                    </View>

                    <Ionicons color={muted as string} name="chevron-forward" size={18} />
                  </Pressable>
                ))}
              </View>
            ) : null}

            {dishes.length > 0 ? (
              <View className="gap-3">
                <Text
                  accessibilityRole="header"
                  className="font-heading text-section text-foreground"
                >
                  Dishes
                </Text>
                {dishes.map((dish) => (
                  <Pressable
                    accessibilityHint="Opens the dish to customise it"
                    accessibilityLabel={`${dish.name} at ${dish.restaurantId.name}`}
                    accessibilityRole="button"
                    className="flex-row items-center gap-4 rounded-card border border-border bg-card p-3 active:opacity-90"
                    key={dish._id}
                    onPress={() => router.push({ pathname: "/dish/[id]", params: { id: dish._id } })}
                  >
                    {dish.imageUrl ? (
                      <Image
                        accessibilityIgnoresInvertColors
                        alt=""
                        contentFit="cover"
                        source={{ uri: dish.imageUrl }}
                        style={{ borderRadius: 12, height: 64, width: 64 }}
                        transition={200}
                      />
                    ) : (
                      <View
                        className="items-center justify-center rounded-input bg-muted"
                        style={{ height: 64, width: 64 }}
                      >
                        <Ionicons color={subtle as string} name="restaurant-outline" size={20} />
                      </View>
                    )}

                    <View className="flex-1 gap-1">
                      <Text className="font-heading text-body text-foreground">{dish.name}</Text>
                      <Text className="font-sans text-label text-muted-foreground" numberOfLines={1}>
                        {dish.restaurantId.name}
                      </Text>
                      <Text className="font-label text-body text-foreground">
                        {formatPrice(dish.price)}
                      </Text>
                    </View>

                    <Ionicons color={muted as string} name="chevron-forward" size={18} />
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}
