const SAMPLE_FILE = 'assets/sample-testfile.pdf';

module.exports = {
  name: 'CC-Acrobat-ExtractPdfPages',
  features: [
    {
      tcid: '0',
      name: '@CC-Acrobat-ExtractPdfPages-UI',
      path: '/acrobat/online/extract-pdf-pages.html?georouting=off',
      tags: '@cc @cc-acrobat @cc-acrobat-extract-pdf-pages @cc-acrobat-extract-pdf-pages-ui',
    },
    {
      tcid: '1',
      name: '@CC-Acrobat-ExtractPdfPages-Upload',
      path: '/acrobat/online/extract-pdf-pages.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-extract-pdf-pages @cc-acrobat-extract-pdf-pages-upload',
    },
    {
      tcid: '2',
      name: '@CC-Acrobat-ExtractPdfPages-Splash',
      path: '/acrobat/online/extract-pdf-pages.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-extract-pdf-pages @cc-acrobat-extract-pdf-pages-splash',
    },
    {
      tcid: '3',
      name: '@CC-Acrobat-ExtractPdfPages-Redirect',
      path: '/acrobat/online/extract-pdf-pages.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-extract-pdf-pages @cc-acrobat-extract-pdf-pages-redirect',
    },
  ],
};
