export default class jarvis {
    constructor(page) {
      this.page = page;
      this.jarvisFeature = page.locator('#adbmsgCta');
      this.enableExpandChat = page.locator('//button[contains(@class, "adbmsgCta outwardAnimate") and contains(@style, "display: block;")]');
      this.modalCurtain = page.locator('.modal-curtain.is-open');
    }

    // Closes any open Milo modal (e.g. the geo/promo interstitial) whose backdrop
    // otherwise intercepts pointer events and blocks the Jarvis CTA click.
    async dismissModalCurtain() {
      const isShown = await this.modalCurtain.isVisible({ timeout: 3000 }).catch(() => false);
      if (isShown) {
        await this.modalCurtain.click();
        await this.modalCurtain.waitFor({ state: 'hidden', timeout: 5000 });
      }
    }
  }