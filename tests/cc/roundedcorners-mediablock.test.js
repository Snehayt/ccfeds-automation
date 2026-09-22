import { expect, test } from '../../utils/fixtures/test.fixture.js';
import { WebUtil } from '../../libs/webutil.js';
import { features } from '../../features/cc/roundedcorners-mediablock.spec.js';
import Mediaroundcorners from '../../selectors/cc/roundedcorners-mediablock.page.js';

let roundcorners;
let webutilities;
test.describe('verify media rounder corners features for media block and its images', () => {
  test.beforeEach(async ({ page }) => {
    roundcorners = new Mediaroundcorners(page);
    webutilities = new WebUtil(page);
  });

  // test 4x corner style for image in media block
  test(`${features[0].name},${features[0].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[0].path}`);
    await test.step('media block image with small 4x rounded corners', async () => {
      await page.goto(`${baseURL}${features[0].path}`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(`${baseURL}${features[0].path}`);
    });
    await test.step('media block image with small 4x rounded corners style', async () => {
      await page.waitForLoadState();
      await expect(roundcorners.mediaRoundedCornerImageGroup).toBeVisible();
      await expect(roundcorners.image_SmallRoundedCorners).toBeVisible();
      expect(await webutilities.verifyCSS_(roundcorners.image_SmallRoundedCorners, roundcorners.cssProperties['smallRoundedCorners'])).toBeTruthy();
    });
  });

  // test medium 8x styling corner style for image in media block
  test(`${features[1].name},${features[1].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[1].path}`);
    await test.step('media block image with medium 8x rounded corners', async () => {
      await page.goto(`${baseURL}${features[1].path}`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(`${baseURL}${features[1].path}`);
    });
    await test.step('media block image with Medium 8x rounded corners style', async () => {
      await page.waitForLoadState();
      await expect(roundcorners.mediaRoundedCornerImageGroup).toBeVisible();
      await expect(roundcorners.image_MediumRoundedCorners).toBeVisible();
      expect(await webutilities.verifyCSS_(roundcorners.image_MediumRoundedCorners, roundcorners.cssProperties['mediumRoundedCorners'])).toBeTruthy();
    });
  });

  // test large styling corner style for image in media block
  test(`${features[2].name},${features[2].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[2].path}`);
    await test.step('media block image with large 16x rounded corners', async () => {
      await page.goto(`${baseURL}${features[2].path}`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(`${baseURL}${features[2].path}`);
    });
    await test.step('media block image with large 16x rounded corners style', async () => {
      await page.waitForLoadState();
      await expect(roundcorners.mediaRoundedCornerImageGroup).toBeVisible();
      await expect(roundcorners.image_LargeRoundedCorners).toBeVisible();
      expect(await webutilities.verifyCSS_(roundcorners.image_LargeRoundedCorners, roundcorners.cssProperties['largeRoundedCorners'])).toBeTruthy();
    });
  });

  // test large styling corner style for media block
  test(`${features[3].name},${features[3].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[3].path}`);
    await test.step('media block with large 16x rounded corners', async () => {
      await page.goto(`${baseURL}${features[3].path}`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(`${baseURL}${features[3].path}`);
    });
    await test.step('media block with large 16x rounded corners style', async () => {
      await page.waitForLoadState();
      await expect(roundcorners.mediaRoundedBlockGroup).toBeVisible();
      await expect(roundcorners.firstMediaBlock).toBeVisible();
      expect(await webutilities.verifyCSS_(roundcorners.firstMediaBlock, roundcorners.cssProperties['largeRoundedCorners'])).toBeTruthy();
    });
  });

  // test medium corner style for media block and small corner style for image within block
  test(`${features[4].name},${features[4].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[4].path}`);
    await test.step('medium corner style for media block and small corner style for image within block', async () => {
      await page.goto(`${baseURL}${features[4].path}`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(`${baseURL}${features[4].path}`);
    });
    await test.step('medium corner style for media block & small corner style for image within block', async () => {
      await page.waitForLoadState();
      await expect(roundcorners.mediaRoundedBlockGroup).toBeVisible();
      await expect(roundcorners.secondMediaBlock).toBeVisible();
      expect(await webutilities.verifyCSS_(roundcorners.secondMediaBlock, roundcorners.cssProperties['mediumRoundedCorners'])).toBeTruthy();
      expect(await webutilities.verifyCSS_(roundcorners.imageWithInBlock, roundcorners.cssProperties['smallRoundedCorners'])).toBeTruthy();
    });
  });

  // test full rounded style for block
  test(`${features[5].name},${features[5].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[5].path}`);
    await test.step('complete rounded coner style for block', async () => {
      await page.goto(`${baseURL}${features[5].path}`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(`${baseURL}${features[5].path}`);
    });
    await test.step('full rounded coner style for block', async () => {
      await page.waitForLoadState();
      await expect(roundcorners.fullRoundedCornersBlock).toBeVisible();
      expect(await webutilities.verifyCSS_(roundcorners.fullRoundedcornerimage, roundcorners.cssProperties['fullRoundedCorners'])).toBeTruthy();
    });
  });
});
