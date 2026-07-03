export default class DoodlebugPromptImageGen {
  constructor(page) {
    this.page = page;

    // Marquee section — most image-gen pages use .upload-marquee; ai-face-generator uses .hero-marquee.
    this.marqueeSection = page.locator('.upload-marquee, .hero-marquee').first();

    // Widget root — the ex-unity-widget div is the specific single widget container.
    this.widgetRoot = page.locator('.ex-unity-widget');

    // Prompt textarea — empty by default; Unity no longer pre-fills on these pages.
    this.promptInput = page.locator('textarea#promptInput');

    // Media-type verb selector — replaces the old model dropdown.
    // Structure: .verbs-container > button.selected-verb + ul.verb-list > li.verb-item > a.verb-link
    this.verbContainer = page.locator('.verbs-container');
    this.verbTrigger = page.locator('button.selected-verb');
    this.verbList = page.locator('ul.verb-list');
    this.verbItems = page.locator('ul.verb-list .verb-item');

    // Generate CTA: <a class="unity-act-btn gen-btn">
    this.generateCTA = page.locator('a.unity-act-btn.gen-btn');
  }

  // Expected media-type verb options in the verb selector.
  static get expectedVerbOptions() {
    return ['image', 'video'];
  }

  // Waits for the Unity widget to finish its async boot sequence.
  // Uses networkidle because Unity injects the widget via JS after DOMContentLoaded.
  async waitForWidgetReady(timeout = 30000) {
    await this.page.waitForLoadState('networkidle', { timeout });
    await this.promptInput.waitFor({ state: 'visible', timeout: 15000 });
  }

  async getPromptValue() {
    return (await this.promptInput.inputValue()).trim();
  }

  // Hides the MEP preview overlay (always present on stage) that blocks pointer events.
  async dismissMepOverlay() {
    await this.page.evaluate(() => {
      const el = document.querySelector('div.mep-preview-overlay');
      if (!el) return;
      try { el.hidePopover(); } catch { el.style.display = 'none'; }
    });
  }

  // Opens the verb dropdown, reads all verb option labels, then closes it.
  async openVerbDropdownAndGetOptions() {
    await this.verbTrigger.click();
    await this.verbList.waitFor({ state: 'visible', timeout: 5000 });

    const options = [];
    const count = await this.verbItems.count();
    for (let i = 0; i < count; i++) {
      const text = await this.verbItems.nth(i).textContent();
      if (text) options.push(text.trim().replace(/\s+/g, ' '));
    }

    await this.page.keyboard.press('Escape');
    await this.verbList.waitFor({ state: 'hidden', timeout: 5000 });
    return options;
  }

  // Focuses and fills the prompt textarea. Call dismissMepOverlay() first on stage.
  async fillPrompt(promptText) {
    await this.promptInput.click();
    await this.promptInput.fill(promptText);
  }
}
