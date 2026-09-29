/**
 * Money arrives from the API in minor units (cents) so nothing is ever a float.
 * Orders are charged in USD, so the symbol matches.
 */
export const formatPrice = (cents: number): string => `$${(cents / 100).toFixed(2)}`;

export const formatDeliveryFee = (cents: number): string =>
  cents === 0 ? "Free delivery" : `${formatPrice(cents)} delivery`;

export const formatPrepTime = (min: number, max: number): string => `${min}–${max} min`;

/** "22:30" -> "10:30 PM" */
export const formatClosingTime = (value: string): string => {
  const [hours, minutes] = value.split(":").map(Number);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) return value;

  const suffix = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;

  return `${hour12}:${String(minutes).padStart(2, "0")} ${suffix}`;
};
