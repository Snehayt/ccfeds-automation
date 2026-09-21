const SAMPLE_FILE = 'assets/sample-testfile.pdf';

module.exports = {
  name: 'CC-Acrobat-PdfToWord',
  features: [
    {
      tcid: '0',
      name: '@CC-Acrobat-PdfToWord-UI',
      path: '/acrobat/online/pdf-to-word.html?georouting=off',
      tags: '@cc @cc-acrobat @cc-acrobat-pdf-to-word @cc-acrobat-pdf-to-word-ui',
    },
    {
      tcid: '1',
      name: '@CC-Acrobat-PdfToWord-Upload',
      path: '/acrobat/online/pdf-to-word.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-pdf-to-word @cc-acrobat-pdf-to-word-upload',
    },
    {
      tcid: '2',
      name: '@CC-Acrobat-PdfToWord-Splash',
      path: '/acrobat/online/pdf-to-word.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-pdf-to-word @cc-acrobat-pdf-to-word-splash',
    },
    {
      tcid: '3',
      name: '@CC-Acrobat-PdfToWord-Redirect',
      path: '/acrobat/online/pdf-to-word.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-pdf-to-word @cc-acrobat-pdf-to-word-redirect',
    },
  ],
};
