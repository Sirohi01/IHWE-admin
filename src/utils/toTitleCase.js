// "VIJAY sharma" -> "Vijay Sharma". Non-strings are returned unchanged.
export const toTitleCase = (str) => {
  if (!str || typeof str !== "string") return str;
  return str.toLowerCase().replace(/(^|[\s.'-])([a-z])/g, (_, sep, ch) => sep + ch.toUpperCase());
};

export default toTitleCase;
