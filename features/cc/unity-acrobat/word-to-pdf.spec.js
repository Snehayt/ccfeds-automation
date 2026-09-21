const SAMPLE_FILE = 'assets/testdocument.docx';

module.exports = {
  name: 'CC-Acrobat-WordToPdf',
  features: [
    {
      tcid: '0',
      name: '@CC-Acrobat-WordToPdf-UI',
      path: '/acrobat/online/word-to-pdf.html?georouting=off',
      tags: '@cc @cc-acrobat @cc-acrobat-word-to-pdf @cc-acrobat-word-to-pdf-ui',
    },
    {
      tcid: '1',
      name: '@CC-Acrobat-WordToPdf-Upload',
      path: '/acrobat/online/word-to-pdf.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-word-to-pdf @cc-acrobat-word-to-pdf-upload',
    },
    {
      tcid: '2',
      name: '@CC-Acrobat-WordToPdf-Splash',
      path: '/acrobat/online/word-to-pdf.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-word-to-pdf @cc-acrobat-word-to-pdf-splash',
    },
    {
      tcid: '3',
      name: '@CC-Acrobat-WordToPdf-Redirect',
      path: '/acrobat/online/word-to-pdf.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-word-to-pdf @cc-acrobat-word-to-pdf-redirect',
    },
  ],
};
