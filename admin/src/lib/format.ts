/** Money arrives from the API in minor units (cents), matching the mobile app. */
export const formatMoney = (cents: number): string =>
  `$${(cents / 100).toLocaleString(undefined, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  })}`;

export const formatTime = (iso: string): string =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

/** "2 min", "6 min", "3 h" — how long ago an event happened. */
export const formatAgo = (iso: string): string => {
  const minutes = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60_000));

  if (minutes < 60) return `${minutes} min`;
  if (minutes < 1440) return `${Math.round(minutes / 60)} h`;

  return `${Math.round(minutes / 1440)} d`;
};

/** Percentage change against a previous period; null when there is no baseline. */
export const percentChange = (current: number, previous: number): number | null => {
  if (previous === 0) return current === 0 ? 0 : null;

  return ((current - previous) / previous) * 100;
};

/** Split for stacked cells: the date on one line, the clock time under it. */
export const formatDateTime = (iso: string): { date: string; time: string } => {
  const at = new Date(iso);

  return {
    date: at.toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" }),
    time: at.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };
};
