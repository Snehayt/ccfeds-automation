const SAMPLE_FILE = 'assets/sample-testfile.pdf';

module.exports = {
  name: 'CC-Acrobat-RotatePdf',
  features: [
    {
      tcid: '0',
      name: '@CC-Acrobat-RotatePdf-UI',
      path: '/acrobat/online/rotate-pdf.html?georouting=off',
      tags: '@cc @cc-acrobat @cc-acrobat-rotate-pdf @cc-acrobat-rotate-pdf-ui',
    },
    {
      tcid: '1',
      name: '@CC-Acrobat-RotatePdf-Upload',
      path: '/acrobat/online/rotate-pdf.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-rotate-pdf @cc-acrobat-rotate-pdf-upload',
    },
    {
      tcid: '2',
      name: '@CC-Acrobat-RotatePdf-Splash',
      path: '/acrobat/online/rotate-pdf.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-rotate-pdf @cc-acrobat-rotate-pdf-splash',
    },
    {
      tcid: '3',
      name: '@CC-Acrobat-RotatePdf-Redirect',
      path: '/acrobat/online/rotate-pdf.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-rotate-pdf @cc-acrobat-rotate-pdf-redirect',
    },
  ],
};
