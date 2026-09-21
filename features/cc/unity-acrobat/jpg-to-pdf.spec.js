const SAMPLE_FILE = 'assets/sample-testfile.pdf';

module.exports = {
  name: 'CC-Acrobat-JpgToPdf',
  features: [
    {
      tcid: '0',
      name: '@CC-Acrobat-JpgToPdf-UI',
      path: '/acrobat/online/jpg-to-pdf.html?georouting=off',
      tags: '@cc @cc-acrobat @cc-acrobat-jpg-to-pdf @cc-acrobat-jpg-to-pdf-ui',
    },
    {
      tcid: '1',
      name: '@CC-Acrobat-JpgToPdf-Upload',
      path: '/acrobat/online/jpg-to-pdf.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-jpg-to-pdf @cc-acrobat-jpg-to-pdf-upload',
    },
    {
      tcid: '2',
      name: '@CC-Acrobat-JpgToPdf-Splash',
      path: '/acrobat/online/jpg-to-pdf.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-jpg-to-pdf @cc-acrobat-jpg-to-pdf-splash',
    },
    {
      tcid: '3',
      name: '@CC-Acrobat-JpgToPdf-Redirect',
      path: '/acrobat/online/jpg-to-pdf.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-jpg-to-pdf @cc-acrobat-jpg-to-pdf-redirect',
    },
  ],
};
