
/**
 * Generates a color based on pressure value
 * Returns a color from blue (low pressure) to green (medium pressure) to red (high pressure)
 */
export const getPressureColor = (pressure: number, maxPressure: number): string => {
  // Ensure maxPressure is at least 1 to avoid division by zero
  const safePressure = Math.max(0, pressure);
  const safeMaxPressure = Math.max(1, maxPressure);
  
  // Calculate percentage (0 to 1)
  const percentage = Math.min(1, safePressure / safeMaxPressure);
  
  // Create RGB values for a blue-green-red gradient
  if (percentage < 0.5) {
    // Blue to green (0% to 50%)
    const adjustedPercentage = percentage * 2;
    const r = Math.floor(adjustedPercentage * 255);
    const g = Math.floor(adjustedPercentage * 255);
    const b = Math.floor(255 - adjustedPercentage * 255);
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    // Green to red (50% to 100%)
    const adjustedPercentage = (percentage - 0.5) * 2;
    const r = Math.floor(255);
    const g = Math.floor(255 - adjustedPercentage * 255);
    const b = 0;
    return `rgb(${r}, ${g}, ${b})`;
  }
};
