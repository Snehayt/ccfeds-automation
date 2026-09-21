const SAMPLE_FILE = 'assets/sample-testfile.pdf';

module.exports = {
  name: 'CC-Acrobat-PdfToPpt',
  features: [
    {
      tcid: '0',
      name: '@CC-Acrobat-PdfToPpt-UI',
      path: '/acrobat/online/pdf-to-ppt.html?georouting=off',
      tags: '@cc @cc-acrobat @cc-acrobat-pdf-to-ppt @cc-acrobat-pdf-to-ppt-ui',
    },
    {
      tcid: '1',
      name: '@CC-Acrobat-PdfToPpt-Upload',
      path: '/acrobat/online/pdf-to-ppt.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-pdf-to-ppt @cc-acrobat-pdf-to-ppt-upload',
    },
    {
      tcid: '2',
      name: '@CC-Acrobat-PdfToPpt-Splash',
      path: '/acrobat/online/pdf-to-ppt.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-pdf-to-ppt @cc-acrobat-pdf-to-ppt-splash',
    },
    {
      tcid: '3',
      name: '@CC-Acrobat-PdfToPpt-Redirect',
      path: '/acrobat/online/pdf-to-ppt.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-pdf-to-ppt @cc-acrobat-pdf-to-ppt-redirect',
    },
  ],
};
