const SAMPLE_FILE = 'assets/sample-testfile.pdf';

module.exports = {
  name: 'CC-Acrobat-DeletePdfPages',
  features: [
    {
      tcid: '0',
      name: '@CC-Acrobat-DeletePdfPages-UI',
      path: '/acrobat/online/delete-pdf-pages.html?georouting=off',
      tags: '@cc @cc-acrobat @cc-acrobat-delete-pdf-pages @cc-acrobat-delete-pdf-pages-ui',
    },
    {
      tcid: '1',
      name: '@CC-Acrobat-DeletePdfPages-Upload',
      path: '/acrobat/online/delete-pdf-pages.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-delete-pdf-pages @cc-acrobat-delete-pdf-pages-upload',
    },
    {
      tcid: '2',
      name: '@CC-Acrobat-DeletePdfPages-Splash',
      path: '/acrobat/online/delete-pdf-pages.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-delete-pdf-pages @cc-acrobat-delete-pdf-pages-splash',
    },
    {
      tcid: '3',
      name: '@CC-Acrobat-DeletePdfPages-Redirect',
      path: '/acrobat/online/delete-pdf-pages.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-delete-pdf-pages @cc-acrobat-delete-pdf-pages-redirect',
    },
  ],
};
