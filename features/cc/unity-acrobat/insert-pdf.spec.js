const SAMPLE_FILE = 'assets/sample-testfile.pdf';

module.exports = {
  name: 'CC-Acrobat-InsertPdf',
  features: [
    {
      tcid: '0',
      name: '@CC-Acrobat-InsertPdf-UI',
      path: '/acrobat/online/add-pages-to-pdf.html?georouting=off',
      tags: '@cc @cc-acrobat @cc-acrobat-insert-pdf @cc-acrobat-insert-pdf-ui',
    },
    {
      tcid: '1',
      name: '@CC-Acrobat-InsertPdf-Upload',
      path: '/acrobat/online/add-pages-to-pdf.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-insert-pdf @cc-acrobat-insert-pdf-upload',
    },
    {
      tcid: '2',
      name: '@CC-Acrobat-InsertPdf-Splash',
      path: '/acrobat/online/add-pages-to-pdf.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-insert-pdf @cc-acrobat-insert-pdf-splash',
    },
    {
      tcid: '3',
      name: '@CC-Acrobat-InsertPdf-Redirect',
      path: '/acrobat/online/add-pages-to-pdf.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-insert-pdf @cc-acrobat-insert-pdf-redirect',
    },
  ],
};
