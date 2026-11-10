import {PREVIEW_LAYOUTS} from 'common/constants';
import {zoomSteps} from 'renderer/store/features/renderer';

export interface PreviewSize {
  width: number;
  height: number;
}

const GAP = 16;
const HORIZONTAL_PADDING = 32;
/** Allow space for each preview's label and toolbar, which are not scaled. */
const CHROME_HEIGHT = 88;

/** Choose a single row only when the unscaled previews actually fit. */
export const recommendPreviewLayout = (sizes: PreviewSize[], viewportWidth: number) => {
  const fullWidth = sizes.reduce((total, size) => total + size.width, 0) +
    Math.max(0, sizes.length - 1) * GAP;
  return fullWidth <= viewportWidth - HORIZONTAL_PADDING
    ? PREVIEW_LAYOUTS.COLUMN
    : PREVIEW_LAYOUTS.FLEX;
};

/** Select an existing zoom step so the regular zoom in/out controls still work. */
export const fitPreviewZoom = (
  sizes: PreviewSize[],
  viewportWidth: number,
  viewportHeight: number,
  layout: typeof PREVIEW_LAYOUTS.COLUMN | typeof PREVIEW_LAYOUTS.FLEX
): number => {
  if (sizes.length === 0) return 1;

  const width = Math.max(1, viewportWidth - HORIZONTAL_PADDING);
  const height = Math.max(1, viewportHeight - HORIZONTAL_PADDING);
  const steps = zoomSteps.filter((step) => step <= 1).reverse();

  for (const scale of steps) {
    if (layout === PREVIEW_LAYOUTS.COLUMN) {
      const contentWidth = sizes.reduce((total, size) => total + size.width * scale, 0) +
        (sizes.length - 1) * GAP;
      const contentHeight = Math.max(...sizes.map((size) => size.height * scale)) + CHROME_HEIGHT;
      if (contentWidth <= width && contentHeight <= height) return scale;
      continue;
    }

    let rowWidth = 0;
    let rowHeight = 0;
    let totalHeight = 0;
    let canFit = true;
    for (const size of sizes) {
      const nextWidth = size.width * scale;
      const nextHeight = size.height * scale + CHROME_HEIGHT;
      if (nextWidth > width) {
        canFit = false;
        break;
      }
      if (rowWidth > 0 && rowWidth + GAP + nextWidth > width) {
        totalHeight += rowHeight + GAP;
        rowWidth = 0;
        rowHeight = 0;
      }
      rowWidth += (rowWidth ? GAP : 0) + nextWidth;
      rowHeight = Math.max(rowHeight, nextHeight);
    }
    if (canFit && totalHeight + rowHeight <= height) return scale;
  }

  // There may be no way to fit very large suites at the smallest supported
  // zoom. The previews remain reachable through the navigator and scrolling.
  return zoomSteps[0];
};
