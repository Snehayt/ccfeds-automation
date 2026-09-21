const SAMPLE_FILE = 'assets/testai.ai';

module.exports = {
  name: 'CC-Acrobat-AiToPdf',
  features: [
    {
      tcid: '0',
      name: '@CC-Acrobat-AiToPdf-UI',
      path: '/acrobat/online/ai-to-pdf.html?georouting=off',
      tags: '@cc @cc-acrobat @cc-acrobat-ai-to-pdf @cc-acrobat-ai-to-pdf-ui',
    },
    {
      tcid: '1',
      name: '@CC-Acrobat-AiToPdf-Upload',
      path: '/acrobat/online/ai-to-pdf.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-ai-to-pdf @cc-acrobat-ai-to-pdf-upload',
    },
    {
      tcid: '2',
      name: '@CC-Acrobat-AiToPdf-Splash',
      path: '/acrobat/online/ai-to-pdf.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-ai-to-pdf @cc-acrobat-ai-to-pdf-splash',
    },
    {
      tcid: '3',
      name: '@CC-Acrobat-AiToPdf-Redirect',
      path: '/acrobat/online/ai-to-pdf.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-ai-to-pdf @cc-acrobat-ai-to-pdf-redirect',
    },
  ],
};
