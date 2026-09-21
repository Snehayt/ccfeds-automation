const SAMPLE_FILE = 'assets/sample-testfile.pdf';

module.exports = {
  name: 'CC-Acrobat-QuizMaker',
  features: [
    {
      tcid: '0',
      name: '@CC-Acrobat-QuizMaker-UI',
      path: '/acrobat/online/quiz-maker.html?georouting=off',
      tags: '@cc @cc-acrobat @cc-acrobat-quiz-maker @cc-acrobat-quiz-maker-ui',
    },
    {
      tcid: '1',
      name: '@CC-Acrobat-QuizMaker-Upload',
      path: '/acrobat/online/quiz-maker.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-quiz-maker @cc-acrobat-quiz-maker-upload',
    },
    {
      tcid: '2',
      name: '@CC-Acrobat-QuizMaker-Splash',
      path: '/acrobat/online/quiz-maker.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-quiz-maker @cc-acrobat-quiz-maker-splash',
    },
    {
      tcid: '3',
      name: '@CC-Acrobat-QuizMaker-Redirect',
      path: '/acrobat/online/quiz-maker.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-quiz-maker @cc-acrobat-quiz-maker-redirect',
    },
  ],
};
