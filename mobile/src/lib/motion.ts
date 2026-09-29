import { FadeIn, useReducedMotion } from "react-native-reanimated";

/**
 * One entrance for the whole onboarding surface: a single short fade, applied to
 * every block at once. No travel, no spring and no stagger, so a screen never
 * assembles itself piece by piece in front of the reader.
 */
export function useEnter() {
  const reduceMotion = useReducedMotion();

  return () => (reduceMotion ? FadeIn.duration(0) : FadeIn.duration(180));
}
