import {describe, expect, it} from 'vitest';
import {calculateFitScale, displayedSize, floorZoomStep, type PreviewMetrics} from './layoutSizing';

const devices: PreviewMetrics[] = [
  {id: 'iphone', width: 390, height: 844, isMobileCapable: true},
  {id: 'ipad', width: 768, height: 1024, isMobileCapable: true},
  {id: 'galaxy-fe', width: 360, height: 780, isMobileCapable: true},
  {id: 'galaxy-s21', width: 360, height: 800, isMobileCapable: true},
  {id: 'laptop', width: 1440, height: 900, isMobileCapable: false},
];

describe('multi-device navigation sizing', () => {
  it('computes a readable zoom for five previews in one row', () => {
    const fit = calculateFitScale(devices, 1100, 800, false, {});
    expect(fit).toBeGreaterThan(0.25);
    expect(fit).toBeLessThan(0.33);
    expect(floorZoomStep(fit, [0.25, 0.33, 0.5, 1])).toBe(0.25);
  });

  it('never offers a zoom larger than the fit', () => {
    expect(floorZoomStep(0.74, [0.25, 0.5, 0.67, 0.75, 1])).toBe(0.67);
  });

  it('keeps the smallest zoom if the viewport is extremely narrow', () => {
    expect(floorZoomStep(0.12, [0.25, 0.5, 1])).toBe(0.25);
  });

  it('accounts for rotation only on mobile devices', () => {
    expect(displayedSize(devices[0], false, {iphone: true})).toEqual({width: 844, height: 390});
    expect(displayedSize(devices[4], true, {laptop: true})).toEqual({width: 1440, height: 900});
  });

  it('is safe with an empty suite or unavailable stage', () => {
    expect(calculateFitScale([], 800, 700, false, {})).toBe(1);
    expect(calculateFitScale(devices, 0, 0, false, {})).toBe(0);
  });
});
