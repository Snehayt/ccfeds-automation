export default class fragmentreference {
    constructor(page) {
    this.page = page;
    // cc pages have fragment references
    this.pageFragment = page.locator('.fragment').first();
    this.fragmentHeading = this.pageFragment.locator('h2#pick-a-plan-to-start-creating');
    this.fragmentSection = this.pageFragment.locator('.tablist-merch-tabs-section');
    // pricing tabs are audience segments (Individuals/Students/Business) driven by the fragment reference
    this.fragmentProduct1 = this.fragmentSection.locator('#tab-merch-tabs-1');
    this.fragmentProduct2 = this.fragmentSection.locator('#tab-merch-tabs-2');
    this.fragmentProduct3 = this.fragmentSection.locator('#tab-merch-tabs-3');
  }
  };