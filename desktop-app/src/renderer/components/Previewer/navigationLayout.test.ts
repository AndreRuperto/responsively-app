import {describe, expect, it} from 'vitest';
import {PREVIEW_LAYOUTS} from 'common/constants';
import {zoomSteps} from 'renderer/store/features/renderer';
import {fitPreviewZoom, recommendPreviewLayout} from './navigationLayout';

describe('preview navigation layout', () => {
  const pair = [{width: 400, height: 800}, {width: 500, height: 900}];

  it('uses a single horizontal row only when unscaled devices fit', () => {
    expect(recommendPreviewLayout(pair, 1000)).toBe(PREVIEW_LAYOUTS.COLUMN);
    expect(recommendPreviewLayout(pair, 700)).toBe(PREVIEW_LAYOUTS.FLEX);
  });

  it('chooses an existing zoom step compatible with zoom controls', () => {
    const scale = fitPreviewZoom(pair, 780, 1100, PREVIEW_LAYOUTS.COLUMN);
    expect(scale).toBe(0.8);
    expect(zoomSteps).toContain(scale);
  });

  it('does not enlarge a suite that already fits', () => {
    expect(fitPreviewZoom(pair, 1000, 1100, PREVIEW_LAYOUTS.COLUMN)).toBe(1);
  });

  it('wraps previews into multiple rows when appropriate', () => {
    const small = [{width: 400, height: 500}, {width: 400, height: 500}];
    expect(fitPreviewZoom(small, 450, 1400, PREVIEW_LAYOUTS.FLEX)).toBe(1);
    expect(fitPreviewZoom(small, 450, 1400, PREVIEW_LAYOUTS.COLUMN)).toBeLessThan(1);
  });

  it('supports an empty suite and impossibly small viewports', () => {
    expect(fitPreviewZoom([], 100, 100, PREVIEW_LAYOUTS.FLEX)).toBe(1);
    expect(
      fitPreviewZoom(
        [{width: 2000, height: 2000}, {width: 2000, height: 2000}],
        500,
        300,
        PREVIEW_LAYOUTS.FLEX
      )
    ).toBe(0.25);
  });
});
