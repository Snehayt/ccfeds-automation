const SAMPLE_FILE = 'assets/sample-testfile.pdf';

module.exports = {
  name: 'CC-Acrobat-SplitPdf',
  features: [
    {
      tcid: '0',
      name: '@CC-Acrobat-SplitPdf-UI',
      path: '/acrobat/online/split-pdf.html?georouting=off',
      tags: '@cc @cc-acrobat @cc-acrobat-split-pdf @cc-acrobat-split-pdf-ui',
    },
    {
      tcid: '1',
      name: '@CC-Acrobat-SplitPdf-Upload',
      path: '/acrobat/online/split-pdf.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-split-pdf @cc-acrobat-split-pdf-upload',
    },
    {
      tcid: '2',
      name: '@CC-Acrobat-SplitPdf-Splash',
      path: '/acrobat/online/split-pdf.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-split-pdf @cc-acrobat-split-pdf-splash',
    },
    {
      tcid: '3',
      name: '@CC-Acrobat-SplitPdf-Redirect',
      path: '/acrobat/online/split-pdf.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-split-pdf @cc-acrobat-split-pdf-redirect',
    },
  ],
};
