const SAMPLE_FILE = 'assets/sample-testfile.pdf';

module.exports = {
  name: 'CC-Acrobat-MergePdf',
  features: [
    {
      tcid: '0',
      name: '@CC-Acrobat-MergePdf-UI',
      path: '/acrobat/online/merge-pdf.html?georouting=off',
      tags: '@cc @cc-acrobat @cc-acrobat-merge-pdf @cc-acrobat-merge-pdf-ui',
    },
    {
      tcid: '1',
      name: '@CC-Acrobat-MergePdf-Upload',
      path: '/acrobat/online/merge-pdf.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-merge-pdf @cc-acrobat-merge-pdf-upload',
    },
    {
      tcid: '2',
      name: '@CC-Acrobat-MergePdf-Splash',
      path: '/acrobat/online/merge-pdf.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-merge-pdf @cc-acrobat-merge-pdf-splash',
    },
    {
      tcid: '3',
      name: '@CC-Acrobat-MergePdf-Redirect',
      path: '/acrobat/online/merge-pdf.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-merge-pdf @cc-acrobat-merge-pdf-redirect',
    },
  ],
};
