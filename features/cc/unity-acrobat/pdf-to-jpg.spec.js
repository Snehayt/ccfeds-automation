const SAMPLE_FILE = 'assets/sample-testfile.pdf';

module.exports = {
  name: 'CC-Acrobat-PdfToJpg',
  features: [
    {
      tcid: '0',
      name: '@CC-Acrobat-PdfToJpg-UI',
      path: '/acrobat/online/pdf-to-jpg.html?georouting=off',
      tags: '@cc @cc-acrobat @cc-acrobat-pdf-to-jpg @cc-acrobat-pdf-to-jpg-ui',
    },
    {
      tcid: '1',
      name: '@CC-Acrobat-PdfToJpg-Upload',
      path: '/acrobat/online/pdf-to-jpg.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-pdf-to-jpg @cc-acrobat-pdf-to-jpg-upload',
    },
    {
      tcid: '2',
      name: '@CC-Acrobat-PdfToJpg-Splash',
      path: '/acrobat/online/pdf-to-jpg.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-pdf-to-jpg @cc-acrobat-pdf-to-jpg-splash',
    },
    {
      tcid: '3',
      name: '@CC-Acrobat-PdfToJpg-Redirect',
      path: '/acrobat/online/pdf-to-jpg.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-pdf-to-jpg @cc-acrobat-pdf-to-jpg-redirect',
    },
  ],
};
