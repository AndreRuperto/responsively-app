/** Pure layout measurements shared by the UI and unit tests. */
export interface PreviewMetrics {
  id: string;
  width: number;
  height: number;
  isMobileCapable: boolean;
}

export const displayedSize = (
  device: PreviewMetrics,
  rotateAll: boolean,
  rotations: Record<string, boolean>
): {width: number; height: number} => {
  const rotated = device.isMobileCapable && (rotateAll || Boolean(rotations[device.id]));
  return rotated
    ? {width: device.height, height: device.width}
    : {width: device.width, height: device.height};
};

/** Unclamped scale needed to fit the entire row (including labels and gaps). */
export const calculateFitScale = (
  devices: PreviewMetrics[],
  viewportWidth: number,
  viewportHeight: number,
  rotateAll: boolean,
  rotations: Record<string, boolean>
): number => {
  if (devices.length === 0) return 1;
  const sizes = devices.map((device) => displayedSize(device, rotateAll, rotations));
  const width = sizes.reduce((total, size) => total + size.width, 0);
  const height = Math.max(...sizes.map((size) => size.height));
  if (width <= 0 || height <= 0) return 0;
  const horizontalChrome = 32 + 16 * (devices.length - 1) + 8 * devices.length;
  const verticalChrome = 108;
  return Math.max(
    0,
    Math.min(
      (viewportWidth - horizontalChrome) / width,
      (viewportHeight - verticalChrome) / height
    )
  );
};

/** Choose an available zoom that never exceeds the measured fit. */
export const floorZoomStep = (rawScale: number, zoomSteps: number[]): number => {
  const steps = [...zoomSteps].sort((a, b) => a - b);
  if (steps.length === 0) return 1;
  return [...steps].reverse().find((step) => step <= rawScale) ?? steps[0];
};
