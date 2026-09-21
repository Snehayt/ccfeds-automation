const SAMPLE_FILE = 'assets/testpng.png';

module.exports = {
  name: 'CC-Acrobat-PngToPdf',
  features: [
    {
      tcid: '0',
      name: '@CC-Acrobat-PngToPdf-UI',
      path: '/acrobat/online/png-to-pdf.html?georouting=off',
      tags: '@cc @cc-acrobat @cc-acrobat-png-to-pdf @cc-acrobat-png-to-pdf-ui',
    },
    {
      tcid: '1',
      name: '@CC-Acrobat-PngToPdf-Upload',
      path: '/acrobat/online/png-to-pdf.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-png-to-pdf @cc-acrobat-png-to-pdf-upload',
    },
    {
      tcid: '2',
      name: '@CC-Acrobat-PngToPdf-Splash',
      path: '/acrobat/online/png-to-pdf.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-png-to-pdf @cc-acrobat-png-to-pdf-splash',
    },
    {
      tcid: '3',
      name: '@CC-Acrobat-PngToPdf-Redirect',
      path: '/acrobat/online/png-to-pdf.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-png-to-pdf @cc-acrobat-png-to-pdf-redirect',
    },
  ],
};
