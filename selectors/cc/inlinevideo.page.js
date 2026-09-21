export default class inlinevideo {
    constructor(page) {
      this.page = page;
      this.inlineVideoFeature = page.locator('.video-container.video-holder').first();
      this.inlineButtonCTA = page.locator('.offset-filler').first();
      this.inlineVideo_Default_Play = this.inlineVideoFeature.locator('a.pause-play-wrapper[aria-pressed="true"]');
      this.inlineVideo_Pause = page.locator('a.pause-play-wrapper[aria-label="Play motion "][aria-pressed="false"]');
    }
  }