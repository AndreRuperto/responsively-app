import {test, expect} from '../fixtures/electron-app';

test.describe('Preview device navigation', () => {
  test('selects devices without remounting webviews', async ({app}) => {
    await app.dismissModals();
    await app.page.getByTestId('layout-COLUMN').click();
    const navigation = app.page.getByTestId('device-navigator');
    await expect(navigation).toBeVisible();

    const deviceButtons = app.page.locator('[data-testid^="device-chip"]');
    const count = await deviceButtons.count();
    expect(count).toBeGreaterThan(1);

    const webviews = app.page.locator('webview');
    const originalCount = await webviews.count();
    await app.page.getByTestId('device-next').click();
    await expect(deviceButtons.nth(1)).toHaveAttribute('aria-pressed', 'true');
    await deviceButtons.last().click();
    await expect(deviceButtons.last()).toHaveAttribute('aria-pressed', 'true');
    await expect(app.page.getByTestId('device-next')).toBeDisabled();
    expect(await webviews.count()).toBe(originalCount);
  });

  test('fits all and toggles automatic layout', async ({app}) => {
    await app.dismissModals();
    await app.page.getByTestId('layout-COLUMN').click();
    await app.page.getByTestId('fit-all').click();
    await expect(app.page.getByTestId('preview-layout-container')).toBeVisible();

    const smart = app.page.getByTestId('auto-layout');
    await smart.click();
    await expect(smart).toHaveAttribute('aria-pressed', 'true');
    await smart.click();
    await expect(smart).toHaveAttribute('aria-pressed', 'false');
  });
});
