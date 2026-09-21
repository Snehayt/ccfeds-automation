// Shared custom prompt used by the prompt-input + model-select + generate test.
const CUSTOM_PROMPT = 'A mystical ancient forest at twilight, glowing fireflies dancing among mossy stones, soft golden mist rising, cinematic lighting, ultra-detailed';

module.exports = {
  name: 'CC Doodlebug Prompt Based Image Generation',
  features: [
    {
      tcid: '0',
      name: '@cc-doodlebug-aiartgenerator-promptimagen',
      path: '/products/firefly/features/ai-art-generator.html?languageBanner=off',
      data: { prompt: CUSTOM_PROMPT },
      tags: '@cc @cc-doodlebug @cc-doodlebug-promptimagen @cc-doodlebug-aiartgenerator',
    },
    {
      tcid: '1',
      name: '@cc-doodlebug-aidrawinggenerator-promptimagen',
      path: '/products/firefly/features/ai-drawing-generator.html?languageBanner=off',
      data: { prompt: CUSTOM_PROMPT },
      tags: '@cc @cc-doodlebug @cc-doodlebug-promptimagen @cc-doodlebug-aidrawinggenerator',
    },
    {
      tcid: '2',
      name: '@cc-doodlebug-aigraphicdesigngenerator-promptimagen',
      path: '/products/firefly/features/ai-graphic-design-generator.html?languageBanner=off',
      data: { prompt: CUSTOM_PROMPT },
      tags: '@cc @cc-doodlebug @cc-doodlebug-promptimagen @cc-doodlebug-aigraphicdesigngenerator',
    },
    {
      tcid: '3',
      name: '@cc-doodlebug-aifacegenerator-promptimagen',
      path: '/products/firefly/features/ai-face-generator.html?languageBanner=off',
      hasVerbSelector: false,
      data: { prompt: CUSTOM_PROMPT },
      tags: '@cc @cc-doodlebug @cc-doodlebug-promptimagen @cc-doodlebug-aifacegenerator',
    },
    {
      tcid: '4',
      name: '@cc-doodlebug-aihumangenerator-promptimagen',
      path: '/products/firefly/features/ai-human-generator.html?languageBanner=off',
      data: { prompt: CUSTOM_PROMPT },
      tags: '@cc @cc-doodlebug @cc-doodlebug-promptimagen @cc-doodlebug-aihumangenerator',
    },
    {
      tcid: '5',
      name: '@cc-doodlebug-aianimegenerator-promptimagen',
      path: '/products/firefly/features/ai-anime-generator.html?languageBanner=off',
      data: { prompt: CUSTOM_PROMPT },
      tags: '@cc @cc-doodlebug @cc-doodlebug-promptimagen @cc-doodlebug-aianimegenerator',
    },
  ],
};
