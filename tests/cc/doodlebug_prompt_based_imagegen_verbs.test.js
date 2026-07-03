import { expect, test } from '@playwright/test';
import { features } from '../../features/cc/doodlebug_prompt_based_imagegen_verbs.spec.js';
import DoodlebugPromptImageGen from '../../selectors/cc/doodlebug_prompt_based_imagegen_verbs.page.js';

let doodlebug;

test.describe('CC Doodlebug Prompt Based Image Generation', () => {
  test.beforeEach(async ({ page }) => {
    doodlebug = new DoodlebugPromptImageGen(page);
  });

  test.afterEach(async ({ page }) => {
    await page.close();
  });

  // TC-1 to TC-4: UI checks and generate navigation — all pages.
  features.forEach((feature) => {
    test(`${feature.name}, ${feature.tags}`, async ({ page, baseURL }) => {
      console.info(`[Test Page]: ${baseURL}${feature.path}`);

      await test.step('step-1: Navigate to Firefly feature page', async () => {
        await page.goto(`${baseURL}${feature.path}`);
        await page.waitForLoadState('domcontentloaded');
        await expect(page).toHaveURL(`${baseURL}${feature.path}`);
      });

      // TC-1: Unity widget is visible in the page marquee.
      await test.step('step-2: Verify Unity widget is visible in page marquee', async () => {
        await doodlebug.waitForWidgetReady();
        await expect(doodlebug.marqueeSection).toBeVisible();
        await expect(doodlebug.widgetRoot).toBeVisible();
        await expect(doodlebug.promptInput).toBeVisible();
        await expect(doodlebug.generateCTA).toBeVisible();
      });

      // TC-2: Prompt textarea is visible and accepts input.
      await test.step('step-3: Verify prompt textarea is visible and accepts input', async () => {
        await expect(doodlebug.promptInput).toBeVisible();
        await expect(doodlebug.promptInput).toBeEditable();
      });

      // TC-3: Verb selector (image/video) is present with expected options — skipped on pages without a verb selector.
      if (feature.hasVerbSelector !== false) {
        await test.step('step-4: Verify media-type verb selector shows image and video options', async () => {
          await expect(doodlebug.verbContainer).toBeVisible();
          await expect(doodlebug.verbTrigger).toBeVisible();
          const availableOptions = await doodlebug.openVerbDropdownAndGetOptions();
          for (const option of DoodlebugPromptImageGen.expectedVerbOptions) {
            expect(
              availableOptions.some((o) => o.toLowerCase().includes(option)),
              `Verb option "${option}" should be present in the selector`,
            ).toBe(true);
          }
        });
      }

      // TC-4: Generate CTA navigates to the Firefly stage product page.
      await test.step('step-5: Verify Generate CTA navigates to Firefly stage product page', async () => {
        await doodlebug.dismissMepOverlay();
        await expect(doodlebug.generateCTA).toBeVisible();
        await doodlebug.generateCTA.click();
        await page.waitForURL((url) => url.toString().includes('firefly-stage.corp.adobe.com'), { timeout: 20000 });
        expect(page.url()).toContain('firefly-stage.corp.adobe.com');
      });
    });
  });

  // TC-5: Custom prompt + Generate — all pages.
  features.forEach((feature) => {
    test(
      `${feature.name}-customprompt-generate, ${feature.tags} @cc-doodlebug-custompromptgenerate`,
      async ({ page, baseURL }) => {
        console.info(`[Test Page]: ${baseURL}${feature.path}`);

        await test.step('step-1: Navigate to Firefly feature page', async () => {
          await page.goto(`${baseURL}${feature.path}`);
          await page.waitForLoadState('domcontentloaded');
          await expect(page).toHaveURL(`${baseURL}${feature.path}`);
        });

        await test.step('step-2: Verify Unity widget is ready', async () => {
          await doodlebug.waitForWidgetReady();
          await expect(doodlebug.widgetRoot).toBeVisible();
          await expect(doodlebug.promptInput).toBeVisible();
        });

        await test.step('step-3: Fill custom prompt in the prompt textarea', async () => {
          await doodlebug.dismissMepOverlay();
          await doodlebug.fillPrompt(feature.data.prompt);
          const value = await doodlebug.getPromptValue();
          expect(value, 'Prompt textarea should contain the custom prompt').toBe(feature.data.prompt);
        });

        await test.step('step-4: Click Generate CTA and verify navigation to Firefly stage page', async () => {
          await expect(doodlebug.generateCTA).toBeVisible();
          await doodlebug.generateCTA.click();
          await page.waitForURL((url) => url.toString().includes('firefly-stage.corp.adobe.com'), { timeout: 15000 });
          expect(page.url()).toContain('firefly-stage.corp.adobe.com');
        });
      },
    );
  });
});
