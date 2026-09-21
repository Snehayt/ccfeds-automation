const SAMPLE_FILE = 'assets/sample-testfile.pdf';

module.exports = {
  name: 'CC-Acrobat-MindMap',
  features: [
    {
      tcid: '0',
      name: '@CC-Acrobat-MindMap-UI',
      path: '/acrobat/online/mind-map.html?georouting=off',
      tags: '@cc @cc-acrobat @cc-acrobat-mind-map @cc-acrobat-mind-map-ui',
    },
    {
      tcid: '1',
      name: '@CC-Acrobat-MindMap-Upload',
      path: '/acrobat/online/mind-map.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-mind-map @cc-acrobat-mind-map-upload',
    },
    {
      tcid: '2',
      name: '@CC-Acrobat-MindMap-Splash',
      path: '/acrobat/online/mind-map.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-mind-map @cc-acrobat-mind-map-splash',
    },
    {
      tcid: '3',
      name: '@CC-Acrobat-MindMap-Redirect',
      path: '/acrobat/online/mind-map.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-mind-map @cc-acrobat-mind-map-redirect',
    },
  ],
};
