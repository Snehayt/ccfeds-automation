const SAMPLE_FILE = 'assets/sample-testfile.pdf';

module.exports = {
  name: 'CC-Acrobat-PdfAi',
  features: [
    {
      tcid: '0',
      name: '@CC-Acrobat-PdfAi-UI',
      path: '/acrobat/online/pdf-ai.html?georouting=off',
      tags: '@cc @cc-acrobat @cc-acrobat-pdf-ai @cc-acrobat-pdf-ai-ui',
    },
    {
      tcid: '1',
      name: '@CC-Acrobat-PdfAi-Upload',
      path: '/acrobat/online/pdf-ai.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-pdf-ai @cc-acrobat-pdf-ai-upload',
    },
    {
      tcid: '2',
      name: '@CC-Acrobat-PdfAi-Splash',
      path: '/acrobat/online/pdf-ai.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-pdf-ai @cc-acrobat-pdf-ai-splash',
    },
    {
      tcid: '3',
      name: '@CC-Acrobat-PdfAi-Redirect',
      path: '/acrobat/online/pdf-ai.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-pdf-ai @cc-acrobat-pdf-ai-redirect',
    },
  ],
};
