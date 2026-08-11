/**
 * greeting — buckets the given time (defaults to now) into a
 * Good morning/afternoon/evening/night string, using whatever clock the
 * `Date` was constructed with (the browser's local clock for `new Date()`).
 */
export function greeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 5) return "Good night";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Good night";
}
