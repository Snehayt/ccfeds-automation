const IMAGE_FILE = 'assets/ballon.jpg';

module.exports = {
  name: 'CC Doodlebug Image Upload',
  features: [
    {
      tcid: '0',
      name: '@cc-doodlebug-stickergenerator-imageupload',
      path: '/products/firefly/features/sticker-generator?georouting=off',
      data: { file: IMAGE_FILE },
      tags: '@cc @cc-doodlebug @cc-imagebased-doodlebugchecks @cc-doodlebug-stickergenerator',
    },
    {
      tcid: '1',
      name: '@cc-doodlebug-backgroundgenerator-imageupload',
      path: '/products/firefly/features/background-generator?georouting=off',
      data: { file: IMAGE_FILE },
      tags: '@cc @cc-doodlebug @cc-imagebased-doodlebugchecks @cc-doodlebug-backgroundgenerator',
    },
    {
      tcid: '2',
      name: '@cc-doodlebug-headshotgenerator-imageupload',
      path: '/products/firefly/features/headshot-generator?georouting=off',
      data: { file: IMAGE_FILE },
      tags: '@cc @cc-doodlebug @cc-imagebased-doodlebugchecks @cc-doodlebug-headshotgenerator',
    },
    {
      tcid: '3',
      name: '@cc-doodlebug-imagetoimage-imageupload',
      path: '/products/firefly/features/image-to-image?georouting=off',
      data: { file: IMAGE_FILE },
      tags: '@cc @cc-doodlebug @cc-imagebased-doodlebugchecks @cc-doodlebug-imagetoimage',
    },
    {
      tcid: '4',
      name: '@cc-doodlebug-aiphotoeditor-imageupload',
      path: '/products/firefly/features/ai-photo-editor?georouting=off',
      data: { file: IMAGE_FILE },
      tags: '@cc @cc-doodlebug @cc-imagebased-doodlebugchecks @cc-doodlebug-aiphotoeditor',
    },
    {
      tcid: '5',
      name: '@cc-doodlebug-aicartoongenerator-imageupload',
      path: '/products/firefly/features/ai-cartoon-generator?georouting=off',
      data: { file: IMAGE_FILE },
      tags: '@cc @cc-doodlebug @cc-imagebased-doodlebugchecks @cc-doodlebug-aicartoongenerator',
    },
    {
      tcid: '6',
      name: '@cc-doodlebug-pixelartgenerator-imageupload',
      path: '/products/firefly/features/pixel-art-generator?georouting=off',
      data: { file: IMAGE_FILE },
      tags: '@cc @cc-doodlebug @cc-imagebased-doodlebugchecks @cc-doodlebug-pixelartgenerator',
    },
  ],
};
