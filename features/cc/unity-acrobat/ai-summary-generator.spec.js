const SAMPLE_FILE = 'assets/sample-testfile.pdf';

module.exports = {
  name: 'CC-Acrobat-AiSummaryGenerator',
  features: [
    {
      tcid: '0',
      name: '@CC-Acrobat-AiSummaryGenerator-UI',
      path: '/acrobat/online/ai-summary-generator.html?georouting=off',
      tags: '@cc @cc-acrobat @cc-acrobat-ai-summary-generator @cc-acrobat-ai-summary-generator-ui',
    },
    {
      tcid: '1',
      name: '@CC-Acrobat-AiSummaryGenerator-Upload',
      path: '/acrobat/online/ai-summary-generator.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-ai-summary-generator @cc-acrobat-ai-summary-generator-upload',
    },
    {
      tcid: '2',
      name: '@CC-Acrobat-AiSummaryGenerator-Splash',
      path: '/acrobat/online/ai-summary-generator.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-ai-summary-generator @cc-acrobat-ai-summary-generator-splash',
    },
    {
      tcid: '3',
      name: '@CC-Acrobat-AiSummaryGenerator-Redirect',
      path: '/acrobat/online/ai-summary-generator.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-ai-summary-generator @cc-acrobat-ai-summary-generator-redirect',
    },
  ],
};
