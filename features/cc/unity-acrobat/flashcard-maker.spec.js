const SAMPLE_FILE = 'assets/sample-testfile.pdf';

module.exports = {
  name: 'CC-Acrobat-FlashcardMaker',
  features: [
    {
      tcid: '0',
      name: '@CC-Acrobat-FlashcardMaker-UI',
      path: '/acrobat/online/flashcard-maker.html?georouting=off',
      tags: '@cc @cc-acrobat @cc-acrobat-flashcard-maker @cc-acrobat-flashcard-maker-ui',
    },
    {
      tcid: '1',
      name: '@CC-Acrobat-FlashcardMaker-Upload',
      path: '/acrobat/online/flashcard-maker.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-flashcard-maker @cc-acrobat-flashcard-maker-upload',
    },
    {
      tcid: '2',
      name: '@CC-Acrobat-FlashcardMaker-Splash',
      path: '/acrobat/online/flashcard-maker.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-flashcard-maker @cc-acrobat-flashcard-maker-splash',
    },
    {
      tcid: '3',
      name: '@CC-Acrobat-FlashcardMaker-Redirect',
      path: '/acrobat/online/flashcard-maker.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-flashcard-maker @cc-acrobat-flashcard-maker-redirect',
    },
  ],
};
