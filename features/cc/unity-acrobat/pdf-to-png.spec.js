const SAMPLE_FILE = 'assets/sample-testfile.pdf';

module.exports = {
  name: 'CC-Acrobat-PdfToPng',
  features: [
    {
      tcid: '0',
      name: '@CC-Acrobat-PdfToPng-UI',
      path: '/acrobat/online/pdf-to-png.html?georouting=off',
      tags: '@cc @cc-acrobat @cc-acrobat-pdf-to-png @cc-acrobat-pdf-to-png-ui',
    },
    {
      tcid: '1',
      name: '@CC-Acrobat-PdfToPng-Upload',
      path: '/acrobat/online/pdf-to-png.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-pdf-to-png @cc-acrobat-pdf-to-png-upload',
    },
    {
      tcid: '2',
      name: '@CC-Acrobat-PdfToPng-Splash',
      path: '/acrobat/online/pdf-to-png.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-pdf-to-png @cc-acrobat-pdf-to-png-splash',
    },
    {
      tcid: '3',
      name: '@CC-Acrobat-PdfToPng-Redirect',
      path: '/acrobat/online/pdf-to-png.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-pdf-to-png @cc-acrobat-pdf-to-png-redirect',
    },
  ],
};
