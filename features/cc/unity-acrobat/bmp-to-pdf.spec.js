const SAMPLE_FILE = 'assets/testbmp.bmp';

module.exports = {
  name: 'CC-Acrobat-BmpToPdf',
  features: [
    {
      tcid: '0',
      name: '@CC-Acrobat-BmpToPdf-UI',
      path: '/acrobat/online/bmp-to-pdf.html?georouting=off',
      tags: '@cc @cc-acrobat @cc-acrobat-bmp-to-pdf @cc-acrobat-bmp-to-pdf-ui',
    },
    {
      tcid: '1',
      name: '@CC-Acrobat-BmpToPdf-Upload',
      path: '/acrobat/online/bmp-to-pdf.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-bmp-to-pdf @cc-acrobat-bmp-to-pdf-upload',
    },
    {
      tcid: '2',
      name: '@CC-Acrobat-BmpToPdf-Splash',
      path: '/acrobat/online/bmp-to-pdf.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-bmp-to-pdf @cc-acrobat-bmp-to-pdf-splash',
    },
    {
      tcid: '3',
      name: '@CC-Acrobat-BmpToPdf-Redirect',
      path: '/acrobat/online/bmp-to-pdf.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-bmp-to-pdf @cc-acrobat-bmp-to-pdf-redirect',
    },
  ],
};
