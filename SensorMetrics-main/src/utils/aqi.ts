export function generateColorFromLatLong(lat: number, long: number): string {
  // Helper function to normalize a value between min and max
  const normalize = (value: number, min: number, max: number): number => {
    return (value - min) / (max - min);
  };

  // Normalize latitude and longitude to a 0–1 range
  const normalizedLat: number = normalize(lat, -90, 90); // Latitude ranges from -90 to 90
  const normalizedLong: number = normalize(long, -180, 180); // Longitude ranges from -180 to 180

  // Hashing mechanism for uniqueness
  const hash = (value: number): number =>
    Math.abs((Math.sin(value * 12345.678) * 10000) % 256);

  // Generate RGB components in the range of 80–160 for medium-dark tones
  const r: number = Math.round(80 + (hash(normalizedLat) % 80)); // Red: 80–160
  const g: number = Math.round(80 + (hash(normalizedLong) % 80)); // Green: 80–160
  const b: number = Math.round(
    80 + (hash(normalizedLat + normalizedLong) % 80)
  ); // Blue: 80–160

  // Convert RGB to Hex
  const toHex = (component: number): string =>
    component.toString(16).padStart(2, "0");

  // Return the Hex color string
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function getBatchData<T>(arr: T[], start: number, end: number): T[] {
  if (start < 0 || end >= arr.length || start > end) {
    throw new Error("Invalid start or end index");
  }
  return arr.slice(start, end + 1);
}
