import { expect } from '@playwright/test';

export default class BannerPage {
  constructor(page) {
    this.page = page;

    // Banner
    this.bannerContainer = page.locator('#onetrust-banner-sdk').nth(0);
    this.bannerTitle = page.locator('#onetrust-policy-title').nth(0);
    this.bannerDescription = page.locator('.mau-content').nth(0);
    this.cookieSettingCTA = page.locator('#onetrust-pc-btn-handler').nth(0);
    this.dontEnableCTA = page.locator('#onetrust-reject-all-handler').nth(0);
    this.enableAllCTA = page.locator('#onetrust-accept-btn-handler').nth(0);

    // Modal — top level
    this.modalTitle = page.locator('#pc-title').nth(0);
    this.modalDontEnableCTA = page.locator('.disable-all-btn');
    this.modalEnableAllCTA = page.locator('.enable-all-btn');
    this.modalClose = page.locator('#close-pc-btn-handler');

    // Modal — General Info section
    this.modalSectionTitle = page.locator('.ot-general h3').nth(1);

    // Modal — FAQ dropdowns (General Info accordion), .nth(1) = active/visible instance within modal
    this.modalDropdown1 = page.locator('#onetrust-pc-sdk #ot-question-1').nth(1);
    this.modalDropdown2 = page.locator('#onetrust-pc-sdk #ot-question-2').nth(1);
    this.modalDropdown3 = page.locator('#onetrust-pc-sdk #ot-question-3').nth(1);
    this.modalDropdown1Expanded = page.locator('#onetrust-pc-sdk #ot-content-1').nth(1);
    this.modalDropdown2Expanded = page.locator('#onetrust-pc-sdk #ot-content-2').nth(1);
    this.modalDropdown3Expanded = page.locator('#onetrust-pc-sdk #ot-content-3').nth(1);

    // Modal — cookie category headers (4 categories, indices 0–3)
    this.modalOperateSiteAndMeasure = page.locator('.category-header').nth(0);
    this.modalMeasurePerformance = page.locator('.category-header').nth(1);
    this.modalExtendFunctionality = page.locator('.category-header').nth(2);
    this.modalPersonalizeAdvertising = page.locator('.category-header').nth(3);

    // Modal — category descriptions
    this.modaldesc1 = page.locator('.ot-cookie-description').nth(0);
    this.modaldesc2 = page.locator('.ot-cookie-description').nth(1);
    this.modaldesc3 = page.locator('.ot-cookie-description').nth(2);
    this.modaldesc4 = page.locator('.ot-cookie-description').nth(3);

    // Modal — Always Active label + opt-in toggles (nth(0) is hidden always-active, nth(1-3) are toggles)
    this.modalAlwaysActive = page.locator('.ot-always-active');
    this.modalCheckbox1 = page.locator('.ot-switch input[type="checkbox"]').nth(1);
    this.modalCheckbox2 = page.locator('.ot-switch input[type="checkbox"]').nth(2);
    this.modalCheckbox3 = page.locator('.ot-switch input[type="checkbox"]').nth(3);

    // Modal — Cookie Details links (one per category)
    this.modalLink1 = page.locator('.ot-link-btn.category-host-list-btn').nth(0);
    this.modalLink2 = page.locator('.ot-link-btn.category-host-list-btn').nth(1);
    this.modalLink3 = page.locator('.ot-link-btn.category-host-list-btn').nth(2);
    this.modalLink4 = page.locator('.ot-link-btn.category-host-list-btn').nth(3);
  }

  async validateBannerVisible() {
    await this.bannerContainer.waitFor({ state: 'visible', timeout: 15000 });
  }

  async validateBannerContents(expected) {
    if (expected.bannerTitle) {
      await expect(this.bannerTitle).toHaveText(expected.bannerTitle);
    }
    if (expected.bannerDescription) {
      await expect(this.bannerDescription).toHaveText(expected.bannerDescription, { useInnerText: true });
    }
    if (expected.buttons) {
      if (expected.buttons.cookieSettingCTA) {
        await expect(this.cookieSettingCTA).toHaveText(expected.buttons.cookieSettingCTA);
      }
      if (expected.buttons.dontEnableCTA) {
        await expect(this.dontEnableCTA).toHaveText(expected.buttons.dontEnableCTA);
      }
      if (expected.buttons.enableAllCTA) {
        await expect(this.enableAllCTA).toHaveText(expected.buttons.enableAllCTA);
      }
    }
  }

  async cookieSettingsModalLocalised(expected) {
    await this.cookieSettingCTA.click();
    await this.page.waitForTimeout(3000);

    if (expected.modalTitle) {
      await expect(this.modalTitle).toHaveText(expected.modalTitle);
    }
    if (expected.buttons) {
      if (expected.buttons.dontEnableCTA) {
        await expect(this.modalDontEnableCTA).toHaveText(expected.buttons.dontEnableCTA);
      }
      if (expected.buttons.enableAllCTA) {
        await expect(this.modalEnableAllCTA).toHaveText(expected.buttons.enableAllCTA);
      }
    }
    if (expected.generalInfo) {
      await expect(this.modalSectionTitle).toHaveText(expected.generalInfo);
    }
  }

  async clickCookieSettingsModal() {
    await expect(this.modalTitle).toBeVisible();
    await expect(this.modalDontEnableCTA).toBeVisible();
    await expect(this.modalEnableAllCTA).toBeVisible();
    await expect(this.modalSectionTitle).toBeVisible();

    // FAQ dropdowns in General Info section
    await expect(this.modalDropdown1).toBeVisible();
    await this.modalDropdown1.click();
    await expect(this.modalDropdown1Expanded).not.toHaveAttribute('aria-hidden', 'true', { timeout: 10000 });

    await expect(this.modalDropdown2).toBeVisible();
    await this.modalDropdown2.click();
    await expect(this.modalDropdown2Expanded).not.toHaveAttribute('aria-hidden', 'true', { timeout: 10000 });

    await expect(this.modalDropdown3).toBeVisible();
    await this.modalDropdown3.click();
    await expect(this.modalDropdown3Expanded).not.toHaveAttribute('aria-hidden', 'true', { timeout: 10000 });

    // Cookie category headers + descriptions
    await expect(this.modalOperateSiteAndMeasure).toBeVisible();
    await expect(this.modaldesc1).toBeVisible();
    await expect(this.modalMeasurePerformance).toBeVisible();
    await expect(this.modaldesc2).toBeVisible();
    await expect(this.modalExtendFunctionality).toBeVisible();
    await expect(this.modaldesc3).toBeVisible();
    await expect(this.modalPersonalizeAdvertising).toBeVisible();
    await expect(this.modaldesc4).toBeVisible();

    // Always Active label + opt-in toggles unchecked by default
    await expect(this.modalAlwaysActive).toBeVisible();
    await expect(this.modalCheckbox1).not.toBeChecked();
    await expect(this.modalCheckbox2).not.toBeChecked();
    await expect(this.modalCheckbox3).not.toBeChecked();

    // Cookie Details links (one per category)
    await expect(this.modalLink1).toBeVisible();
    await expect(this.modalLink2).toBeVisible();
    await expect(this.modalLink3).toBeVisible();
    await expect(this.modalLink4).toBeVisible();

    await this.modalClose.click();
  }
}
