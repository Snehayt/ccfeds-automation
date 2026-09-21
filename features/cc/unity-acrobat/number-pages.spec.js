const SAMPLE_FILE = 'assets/sample-testfile.pdf';

module.exports = {
  name: 'CC-Acrobat-NumberPages',
  features: [
    {
      tcid: '0',
      name: '@CC-Acrobat-NumberPages-UI',
      path: '/acrobat/online/add-pdf-page-numbers.html?georouting=off',
      tags: '@cc @cc-acrobat @cc-acrobat-number-pages @cc-acrobat-number-pages-ui',
    },
    {
      tcid: '1',
      name: '@CC-Acrobat-NumberPages-Upload',
      path: '/acrobat/online/add-pdf-page-numbers.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-number-pages @cc-acrobat-number-pages-upload',
    },
    {
      tcid: '2',
      name: '@CC-Acrobat-NumberPages-Splash',
      path: '/acrobat/online/add-pdf-page-numbers.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-number-pages @cc-acrobat-number-pages-splash',
    },
    {
      tcid: '3',
      name: '@CC-Acrobat-NumberPages-Redirect',
      path: '/acrobat/online/add-pdf-page-numbers.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-number-pages @cc-acrobat-number-pages-redirect',
    },
  ],
};
