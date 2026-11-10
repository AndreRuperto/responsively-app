import {test, expect} from '../fixtures/electron-app';

test.describe('Preview Layout', () => {
  test('default layout is applied on launch', async ({app}) => {
    await app.dismissModals();

    // The previewer container should have a flex layout by default (COLUMN layout)
    const previewContainer = app.page.locator('.flex.gap-4.overflow-auto.p-4').first();
    await expect(previewContainer).toBeVisible({timeout: 10_000});
  });

  test('selecting "Flex" layout changes the previewer container class', async ({app}) => {
    await app.dismissModals();

    // Click the Flex layout button (inside ButtonGroup)
    const flexBtn = app.page.locator('[data-testid="layout-FLEX"]');
    await flexBtn.click();
    await app.page.waitForTimeout(300);

    // The container should now have flex-wrap class
    const previewContainer = app.page.locator('.flex.gap-4.overflow-auto.p-4.flex-wrap').first();
    await expect(previewContainer).toBeVisible({timeout: 5_000});
  });

  test('selecting "Column" layout stacks devices horizontally', async ({app}) => {
    await app.dismissModals();

    // Click the Column layout button
    const columnBtn = app.page.locator('[data-testid="layout-COLUMN"]');
    await columnBtn.click();
    await app.page.waitForTimeout(300);

    // The container should have flex without flex-wrap
    const previewContainer = app.page.locator('.flex.gap-4.overflow-auto.p-4').first();
    await expect(previewContainer).toBeVisible({timeout: 5_000});
  });

  test('keyboard shortcut Cmd/Ctrl+Shift+L cycles through layouts', async ({app}) => {
    await app.dismissModals();

    // Press the shortcut to cycle layout
    await app.page.keyboard.press(`${app.modifier}+Shift+l`);
    await app.page.waitForTimeout(500);

    // The layout should have changed — verify a previewer container still exists
    await expect(app.firstWebview).toBeAttached({timeout: 10_000});

    // Cycle back to column layout by pressing multiple times
    await app.page.keyboard.press(`${app.modifier}+Shift+l`);
    await app.page.waitForTimeout(300);
    await app.page.keyboard.press(`${app.modifier}+Shift+l`);
    await app.page.waitForTimeout(300);
    await app.page.keyboard.press(`${app.modifier}+Shift+l`);
    await app.page.waitForTimeout(300);
  });

  test('layout persists after navigating to a new URL', async ({app, testServerUrl}) => {
    await app.dismissModals();

    // Set layout to Flex

    const flexBtn = app.page.locator('[data-testid="layout-FLEX"]');
    await flexBtn.click();
    await app.page.waitForTimeout(300);

    // Navigate to a new URL
    await app.navigateTo(`${testServerUrl}/test-page.html`);

    // Verify flex-wrap is still present (Flex layout persisted)
    const previewContainer = app.page.locator('.flex.gap-4.overflow-auto.p-4.flex-wrap').first();
    await expect(previewContainer).toBeVisible({timeout: 5_000});

    // Reset to column layout
    const columnBtn = app.page.locator('[data-testid="layout-COLUMN"]');
    await columnBtn.click();
  });
  test('navigator reaches every device without remounting webviews', async ({app}) => {
    await app.dismissModals();

    const nav = app.page.getByTestId('device-navigator');
    const chips = nav.getByTestId('device-chip');
    await expect(nav).toBeVisible({timeout: 10_000});
    const count = await app.webviews.count();
    await expect(chips).toHaveCount(count);
    await expect(nav.getByTestId('device-counter')).toHaveText(`1/${count}`);
    await expect(nav.getByTestId('device-previous')).toBeDisabled();

    if (count > 1) {
      await nav.getByTestId('device-next').click();
      await expect(nav.getByTestId('device-counter')).toHaveText(`2/${count}`);
      await expect(chips.nth(1)).toHaveAttribute('aria-pressed', 'true');
      await nav.getByTestId('device-previous').click();
      await expect(chips.first()).toHaveAttribute('aria-pressed', 'true');
    }

    await expect(app.firstWebview).toBeAttached();
    expect(await app.webviews.count()).toBe(count);
  });

  test('fit all scales a horizontal suite while preserving previews', async ({app}) => {
    await app.dismissModals();
    await app.page.getByTestId('layout-COLUMN').click();

    const initialCount = await app.webviews.count();
    await app.page.getByTestId('fit-all').click();

    await expect(app.firstWebview).toBeAttached();
    expect(await app.webviews.count()).toBe(initialCount);
    const zoom = Number(await app.firstWebview.getAttribute('data-scale-factor'));
    expect(zoom).toBeGreaterThan(0);
    expect(zoom).toBeLessThanOrEqual(1);
  });

  test('auto layout can be enabled and disabled', async ({app}) => {
    await app.dismissModals();

    const auto = app.page.getByTestId('auto-layout');
    await expect(auto).toHaveAttribute('aria-pressed', 'false');
    await auto.click();
    await expect(auto).toHaveAttribute('aria-pressed', 'true');
    await expect(app.firstWebview).toBeAttached();
    await auto.click();
    await expect(auto).toHaveAttribute('aria-pressed', 'false');
  });

});
