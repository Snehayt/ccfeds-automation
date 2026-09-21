const SAMPLE_FILE = 'assets/sample-testfile.pdf';

module.exports = {
  name: 'CC-Acrobat-HeicToPdf',
  features: [
    {
      tcid: '0',
      name: '@CC-Acrobat-HeicToPdf-UI',
      path: 'https://stage.acrobat.adobe.com/heic-to-pdf?georouting=off',
      tags: '@cc @cc-acrobat @cc-acrobat-heic-to-pdf @cc-acrobat-heic-to-pdf-ui',
    },
    {
      tcid: '1',
      name: '@CC-Acrobat-HeicToPdf-Upload',
      path: 'https://stage.acrobat.adobe.com/heic-to-pdf?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-heic-to-pdf @cc-acrobat-heic-to-pdf-upload',
    },
    {
      tcid: '2',
      name: '@CC-Acrobat-HeicToPdf-Splash',
      path: 'https://stage.acrobat.adobe.com/heic-to-pdf?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-heic-to-pdf @cc-acrobat-heic-to-pdf-splash',
    },
    {
      tcid: '3',
      name: '@CC-Acrobat-HeicToPdf-Redirect',
      path: 'https://stage.acrobat.adobe.com/heic-to-pdf?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-heic-to-pdf @cc-acrobat-heic-to-pdf-redirect',
    },
  ],
};
