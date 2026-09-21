const SAMPLE_FILE = 'assets/sample-testfile.pdf';

module.exports = {
  name: 'CC-Acrobat-AiChatPdf',
  features: [
    {
      tcid: '0',
      name: '@CC-Acrobat-AiChatPdf-UI',
      path: '/acrobat/online/ai-chat-pdf.html?georouting=off',
      tags: '@cc @cc-acrobat @cc-acrobat-ai-chat-pdf @cc-acrobat-ai-chat-pdf-ui',
    },
    {
      tcid: '1',
      name: '@CC-Acrobat-AiChatPdf-Upload',
      path: '/acrobat/online/ai-chat-pdf.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-ai-chat-pdf @cc-acrobat-ai-chat-pdf-upload',
    },
    {
      tcid: '2',
      name: '@CC-Acrobat-AiChatPdf-Splash',
      path: '/acrobat/online/ai-chat-pdf.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-ai-chat-pdf @cc-acrobat-ai-chat-pdf-splash',
    },
    {
      tcid: '3',
      name: '@CC-Acrobat-AiChatPdf-Redirect',
      path: '/acrobat/online/ai-chat-pdf.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-ai-chat-pdf @cc-acrobat-ai-chat-pdf-redirect',
    },
  ],
};
