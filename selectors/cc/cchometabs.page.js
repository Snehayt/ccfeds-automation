export default class cchometabs {
    constructor(page) {
    this.page = page;
    // cc home page tabs UI elements in page
    this.tabsBlock = page.locator('.tabList').first();
    this.tabsList = page.locator('.tab-list-container').first();
    this.defaultSelectedTab = this.tabsList.locator('//button[@aria-selected="true" and @daa-ll="tab-l-pills-1"]');
    this.secondTabSelected = this.tabsList.locator('//button[@aria-selected="true" and @daa-ll="tab-l-pills-2"]');
    this.thirdTabSelected = this.tabsList.locator('//button[@aria-selected="true" and @daa-ll="tab-l-pills-3"]');
    this.fourthTabSelected = this.tabsList.locator('//button[@aria-selected="true" and @daa-ll="tab-l-pills-4"]');
    this.firstTab = page.locator('#tab-l-pills-1');
    this.secondTab = page.locator('#tab-l-pills-2');
    this.thirdTab = page.locator('#tab-l-pills-3');
    this.fourthTab = page.locator('#tab-l-pills-4');
    this.tabbodyContainer = page.locator('.tab-content-container').first();
    this.firstTabContainer = this.tabbodyContainer.locator('//div[@id="tab-panel-l-pills-1" and hidden="true"]');
    this.firstBodyHeading = page.locator('#create-edit-review-and-sign-pdfs');
    this.secondBodyHeading = page.locator('#best-for-brightening-shots-boosting-colors-and-organizing-photos');
    this.thirdBodyHeading = page.locator('#best-for-making-crisp-designs-at-any-size');
    this.fourthBodyHeading = page.locator('#best-for-making-videos-shine-from-social-clips-to-feature-films');
    this.firstTabContent = page.locator('#create-edit-review-and-sign-pdfs');
    this.thirdTabContent = page.locator('#best-for-making-crisp-designs-at-any-size');
  }
  };