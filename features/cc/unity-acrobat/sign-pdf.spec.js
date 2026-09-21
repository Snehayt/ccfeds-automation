const SAMPLE_FILE = 'assets/sample-testfile.pdf';

module.exports = {
  name: 'CC-Acrobat-SignPdf',
  features: [
    {
      tcid: '0',
      name: '@CC-Acrobat-SignPdf-UI',
      path: '/acrobat/online/sign-pdf.html?georouting=off',
      tags: '@cc @cc-acrobat @cc-acrobat-sign-pdf @cc-acrobat-sign-pdf-ui',
    },
    {
      tcid: '1',
      name: '@CC-Acrobat-SignPdf-Upload',
      path: '/acrobat/online/sign-pdf.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-sign-pdf @cc-acrobat-sign-pdf-upload',
    },
    {
      tcid: '2',
      name: '@CC-Acrobat-SignPdf-Splash',
      path: '/acrobat/online/sign-pdf.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-sign-pdf @cc-acrobat-sign-pdf-splash',
    },
    {
      tcid: '3',
      name: '@CC-Acrobat-SignPdf-Redirect',
      path: '/acrobat/online/sign-pdf.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-sign-pdf @cc-acrobat-sign-pdf-redirect',
    },
  ],
};
